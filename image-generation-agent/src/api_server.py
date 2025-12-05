"""FastAPI 서버 - 프론트엔드와 LangGraph Agent 연결"""
import asyncio
from contextlib import asynccontextmanager
from typing import Optional

import structlog
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from langchain_mcp_adapters.client import MultiServerMCPClient

from .image_agent.agent import ImageGenerationAgent

load_dotenv()

logger = structlog.get_logger(__name__)

# 전역 변수
agent: Optional[ImageGenerationAgent] = None
mcp_client: Optional[MultiServerMCPClient] = None

# 컨셉별 필름 스타일 프롬프트 매핑
CONCEPT_STYLE_PROMPTS = {
    "flaneur": "shot on Kodak Portra 400, soft natural lighting, urban street photography style, literary cafe atmosphere, intellectual bohemian aesthetic, warm muted tones, slight film grain",
    "filmlog": "shot on Kodak ColorPlus 200, warm golden hour lighting, vintage film photography, nostalgic retro aesthetic, soft warm tones, natural film grain, authentic analog feel",
    "midnight": "shot on Kodak Tri-X 400, dramatic artistic lighting, 1920s Paris bohemian atmosphere, moody cinematic style, high contrast, classic black and white or deep warm tones",
}

# 필름 스톡별 스타일 프롬프트
FILM_STOCK_PROMPTS = {
    "Kodak Portra 400": "Kodak Portra 400 film, natural skin tones, soft pastel colors, fine grain, professional portrait quality",
    "Ilford HP5 Plus": "Ilford HP5 Plus black and white film, classic grain structure, rich tonal range, timeless documentary style",
    "Kodak ColorPlus 200": "Kodak ColorPlus 200 film, warm saturated colors, nostalgic vintage look, everyday moments aesthetic",
    "Fujifilm Superia 400": "Fujifilm Superia 400 film, vibrant greens and blues, punchy colors, casual snapshot style",
    "Kodak Tri-X 400": "Kodak Tri-X 400 black and white film, iconic grain, deep blacks, legendary street photography look",
    "Ilford Delta 3200": "Ilford Delta 3200 high-speed black and white, dramatic grain, low light capability, artistic night photography",
}


class GenerateRequest(BaseModel):
    """이미지 생성 요청"""
    destination: str
    concept: str  # flaneur, filmlog, midnight
    filmStock: str
    colorPalette: list[str] = []
    outfitStyle: str = ""
    additionalPrompt: str = ""


class GenerateResponse(BaseModel):
    """이미지 생성 응답"""
    status: str
    imageUrl: Optional[str] = None
    optimizedPrompt: Optional[str] = None
    extractedKeywords: list[str] = []
    metadata: Optional[dict] = None
    error: Optional[str] = None


def build_travel_prompt(request: GenerateRequest) -> str:
    """여행 프롬프트 구성"""
    # 기본 여행 프롬프트
    base_prompt = f"A person traveling and exploring {request.destination}"

    # 컨셉 스타일
    concept_style = CONCEPT_STYLE_PROMPTS.get(request.concept, CONCEPT_STYLE_PROMPTS["filmlog"])

    # 필름 스톡 스타일
    film_style = FILM_STOCK_PROMPTS.get(request.filmStock, f"shot on {request.filmStock} film")

    # 의상 스타일
    outfit_prompt = f"wearing {request.outfitStyle} style clothing" if request.outfitStyle else ""

    # 컬러 팔레트 힌트
    color_hint = ""
    if request.colorPalette:
        colors = ", ".join(request.colorPalette[:3])
        color_hint = f"color palette featuring {colors} tones"

    # 여행 사진 느낌 공통 요소
    travel_photo_style = "authentic travel photography, candid moment, natural pose, real location, immersive atmosphere, environmental portrait"

    # 최종 프롬프트 조합
    prompt_parts = [
        base_prompt,
        request.additionalPrompt,
        outfit_prompt,
        travel_photo_style,
        film_style,
        concept_style,
        color_hint,
        "high quality, detailed, professional photography"
    ]

    return ", ".join(filter(None, prompt_parts))


@asynccontextmanager
async def lifespan(app: FastAPI):
    """앱 시작/종료 시 MCP 클라이언트 및 Agent 초기화"""
    global agent, mcp_client

    logger.info("Initializing MCP client and Agent...")

    # MCP 클라이언트 설정 (새로운 API 방식)
    mcp_client = MultiServerMCPClient({
        "search": {
            "url": "http://localhost:8050/mcp",
            "transport": "streamable_http"
        },
        "image": {
            "url": "http://localhost:8051/mcp",
            "transport": "streamable_http"
        }
    })

    try:
        # 도구 가져오기 (새로운 방식: await client.get_tools())
        tools = await mcp_client.get_tools()
        search_tools = [t for t in tools if t.name in ["extract_keywords", "search_images"]]
        image_tools = [t for t in tools if t.name in ["optimize_prompt_for_image", "generate_image"]]

        logger.info(f"Loaded {len(search_tools)} search tools, {len(image_tools)} image tools")

        # Agent 초기화
        agent = ImageGenerationAgent(
            search_tools=search_tools,
            image_tools=image_tools
        )

        logger.info("API server ready!")

        yield

    except Exception as e:
        logger.error(f"Failed to initialize: {e}")
        raise
    finally:
        logger.info("Shutting down...")


app = FastAPI(
    title="Trip Kit Image Generation API",
    description="LangGraph Agent를 사용한 여행 이미지 생성 API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    """헬스 체크"""
    return {"status": "healthy", "agent_ready": agent is not None}


@app.post("/generate", response_model=GenerateResponse)
async def generate_image(request: GenerateRequest):
    """이미지 생성 엔드포인트"""
    global agent

    if not agent:
        raise HTTPException(status_code=503, detail="Agent not initialized")

    try:
        logger.info(f"Generate request: {request.destination}, concept={request.concept}")

        # 여행 프롬프트 구성
        travel_prompt = build_travel_prompt(request)
        logger.info(f"Built travel prompt: {travel_prompt[:200]}...")

        # Agent 실행
        result = await agent.generate(
            user_prompt=travel_prompt,
            thread_id=f"{request.destination}-{request.concept}"
        )

        if result["status"] == "completed":
            return GenerateResponse(
                status="success",
                imageUrl=result["generated_image_url"],
                optimizedPrompt=result["optimized_prompt"],
                extractedKeywords=result.get("extracted_keywords", []),
                metadata={
                    "concept": request.concept,
                    "filmStock": request.filmStock,
                    "destination": request.destination,
                    **(result.get("image_metadata") or {})
                }
            )
        else:
            return GenerateResponse(
                status="error",
                error=result.get("error", "Unknown error")
            )

    except Exception as e:
        logger.error(f"Generate error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
