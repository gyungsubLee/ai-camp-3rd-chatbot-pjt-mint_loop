'use client';

import { useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useChatStore } from '@/lib/store/useChatStore';
import { useVibeStore } from '@/lib/store/useVibeStore';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { ChatInput } from './ChatInput';
import { QuickReply } from './QuickReply';
import { ProgressBar } from './ProgressBar';
import type { ConversationStep } from '@/lib/types';

const QUICK_REPLIES: Partial<Record<ConversationStep, { label: string; value: string }[]>> = {
  mood: [
    { label: '로맨틱한', value: 'romantic' },
    { label: '모험적인', value: 'adventurous' },
    { label: '향수로운', value: 'nostalgic' },
    { label: '평화로운', value: 'peaceful' },
  ],
  aesthetic: [
    { label: '도시적인', value: 'urban' },
    { label: '자연적인', value: 'nature' },
    { label: '빈티지', value: 'vintage' },
    { label: '모던한', value: 'modern' },
  ],
  duration: [
    { label: '짧게 (1-3일)', value: 'short' },
    { label: '중간 (4-7일)', value: 'medium' },
    { label: '길게 (8일+)', value: 'long' },
  ],
  interests: [
    { label: '사진', value: 'photography' },
    { label: '음식', value: 'food' },
    { label: '예술', value: 'art' },
    { label: '역사', value: 'history' },
  ],
};

// Initial greeting message
const WELCOME_MESSAGE = `안녕하세요! 👋 저는 Trip Kit의 Vibe 큐레이터예요.

당신만의 특별한 여행 감성을 찾아드릴게요. 필름 카메라, 빈티지 스타일, 그리고 인스타그램에서 볼 수 없는 숨겨진 명소들까지.

먼저, **어떤 분위기의 여행**을 꿈꾸고 계신가요?

예를 들어:
- "로맨틱하고 감성적인"
- "모험적이고 자유로운"
- "향수를 불러일으키는"
- "평화롭고 여유로운"`;

export function ChatContainer() {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);

  const {
    messages,
    currentStep,
    isLoading,
    recommendations,
    addMessage,
    setCurrentStep,
    setLoading,
    updatePreferences,
    setRecommendations,
    initSession,
  } = useChatStore();

  const { setPreferences, setDestinations } = useVibeStore();

  // Initialize session and add welcome message
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      initSession();

      // Add welcome message if no messages exist
      if (messages.length === 0) {
        addMessage({
          role: 'assistant',
          content: WELCOME_MESSAGE,
        });
        setCurrentStep('mood');
      }
    }
  }, [messages.length, addMessage, setCurrentStep, initSession]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Handle sending message
  const handleSendMessage = useCallback(
    async (content: string) => {
      // Add user message
      addMessage({ role: 'user', content });
      setLoading(true);

      try {
        // Simulate AI response (replace with actual API call)
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Process based on current step
        let nextStep: ConversationStep = currentStep;
        let reply = '';

        switch (currentStep) {
          case 'mood':
            updatePreferences({ mood: content.toLowerCase().includes('romantic') ? 'romantic' :
                                      content.toLowerCase().includes('adventur') ? 'adventurous' :
                                      content.toLowerCase().includes('nostalg') ? 'nostalgic' : 'peaceful' });
            reply = `**${content}** 분위기, 정말 멋진 선택이에요! ✨

그럼 이제 **시각적인 스타일**에 대해 이야기해볼까요?

도시의 거리와 카페가 좋으신가요, 아니면 자연 속 풍경이 더 끌리시나요? 빈티지한 분위기 vs 모던한 감각?`;
            nextStep = 'aesthetic';
            break;

          case 'aesthetic':
            updatePreferences({ aesthetic: content.toLowerCase().includes('urban') ? 'urban' :
                                          content.toLowerCase().includes('nature') ? 'nature' :
                                          content.toLowerCase().includes('vintage') ? 'vintage' : 'modern' });
            reply = `${content} 스타일, 완벽해요! 📸

이제 **여행 기간**이 궁금해요. 얼마나 시간을 내실 수 있으신가요?`;
            nextStep = 'duration';
            break;

          case 'duration':
            updatePreferences({ duration: content.toLowerCase().includes('short') || content.includes('1') ? 'short' :
                                         content.toLowerCase().includes('long') || content.includes('8') ? 'long' : 'medium' });
            reply = `좋아요! 충분한 시간이네요. 🗓️

마지막으로, **특별히 관심 있는 분야**가 있나요?

사진 촬영, 맛집 탐방, 예술/문화, 역사 탐방 중에서 골라주세요. (여러 개 선택 가능!)`;
            nextStep = 'interests';
            break;

          case 'interests':
            const interests: ('photography' | 'food' | 'art' | 'history')[] = [];
            if (content.toLowerCase().includes('photo') || content.includes('사진')) interests.push('photography');
            if (content.toLowerCase().includes('food') || content.includes('음식') || content.includes('맛집')) interests.push('food');
            if (content.toLowerCase().includes('art') || content.includes('예술')) interests.push('art');
            if (content.toLowerCase().includes('history') || content.includes('역사')) interests.push('history');
            if (interests.length === 0) interests.push('photography');

            updatePreferences({ interests });
            setPreferences({ interests });

            reply = `완벽해요! 🎉

당신의 여행 Vibe 프로필이 완성되었어요:
- **무드**: 감성적이고 특별한
- **스타일**: 빈티지 & 필름 감성
- **관심사**: ${interests.join(', ')}

이제 당신에게 딱 맞는 **숨겨진 여행지**를 찾아볼게요! ✈️

다음 단계에서 **3가지 컨셉** 중 하나를 선택해주세요.`;
            nextStep = 'complete';
            break;

          default:
            reply = '알겠습니다! 계속해서 이야기해주세요.';
        }

        // Add AI response
        addMessage({ role: 'assistant', content: reply });
        setCurrentStep(nextStep);

        // If complete, navigate to concept selection
        if (nextStep === 'complete') {
          setTimeout(() => {
            router.push('/concept');
          }, 2000);
        }
      } catch {
        addMessage({
          role: 'assistant',
          content: '죄송해요, 잠시 문제가 생겼어요. 다시 시도해주세요.',
        });
      } finally {
        setLoading(false);
      }
    },
    [
      currentStep,
      addMessage,
      setLoading,
      setCurrentStep,
      updatePreferences,
      setPreferences,
      router,
    ]
  );

  const quickReplies = QUICK_REPLIES[currentStep];

  return (
    <div className="flex flex-col h-screen bg-cream-50">
      {/* Header with Progress */}
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-cream-200 px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <h1 className="font-serif text-xl text-gray-900">Vibe Discovery</h1>
            <span className="text-sm text-gray-500">
              {currentStep === 'complete' ? '완료!' : `진행 중...`}
            </span>
          </div>
          <ProgressBar currentStep={currentStep} />
        </div>
      </header>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-6 custom-scrollbar">
        <div className="max-w-2xl mx-auto space-y-4">
          <AnimatePresence mode="popLayout">
            {messages.map((message) => (
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

          {/* Typing Indicator */}
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

      {/* Quick Replies */}
      {quickReplies && !isLoading && currentStep !== 'complete' && (
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

      {/* Chat Input */}
      {currentStep !== 'complete' && (
        <div className="sticky bottom-0 px-4 py-4 border-t border-cream-200 bg-white/90 backdrop-blur-md safe-bottom">
          <div className="max-w-2xl mx-auto">
            <ChatInput
              onSend={handleSendMessage}
              disabled={isLoading}
              placeholder="메시지를 입력하세요..."
            />
          </div>
        </div>
      )}
    </div>
  );
}
