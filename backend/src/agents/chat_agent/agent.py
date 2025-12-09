"""Chat Agent - Human-in-the-loop 및 세션 복구 지원

LangGraph StateGraph를 사용한 대화 에이전트 구현.
주요 기능:
1. 서버 측 상태 저장 (세션 복구)
2. Human-in-the-loop 인터럽트
3. 조건부 워크플로우 분기
"""
from typing import Any

import structlog
from langchain_core.messages import HumanMessage
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.base import BaseCheckpointSaver
from langgraph.checkpoint.memory import MemorySaver

from .state import (
    ChatState,
    ChatInput,
    ChatOutput,
    create_initial_state,
)
from .nodes import (
    process_message_node,
    route_after_process,
    finalize_node,
)

logger = structlog.get_logger(__name__)


class ChatAgent:
    """Human-in-the-loop을 지원하는 Chat Agent

    LangGraph를 사용하여 대화 워크플로우를 관리합니다.
    각 사용자 입력 후 상태가 저장되어 세션 복구가 가능합니다.

    Example:
        ```python
        agent = ChatAgent()

        # 새 대화 시작
        result = await agent.chat(ChatInput(
            message="안녕하세요",
            session_id="user_123_session_1",
            user_id="user_123"
        ))

        # 대화 재개 (세션 복구)
        result = await agent.chat(ChatInput(
            message="서울이요",
            session_id="user_123_session_1",  # 동일한 세션 ID
            user_id="user_123"
        ))
        ```
    """

    def __init__(
        self,
        llm_provider: Any = None,
        checkpointer: BaseCheckpointSaver | None = None,
    ):
        """ChatAgent 초기화

        Args:
            llm_provider: LLM Provider 인스턴스 (None이면 기본 Gemini 사용)
            checkpointer: 상태 저장소 (None이면 MemorySaver 사용)
        """
        # LLM Provider 설정
        if llm_provider is None:
            from ...providers.gemini_provider import GeminiLLMProvider
            self._llm_provider = GeminiLLMProvider()
        else:
            self._llm_provider = llm_provider

        # Checkpointer 설정 (프로덕션에서는 PostgresSaver 권장)
        self._checkpointer = checkpointer or MemorySaver()

        # 그래프 빌드
        self._graph = self._build_graph()

        logger.info(
            "ChatAgent initialized",
            checkpointer_type=type(self._checkpointer).__name__,
        )

    def _build_graph(self) -> StateGraph:
        """LangGraph 워크플로우 구축

        워크플로우:
        1. process_message: 사용자 메시지 처리 및 LLM 호출
        2. (조건부) finalize: 대화 완료 처리
        3. (조건부) END: 다음 사용자 입력 대기

        Returns:
            컴파일된 StateGraph
        """
        workflow = StateGraph(ChatState)

        # LLM Provider를 캡처하는 래퍼 함수
        async def _process_message(state: ChatState) -> dict:
            return await process_message_node(state, self._llm_provider)

        # 노드 추가
        workflow.add_node("process_message", _process_message)
        workflow.add_node("finalize", finalize_node)

        # 엔트리 포인트 설정
        workflow.set_entry_point("process_message")

        # 조건부 엣지: process_message 후 라우팅
        workflow.add_conditional_edges(
            "process_message",
            route_after_process,
            {
                "finalize": "finalize",
                "wait_input": END,  # 인터럽트 - 사용자 입력 대기
            }
        )

        # finalize 후 종료
        workflow.add_edge("finalize", END)

        # 컴파일 (checkpointer로 세션 상태 저장)
        # Note: interrupt_before는 필요 시 특정 노드(예: finalize)에만 적용
        return workflow.compile(
            checkpointer=self._checkpointer,
            # interrupt_before=["finalize"],  # 완료 전 확인이 필요하면 활성화
        )

    async def chat(
        self,
        input_data: ChatInput,
        thread_id: str | None = None,
    ) -> ChatOutput:
        """대화 처리 (세션 복구 지원)

        기존 세션이 있으면 재개하고, 없으면 새로 시작합니다.

        Args:
            input_data: 사용자 입력 데이터
            thread_id: 세션 ID (없으면 input_data.session_id 사용)

        Returns:
            ChatOutput: 응답 및 상태
        """
        session_id = thread_id or input_data["session_id"]
        config = {"configurable": {"thread_id": session_id}}

        try:
            # 기존 상태 확인
            existing_state = await self._get_state(session_id)

            if existing_state and existing_state.get("messages"):
                # 기존 대화 재개
                result = await self._resume_conversation(
                    session_id,
                    input_data["message"],
                    config,
                )
            else:
                # 새 대화 시작
                result = await self._start_conversation(
                    session_id,
                    input_data,
                    config,
                )

            return self._format_output(result, session_id)

        except Exception as e:
            logger.error(
                "Chat processing error",
                session_id=session_id,
                error=str(e),
            )
            return self._create_error_output(session_id, str(e))

    async def _start_conversation(
        self,
        session_id: str,
        input_data: ChatInput,
        config: dict,
    ) -> ChatState:
        """새 대화 시작"""
        logger.info("Starting new conversation", session_id=session_id)

        initial_state = create_initial_state(
            session_id=session_id,
            user_id=input_data.get("user_id"),
        )

        # 첫 메시지 추가
        initial_state["messages"] = [HumanMessage(content=input_data["message"])]

        # 그래프 실행
        result = await self._graph.ainvoke(initial_state, config)

        logger.info(
            "New conversation started",
            session_id=session_id,
            current_step=result.get("current_step"),
        )

        return result

    async def _resume_conversation(
        self,
        session_id: str,
        message: str,
        config: dict,
    ) -> ChatState:
        """기존 대화 재개

        기존 상태를 가져와서 새 메시지를 추가한 후 그래프를 다시 실행합니다.
        """
        logger.info("Resuming conversation", session_id=session_id)

        # 기존 상태 가져오기
        existing_state = await self._get_state(session_id)
        if not existing_state:
            logger.warning("No existing state found for resume", session_id=session_id)
            return await self._start_conversation(
                session_id,
                {"message": message, "session_id": session_id},
                config,
            )

        # 기존 상태에 새 메시지 추가하여 그래프 재실행
        # messages는 add_messages reducer로 자동 병합됨
        resume_state = {
            "messages": [HumanMessage(content=message)],
            "current_step": existing_state.get("current_step", "greeting"),
            "next_step": existing_state.get("next_step", "greeting"),
            "collected_data": existing_state.get("collected_data", {}),
            "rejected_items": existing_state.get("rejected_items", {}),
            "session_id": session_id,
            "user_id": existing_state.get("user_id"),
            "is_complete": existing_state.get("is_complete", False),
            "status": "active",
        }

        result = await self._graph.ainvoke(resume_state, config)

        logger.info(
            "Conversation resumed",
            session_id=session_id,
            current_step=result.get("current_step"),
        )

        return result

    async def _get_state(self, session_id: str) -> ChatState | None:
        """저장된 상태 조회"""
        config = {"configurable": {"thread_id": session_id}}
        try:
            snapshot = await self._graph.aget_state(config)
            return snapshot.values if snapshot else None
        except Exception as e:
            logger.debug(
                "No existing state found",
                session_id=session_id,
                error=str(e),
            )
            return None

    async def get_conversation_history(
        self,
        session_id: str,
    ) -> list[dict]:
        """대화 기록 조회

        Args:
            session_id: 세션 ID

        Returns:
            대화 메시지 목록
        """
        state = await self._get_state(session_id)
        if not state:
            return []

        history = []
        for msg in state.get("messages", []):
            if isinstance(msg, HumanMessage):
                history.append({"role": "user", "content": msg.content})
            else:
                history.append({"role": "assistant", "content": msg.content})

        return history

    async def get_session_state(
        self,
        session_id: str,
    ) -> dict | None:
        """세션 상태 조회

        Args:
            session_id: 세션 ID

        Returns:
            세션 상태 (없으면 None)
        """
        state = await self._get_state(session_id)
        if not state:
            return None

        return {
            "session_id": session_id,
            "current_step": state.get("current_step"),
            "collected_data": state.get("collected_data"),
            "rejected_items": state.get("rejected_items"),
            "is_complete": state.get("is_complete", False),
            "message_count": len(state.get("messages", [])),
        }

    def _format_output(
        self,
        state: ChatState,
        session_id: str,
    ) -> ChatOutput:
        """상태를 출력 형식으로 변환"""
        return ChatOutput(
            reply=state.get("assistant_reply", ""),
            current_step=state.get("current_step", "greeting"),
            next_step=state.get("next_step", "greeting"),
            collected_data=state.get("collected_data", {}),
            rejected_items=state.get("rejected_items", {}),
            suggested_options=state.get("suggested_options", []),
            is_complete=state.get("is_complete", False),
            session_id=session_id,
        )

    def _create_error_output(
        self,
        session_id: str,
        error: str,
    ) -> ChatOutput:
        """에러 출력 생성"""
        return ChatOutput(
            reply="죄송해요, 잠시 문제가 생겼어요. 다시 시도해주세요.",
            current_step="greeting",
            next_step="greeting",
            collected_data={},
            rejected_items={},
            suggested_options=[],
            is_complete=False,
            session_id=session_id,
        )
