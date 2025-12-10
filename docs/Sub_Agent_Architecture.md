# Sub-Agent Architecture for TripKit MVP
## Multi-Agent System Design for Production

**"실무에서 검증된 LangGraph Agent 시스템 설계"**

---

## Document Information

- **Version**: 2.0.0
- **Last Updated**: 2025-12-10
- **Architecture Pattern**: Multi-Agent with LangGraph StateGraph
- **Related Documents**: [PRD](./PRD_TripKit_MVP.md), [TRD](./TRD_TripKit_MVP.md), [API](./API_Documentation.md)

---

## Agent System Overview

### Design Philosophy

**"각 에이전트는 단일 책임을 가지며, LangGraph StateGraph를 통해 워크플로우를 관리한다"**

### Architecture Pattern

TripKit은 3개의 독립적인 LangGraph Agent로 구성됩니다:

```
┌─────────────────────────────────────────────────────────────────┐
│                    TripKit Agent System                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────┐  ┌─────────────────────┐  ┌──────────────┐  │
│  │  ChatAgent    │  │ RecommendationAgent │  │  ImageAgent  │  │
│  │ (Human-in-   │  │   (5-step workflow) │  │ (3-step      │  │
│  │  the-loop)   │  │                     │  │  workflow)   │  │
│  └───────┬───────┘  └──────────┬──────────┘  └──────┬───────┘  │
│          │                     │                     │          │
│          ▼                     ▼                     ▼          │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    LangGraph StateGraph                   │  │
│  │              (MemorySaver Checkpointing)                  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Key Principles

1. **Single Responsibility**: 각 에이전트는 하나의 명확한 역할
2. **StateGraph Workflow**: LangGraph를 활용한 노드 기반 워크플로우
3. **Human-in-the-loop**: ChatAgent의 사용자 입력 대기 패턴
4. **SSE Streaming**: RecommendationAgent의 실시간 스트리밍 지원
5. **Strategy Pattern**: LLM Provider 유연한 전환 (OpenAI/Gemini)

---

## Agent Specifications

---

## 1. ChatAgent (대화 관리)

**Role**: 사용자 대화 관리 및 Vibe 추출 (Human-in-the-loop 패턴)

### Location

- **File**: `backend/src/agents/chat_agent/agent.py`
- **Nodes**: `backend/src/agents/chat_agent/nodes.py`
- **State**: `backend/src/agents/chat_agent/state.py`

### Workflow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    ChatAgent Workflow                           │
│                  (Human-in-the-loop Pattern)                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   START                                                         │
│     │                                                           │
│     ▼                                                           │
│ ┌─────────────────┐                                             │
│ │ process_message │  ← LLM 응답 생성 + 대화 단계 관리            │
│ └────────┬────────┘                                             │
│          │                                                      │
│          ▼                                                      │
│ ┌─────────────────┐                                             │
│ │  should_continue │  ← Conditional Edge (라우팅 결정)           │
│ └────────┬────────┘                                             │
│          │                                                      │
│    ┌─────┴─────┐                                                │
│    │           │                                                │
│    ▼           ▼                                                │
│ ┌──────┐  ┌──────────┐                                          │
│ │ END  │  │wait_input│  ← 사용자 입력 대기                       │
│ └──────┘  └────┬─────┘                                          │
│                │                                                │
│                ▼                                                │
│            ┌──────┐                                             │
│            │ END  │  ← 대화 종료 (is_complete=True)              │
│            └──────┘                                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### State Schema

```python
from typing import TypedDict, Literal, Annotated
from langgraph.graph import add_messages
from langchain_core.messages import BaseMessage

class ChatState(TypedDict):
    """ChatAgent 상태"""
    messages: Annotated[list[BaseMessage], add_messages]

    # 대화 단계 (10단계)
    current_step: Literal[
        "init", "mood", "aesthetic", "duration",
        "interests", "destination", "scene",
        "styling", "summary", "complete"
    ]

    # 수집된 데이터
    collected_data: dict  # TripKitProfile 구조

    # 상태 플래그
    is_complete: bool
    error: str | None
```

### Human-in-the-loop Implementation

```python
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver

def _build_graph(self):
    """Human-in-the-loop 워크플로우 구축"""

    workflow = StateGraph(ChatState)

    # 노드 추가
    workflow.add_node("process_message", process_message_node)
    workflow.add_node("wait_input", wait_for_user_input_node)

    # Entry point
    workflow.set_entry_point("process_message")

    # Conditional edges (핵심: Human-in-the-loop)
    workflow.add_conditional_edges(
        "process_message",
        should_continue,  # 라우팅 함수
        {
            "wait_input": "wait_input",  # 사용자 입력 대기
            "end": END                    # 대화 완료
        }
    )

    # wait_input → END (다음 사용자 입력 대기)
    workflow.add_edge("wait_input", END)

    # MemorySaver로 상태 영속화
    return workflow.compile(
        checkpointer=MemorySaver(),
        interrupt_before=["wait_input"]  # 사용자 입력 전 중단
    )

def should_continue(state: ChatState) -> str:
    """라우팅 결정 함수"""
    if state.get("is_complete"):
        return "end"
    return "wait_input"
```

### Session Management

```python
async def chat(
    self,
    user_message: str,
    session_id: str
) -> dict:
    """세션 기반 대화 처리"""

    config = {"configurable": {"thread_id": session_id}}

    # 기존 상태 복구 (MemorySaver)
    current_state = self.graph.get_state(config)

    if current_state.values:
        # 기존 대화 이어서 진행
        messages = current_state.values.get("messages", [])
        messages.append(HumanMessage(content=user_message))
        input_state = {"messages": messages}
    else:
        # 새 대화 시작
        input_state = self._create_initial_state(user_message)

    # 그래프 실행
    result = await self.graph.ainvoke(input_state, config)

    return {
        "reply": result["messages"][-1].content,
        "currentStep": result["current_step"],
        "isComplete": result["is_complete"],
        "collectedData": result.get("collected_data", {})
    }
```

### Conversation Flow (10단계)

```
1. init      → 인사 및 서비스 소개
2. mood      → 여행 분위기 수집 (romantic, adventurous, nostalgic, peaceful)
3. aesthetic → 미적 취향 수집 (urban, nature, vintage, modern)
4. duration  → 여행 기간 수집 (short 1-3d, medium 4-7d, long 8+d)
5. interests → 관심사 수집 (photography, food, art, history, nature)
6. destination → 관심 지역 수집
7. scene     → 꿈꾸는 여행 장면 수집
8. styling   → 스타일링 선호도 수집
9. summary   → 수집 데이터 요약 및 확인
10. complete → 대화 완료
```

---

## 2. RecommendationAgent (여행지 추천)

**Role**: Vibe 기반 여행지 추천 (5-step LangGraph workflow)

### Location

- **File**: `backend/src/agents/recommendation_agent/agent.py`
- **Nodes**: `backend/src/agents/recommendation_agent/nodes.py`
- **State**: `backend/src/agents/recommendation_agent/state.py`

### Workflow Architecture (5-step)

```
┌─────────────────────────────────────────────────────────────────┐
│               RecommendationAgent Workflow                      │
│                    (5-step Pipeline)                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  START                                                          │
│    │                                                            │
│    ▼                                                            │
│  ┌─────────────────────┐                                        │
│  │ analyze_preferences │  ← Step 1: 사용자 선호도 분석           │
│  └──────────┬──────────┘                                        │
│             │                                                   │
│             ▼                                                   │
│  ┌─────────────────────┐                                        │
│  │    build_prompt     │  ← Step 2: LLM 프롬프트 구성            │
│  └──────────┬──────────┘                                        │
│             │                                                   │
│             ▼                                                   │
│  ┌─────────────────────────┐                                    │
│  │generate_recommendations │  ← Step 3: LLM 호출 (OpenAI/Gemini)│
│  └──────────┬──────────────┘                                    │
│             │                                                   │
│             ▼                                                   │
│  ┌─────────────────────┐                                        │
│  │   parse_response    │  ← Step 4: JSON 파싱 및 검증            │
│  └──────────┬──────────┘                                        │
│             │                                                   │
│             ▼                                                   │
│  ┌─────────────────────┐                                        │
│  │ enrich_with_places  │  ← Step 5: Google Places API 보강      │
│  └──────────┬──────────┘                                        │
│             │                                                   │
│             ▼                                                   │
│           END                                                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### State Schema

```python
class RecommendationState(TypedDict):
    """RecommendationAgent 상태"""
    messages: Annotated[list[BaseMessage], add_messages]

    # 입력
    user_preferences: dict
    concept: str | None  # flaneur, filmlog, midnight
    travel_scene: str | None
    travel_destination: str | None
    image_generation_context: dict | None

    # LLM 설정 (Strategy Pattern)
    llm_provider: str  # "openai" | "gemini"
    model: str  # "gpt-4o-mini" | "gpt-4o" | "gemini-2.0-flash"

    # 중간 상태
    user_profile: dict
    system_prompt: str
    user_prompt: str
    raw_response: str

    # 출력
    destinations: list[dict]
    status: Literal["pending", "processing", "completed", "failed"]
    error: str | None
```

### Strategy Pattern (LLM Provider)

```python
# 기본 설정 (gpt-4o-mini: 5-10초, gpt-4o: 30-40초)
DEFAULT_LLM_PROVIDER = os.getenv("LLM_PROVIDER", "openai")
DEFAULT_LLM_MODEL = os.getenv("LLM_MODEL", "gpt-4o-mini")

class RecommendationAgent:
    def __init__(
        self,
        provider_type: str | None = None,
        model: str | None = None,
        checkpointer: MemorySaver | None = None
    ):
        self.provider_type = provider_type or DEFAULT_LLM_PROVIDER
        self.model = model or DEFAULT_LLM_MODEL
        self.checkpointer = checkpointer or MemorySaver()
        self.graph = self._build_graph()
```

### SSE Streaming Implementation

```python
async def recommend_stream(
    self,
    input_data: RecommendationInput,
    thread_id: str = "default"
) -> AsyncIterator[dict]:
    """2단계 SSE 스트리밍 실행

    1단계: LLM 응답 파싱 후 초기 여행지 전송
    2단계: Google Places API enrichment 후 enriched 버전 추가 전송
    """

    # Step 1-4: LLM 처리
    state = await analyze_preferences_node(state)
    state = await build_prompt_node(state)
    state = await generate_recommendations_node(state, provider_type, model)
    state = await parse_response_node(state)

    parsed_destinations = state.get("destinations", [])

    # Step 5: Places API enrichment (병렬 처리)
    enriched_destinations = await enrich_destinations_parallel(parsed_destinations)

    # SSE 스트리밍
    for i, dest in enumerate(enriched_destinations):
        yield {
            "type": "destination",
            "index": i,
            "total": len(enriched_destinations),
            "destination": dest,
            "isFallback": False,
        }

    yield {
        "type": "complete",
        "total": len(enriched_destinations),
        "userProfile": user_profile,
        "isFallback": False,
    }
```

### Fallback Strategy

```python
def get_fallback_destinations() -> list[dict]:
    """LLM 실패 시 폴백 데이터"""
    return [
        {
            "id": "fallback-kyoto",
            "name": "Philosopher's Path",
            "city": "Kyoto",
            "country": "Japan",
            "description": "A peaceful stone path...",
            "matchReason": "Perfect for contemplative walks..."
        },
        # ... 추가 폴백 여행지
    ]
```

---

## 3. ImageGenerationAgent (이미지 생성)

**Role**: Film aesthetic 이미지 생성 (3-step LangGraph workflow, Gemini Imagen)

### Location

- **File**: `backend/src/agents/image_agent/agent.py`
- **Nodes**: `backend/src/agents/image_agent/nodes.py`
- **State**: `backend/src/agents/image_agent/state.py`

### Workflow Architecture (3-step)

```
┌─────────────────────────────────────────────────────────────────┐
│               ImageGenerationAgent Workflow                     │
│                    (3-step Pipeline)                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  START                                                          │
│    │                                                            │
│    ▼                                                            │
│  ┌─────────────────────┐                                        │
│  │  extract_keywords   │  ← Step 1: Search MCP로 키워드 추출     │
│  └──────────┬──────────┘                                        │
│             │                                                   │
│             ▼                                                   │
│  ┌─────────────────────┐                                        │
│  │  optimize_prompt    │  ← Step 2: 프롬프트 최적화 (nodes.py)   │
│  └──────────┬──────────┘                                        │
│             │                                                   │
│             ▼                                                   │
│  ┌─────────────────────┐                                        │
│  │   generate_image    │  ← Step 3: Gemini Imagen 호출          │
│  └──────────┬──────────┘                                        │
│             │                                                   │
│             ▼                                                   │
│           END                                                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### State Schema

```python
class ImageGenerationState(TypedDict):
    """ImageGenerationAgent 상태"""
    messages: Annotated[list[BaseMessage], add_messages]

    # 입력
    user_prompt: str

    # 중간 상태
    extracted_keywords: list[str]
    optimized_prompt: str

    # 모델 설정
    image_model: str  # default: "imagen-3.0-generate-002"

    # 출력
    generated_image_url: str | None
    image_metadata: dict | None
    status: Literal["pending", "processing", "completed", "failed"]
    error: str | None
```

### Gemini Imagen Integration

```python
# 기본 모델: imagen-3.0-generate-002 (nano-banana)
DEFAULT_IMAGE_MODEL = "imagen-3.0-generate-002"

class ImageGenerationAgent:
    def __init__(
        self,
        search_tools: list,
        provider_type: str | None = None,
        image_model: str | None = None,
        checkpointer: MemorySaver | None = None
    ):
        self.search_tools = search_tools  # Search MCP 도구
        self.provider_type = provider_type or "gemini"
        self.image_model = image_model or DEFAULT_IMAGE_MODEL
        self.checkpointer = checkpointer or MemorySaver()
        self.graph = self._build_graph()
```

### Node Implementations

```python
# Step 1: 키워드 추출 (Search MCP 활용)
async def extract_keywords_node(state: ImageGenerationState, search_tools: list):
    """Search MCP를 사용하여 프롬프트에서 키워드 추출"""
    user_prompt = state["user_prompt"]

    # Search MCP의 extract_keywords 도구 호출
    keywords = await call_search_mcp_extract_keywords(user_prompt)

    return {"extracted_keywords": keywords}

# Step 2: 프롬프트 최적화 (nodes.py에서 직접 구현)
async def optimize_prompt_node(state: ImageGenerationState):
    """Film aesthetic을 위한 프롬프트 최적화

    Note: 이 노드는 MCP 도구가 아닌 nodes.py에서 직접 구현됨
    """
    keywords = state["extracted_keywords"]
    user_prompt = state["user_prompt"]

    # Film aesthetic 프롬프트 구성
    optimized = f"""
    Create a high-quality photograph with film aesthetic.

    Scene: {user_prompt}
    Keywords: {', '.join(keywords)}

    Style: Authentic analog film photography, Kodak Portra 400 colors,
    natural grain, soft focus, nostalgic atmosphere.
    """

    return {"optimized_prompt": optimized.strip()}

# Step 3: 이미지 생성 (Gemini Imagen)
async def generate_image_node(
    state: ImageGenerationState,
    provider_type: str,
    image_model: str
):
    """Gemini Imagen을 사용하여 이미지 생성"""
    optimized_prompt = state["optimized_prompt"]

    # Gemini Imagen API 호출
    result = await generate_with_gemini_imagen(
        prompt=optimized_prompt,
        model=image_model  # imagen-3.0-generate-002
    )

    return {
        "generated_image_url": result["url"],
        "image_metadata": result["metadata"],
        "status": "completed"
    }
```

### MCP Server Integration

```python
# Search MCP Server (port 8050)
# 제공 도구: extract_keywords

# Note: optimize_prompt는 MCP 도구가 아님!
# nodes.py에서 직접 구현됨
```

---

## Agent Communication & Workflow

### Frontend → Backend Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    Full User Journey                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [Frontend]           [Backend API]          [LangGraph Agent]  │
│                                                                 │
│  /chat page           POST /chat             ChatAgent          │
│      │                    │                      │              │
│      │  user message  ────►  ─────────────────►  │              │
│      │                    │                      │              │
│      │  ◄──── reply ──────  ◄─────────────────   │              │
│      │                    │                      │              │
│      ▼                    │                      │              │
│  /concept page        (선택만)                    │              │
│      │                    │                      │              │
│      ▼                    │                      │              │
│  /destinations page   POST /recommendations/     │              │
│      │                destinations/stream        │              │
│      │                    │              RecommendationAgent    │
│      │  ◄──── SSE ────────  ◄─────────────────►  │              │
│      │   (destinations)   │                      │              │
│      ▼                    │                      │              │
│  /tripkit page        (로컬 상태)                 │              │
│      │                    │                      │              │
│      ▼                    │                      │              │
│  /generate page       POST /generate            ImageAgent      │
│      │                    │                      │              │
│      │  ◄──── image ──────  ◄─────────────────►  │              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### State Management Comparison

| Agent | Checkpointer | State Persistence | Session Management |
|-------|--------------|-------------------|-------------------|
| ChatAgent | MemorySaver | 세션 기반 (7일 TTL) | thread_id = session_id |
| RecommendationAgent | MemorySaver | 요청 단위 | thread_id = "default" |
| ImageAgent | MemorySaver | 요청 단위 | thread_id = "default" |

---

## Project Structure

```
backend/
├── src/
│   ├── agents/
│   │   ├── __init__.py
│   │   │
│   │   ├── chat_agent/               # ChatAgent
│   │   │   ├── __init__.py
│   │   │   ├── agent.py              # ChatAgent 클래스
│   │   │   ├── nodes.py              # 노드 함수들
│   │   │   └── state.py              # ChatState 정의
│   │   │
│   │   ├── recommendation_agent/     # RecommendationAgent
│   │   │   ├── __init__.py
│   │   │   ├── agent.py              # RecommendationAgent 클래스
│   │   │   ├── nodes.py              # 5개 노드 함수들
│   │   │   └── state.py              # RecommendationState 정의
│   │   │
│   │   └── image_agent/              # ImageAgent
│   │       ├── __init__.py
│   │       ├── agent.py              # ImageGenerationAgent 클래스
│   │       ├── nodes.py              # 3개 노드 함수들
│   │       └── state.py              # ImageGenerationState 정의
│   │
│   ├── mcp_servers/
│   │   ├── __init__.py
│   │   ├── search_server.py          # Search MCP (port 8050)
│   │   └── image_server.py           # Image MCP (port 8051)
│   │
│   ├── api/
│   │   ├── __init__.py
│   │   ├── main.py                   # FastAPI 앱
│   │   └── routes/                   # API 라우트
│   │
│   └── config/
│       ├── __init__.py
│       └── settings.py               # 환경 설정
│
├── tests/
│   └── ...
│
├── requirements.txt
└── README.md
```

---

## Configuration & Environment

### Environment Variables

```bash
# LLM Provider (RecommendationAgent)
LLM_PROVIDER=openai              # openai | gemini
LLM_MODEL=gpt-4o-mini            # gpt-4o-mini | gpt-4o | gemini-2.0-flash

# Image Generation (ImageAgent)
IMAGE_PROVIDER=gemini
IMAGE_MODEL=imagen-3.0-generate-002

# Required API credentials (see .env.example)
# - OpenAI credentials
# - Google/Gemini credentials
# - Google Places credentials

# MCP Servers
SEARCH_MCP_URL=http://localhost:8050
IMAGE_MCP_URL=http://localhost:8051

# Logging
LOG_LEVEL=INFO
```

### Model Performance Comparison

| Model | Response Time | Cost | Use Case |
|-------|--------------|------|----------|
| gpt-4o-mini | 5-10s | 낮음 | 기본 추천 |
| gpt-4o | 30-40s | 높음 | 고품질 추천 |
| gemini-2.0-flash | 3-5s | 중간 | 빠른 응답 |
| imagen-3.0-generate-002 | 10-15s | 중간 | 이미지 생성 |

---

## Success Metrics

### Agent Performance KPIs

| Agent | Metric | Target |
|-------|--------|--------|
| ChatAgent | Extraction Accuracy | >85% |
| ChatAgent | Session Completion Rate | >80% |
| ChatAgent | Average Turns | 5-10 |
| RecommendationAgent | Vibe Match Score | >0.75 |
| RecommendationAgent | Response Time (SSE) | <5s |
| RecommendationAgent | Fallback Rate | <5% |
| ImageAgent | Success Rate | >90% |
| ImageAgent | Generation Time | <15s |

### System-Level Metrics

- **End-to-End Success Rate**: >85%
- **Average Journey Time**: <90s
- **SSE Streaming Latency**: <500ms per event
- **User Satisfaction**: >4.2/5

---

## References

- [LangGraph Documentation](https://langchain-ai.github.io/langgraph/)
- [LangGraph Human-in-the-loop](https://langchain-ai.github.io/langgraph/how-tos/human_in_the_loop/)
- [Google Gemini Imagen](https://cloud.google.com/vertex-ai/docs/generative-ai/image/generate-images)
- [FastAPI SSE](https://fastapi.tiangolo.com/advanced/custom-response/#streamingresponse)

---

**Document Status**: Updated to reflect actual implementation
**Last Updated**: 2025-12-10
