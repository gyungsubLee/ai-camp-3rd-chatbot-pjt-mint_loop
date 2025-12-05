import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import type { Destination, UserPreferences, Concept, Activity } from '@/lib/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface RecommendationRequest {
  preferences: UserPreferences;
  concept?: Concept;
  travelScene?: string;
  travelDestination?: string;
}

// 컨셉별 분위기 키워드
const CONCEPT_VIBES: Record<Concept, string> = {
  flaneur: '도시 산책자, 문학적 감성, 카페 문화, 예술가의 영혼, 보헤미안',
  filmlog: '필름 카메라, 빈티지, 노스탤지어, 아날로그 감성, 따뜻한 추억',
  midnight: '밤의 예술, 재즈, 1920년대, 보헤미안 밤문화, 신비로운 분위기',
};

// 무드별 키워드
const MOOD_KEYWORDS: Record<string, string> = {
  romantic: '로맨틱, 사랑스러운, 감성적인 골목, 석양, 와인',
  adventurous: '모험, 탐험, 숨겨진 길, 현지인만 아는, 발견의 기쁨',
  nostalgic: '향수, 옛 추억, 빈티지, 시간여행, 과거의 아름다움',
  peaceful: '평화로운, 고요한, 명상적, 자연, 힐링',
};

export async function POST(request: NextRequest) {
  try {
    const body: RecommendationRequest = await request.json();
    const { preferences, concept, travelScene, travelDestination } = body;

    console.log('[Destinations API] Generating recommendations for:', {
      mood: preferences.mood,
      aesthetic: preferences.aesthetic,
      concept,
      travelScene: travelScene?.slice(0, 50),
    });

    // GPT에게 보낼 프롬프트 구성
    const conceptVibe = concept ? CONCEPT_VIBES[concept] : '';
    const moodKeyword = preferences.mood ? MOOD_KEYWORDS[preferences.mood] : '';
    const interestsStr = preferences.interests?.join(', ') || '';

    const systemPrompt = `당신은 Trip Kit의 AI 여행 큐레이터입니다. 사용자의 감성과 취향을 깊이 이해하고, 관광객들이 모르는 "진짜 현지 감성"을 가진 숨겨진 명소를 추천합니다.

핵심 원칙:
1. 과도하게 유명하거나 관광스러운 장소는 절대 추천하지 않습니다
2. 현지인들이 사랑하는 숨겨진 로컬 스폿 중심으로 추천합니다
3. 인생샷을 남길 수 있는 포토제닉한 장소를 우선합니다
4. 각 장소에서 할 수 있는 특별한 경험/액티비티를 함께 제안합니다
5. "여행은 단순히 가는 것이 아니라 기록을 만드는 경험"이라는 철학을 담습니다

예시:
- 크리스마스 분위기 → 핀란드 로바니에미 산타마을 (허스키 썰매, 순록 썰매, 공식 산타 만나기)
- 중세 시대 여행 → 프랑스 고르드 (라벤더 향기, 돌담길 산책, 석양 속 마을 전경)
- 영화 속 장면 → 체코 체스키크룸로프 (중세 거리, 성 탑에서 바라보는 전경)`;

    const userPrompt = `사용자 프로필:
- 무드: ${preferences.mood || '감성적인'} (${moodKeyword})
- 미학적 취향: ${preferences.aesthetic || '빈티지'}
- 관심사: ${interestsStr || '사진, 예술'}
- 선택한 컨셉: ${concept || 'filmlog'} (${conceptVibe})
- 꿈꾸는 여행 장면: ${travelScene || '특별한 순간을 기록하는 여행'}
${travelDestination ? `- 관심 있는 지역: ${travelDestination}` : ''}

위 프로필을 바탕으로, 이 사용자에게 완벽하게 맞는 숨겨진 여행지 3곳을 추천해주세요.

다음 JSON 형식으로 응답해주세요:
{
  "destinations": [
    {
      "id": "dest_1",
      "name": "장소 이름 (특별한 수식어 포함)",
      "city": "도시명",
      "country": "국가명",
      "description": "이 장소의 특별한 매력을 감성적으로 설명 (3-4문장)",
      "matchReason": "사용자의 취향에 맞는 구체적인 이유 (2-3문장)",
      "localVibe": "현지 분위기를 한 문장으로",
      "whyHidden": "왜 숨겨진 명소인지 설명",
      "bestTimeToVisit": "추천 방문 시기와 이유",
      "photographyScore": 8-10,
      "transportAccessibility": "easy|moderate|challenging",
      "safetyRating": 7-10,
      "estimatedBudget": "$|$$|$$$",
      "tags": ["관련 태그 3-5개"],
      "photographyTips": ["사진 촬영 팁 2-3개"],
      "storyPrompt": "이 장소에서 만들 수 있는 나만의 스토리 제안",
      "activities": [
        {
          "name": "액티비티명",
          "description": "경험 설명",
          "duration": "소요 시간",
          "bestTime": "추천 시간대",
          "localTip": "현지인 팁",
          "photoOpportunity": "포토 스팟 설명"
        }
      ]
    }
  ]
}

각 장소마다 2-3개의 특별한 액티비티를 포함해주세요. 액티비티는 관광객보다 현지인처럼 즐길 수 있는 경험 위주로 추천해주세요.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.8,
      response_format: { type: 'json_object' },
    });

    const responseContent = completion.choices[0].message.content;
    if (!responseContent) {
      throw new Error('No response from OpenAI');
    }

    const parsedResponse = JSON.parse(responseContent);
    const destinations: Destination[] = parsedResponse.destinations;

    console.log('[Destinations API] Generated', destinations.length, 'recommendations');

    return NextResponse.json({
      status: 'success',
      destinations,
      userProfile: {
        mood: preferences.mood,
        aesthetic: preferences.aesthetic,
        concept,
        travelScene,
      },
    });
  } catch (error) {
    console.error('[Destinations API] Error:', error);

    // 에러 시 폴백 데이터 반환
    return NextResponse.json({
      status: 'success',
      destinations: getFallbackDestinations(),
      isFallback: true,
    });
  }
}

// 폴백 데이터
function getFallbackDestinations(): Destination[] {
  return [
    {
      id: 'dest_fallback_1',
      name: '핀란드 로바니에미 산타마을의 순백 겨울',
      city: '로바니에미',
      country: '핀란드',
      description:
        '북극선 위에 위치한 진짜 산타의 고향. 눈 덮인 숲 사이로 허스키들이 달리고, 오로라가 하늘을 수놓는 마법 같은 겨울 왕국입니다. 관광객 북적이는 곳이 아닌, 현지인들이 사랑하는 조용한 오두막에서 진정한 핀란드 겨울을 경험해보세요.',
      matchReason:
        '동화 속 크리스마스를 꿈꾸셨다면, 이곳만큼 완벽한 곳은 없습니다. 필름 카메라로 담으면 마치 빈티지 크리스마스 카드 같은 사진이 나옵니다.',
      localVibe: '눈 내리는 고요 속 따뜻한 핫초코 한 잔의 여유',
      whyHidden: '대부분 관광객은 산타마을만 방문하지만, 진짜 매력은 주변 숲속 오두막과 현지인 카페에 있습니다',
      bestTimeToVisit: '12월 중순 - 1월 (오로라 시즌, 눈이 가장 풍성할 때)',
      photographyScore: 10,
      transportAccessibility: 'moderate',
      safetyRating: 10,
      estimatedBudget: '$$$',
      tags: ['winter', 'aurora', 'snow', 'christmas', 'nature'],
      photographyTips: [
        '오로라 촬영 시 삼각대 필수, ISO 3200 이상 권장',
        '허스키 썰매 탈 때는 액션캠으로 동적인 장면 담기',
        '눈 덮인 숲에서 역광으로 촬영하면 몽환적인 분위기',
      ],
      storyPrompt: '오로라 아래서 소원을 빌며, 세상에서 가장 특별한 크리스마스를 보내다',
      activities: [
        {
          name: '허스키 썰매 어드벤처',
          description: '눈 덮인 북극 숲을 가로지르는 허스키 썰매 체험',
          duration: '2-3시간',
          bestTime: '오전 10시 (햇빛이 부드러울 때)',
          localTip: '썰매 끝나고 허스키들과 교감하는 시간이 진짜 하이라이트',
          photoOpportunity: '달리는 썰매 위에서 뒤돌아보며 촬영하면 드라마틱한 컷',
        },
        {
          name: '오로라 헌팅 투어',
          description: '빛 공해 없는 숲속에서 오로라를 기다리며',
          duration: '4-5시간',
          bestTime: '밤 10시 - 새벽 2시',
          localTip: '현지 가이드의 비밀 스팟은 관광객이 없어 훨씬 좋은 뷰',
          photoOpportunity: '눈 덮인 나무를 전경으로 오로라를 담으면 동화 같은 사진',
        },
        {
          name: '공식 산타 만남',
          description: '북극선에서 진짜 산타 할아버지와 이야기 나누기',
          duration: '30분-1시간',
          bestTime: '오전 (대기 시간이 짧음)',
          localTip: '산타에게 직접 편지 쓰면 답장이 온다는 전설이',
          photoOpportunity: '산타와 함께 벽난로 앞에서 빈티지 감성 사진',
        },
      ],
    },
    {
      id: 'dest_fallback_2',
      name: '프랑스 고르드, 중세로의 시간 여행',
      city: '고르드',
      country: '프랑스',
      description:
        '프로방스의 절벽 위에 매달린 듯한 중세 마을. 라벤더 향기가 퍼지는 골목길, 수백 년 된 돌담, 그리고 시간이 멈춘 듯한 고요함. 영화 "굿 이어"의 배경이 된 이곳에서 진짜 프로방스를 만나보세요.',
      matchReason:
        '빈티지와 역사를 사랑하신다면 고르드의 돌담길은 마치 타임머신 같을 거예요. 매 골목마다 필름 한 롤씩 소비하게 될 거예요.',
      localVibe: '라벤더 향기 속 중세 기사의 발자국을 따라 걷는 오후',
      whyHidden: '에펠탑이나 루브르에 가려져 있지만, 진짜 프랑스 감성은 여기에',
      bestTimeToVisit: '6월 말 - 7월 초 (라벤더 만개 시즌)',
      photographyScore: 10,
      transportAccessibility: 'challenging',
      safetyRating: 9,
      estimatedBudget: '$$',
      tags: ['medieval', 'provence', 'lavender', 'village', 'history'],
      photographyTips: [
        '일몰 시간에 마을 전경을 담으면 황금빛 돌담이 빛난다',
        '좁은 골목길은 와이드 렌즈보다 50mm가 더 분위기 있음',
        '라벤더 밭 + 마을 전경 조합은 새벽이 최고',
      ],
      storyPrompt: '중세 기사와 공주가 걸었을 돌담길을 거닐며, 나만의 로맨스를 꿈꾸다',
      activities: [
        {
          name: '석양의 마을 전경 감상',
          description: '뷰포인트에서 황금빛으로 물드는 마을 바라보기',
          duration: '1-2시간',
          bestTime: '해질녘',
          localTip: '마을 입구 주차장 위쪽이 관광객 모르는 베스트 뷰포인트',
          photoOpportunity: '석양빛에 물드는 돌담 마을 전경, 인생샷 보장',
        },
        {
          name: '라벤더 밭 새벽 산책',
          description: '관광객 없는 시간에 라벤더 향기에 취하기',
          duration: '2시간',
          bestTime: '새벽 5-7시',
          localTip: '세낭크 수도원 근처보다 현지인이 알려준 작은 밭이 더 좋아요',
          photoOpportunity: '아침 햇살 + 라벤더 = 몽환적인 필름 감성',
        },
        {
          name: '로컬 마르쉐 탐방',
          description: '화요일 아침 시장에서 현지인처럼 장보기',
          duration: '1-2시간',
          bestTime: '화요일 오전',
          localTip: '올리브 오일과 허브 소금은 꼭 사세요',
          photoOpportunity: '색색의 프로방스 허브와 과일이 가득한 노점',
        },
      ],
    },
    {
      id: 'dest_fallback_3',
      name: '일본 나오시마, 예술이 숨 쉬는 섬',
      city: '나오시마',
      country: '일본',
      description:
        '세토 내해의 작은 섬 전체가 하나의 미술관. 쿠사마 야요이의 호박, 안도 다다오의 건축, 그리고 바다와 예술이 하나 되는 곳. 미술관보다 더 미술관 같은 섬에서 감성 충전을.',
      matchReason:
        '예술과 자연의 조화를 사랑하신다면, 나오시마는 매 순간이 작품 같은 여행이 될 거예요. 어디서 찍어도 갤러리 사진이 나와요.',
      localVibe: '파도 소리와 함께 예술을 감상하는 느린 오후',
      whyHidden: '도쿄나 교토에 비해 접근성이 떨어져 외국인에겐 아직 숨겨진 보석',
      bestTimeToVisit: '4-5월 또는 10-11월 (쾌적한 날씨, 야외 전시 감상 최적)',
      photographyScore: 10,
      transportAccessibility: 'moderate',
      safetyRating: 10,
      estimatedBudget: '$$',
      tags: ['art', 'island', 'architecture', 'nature', 'contemporary'],
      photographyTips: [
        '노란 호박은 해질녘에 찍으면 더 따뜻한 색감',
        '치추 미술관의 빛은 오전 11시경이 가장 아름다워요',
        '자전거 타면서 섬 곳곳의 작품을 담아보세요',
      ],
      storyPrompt: '섬 전체가 캔버스인 곳에서, 나의 하루도 하나의 작품이 되다',
      activities: [
        {
          name: '자전거로 섬 일주',
          description: '바닷바람 맞으며 곳곳의 야외 예술작품 만나기',
          duration: '3-4시간',
          bestTime: '오전',
          localTip: '전동 자전거 추천, 언덕이 꽤 있어요',
          photoOpportunity: '바다와 예술작품이 함께 담기는 각도 찾기',
        },
        {
          name: '치추 미술관 명상',
          description: '안도 다다오 건축 속에서 모네의 수련 감상',
          duration: '2시간',
          bestTime: '오전 11시경 (빛이 가장 아름다움)',
          localTip: '사전 예약 필수, 관람 인원 제한으로 여유롭게 감상 가능',
          photoOpportunity: '내부 촬영 불가지만 건물 외관과 하늘 조합이 예술',
        },
        {
          name: '이우환 미술관 산책',
          description: '돌과 철, 그리고 여백의 미학 체험',
          duration: '1-2시간',
          bestTime: '오후 늦게',
          localTip: '작품 앞에서 10분 이상 앉아있으면 새로운 게 보여요',
          photoOpportunity: '미니멀한 작품과 자연이 어우러지는 순간',
        },
      ],
    },
  ];
}
