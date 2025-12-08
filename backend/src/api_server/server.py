"""FastAPI 서버 - 프론트엔드와 Image Provider 연결

직접 Image Provider를 사용하여 이미지를 생성합니다.
RecommendationAgent를 사용하여 여행지를 추천합니다.
사용자 입력 기반 이미지 생성을 지원합니다.
Gemini 기반 챗봇 대화를 지원합니다.
"""
import os
import json
import random
from pathlib import Path
from typing import Optional

import structlog
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# .env 파일 로드 (상위 디렉토리에서 검색)
def find_and_load_dotenv():
    current = Path(__file__).resolve().parent
    for _ in range(5):
        env_file = current / ".env"
        if env_file.exists():
            load_dotenv(env_file)
            return True
        current = current.parent
    load_dotenv()
    return False

find_and_load_dotenv()

# 상위 패키지에서 providers import
from ..providers import get_provider, ImageGenerationParams
from ..providers.gemini_provider import GeminiLLMProvider, LLMGenerationParams
# RecommendationAgent import
from ..agents import RecommendationAgent

logger = structlog.get_logger(__name__)

# 모델 설정 (환경변수에서 가져오기)
DEFAULT_TEXT_MODEL = os.getenv("GEMINI_TEXT_MODEL", "gemini-2.0-flash")
DEFAULT_IMAGE_MODEL = os.getenv("GEMINI_IMAGE_MODEL", "imagen-3.0-generate-001")
# 채팅용 빠른 모델 (Flash 모델 우선 사용)
CHAT_MODEL = os.getenv("GEMINI_CHAT_MODEL", "gemini-2.0-flash")

# RecommendationAgent 인스턴스 (싱글톤)
recommendation_agent = RecommendationAgent(model=DEFAULT_TEXT_MODEL)

# Gemini LLM Provider (챗봇용 - 빠른 Flash 모델 사용)
gemini_llm_provider = GeminiLLMProvider(model=CHAT_MODEL)

# 챗봇 시스템 프롬프트
CHATBOT_SYSTEM_PROMPT = """당신은 Trip Kit의 트래블 큐레이터입니다. 20년간 여행자들의 특별한 순간을 함께 그려온 따뜻하고 감성적인 여행 전문가입니다.

당신의 역할:
1. 사용자와 친근하고 자연스럽게 대화하며 여행 취향을 파악합니다
2. 단계별로 정보를 수집합니다: 도시 → 장소 → 행동 → 컨셉 → 의상 → 포즈 → 필름 → 카메라
3. 각 단계에서 사용자가 구체적인 답변을 하면 다음 단계로 넘어갑니다
4. "추천해줘", "아무거나", "모르겠어" 같은 답변에는 창의적인 추천을 제공합니다

대화 스타일:
- 따뜻하고 친근한 말투 (존댓말 사용)
- 적절한 이모지 사용 (과하지 않게)
- 사용자의 답변에 공감하고 칭찬해주기
- 질문은 한 번에 하나씩만
- 📝 가독성 중요: 문장이 끝나면 줄바꿈(\\n)을 넣어 읽기 쉽게 해주세요
- 긴 응답은 2-3문장마다 빈 줄(\\n\\n)을 넣어 단락을 나누세요
- 예시: "안녕하세요!\\n\\n저는 Trip Kit의 큐레이터예요.\\n어떤 여행을 꿈꾸고 계세요?"

🚨🚨🚨 매우 중요 - 유효한 답변 판별 (isLikelyPlace 로직):
각 단계에서 사용자 답변이 해당 단계의 유효한 값인지 반드시 판별하세요.

다음과 같은 답변은 "장소/도시/행동/옷/포즈"가 아닙니다 - 절대 저장하지 마세요:
- 부정/거절 표현: "싫어", "싫다", "별로", "아니", "아니야", "안 좋아", "그건 아니야"
- 이전 거절 언급: "아까 싫다했잖아", "방금 싫다고 했어", "이미 말했잖아"
- 다른 것 요청: "다른 거", "다른 곳", "다른 것", "그건 말고", "다시", "다르게"
- 모호한 답변: "모르겠어", "글쎄", "음...", "잘 모르겠어"
- 감정/반응: "짜증나", "뭐야", "왜", "싫다고", "됐어"

이런 답변이 오면:
1) 절대 collectedData의 해당 필드에 이 답변을 저장하지 마세요
2) 이전에 제안한 항목을 rejectedItems에 추가하세요
3) "그럼 이런 건 어떠세요?" 같이 부드럽게 새로운 옵션을 제안하세요
4) 같은 단계(currentStep/nextStep)를 유지하세요 - 다음 단계로 넘어가지 마세요

예시:
- 현재 단계: spot (장소 묻는 중)
- AI: "몽마르트르 언덕은 어떠세요?"
- 사용자: "아까 싫다했잖아" 또는 "싫어" 또는 "다른 곳"
- 올바른 처리:
  - spotName: null (저장하지 않음!)
  - rejectedItems.spots에 "몽마르트르 언덕" 추가
  - nextStep: "spot" (같은 단계 유지)
  - reply: "아, 죄송해요! 그럼 센강변 카페는 어떠세요? 🌿"

🚨 중요 - 거부된 추천 항목 처리:
- rejectedItems에 사용자가 이전에 거부한 항목들이 있습니다
- 추천할 때 rejectedItems에 있는 항목은 절대 다시 추천하지 마세요
- 사용자가 "다른 거", "싫어", "별로", "다시 추천해줘" 등으로 거부하면:
  1. 현재 추천한 항목을 해당 카테고리의 rejectedItems에 추가
  2. rejectedItems에 없는 새로운 항목을 추천
- 예: 파리를 추천했는데 거부당하면, rejectedItems.cities에 "파리" 추가 후 다른 도시 추천

현재 대화 상태를 JSON으로 응답해주세요:
{
  "reply": "사용자에게 보낼 메시지",
  "currentStep": "현재 단계 (greeting/city/spot/action/concept/outfit/pose/film/camera/complete)",
  "nextStep": "다음 단계",
  "isComplete": false,
  "collectedData": {
    "city": null,
    "spotName": null,
    "mainAction": null,
    "conceptId": null,
    "outfitStyle": null,
    "posePreference": null,
    "filmType": null,
    "cameraModel": null
  },
  "rejectedItems": {
    "cities": [],
    "spots": [],
    "actions": [],
    "concepts": [],
    "outfits": [],
    "poses": [],
    "films": [],
    "cameras": []
  }
}

🚨 중요 - collectedData 보존 규칙:
- 이미 수집된 데이터(collectedData에서 null이 아닌 값)는 절대 null로 덮어쓰지 마세요
- 새로운 값만 업데이트하고, 기존 값은 그대로 유지하세요
- 예: city가 "파리"로 이미 설정되어 있으면, 장소를 물을 때 city를 null로 바꾸지 마세요
- 응답 시 항상 기존에 수집된 모든 값을 포함해서 반환하세요

단계별 가이드:
- greeting/city: 여행하고 싶은 도시 물어보기
- spot: 해당 도시에서 가고 싶은 구체적인 장소 (카페, 골목, 해변 등)
- action: 그 장소에서 하고 싶은 행동 (커피 마시기, 산책, 책 읽기 등)
- concept: 분위기 선택 (flaneur/filmlog/midnight/pastoral/noir/seaside)
- outfit: 입고 싶은 옷 스타일
- pose: 원하는 포즈
- film: 필름 종류 (Kodak Portra 400, Fuji Pro 400H 등)
- camera: 카메라 모델

사용자가 모든 정보를 제공하면 isComplete를 true로 설정하고, 수집된 데이터를 요약해주세요.
거부된 항목들은 항상 rejectedItems에 누적해서 반환해주세요."""

# 컨셉별 분위기 키워드
CONCEPT_VIBES = {
    "flaneur": "urban wandering, literary atmosphere, intellectual charm, quiet observation",
    "filmlog": "vintage warmth, nostalgic moments, golden hour glow, retro aesthetic",
    "midnight": "artistic bohemian, dramatic shadows, 1920s Paris salon atmosphere",
    "pastoral": "serene nature, soft sunlight, peaceful countryside, gentle breeze",
    "noir": "cinematic shadows, neon reflections, mysterious urban night, dramatic contrast",
    "seaside": "ocean breeze, coastal serenity, sun-kissed memories, peaceful waves",
}

# 필름 타입별 렌더링 스타일
FILM_RENDERING = {
    "FUJI": "Fujifilm aesthetic with vibrant greens, cool blues, crisp tones, clean grain, airy and fresh atmosphere",
    "Kodak": "Kodak Portra style with soft pastel colors, warm golden highlights, creamy shadows, nostalgic analog warmth",
    "Canon": "Canon rendering with warm soft tones, creamy skin tones, smooth contrast, emotional and gentle",
    "Ricoh": "Ricoh GR style with high micro-contrast, muted colors, sharp details, street photography mood",
    "Nikon": "Nikon style with natural color accuracy, deep contrast, high sharpness, realistic and true-to-life",
    "Pentax": "Pentax vintage look with matte tones, warm shadows, noticeable grain, emotional softness",
}

# 번역용 시스템 프롬프트
TRANSLATION_SYSTEM_PROMPT = """You are a professional translator specializing in travel and photography content.
Translate the given Korean text to natural, descriptive English suitable for image generation prompts.

Rules:
1. Keep proper nouns (city names, brand names) in their commonly used English form
2. Translate descriptive phrases naturally, preserving the artistic/emotional nuance
3. If a location is in Korean, translate to its commonly known English name
4. For clothing/outfit descriptions, use natural English fashion terminology
5. For poses, describe them in clear, visual terms
6. Return ONLY the translated text, no explanations

Examples:
- "제주도 한적한 바닷가" → "a quiet beach in Jeju Island"
- "파도 소리 듣기" → "listening to the sound of waves"
- "넉넉한 핏의 셔츠와 면바지" → "relaxed-fit shirt and cotton pants"
- "물구나무 선 모습" → "handstand pose"
- "카페에서 책 읽는 모습" → "reading a book at a cafe"
"""


class ChatContext(BaseModel):
    """대화에서 수집한 컨텍스트"""
    city: Optional[str] = None
    spotName: Optional[str] = None
    mainAction: Optional[str] = None
    outfitStyle: Optional[str] = None
    posePreference: Optional[str] = None
    filmType: Optional[str] = None
    cameraModel: Optional[str] = None


class GenerateRequest(BaseModel):
    """이미지 생성 요청"""
    destination: str  # 장소 (예: "파리 몽마르트르", "제주도 협재해변")
    concept: str  # 컨셉 ID
    filmStock: str  # 선택한 필름 (예: "Kodak Portra 400")
    filmType: str = ""  # 필름 브랜드 (예: "Kodak", "FUJI")
    filmStyleDescription: str = ""  # 필름 스타일 설명
    outfitStyle: str = ""  # 의상 스타일
    additionalPrompt: str = ""  # 사용자가 직접 입력한 장면 설명 (가장 중요!)
    chatContext: Optional[ChatContext] = None  # 대화에서 수집한 컨텍스트
    conversationSummary: Optional[str] = None  # 대화 요약 (전체 대화 맥락)


class GenerateResponse(BaseModel):
    """이미지 생성 응답"""
    status: str
    imageUrl: Optional[str] = None
    optimizedPrompt: Optional[str] = None
    extractedKeywords: list[str] = []
    poseUsed: Optional[str] = None
    metadata: Optional[dict] = None
    error: Optional[str] = None


class UserPreferences(BaseModel):
    """사용자 선호도"""
    mood: Optional[str] = None
    aesthetic: Optional[str] = None
    duration: Optional[str] = None
    interests: list[str] = []


class RecommendationRequest(BaseModel):
    """여행지 추천 요청"""
    preferences: UserPreferences
    concept: Optional[str] = None
    travelScene: Optional[str] = None
    travelDestination: Optional[str] = None


class Activity(BaseModel):
    """액티비티 정보"""
    name: str
    description: str
    duration: str
    bestTime: str
    localTip: str
    photoOpportunity: str


class Destination(BaseModel):
    """여행지 정보"""
    id: str
    name: str
    city: str
    country: str
    description: str
    matchReason: str
    localVibe: Optional[str] = None
    whyHidden: Optional[str] = None
    bestTimeToVisit: str
    photographyScore: int
    transportAccessibility: str
    safetyRating: int
    estimatedBudget: Optional[str] = None
    tags: list[str] = []
    photographyTips: list[str] = []
    storyPrompt: Optional[str] = None
    activities: list[Activity] = []


class RecommendationResponse(BaseModel):
    """여행지 추천 응답"""
    status: str
    destinations: list[Destination]
    userProfile: Optional[dict] = None
    isFallback: bool = False


class ChatMessage(BaseModel):
    """채팅 메시지"""
    role: str  # "user" or "assistant"
    content: str


class RejectedItems(BaseModel):
    """사용자가 거부한 추천 항목들"""
    cities: list[str] = []
    spots: list[str] = []
    actions: list[str] = []
    concepts: list[str] = []
    outfits: list[str] = []
    poses: list[str] = []
    films: list[str] = []
    cameras: list[str] = []


class ChatRequest(BaseModel):
    """채팅 요청"""
    message: str
    conversationHistory: list[ChatMessage] = []
    currentStep: str = "greeting"
    collectedData: Optional[dict] = None
    rejectedItems: Optional[RejectedItems] = None


class ChatResponse(BaseModel):
    """채팅 응답"""
    reply: str
    currentStep: str
    nextStep: str
    isComplete: bool = False
    collectedData: Optional[dict] = None
    rejectedItems: Optional[RejectedItems] = None
    error: Optional[str] = None


# =============================================================================
# 저작권 콘텐츠 필터링
# =============================================================================

# 저작권/상표 키워드 → 일반적 대체어 매핑
COPYRIGHTED_KEYWORDS = {
    # Disney 캐릭터
    "토이스토리": "colorful animated character parade",
    "toy story": "colorful animated character parade",
    "우디": "cowboy character",
    "버즈": "astronaut character",
    "미키마우스": "cartoon mascot character",
    "미키": "cartoon mascot",
    "미니마우스": "cartoon mascot character",
    "미니": "cartoon mascot",
    "도날드덕": "cartoon duck character",
    "도날드": "cartoon duck",
    "엘사": "ice princess character",
    "안나": "princess character",
    "겨울왕국": "ice kingdom fantasy",
    "frozen": "ice kingdom fantasy",
    "라푼젤": "long-haired princess",
    "신데렐라": "classic princess",
    "백설공주": "classic princess",
    "인어공주": "mermaid princess",
    "모아나": "ocean princess",
    "라이온킹": "lion adventure",
    "심바": "lion cub",
    "니모": "clownfish",
    "도리": "blue fish",
    "몬스터주식회사": "friendly monsters",
    "설리": "blue furry monster",
    "마이크": "green one-eyed monster",
    "인크레더블": "superhero family",
    "카스": "animated cars",
    "카 영화": "animated cars movie",
    "mcqueen": "racing car",
    "맥퀸": "racing car",
    "피노키오": "wooden puppet boy",
    "덤보": "flying elephant",
    "밤비": "baby deer",
    "알라딘": "arabian prince",
    "자스민": "arabian princess",
    "피터팬": "flying boy",
    "팅커벨": "fairy character",
    "101 dalmatians": "spotted puppies",
    "101마리": "spotted puppies",
    "달마시안": "dalmatian dogs",
    "무파사": "lion king",
    "스카": "lion villain",
    "레미": "cooking rat",
    "라따뚜이": "cooking rat",
    "월-e": "robot character",
    "wall-e": "robot character",
    "업 영화": "balloon house adventure",
    "픽사 업": "balloon house adventure",
    "코코": "day of the dead celebration",
    "인사이드아웃": "emotion characters",
    "소울": "soul journey",
    "루카": "sea monster boy",
    "엔칸토": "magical family",

    # Pixar
    "픽사": "animated studio style",
    "pixar": "animated studio style",

    # Universal/Illumination
    "미니언즈": "small yellow characters",
    "minions": "small yellow characters",
    "슈퍼배드": "villain and sidekicks",
    "드래곤길들이기": "dragon rider adventure",
    "히큽": "viking boy",
    "트롤": "colorful troll characters",
    "싱": "singing animal show",
    "슈렉": "green ogre",
    "shrek": "green ogre",
    "피오나": "princess ogre",
    "동키": "talking donkey",
    "장화신은고양이": "swashbuckling cat",

    # Warner Bros/DC
    "해리포터": "wizard student",
    "harry potter": "wizard student",
    "호그와트": "magic school castle",
    "hogwarts": "magic school castle",
    "배트맨": "dark knight hero",
    "batman": "dark knight hero",
    "슈퍼맨": "flying superhero",
    "superman": "flying superhero",
    "원더우먼": "amazon warrior princess",
    "wonder woman": "amazon warrior princess",
    "조커": "clown villain",
    "joker": "clown villain",
    "톰과제리": "cat and mouse chase",
    "tom and jerry": "cat and mouse chase",
    "루니툰": "classic cartoon characters",
    "looney tunes": "classic cartoon characters",
    "벅스버니": "clever rabbit",
    "bugs bunny": "clever rabbit",
    "트위티": "small yellow bird",
    "tweety": "small yellow bird",

    # Marvel
    "마블": "superhero universe",
    "marvel": "superhero universe",
    "아이언맨": "armored tech hero",
    "iron man": "armored tech hero",
    "스파이더맨": "web-slinging hero",
    "spider-man": "web-slinging hero",
    "토르": "thunder god hero",
    "thor": "thunder god hero",
    "캡틴아메리카": "shield-wielding hero",
    "captain america": "shield-wielding hero",
    "헐크": "green muscle hero",
    "hulk": "green muscle hero",
    "블랙팬서": "panther suit hero",
    "black panther": "panther suit hero",
    "어벤져스": "superhero team",
    "avengers": "superhero team",
    "타노스": "cosmic villain",
    "thanos": "cosmic villain",
    "로키": "trickster villain",
    "loki": "trickster villain",
    "가디언즈": "space hero team",
    "guardians": "space hero team",
    "그루트": "tree creature",
    "groot": "tree creature",
    "로켓": "raccoon character",
    "rocket": "raccoon character",
    "스타로드": "space adventurer",
    "star-lord": "space adventurer",
    "블랙위도우": "spy hero",
    "black widow": "spy hero",
    "호크아이": "archer hero",
    "hawkeye": "archer hero",
    "스칼렛위치": "magic hero",
    "scarlet witch": "magic hero",
    "비전": "android hero",
    "앤트맨": "shrinking hero",
    "ant-man": "shrinking hero",
    "닥터스트레인지": "sorcerer hero",
    "doctor strange": "sorcerer hero",

    # Nintendo
    "마리오": "plumber video game character",
    "mario": "plumber video game character",
    "루이지": "green plumber character",
    "luigi": "green plumber character",
    "피카츄": "yellow electric mouse",
    "pikachu": "yellow electric mouse",
    "포켓몬": "pocket monsters",
    "pokemon": "pocket monsters",
    "젤다": "adventure game princess",
    "zelda": "adventure game princess",
    "링크": "adventure game hero",
    "커비": "pink puffball character",
    "kirby": "pink puffball character",
    "동물의숲": "cute animal village",
    "animal crossing": "cute animal village",

    # Studio Ghibli
    "지브리": "japanese animation style",
    "ghibli": "japanese animation style",
    "토토로": "forest spirit creature",
    "totoro": "forest spirit creature",
    "치히로": "spirited away girl",
    "하울": "wizard character",
    "소피": "cursed girl",
    "가오나시": "masked spirit",
    "no-face": "masked spirit",
    "포뇨": "fish girl",
    "ponyo": "fish girl",
    "나우시카": "warrior princess",
    "나시카": "warrior princess",
    "모노노케": "forest princess",

    # Sanrio
    "헬로키티": "cute cat character",
    "hello kitty": "cute cat character",
    "키티": "cute cat",
    "마이멜로디": "cute bunny character",
    "시나모롤": "cute puppy character",
    "폼폼푸린": "cute pudding dog",
    "쿠로미": "cute black bunny",

    # 테마파크 관련 (저작권이 아닌 실제 장소)
    "디즈니랜드": "theme park",
    "disneyland": "theme park",
    "디즈니월드": "theme park resort",
    "disney world": "theme park resort",
    "유니버셜스튜디오": "movie theme park",
    "universal studios": "movie theme park",
    "레고랜드": "block theme park",
    "legoland": "block theme park",
}


def filter_copyrighted_content(text: str) -> tuple[str, list[str]]:
    """저작권 콘텐츠를 필터링하고 대체어로 변환합니다.

    Args:
        text: 원본 텍스트

    Returns:
        (필터링된 텍스트, 필터링된 키워드 리스트)
    """
    if not text:
        return text, []

    filtered_text = text.lower()
    original_text = text
    filtered_keywords = []

    for keyword, replacement in COPYRIGHTED_KEYWORDS.items():
        keyword_lower = keyword.lower()
        if keyword_lower in filtered_text:
            filtered_keywords.append(keyword)
            # 대소문자 무시하고 모두 대체
            import re
            pattern = re.compile(re.escape(keyword), re.IGNORECASE)
            original_text = pattern.sub(replacement, original_text)
            filtered_text = original_text.lower()

    return original_text, filtered_keywords


async def translate_to_english(text: str, gemini_provider: GeminiLLMProvider) -> str:
    """한국어 텍스트를 영어로 번역합니다.

    Args:
        text: 번역할 텍스트 (한국어 또는 혼합)
        gemini_provider: Gemini LLM Provider 인스턴스

    Returns:
        영어로 번역된 텍스트
    """
    if not text or not text.strip():
        return text

    # 이미 영어인지 간단히 체크 (한글 문자가 없으면 그대로 반환)
    import re
    if not re.search(r'[가-힣]', text):
        return text

    try:
        params = LLMGenerationParams(
            prompt=f"Translate to English: {text}",
            system_prompt=TRANSLATION_SYSTEM_PROMPT,
            temperature=0.3,  # 번역은 낮은 temperature로
            response_format="text"
        )

        result = await gemini_provider.generate(params)

        if result.success and result.content:
            translated = result.content.strip()
            # 불필요한 따옴표 제거
            if translated.startswith('"') and translated.endswith('"'):
                translated = translated[1:-1]
            return translated
        else:
            logger.warning(f"Translation failed, using original: {text[:50]}...")
            return text
    except Exception as e:
        logger.warning(f"Translation error: {e}, using original text")
        return text


async def translate_request_fields(request: GenerateRequest, gemini_provider: GeminiLLMProvider) -> dict:
    """GenerateRequest의 한국어 필드들을 영어로 번역합니다.

    Returns:
        번역된 필드들을 담은 딕셔너리
    """
    # 번역이 필요한 필드들 수집
    fields_to_translate = {}

    # destination
    if request.destination:
        fields_to_translate['destination'] = request.destination

    # additionalPrompt (사용자 입력 장면 설명)
    if request.additionalPrompt:
        fields_to_translate['additionalPrompt'] = request.additionalPrompt

    # outfitStyle
    if request.outfitStyle:
        fields_to_translate['outfitStyle'] = request.outfitStyle

    # chatContext 필드들
    if request.chatContext:
        if request.chatContext.city:
            fields_to_translate['city'] = request.chatContext.city
        if request.chatContext.spotName:
            fields_to_translate['spotName'] = request.chatContext.spotName
        if request.chatContext.mainAction:
            fields_to_translate['mainAction'] = request.chatContext.mainAction
        if request.chatContext.outfitStyle:
            fields_to_translate['chatOutfitStyle'] = request.chatContext.outfitStyle
        if request.chatContext.posePreference:
            fields_to_translate['posePreference'] = request.chatContext.posePreference

    # 한국어가 포함된 필드만 번역
    import re
    korean_fields = {k: v for k, v in fields_to_translate.items() if re.search(r'[가-힣]', v)}

    if not korean_fields:
        return {}  # 번역할 것 없음

    # 모든 필드를 하나의 프롬프트로 합쳐서 번역 (API 호출 최소화)
    combined_text = "\n".join([f"[{k}]: {v}" for k, v in korean_fields.items()])

    try:
        params = LLMGenerationParams(
            prompt=f"""Translate each labeled Korean text to English. Keep the labels and format.

{combined_text}

Return in the same format with English translations.""",
            system_prompt=TRANSLATION_SYSTEM_PROMPT,
            temperature=0.3,
            response_format="text"
        )

        result = await gemini_provider.generate(params)

        if result.success and result.content:
            # 응답 파싱
            translated = {}
            for line in result.content.strip().split('\n'):
                line = line.strip()
                if line.startswith('[') and ']: ' in line:
                    key_end = line.index(']')
                    key = line[1:key_end]
                    value = line[key_end + 3:].strip()
                    translated[key] = value

            logger.info(f"Translated {len(translated)} fields to English")
            return translated
        else:
            logger.warning("Batch translation failed")
            return {}
    except Exception as e:
        logger.warning(f"Batch translation error: {e}")
        return {}


def build_user_driven_prompt(request: GenerateRequest, translated_fields: dict = None) -> str:
    """사용자 입력과 대화 컨텍스트를 종합하여 프롬프트를 생성합니다.

    대화에서 수집한 정보(chatContext)와 사용자 입력(additionalPrompt)을
    모두 활용하여 풍부한 이미지를 생성합니다.

    Args:
        request: 이미지 생성 요청
        translated_fields: 번역된 필드들 (한국어 → 영어)
    """
    translated = translated_fields or {}

    # 1. 장소 정보 (번역된 값 우선)
    location = translated.get('destination', request.destination)

    # 2. 컨셉 분위기
    concept_vibe = CONCEPT_VIBES.get(request.concept, "atmospheric travel moment")

    # 3. 필름 렌더링 스타일
    film_style = FILM_RENDERING.get(request.filmType, request.filmStyleDescription)
    if not film_style:
        film_style = f"shot on {request.filmStock} film with characteristic analog tones"

    # 4. 의상 스타일 (번역된 값 우선)
    outfit = translated.get('outfitStyle', request.outfitStyle) if request.outfitStyle else "stylish travel outfit"

    # 5. 대화에서 수집한 컨텍스트 (chatContext)
    chat_context = request.chatContext

    # 전체 대화 요약(혹은 로그)
    conversation_summary = getattr(request, "conversationSummary", "") or ""

    # 기본값 설정 (번역된 값 우선)
    city = translated.get('city', '')
    spot_name = translated.get('spotName', '')
    main_action = translated.get('mainAction', '')
    chat_outfit = translated.get('chatOutfitStyle', '')
    pose_detail = translated.get('posePreference', '')
    film_type = ""
    camera_model = ""

    if chat_context:
        if not city:
            city = chat_context.city or ""
        if not spot_name:
            spot_name = chat_context.spotName or ""
        if not main_action:
            main_action = chat_context.mainAction or ""
        if not chat_outfit:
            chat_outfit = chat_context.outfitStyle or ""
        if not pose_detail:
            pose_detail = chat_context.posePreference or ""
        film_type = chat_context.filmType or ""
        camera_model = chat_context.cameraModel or ""

    # 의상은 chatContext 우선
    final_outfit = chat_outfit if chat_outfit else outfit

    # 추가 프롬프트 (번역된 값 우선)
    user_scene = translated.get('additionalPrompt', request.additionalPrompt.strip() if request.additionalPrompt else "")
    if user_scene and main_action and user_scene != main_action:
        scene_description = f"{main_action}. {user_scene}"
    elif main_action:
        scene_description = main_action
    elif user_scene:
        scene_description = user_scene
    else:
        scene_description = ""

    if chat_context and (main_action or spot_name or pose_detail):
        location_detail = location
        if spot_name and spot_name.lower() not in location.lower():
            location_detail = f"{location}, specifically at {spot_name}"

        camera_aesthetic = (
            f"Shot with {camera_model}, capturing its characteristic rendering and feel"
            if camera_model else
            "Classic analog film camera aesthetic"
        )

        # 필름 정보: chatContext의 filmType을 우선 사용, 없으면 filmStock 사용
        if film_type and film_type != request.filmStock:
            film_detail = film_type
        elif film_type:
            film_detail = film_type
        else:
            film_detail = request.filmStock

        # 자연스러운 영어 프롬프트 (마커 없이)
        prompt = f"""A highly detailed cinematic travel photograph.

A person at {location_detail}, {scene_description if scene_description else 'enjoying a peaceful moment of travel'}.

The person is wearing {final_outfit}, {pose_detail if pose_detail else 'in a natural, candid pose'}. Their expression shows authentic, genuine emotion matching the moment. Realistic body proportions and natural positioning.

Photography style: {film_detail} film with {film_style}. {camera_aesthetic}. The mood is {concept_vibe}.

Technical details: Cinematic rule of thirds composition with thoughtful framing. Golden hour or soft natural light. Shallow depth of field with gentle bokeh on background. Authentic film grain characteristic of {request.filmStock}. Warm, nostalgic color tones typical of analog photography."""

    else:
        prompt = f"""A cinematic travel photograph at {location}.

A traveler enjoying a quiet moment at {location}, captured in a candid, natural way. Wearing {final_outfit}, in a natural, relaxed pose with an authentic travel moment expression.

Visual style: {film_style}. {concept_vibe}. Soft film grain with warm nostalgic tones. Shallow depth of field. Beautiful natural lighting. Cinematic framing."""

    if conversation_summary:
        prompt += f"""

Additional design notes from user conversation - respect these preferences:
{conversation_summary}"""

    return prompt


app = FastAPI(
    title="Trip Kit Image Generation API",
    description="사용자 입력 기반 여행 이미지 생성 API",
    version="2.1.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {"status": "ok", "service": "Trip Kit Image Generation API", "version": "2.1.0"}


@app.get("/health")
async def health_check():
    """헬스 체크"""
    provider = os.getenv("IMAGE_PROVIDER", "gemini")
    return {
        "status": "healthy",
        "provider": provider,
        "models": {
            "text": DEFAULT_TEXT_MODEL,
            "chat": CHAT_MODEL,
            "image": DEFAULT_IMAGE_MODEL,
        }
    }


@app.post("/generate", response_model=GenerateResponse)
async def generate_image(request: GenerateRequest):
    """이미지 생성 엔드포인트

    사용자 입력(additionalPrompt)을 최우선으로 반영하여 이미지를 생성합니다.
    한국어는 자동으로 영어로 번역됩니다.
    저작권 콘텐츠는 자동으로 필터링됩니다.
    """
    try:
        logger.info(
            "Generate request received",
            destination=request.destination,
            concept=request.concept,
            filmType=request.filmType,
            user_scene=request.additionalPrompt[:100] if request.additionalPrompt else "None"
        )

        # 한국어 필드들을 영어로 번역
        translated_fields = await translate_request_fields(request, gemini_llm_provider)
        if translated_fields:
            logger.info(f"Translated fields: {list(translated_fields.keys())}")

        # 사용자 중심 프롬프트 생성 (번역된 값 전달)
        travel_prompt = build_user_driven_prompt(request, translated_fields)

        # 저작권 콘텐츠 필터링
        filtered_prompt, filtered_keywords = filter_copyrighted_content(travel_prompt)

        if filtered_keywords:
            logger.info(
                "Copyrighted content filtered",
                filtered_keywords=filtered_keywords,
                original_length=len(travel_prompt),
                filtered_length=len(filtered_prompt)
            )

        logger.info(f"Built prompt (first 200 chars): {filtered_prompt[:200]}...")

        # 키워드 추출
        keywords = [
            request.destination,
            request.concept,
            request.filmType,
            request.filmStock,
        ]
        if request.additionalPrompt:
            # 사용자 입력에서 주요 단어 추출 (간단히)
            user_words = request.additionalPrompt.split()[:5]
            keywords.extend(user_words)
        keywords = [k for k in keywords if k]

        # Provider 가져오기
        provider = get_provider("gemini", model=DEFAULT_IMAGE_MODEL)
        logger.info(f"Using provider: {provider.provider_name}, model: {DEFAULT_IMAGE_MODEL}")

        # 이미지 생성 파라미터 (필터링된 프롬프트 사용)
        params = ImageGenerationParams(
            prompt=filtered_prompt,
            size="1024x1024",
            quality="standard",
            style="natural"
        )

        # 이미지 생성
        result = await provider.generate(params)

        if result.success:
            logger.info("Image generated successfully")

            metadata = {
                "concept": request.concept,
                "filmStock": request.filmStock,
                "filmType": request.filmType,
                "destination": request.destination,
                "userScene": request.additionalPrompt,
                "provider": result.provider,
                "model": DEFAULT_IMAGE_MODEL,
                "revised_prompt": result.revised_prompt,
            }

            # 필터링된 키워드가 있으면 메타데이터에 추가
            if filtered_keywords:
                metadata["filtered_copyrighted_content"] = filtered_keywords

            return GenerateResponse(
                status="success",
                imageUrl=result.url,
                optimizedPrompt=filtered_prompt,
                extractedKeywords=keywords,
                poseUsed=request.additionalPrompt if request.additionalPrompt else "auto-generated",
                metadata=metadata
            )
        else:
            error_msg = result.error or "Unknown error"
            logger.error(f"Image generation failed: {error_msg}")

            # 사용자 친화적 에러 메시지 변환
            user_error = _convert_to_user_friendly_error(error_msg, filtered_keywords)

            return GenerateResponse(
                status="error",
                error=user_error
            )

    except Exception as e:
        logger.error(f"Generate error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


def _convert_to_user_friendly_error(error_msg: str, filtered_keywords: list[str]) -> str:
    """기술적 에러 메시지를 사용자 친화적 메시지로 변환합니다."""
    error_lower = error_msg.lower()

    # Rate limit / Quota exceeded
    if "429" in error_msg or "resource_exhausted" in error_lower or "quota" in error_lower:
        return "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요."

    # Content policy / Safety filter
    if "결과가 비어있습니다" in error_msg or "empty" in error_lower:
        if filtered_keywords:
            return f"요청하신 내용({', '.join(filtered_keywords[:3])})은 저작권 문제로 생성할 수 없습니다. 다른 내용으로 시도해 주세요."
        return "요청하신 이미지를 생성할 수 없습니다. 다른 내용으로 시도해 주세요."

    # Safety/content policy explicit
    if "safety" in error_lower or "content_policy" in error_lower or "blocked" in error_lower:
        return "요청하신 이미지를 생성할 수 없습니다. 다른 내용으로 시도해 주세요."

    # Authentication
    if "401" in error_msg or "unauthorized" in error_lower or "invalid" in error_lower:
        return "이미지 생성 서비스 연결에 실패했습니다. 잠시 후 다시 시도해 주세요."

    # Network errors
    if "connection" in error_lower or "timeout" in error_lower or "network" in error_lower:
        return "서버 연결에 실패했습니다. 잠시 후 다시 시도해 주세요."

    # Default
    return "이미지 생성 중 오류가 발생했습니다. 다시 시도해 주세요."


@app.post("/recommendations/destinations", response_model=RecommendationResponse)
async def get_destination_recommendations(request: RecommendationRequest):
    """여행지 추천 엔드포인트"""
    try:
        logger.info(
            f"Recommendations request: mood={request.preferences.mood}, concept={request.concept}"
        )

        input_data = {
            "preferences": {
                "mood": request.preferences.mood,
                "aesthetic": request.preferences.aesthetic,
                "duration": request.preferences.duration,
                "interests": request.preferences.interests,
            },
            "concept": request.concept,
            "travel_scene": request.travelScene,
            "travel_destination": request.travelDestination,
        }

        result = await recommendation_agent.recommend(input_data)

        logger.info(f"Recommendations generated: {len(result['destinations'])} destinations")

        return RecommendationResponse(
            status=result["status"],
            destinations=result["destinations"],
            userProfile=result.get("user_profile"),
            isFallback=result.get("is_fallback", False),
        )

    except Exception as e:
        logger.error(f"Recommendations error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Gemini 기반 챗봇 대화 엔드포인트"""
    try:
        logger.info(
            f"Chat request: message={request.message[:50]}..., step={request.currentStep}"
        )

        # 대화 히스토리 구성
        conversation_context = ""
        if request.conversationHistory:
            for msg in request.conversationHistory[-10:]:  # 최근 10개 메시지만
                role_name = "사용자" if msg.role == "user" else "어시스턴트"
                conversation_context += f"{role_name}: {msg.content}\n"

        # 현재 수집된 데이터 컨텍스트 (null이 아닌 값만 강조)
        collected_info = ""
        if request.collectedData:
            # null이 아닌 값들을 추출해서 강조
            confirmed_data = {k: v for k, v in request.collectedData.items() if v is not None}
            if confirmed_data:
                collected_info = f"\n✅ 이미 확정된 정보 (반드시 유지하세요!):\n{json.dumps(confirmed_data, ensure_ascii=False, indent=2)}"
            collected_info += f"\n\n전체 collectedData 상태:\n{json.dumps(request.collectedData, ensure_ascii=False, indent=2)}"

        # 거부된 항목 컨텍스트
        rejected_info = ""
        if request.rejectedItems:
            rejected_dict = request.rejectedItems.model_dump()
            # 빈 리스트가 아닌 항목만 포함
            non_empty_rejected = {k: v for k, v in rejected_dict.items() if v}
            if non_empty_rejected:
                rejected_info = f"\n\n🚨 사용자가 이전에 거부한 항목들 (절대 다시 추천하지 마세요!):\n{json.dumps(non_empty_rejected, ensure_ascii=False, indent=2)}"

        # 프롬프트 구성
        user_prompt = f"""현재 단계: {request.currentStep}
{collected_info}{rejected_info}

대화 히스토리:
{conversation_context}

사용자의 새 메시지: {request.message}

위 정보를 바탕으로 적절한 응답을 JSON 형식으로 제공해주세요.
⚠️ 중요:
1. 이미 확정된 정보(✅)는 반드시 collectedData에 그대로 포함하세요
2. 거부된 항목(🚨)은 절대 다시 추천하지 마세요
3. 부정/거절 표현은 해당 필드에 저장하지 말고 새로운 추천을 하세요"""

        # Gemini 호출
        params = LLMGenerationParams(
            prompt=user_prompt,
            system_prompt=CHATBOT_SYSTEM_PROMPT,
            temperature=0.7,
            response_format="json"
        )

        result = await gemini_llm_provider.generate(params)

        if not result.success:
            logger.error(f"Gemini chat failed: {result.error}")
            return ChatResponse(
                reply="죄송해요, 잠시 문제가 생겼어요. 다시 말씀해주시겠어요? 🙏",
                currentStep=request.currentStep,
                nextStep=request.currentStep,
                isComplete=False,
                rejectedItems=request.rejectedItems,
                error=result.error
            )

        # JSON 파싱
        try:
            response_data = json.loads(result.content)
        except json.JSONDecodeError:
            # JSON 파싱 실패 시 텍스트 응답 그대로 반환
            logger.warning("Failed to parse JSON response, using raw text")
            return ChatResponse(
                reply=result.content,
                currentStep=request.currentStep,
                nextStep=request.currentStep,
                isComplete=False,
                rejectedItems=request.rejectedItems
            )

        logger.info(f"Chat response: step={response_data.get('nextStep', request.currentStep)}")

        # 수집된 데이터 처리: 기존 데이터 보존하면서 새 데이터 병합
        merged_collected = None
        response_collected = response_data.get("collectedData")

        if request.collectedData or response_collected:
            # 기존 수집 데이터
            existing_collected = request.collectedData if request.collectedData else {
                "city": None, "spotName": None, "mainAction": None, "conceptId": None,
                "outfitStyle": None, "posePreference": None, "filmType": None, "cameraModel": None
            }

            # 새로운 데이터 병합 (기존 값 보존, null이 아닌 새 값만 업데이트)
            if response_collected:
                for key in existing_collected:
                    new_value = response_collected.get(key)
                    # 새 값이 있고, null이 아니면 업데이트
                    if new_value is not None:
                        existing_collected[key] = new_value
                    # 기존 값이 있으면 그대로 유지 (새 값이 null이어도)

            merged_collected = existing_collected

        # 거부된 항목 처리: 기존 거부 항목과 새로 거부된 항목 병합
        merged_rejected = None
        response_rejected = response_data.get("rejectedItems")

        if request.rejectedItems or response_rejected:
            # 기존 거부 항목
            existing = request.rejectedItems.model_dump() if request.rejectedItems else {
                "cities": [], "spots": [], "actions": [], "concepts": [],
                "outfits": [], "poses": [], "films": [], "cameras": []
            }

            # 새로운 거부 항목 병합
            if response_rejected:
                for key in existing:
                    if key in response_rejected and response_rejected[key]:
                        # 중복 제거하면서 병합
                        existing[key] = list(set(existing[key] + response_rejected[key]))

            merged_rejected = RejectedItems(**existing)

        return ChatResponse(
            reply=response_data.get("reply", "무슨 말씀인지 잘 이해하지 못했어요. 다시 말씀해주시겠어요?"),
            currentStep=response_data.get("currentStep", request.currentStep),
            nextStep=response_data.get("nextStep", request.currentStep),
            isComplete=response_data.get("isComplete", False),
            collectedData=merged_collected,
            rejectedItems=merged_rejected
        )

    except Exception as e:
        logger.error(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
