"""Chat Agent State 정의

Human-in-the-loop과 세션 복구를 지원하는 대화 상태 스키마
"""
from typing import TypedDict, Annotated, Literal, Optional
from langgraph.graph import add_messages
from langchain_core.messages import BaseMessage


# =============================================================================
# 데이터 타입 정의
# =============================================================================

class CollectedData(TypedDict, total=False):
    """대화 중 수집된 여행 정보"""
    city: Optional[str]
    spotName: Optional[str]
    mainAction: Optional[str]
    conceptId: Optional[str]
    outfitStyle: Optional[str]
    posePreference: Optional[str]
    filmType: Optional[str]
    cameraModel: Optional[str]


class RejectedItems(TypedDict, total=False):
    """사용자가 거부한 추천 항목"""
    cities: list[str]
    spots: list[str]
    actions: list[str]
    concepts: list[str]
    outfits: list[str]
    poses: list[str]
    films: list[str]
    cameras: list[str]


# =============================================================================
# 대화 단계 정의
# =============================================================================

ConversationStep = Literal[
    "greeting",      # 인사 및 시작
    "city",          # 도시 선택
    "spot",          # 장소 선택
    "action",        # 활동 선택
    "concept",       # 컨셉 선택
    "outfit",        # 의상 스타일
    "pose",          # 포즈 선택
    "film",          # 필름 타입
    "camera",        # 카메라 모델
    "complete",      # 완료
]

ChatStatus = Literal[
    "active",           # 대화 진행 중
    "waiting_input",    # 사용자 입력 대기 (인터럽트)
    "processing",       # LLM 처리 중
    "completed",        # 대화 완료
    "failed",           # 오류 발생
]


# =============================================================================
# Agent State 정의
# =============================================================================

class ChatState(TypedDict):
    """Chat Agent 상태 스키마

    LangGraph StateGraph에서 사용되는 전체 상태 정의.
    Human-in-the-loop을 위해 interrupt_before 노드에서 상태가 저장되고
    사용자 입력 후 재개됩니다.

    Attributes:
        messages: LangGraph 메시지 히스토리 (자동 누적)
        current_step: 현재 대화 단계
        collected_data: 수집된 여행 정보
        rejected_items: 거부된 추천 항목
        assistant_reply: 최신 어시스턴트 응답
        suggested_options: 사용자에게 제안할 옵션들
        requires_confirmation: 사용자 확인 필요 여부
        session_id: 세션 식별자
        user_id: 사용자 식별자 (선택)
        status: 현재 상태
        error: 오류 메시지
    """
    # LangGraph 메시지 관리 (add_messages로 자동 누적)
    messages: Annotated[list[BaseMessage], add_messages]

    # 대화 진행 상태
    current_step: ConversationStep
    next_step: ConversationStep

    # 수집된 데이터
    collected_data: CollectedData
    rejected_items: RejectedItems

    # LLM 응답
    assistant_reply: str
    suggested_options: list[str]

    # 완료 여부
    is_complete: bool

    # 세션 정보
    session_id: str
    user_id: Optional[str]

    # 상태 관리
    status: ChatStatus
    error: Optional[str]


# =============================================================================
# 입출력 스키마
# =============================================================================

class ChatInput(TypedDict):
    """Chat Agent 입력 스키마"""
    message: str
    session_id: str
    user_id: Optional[str]


class ChatOutput(TypedDict):
    """Chat Agent 출력 스키마"""
    reply: str
    current_step: ConversationStep
    next_step: ConversationStep
    collected_data: CollectedData
    rejected_items: RejectedItems
    suggested_options: list[str]
    is_complete: bool
    session_id: str


# =============================================================================
# 기본값 정의
# =============================================================================

DEFAULT_COLLECTED_DATA: CollectedData = {
    "city": None,
    "spotName": None,
    "mainAction": None,
    "conceptId": None,
    "outfitStyle": None,
    "posePreference": None,
    "filmType": None,
    "cameraModel": None,
}

DEFAULT_REJECTED_ITEMS: RejectedItems = {
    "cities": [],
    "spots": [],
    "actions": [],
    "concepts": [],
    "outfits": [],
    "poses": [],
    "films": [],
    "cameras": [],
}


def create_initial_state(session_id: str, user_id: Optional[str] = None) -> ChatState:
    """초기 상태 생성 헬퍼 함수"""
    return ChatState(
        messages=[],
        current_step="greeting",
        next_step="greeting",
        collected_data=dict(DEFAULT_COLLECTED_DATA),
        rejected_items=dict(DEFAULT_REJECTED_ITEMS),
        assistant_reply="",
        suggested_options=[],
        is_complete=False,
        session_id=session_id,
        user_id=user_id,
        status="active",
        error=None,
    )
