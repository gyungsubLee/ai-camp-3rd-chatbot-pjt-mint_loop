# Trip Kit - Technical Requirements Document (TRD)
## MVP Version 2.0

---

## 📋 Document Information

- **Document Version**: 2.0.0
- **Last Updated**: 2025-12-10
- **Project Timeline**: MVP
- **Related Documents**: [PRD_TripKit_MVP.md](./PRD_TripKit_MVP.md), [API_Documentation.md](./API_Documentation.md), [AI_Integration_Guide.md](./AI_Integration_Guide.md)
- **Author**: Engineering Team
- **Status**: Active Development

---

## 🏗️ System Architecture Overview

### High-Level Architecture (Vibe-Driven)

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Client Layer                                │
│                     (Next.js 14+ App Router)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────┐│
│  │  Vibe Chat   │  │  Concept     │  │  Destinations │  │ TripKit ││
│  │  Interface   │  │  Selector    │  │  (SSE Stream) │  │ Package ││
│  └──────────────┘  └──────────────┘  └──────────────┘  └─────────┘│
└─────────────────────────────────────────────────────────────────────┘
                            │
                            ↓ (API Routes → FastAPI)
┌─────────────────────────────────────────────────────────────────────┐
│                    Backend Layer (Python FastAPI)                    │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │                    3-Agent Architecture                        │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │ │
│  │  │  ChatAgent   │  │ Recommendation│  │  ImageAgent  │       │ │
│  │  │  (LangGraph) │  │    Agent     │  │  (LangGraph) │       │ │
│  │  │  Human-in-   │  │  (LangGraph) │  │  Gemini      │       │ │
│  │  │  the-loop    │  │  SSE Stream  │  │  Imagen      │       │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘       │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                            │                                        │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │                     MCP Servers                                │ │
│  │  ┌──────────────┐  ┌──────────────┐                          │ │
│  │  │  Search MCP  │  │  Places MCP  │                          │ │
│  │  │  Port: 8050  │  │  Port: 8052  │                          │ │
│  │  └──────────────┘  └──────────────┘                          │ │
│  └───────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────────────┐
│                     External AI Services                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │   OpenAI     │  │   Gemini     │  │ Google Maps  │              │
│  │   GPT-4o     │  │   Imagen     │  │  Places API  │              │
│  │   (Chat/Rec) │  │  (Images)    │  │              │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
└─────────────────────────────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────────────┐
│              Storage Layer (MVP: Session-Based Vibe)                 │
│  ┌──────────────┐  ┌──────────────┐                                │
│  │   Browser    │  │  MemorySaver │                                │
│  │  Vibe State  │  │  (LangGraph) │                                │
│  │  (Zustand)   │  │              │                                │
│  └──────────────┘  └──────────────┘                                │
└─────────────────────────────────────────────────────────────────────┘
```

### Architecture Principles

1. **Vibe-First Design**: All recommendations flow from extracted user vibe (mood + aesthetic + interests)
2. **3-Agent Architecture**: ChatAgent, RecommendationAgent, ImageAgent - each with specialized LangGraph workflow
3. **Strategy Pattern**: Provider abstraction for OpenAI/Gemini with dynamic selection
4. **SSE Streaming**: Real-time destination delivery for progressive UI updates
5. **Human-in-the-loop**: ChatAgent interrupts for user input at each conversation step
6. **MCP Integration**: Search MCP for keyword extraction, Places MCP for location enrichment

---

## 🛠️ Technology Stack

### Frontend (`front/`)

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 14.2+ | React framework, App Router |
| **React** | 18+ | UI component library |
| **TypeScript** | 5.0+ | Type safety |
| **Tailwind CSS** | 3.4+ | Styling framework |
| **Zustand** | 4.5+ | State management (persist middleware) |
| **React Query** | 5.0+ | Data fetching & caching |
| **Framer Motion** | 11.0+ | Animations |

### Backend (`backend/`)

| Technology | Version | Purpose |
|------------|---------|---------|
| **Python** | 3.12+ | Runtime |
| **FastAPI** | 0.115+ | Web framework |
| **LangGraph** | 0.6.4+ | Agent workflow orchestration |
| **LangChain** | 0.3.27+ | AI framework |
| **FastMCP** | 2.11+ | MCP server framework |
| **langchain-mcp-adapters** | 0.1.9+ | MCP integration |
| **Google Generative AI** | 0.8+ | Gemini Imagen integration |
| **OpenAI SDK** | 1.0+ | GPT-4 integration |
| **structlog** | 25.4+ | Structured logging |
| **Pydantic** | 2.0+ | Data validation |

### Infrastructure & DevOps

| Technology | Purpose |
|------------|---------|
| **Vercel** | Frontend hosting, CI/CD |
| **Docker** | Backend containerization |
| **Git/GitHub** | Version control |
| **ESLint/Prettier** | Code quality (Frontend) |
| **Ruff/Black** | Code quality (Backend) |
| **Pytest** | Backend testing |

### External Services

| Service | Purpose | Model |
|---------|---------|-------|
| **OpenAI** | Chat, Recommendations | gpt-4o-mini (default) |
| **Google Gemini** | Image Generation | imagen-3.0-generate-002 |
| **Google Maps** | Location enrichment | Places API |
| **Tavily** | Search (via MCP) | - |

---

## 📐 System Design

### 1. ChatAgent - Vibe Extraction Engine

**Purpose**: Extract user's travel "vibe" through natural conversation using Human-in-the-loop pattern.

#### State Definition (Python)

```python
class ChatState(TypedDict):
    """ChatAgent 상태 정의"""
    messages: Annotated[list[BaseMessage], add_messages]
    session_id: str
    user_id: str | None
    current_step: ConversationStep
    next_step: ConversationStep
    collected_data: CollectedData
    rejected_items: RejectedItems
    suggested_options: list[str]
    assistant_reply: str
    is_complete: bool
    status: Literal["active", "completed", "error"]

class CollectedData(TypedDict, total=False):
    """수집된 사용자 선호도"""
    travel_destination: str    # 여행 지역
    travel_scene: str          # 꿈꾸는 여행 장면
    travel_companion: str      # 동행자
    travel_duration: str       # 여행 기간
    travel_budget: str         # 예산
    travel_style: str          # 여행 스타일
    special_requests: str      # 특별 요청
```

#### LangGraph Workflow

```
[START]
  ↓
[process_message] → LLM으로 사용자 메시지 처리
  ↓
[route_after_process] → 조건부 분기
  ↓
  ├── is_complete=True → [finalize] → END
  │
  └── is_complete=False → END (wait_input)
                          ↑
                          │ Human-in-the-loop
                          │ (사용자 입력 대기)
                          ↓
                     [Resume with new message]
```

#### Conversation Steps

```python
ConversationStep = Literal[
    "greeting",           # 인사 및 시작
    "travel_destination", # 여행 지역
    "travel_scene",       # 꿈꾸는 장면
    "travel_companion",   # 동행자
    "travel_duration",    # 기간
    "travel_budget",      # 예산
    "travel_style",       # 스타일
    "special_requests",   # 특별 요청
    "confirmation",       # 확인
    "complete"           # 완료
]
```

#### Agent Implementation

```python
class ChatAgent:
    """Human-in-the-loop을 지원하는 Chat Agent"""

    def __init__(
        self,
        llm_provider: Any = None,
        checkpointer: BaseCheckpointSaver | None = None,
    ):
        # LLM Provider 설정 (기본: Gemini)
        if llm_provider is None:
            from ...providers.gemini_provider import GeminiLLMProvider
            self._llm_provider = GeminiLLMProvider()
        else:
            self._llm_provider = llm_provider

        # Checkpointer 설정 (세션 상태 저장)
        self._checkpointer = checkpointer or MemorySaver()

        # 그래프 빌드
        self._graph = self._build_graph()

    async def chat(
        self,
        input_data: ChatInput,
        thread_id: str | None = None,
    ) -> ChatOutput:
        """대화 처리 (세션 복구 지원)"""
        session_id = thread_id or input_data["session_id"]
        config = {"configurable": {"thread_id": session_id}}

        # 기존 상태 확인
        existing_state = await self._get_state(session_id)

        if existing_state and existing_state.get("messages"):
            # 기존 대화 재개
            result = await self._resume_conversation(...)
        else:
            # 새 대화 시작
            result = await self._start_conversation(...)

        return self._format_output(result, session_id)
```

---

### 2. RecommendationAgent - Destination Matching

**Purpose**: Generate vibe-matched destination recommendations with SSE streaming.

#### State Definition (Python)

```python
class RecommendationState(TypedDict):
    """RecommendationAgent 상태"""
    messages: Annotated[list[BaseMessage], add_messages]
    user_preferences: dict
    concept: str | None
    travel_scene: str | None
    travel_destination: str | None
    image_generation_context: dict | None
    llm_provider: str
    model: str
    user_profile: dict
    system_prompt: str
    user_prompt: str
    raw_response: str
    destinations: list[dict]
    status: Literal["pending", "processing", "completed", "failed"]
    error: str | None
```

#### LangGraph Workflow

```
[START]
  ↓
[analyze_preferences] → 사용자 선호도 분석 및 프로필 생성
  ↓
[build_prompt] → LLM 프롬프트 구성
  ↓
[generate_recommendations] → OpenAI/Gemini로 추천 생성
  ↓
[parse_response] → JSON 파싱 및 검증
  ↓
[enrich_with_places] → Google Places API 정보 보강
  ↓
[END]
```

#### SSE Streaming Implementation

```python
async def recommend_stream(
    self,
    input_data: RecommendationInput,
    thread_id: str = "default",
) -> AsyncIterator[dict]:
    """2단계 SSE 스트리밍

    1단계: LLM 응답 파싱 후 초기 여행지 전송
    2단계: Google Places enrichment 후 상세 정보 추가
    """
    # === 1단계: LLM 응답까지 실행 ===
    state = await analyze_preferences_node(state)
    state = await build_prompt_node(state)
    state = await generate_recommendations_node(state, ...)
    state = await parse_response_node(state)

    # === 2단계: Places API enrichment (병렬 처리) ===
    enriched_destinations = await enrich_destinations_parallel(
        state.get("destinations", [])
    )

    # === SSE 스트리밍 ===
    for i, dest in enumerate(enriched_destinations):
        yield {
            "type": "destination",
            "index": i,
            "total": len(enriched_destinations),
            "destination": dest,
        }

    yield {
        "type": "complete",
        "total": len(enriched_destinations),
    }
```

#### Destination Structure

```python
class Destination(TypedDict):
    """여행지 정보"""
    id: str
    name: str
    city: str
    country: str
    description: str
    matchReason: str
    bestTimeToVisit: str
    photographyScore: int  # 1-10
    transportAccessibility: str  # easy | moderate | challenging
    safetyRating: int  # 1-10
    placeDetails: PlaceDetails | None  # Google Places API

class PlaceDetails(TypedDict):
    """Google Places API 정보"""
    formatted_address: str | None
    geometry: dict | None
    photos: list[str]
    rating: float | None
    user_ratings_total: int | None
    opening_hours: dict | None
    website: str | None
    price_level: int | None
```

---

### 3. ImageAgent - Film Aesthetic Generation

**Purpose**: Generate film-aesthetic preview images using Gemini Imagen.

#### State Definition (Python)

```python
class ImageGenerationState(TypedDict):
    """ImageAgent 상태"""
    messages: Annotated[list[BaseMessage], add_messages]
    user_prompt: str
    extracted_keywords: list[str]
    optimized_prompt: str
    generated_image_url: str | None
    image_metadata: dict | None
    image_model: str
    status: Literal["pending", "extracting", "generating", "completed", "failed"]
    error: str | None
```

#### LangGraph Workflow

```
[START]
  ↓
[extract_keywords] → Search MCP로 키워드 추출
  ↓
[optimize_prompt] → 이미지 생성용 프롬프트 최적화
  ↓
[generate_image] → Gemini Imagen으로 이미지 생성
  ↓
[END]
```

#### Gemini Imagen Integration

```python
# 기본 모델
DEFAULT_IMAGE_MODEL = "imagen-3.0-generate-002"

async def generate_image_node(
    state: ImageGenerationState,
    provider_type: str | None = None,
    image_model: str | None = None
) -> ImageGenerationState:
    """이미지 생성 노드"""
    actual_model = image_model or state.get("image_model") or DEFAULT_IMAGE_MODEL

    # Provider 가져오기 (Strategy Pattern)
    provider = get_provider(provider_type or "gemini", model=actual_model)

    # 이미지 생성 파라미터
    params = ImageGenerationParams(
        prompt=state["optimized_prompt"],
        size="1024x1024",
        quality="standard",
        style="vivid"
    )

    # 이미지 생성 실행
    result = await provider.generate(params)

    return {
        **state,
        "generated_image_url": result.url,
        "image_metadata": {
            "provider": result.provider,
            "model": actual_model,
            "revised_prompt": result.revised_prompt,
        },
        "status": "completed"
    }
```

---

### 4. Provider Strategy Pattern

**Purpose**: Abstract LLM/Image providers for flexible switching.

#### Provider Interface

```python
class LLMProvider(ABC):
    """LLM Provider 추상 인터페이스"""

    @property
    @abstractmethod
    def provider_name(self) -> str:
        """프로바이더 이름"""
        pass

    @abstractmethod
    async def chat(self, params: ChatParams) -> ChatResult:
        """채팅 완료"""
        pass

class ImageProvider(ABC):
    """Image Provider 추상 인터페이스"""

    @property
    @abstractmethod
    def provider_name(self) -> str:
        """프로바이더 이름"""
        pass

    @abstractmethod
    async def generate(self, params: ImageGenerationParams) -> ImageGenerationResult:
        """이미지 생성"""
        pass
```

#### Provider Factory

```python
def get_provider(
    provider_type: str | None = None,
    **kwargs
) -> LLMProvider | ImageProvider:
    """Provider 팩토리 함수

    Args:
        provider_type: "openai" | "gemini"
        **kwargs: 프로바이더별 추가 설정

    Returns:
        적절한 Provider 인스턴스
    """
    provider_type = provider_type or os.getenv("LLM_PROVIDER", "openai")

    if provider_type == "openai":
        return OpenAIProvider(**kwargs)
    elif provider_type == "gemini":
        return GeminiProvider(**kwargs)
    else:
        raise ValueError(f"Unknown provider: {provider_type}")
```

#### Available Providers

| Provider | Type | Models | Purpose |
|----------|------|--------|---------|
| OpenAI | LLM | gpt-4o, gpt-4o-mini | Chat, Recommendations |
| Gemini | LLM | gemini-2.5-flash | Chat (alternative) |
| Gemini | Image | imagen-3.0-generate-002 | Film aesthetic images |

---

## 🔌 API Specification

### Base URLs

```
Frontend Dev: http://localhost:3000
Frontend Prod: https://tripkit.vercel.app

Backend Dev: http://localhost:8000
Backend Prod: https://api.tripkit.app
```

### Authentication

**MVP**: No authentication required (public endpoints)
**Future**: JWT-based authentication with Supabase Auth

---

### Endpoints

#### 1. **POST /chat**

**Purpose**: Process conversation and advance chatbot state (session-based)

**Request**:
```json
{
  "message": "서울에서 낭만적인 여행을 하고 싶어요",
  "session_id": "session_abc123",
  "user_id": "user_optional_id"
}
```

**Response**:
```json
{
  "reply": "서울에서 낭만적인 여행을 계획하시는군요! 어떤 장면을 꿈꾸고 계세요?",
  "currentStep": "travel_destination",
  "nextStep": "travel_scene",
  "isComplete": false,
  "collectedData": {
    "travel_destination": "서울"
  },
  "rejectedItems": {},
  "suggestedOptions": ["카페에서 책 읽기", "야경 감상", "골목길 산책"]
}
```

#### 2. **GET /chat/history/{session_id}**

**Purpose**: Retrieve conversation history

**Response**:
```json
{
  "history": [
    {"role": "user", "content": "안녕하세요"},
    {"role": "assistant", "content": "안녕하세요! 어떤 여행을 꿈꾸시나요?"}
  ],
  "sessionId": "session_abc123"
}
```

#### 3. **POST /recommendations/destinations/stream**

**Purpose**: SSE streaming destination recommendations

**Request**:
```json
{
  "preferences": {
    "mood": "romantic",
    "aesthetic": "vintage"
  },
  "concept": "filmlog",
  "travelScene": "카페에서 책 읽기",
  "travelDestination": "유럽",
  "imageGenerationContext": {
    "filmType": "Kodak Portra 400",
    "cameraModel": "Leica M6"
  }
}
```

**SSE Response**:
```
data: {"type":"destination","index":0,"total":3,"destination":{...}}

data: {"type":"destination","index":1,"total":3,"destination":{...}}

data: {"type":"destination","index":2,"total":3,"destination":{...}}

data: {"type":"complete","total":3,"userProfile":{...}}
```

#### 4. **POST /generate/image**

**Purpose**: Generate film-aesthetic preview image with Gemini Imagen

**Request**:
```json
{
  "prompt": "A cozy Parisian cafe with vintage film aesthetic",
  "concept": "filmlog",
  "filmStock": "kodak_portra_400",
  "style": "cinematic"
}
```

**Response**:
```json
{
  "imageUrl": "https://storage.googleapis.com/...",
  "optimizedPrompt": "A cozy Parisian cafe, warm Kodak Portra 400 tones...",
  "extractedKeywords": ["cafe", "paris", "vintage", "cozy"],
  "metadata": {
    "provider": "gemini",
    "model": "imagen-3.0-generate-002",
    "generationTime": 3500
  },
  "status": "completed"
}
```

---

## 💾 Data Models

### Frontend Types (TypeScript)

```typescript
// Core Entities
interface UserPreferences {
  mood: 'romantic' | 'adventurous' | 'nostalgic' | 'peaceful';
  aesthetic: 'urban' | 'nature' | 'vintage' | 'modern';
  duration: 'short' | 'medium' | 'long';
  interests: Interest[];
  concept?: Concept;
}

interface Destination {
  id: string;
  name: string;
  city: string;
  country: string;
  description: string;
  matchReason: string;
  bestTimeToVisit: string;
  photographyScore: number;
  transportAccessibility: 'easy' | 'moderate' | 'challenging';
  safetyRating: number;
  placeDetails?: PlaceDetails;
}

interface ChatResponse {
  reply: string;
  currentStep: ConversationStep;
  nextStep: ConversationStep;
  isComplete: boolean;
  collectedData: CollectedData;
  rejectedItems: RejectedItems;
  suggestedOptions: string[];
}

// Supporting Types
type Interest = 'photography' | 'food' | 'art' | 'history' | 'nature' | 'architecture';
type Concept = 'flaneur' | 'filmlog' | 'midnight';
type ConversationStep =
  | 'greeting' | 'travel_destination' | 'travel_scene'
  | 'travel_companion' | 'travel_duration' | 'travel_budget'
  | 'travel_style' | 'special_requests' | 'confirmation' | 'complete';
```

### Backend Models (Pydantic)

```python
# Request Models
class ChatRequest(BaseModel):
    message: str
    session_id: str
    user_id: str | None = None

class RecommendationRequest(BaseModel):
    preferences: dict[str, Any] = {}
    concept: str | None = None
    travel_scene: str | None = None
    travel_destination: str | None = None
    image_generation_context: dict[str, Any] | None = None

class ImageGenerationRequest(BaseModel):
    prompt: str
    concept: str | None = None
    film_stock: str | None = None
    style: str = "vivid"

# Response Models
class ChatResponse(BaseModel):
    reply: str
    currentStep: str
    nextStep: str
    isComplete: bool
    collectedData: dict[str, Any]
    rejectedItems: dict[str, Any]
    suggestedOptions: list[str]
    sessionId: str

class ImageGenerationResponse(BaseModel):
    imageUrl: str | None
    optimizedPrompt: str
    extractedKeywords: list[str]
    metadata: dict[str, Any]
    status: str
    error: str | None = None
```

---

## 🔐 Security Considerations

### API Security

1. **Rate Limiting**:
   - 100 requests/hour per IP for chat endpoints
   - 20 image generations/hour per IP
   - SSE streams: 10 concurrent connections per IP

2. **Input Validation**:
   - Pydantic models for all request validation
   - Sanitize user inputs before LLM calls
   - Prevent prompt injection attacks

3. **API Key Protection**:
   - Store all keys in environment variables
   - Never expose keys in client-side code
   - Use separate keys for development/production

4. **CORS**:
   - Restrict to production domain only
   - Development: Allow localhost:3000

### Environment Variables

모든 환경 변수 설정은 프로젝트 루트의 `.env.sample` 파일을 참조하세요.

주요 설정 항목:
- `LLM_PROVIDER`: LLM 프로바이더 선택 (openai/gemini)
- `LLM_MODEL`: 사용할 LLM 모델
- `IMAGE_PROVIDER`: 이미지 생성 프로바이더
- `GEMINI_IMAGE_MODEL`: Gemini Imagen 모델
- `SEARCH_MCP_PORT`: Search MCP 서버 포트
- `PLACES_MCP_PORT`: Places MCP 서버 포트

---

## 🚀 Performance Optimization

### Performance Targets

| Metric | Target | Critical? |
|--------|--------|-----------|
| Chat API Response | <3s | Yes |
| SSE First Destination | <5s | Yes |
| SSE Complete (3 destinations) | <10s | Yes |
| Image Generation | <15s | No (nice-to-have) |
| Page Load Time | <3s | Yes |

### Optimization Strategies

#### 1. SSE Streaming for Progressive UI

```python
# Backend: 2-phase streaming
async def recommend_stream(...) -> AsyncIterator[dict]:
    # Phase 1: LLM response (3-5s)
    destinations = await generate_recommendations(...)

    # Phase 2: Places enrichment (parallel, 2-3s)
    enriched = await enrich_destinations_parallel(destinations)

    # Stream each destination
    for dest in enriched:
        yield {"type": "destination", "destination": dest}
```

```typescript
// Frontend: Progressive rendering
const loadDestinationsStream = async () => {
  const response = await fetch("/api/recommendations/destinations/stream", {
    method: "POST",
    body: JSON.stringify({ preferences, concept }),
  });

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const lines = decoder.decode(value).split("\n");
    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const event = JSON.parse(line.slice(6));
        if (event.type === "destination") {
          addDestination(event.destination);  // 실시간 UI 업데이트
        }
      }
    }
  }
};
```

#### 2. Parallel Places API Enrichment

```python
async def enrich_destinations_parallel(
    destinations: list[dict]
) -> list[dict]:
    """여러 여행지를 병렬로 enrichment"""
    tasks = [
        enrich_single_destination(dest)
        for dest in destinations
    ]
    return await asyncio.gather(*tasks)
```

#### 3. Client-Side Caching

```typescript
// Zustand with persist middleware
const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      sessionId: '',
      messages: [],
      collectedData: {},
      // ... actions
    }),
    {
      name: 'tripkit-chat-storage',
      partialize: (state) => ({
        sessionId: state.sessionId,
        collectedData: state.collectedData,
      }),
    }
  )
);
```

#### 4. Session Recovery

```python
# Backend: MemorySaver for session state
class ChatAgent:
    def __init__(self, checkpointer=None):
        self._checkpointer = checkpointer or MemorySaver()

    async def _get_state(self, session_id: str) -> ChatState | None:
        """저장된 상태 조회"""
        config = {"configurable": {"thread_id": session_id}}
        snapshot = await self._graph.aget_state(config)
        return snapshot.values if snapshot else None
```

---

## 🧪 Testing Strategy

### Testing Pyramid

```
        ┌────────────┐
        │    E2E     │  10% - Critical user flows
        │   Tests    │  (Playwright)
        └────────────┘
       ┌──────────────┐
       │ Integration  │  30% - API endpoints, agents
       │    Tests     │  (Pytest + httpx)
       └──────────────┘
      ┌────────────────┐
      │  Unit Tests    │  60% - Nodes, utilities
      └────────────────┘  (Pytest + Jest)
```

### Backend Tests (Pytest)

```python
# tests/test_chat_agent.py
import pytest
from src.agents.chat_agent import ChatAgent

@pytest.fixture
def chat_agent():
    return ChatAgent()

@pytest.mark.asyncio
async def test_new_conversation(chat_agent):
    """새 대화 시작 테스트"""
    result = await chat_agent.chat({
        "message": "안녕하세요",
        "session_id": "test_session_1"
    })

    assert result["reply"]
    assert result["currentStep"] == "greeting"
    assert result["isComplete"] is False

@pytest.mark.asyncio
async def test_session_recovery(chat_agent):
    """세션 복구 테스트"""
    # 첫 번째 메시지
    await chat_agent.chat({
        "message": "서울에서 여행하고 싶어요",
        "session_id": "test_session_2"
    })

    # 두 번째 메시지 (세션 재개)
    result = await chat_agent.chat({
        "message": "카페에서 책 읽기",
        "session_id": "test_session_2"  # 동일한 세션 ID
    })

    assert "travel_destination" in result["collectedData"]
```

### Frontend Tests (Jest)

```typescript
// tests/components/ChatContainer.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatContainer from '@/components/chat/ChatContainer';

describe('ChatContainer', () => {
  it('should send message and display AI response', async () => {
    render(<ChatContainer />);

    const input = screen.getByPlaceholderText('메시지를 입력하세요');
    await userEvent.type(input, '서울에서 여행하고 싶어요');
    await userEvent.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => {
      expect(screen.getByText(/어떤 장면을 꿈꾸/)).toBeInTheDocument();
    });
  });
});
```

---

## 📦 Deployment

### Docker Deployment (Backend)

```dockerfile
# backend/Dockerfile
FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY src/ ./src/

EXPOSE 8000

CMD ["uvicorn", "src.api_server.server:app", "--host", "0.0.0.0", "--port", "8000"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    env_file:
      - .env
    restart: unless-stopped

  search-mcp:
    build: ./backend
    command: python -m src.mcp_servers.search_server
    ports:
      - "8050:8050"
    env_file:
      - .env

  places-mcp:
    build: ./backend
    command: python -m src.mcp_servers.places_server
    ports:
      - "8052:8052"
    env_file:
      - .env
```

### Vercel Deployment (Frontend)

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "env": {
    "BACKEND_URL": "@backend-url",
    "AGENT_API_URL": "@agent-api-url"
  }
}
```

---

## 📊 Monitoring & Observability

### Structured Logging (Backend)

```python
import structlog

logger = structlog.get_logger(__name__)

# Agent 로깅
logger.info(
    "Starting recommendation generation",
    concept=input_data.get("concept"),
    destination=input_data.get("travel_destination"),
    provider=actual_provider,
    model=actual_model
)

# 에러 로깅
logger.error(
    "Chat processing error",
    session_id=session_id,
    error=str(e),
)
```

### Frontend Analytics

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions

CI/CD 파이프라인은 GitHub Actions를 사용하여 구성합니다.

**주요 워크플로우**:

1. **테스트 (Frontend)**:
   - Node.js 20 설정
   - npm ci, lint, type-check, test 실행

2. **테스트 (Backend)**:
   - Python 3.12 설정
   - pytest 실행

3. **배포 (Frontend)**:
   - Vercel Action을 사용하여 자동 배포
   - main 브랜치 push 시 프로덕션 배포

4. **환경 변수**:
   - GitHub Repository Settings에서 환경 변수 설정
   - Vercel 통합을 통한 자동 환경 변수 주입

---

## 📚 External Dependencies

### Required Services

| Service | Purpose | Pricing |
|---------|---------|---------|
| **OpenAI GPT-4o-mini** | Chat, Recommendations | ~$0.15/1M input tokens |
| **Google Gemini Imagen** | Image generation | Usage-based |
| **Google Maps Places** | Location enrichment | $17/1K requests |
| **Tavily Search** | Keyword extraction | Free tier available |

### Python Dependencies

```
# requirements.txt
fastapi>=0.115.0
uvicorn[standard]>=0.32.0
langgraph>=0.6.4
langchain>=0.3.27
langchain-openai>=0.3.18
langchain-google-genai>=2.1.5
fastmcp>=2.11.0
langchain-mcp-adapters>=0.1.9
google-generativeai>=0.8.5
openai>=1.0.0
pydantic>=2.0.0
structlog>=25.4.0
httpx>=0.28.0
python-dotenv>=1.0.0
```

---

## 🔮 Future Enhancements (Post-MVP)

### Phase 2

- User authentication (Supabase Auth)
- PostgresSaver for persistent sessions
- User profile and preferences storage
- Share functionality (social media, export PDF)

### Phase 3

- Redis caching for API responses
- O2O rental system integration
- Payment processing (Stripe)
- Mobile app (React Native)

---

## 📝 Appendix

### A. Glossary

- **LangGraph**: State machine framework for AI agent workflows
- **Human-in-the-loop**: Pattern where workflow pauses for user input
- **SSE (Server-Sent Events)**: One-way real-time communication from server to client
- **MCP (Model Context Protocol)**: Standard for AI tool integration
- **Strategy Pattern**: Design pattern for interchangeable algorithms (LLM providers)
- **Film Aesthetic**: Visual style mimicking analog film cameras

### B. Reference Links

- [LangGraph Documentation](https://langchain-ai.github.io/langgraph/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Gemini Imagen API](https://cloud.google.com/vertex-ai/generative-ai/docs/image/overview)
- [OpenAI API Documentation](https://platform.openai.com/docs)

### C. Revision History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0.0 | 2025-12-03 | Initial TRD for MVP | Engineering Team |
| 2.0.0 | 2025-12-10 | Updated to reflect actual implementation: 3-Agent Architecture, Python backend, Gemini Imagen, SSE streaming | Engineering Team |

---

**Document Status**: ✅ Ready for Development Reference
