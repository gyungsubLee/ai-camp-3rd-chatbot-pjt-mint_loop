# Trip Kit - Frontend Design Specification
## MVP Version - Vibe-Driven Travel Platform

---

## Document Information

- **Document Version**: 2.0.0
- **Last Updated**: 2025-12-10
- **Author**: Frontend Architecture Team
- **Related Documents**: [PRD](./PRD_TripKit_MVP.md), [TRD](./TRD_TripKit_MVP.md), [API Docs](./API_Documentation.md)
- **Status**: Ready for Implementation

---

## Architecture Overview

### Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 14.2+ | App Router, SSR, API Routes |
| **React** | 18+ | UI Components |
| **TypeScript** | 5.0+ | Type Safety |
| **Tailwind CSS** | 3.4+ | Styling Framework |
| **Zustand** | 4.5+ | Global State Management |
| **React Query** | 5.0+ | Server State & Caching |
| **Framer Motion** | 11+ | Animations |

### Project Structure

```
app/
├── page.tsx                        # Landing Page (/)
│
├── chat/
│   └── page.tsx                    # Vibe Chat Interface (/chat)
│
├── concept/
│   └── page.tsx                    # Concept Selection (/concept)
│
├── destinations/
│   └── page.tsx                    # SSE Streaming Destinations (/destinations)
│
├── tripkit/
│   └── page.tsx                    # TripKit Package (Gift Box UI) (/tripkit)
│
├── generate/
│   └── page.tsx                    # Image Generation (/generate)
│
├── api/                            # API Routes (Proxy to FastAPI Backend)
│   ├── chat/
│   │   └── route.ts                # POST /api/chat → Backend ChatAgent
│   ├── recommendations/
│   │   └── destinations/
│   │       ├── route.ts            # POST /api/recommendations/destinations
│   │       └── stream/
│   │           └── route.ts        # POST /api/recommendations/destinations/stream (SSE)
│   └── generate/
│       └── route.ts                # POST /api/generate → Backend ImageAgent
│
├── layout.tsx                      # Root Layout
├── globals.css                     # Global Styles
└── providers.tsx                   # Context Providers

components/
├── ui/                             # Reusable UI Components
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   ├── Badge.tsx
│   ├── Skeleton.tsx
│   ├── Progress.tsx
│   └── Modal.tsx
│
├── layout/                         # Layout Components
│   ├── Header.tsx
│   └── Footer.tsx
│
├── landing/                        # Landing Page Components
│   ├── Hero.tsx
│   ├── ConceptPreview.tsx
│   ├── FeatureShowcase.tsx
│   └── CallToAction.tsx
│
├── chat/                           # Chat Interface Components
│   ├── ChatContainer.tsx
│   ├── MessageBubble.tsx
│   ├── ChatInput.tsx
│   ├── TypingIndicator.tsx
│   ├── QuickReply.tsx
│   └── ProgressBar.tsx
│
├── concept/                        # Concept Selection Components
│   └── ConceptCard.tsx
│
├── destinations/                   # Destination Components (SSE Streaming)
│   ├── DestinationCard.tsx
│   └── DestinationModal.tsx
│
├── tripkit/                        # TripKit Components
│   ├── GiftBox.tsx                 # 선물 상자 컨테이너
│   ├── WrappedGift.tsx             # 포장된 선물
│   └── Postcard.tsx                # 여행 엽서
│
└── generate/                       # Image Generation Components
    ├── ImageGenerator.tsx
    ├── GenerationProgress.tsx
    └── ImagePreview.tsx

lib/
├── store/                          # Zustand Stores (persist middleware)
│   ├── useChatStore.ts             # 대화 상태 + 세션 (7일 TTL)
│   └── useVibeStore.ts             # 추천 + 이미지 생성 상태
│
├── types/                          # TypeScript Types
│   └── index.ts                    # 통합 타입 정의
│
├── utils/                          # Utility Functions
│   └── cn.ts                       # clsx + tailwind-merge
│
└── constants/                      # Constants
    ├── concepts.ts                 # Concept definitions
    └── filmStocks.ts               # Film stock data

public/
├── images/
│   ├── concepts/                   # Concept preview images
│   │   ├── flaneur/
│   │   ├── filmlog/
│   │   └── midnight/
│   ├── film-textures/              # Film grain overlays
│   └── icons/
├── fonts/
│   ├── LibreBaskerville/
│   └── Inter/
└── favicon.ico
```

---

## Page Specifications

### 1. Landing Page (`/`)

**Purpose**: Hero landing page that introduces Trip Kit's vibe-driven travel concept

#### Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│ Header (Logo + Navigation)                              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   ╔═══════════════════════════════════════════════╗    │
│   ║           HERO SECTION                        ║    │
│   ║                                               ║    │
│   ║   "당신은 티켓만 끊으세요.                     ║    │
│   ║    여행의 '분위기(Vibe)'는                     ║    │
│   ║    우리가 챙겨드립니다."                       ║    │
│   ║                                               ║    │
│   ║   [Start Your Vibe Journey] CTA Button        ║    │
│   ║                                               ║    │
│   ║   Animated Film Camera + Travel Photos        ║    │
│   ╚═══════════════════════════════════════════════╝    │
│                                                         │
├─────────────────────────────────────────────────────────┤
│   ┌─────────────────────────────────────────────────┐   │
│   │ CONCEPT PREVIEW SECTION                          │   │
│   │                                                   │   │
│   │ ┌───────────┐ ┌───────────┐ ┌───────────┐       │   │
│   │ │ 플라뇌르   │ │ 필름 로그  │ │ 미드나잇   │       │   │
│   │ │ Flâneur   │ │ Film Log  │ │ Midnight  │       │   │
│   │ │           │ │           │ │           │       │   │
│   │ │ 지도 없이  │ │ 빈티지    │ │ 과거 예술가│       │   │
│   │ │ 걷는 낭만  │ │ 감성 기록  │ │ 와의 조우  │       │   │
│   │ └───────────┘ └───────────┘ └───────────┘       │   │
│   └─────────────────────────────────────────────────┘   │
│                                                         │
├─────────────────────────────────────────────────────────┤
│   ┌─────────────────────────────────────────────────┐   │
│   │ FEATURE SHOWCASE                                 │   │
│   │                                                   │   │
│   │ ✓ AI Vibe Analysis → Hidden Spots → Film Style  │   │
│   │ ✓ Complete Styling Package                       │   │
│   │ ✓ Film Aesthetic Preview Images                  │   │
│   └─────────────────────────────────────────────────┘   │
│                                                         │
├─────────────────────────────────────────────────────────┤
│ Footer                                                  │
└─────────────────────────────────────────────────────────┘
```

#### Component: `Hero.tsx`

```typescript
// components/landing/Hero.tsx
'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { FilmGrainOverlay } from '@/components/shared/FilmGrainOverlay';

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-cream-50">
      {/* Film Grain Texture Overlay */}
      <FilmGrainOverlay opacity={0.03} />

      {/* Background Image with Parallax */}
      <motion.div
        className="absolute inset-0 z-0"
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
      >
        <Image
          src="/images/hero-background.jpg"
          alt="Film aesthetic travel"
          fill
          className="object-cover opacity-20"
          priority
        />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Brand Badge */}
          <span className="inline-block px-4 py-2 mb-6 text-sm font-medium tracking-wider text-sepia-700 bg-sepia-100/50 rounded-full border border-sepia-200">
            AI-Powered Vibe Travel
          </span>

          {/* Main Headline */}
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl text-gray-900 leading-tight mb-6">
            당신은 티켓만 끊으세요.
            <br />
            <span className="text-sepia-600">여행의 '분위기'</span>는
            <br />
            우리가 챙겨드립니다.
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10 font-light">
            AI가 당신의 여행 '바이브'를 분석하여
            <br className="hidden md:block" />
            숨겨진 장소, 필름 카메라 스타일, 완벽한 스타일링을 큐레이션합니다.
          </p>

          {/* CTA Button */}
          <Link href="/chat">
            <Button
              size="lg"
              variant="primary"
              className="group px-8 py-4 text-lg font-medium"
            >
              <span>나만의 Vibe 찾기</span>
              <motion.span
                className="inline-block ml-2"
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                →
              </motion.span>
            </Button>
          </Link>
        </motion.div>

        {/* Floating Camera Animation */}
        <motion.div
          className="absolute right-10 top-1/4 hidden lg:block"
          animate={{
            y: [0, -10, 0],
            rotate: [-2, 2, -2],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Image
            src="/images/vintage-camera.png"
            alt="Vintage film camera"
            width={200}
            height={200}
            className="drop-shadow-2xl"
          />
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center pt-2">
          <div className="w-1.5 h-3 bg-gray-400 rounded-full" />
        </div>
      </motion.div>
    </section>
  );
}
```

#### Component: `ConceptPreview.tsx`

```typescript
// components/landing/ConceptPreview.tsx
'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { CONCEPTS } from '@/lib/constants/concepts';

export function ConceptPreview() {
  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl md:text-4xl text-gray-900 mb-4">
            당신의 여행 컨셉을 선택하세요
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto">
            세 가지 감성 컨셉 중 하나를 선택하면,
            그에 맞는 장소와 스타일을 큐레이션해드립니다.
          </p>
        </div>

        {/* Concept Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {CONCEPTS.map((concept, index) => (
            <motion.div
              key={concept.id}
              className="group relative overflow-hidden rounded-2xl bg-cream-50 border border-cream-200"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              whileHover={{ y: -8 }}
            >
              {/* Image */}
              <div className="aspect-[4/3] relative overflow-hidden">
                <Image
                  src={concept.image}
                  alt={concept.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="font-serif text-2xl mb-1">{concept.nameKo}</h3>
                <p className="text-sm text-white/80 mb-2">{concept.name}</p>
                <p className="text-sm text-white/70 line-clamp-2">
                  {concept.tagline}
                </p>
              </div>

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-sepia-900/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="text-center text-white p-6">
                  <p className="text-lg font-medium mb-2">{concept.description}</p>
                  <p className="text-sm text-white/70">
                    추천 필름: {concept.recommendedFilms.join(', ')}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

---

### 2. Chat Interface (`/chat`)

**Purpose**: AI chatbot for vibe extraction through natural conversation

#### Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│ Header (Logo + Progress Indicator)                      │
│ ━━━━━━━━━━━━━●━━━━━━━━━━━━━━━ Step 3/5                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   ┌─────────────────────────────────────────────────┐   │
│   │ CHAT CONTAINER                                   │   │
│   │                                                   │   │
│   │   ┌─────────────────────────────────────┐       │   │
│   │   │ 🤖 AI Message                        │       │   │
│   │   │ "Hello! I'm your Trip Kit curator..."│       │   │
│   │   └─────────────────────────────────────┘       │   │
│   │                                                   │   │
│   │            ┌─────────────────────────────┐       │   │
│   │            │ 👤 User Message             │       │   │
│   │            │ "I want something romantic" │       │   │
│   │            └─────────────────────────────┘       │   │
│   │                                                   │   │
│   │   ┌─────────────────────────────────────┐       │   │
│   │   │ 🤖 AI Message                        │       │   │
│   │   │ "Romantic vibes - I love that!..."  │       │   │
│   │   └─────────────────────────────────────┘       │   │
│   │                                                   │   │
│   │   ● ● ● (Typing Indicator)                       │   │
│   │                                                   │   │
│   └─────────────────────────────────────────────────┘   │
│                                                         │
│   ┌─────────────────────────────────────────────────┐   │
│   │ QUICK REPLY CHIPS (Optional)                     │   │
│   │ [Romantic] [Adventurous] [Nostalgic] [Peaceful]  │   │
│   └─────────────────────────────────────────────────┘   │
│                                                         │
├─────────────────────────────────────────────────────────┤
│   ┌─────────────────────────────────────────────────┐   │
│   │ [Type your message...                    ] [Send]│   │
│   └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

#### Component: `ChatContainer.tsx`

```typescript
// components/chat/ChatContainer.tsx
'use client';

import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '@/lib/store/useChatStore';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { ChatInput } from './ChatInput';
import { QuickReply } from './QuickReply';
import { ProgressBar } from './ProgressBar';

const STEP_ORDER = ['init', 'mood', 'aesthetic', 'duration', 'interests', 'complete'];
const QUICK_REPLIES = {
  mood: [
    { label: '로맨틱', value: 'romantic' },
    { label: '모험적', value: 'adventurous' },
    { label: '향수로운', value: 'nostalgic' },
    { label: '평화로운', value: 'peaceful' },
  ],
  aesthetic: [
    { label: '도시', value: 'urban' },
    { label: '자연', value: 'nature' },
    { label: '빈티지', value: 'vintage' },
    { label: '모던', value: 'modern' },
  ],
};

export function ChatContainer() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const {
    messages,
    currentStep,
    isLoading,
    sendMessage,
  } = useChatStore();

  const currentStepIndex = STEP_ORDER.indexOf(currentStep);
  const progress = ((currentStepIndex + 1) / STEP_ORDER.length) * 100;
  const quickReplies = QUICK_REPLIES[currentStep as keyof typeof QUICK_REPLIES];

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleQuickReply = (value: string) => {
    sendMessage(value);
  };

  return (
    <div className="flex flex-col h-screen bg-cream-50">
      {/* Header with Progress */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-cream-200 px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <h1 className="font-serif text-xl text-gray-900">Vibe Discovery</h1>
            <span className="text-sm text-gray-500">
              Step {currentStepIndex + 1} of {STEP_ORDER.length}
            </span>
          </div>
          <ProgressBar progress={progress} />
        </div>
      </header>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
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
      {quickReplies && !isLoading && (
        <motion.div
          className="px-4 py-2 border-t border-cream-200 bg-white"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="max-w-2xl mx-auto">
            <QuickReply options={quickReplies} onSelect={handleQuickReply} />
          </div>
        </motion.div>
      )}

      {/* Chat Input */}
      <div className="sticky bottom-0 px-4 py-4 border-t border-cream-200 bg-white/90 backdrop-blur-md">
        <div className="max-w-2xl mx-auto">
          <ChatInput
            onSend={sendMessage}
            disabled={isLoading}
            placeholder="메시지를 입력하세요..."
          />
        </div>
      </div>
    </div>
  );
}
```

#### Component: `MessageBubble.tsx`

```typescript
// components/chat/MessageBubble.tsx
'use client';

import { motion } from 'framer-motion';
import { formatTime } from '@/lib/utils/formatters';
import { cn } from '@/lib/utils/cn';

interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export function MessageBubble({ role, content, timestamp }: MessageBubbleProps) {
  const isUser = role === 'user';

  return (
    <div
      className={cn(
        'flex gap-3 max-w-[85%]',
        isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm',
          isUser
            ? 'bg-sepia-100 text-sepia-700'
            : 'bg-cream-200 text-gray-700'
        )}
      >
        {isUser ? '👤' : '📷'}
      </div>

      {/* Message Content */}
      <div className="flex flex-col gap-1">
        <div
          className={cn(
            'px-4 py-3 rounded-2xl text-[15px] leading-relaxed',
            isUser
              ? 'bg-sepia-600 text-white rounded-br-md'
              : 'bg-white text-gray-800 border border-cream-200 rounded-bl-md shadow-sm'
          )}
        >
          {/* Parse markdown-like formatting */}
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{
              __html: formatMessageContent(content),
            }}
          />
        </div>

        {/* Timestamp */}
        <span
          className={cn(
            'text-xs text-gray-400',
            isUser ? 'text-right' : 'text-left'
          )}
        >
          {formatTime(timestamp)}
        </span>
      </div>
    </div>
  );
}

function formatMessageContent(content: string): string {
  // Convert **bold** to <strong>
  let formatted = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // Convert line breaks
  formatted = formatted.replace(/\n/g, '<br />');
  return formatted;
}
```

---

### 3. Concept Selection (`/concept`)

**Purpose**: Visual selection of 3 aesthetic travel concepts

#### Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│ Header                                                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   ┌─────────────────────────────────────────────────┐   │
│   │ "어떤 감성으로 여행을 기록하고 싶으신가요?"        │   │
│   │ Choose your travel concept                        │   │
│   └─────────────────────────────────────────────────┘   │
│                                                         │
│   ┌───────────────────────────────────────────────────┐ │
│   │                                                   │ │
│   │   ╔═══════════════════════════════════════╗      │ │
│   │   ║         플라뇌르 (Flâneur)             ║      │ │
│   │   ║                                       ║      │ │
│   │   ║   [Full-width Immersive Image]        ║      │ │
│   │   ║                                       ║      │ │
│   │   ║   "지도 없이 걷는 낭만"                 ║      │ │
│   │   ║                                       ║      │ │
│   │   ║   Urban wandering, literary aesthetic  ║      │ │
│   │   ║                                       ║      │ │
│   │   ║   Recommended Films:                   ║      │ │
│   │   ║   Kodak Portra 400, Ilford HP5        ║      │ │
│   │   ║                                       ║      │ │
│   │   ║   [Select This Concept]               ║      │ │
│   │   ╚═══════════════════════════════════════╝      │ │
│   │                                                   │ │
│   │   ╔═══════════════════════════════════════╗      │ │
│   │   ║         필름 로그 (Film Log)           ║      │ │
│   │   ║           ...                         ║      │ │
│   │   ╚═══════════════════════════════════════╝      │ │
│   │                                                   │ │
│   │   ╔═══════════════════════════════════════╗      │ │
│   │   ║         미드나잇 (Midnight)            ║      │ │
│   │   ║           ...                         ║      │ │
│   │   ╚═══════════════════════════════════════╝      │ │
│   │                                                   │ │
│   └───────────────────────────────────────────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### Component: `ConceptCard.tsx`

```typescript
// components/concept/ConceptCard.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useVibeStore } from '@/lib/store/useVibeStore';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils/cn';

interface ConceptCardProps {
  concept: {
    id: 'flaneur' | 'filmlog' | 'midnight';
    name: string;
    nameKo: string;
    tagline: string;
    description: string;
    image: string;
    sampleImages: string[];
    recommendedFilms: string[];
    cameraModels: string[];
    outfitStyle: string;
  };
  isSelected: boolean;
  onSelect: () => void;
}

export function ConceptCard({ concept, isSelected, onSelect }: ConceptCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();
  const { setConcept } = useVibeStore();

  const handleSelect = () => {
    setConcept(concept.id);
    onSelect();
  };

  const handleProceed = () => {
    router.push('/destinations');
  };

  return (
    <motion.div
      layout
      className={cn(
        'relative rounded-3xl overflow-hidden transition-all duration-500',
        isSelected
          ? 'ring-4 ring-sepia-500 shadow-2xl'
          : 'ring-1 ring-cream-200 hover:ring-2 hover:ring-cream-300'
      )}
      whileHover={{ scale: isSelected ? 1 : 1.02 }}
    >
      {/* Main Image */}
      <div className="relative aspect-[16/9] md:aspect-[21/9]">
        <Image
          src={concept.image}
          alt={concept.name}
          fill
          className="object-cover"
          priority
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* Content Overlay */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
          {/* Title */}
          <motion.div layout="position">
            <Badge
              variant={isSelected ? 'primary' : 'secondary'}
              className="mb-3"
            >
              {isSelected ? '✓ Selected' : 'Concept'}
            </Badge>

            <h3 className="font-serif text-3xl md:text-4xl text-white mb-2">
              {concept.nameKo}
            </h3>
            <p className="text-white/80 text-lg mb-1">{concept.name}</p>
            <p className="text-white/60 text-sm italic">"{concept.tagline}"</p>
          </motion.div>

          {/* Expanded Content */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 space-y-4"
              >
                <p className="text-white/90">{concept.description}</p>

                {/* Sample Images */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {concept.sampleImages.map((img, idx) => (
                    <div
                      key={idx}
                      className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden"
                    >
                      <Image
                        src={img}
                        alt={`${concept.name} sample ${idx + 1}`}
                        width={96}
                        height={96}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ))}
                </div>

                {/* Details */}
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="text-white/60 mb-1">추천 필름</h4>
                    <p className="text-white">{concept.recommendedFilms.join(', ')}</p>
                  </div>
                  <div>
                    <h4 className="text-white/60 mb-1">추천 카메라</h4>
                    <p className="text-white">{concept.cameraModels.join(', ')}</p>
                  </div>
                  <div className="md:col-span-2">
                    <h4 className="text-white/60 mb-1">스타일 가이드</h4>
                    <p className="text-white">{concept.outfitStyle}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-white hover:text-white hover:bg-white/20"
            >
              {isExpanded ? '접기' : '자세히 보기'}
            </Button>

            {!isSelected ? (
              <Button
                variant="primary"
                onClick={handleSelect}
                className="flex-1 md:flex-none"
              >
                이 컨셉 선택
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={handleProceed}
                className="flex-1 md:flex-none"
              >
                다음 단계로 →
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
```

---

### 4. Destination Results (`/destinations`)

**Purpose**: Display 3 AI-recommended destinations

#### Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│ Header                                                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   ┌─────────────────────────────────────────────────┐   │
│   │ "당신의 Vibe에 맞는 여행지를 찾았어요!"           │   │
│   │ Selected Concept: [Film Log] Badge               │   │
│   └─────────────────────────────────────────────────┘   │
│                                                         │
│   ┌─────────────────────────────────────────────────┐   │
│   │ DESTINATION CARDS (Vertical Stack on Mobile)     │   │
│   │                                                   │   │
│   │ ┌─────────────────────────────────────────────┐ │   │
│   │ │ 📍 Cinque Terre Hidden Trails               │ │   │
│   │ │    Italy                                    │ │   │
│   │ │                                             │ │   │
│   │ │ [Image with Film Aesthetic]                 │ │   │
│   │ │                                             │ │   │
│   │ │ "Lesser-known hiking paths..."              │ │   │
│   │ │                                             │ │   │
│   │ │ ✓ Match Reason: Perfect for film...        │ │   │
│   │ │                                             │ │   │
│   │ │ 📸 Photography: 9/10                        │ │   │
│   │ │ 🚃 Access: Moderate                         │ │   │
│   │ │ 🛡️ Safety: 9/10                             │ │   │
│   │ │                                             │ │   │
│   │ │ [Explore Hidden Spots] Primary Button       │ │   │
│   │ └─────────────────────────────────────────────┘ │   │
│   │                                                   │   │
│   │ ┌─────────────────────────────────────────────┐ │   │
│   │ │ 📍 Montmartre Artist Quarter (Collapsed)    │ │   │
│   │ └─────────────────────────────────────────────┘ │   │
│   │                                                   │   │
│   │ ┌─────────────────────────────────────────────┐ │   │
│   │ │ 📍 Porto Ribeira District (Collapsed)       │ │   │
│   │ └─────────────────────────────────────────────┘ │   │
│   │                                                   │   │
│   └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### Component: `DestinationCard.tsx`

```typescript
// components/destinations/DestinationCard.tsx
'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Destination } from '@/lib/types/destination';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils/cn';

interface DestinationCardProps {
  destination: Destination;
  isExpanded: boolean;
  onToggle: () => void;
  index: number;
}

export function DestinationCard({
  destination,
  isExpanded,
  onToggle,
  index,
}: DestinationCardProps) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      className={cn(
        'bg-white rounded-2xl overflow-hidden border transition-all duration-300',
        isExpanded
          ? 'border-sepia-300 shadow-xl'
          : 'border-cream-200 hover:border-cream-300 hover:shadow-md'
      )}
    >
      {/* Header (Always Visible) */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 p-4 text-left"
      >
        {/* Thumbnail */}
        <div className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden relative">
          <Image
            src={destination.thumbnail || '/images/placeholder-destination.jpg'}
            alt={destination.name}
            fill
            className="object-cover"
          />
        </div>

        {/* Title & Location */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">📍</span>
            <h3 className="font-serif text-lg text-gray-900 truncate">
              {destination.name}
            </h3>
          </div>
          <p className="text-sm text-gray-500">
            {destination.city}, {destination.country}
          </p>
          {!isExpanded && (
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" size="sm">
                📸 {destination.photographyScore}/10
              </Badge>
            </div>
          )}
        </div>

        {/* Expand Icon */}
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0 w-8 h-8 rounded-full bg-cream-100 flex items-center justify-center"
        >
          <span className="text-gray-500">▼</span>
        </motion.div>
      </button>

      {/* Expanded Content */}
      <motion.div
        initial={false}
        animate={{
          height: isExpanded ? 'auto' : 0,
          opacity: isExpanded ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="px-4 pb-6 space-y-4">
          {/* Main Image */}
          <div className="relative aspect-video rounded-xl overflow-hidden">
            <Image
              src={destination.image || '/images/placeholder-destination.jpg'}
              alt={destination.name}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>

          {/* Description */}
          <p className="text-gray-700 leading-relaxed">
            {destination.description}
          </p>

          {/* Match Reason */}
          <div className="bg-sepia-50 rounded-xl p-4 border border-sepia-100">
            <h4 className="text-sm font-medium text-sepia-800 mb-2 flex items-center gap-2">
              <span>✓</span> Why this matches your vibe
            </h4>
            <p className="text-sm text-sepia-700">{destination.matchReason}</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-cream-50 rounded-xl">
              <div className="text-xl mb-1">📸</div>
              <div className="text-xs text-gray-500 mb-0.5">Photography</div>
              <div className="font-semibold text-gray-900">
                {destination.photographyScore}/10
              </div>
            </div>
            <div className="text-center p-3 bg-cream-50 rounded-xl">
              <div className="text-xl mb-1">🚃</div>
              <div className="text-xs text-gray-500 mb-0.5">Access</div>
              <div className="font-semibold text-gray-900 capitalize">
                {destination.transportAccessibility}
              </div>
            </div>
            <div className="text-center p-3 bg-cream-50 rounded-xl">
              <div className="text-xl mb-1">🛡️</div>
              <div className="text-xs text-gray-500 mb-0.5">Safety</div>
              <div className="font-semibold text-gray-900">
                {destination.safetyRating}/10
              </div>
            </div>
          </div>

          {/* Best Time */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>🗓️</span>
            <span>Best time: {destination.bestTimeToVisit}</span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {destination.tags?.map((tag) => (
              <Badge key={tag} variant="outline" size="sm">
                #{tag}
              </Badge>
            ))}
          </div>

          {/* CTA Button */}
          <Link href={`/destinations/${destination.id}/spots`} className="block">
            <Button variant="primary" size="lg" className="w-full">
              <span>숨겨진 스팟 탐색하기</span>
              <span className="ml-2">→</span>
            </Button>
          </Link>
        </div>
      </motion.div>
    </motion.article>
  );
}
```

### SSE 스트리밍 구현 (destinations/page.tsx)

```typescript
const loadDestinationsStream = useCallback(async () => {
  const response = await fetch("/api/recommendations/destinations/stream", {
    method: "POST",
    body: JSON.stringify({ preferences, concept }),
    signal: abortControllerRef.current.signal,
  });

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const event = JSON.parse(line.slice(6));
        if (event.type === "destination") {
          addDestination(event.destination);  // 실시간 UI 업데이트
        }
      }
    }
  }
}, []);
```

---

### 5. TripKit Page (`/tripkit`)

**Purpose**: 완성된 여행 패키지를 선물 상자 UI로 표시

#### Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│ Header                                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ "당신만의 여행 패키지가 완성되었어요!"                     │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ GIFT BOX (Unwrapping Animation)                         │   │
│   │                                                         │   │
│   │   ┌─────────────────────────────────────────────────┐   │   │
│   │   │           🎁 선물 상자                           │   │   │
│   │   │                                                 │   │   │
│   │   │         [Click to Unwrap]                       │   │   │
│   │   │                                                 │   │   │
│   │   └─────────────────────────────────────────────────┘   │   │
│   │                                                         │   │
│   │   [After Unwrap]                                        │   │
│   │   ┌─────────────────────────────────────────────────┐   │   │
│   │   │ 📍 Selected Destination                         │   │   │
│   │   │ 🎨 Selected Concept                             │   │   │
│   │   │ 📷 Camera Recommendation                        │   │   │
│   │   │ 🎞️ Film Stock                                   │   │   │
│   │   │ 👗 Outfit Style                                 │   │   │
│   │   └─────────────────────────────────────────────────┘   │   │
│   │                                                         │   │
│   │   [Generate Preview Image] Primary Button               │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### 6. Hidden Spots Gallery (향후 구현)

**Purpose**: Display 5-10 hidden spots for selected destination

#### Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│ Header + Back Button                                    │
├─────────────────────────────────────────────────────────┤
│   ┌─────────────────────────────────────────────────┐   │
│   │ 📍 Cinque Terre Hidden Trails                    │   │
│   │ Italy | Film Log Concept                         │   │
│   │                                                   │   │
│   │ "8개의 숨겨진 스팟을 발견했어요"                   │   │
│   └─────────────────────────────────────────────────┘   │
│                                                         │
│   ┌─────────────────────────────────────────────────┐   │
│   │ FILTER CHIPS                                     │   │
│   │ [All] [Sunrise] [Sunset] [Low Crowd]            │   │
│   └─────────────────────────────────────────────────┘   │
│                                                         │
│   ┌─────────────────────────────────────────────────┐   │
│   │ MASONRY GRID / LIST VIEW                         │   │
│   │                                                   │   │
│   │ ┌───────────┐ ┌───────────┐ ┌───────────┐       │   │
│   │ │ Spot 1    │ │ Spot 2    │ │ Spot 3    │       │   │
│   │ │           │ │           │ │           │       │   │
│   │ │ [Image]   │ │ [Image]   │ │ [Image]   │       │   │
│   │ │           │ │           │ │           │       │   │
│   │ │ Name      │ │ Name      │ │ Name      │       │   │
│   │ │ 🌅 Sunset │ │ 🌄 Sunrise│ │ 📸 Photo  │       │   │
│   │ │ 👥 Low    │ │ 👥 Medium │ │ 👥 Low    │       │   │
│   │ └───────────┘ └───────────┘ └───────────┘       │   │
│   │                                                   │   │
│   │ ┌───────────┐ ┌───────────┐ ┌───────────┐       │   │
│   │ │ Spot 4    │ │ Spot 5    │ │ Spot 6    │       │   │
│   │ │    ...    │ │    ...    │ │    ...    │       │   │
│   │ └───────────┘ └───────────┘ └───────────┘       │   │
│   │                                                   │   │
│   └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### Component: `SpotCard.tsx`

```typescript
// components/spots/SpotCard.tsx
'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { HiddenSpot } from '@/lib/types/spot';
import { Badge } from '@/components/ui/Badge';

interface SpotCardProps {
  spot: HiddenSpot;
  destinationId: string;
  index: number;
}

export function SpotCard({ spot, destinationId, index }: SpotCardProps) {
  const getCrowdIcon = (level: string) => {
    switch (level) {
      case 'low':
        return '👤';
      case 'medium':
        return '👥';
      case 'high':
        return '👨‍👩‍👧‍👦';
      default:
        return '👤';
    }
  };

  const getTimeIcon = (time: string) => {
    const timeLower = time.toLowerCase();
    if (timeLower.includes('sunrise') || timeLower.includes('morning')) return '🌄';
    if (timeLower.includes('sunset') || timeLower.includes('evening')) return '🌅';
    if (timeLower.includes('night')) return '🌙';
    return '☀️';
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      className="group"
    >
      <Link href={`/destinations/${destinationId}/spots/${spot.id}`}>
        <div className="bg-white rounded-2xl overflow-hidden border border-cream-200 hover:border-sepia-300 hover:shadow-lg transition-all duration-300">
          {/* Image */}
          <div className="relative aspect-[4/3] overflow-hidden">
            <Image
              src={spot.image || '/images/placeholder-spot.jpg'}
              alt={spot.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />

            {/* Film Grain Overlay */}
            <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('/images/film-grain.png')] bg-repeat" />

            {/* Badges */}
            <div className="absolute top-3 left-3 flex gap-2">
              <Badge variant="dark" size="sm">
                {getTimeIcon(spot.bestTimeToVisit)} {spot.bestTimeToVisit.split(' ')[0]}
              </Badge>
            </div>

            {/* Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          {/* Content */}
          <div className="p-4">
            <h3 className="font-serif text-lg text-gray-900 mb-1 line-clamp-1">
              {spot.name}
            </h3>

            <p className="text-sm text-gray-500 line-clamp-2 mb-3">
              {spot.description}
            </p>

            {/* Meta Info */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-gray-500">
                  {getCrowdIcon(spot.crowdLevel)}
                  <span className="capitalize">{spot.crowdLevel}</span>
                </span>
                <span className="flex items-center gap-1 text-gray-500">
                  ⏱️ {spot.estimatedDuration}
                </span>
              </div>

              {/* Film Recommendation Preview */}
              {spot.filmRecommendations?.[0] && (
                <Badge variant="outline" size="sm">
                  🎞️ {spot.filmRecommendations[0].filmStock.split(' ')[0]}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
```

---

### 6. Spot Detail (`/destinations/[id]/spots/[spotId]`)

**Purpose**: Full detail view of hidden spot with photography tips and styling

#### Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│ Header + Back Button                                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   ┌─────────────────────────────────────────────────┐   │
│   │ HERO IMAGE (Full Width)                          │   │
│   │ ┌─────────────────────────────────────────────┐ │   │
│   │ │                                             │ │   │
│   │ │         [Large Spot Image]                  │ │   │
│   │ │                                             │ │   │
│   │ │                                             │ │   │
│   │ └─────────────────────────────────────────────┘ │   │
│   │                                                   │   │
│   │ 📍 Via dell'Amore Secret Overlook                │   │
│   │ Cinque Terre, Italy                               │   │
│   └─────────────────────────────────────────────────┘   │
│                                                         │
│   ┌─────────────────────────────────────────────────┐   │
│   │ TAB NAVIGATION                                   │   │
│   │ [Overview] [Photography] [Styling] [Practical]  │   │
│   └─────────────────────────────────────────────────┘   │
│                                                         │
│   ┌─────────────────────────────────────────────────┐   │
│   │ TAB CONTENT                                      │   │
│   │                                                   │   │
│   │ [Overview Tab]                                   │   │
│   │ - Description                                    │   │
│   │ - Best Time to Visit                             │   │
│   │ - Duration                                       │   │
│   │ - Crowd Level                                    │   │
│   │ - Local Tip                                      │   │
│   │                                                   │   │
│   │ [Photography Tab]                                │   │
│   │ - Photography Tips (List)                        │   │
│   │ - Best Angles (Cards with diagrams)              │   │
│   │ - Film Recommendations                           │   │
│   │                                                   │   │
│   │ [Styling Tab]                                    │   │
│   │ - Camera & Settings                              │   │
│   │ - Outfit Recommendations                         │   │
│   │ - Props                                          │   │
│   │                                                   │   │
│   │ [Practical Tab]                                  │   │
│   │ - Accessibility Notes                            │   │
│   │ - Nearby Amenities                               │   │
│   │ - Safety Notes                                   │   │
│   │ - Map (Optional)                                 │   │
│   └─────────────────────────────────────────────────┘   │
│                                                         │
│   ┌─────────────────────────────────────────────────┐   │
│   │ FLOATING ACTION BAR                              │   │
│   │ [Generate Preview Image] [View Full Styling]     │   │
│   └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

### 7. Image Generation (`/generate`)

**Purpose**: Generate AI film-aesthetic preview image

#### Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│ Header                                                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   ┌─────────────────────────────────────────────────┐   │
│   │ "당신의 여행 Vibe를 미리 보여드릴게요"             │   │
│   │                                                   │   │
│   │ Location: Via dell'Amore Secret Overlook          │   │
│   │ Concept: Film Log                                 │   │
│   └─────────────────────────────────────────────────┘   │
│                                                         │
│   ┌─────────────────────────────────────────────────┐   │
│   │ CUSTOMIZATION OPTIONS                            │   │
│   │                                                   │   │
│   │ Film Stock:                                      │   │
│   │ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐         │   │
│   │ │Kodak  │ │Kodak  │ │Fuji   │ │Ilford │         │   │
│   │ │Color+ │ │Portra │ │Superia│ │HP5    │         │   │
│   │ │(●)    │ │( )    │ │( )    │ │( )    │         │   │
│   │ └───────┘ └───────┘ └───────┘ └───────┘         │   │
│   │                                                   │   │
│   │ Time of Day:                                     │   │
│   │ [Morning] [Noon] [Sunset ✓] [Night]              │   │
│   │                                                   │   │
│   │ Outfit Style:                                    │   │
│   │ [Vintage denim jacket, white sundress    ]       │   │
│   │                                                   │   │
│   └─────────────────────────────────────────────────┘   │
│                                                         │
│   ┌─────────────────────────────────────────────────┐   │
│   │ GENERATION AREA                                  │   │
│   │                                                   │   │
│   │ [Before Generation]                              │   │
│   │ ┌─────────────────────────────────────────────┐ │   │
│   │ │                                             │ │   │
│   │ │     📷 Generate Preview Button              │ │   │
│   │ │     (Estimated: ~15 seconds)                │ │   │
│   │ │                                             │ │   │
│   │ └─────────────────────────────────────────────┘ │   │
│   │                                                   │   │
│   │ [During Generation]                              │   │
│   │ ┌─────────────────────────────────────────────┐ │   │
│   │ │                                             │ │   │
│   │ │     ⏳ Generating your vibe...               │ │   │
│   │ │     ━━━━━━━━━━●━━━━━━━━━━ 65%               │ │   │
│   │ │     "Applying film grain texture..."        │ │   │
│   │ │                                             │ │   │
│   │ └─────────────────────────────────────────────┘ │   │
│   │                                                   │   │
│   │ [After Generation]                               │   │
│   │ ┌─────────────────────────────────────────────┐ │   │
│   │ │                                             │ │   │
│   │ │     [Generated Image with Film Aesthetic]   │ │   │
│   │ │                                             │ │   │
│   │ └─────────────────────────────────────────────┘ │   │
│   │                                                   │   │
│   │ [Download] [Regenerate] [Share]                  │   │
│   │                                                   │   │
│   └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### Component: `ImageGenerator.tsx`

```typescript
// components/generate/ImageGenerator.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useImageGeneration } from '@/lib/hooks/useImageGeneration';
import { Button } from '@/components/ui/Button';
import { GenerationProgress } from './GenerationProgress';
import { FilmStockSelector } from './FilmStockSelector';
import { TimeOfDaySelector } from './TimeOfDaySelector';

interface ImageGeneratorProps {
  spotId: string;
  spotName: string;
  spotDescription: string;
  concept: string;
}

export function ImageGenerator({
  spotId,
  spotName,
  spotDescription,
  concept,
}: ImageGeneratorProps) {
  const [filmStock, setFilmStock] = useState('kodak_colorplus');
  const [timeOfDay, setTimeOfDay] = useState('sunset');
  const [outfitStyle, setOutfitStyle] = useState('Vintage denim jacket, white sundress');

  const {
    generate,
    isLoading,
    progress,
    progressMessage,
    imageUrl,
    error,
    reset,
  } = useImageGeneration();

  const handleGenerate = () => {
    generate({
      locationId: spotId,
      locationName: spotName,
      locationDescription: spotDescription,
      concept,
      filmStock,
      outfitStyle,
      timeOfDay,
    });
  };

  const handleDownload = async () => {
    if (!imageUrl) return;

    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tripkit-${spotName.replace(/\s+/g, '-')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Customization Options */}
      <div className="bg-white rounded-2xl p-6 border border-cream-200 space-y-6">
        <h3 className="font-serif text-lg text-gray-900">이미지 커스터마이징</h3>

        {/* Film Stock Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            필름 스톡
          </label>
          <FilmStockSelector
            selected={filmStock}
            onSelect={setFilmStock}
          />
        </div>

        {/* Time of Day */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            촬영 시간
          </label>
          <TimeOfDaySelector
            selected={timeOfDay}
            onSelect={setTimeOfDay}
          />
        </div>

        {/* Outfit Style */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            의상 스타일
          </label>
          <input
            type="text"
            value={outfitStyle}
            onChange={(e) => setOutfitStyle(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-cream-200 focus:border-sepia-400 focus:ring-2 focus:ring-sepia-100 outline-none transition-all"
            placeholder="예: Vintage denim jacket, white sundress"
          />
        </div>
      </div>

      {/* Generation Area */}
      <div className="bg-white rounded-2xl p-6 border border-cream-200">
        <AnimatePresence mode="wait">
          {/* Initial State */}
          {!isLoading && !imageUrl && !error && (
            <motion.div
              key="initial"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-sepia-50 flex items-center justify-center">
                <span className="text-4xl">📷</span>
              </div>
              <p className="text-gray-500 mb-6">
                AI가 당신의 여행 Vibe를 시각화해드립니다
              </p>
              <Button
                variant="primary"
                size="lg"
                onClick={handleGenerate}
                className="px-8"
              >
                미리보기 생성하기
              </Button>
              <p className="text-sm text-gray-400 mt-3">
                예상 소요 시간: ~15초
              </p>
            </motion.div>
          )}

          {/* Loading State */}
          {isLoading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <GenerationProgress
                progress={progress}
                message={progressMessage}
              />
            </motion.div>
          )}

          {/* Success State */}
          {imageUrl && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-4"
            >
              <div className="relative aspect-square rounded-xl overflow-hidden">
                <Image
                  src={imageUrl}
                  alt="Generated preview"
                  fill
                  className="object-cover"
                />
                {/* Film Grain Overlay */}
                <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('/images/film-grain.png')] bg-repeat" />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={handleDownload}
                >
                  <span className="mr-2">⬇️</span>
                  다운로드
                </Button>
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={reset}
                >
                  <span className="mr-2">🔄</span>
                  다시 생성
                </Button>
              </div>
            </motion.div>
          )}

          {/* Error State */}
          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
                <span className="text-2xl">❌</span>
              </div>
              <p className="text-red-600 mb-4">{error}</p>
              <Button variant="secondary" onClick={reset}>
                다시 시도
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
```

---

### 8. Summary Page (`/summary`)

**Purpose**: Final recommendations summary with all details

#### Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│ Header                                                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   ┌─────────────────────────────────────────────────┐   │
│   │ "당신만의 여행 큐레이션이 완성되었습니다!"        │   │
│   │                                                   │   │
│   │ YOUR VIBE PROFILE                                │   │
│   │ Mood: Romantic | Aesthetic: Vintage              │   │
│   │ Concept: Film Log                                │   │
│   └─────────────────────────────────────────────────┘   │
│                                                         │
│   ┌─────────────────────────────────────────────────┐   │
│   │ SELECTED DESTINATION                             │   │
│   │ 📍 Cinque Terre Hidden Trails, Italy            │   │
│   └─────────────────────────────────────────────────┘   │
│                                                         │
│   ┌─────────────────────────────────────────────────┐   │
│   │ HIDDEN SPOTS (Carousel/Grid)                     │   │
│   │ • Via dell'Amore Secret Overlook                 │   │
│   │ • Vernazza Fisherman's Wharf                     │   │
│   │ • ...                                            │   │
│   └─────────────────────────────────────────────────┘   │
│                                                         │
│   ┌─────────────────────────────────────────────────┐   │
│   │ COMPLETE STYLING PACKAGE                         │   │
│   │                                                   │   │
│   │ 📷 Camera: Canon AE-1                            │   │
│   │ 🎞️ Film: Kodak ColorPlus 200                     │   │
│   │ ⚙️ Settings: f/2.8, 1/250s, ISO 200             │   │
│   │ 👗 Outfit: [Color Palette + Items]               │   │
│   │ 🧸 Props: Vintage camera, flowers, journal       │   │
│   │ 📐 Angles: [Angle Cards]                         │   │
│   └─────────────────────────────────────────────────┘   │
│                                                         │
│   ┌─────────────────────────────────────────────────┐   │
│   │ GENERATED IMAGES (Gallery)                       │   │
│   │ [Image 1] [Image 2] [Image 3]                    │   │
│   └─────────────────────────────────────────────────┘   │
│                                                         │
│   ┌─────────────────────────────────────────────────┐   │
│   │ ACTION BUTTONS                                   │   │
│   │ [Start New Journey] [Share] [Export PDF]         │   │
│   └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## State Management

### Zustand Stores

TripKit은 두 개의 Zustand 스토어를 사용합니다:
- `useChatStore`: 대화 상태 및 세션 관리 (7일 TTL)
- `useVibeStore`: 추천 결과 및 이미지 생성 상태

### 1. useChatStore - 대화 상태 관리

```typescript
// lib/store/useChatStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ChatState {
  // Session (7일 TTL)
  sessionId: string;
  sessionCreatedAt: number;
  sessionLastActiveAt: number;

  // Messages
  messages: Message[];
  currentStep: ConversationStep;  // init → mood → aesthetic → ... → complete

  // Collected Data
  collectedData: TripKitProfile;
  rejectedItems: RejectedItems;

  // Actions
  initSession: () => string;      // 세션 초기화/복구
  resetSession: () => string;     // 세션 리셋
  addMessage: (msg: Message) => void;
  loadFromHistory: (history: ChatHistory) => void;
}

// 대화 단계 (10단계)
type ConversationStep =
  | 'init' | 'mood' | 'aesthetic' | 'duration'
  | 'interests' | 'destination' | 'scene'
  | 'styling' | 'summary' | 'complete';

// persist middleware로 localStorage 저장
export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      // ... state and actions
    }),
    {
      name: 'tripkit-chat-storage',
      // 7일 TTL 세션 관리
    }
  )
);
```

### 2. useVibeStore - 추천 및 이미지 생성 상태

```typescript
// lib/store/useVibeStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface VibeState {
  // User Selection
  selectedConcept: Concept | null;
  selectedDestination: Destination | null;
  preferences: UserPreferences;

  // Recommendations (SSE로 점진적 추가)
  destinations: Destination[];
  hiddenSpots: HiddenSpot[];

  // Image Generation
  generatedImages: GeneratedImage[];
  imageGenerationContext: ImageGenerationContext | null;

  // TripKit 챗봇
  tripKitProfile: TripKitProfile;
  tripKitStep: TripKitStep;

  // Actions
  addDestination: (dest: Destination) => void;    // 스트리밍 destination 추가
  clearDestinations: () => void;                   // 새 추천 시 초기화
  setImageGenerationContext: (ctx: ImageGenerationContext) => void;
}

// partialize로 일부 필드만 localStorage 저장
export const useVibeStore = create<VibeState>()(
  persist(
    (set, get) => ({
      // ... state and actions
    }),
    {
      name: 'tripkit-vibe-storage',
      partialize: (state) => ({
        selectedConcept: state.selectedConcept,
        selectedDestination: state.selectedDestination,
        generatedImages: state.generatedImages,
      }),
    }
  )
);
```

---

## Design System

### Color Palette

```css
/* globals.css */
:root {
  /* Primary - Sepia/Warm Browns */
  --color-sepia-50: #FDF8F4;
  --color-sepia-100: #F9EFE7;
  --color-sepia-200: #F0DCCC;
  --color-sepia-300: #E3C4A9;
  --color-sepia-400: #D4A77A;
  --color-sepia-500: #C4894D;
  --color-sepia-600: #A67035;
  --color-sepia-700: #7D5428;
  --color-sepia-800: #543A1D;
  --color-sepia-900: #2E2012;

  /* Neutral - Cream Tones */
  --color-cream-50: #FDFBF9;
  --color-cream-100: #FAF7F4;
  --color-cream-200: #F4EDE6;
  --color-cream-300: #E8DDD2;
  --color-cream-400: #D4C4B2;

  /* Film Aesthetic Colors */
  --color-film-warm: #E8D4B8;      /* Kodak ColorPlus */
  --color-film-neutral: #D8D0C8;   /* Kodak Portra */
  --color-film-cool: #C8D4D8;      /* Fuji Superia */
  --color-film-mono: #B0B0B0;      /* Ilford HP5 */
}
```

### Typography

```css
/* globals.css */
@import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;500;600;700&display=swap');

:root {
  --font-serif: 'Libre Baskerville', Georgia, serif;
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Typography Scale */
.text-display { font-size: 3.5rem; line-height: 1.1; }
.text-h1 { font-size: 2.5rem; line-height: 1.2; }
.text-h2 { font-size: 2rem; line-height: 1.25; }
.text-h3 { font-size: 1.5rem; line-height: 1.3; }
.text-body { font-size: 1rem; line-height: 1.6; }
.text-small { font-size: 0.875rem; line-height: 1.5; }
.text-caption { font-size: 0.75rem; line-height: 1.4; }
```

### Component Variants

```typescript
// lib/utils/cn.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Button variants
const buttonVariants = {
  primary: 'bg-sepia-600 text-white hover:bg-sepia-700 active:bg-sepia-800',
  secondary: 'bg-cream-100 text-gray-800 hover:bg-cream-200 border border-cream-300',
  ghost: 'bg-transparent text-gray-600 hover:bg-cream-100',
  outline: 'bg-transparent border-2 border-sepia-600 text-sepia-600 hover:bg-sepia-50',
};

// Badge variants
const badgeVariants = {
  primary: 'bg-sepia-100 text-sepia-700',
  secondary: 'bg-cream-100 text-gray-600',
  dark: 'bg-black/70 text-white backdrop-blur-sm',
  outline: 'bg-transparent border border-cream-300 text-gray-600',
};
```

---

## Animations

```typescript
// lib/constants/animations.ts
import { Variants } from 'framer-motion';

export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export const staggerContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

export const slideInFromRight: Variants = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 },
};

// Page transition
export const pageTransition = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3 },
};
```

---

## Mobile Responsiveness

### Breakpoints

```typescript
// tailwind.config.js
module.exports = {
  theme: {
    screens: {
      'sm': '640px',   // Mobile landscape
      'md': '768px',   // Tablet
      'lg': '1024px',  // Desktop
      'xl': '1280px',  // Large desktop
      '2xl': '1536px', // Extra large
    },
  },
};
```

### Mobile-First Patterns

```tsx
// Example: Responsive Grid
<div className="
  grid
  grid-cols-1
  sm:grid-cols-2
  lg:grid-cols-3
  gap-4
  md:gap-6
">
  {items.map(item => <Card key={item.id} />)}
</div>

// Example: Responsive Typography
<h1 className="
  font-serif
  text-2xl
  md:text-4xl
  lg:text-5xl
">
  Title
</h1>

// Example: Mobile-only / Desktop-only
<MobileNav className="md:hidden" />
<DesktopNav className="hidden md:flex" />
```

---

## Performance Optimization

### Image Optimization

```typescript
// Use Next.js Image component with proper sizing
<Image
  src={imageSrc}
  alt={altText}
  fill
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  placeholder="blur"
  blurDataURL={blurDataUrl}
  loading="lazy"
/>
```

### Code Splitting

```typescript
// Lazy load heavy components
import dynamic from 'next/dynamic';

const ImageGenerator = dynamic(
  () => import('@/components/generate/ImageGenerator'),
  {
    loading: () => <Skeleton className="aspect-square" />,
    ssr: false,
  }
);

const StylingPackage = dynamic(
  () => import('@/components/styling/StylingPackage'),
  { loading: () => <Skeleton className="h-96" /> }
);
```

### React Query Caching

```typescript
// lib/hooks/useDestinations.ts
import { useQuery } from '@tanstack/react-query';
import { fetchDestinations } from '@/lib/api/destinations';

export function useDestinations(preferences: UserPreferences) {
  return useQuery({
    queryKey: ['destinations', preferences],
    queryFn: () => fetchDestinations(preferences),
    staleTime: 1000 * 60 * 10, // 10 minutes
    cacheTime: 1000 * 60 * 30, // 30 minutes
    retry: 2,
  });
}
```

---

## User Flow

```
[Landing /] → [Chat /chat] → [Concept /concept] → [Destinations /destinations] → [TripKit /tripkit] → [Generate /generate]
     │           │              │                      │                            │                    │
     │           │              │                      │                            │                    └── 이미지 생성
     │           │              │                      │                            └── 여행 패키지 완성
     │           │              │                      └── SSE 스트리밍 추천
     │           │              └── 컨셉 선택 (flaneur/filmlog/midnight)
     │           └── AI 대화 (10단계 Human-in-the-loop)
     └── 랜딩 페이지
```

---

## Revision History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0.0 | 2025-12-04 | Initial Frontend Design Specification | Frontend Team |
| 2.0.0 | 2025-12-10 | Updated to reflect actual implementation (TripKit page, SSE streaming, state management) | Frontend Team |

---

**Document Status**: Updated to reflect actual implementation
**Last Updated**: 2025-12-10
