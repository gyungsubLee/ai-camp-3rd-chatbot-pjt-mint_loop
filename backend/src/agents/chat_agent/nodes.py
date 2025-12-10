"""Chat Agent 워크플로우 노드

각 노드는 ChatState를 받아 부분 상태 업데이트를 반환합니다.
"""
import json
from typing import Any

import structlog
from langchain_core.messages import AIMessage, HumanMessage

from .state import (
    ChatState,
    CollectedData,
    RejectedItems,
    DEFAULT_COLLECTED_DATA,
    DEFAULT_REJECTED_ITEMS,
)

logger = structlog.get_logger(__name__)


# =============================================================================
# 상수 정의
# =============================================================================

# 단계 전환 맵
STEP_TRANSITIONS = {
    "greeting": "city",
    "city": "spot",
    "spot": "action",
    "action": "concept",
    "concept": "outfit",
    "outfit": "pose",
    "pose": "film",
    "film": "camera",
    "camera": "complete",
    "complete": "complete",
}

# 시스템 프롬프트
CHAT_SYSTEM_PROMPT = """당신은 Trip Kit의 트래블 큐레이터입니다. 따뜻하고 감성적인 여행 전문가로서 사용자와 대화합니다.

## 정보 수집 순서
도시(city) → 장소(spotName) → 행동(mainAction) → 컨셉(conceptId) → 의상(outfitStyle) → 포즈(posePreference) → 필름(filmType) → 카메라(cameraModel)

## 컨셉 옵션
flaneur(도시 산책자), filmlog(필름 감성), midnight(밤의 낭만), pastoral(전원풍), noir(시네마틱), seaside(바다 감성)

## Step-by-Step 처리 방법
사용자 메시지를 받으면 다음 단계를 순서대로 수행하세요:

**Step 1: 메시지 분석**
- 사용자가 구체적인 정보를 제공했는가? (예: "파리", "에펠탑", "커피")
- 추천을 요청했는가? (예: "추천해줘", "아무거나", "골라줘")
- 거부 의사를 표현했는가? (예: "싫어", "별로", "다른 거")

**Step 2: 정보 추출 및 저장**
- 구체적 정보 → collectedData에 저장
- 추천 요청 → 창의적인 추천을 생성하고 collectedData에 저장
- 거부 → rejectedItems에 추가
- 여러 정보가 있으면 모두 추출 (예: "파리 에펠탑에서 커피" → city="파리", spotName="에펠탑", mainAction="커피 마시기")

**Step 3: 응답 생성**
- 사용자 선택/추천에 대해 공감하고 칭찬
- 다음 수집 대상에 대해 자연스럽게 질문
- 따뜻한 존댓말과 적절한 이모지 사용

## 추천 요청 예시
- "도시 추천해줘" → city="교토" 저장 + "일본 교토는 어떠세요? 🎋"
- "장소는 아무거나" → spotName="기온 거리" 저장 + "기온 거리 추천드려요! 🏮"
- "컨셉 골라줘" → conceptId="filmlog" 저장 + "filmlog 컨셉 추천드려요! 📷"

## JSON 응답 형식
{"reply":"따뜻한 메시지","currentStep":"현재단계","nextStep":"다음단계","isComplete":false,"collectedData":{"city":null,"spotName":null,"mainAction":null,"conceptId":null,"outfitStyle":null,"posePreference":null,"filmType":null,"cameraModel":null},"rejectedItems":{"cities":[],"spots":[],"actions":[],"concepts":[],"outfits":[],"poses":[],"films":[],"cameras":[]},"suggestedOptions":[]}

⚠️ 중요: 이미 수집된 collectedData 값은 절대 null로 덮어쓰지 마세요."""


# =============================================================================
# 노드 함수들
# =============================================================================

async def process_message_node(
    state: ChatState,
    llm_provider: Any,
) -> dict:
    """사용자 메시지 처리 및 LLM 호출

    Args:
        state: 현재 대화 상태
        llm_provider: LLM Provider 인스턴스

    Returns:
        상태 업데이트 딕셔너리
    """
    logger.info(
        "Processing message",
        session_id=state["session_id"],
        current_step=state["current_step"],
    )

    # 마지막 사용자 메시지 추출
    user_message = _get_last_user_message(state["messages"])
    if not user_message:
        return {
            "status": "failed",
            "error": "사용자 메시지를 찾을 수 없습니다",
        }

    # 프롬프트 구성
    prompt = _build_prompt(state, user_message)

    try:
        # LLM Provider의 generate 메서드 사용
        from ...providers.base import LLMGenerationParams

        params = LLMGenerationParams(
            prompt=prompt,
            system_prompt=CHAT_SYSTEM_PROMPT,
            temperature=0.7,
            response_format="json",
        )

        result = await llm_provider.generate(params)

        if not result.success:
            logger.error("LLM generation failed", error=result.error)
            return _create_error_response(state, result.error or "LLM 호출 실패")

        # 응답 파싱 및 상태 업데이트 생성
        return _parse_llm_response(state, result.content)

    except Exception as e:
        logger.error("Message processing error", error=str(e))
        return _create_error_response(state, str(e))


def route_after_process(state: ChatState) -> str:
    """처리 후 라우팅 결정

    Args:
        state: 현재 대화 상태

    Returns:
        다음 노드 이름 ("finalize" 또는 "wait_input")
    """
    if state.get("is_complete") or state.get("current_step") == "complete":
        return "finalize"
    return "wait_input"


async def finalize_node(state: ChatState) -> dict:
    """대화 완료 처리

    Args:
        state: 현재 대화 상태

    Returns:
        상태 업데이트 딕셔너리
    """
    logger.info(
        "Finalizing conversation",
        session_id=state["session_id"],
        collected_data=state["collected_data"],
    )

    return {
        "current_step": "complete",
        "next_step": "complete",
        "is_complete": True,
        "status": "completed",
    }


# =============================================================================
# 헬퍼 함수들
# =============================================================================

def _get_last_user_message(messages: list) -> str | None:
    """메시지 목록에서 마지막 사용자 메시지 추출"""
    for msg in reversed(messages):
        if isinstance(msg, HumanMessage):
            return msg.content
    return None


def _build_prompt(state: ChatState, user_message: str) -> str:
    """LLM 프롬프트 구성 (토큰 최적화 + 충분한 컨텍스트)
    """
    current_step = state["current_step"]

    # 확정된 데이터만 추출 (null 제외)
    collected = state.get("collected_data", DEFAULT_COLLECTED_DATA)
    confirmed = {k: v for k, v in collected.items() if v is not None}

    # 거부된 항목 (비어있지 않은 것만)
    rejected = state.get("rejected_items", DEFAULT_REJECTED_ITEMS)
    non_empty_rejected = {k: v for k, v in rejected.items() if v}

    # 최근 대화 컨텍스트 (최대 4개 메시지)
    recent_context = []
    for msg in state["messages"][-4:]:
        if isinstance(msg, HumanMessage):
            content = msg.content[:80] + "..." if len(msg.content) > 80 else msg.content
            recent_context.append(f"사용자: {content}")
        elif isinstance(msg, AIMessage):
            content = msg.content[:80] + "..." if len(msg.content) > 80 else msg.content
            recent_context.append(f"AI: {content}")

    # 다음 수집 대상 필드 결정
    step_to_field = {
        "greeting": "city (도시)",
        "city": "spotName (장소)",
        "spot": "mainAction (행동)",
        "action": "conceptId (컨셉)",
        "concept": "outfitStyle (의상)",
        "outfit": "posePreference (포즈)",
        "pose": "filmType (필름)",
        "film": "cameraModel (카메라)",
    }
    next_field = step_to_field.get(current_step, "")

    # 프롬프트 구성
    prompt_parts = [f"사용자 메시지: {user_message}"]

    # 확정 정보 (있을 때만)
    if confirmed:
        confirmed_str = ", ".join(f"{k}={v}" for k, v in confirmed.items())
        prompt_parts.append(f"현재까지 수집된 정보: {confirmed_str}")

    # 수집 지시
    if next_field:
        prompt_parts.append(f"다음 수집 대상: {next_field}")

    # 거부 항목 (있을 때만)
    if non_empty_rejected:
        rejected_items = []
        for category, items in non_empty_rejected.items():
            rejected_items.extend(items)
        if rejected_items:
            prompt_parts.append(f"거부된 항목 (재추천 금지): {', '.join(rejected_items)}")

    # 최근 대화 (있을 때만)
    if recent_context:
        prompt_parts.append(f"최근 대화:\n" + "\n".join(recent_context))

    return "\n\n".join(prompt_parts)


def _extract_json_from_text(content: str) -> dict | None:
    """텍스트에서 JSON 객체 추출

    LLM이 JSON을 마크다운 코드 블록으로 감싸거나
    추가 텍스트와 함께 반환할 경우를 처리합니다.
    """
    import re

    # 1. 직접 JSON 파싱 시도
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        pass

    # 2. 마크다운 코드 블록에서 JSON 추출 (```json ... ``` 또는 ``` ... ```)
    code_block_pattern = r'```(?:json)?\s*([\s\S]*?)\s*```'
    matches = re.findall(code_block_pattern, content)
    for match in matches:
        try:
            return json.loads(match.strip())
        except json.JSONDecodeError:
            continue

    # 3. 텍스트 내 JSON 객체 추출 ({ ... } 패턴)
    json_pattern = r'\{[\s\S]*\}'
    matches = re.findall(json_pattern, content)
    for match in matches:
        try:
            return json.loads(match)
        except json.JSONDecodeError:
            continue

    return None


def _sanitize_reply(reply: str) -> str:
    """응답 텍스트에서 JSON 형식 데이터 제거

    사용자에게 보여줄 응답에서 실수로 포함된 JSON을 제거합니다.
    """
    import re

    if not reply:
        return "다시 말씀해주시겠어요?"

    # JSON 객체 패턴 제거 ({ ... })
    # 중첩된 객체도 처리하기 위해 반복
    sanitized = reply
    json_pattern = r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}'

    # JSON 블록 제거
    sanitized = re.sub(json_pattern, '', sanitized)

    # 마크다운 코드 블록 제거
    sanitized = re.sub(r'```(?:json)?[\s\S]*?```', '', sanitized)

    # 연속된 공백/줄바꿈 정리
    sanitized = re.sub(r'\n{3,}', '\n\n', sanitized)
    sanitized = sanitized.strip()

    # 빈 응답이면 기본 메시지
    if not sanitized:
        return "다시 말씀해주시겠어요?"

    return sanitized


def _calculate_step_from_data(collected: dict) -> tuple[str, str, bool]:
    """수집된 데이터 기반으로 현재/다음 단계 계산

    Returns:
        (current_step, next_step, is_complete)
    """
    # 필드 → 단계 매핑 (순서대로)
    field_to_step = [
        ("city", "city"),
        ("spotName", "spot"),
        ("mainAction", "action"),
        ("conceptId", "concept"),
        ("outfitStyle", "outfit"),
        ("posePreference", "pose"),
        ("filmType", "film"),
        ("cameraModel", "camera"),
    ]

    # 마지막으로 채워진 필드 찾기
    last_filled_step = "greeting"
    for field, step in field_to_step:
        if collected.get(field) is not None:
            last_filled_step = step

    # 다음 단계 계산
    next_step = STEP_TRANSITIONS.get(last_filled_step, "complete")
    is_complete = next_step == "complete"

    return last_filled_step, next_step, is_complete


def _parse_llm_response(state: ChatState, content: str) -> dict:
    """LLM 응답 파싱 및 상태 업데이트 생성

    JSON 파싱 실패 시에도 안전하게 처리합니다.
    """
    # JSON 추출 시도
    data = _extract_json_from_text(content)

    if data is None:
        # JSON 추출 실패 시 원본 텍스트 정제하여 반환
        logger.warning("Failed to extract JSON from response")
        sanitized_content = _sanitize_reply(content)
        return {
            "assistant_reply": sanitized_content,
            "messages": [AIMessage(content=sanitized_content)],
            "status": "active",
        }

    # 수집된 데이터 머지 (기존 값 보존)
    new_collected = _merge_collected_data(
        state.get("collected_data", DEFAULT_COLLECTED_DATA),
        data.get("collectedData"),
    )

    # 수집된 데이터 기반으로 단계 자동 계산 (LLM 응답보다 우선)
    current_step, next_step, is_complete = _calculate_step_from_data(new_collected)

    # 거부 항목 머지
    new_rejected = _merge_rejected_items(
        state.get("rejected_items", DEFAULT_REJECTED_ITEMS),
        data.get("rejectedItems"),
    )

    # reply 필드에서도 JSON이 섞여있을 수 있으므로 정제
    raw_reply = data.get("reply", "")
    reply = _sanitize_reply(raw_reply) if raw_reply else "다시 말씀해주시겠어요?"

    return {
        "assistant_reply": reply,
        "current_step": current_step,
        "next_step": next_step,
        "is_complete": is_complete,
        "collected_data": new_collected,
        "rejected_items": new_rejected,
        "suggested_options": data.get("suggestedOptions", []),
        "messages": [AIMessage(content=reply)],
        "status": "completed" if is_complete else "active",
    }


def _merge_collected_data(
    existing: CollectedData | None,
    new: dict | None,
) -> CollectedData:
    """수집된 데이터 머지 (기존 값 보존)"""
    result = dict(existing) if existing else dict(DEFAULT_COLLECTED_DATA)
    if new:
        for key in result:
            if new.get(key) is not None:
                result[key] = new[key]
    return result


def _merge_rejected_items(
    existing: RejectedItems | None,
    new: dict | None,
) -> RejectedItems:
    """거부 항목 머지 (중복 제거)"""
    result = dict(existing) if existing else dict(DEFAULT_REJECTED_ITEMS)
    if new:
        for key in result:
            if key in new and new[key]:
                existing_items = result.get(key, [])
                result[key] = list(set(existing_items + new[key]))
    return result


def _create_error_response(state: ChatState, error: str) -> dict:
    """에러 응답 생성"""
    error_reply = "죄송해요, 잠시 문제가 생겼어요. 다시 말씀해주시겠어요?"
    return {
        "assistant_reply": error_reply,
        "messages": [AIMessage(content=error_reply)],
        "status": "failed",
        "error": error,
    }
