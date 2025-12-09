"""Response models for API endpoints."""
from typing import Optional
from pydantic import BaseModel

from .requests import RejectedItems


class GenerateResponse(BaseModel):
    """Image generation response."""
    status: str
    imageUrl: Optional[str] = None
    optimizedPrompt: Optional[str] = None
    extractedKeywords: list[str] = []
    poseUsed: Optional[str] = None
    metadata: Optional[dict] = None
    error: Optional[str] = None


class Activity(BaseModel):
    """Activity information."""
    name: str
    description: str
    duration: str
    bestTime: str
    localTip: str
    photoOpportunity: str


class Destination(BaseModel):
    """Destination information."""
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
    """Destination recommendation response."""
    status: str
    destinations: list[Destination]
    userProfile: Optional[dict] = None
    isFallback: bool = False


class ChatResponse(BaseModel):
    """Chat conversation response."""
    reply: str
    currentStep: str
    nextStep: str
    isComplete: bool = False
    collectedData: Optional[dict] = None
    rejectedItems: Optional[RejectedItems] = None
    suggestedOptions: list[str] = []
    sessionId: str = ""  # 세션 ID
    error: Optional[str] = None


class SessionHistoryResponse(BaseModel):
    """Session history response."""
    sessionId: str
    history: list[dict]
    currentStep: Optional[str] = None
    collectedData: Optional[dict] = None
    isComplete: bool = False
