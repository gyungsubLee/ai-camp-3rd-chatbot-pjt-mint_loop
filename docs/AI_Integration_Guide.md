# Trip Kit - AI Integration Guide
## Vibe-Driven AI: LangGraph Agents with Python Backend

**"여행의 감성을 이해하고 시각화하는 AI"**
*AI That Understands and Visualizes Your Travel Vibe*

---

## 📋 Document Information

- **Document Version**: 2.0.0
- **Last Updated**: 2025-12-10
- **Backend Framework**: Python 3.12+ / LangGraph 0.6.4+ / FastAPI
- **AI Providers**: OpenAI (GPT-4o-mini), Google Gemini Imagen
- **Related Documents**: [TRD](./TRD_TripKit_MVP.md), [API Docs](./API_Documentation.md), [Sub-Agent Architecture](./Sub_Agent_Architecture.md)

---

## 🎯 Overview

Trip Kit uses **Python LangGraph** for agent orchestration with a **3-agent architecture**:

### AI Agent System

```
┌─────────────────────────────────────────────────────────────────────┐
│                     FastAPI Backend (Python)                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────┐   ┌─────────────────────┐   ┌─────────────────┐   │
│  │  ChatAgent   │   │ RecommendationAgent │   │   ImageAgent    │   │
│  │              │   │                     │   │                 │   │
│  │ Human-in-   │   │ 5-Step Workflow:    │   │ 3-Step Workflow:│   │
│  │ the-loop    │   │ 1. analyze_prefs    │   │ 1. extract_kw   │   │
│  │              │   │ 2. build_prompt     │   │ 2. optimize     │   │
│  │ LLM: Gemini │   │ 3. generate_recs    │   │ 3. generate     │   │
│  │              │   │ 4. parse_response   │   │                 │   │
│  │              │   │ 5. enrich_places    │   │ Model: Imagen   │   │
│  │              │   │                     │   │                 │   │
│  │              │   │ LLM: GPT-4o-mini    │   │                 │   │
│  └──────────────┘   └─────────────────────┘   └─────────────────┘   │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │                    MCP Servers (FastMCP)                         │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │ │
│  │  │ Search MCP  │  │ Places MCP  │  │ Image MCP (Future)      │  │ │
│  │  │ Port: 8050  │  │ Port: 8052  │  │                         │  │ │
│  │  └─────────────┘  └─────────────┘  └─────────────────────────┘  │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

### Core AI Components

| Agent | Purpose | LLM Provider | Workflow |
|-------|---------|--------------|----------|
| **ChatAgent** | TripKit profile extraction via conversation | Gemini | Human-in-the-loop |
| **RecommendationAgent** | Vibe-matched destination recommendations | OpenAI GPT-4o-mini | 5-step linear |
| **ImageAgent** | Film-aesthetic image generation | Gemini Imagen | 3-step linear |

---

## 🏗️ LangGraph Architecture

### StateGraph Pattern

All agents use LangGraph's `StateGraph` for workflow orchestration:

```python
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
from typing import TypedDict, Annotated
from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages

# State schema with message accumulator
class AgentState(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]
    # ... other state fields
    status: str
    error: str | None

# Build workflow
workflow = StateGraph(AgentState)
workflow.add_node("step_1", step_1_node)
workflow.add_node("step_2", step_2_node)
workflow.set_entry_point("step_1")
workflow.add_edge("step_1", "step_2")
workflow.add_edge("step_2", END)

# Compile with checkpointing
graph = workflow.compile(checkpointer=MemorySaver())
```

---

## 🗣️ ChatAgent: Human-in-the-loop Conversation

### Architecture

ChatAgent uses LangGraph's **interrupt pattern** for multi-turn conversation with session persistence.

```
┌─────────────────────────────────────────────────────────────────────┐
│                      ChatAgent Workflow                              │
│                                                                       │
│   ┌──────────┐    ┌──────────────┐    ┌───────────────────┐         │
│   │  START   │───►│ process_msg  │───►│ route_by_status   │         │
│   └──────────┘    └──────────────┘    └───────────────────┘         │
│                          │                      │                    │
│                    [process]              [needs_input]              │
│                          │                      │                    │
│                    ┌─────▼─────┐         ┌──────▼──────┐            │
│                    │ route_nxt │         │ wait_input  │            │
│                    └───────────┘         └──────┬──────┘            │
│                          │                      │                    │
│                   [continue|complete]     [interrupt → END]          │
│                          │                                           │
│                    ┌─────▼─────┐                                     │
│                    │ summarize │───► [END]                           │
│                    └───────────┘                                     │
│                                                                       │
│   Checkpointer: MemorySaver (session persistence)                    │
└─────────────────────────────────────────────────────────────────────┘
```

### State Schema

```python
# backend/src/agents/chat_agent/state.py
from typing import TypedDict, Annotated, Literal
from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages

class TripKitProfile(TypedDict, total=False):
    """Collected user preferences for TripKit generation."""
    city: str
    spotName: str
    conceptId: str
    mainAction: str
    outfitStyle: str
    filmType: str
    cameraModel: str

class RejectedItems(TypedDict, total=False):
    """Items user has rejected."""
    cities: list[str]
    spots: list[str]
    actions: list[str]
    concepts: list[str]
    outfits: list[str]
    poses: list[str]
    films: list[str]
    cameras: list[str]

ConversationStep = Literal[
    "greeting", "city", "spot_name", "concept",
    "main_action", "outfit_style", "film_type",
    "camera_model", "summary", "complete"
]

class ChatState(TypedDict):
    """ChatAgent state schema."""
    messages: Annotated[list[BaseMessage], add_messages]
    user_message: str
    current_step: ConversationStep
    collected_data: TripKitProfile
    rejected_items: RejectedItems
    suggested_options: list[str]
    is_complete: bool
    session_id: str
    reply: str
    status: Literal["processing", "needs_input", "complete"]
    error: str | None
```

### Conversation Flow

```
greeting → city → spot_name → concept → main_action →
outfit_style → film_type → camera_model → summary → complete
```

Each step:
1. **Validates** current input
2. **Extracts** relevant data to `collected_data`
3. **Tracks** rejections in `rejected_items`
4. **Generates** next prompt with `suggested_options`

### Implementation

```python
# backend/src/agents/chat_agent/agent.py
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
from .state import ChatState
from .nodes import process_message_node, route_by_status, wait_input_node, summarize_node

class ChatAgent:
    def __init__(self, checkpointer: MemorySaver | None = None):
        self.checkpointer = checkpointer or MemorySaver()
        self.graph = self._build_graph()

    def _build_graph(self):
        workflow = StateGraph(ChatState)

        # Add nodes
        workflow.add_node("process_message", process_message_node)
        workflow.add_node("wait_input", wait_input_node)
        workflow.add_node("summarize", summarize_node)

        # Entry point
        workflow.set_entry_point("process_message")

        # Conditional routing
        workflow.add_conditional_edges(
            "process_message",
            route_by_status,
            {
                "needs_input": "wait_input",
                "continue": "process_message",
                "complete": "summarize",
            }
        )

        # wait_input → END (interrupt for user input)
        workflow.add_edge("wait_input", END)
        workflow.add_edge("summarize", END)

        return workflow.compile(checkpointer=self.checkpointer)

    async def chat(self, input_data: ChatInput) -> dict:
        """Process chat message with session persistence."""
        config = {"configurable": {"thread_id": input_data["session_id"]}}

        initial_state = {
            "messages": [],
            "user_message": input_data["message"],
            "current_step": "greeting",
            "collected_data": {},
            "rejected_items": {},
            "suggested_options": [],
            "is_complete": False,
            "session_id": input_data["session_id"],
            "reply": "",
            "status": "processing",
            "error": None,
        }

        result = await self.graph.ainvoke(initial_state, config)

        return {
            "reply": result["reply"],
            "current_step": result["current_step"],
            "next_step": get_next_step(result["current_step"]),
            "is_complete": result["is_complete"],
            "collected_data": result["collected_data"],
            "rejected_items": result["rejected_items"],
            "suggested_options": result["suggested_options"],
            "session_id": result["session_id"],
        }
```

### Session Recovery

```python
async def get_conversation_history(self, session_id: str) -> list[dict]:
    """Retrieve conversation history for session recovery."""
    config = {"configurable": {"thread_id": session_id}}

    # Get latest state from checkpointer
    state = await self.graph.aget_state(config)

    if not state or not state.values:
        return []

    messages = state.values.get("messages", [])
    return [
        {"role": msg.type, "content": msg.content}
        for msg in messages
    ]
```

---

## 🎯 RecommendationAgent: 5-Step Workflow

### Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                  RecommendationAgent Workflow                        │
│                                                                       │
│  ┌────────────────┐   ┌──────────────┐   ┌─────────────────────┐    │
│  │ analyze_prefs  │──►│ build_prompt │──►│ generate_recs       │    │
│  │                │   │              │   │ (LLM: GPT-4o-mini)  │    │
│  └────────────────┘   └──────────────┘   └─────────────────────┘    │
│                                                   │                  │
│                                                   ▼                  │
│  ┌────────────────┐   ┌──────────────────────────────────────────┐  │
│  │ enrich_places  │◄──│ parse_response                           │  │
│  │ (Google Places)│   │ (JSON extraction)                        │  │
│  └────────────────┘   └──────────────────────────────────────────┘  │
│         │                                                            │
│         ▼                                                            │
│      [END]                                                           │
│                                                                       │
│  Provider: OpenAI (gpt-4o-mini) or Gemini                            │
│  Output: 3 enriched destinations with Places API data                │
└─────────────────────────────────────────────────────────────────────┘
```

### State Schema

```python
# backend/src/agents/recommendation_agent/state.py
from typing import TypedDict, Annotated
from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages

class RecommendationInput(TypedDict, total=False):
    preferences: dict
    concept: str | None
    travel_scene: str | None
    travel_destination: str | None
    image_generation_context: dict | None

class RecommendationOutput(TypedDict):
    destinations: list[dict]
    user_profile: dict
    status: str
    is_fallback: bool

class RecommendationState(TypedDict):
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
    status: str
    error: str | None
```

### Workflow Nodes

```python
# backend/src/agents/recommendation_agent/nodes.py

async def analyze_preferences_node(state: RecommendationState) -> dict:
    """Step 1: Analyze user preferences and build profile."""
    preferences = state["user_preferences"]
    concept = state.get("concept")

    user_profile = {
        "primary_mood": preferences.get("mood"),
        "aesthetic_preference": preferences.get("aesthetic"),
        "trip_duration": preferences.get("duration"),
        "interests": preferences.get("interests", []),
        "concept": concept,
        "travel_scene": state.get("travel_scene"),
        "travel_destination": state.get("travel_destination"),
    }

    return {"user_profile": user_profile, "status": "analyzing"}

async def build_prompt_node(state: RecommendationState) -> dict:
    """Step 2: Build LLM prompts from user profile."""
    profile = state["user_profile"]

    system_prompt = build_system_prompt(profile)
    user_prompt = build_user_prompt(profile)

    return {
        "system_prompt": system_prompt,
        "user_prompt": user_prompt,
        "status": "prompting",
    }

async def generate_recommendations_node(
    state: RecommendationState,
    provider_type: str = "openai",
    model: str = "gpt-4o-mini"
) -> dict:
    """Step 3: Generate recommendations using LLM."""
    from ..providers import get_provider

    provider = get_provider(provider_type, model=model)

    response = await provider.generate(
        system_prompt=state["system_prompt"],
        user_prompt=state["user_prompt"],
    )

    return {"raw_response": response, "status": "generating"}

async def parse_response_node(state: RecommendationState) -> dict:
    """Step 4: Parse JSON response into destinations."""
    raw = state["raw_response"]

    # Extract JSON from response
    destinations = parse_destinations_json(raw)

    return {"destinations": destinations, "status": "parsing"}

async def enrich_with_places_node(state: RecommendationState) -> dict:
    """Step 5: Enrich with Google Places API data."""
    destinations = state["destinations"]

    enriched = await enrich_destinations_parallel(destinations)

    return {"destinations": enriched, "status": "completed"}
```

### SSE Streaming Implementation

```python
# backend/src/agents/recommendation_agent/agent.py

async def recommend_stream(
    self,
    input_data: RecommendationInput,
    thread_id: str = "default",
) -> AsyncIterator[dict]:
    """Stream recommendations via SSE."""

    # Run workflow up to parse_response
    state = await self._run_to_parse(input_data)
    parsed_destinations = state["destinations"]

    # Parallel enrichment with Google Places API
    enriched = await enrich_destinations_parallel(parsed_destinations)

    # Stream each destination
    for i, dest in enumerate(enriched):
        yield {
            "type": "destination",
            "index": i,
            "total": len(enriched),
            "destination": dest,
            "isFallback": False,
        }

    # Complete event
    yield {
        "type": "complete",
        "total": len(enriched),
        "userProfile": state["user_profile"],
        "isFallback": False,
    }
```

---

## 🎨 ImageAgent: Film Aesthetic Generation

### Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                     ImageAgent Workflow                              │
│                                                                       │
│  ┌─────────────────┐   ┌──────────────────┐   ┌──────────────────┐  │
│  │ extract_keywords│──►│ optimize_prompt  │──►│ generate_image   │  │
│  │   (MCP Search)  │   │  (Gemini LLM)    │   │ (Gemini Imagen)  │  │
│  └─────────────────┘   └──────────────────┘   └──────────────────┘  │
│                                                         │            │
│                                                         ▼            │
│                                                      [END]           │
│                                                                       │
│  Model: imagen-3.0-generate-002                                       │
│  Output: Generated image URL with film aesthetic                      │
└─────────────────────────────────────────────────────────────────────┘
```

### State Schema

```python
# backend/src/agents/image_agent/state.py
from typing import TypedDict, Annotated, Literal
from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages

class ImageGenerationState(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]
    user_prompt: str
    extracted_keywords: list[str]
    optimized_prompt: str
    generated_image_url: str | None
    image_metadata: dict | None
    image_model: str
    status: Literal["pending", "processing", "completed", "failed"]
    error: str | None
```

### Workflow Nodes

```python
# backend/src/agents/image_agent/nodes.py

DEFAULT_IMAGE_MODEL = "imagen-3.0-generate-002"

async def extract_keywords_node(
    state: ImageGenerationState,
    search_tools: list
) -> dict:
    """Step 1: Extract keywords from user prompt using MCP Search."""
    user_prompt = state["user_prompt"]

    # Use Search MCP for keyword extraction
    keywords = await extract_keywords_with_mcp(user_prompt, search_tools)

    return {
        "extracted_keywords": keywords,
        "status": "processing",
    }

async def optimize_prompt_node(state: ImageGenerationState) -> dict:
    """Step 2: Optimize prompt for film aesthetic generation."""
    keywords = state["extracted_keywords"]
    user_prompt = state["user_prompt"]

    # Build optimized prompt with film aesthetic
    optimized = build_film_aesthetic_prompt(
        keywords=keywords,
        user_prompt=user_prompt,
    )

    return {"optimized_prompt": optimized, "status": "processing"}

async def generate_image_node(
    state: ImageGenerationState,
    provider_type: str = "gemini",
    image_model: str = DEFAULT_IMAGE_MODEL
) -> dict:
    """Step 3: Generate image using Gemini Imagen."""
    from ..providers import get_provider

    provider = get_provider(provider_type, model=image_model)

    result = await provider.generate_image(
        prompt=state["optimized_prompt"],
        size="1024x1024",
    )

    if result.success:
        return {
            "generated_image_url": result.url,
            "image_metadata": {
                "provider": provider_type,
                "model": image_model,
            },
            "status": "completed",
        }

    return {
        "error": result.error,
        "status": "failed",
    }
```

### Film Aesthetic Prompt Engineering

```python
# backend/src/api_server/services/prompt_builder.py

FILM_STOCK_PROFILES = {
    "kodak_portra": {
        "name": "Kodak Portra 400",
        "characteristics": "Natural skin tones, subtle colors, smooth grain",
        "color_profile": "Warm-neutral, soft pastels, gentle contrast",
    },
    "kodak_colorplus": {
        "name": "Kodak ColorPlus 200",
        "characteristics": "Warm saturated tones, fine grain, budget classic",
        "color_profile": "Golden warmth, enhanced reds/oranges, slight vignette",
    },
    "fuji_superia": {
        "name": "Fujifilm Superia 400",
        "characteristics": "Vibrant colors, punchy greens, moderate grain",
        "color_profile": "Cool-neutral, saturated, slight cyan in shadows",
    },
    "ilford_hp5": {
        "name": "Ilford HP5 Plus",
        "characteristics": "Classic B&W, high contrast, visible grain",
        "color_profile": "Monochrome, rich blacks, organic texture",
    },
    "cinestill_800t": {
        "name": "CineStill 800T",
        "characteristics": "Tungsten balanced, cinematic halation, night vibes",
        "color_profile": "Cool tones, red halation around lights, filmic",
    },
}

def build_film_aesthetic_prompt(
    destination: str,
    concept: str,
    film_stock: str,
    outfit_style: str = "",
    additional_prompt: str = "",
) -> str:
    """Build prompt optimized for Gemini Imagen film aesthetic."""

    film = FILM_STOCK_PROFILES.get(film_stock, FILM_STOCK_PROFILES["kodak_portra"])

    return f"""
Create a hyper-realistic photograph in the authentic style of {film['name']} film.

LOCATION: {destination}

SUBJECT:
- Young traveler in their 20s-30s
- Wearing: {outfit_style or "casual travel attire"}
- Natural, candid pose (not staged)
- Holding vintage 35mm film camera
{f'- Action: {additional_prompt}' if additional_prompt else ''}

FILM AESTHETIC ({film['name']}):
- {film['characteristics']}
- Color profile: {film['color_profile']}
- Authentic grain texture
- Slight vignetting
- Natural light with film response

CONCEPT: {concept}
- Capture the essence of {concept} aesthetic
- Emotional, nostalgic atmosphere
- Should feel like genuine film photography

TECHNICAL:
- 35mm or 50mm focal length feel
- f/1.8-2.8 depth of field
- Natural lighting
- NO digital sharpness, NO HDR
- YES organic grain, YES color shifts

Output should look like it was actually shot on {film['name']} and scanned at high resolution.
""".strip()
```

---

## 🔧 Provider Strategy Pattern

### Base Provider Interface

```python
# backend/src/providers/base.py
from abc import ABC, abstractmethod
from dataclasses import dataclass

@dataclass
class GenerationResult:
    success: bool
    content: str | None = None
    url: str | None = None
    error: str | None = None
    provider: str = ""
    model: str = ""

@dataclass
class ImageGenerationParams:
    prompt: str
    size: str = "1024x1024"
    quality: str = "standard"
    style: str = "natural"

class BaseProvider(ABC):
    @abstractmethod
    async def generate(self, system_prompt: str, user_prompt: str) -> str:
        """Generate text response."""
        pass

    @abstractmethod
    async def generate_image(self, params: ImageGenerationParams) -> GenerationResult:
        """Generate image."""
        pass
```

### OpenAI Provider

```python
# backend/src/providers/openai_provider.py
from openai import AsyncOpenAI
from .base import BaseProvider, GenerationResult

class OpenAIProvider(BaseProvider):
    def __init__(self, model: str = "gpt-4o-mini"):
        self.client = AsyncOpenAI()
        self.model = model

    async def generate(self, system_prompt: str, user_prompt: str) -> str:
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.8,
            response_format={"type": "json_object"},
        )
        return response.choices[0].message.content
```

### Gemini Provider (for Image Generation)

```python
# backend/src/providers/gemini_provider.py
from google import genai
from .base import BaseProvider, GenerationResult, ImageGenerationParams

class GeminiImagenProvider(BaseProvider):
    def __init__(self, model: str = "imagen-3.0-generate-002"):
        self.client = genai.Client()
        self.model = model

    async def generate_image(self, params: ImageGenerationParams) -> GenerationResult:
        try:
            response = await self.client.aio.models.generate_images(
                model=self.model,
                prompt=params.prompt,
                config=genai.types.GenerateImagesConfig(
                    number_of_images=1,
                    output_mime_type="image/png",
                ),
            )

            # Upload to storage and get URL
            image_url = await self._upload_image(response.generated_images[0])

            return GenerationResult(
                success=True,
                url=image_url,
                provider="gemini",
                model=self.model,
            )
        except Exception as e:
            return GenerationResult(
                success=False,
                error=str(e),
                provider="gemini",
            )
```

### Provider Factory

```python
# backend/src/providers/factory.py
from .openai_provider import OpenAIProvider
from .gemini_provider import GeminiImagenProvider, GeminiLLMProvider

def get_provider(provider_type: str, model: str | None = None):
    """Factory function for provider selection."""

    if provider_type == "openai":
        return OpenAIProvider(model=model or "gpt-4o-mini")

    elif provider_type == "gemini":
        if model and "imagen" in model:
            return GeminiImagenProvider(model=model)
        return GeminiLLMProvider(model=model or "gemini-2.0-flash")

    raise ValueError(f"Unknown provider: {provider_type}")
```

---

## 🔌 MCP Server Integration

### Search MCP Server

```python
# backend/src/mcp_servers/search_server.py
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("search-mcp")

@mcp.tool()
async def extract_keywords(prompt: str) -> list[str]:
    """Extract keywords from user prompt for image generation."""
    # Use LLM for keyword extraction
    keywords = await extract_with_llm(prompt)
    return keywords

@mcp.tool()
async def search_references(query: str) -> list[dict]:
    """Search for reference images and locations."""
    results = await tavily_search(query)
    return results

if __name__ == "__main__":
    mcp.run(transport="stdio")
```

### Places MCP Server

```python
# backend/src/mcp_servers/places_server.py
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("places-mcp")

@mcp.tool()
async def search_place(query: str, location: str) -> dict:
    """Search for place details using Google Places API."""
    from google.maps import places

    result = await places.search_text(
        query=f"{query} in {location}",
        language_code="en",
    )

    return {
        "name": result.display_name,
        "address": result.formatted_address,
        "rating": result.rating,
        "photos": [p.uri for p in result.photos[:3]],
    }

@mcp.tool()
async def get_place_photos(place_id: str) -> list[str]:
    """Get photos for a specific place."""
    photos = await places.get_photos(place_id)
    return [p.uri for p in photos]
```

---

## 📊 Performance Optimization

### Parallel Processing

```python
# backend/src/agents/recommendation_agent/nodes.py
import asyncio

async def enrich_destinations_parallel(destinations: list[dict]) -> list[dict]:
    """Enrich all destinations in parallel."""

    async def enrich_single(dest: dict) -> dict:
        place_data = await search_place(
            query=dest["name"],
            location=f"{dest['city']}, {dest['country']}",
        )
        return {**dest, "placeDetails": place_data}

    # Run all enrichments in parallel
    enriched = await asyncio.gather(
        *[enrich_single(d) for d in destinations],
        return_exceptions=True,
    )

    return [e for e in enriched if not isinstance(e, Exception)]
```

### Caching Strategy

```python
# backend/src/utils/cache.py
from functools import lru_cache
import hashlib

@lru_cache(maxsize=100)
def get_cached_recommendations(preferences_hash: str) -> list[dict] | None:
    """Cache recommendations by preferences hash."""
    return None  # Implement with Redis for production

def hash_preferences(preferences: dict) -> str:
    """Create hash from preferences for caching."""
    import json
    content = json.dumps(preferences, sort_keys=True)
    return hashlib.md5(content.encode()).hexdigest()
```

---

## 🧪 Testing

### Unit Tests

```python
# tests/test_recommendation_agent.py
import pytest
from backend.src.agents import RecommendationAgent

@pytest.fixture
def agent():
    return RecommendationAgent(model="gpt-4o-mini")

@pytest.mark.asyncio
async def test_recommend_returns_3_destinations(agent):
    input_data = {
        "preferences": {
            "mood": "romantic",
            "aesthetic": "vintage",
        },
        "concept": "filmlog",
    }

    result = await agent.recommend(input_data)

    assert result["status"] == "completed"
    assert len(result["destinations"]) == 3
    assert all("name" in d for d in result["destinations"])
```

### Integration Tests

```python
# tests/test_chat_session.py
import pytest
from backend.src.agents import ChatAgent

@pytest.mark.asyncio
async def test_chat_session_persistence():
    agent = ChatAgent()
    session_id = "test-session-123"

    # First message
    result1 = await agent.chat({
        "message": "I want a romantic trip to Italy",
        "session_id": session_id,
    })

    assert result1["current_step"] == "city"

    # Second message (session continues)
    result2 = await agent.chat({
        "message": "Rome sounds perfect",
        "session_id": session_id,
    })

    assert result2["collected_data"]["city"] == "Rome"
```

---

## 📚 Environment Setup

### Required Environment Variables

환경변수 설정은 `.env.sample` 파일을 참조하세요:

```bash
# 주요 설정 항목 (자세한 내용은 .env.sample 참조)

# LLM Provider 설정
LLM_PROVIDER=openai
LLM_MODEL=gpt-4o-mini

# Image Generation 설정
IMAGE_PROVIDER=gemini
GEMINI_IMAGE_MODEL=imagen-3.0-generate-002

# Chat Model 설정
GEMINI_TEXT_MODEL=gemini-2.5-flash

# MCP Server 포트
SEARCH_MCP_PORT=8050
IMAGE_MCP_PORT=8051
```

### Running the Backend

```bash
cd backend

# Create virtual environment
python -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run FastAPI server
uvicorn src.api_server.server:app --reload --port 8000
```

---

## 📝 Changelog

### v2.0.0 (2025-12-10)
- 🔄 Complete rewrite for Python LangGraph backend
- 🔄 DALL-E 3 → Gemini Imagen for image generation
- ✨ Added 3-agent architecture documentation
- ✨ Added MCP server integration
- ✨ Added SSE streaming for recommendations
- 📝 Updated all code examples to Python

### v1.0.0 (2025-12-03)
- Initial TypeScript-focused documentation (deprecated)

---

**Document Version**: 2.0.0
**Last Updated**: 2025-12-10
**Status**: ✅ Production Ready
