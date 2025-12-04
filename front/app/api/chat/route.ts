import { NextRequest, NextResponse } from 'next/server';

// Mock conversation processing
// In production, this would use LangGraph and OpenAI
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, message, currentStep, preferences } = body;

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Process based on current step
    let reply = '';
    let nextStep = currentStep;
    let isComplete = false;
    let recommendations = null;

    switch (currentStep) {
      case 'init':
        reply = `안녕하세요! 👋 저는 Trip Kit의 Vibe 큐레이터예요.

당신만의 특별한 여행 감성을 찾아드릴게요.

먼저, **어떤 분위기의 여행**을 꿈꾸고 계신가요?`;
        nextStep = 'mood';
        break;

      case 'mood':
        reply = `**${message}** 분위기, 정말 멋진 선택이에요! ✨

그럼 이제 **시각적인 스타일**에 대해 이야기해볼까요?

도시의 거리와 카페가 좋으신가요, 아니면 자연 속 풍경이 더 끌리시나요?`;
        nextStep = 'aesthetic';
        break;

      case 'aesthetic':
        reply = `${message} 스타일, 완벽해요! 📸

이제 **여행 기간**이 궁금해요. 얼마나 시간을 내실 수 있으신가요?`;
        nextStep = 'duration';
        break;

      case 'duration':
        reply = `좋아요! 🗓️

마지막으로, **특별히 관심 있는 분야**가 있나요?

사진 촬영, 맛집 탐방, 예술/문화, 역사 탐방 중에서 골라주세요.`;
        nextStep = 'interests';
        break;

      case 'interests':
        reply = `완벽해요! 🎉

당신의 여행 Vibe 프로필이 완성되었어요!

이제 당신에게 딱 맞는 **숨겨진 여행지**를 찾아볼게요! ✈️`;
        nextStep = 'complete';
        isComplete = true;
        recommendations = [
          {
            id: 'dest_1',
            name: 'Cinque Terre 히든 트레일',
            city: 'Cinque Terre',
            country: 'Italy',
            description: '숨겨진 하이킹 코스',
            matchReason: '필름 사진에 완벽합니다',
            bestTimeToVisit: '4월 말 - 6월 초',
            photographyScore: 9,
            transportAccessibility: 'moderate',
            safetyRating: 9,
          },
        ];
        break;

      default:
        reply = '계속해서 이야기해주세요!';
    }

    return NextResponse.json({
      reply,
      nextStep,
      isComplete,
      recommendations,
      sessionId,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'CHAT_ERROR', message: 'Failed to process message' },
      { status: 500 }
    );
  }
}
