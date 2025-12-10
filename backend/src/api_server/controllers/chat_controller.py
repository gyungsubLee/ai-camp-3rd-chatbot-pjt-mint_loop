"""Chat endpoint with session management.

ChatAgent를 사용한 대화 처리 및 세션 관리 API.
"""
import structlog
from fastapi import APIRouter, HTTPException

from ..models import ChatRequest, ChatResponse, SessionHistoryResponse
from ...agents import ChatAgent, ChatInput, get_shared_checkpointer

router = APIRouter(tags=["chat"])
logger = structlog.get_logger(__name__)

# ChatAgent 싱글톤 인스턴스 (공유 Checkpointer 사용)
_chat_agent: ChatAgent | None = None


def get_chat_agent() -> ChatAgent:
    """ChatAgent 싱글톤 인스턴스 반환"""
    global _chat_agent
    if _chat_agent is None:
        checkpointer = get_shared_checkpointer()
        _chat_agent = ChatAgent(checkpointer=checkpointer)
        logger.info("ChatAgent initialized")
    return _chat_agent


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """대화 처리

    세션 기반 대화를 처리합니다.
    동일한 session_id로 요청하면 이전 대화를 자동으로 재개합니다.

    Args:
        request: 대화 요청
            - message: 사용자 메시지
            - sessionId: 세션 ID (필수)
            - userId: 사용자 ID (선택)

    Returns:
        ChatResponse: 대화 응답
    """
    try:
        logger.info(
            "Chat request",
            session_id=request.sessionId,
            message=request.message[:50] if request.message else "",
        )

        agent = get_chat_agent()

        # ChatInput 생성
        input_data = ChatInput(
            message=request.message,
            session_id=request.sessionId,
            user_id=request.userId,
        )

        # 대화 처리
        result = await agent.chat(input_data)

        logger.info(
            "Chat response",
            session_id=request.sessionId,
            current_step=result["current_step"],
            is_complete=result["is_complete"],
        )

        return ChatResponse(
            reply=result["reply"],
            currentStep=result["current_step"],
            nextStep=result["next_step"],
            isComplete=result["is_complete"],
            collectedData=result["collected_data"],
            rejectedItems=result["rejected_items"],
            suggestedOptions=result["suggested_options"],
            sessionId=result["session_id"],
        )

    except Exception as e:
        logger.error(
            "Chat error",
            session_id=request.sessionId,
            error=str(e),
        )
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/chat/{session_id}/history", response_model=SessionHistoryResponse)
async def get_history(session_id: str):
    """세션 대화 기록 조회

    특정 세션의 대화 기록과 상태를 조회합니다.
    브라우저 새로고침 후 대화 복구에 사용됩니다.

    Args:
        session_id: 세션 ID

    Returns:
        SessionHistoryResponse: 대화 기록 및 상태
    """
    try:
        logger.info("Get history request", session_id=session_id)

        agent = get_chat_agent()

        # 대화 기록 조회
        history = await agent.get_conversation_history(session_id)

        # 세션 상태 조회
        state = await agent.get_session_state(session_id)

        if not state:
            return SessionHistoryResponse(
                sessionId=session_id,
                history=[],
                currentStep=None,
                collectedData=None,
                isComplete=False,
            )

        return SessionHistoryResponse(
            sessionId=session_id,
            history=history,
            currentStep=state.get("current_step"),
            collectedData=state.get("collected_data"),
            isComplete=state.get("is_complete", False),
        )

    except Exception as e:
        logger.error(
            "Get history error",
            session_id=session_id,
            error=str(e),
        )
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/chat/{session_id}/state")
async def get_session_state(session_id: str):
    """세션 상태 조회

    세션의 현재 상태만 조회합니다 (대화 기록 제외).

    Args:
        session_id: 세션 ID

    Returns:
        세션 상태 정보
    """
    try:
        agent = get_chat_agent()
        state = await agent.get_session_state(session_id)

        if not state:
            raise HTTPException(
                status_code=404,
                detail=f"Session not found: {session_id}"
            )

        return state

    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            "Get state error",
            session_id=session_id,
            error=str(e),
        )
        raise HTTPException(status_code=500, detail=str(e))
