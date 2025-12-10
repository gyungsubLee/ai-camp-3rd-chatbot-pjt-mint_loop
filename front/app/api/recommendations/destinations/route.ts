import { NextRequest, NextResponse } from 'next/server';
import type { UserPreferences, Concept } from '@/lib/types';

// Python 백엔드 API 서버 URL
const AGENT_API_URL = process.env.AGENT_API_URL || 'http://localhost:8000';

interface ImageGenerationContext {
  destination: string;
  additionalPrompt: string;
  filmStock: string;
  outfitStyle: string;
}

interface RecommendationRequest {
  preferences: UserPreferences;
  concept?: Concept;
  travelScene?: string;
  travelDestination?: string;
  imageGenerationContext?: ImageGenerationContext | null;
}

export async function POST(request: NextRequest) {
  try {
    const body: RecommendationRequest = await request.json();

    console.log('[Destinations API] Forwarding to backend:', {
      mood: body.preferences.mood,
      concept: body.concept,
      hasImageContext: !!body.imageGenerationContext,
      imageDestination: body.imageGenerationContext?.destination,
    });

    // Python 백엔드 API 호출
    const response = await fetch(`${AGENT_API_URL}/recommendations/destinations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || data.error || 'Backend API call failed');
    }

    console.log('[Destinations API] Received', data.destinations?.length || 0, 'recommendations');

    return NextResponse.json(data);
  } catch (error) {
    console.error('[Destinations API] Error:', error);

    // 사용자 친화적 에러 메시지
    const rawMessage = error instanceof Error ? error.message : '';
    let userMessage = '여행지 추천 중 오류가 발생했습니다.';

    if (rawMessage.includes('ECONNREFUSED') || rawMessage.includes('fetch failed')) {
      userMessage = '추천 서비스에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.';
    }

    return NextResponse.json(
      {
        status: 'error',
        error: 'RECOMMENDATION_FAILED',
        message: userMessage,
      },
      { status: 500 }
    );
  }
}
