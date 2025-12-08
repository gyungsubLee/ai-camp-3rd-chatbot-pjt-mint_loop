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
// 타입 정의
// ============================================
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface CollectedData {
  city: string | null;
  spotName: string | null;
  mainAction: string | null;
  conceptId: string | null;
  outfitStyle: string | null;
  posePreference: string | null;
  filmType: string | null;
  cameraModel: string | null;
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

interface ChatApiResponse {
  reply: string;
  currentStep: string;
  nextStep: string;
  isComplete: boolean;
  collectedData?: CollectedData;
  rejectedItems?: RejectedItems;
  error?: string;
}

// ============================================
// 단계별 빠른 응답 옵션
// ============================================
const QUICK_REPLIES: Partial<Record<string, { label: string; value: string }[]>> = {
  greeting: [
    { label: '파리', value: '파리' },
    { label: '도쿄', value: '도쿄' },
    { label: '제주도', value: '제주도' },
    { label: '추천해줘', value: '추천해줘' },
  ],
  city: [
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

const WELCOME_MESSAGE = `안녕하세요, 반가워요 ✨

저는 Trip Kit의 트래블 큐레이터예요.
20년간 여행자들의 장면을 함께 그려왔어요.

지금 떠오르는 장면이 있나요?
어쩌면 햇살 들어오는 카페, 조용한 골목, 혹은 먼 바다가 생각날지도요.

**어느 도시**부터 떠올려볼까요? 🌍`;

// 단계 매핑 (API 응답 → TripKitStep)
const STEP_MAPPING: Record<string, TripKitStep> = {
  greeting: 'greeting',
  city: 'greeting',
  spot: 'spot',
  action: 'action',
  concept: 'concept',
  outfit: 'outfit',
  pose: 'pose',
  film: 'film',
  camera: 'confirm',
  complete: 'complete',
};

// ============================================
// 메인 컴포넌트
// ============================================
export function ChatContainer() {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentApiStep, setCurrentApiStep] = useState('greeting');
  const [collectedData, setCollectedData] = useState<CollectedData>({
    city: null,
    spotName: null,
    mainAction: null,
    conceptId: null,
    outfitStyle: null,
    posePreference: null,
    filmType: null,
    cameraModel: null,
  });
  const [rejectedItems, setRejectedItems] = useState<RejectedItems>({
    cities: [],
    spots: [],
    actions: [],
    concepts: [],
    outfits: [],
    poses: [],
    films: [],
    cameras: [],
  });
  const [conversationHistory, setConversationHistory] = useState<ChatMessage[]>([]);
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

  // Hydration 완료 체크
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 초기화
  useEffect(() => {
    if (!isMounted) return;
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      resetTripKitChat();
      setConversationHistory([]);
      setCollectedData({
        city: null,
        spotName: null,
        mainAction: null,
        conceptId: null,
        outfitStyle: null,
        posePreference: null,
        filmType: null,
        cameraModel: null,
      });
      setRejectedItems({
        cities: [],
        spots: [],
        actions: [],
        concepts: [],
        outfits: [],
        poses: [],
        films: [],
        cameras: [],
      });
      setCurrentApiStep('greeting');
      setTimeout(() => {
        addChatMessage({ role: 'assistant', content: WELCOME_MESSAGE });
        setTripKitStep('greeting');
      }, 100);
    }
  }, [isMounted, addChatMessage, setTripKitStep, resetTripKitChat]);

  // 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isLoading]);

  // collectedData가 변경되면 tripKitProfile 업데이트
  useEffect(() => {
    if (collectedData) {
      const profileUpdate: Partial<TripKitProfile> = {};
      if (collectedData.city) profileUpdate.city = collectedData.city;
      if (collectedData.spotName) profileUpdate.spotName = collectedData.spotName;
      if (collectedData.mainAction) profileUpdate.mainAction = collectedData.mainAction;
      if (collectedData.conceptId) profileUpdate.conceptId = collectedData.conceptId as Concept;
      if (collectedData.outfitStyle) profileUpdate.outfitStyle = collectedData.outfitStyle;
      if (collectedData.posePreference) profileUpdate.posePreference = collectedData.posePreference;
      if (collectedData.filmType) profileUpdate.filmType = collectedData.filmType;
      if (collectedData.cameraModel) profileUpdate.cameraModel = collectedData.cameraModel;

      if (Object.keys(profileUpdate).length > 0) {
        updateTripKitProfile(profileUpdate);
      }
    }
  }, [collectedData, updateTripKitProfile]);

  const handleSendMessage = useCallback(
    async (content: string) => {
      const userInput = content.trim();
      if (!userInput) return;

      // 사용자 메시지 추가
      addChatMessage({ role: 'user', content: userInput });
      setIsLoading(true);

      // 대화 히스토리에 추가
      const newHistory: ChatMessage[] = [
        ...conversationHistory,
        { role: 'user', content: userInput },
      ];
      setConversationHistory(newHistory);

      try {
        // API 호출
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: userInput,
            conversationHistory: newHistory,
            currentStep: currentApiStep,
            collectedData,
            rejectedItems,
          }),
        });

        const data: ChatApiResponse = await response.json();

        // 응답 메시지 추가
        addChatMessage({ role: 'assistant', content: data.reply });

        // 대화 히스토리 업데이트
        setConversationHistory([
          ...newHistory,
          { role: 'assistant', content: data.reply },
        ]);

        // 수집된 데이터 업데이트
        if (data.collectedData) {
          setCollectedData(prev => ({
            ...prev,
            ...data.collectedData,
          }));
        }

        // 거부된 항목 업데이트 (누적)
        if (data.rejectedItems) {
          setRejectedItems(prev => ({
            cities: Array.from(new Set([...prev.cities, ...(data.rejectedItems?.cities || [])])),
            spots: Array.from(new Set([...prev.spots, ...(data.rejectedItems?.spots || [])])),
            actions: Array.from(new Set([...prev.actions, ...(data.rejectedItems?.actions || [])])),
            concepts: Array.from(new Set([...prev.concepts, ...(data.rejectedItems?.concepts || [])])),
            outfits: Array.from(new Set([...prev.outfits, ...(data.rejectedItems?.outfits || [])])),
            poses: Array.from(new Set([...prev.poses, ...(data.rejectedItems?.poses || [])])),
            films: Array.from(new Set([...prev.films, ...(data.rejectedItems?.films || [])])),
            cameras: Array.from(new Set([...prev.cameras, ...(data.rejectedItems?.cameras || [])])),
          }));
        }

        // 단계 업데이트
        if (data.nextStep) {
          setCurrentApiStep(data.nextStep);
          const tripKitStepValue = STEP_MAPPING[data.nextStep] || tripKitStep;
          if (tripKitStepValue !== tripKitStep) {
            setTripKitStep(tripKitStepValue);
          }
        }

        // 완료 처리
        if (data.isComplete) {
          setTripKitStep('complete');
          // 2초 후 generate 페이지로 이동
          setTimeout(() => {
            router.push('/generate');
          }, 2000);
        }
      } catch (error) {
        console.error('Chat error:', error);
        addChatMessage({
          role: 'assistant',
          content: '앗, 잠시 문제가 생겼어요. 다시 시도해주세요 🙏',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [
      currentApiStep,
      collectedData,
      rejectedItems,
      conversationHistory,
      tripKitStep,
      addChatMessage,
      setTripKitStep,
      router,
    ]
  );

  const quickReplies = QUICK_REPLIES[currentApiStep];

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
              {tripKitStep === 'complete' ? '✨ 완료!' : 'Gemini와 대화 중...'}
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
                <MessageBubble
                  role={message.role}
                  content={message.content}
                  timestamp={message.timestamp}
                />
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <TypingIndicator />
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {quickReplies && !isLoading && tripKitStep !== 'complete' && (
        <motion.div
          className="px-4 py-3 border-t border-cream-200 bg-white"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="max-w-2xl mx-auto">
            <p className="text-xs text-gray-500 mb-2">빠른 선택:</p>
            <QuickReply options={quickReplies} onSelect={handleSendMessage} />
          </div>
        </motion.div>
      )}

      <div className="sticky bottom-0 px-4 py-4 border-t border-cream-200 bg-white/90 backdrop-blur-md safe-bottom">
        <div className="max-w-2xl mx-auto">
          <ChatInput
            onSend={handleSendMessage}
            disabled={isLoading}
            placeholder={
              tripKitStep === 'complete'
                ? '완료되었습니다! 잠시 후 이동합니다...'
                : '메시지를 입력하세요...'
            }
          />
        </div>
      </div>
    </div>
  );
}
