'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useVibeStore } from '@/lib/store/useVibeStore';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { ChatInput } from './ChatInput';
import { QuickReply } from './QuickReply';
import { ProgressBar } from './ProgressBar';
import type { TripKitStep, TripKitProfile, Concept } from '@/lib/types';

// ============================================
// 유효성 검사 함수들
// ============================================

function isValidCity(input: string): boolean {
  const trimmed = input.trim();
  if (trimmed.length < 2 || trimmed.length > 30) return false;
  if (/^\d+$/.test(trimmed)) return false;
  if (/^[^a-zA-Z가-힣]+$/.test(trimmed)) return false;
  const invalidPatterns = ['ㅋㅋ', 'ㅎㅎ', 'ㄴㄴ', ';;', '...', 'ㅇㅇ', 'ㄱㄱ', 'test', 'asdf'];
  if (invalidPatterns.some(p => trimmed.toLowerCase().includes(p))) return false;
  return true;
}

function isRecommendRequest(input: string): boolean {
  const patterns = ['추천', '아무데나', '모르겠', '골라줘', '알아서', '랜덤', '어디든', '다시', '다른거', '다른 거', '다른것', '다른 것', '다르게'];
  return patterns.some(p => input.includes(p));
}

// 긍정적 확인 감지
function isPositiveConfirmation(input: string): boolean {
  const positives = ['네', '응', '좋아', '좋아요', '좋아해', '마음에 들어', '마음에 들어요', '괜찮아', '괜찮아요',
                     '그거', '그거로', '그걸로', '오케이', 'ok', 'yes', '예', '어', '웅', '그래', '그래요', '할게', '할게요', '진행'];
  const trimmed = input.trim().toLowerCase();
  return positives.some(p => trimmed === p || trimmed.startsWith(p));
}

// 부정적 응답 감지 (다시 추천 요청)
function isNegativeOrReRecommend(input: string): boolean {
  const patterns = ['다시', '다른', '싫어', '별로', '아닌데', '아니', '다르게', '바꿔', '다른거', '다른 거', '다른것', '다른 것', '다시 추천', '다른 추천'];
  return patterns.some(p => input.includes(p));
}

function isValidSpot(input: string): boolean {
  const trimmed = input.trim();
  if (trimmed.length < 2 || trimmed.length > 50) return false;
  if (/^\d+$/.test(trimmed)) return false;
  const invalidPatterns = ['ㅋㅋ', 'ㅎㅎ', '몰라', 'test', 'asdf'];
  if (invalidPatterns.some(p => trimmed.toLowerCase().includes(p))) return false;
  return true;
}

function isValidAction(input: string): boolean {
  const trimmed = input.trim();
  if (trimmed.length < 3 || trimmed.length > 100) return false;
  const tooShort = ['네', '응', '좋아', '그냥', '아무거나', '몰라'];
  if (tooShort.includes(trimmed)) return false;
  return true;
}

function isValidOutfit(input: string): boolean {
  const trimmed = input.trim();
  if (trimmed.length < 2 || trimmed.length > 100) return false;
  const vague = ['예쁘게', '그냥', '편하게', '아무렇게나', '멋지게', '좋게', '이쁘게'];
  if (vague.some(v => trimmed === v || trimmed === v + '요')) return false;
  return true;
}

function isValidPose(input: string): boolean {
  const trimmed = input.trim();
  if (trimmed.length < 2 || trimmed.length > 100) return false;
  const vague = ['아무거나', '그냥', '알아서', '편하게'];
  if (vague.some(v => trimmed === v || trimmed === v + '요')) return false;
  return true;
}

// ============================================
// 추천 목록들
// ============================================
const RECOMMENDED_CITIES = [
  { city: '파리', reason: '센 강변의 로맨틱한 골목들이 기다리고 있어요' },
  { city: '교토', reason: '고즈넉한 골목과 은은한 불빛이 매력적이에요' },
  { city: '리스본', reason: '노란 트램과 언덕길의 빈티지한 감성이 가득해요' },
  { city: '제주도', reason: '바다와 오름이 만드는 평화로운 풍경이 있어요' },
  { city: '바르셀로나', reason: '가우디의 예술과 지중해 햇살이 어우러져요' },
  { city: '프라하', reason: '중세의 낭만이 살아 숨쉬는 골목들이 있어요' },
];

const RECOMMENDED_SPOTS: Record<string, string[]> = {
  '파리': ['몽마르트르 언덕의 작은 카페', '센강변 산책로', '마레 지구 골목길', '튈르리 정원 벤치'],
  '도쿄': ['시모키타자와 빈티지 골목', '메구로 강변', '야나카 긴자 상점가', '다이칸야마 츠타야 서점'],
  '교토': ['기온 거리의 찻집', '철학의 길', '아라시야마 대나무 숲', '니넨자카 돌계단'],
  '제주도': ['협재 해변', '월정리 카페거리', '사려니숲길', '성산일출봉 들판'],
  '리스본': ['알파마 지구 전망대', '벨렘 타워 해변', '바이샤 거리', 'LX 팩토리'],
  '바르셀로나': ['보른 지구 골목', '바르셀로네타 해변', '그라시아 거리', '몬주익 언덕'],
  '프라하': ['카를교 위', '말라스트라나 광장', '레트나 공원', '옛 시가지 골목'],
  'default': ['현지인들이 사랑하는 작은 카페', '조용한 골목길', '해질녘 전망 포인트', '숨겨진 정원'],
};

const RECOMMENDED_ACTIONS = [
  { action: '창가에 앉아 커피 한 잔 마시며 거리 구경하기', vibe: '여유로운 오후의 감성' },
  { action: '골목길을 천천히 걸으며 사진 찍기', vibe: '탐험하는 여행자의 순간' },
  { action: '노을을 바라보며 벤치에 앉아 쉬기', vibe: '하루를 마무리하는 평화로운 시간' },
  { action: '현지 카페에서 책 읽기', vibe: '조용한 혼자만의 시간' },
  { action: '거리 공연을 감상하며 서있기', vibe: '우연한 만남의 순간' },
];

const RECOMMENDED_OUTFITS = [
  { outfit: '베이지 트렌치코트 + 화이트 티셔츠', style: '클래식하고 세련된' },
  { outfit: '화이트 린넨 셔츠 + 청바지', style: '편안하면서도 멋스러운' },
  { outfit: '블랙 터틀넥 + 와이드 슬랙스', style: '시크하고 모던한' },
  { outfit: '크림색 니트 + 롱스커트', style: '부드럽고 로맨틱한' },
  { outfit: '데님 재킷 + 흰색 원피스', style: '캐주얼하면서 사랑스러운' },
];

const RECOMMENDED_POSES = [
  { pose: '자연스럽게 걷는 뒷모습', desc: '영화 속 한 장면 같은' },
  { pose: '창밖을 바라보는 옆모습', desc: '생각에 잠긴 듯한' },
  { pose: '카메라를 향해 살짝 미소 짓기', desc: '따뜻하고 자연스러운' },
  { pose: '벤치에 앉아 하늘 바라보기', desc: '여유로운 순간의' },
  { pose: '커피컵을 들고 창가에 서있기', desc: '일상 속 감성적인' },
];

// ============================================
// 단계별 빠른 응답 옵션
// ============================================
const QUICK_REPLIES: Partial<Record<TripKitStep, { label: string; value: string }[]>> = {
  greeting: [
    { label: '파리', value: '파리' },
    { label: '도쿄', value: '도쿄' },
    { label: '제주도', value: '제주도' },
    { label: '추천해줘', value: '추천해줘' },
  ],
  concept: [
    { label: 'Flâneur (도시 산책)', value: 'flaneur' },
    { label: 'Film Log (필름 감성)', value: 'filmlog' },
    { label: 'Midnight (예술적 밤)', value: 'midnight' },
    { label: 'Pastoral (자연 속 여유)', value: 'pastoral' },
  ],
  film: [
    { label: 'Kodak Portra 400', value: 'Kodak Portra 400' },
    { label: 'Fuji Pro 400H', value: 'Fuji Pro 400H' },
    { label: 'Kodak Gold 200', value: 'Kodak Gold 200' },
    { label: 'Ilford HP5', value: 'Ilford HP5' },
  ],
};

const CONCEPT_MAP: Record<string, Concept> = {
  'flaneur': 'flaneur', 'filmlog': 'filmlog', 'midnight': 'midnight',
  'pastoral': 'pastoral', 'noir': 'noir', 'seaside': 'seaside',
  '플라뇌르': 'flaneur', '도시산책': 'flaneur', '도시 산책': 'flaneur',
  '필름': 'filmlog', '필름로그': 'filmlog', '필름 감성': 'filmlog', '빈티지': 'filmlog',
  '밤': 'midnight', '예술': 'midnight', '미드나잇': 'midnight',
  '자연': 'pastoral', '목가적': 'pastoral', '평화': 'pastoral',
  '바다': 'seaside', '해변': 'seaside',
};

const WELCOME_MESSAGE = `안녕하세요, 반가워요 ✨

저는 Trip Kit의 트래블 큐레이터예요.
20년간 여행자들의 장면을 함께 그려왔어요.

지금 떠오르는 장면이 있나요?
어쩌면 햇살 들어오는 카페, 조용한 골목, 혹은 먼 바다가 생각날지도요.

**어느 도시**부터 떠올려볼까요? 🌍`;

const RETRY_MESSAGES = {
  greeting: [
    `음... 도시 이름이 잘 읽히지 않았어요 🥲\n파리, 서울, 도쿄처럼 **도시 이름만** 간단히 적어주실 수 있을까요?`,
    `이번에는 '나라 + 도시' 형식으로 적어볼까요?\n예: **프랑스 파리**, **일본 도쿄** 이런 식으로요!`,
    `조금 헷갈리시는 것 같아요 😊\n**'추천해줘'**라고 입력해주시면, 제가 도시를 골라볼게요!`,
  ],
  spot: [
    `조금 더 구체적인 장소가 필요해요 ✨\n예: **몽마르트르 언덕**, **신주쿠 골목길** 이런 식으로요!`,
    `그 도시에서 가보고 싶은 곳이 있나요?\n카페, 공원, 해변... 어떤 곳이든 좋아요 🌿`,
    `장소를 정하기 어려우시면 **'추천해줘'**라고 해주세요! 📸`,
  ],
  action: [
    `조금 더 구체적으로 말해줄 수 있을까요? 🎬\n예: **카페에서 커피 마시기**, **골목 산책** 이런 식으로요!`,
    `'무엇을 하는지'만 간단히 적어주면 돼요!\n예: **책 읽기**, **산책하기** ✍️`,
  ],
  outfit: [
    `옷 느낌을 조금만 더 알려줄 수 있을까요? 👗\n예: **흰 셔츠 + 청바지**, **트렌치코트** 처럼요!`,
    `색감이나 스타일로 말해주셔도 좋아요 🎨\n예: **베이지 톤**, **올블랙**`,
  ],
  pose: [
    `어떤 느낌의 포즈인지 알려주세요 📷\n예: **걷는 뒷모습**, **창밖 바라보기**`,
    `뒷모습 / 옆모습 / 정면, 걷기 / 앉기 / 서기\n원하는 느낌을 조합해주세요! ✨`,
  ],
};

// ============================================
// 메인 컴포넌트
// ============================================
export function ChatContainer() {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);
  const [isLoading, setIsLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  // 추천 후 확인 대기 상태 (어떤 단계에서 확인 대기 중인지)
  const [pendingConfirmStep, setPendingConfirmStep] = useState<TripKitStep | null>(null);
  // 마지막 추천 인덱스 (중복 추천 방지)
  const [lastRecommendIndex, setLastRecommendIndex] = useState<Record<string, number>>({});
  // Hydration 문제 방지
  const [isMounted, setIsMounted] = useState(false);

  const {
    tripKitProfile,
    tripKitStep,
    chatMessages,
    updateTripKitProfile,
    setTripKitStep,
    addChatMessage,
    resetTripKitChat,
  } = useVibeStore();

  const getSummary = useCallback((profile: TripKitProfile): string => {
    const parts: string[] = [];
    if (profile.city) parts.push(`🌍 ${profile.city}`);
    if (profile.spotName) parts.push(`📍 ${profile.spotName}`);
    if (profile.mainAction) parts.push(`🎬 ${profile.mainAction}`);
    if (profile.conceptId) parts.push(`🎨 ${profile.conceptId}`);
    if (profile.outfitStyle) parts.push(`👗 ${profile.outfitStyle}`);
    if (profile.posePreference) parts.push(`📷 ${profile.posePreference}`);
    if (profile.filmType) parts.push(`🎞️ ${profile.filmType}`);
    if (profile.cameraModel) parts.push(`📸 ${profile.cameraModel}`);
    return parts.join('\n');
  }, []);

  const getProfileJSON = useCallback((profile: TripKitProfile): string => {
    return JSON.stringify({
      spotName: profile.spotName, city: profile.city, conceptId: profile.conceptId,
      mainAction: profile.mainAction, outfitStyle: profile.outfitStyle,
      posePreference: profile.posePreference, filmType: profile.filmType, cameraModel: profile.cameraModel,
    }, null, 2);
  }, []);

  const getRetryMessage = useCallback((step: TripKitStep, count: number): string => {
    const messages = RETRY_MESSAGES[step as keyof typeof RETRY_MESSAGES];
    if (!messages) return '다시 한번 입력해주세요.';
    return messages[Math.min(count, messages.length - 1)];
  }, []);

  // 중복 방지 랜덤 선택
  const getRandomWithoutRepeat = useCallback((array: any[], key: string) => {
    let idx = Math.floor(Math.random() * array.length);
    const lastIdx = lastRecommendIndex[key];
    if (lastIdx !== undefined && array.length > 1) {
      while (idx === lastIdx) {
        idx = Math.floor(Math.random() * array.length);
      }
    }
    setLastRecommendIndex(prev => ({ ...prev, [key]: idx }));
    return array[idx];
  }, [lastRecommendIndex]);

  // Hydration 완료 체크
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      resetTripKitChat();
      setTimeout(() => {
        addChatMessage({ role: 'assistant', content: WELCOME_MESSAGE });
        setTripKitStep('greeting');
      }, 100);
    }
  }, [isMounted, addChatMessage, setTripKitStep, resetTripKitChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isLoading]);

  const handleSendMessage = useCallback(
    async (content: string) => {
      const userInput = content.trim();
      if (!userInput) return;

      addChatMessage({ role: 'user', content: userInput });
      setIsLoading(true);

      try {
        await new Promise((resolve) => setTimeout(resolve, 800));

        let reply = '';
        let nextStep: TripKitStep = tripKitStep;
        const currentProfile = { ...tripKitProfile };
        let newPendingStep: TripKitStep | null = null;

        // ========== 확인 대기 중인 경우 처리 ==========
        if (pendingConfirmStep) {
          // 긍정적 확인 → 다음 단계로
          if (isPositiveConfirmation(userInput)) {
            setPendingConfirmStep(null);
            setRetryCount(0);

            switch (pendingConfirmStep) {
              case 'greeting':
                reply = `좋아요! **${currentProfile.city}**로 정했어요 ✨\n\n${currentProfile.city}에서 **어느 장소**가 떠오르세요?\n예: 카페, 골목길, 해변, 공원... 🌿`;
                nextStep = 'spot';
                break;
              case 'spot':
                reply = `**${currentProfile.spotName}**, 좋은 선택이에요! 📍\n\n그곳에서 **어떤 순간**을 담고 싶나요?\n예: 커피 마시기, 산책하기, 책 읽기... 🎬`;
                nextStep = 'action';
                break;
              case 'action':
                reply = `"${currentProfile.mainAction}" - 멋진 장면이에요! 🎬\n\n---\n${getSummary(currentProfile)}\n---\n\n이제 **분위기**를 정해볼까요? 🎨\n\n• **Flâneur** - 도시 산책자\n• **Film Log** - 필름 감성\n• **Midnight** - 예술적 밤\n• **Pastoral** - 자연 속 여유`;
                nextStep = 'concept';
                break;
              case 'outfit':
                reply = `${currentProfile.outfitStyle} - 완벽해요! 👗\n\n---\n${getSummary(currentProfile)}\n---\n\n**어떤 포즈**로 찍고 싶으세요? 📷\n예: 걷는 뒷모습, 창밖 바라보기, 미소 짓기...`;
                nextStep = 'pose';
                break;
              case 'pose':
                reply = `"${currentProfile.posePreference}" - 자연스러울 거예요! 📷\n\n---\n${getSummary(currentProfile)}\n---\n\n거의 다 왔어요! **필름**을 선택해주세요 🎞️\n\n• **Kodak Portra 400** - 따뜻한 색감\n• **Fuji Pro 400H** - 청량한 색감\n• **Kodak Gold 200** - 빈티지\n• **Ilford HP5** - 흑백`;
                nextStep = 'film';
                break;
              default:
                nextStep = tripKitStep;
            }
          }
          // 부정/다시 추천 요청 → 같은 단계에서 새 추천
          else if (isNegativeOrReRecommend(userInput) || isRecommendRequest(userInput)) {
            switch (pendingConfirmStep) {
              case 'greeting': {
                const rec = getRandomWithoutRepeat(RECOMMENDED_CITIES, 'city');
                currentProfile.city = rec.city;
                updateTripKitProfile({ city: rec.city });
                reply = `그럼 이건 어때요? 🌍\n\n**${rec.city}**\n${rec.reason}\n\n이 도시로 할까요? (네/다른 도시)`;
                newPendingStep = 'greeting';
                break;
              }
              case 'spot': {
                const spots = RECOMMENDED_SPOTS[currentProfile.city || ''] || RECOMMENDED_SPOTS['default'];
                const spot = getRandomWithoutRepeat(spots, 'spot');
                currentProfile.spotName = spot;
                updateTripKitProfile({ spotName: spot });
                reply = `그럼 이곳은 어때요? 📍\n\n**${spot}**\n\n이 장소로 할까요? (네/다른 곳)`;
                newPendingStep = 'spot';
                break;
              }
              case 'action': {
                const rec = getRandomWithoutRepeat(RECOMMENDED_ACTIONS, 'action');
                currentProfile.mainAction = rec.action;
                updateTripKitProfile({ mainAction: rec.action });
                reply = `이런 장면은요? 🎬\n\n**"${rec.action}"**\n${rec.vibe}이 느껴지는 순간이에요.\n\n이 장면으로 할까요? (네/다른 장면)`;
                newPendingStep = 'action';
                break;
              }
              case 'outfit': {
                const rec = getRandomWithoutRepeat(RECOMMENDED_OUTFITS, 'outfit');
                currentProfile.outfitStyle = rec.outfit;
                updateTripKitProfile({ outfitStyle: rec.outfit });
                reply = `이런 스타일은요? 👗\n\n**${rec.outfit}**\n${rec.style} 느낌이에요.\n\n이 스타일로 할까요? (네/다른 스타일)`;
                newPendingStep = 'outfit';
                break;
              }
              case 'pose': {
                const rec = getRandomWithoutRepeat(RECOMMENDED_POSES, 'pose');
                currentProfile.posePreference = rec.pose;
                updateTripKitProfile({ posePreference: rec.pose });
                reply = `이런 포즈는요? 📷\n\n**"${rec.pose}"**\n${rec.desc} 느낌이에요.\n\n이 포즈로 할까요? (네/다른 포즈)`;
                newPendingStep = 'pose';
                break;
              }
              default:
                reply = '다시 한번 말씀해주세요 😊';
            }
          }
          // 새로운 값 직접 입력
          else {
            setPendingConfirmStep(null);
            // 해당 단계에 맞는 유효성 검사 후 처리
            switch (pendingConfirmStep) {
              case 'greeting':
                if (isValidCity(userInput)) {
                  currentProfile.city = userInput;
                  updateTripKitProfile({ city: userInput });
                  reply = `${userInput}, 좋은 선택이에요! ✨\n\n${userInput}에서 **어느 장소**가 떠오르세요?\n골목길, 카페, 해변, 공원... 🌿`;
                  nextStep = 'spot';
                } else {
                  reply = getRetryMessage('greeting', retryCount);
                  setRetryCount(prev => prev + 1);
                }
                break;
              case 'spot':
                if (isValidSpot(userInput)) {
                  currentProfile.spotName = userInput;
                  updateTripKitProfile({ spotName: userInput });
                  reply = `${userInput}, 좋은 선택이에요! 📍\n\n그곳에서 **어떤 순간**을 담고 싶나요? 🎬`;
                  nextStep = 'action';
                } else {
                  reply = getRetryMessage('spot', retryCount);
                  setRetryCount(prev => prev + 1);
                }
                break;
              case 'action':
                if (isValidAction(userInput)) {
                  currentProfile.mainAction = userInput;
                  updateTripKitProfile({ mainAction: userInput });
                  reply = `"${userInput}" - 멋진 장면이에요! 🎬\n\n---\n${getSummary(currentProfile)}\n---\n\n이제 **분위기**를 정해볼까요? 🎨`;
                  nextStep = 'concept';
                } else {
                  reply = getRetryMessage('action', retryCount);
                  setRetryCount(prev => prev + 1);
                }
                break;
              case 'outfit':
                if (isValidOutfit(userInput)) {
                  currentProfile.outfitStyle = userInput;
                  updateTripKitProfile({ outfitStyle: userInput });
                  reply = `${userInput} - 분위기랑 잘 어울려요! 👗\n\n**어떤 포즈**로 찍고 싶으세요? 📷`;
                  nextStep = 'pose';
                } else {
                  reply = getRetryMessage('outfit', retryCount);
                  setRetryCount(prev => prev + 1);
                }
                break;
              case 'pose':
                if (isValidPose(userInput)) {
                  currentProfile.posePreference = userInput;
                  updateTripKitProfile({ posePreference: userInput });
                  reply = `"${userInput}" - 자연스러울 거예요! 📷\n\n---\n${getSummary(currentProfile)}\n---\n\n**필름**을 선택해주세요 🎞️`;
                  nextStep = 'film';
                } else {
                  reply = getRetryMessage('pose', retryCount);
                  setRetryCount(prev => prev + 1);
                }
                break;
              default:
                reply = '다시 한번 입력해주세요.';
            }
          }

          if (newPendingStep) {
            setPendingConfirmStep(newPendingStep);
          }

          addChatMessage({ role: 'assistant', content: reply });
          if (nextStep !== tripKitStep && !newPendingStep) {
            setTripKitStep(nextStep);
            setRetryCount(0);
          }
          setIsLoading(false);
          return;
        }

        // ========== 일반 단계별 처리 ==========
        switch (tripKitStep) {
          case 'greeting': {
            if (isRecommendRequest(userInput)) {
              const rec = getRandomWithoutRepeat(RECOMMENDED_CITIES, 'city');
              currentProfile.city = rec.city;
              updateTripKitProfile({ city: rec.city });
              reply = `그럼 이런 도시는 어떠세요? 🌍\n\n**${rec.city}**\n${rec.reason}\n\n이 도시로 할까요? (네/다른 도시)`;
              newPendingStep = 'greeting';
            } else if (!isValidCity(userInput)) {
              reply = getRetryMessage('greeting', retryCount);
              setRetryCount(prev => prev + 1);
            } else {
              currentProfile.city = userInput;
              updateTripKitProfile({ city: userInput });
              reply = `${userInput}, 정말 좋은 선택이에요 ✨\n\n${userInput}에서 **어느 장소**가 떠오르세요?\n골목길, 카페, 해변, 공원... 🌿`;
              nextStep = 'spot';
              setRetryCount(0);
            }
            break;
          }

          case 'spot': {
            if (isRecommendRequest(userInput)) {
              const spots = RECOMMENDED_SPOTS[currentProfile.city || ''] || RECOMMENDED_SPOTS['default'];
              const spot = getRandomWithoutRepeat(spots, 'spot');
              currentProfile.spotName = spot;
              updateTripKitProfile({ spotName: spot });
              reply = `${currentProfile.city}에서 이런 곳은 어때요? 📍\n\n**${spot}**\n\n이 장소로 할까요? (네/다른 곳)`;
              newPendingStep = 'spot';
            } else if (!isValidSpot(userInput)) {
              reply = getRetryMessage('spot', retryCount);
              setRetryCount(prev => prev + 1);
            } else {
              currentProfile.spotName = userInput;
              updateTripKitProfile({ spotName: userInput });
              reply = `${userInput}... 🌟\n\n그곳에서 **어떤 순간**을 담고 싶나요?\n예: 커피 마시기, 산책하기, 책 읽기... ✨`;
              nextStep = 'action';
              setRetryCount(0);
            }
            break;
          }

          case 'action': {
            if (isRecommendRequest(userInput)) {
              const rec = getRandomWithoutRepeat(RECOMMENDED_ACTIONS, 'action');
              currentProfile.mainAction = rec.action;
              updateTripKitProfile({ mainAction: rec.action });
              reply = `이런 장면은 어때요? 🎬\n\n**"${rec.action}"**\n${rec.vibe}이 느껴지는 순간이에요.\n\n이 장면으로 할까요? (네/다른 장면)`;
              newPendingStep = 'action';
            } else if (!isValidAction(userInput)) {
              reply = getRetryMessage('action', retryCount);
              setRetryCount(prev => prev + 1);
            } else {
              currentProfile.mainAction = userInput;
              updateTripKitProfile({ mainAction: userInput });
              reply = `"${userInput}"\n\n정말 멋진 장면이에요 🎬\n\n---\n${getSummary(currentProfile)}\n---\n\n이제 **분위기**를 정해볼까요? 🎨\n\n• **Flâneur** - 도시 산책자\n• **Film Log** - 필름 감성\n• **Midnight** - 예술적 밤\n• **Pastoral** - 자연 속 여유`;
              nextStep = 'concept';
              setRetryCount(0);
            }
            break;
          }

          case 'concept': {
            const conceptKey = userInput.toLowerCase().replace(/\s/g, '');
            const conceptId = CONCEPT_MAP[conceptKey] || CONCEPT_MAP[userInput] || 'filmlog';
            currentProfile.conceptId = conceptId;
            updateTripKitProfile({ conceptId });
            const names: Record<string, string> = {
              flaneur: 'Flâneur', filmlog: 'Film Log', midnight: 'Midnight',
              pastoral: 'Pastoral', noir: 'Noir', seaside: 'Seaside',
            };
            reply = `${names[conceptId] || conceptId} 🎨\n\n이 분위기, 잘 어울릴 것 같아요.\n\n---\n${getSummary(currentProfile)}\n---\n\n그날 **어떤 옷**을 입고 계실 건가요? 👗\n예: 트렌치코트, 린넨 셔츠, 청바지...`;
            nextStep = 'outfit';
            setRetryCount(0);
            break;
          }

          case 'outfit': {
            if (isRecommendRequest(userInput)) {
              const rec = getRandomWithoutRepeat(RECOMMENDED_OUTFITS, 'outfit');
              currentProfile.outfitStyle = rec.outfit;
              updateTripKitProfile({ outfitStyle: rec.outfit });
              reply = `이런 스타일은 어때요? 👗\n\n**${rec.outfit}**\n${rec.style} 느낌이에요.\n\n이 스타일로 할까요? (네/다른 스타일)`;
              newPendingStep = 'outfit';
            } else if (!isValidOutfit(userInput)) {
              reply = getRetryMessage('outfit', retryCount);
              setRetryCount(prev => prev + 1);
            } else {
              currentProfile.outfitStyle = userInput;
              updateTripKitProfile({ outfitStyle: userInput });
              reply = `${userInput} ✨\n\n분위기랑 잘 어울리는 선택이에요!\n\n---\n${getSummary(currentProfile)}\n---\n\n**어떤 포즈**로 찍고 싶으세요? 📷\n예: 걷는 뒷모습, 창밖 바라보기, 미소 짓기...`;
              nextStep = 'pose';
              setRetryCount(0);
            }
            break;
          }

          case 'pose': {
            if (isRecommendRequest(userInput)) {
              const rec = getRandomWithoutRepeat(RECOMMENDED_POSES, 'pose');
              currentProfile.posePreference = rec.pose;
              updateTripKitProfile({ posePreference: rec.pose });
              reply = `이런 포즈는 어때요? 📷\n\n**"${rec.pose}"**\n${rec.desc} 느낌이에요.\n\n이 포즈로 할까요? (네/다른 포즈)`;
              newPendingStep = 'pose';
            } else if (!isValidPose(userInput)) {
              reply = getRetryMessage('pose', retryCount);
              setRetryCount(prev => prev + 1);
            } else {
              currentProfile.posePreference = userInput;
              updateTripKitProfile({ posePreference: userInput });
              reply = `"${userInput}" 📷\n\n그 포즈, 자연스러울 거예요.\n\n---\n${getSummary(currentProfile)}\n---\n\n거의 다 왔어요! **필름**을 선택해주세요 🎞️\n\n• **Kodak Portra 400** - 따뜻한 색감\n• **Fuji Pro 400H** - 청량한 색감\n• **Kodak Gold 200** - 빈티지\n• **Ilford HP5** - 흑백`;
              nextStep = 'film';
              setRetryCount(0);
            }
            break;
          }

          case 'film': {
            currentProfile.filmType = userInput;
            updateTripKitProfile({ filmType: userInput });
            reply = `${userInput} 🎞️\n\n이 필름으로 찍으면 예쁠 거예요.\n\n---\n${getSummary(currentProfile)}\n---\n\n마지막! **카메라**를 알려주세요 📸\n예: Contax T2, Leica M6, Canon AE-1...`;
            nextStep = 'confirm';
            setRetryCount(0);
            break;
          }

          case 'confirm': {
            currentProfile.cameraModel = userInput;
            updateTripKitProfile({ cameraModel: userInput });
            reply = `${userInput} 📸\n\n완벽해요! 모든 정보가 모였어요 ✨\n\n---\n**최종 요약**\n\n${getSummary(currentProfile)}\n---\n\n\`\`\`\n${getProfileJSON(currentProfile)}\n\`\`\`\n\n**이 정보로 여행 이미지를 만들어도 될까요?**\n"네" 또는 "수정할게요" 💫`;
            nextStep = 'complete';
            break;
          }

          case 'complete': {
            const isConfirmed = isPositiveConfirmation(userInput);
            if (isConfirmed) {
              reply = `좋아요! 🎉\n\n당신만의 여행 이미지를 만들어 드릴게요.\n잠시 후 이동합니다... ✨`;
              setTimeout(() => router.push('/generate'), 2000);
            } else {
              reply = `알겠어요! 처음부터 다시 해볼게요 😊\n\n**어느 도시**로 여행을 떠나볼까요? 🌍`;
              resetTripKitChat();
              nextStep = 'greeting';
              setTimeout(() => addChatMessage({ role: 'assistant', content: reply }), 100);
              setIsLoading(false);
              return;
            }
            break;
          }

          default:
            reply = '다시 한번 말씀해주세요 😊';
        }

        if (newPendingStep) {
          setPendingConfirmStep(newPendingStep);
        }

        addChatMessage({ role: 'assistant', content: reply });
        if (nextStep !== tripKitStep && !newPendingStep) {
          setTripKitStep(nextStep);
        }

      } catch {
        addChatMessage({ role: 'assistant', content: '앗, 잠시 문제가 생겼어요. 다시 시도해주세요 🙏' });
      } finally {
        setIsLoading(false);
      }
    },
    [tripKitStep, tripKitProfile, pendingConfirmStep, retryCount, addChatMessage, updateTripKitProfile, setTripKitStep, getSummary, getProfileJSON, getRetryMessage, getRandomWithoutRepeat, resetTripKitChat, router]
  );

  const quickReplies = QUICK_REPLIES[tripKitStep];

  // Hydration 전에는 로딩 상태 표시
  if (!isMounted) {
    return (
      <div className="flex flex-col h-screen bg-cream-50 items-center justify-center">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-cream-50">
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-cream-200 px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <h1 className="font-serif text-xl text-gray-900">Trip Kit</h1>
            <span className="text-sm text-gray-500">
              {tripKitStep === 'complete' ? '✨ 최종 확인' : pendingConfirmStep ? '확인 대기 중...' : '대화 중...'}
            </span>
          </div>
          <ProgressBar currentStep={tripKitStep} />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-6 custom-scrollbar">
        <div className="max-w-2xl mx-auto space-y-4">
          <AnimatePresence mode="popLayout">
            {chatMessages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <MessageBubble role={message.role} content={message.content} timestamp={message.timestamp} />
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <TypingIndicator />
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {quickReplies && !isLoading && tripKitStep !== 'complete' && !pendingConfirmStep && (
        <motion.div className="px-4 py-3 border-t border-cream-200 bg-white" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="max-w-2xl mx-auto">
            <p className="text-xs text-gray-500 mb-2">빠른 선택:</p>
            <QuickReply options={quickReplies} onSelect={handleSendMessage} />
          </div>
        </motion.div>
      )}

      {pendingConfirmStep && !isLoading && (
        <motion.div className="px-4 py-3 border-t border-cream-200 bg-white" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="max-w-2xl mx-auto">
            <p className="text-xs text-gray-500 mb-2">선택해주세요:</p>
            <QuickReply
              options={[
                { label: '네, 좋아요!', value: '네' },
                { label: '다른 거 추천해줘', value: '다른거 추천해줘' },
              ]}
              onSelect={handleSendMessage}
            />
          </div>
        </motion.div>
      )}

      <div className="sticky bottom-0 px-4 py-4 border-t border-cream-200 bg-white/90 backdrop-blur-md safe-bottom">
        <div className="max-w-2xl mx-auto">
          <ChatInput
            onSend={handleSendMessage}
            disabled={isLoading}
            placeholder={pendingConfirmStep ? '"네" 또는 직접 입력...' : tripKitStep === 'complete' ? '"네" 또는 "수정할게요"...' : '메시지를 입력하세요...'}
          />
        </div>
      </div>
    </div>
  );
}
