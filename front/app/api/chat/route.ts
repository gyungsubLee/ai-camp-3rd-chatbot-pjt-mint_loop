import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

interface ChatMessage {
  role: string;
  content: string;
}

interface RejectedItems {
  cities: string[];
  spots: string[];
  actions: string[];
  concepts: string[];
  outfits: string[];
  poses: string[];
  films: string[];
  cameras: string[];
}

interface ChatRequestBody {
  message: string;
  conversationHistory?: ChatMessage[];
  currentStep?: string;
  collectedData?: Record<string, string | null>;
  rejectedItems?: RejectedItems;
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequestBody = await request.json();
    const {
      message,
      conversationHistory = [],
      currentStep = 'greeting',
      collectedData,
      rejectedItems,
    } = body;

    // 백엔드 Gemini 채팅 API 호출
    const response = await fetch(`${BACKEND_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        conversationHistory,
        currentStep,
        collectedData,
        rejectedItems,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend chat error:', errorText);
      throw new Error(`Backend error: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json({
      reply: data.reply,
      currentStep: data.currentStep,
      nextStep: data.nextStep,
      isComplete: data.isComplete,
      collectedData: data.collectedData,
      rejectedItems: data.rejectedItems,
    });
  } catch (error) {
    console.error('Chat API error:', error);

    // 백엔드 연결 실패 시 폴백 응답
    return NextResponse.json({
      reply: '죄송해요, 잠시 연결에 문제가 있어요. 다시 시도해주세요. 🙏',
      currentStep: 'greeting',
      nextStep: 'greeting',
      isComplete: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
