# Trip Kit - Product Requirements Document (PRD)
## MVP Version 2.0

---

## 📋 Document Information

- **Document Version**: 2.0.0
- **Last Updated**: 2025-12-10
- **Project Timeline**: MVP
- **Target Launch**: Core Features
- **Author**: Product Team
- **Status**: Active Development

---

## 🎯 Executive Summary

### Product Name
**Trip Kit (트립 키트)**

### Tagline
"당신은 티켓만 끊으세요. 여행의 '분위기(Vibe)'는 우리가 챙겨드립니다."
*("You just book the ticket. We'll take care of your travel vibe.")*

### One-Line Definition
AI가 사용자의 여행 '분위기(Vibe)'를 분석하여 [특별한 장소 → 의상 → 필름 카메라 스타일 → 소품]을 큐레이션해주는 감성 기반 여행 플랫폼.

**English**: AI-powered emotional travel platform that analyzes your travel "vibe" to curate [special locations → outfit styling → film camera aesthetics → props] for unforgettable aesthetic experiences.

### Problem Statement
**기존 여행 AI의 한계 (Pain Point)**:
- Existing travel AI focuses on **"efficiency"** (routes, itineraries, cost optimization)
- Services like Google Travel, Naver, TripAdvisor prioritize **planning automation**
- **Emotional preferences, aesthetic vision, and photography concepts are ignored**

**2030 세대가 원하는 것 (What Gen Z/Millennials Actually Want)**:
- **"인생샷 (Life Shots)"** + **"나만의 감성 (Personal Aesthetic)"** + **"스토리 있는 여행 (Story-driven Travel)"**
- Travel is not just about visiting—it's about **creating memorable records and shareable experiences**
- Instagram/Film/Lookbook culture: **Vibe matters more than destinations**

### Solution
Trip Kit analyzes user preferences through conversational AI to understand their **travel vibe**, then:

1. **AI Chatbot**: Extracts preferences through natural conversation (destination → scene → companion → duration → budget → style)
2. **Concept Selection**: Three aesthetic concepts (Flâneur, Film Log, Midnight)
3. **Hidden Spot Recommendations**: SSE streaming delivery of authentic, local-favorite locations
4. **Image Generation**: Creates film-aesthetic preview images using Gemini Imagen
5. **TripKit Package**: Complete styling package (film camera + outfit + props + camera settings)
6. **(Future) O2O Kit Delivery**: Physical rental kits delivered to your location (Post-MVP)

---

## 🎯 Product Vision & Goals

### Vision
**"여행의 감성을 설계하는 AI 큐레이터"**
*"The AI Curator That Designs Your Travel Vibe"*

Create the go-to platform where travelers discover their unique aesthetic identity and bring it to life through curated emotional experiences—not just destinations, but complete **vibe packages** that transform ordinary trips into unforgettable visual stories.

### Success Metrics (MVP)
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| User Onboarding Completion | 80% | Analytics tracking |
| AI Recommendation Accuracy | 70% | User feedback |
| Image Generation Success Rate | 90% | Technical metrics |
| Average Session Duration | 5+ min | Analytics |
| SSE Streaming Reliability | 95% | Technical metrics |

### Out of Scope (Post-MVP)
- O2O rental/delivery system
- Payment integration
- Inventory management
- User accounts & authentication
- Social sharing features

---

## 👥 Target Users

### Primary Persona: "Vibe Seeker Luna"
- **Age**: 24-32
- **Occupation**: Creative professional, content creator
- **Travel Style**: Aesthetic-focused, Instagram-oriented
- **Pain Points**:
  - Generic travel recommendations lack personality
  - Difficulty finding photogenic, non-touristy spots
  - Uncertain about what styling/props enhance travel photos
- **Goals**:
  - Capture unique, film-aesthetic travel content
  - Discover hidden local gems
  - Create memorable, shareable experiences

### Secondary Persona: "Experience Collector Max"
- **Age**: 26-35
- **Occupation**: Young professional
- **Travel Style**: Experience > sightseeing
- **Pain Points**:
  - Tired of mainstream tourist attractions
  - Wants authentic local experiences
  - Seeks guidance on aesthetic documentation

---

## ⚡ Core Value Proposition

### What Makes Trip Kit Different?

| Traditional Travel AI | Trip Kit |
|---------------------|----------|
| ❌ Efficiency-focused (routes, schedules) | ✅ **Vibe-focused** (mood, aesthetic, emotion) |
| ❌ Tourist-trap recommendations | ✅ **Hidden local spots** curated for photography |
| ❌ Generic "top 10" lists | ✅ **Personalized aesthetic packages** |
| ❌ "Where to go" | ✅ **"How to experience and capture it"** |
| ❌ Planning automation only | ✅ **Complete creative direction** (location + styling + equipment) |

### Core Value Delivery

① **감성 기반 'Vibe' 추천**: Mood / Aesthetic / Film / Outfit / Spots—여행 전체를 하나의 콘셉트로 패키징

② **시각화**: AI-generated preview images showing your imagined travel scene as reality (Gemini Imagen)

③ **실행 가능성**: Complete actionable package (location + outfit + film stock + camera settings + angles)

---

## 🎯 Core Features (MVP)

### 1. AI Chatbot for Vibe Analysis (ChatAgent)
**Priority**: P0 (Critical)

#### User Story
> "As a traveler, I want to chat with AI about my travel vibe so that I receive personalized destinations that match my emotional and aesthetic preferences—not just efficient routes, but places that resonate with my mood and creative vision."

#### Functional Requirements
- **Chat Interface**: Natural, conversational text-based flow with warm, empathetic tone
- **Session-Based Conversation**: LangGraph with MemorySaver for session persistence
- **Human-in-the-loop Pattern**: AI pauses for user input at each conversation step
- **Vibe Extraction Scenario** (7-10 conversation steps):
  - **travel_destination**: 여행 지역 (Where do you want to go?)
  - **travel_scene**: 꿈꾸는 장면 (What scene do you imagine?)
  - **travel_companion**: 동행자 (Who are you traveling with?)
  - **travel_duration**: 기간 (How long is your trip?)
  - **travel_budget**: 예산 (What's your budget?)
  - **travel_style**: 스타일 (What's your travel style?)
  - **special_requests**: 특별 요청 (Any special requests?)
- **AI Processing**:
  - LangGraph StateGraph with MemorySaver checkpointer
  - Session recovery for returning users
  - Suggested options for each question
- **Output**:
  - Collected preferences (collectedData)
  - Rejected items tracking (rejectedItems)
  - Suggested quick-reply options (suggestedOptions)

#### Acceptance Criteria
- [x] User can initiate conversation within 2 clicks
- [x] AI responds within 3 seconds
- [x] Session persists across page refreshes (7-day TTL)
- [x] Conversation can be resumed with same session ID
- [x] Quick-reply options provided for each question
- [x] User can restart or modify preferences

#### Technical Notes
- ChatAgent with Human-in-the-loop pattern
- MemorySaver for session state persistence
- Session ID synchronized between frontend (Zustand) and backend

---

### 2. Concept Selection System
**Priority**: P0 (Critical)

#### User Story
> "As a user, I want to choose from predefined aesthetic concepts so that I receive style-appropriate recommendations."

#### Functional Requirements
- **Concept Gallery**: Display 3 travel concepts:
  1. **플라뇌르 (Flâneur)**: "지도 없이 걷는 낭만" - Urban wandering, literary aesthetic
  2. **필름 로그 (Film Log)**: "빈티지 감성 기록" - Retro photography, analog feel
  3. **미드나잇 (Midnight)**: "과거 예술가와의 조우" - Artistic time travel, bohemian

- **Visual Presentation**: Each concept includes:
  - Representative image
  - Tagline
  - Sample film recommendations
  - Suggested styling direction
  - Framer Motion animations

- **Selection Flow**: Single-choice selection → impacts all downstream recommendations

#### Acceptance Criteria
- [x] All 3 concepts displayed with rich visuals
- [x] User can select one concept
- [x] Selection persists throughout session (Zustand store)
- [x] Visual feedback on selected concept (animations)
- [x] Recommendations adapt based on concept choice

---

### 3. Hidden Spot Recommendations (SSE Streaming)
**Priority**: P0 (Critical)

#### User Story
> "As a traveler, I want to discover hidden, local-favorite spots delivered progressively so that I can start viewing recommendations immediately without waiting for all to load."

#### Functional Requirements
- **SSE Streaming**: Real-time progressive delivery of 3 destinations
- **2-Phase Delivery**:
  1. Phase 1: LLM generates recommendations (3-5s)
  2. Phase 2: Google Places API enrichment (parallel, 2-3s)
- **Location Criteria**:
  - Non-mainstream (avoid top-10 tourist spots)
  - Photogenic & aesthetic
  - Accessible by public transport
  - Safe for travelers
  - Matches selected concept

- **Location Cards**: Each location includes:
  - Name, city, country
  - Description and match reason
  - Best time to visit
  - Photography score (1-10)
  - Transport accessibility
  - Safety rating
  - Google Places photos (if available)

#### Acceptance Criteria
- [x] SSE connection established within 2 seconds
- [x] First destination appears within 5 seconds
- [x] All 3 destinations delivered within 10 seconds
- [x] Real-time UI updates as destinations arrive
- [x] Fallback data displayed on error
- [x] Carousel/swipe navigation on mobile

#### Technical Notes
- RecommendationAgent with SSE streaming
- Parallel Google Places API enrichment
- AbortController for stream cancellation

---

### 4. AI Image Generation (Gemini Imagen)
**Priority**: P1 (High)

#### User Story
> "As a user, I want to see AI-generated preview images showing what my travel vibe will look like in reality—with film-aesthetic styling—so I can visualize and prepare for the perfect shot."

#### Functional Requirements
- **Image Generation Flow**:
  1. User selects a recommended destination
  2. System sends prompt with concept, film stock, and style
  3. Gemini Imagen generates film-aesthetic preview
  4. Image displayed with metadata

- **Film Stock Integration**: Apply authentic film aesthetics:
  - Kodak Portra 400 (warm, nostalgic)
  - Kodak ColorPlus 200 (vibrant, saturated)
  - Fujifilm Superia (crisp, natural)
  - Ilford HP5 (monochrome, dramatic)

- **Generation Pipeline**:
  1. extract_keywords (Search MCP)
  2. optimize_prompt (quality enhancement)
  3. generate_image (Gemini Imagen)

- **Output**: High-quality preview image (1024x1024)

#### Acceptance Criteria
- [x] User can trigger image generation per destination
- [x] Image generation completes within 15 seconds
- [x] Generated images display film aesthetic accurately
- [x] Keyword extraction shown to user
- [x] Error handling for generation failures with retry option

#### Technical Notes
- ImageAgent with LangGraph workflow
- Gemini Imagen model: imagen-3.0-generate-002
- Search MCP for keyword extraction

---

### 5. TripKit Package (Complete Styling Recommendations)
**Priority**: P1 (High)

#### User Story
> "As a photography enthusiast, I want a complete styling package so that I can prepare all equipment and outfits for aesthetic travel documentation."

#### Functional Requirements
- **TripKit Package** (per destination):
  1. **Film Camera**: Model name, characteristics, rental note
  2. **Film Stock**: Type, ISO, color profile, sample reference
  3. **Camera Settings**: Aperture, shutter speed, suggested lighting
  4. **Best Angles**: 3-5 sample compositions with visual examples
  5. **Outfit Styling**: Color palette, style suggestions
  6. **Props**: 2-3 small items to enhance photos

- **Gift Box UI**: Unwrapping animation with Framer Motion
- **Postcard View**: Summary card with key recommendations

#### Acceptance Criteria
- [x] Each destination has complete TripKit package
- [x] Recommendations align with selected concept
- [x] Visual examples provided for styling
- [x] Gift box unwrapping animation smooth
- [x] Postcard summary exportable (screenshot-friendly)

---

## 🚫 MVP Exclusions (Post-Launch Features)

The following features are **explicitly out of scope** for MVP:

### Deferred to v2.0+
1. **O2O Rental & Delivery**
   - Physical kit assembly
   - Inventory management
   - Delivery logistics
   - Returns processing

2. **User Authentication & Accounts**
   - User registration/login
   - Profile management
   - Saved preferences
   - History tracking

3. **Payment Integration**
   - Rental pricing
   - Payment gateway
   - Subscription models

4. **Social Features**
   - Photo sharing
   - User reviews
   - Community feed
   - Social login

5. **Advanced Personalization**
   - Machine learning-based recommendations
   - Behavior tracking
   - A/B testing

---

## 📱 User Experience Flow (MVP)

### Happy Path
```
1. Landing Page (/)
   ↓ Click "Get Started"
2. Chat Page (/chat) → AI asks 7-10 questions
   ↓ Conversation complete
3. Concept Selection (/concept) → Choose Flâneur/Film Log/Midnight
   ↓ Select concept
4. Destinations Page (/destinations) → SSE streaming 3 destinations
   ↓ Browse and select
5. TripKit Page (/tripkit) → View complete package
   ↓ Unwrap gift box
6. Generate Page (/generate) → Create AI preview images
   ↓ Download/share
```

### State Management Flow
```
Frontend (Zustand)                Backend (LangGraph)
┌────────────────┐               ┌────────────────┐
│ useChatStore   │ ──session_id──> │ ChatAgent     │
│ - sessionId    │ <──response──── │ - MemorySaver │
│ - messages     │               │ - checkpointer │
│ - collectedData│               └────────────────┘
└────────────────┘
        ↓
┌────────────────┐               ┌────────────────┐
│ useVibeStore   │ ──preferences─> │ Recommendation│
│ - concept      │ <──SSE stream── │   Agent       │
│ - destinations │               └────────────────┘
│ - selectedDest │
└────────────────┘
```

### Error Handling
- AI chat timeout → Retry with fallback response
- SSE stream failure → Display fallback destinations with isFallback flag
- Image generation failure → Display error with retry button
- Session expired (>7 days) → Reset and start new conversation

---

## 🎨 Design Requirements

### Brand Identity
- **Color Palette**: Warm, nostalgic tones (sepia, cream, muted pastels)
- **Typography**: Vintage-modern hybrid (Libre Baskerville + Inter)
- **Imagery**: Film grain textures, analog aesthetics
- **Tone**: Warm, inspiring, culturally sophisticated

### UI/UX Principles
- **Mobile-First**: 80% of users expected on mobile
- **Minimal Friction**: Max 3 clicks to core value
- **Visual Storytelling**: Rich imagery over text
- **Progressive Disclosure**: SSE streaming for gradual content reveal
- **Seasonal Effects**: Holiday-themed animations (snow, cherry blossoms)

### Key Screens (MVP)
1. **Landing Page** (`/`) - Hero, ConceptPreview, FeatureShowcase, CTA
2. **Chat Interface** (`/chat`) - ChatContainer, MessageBubble, QuickReply
3. **Concept Selection** (`/concept`) - ConceptCard with hover effects
4. **Destinations** (`/destinations`) - Carousel with SSE-populated cards
5. **TripKit** (`/tripkit`) - GiftBox unwrapping, Postcard view
6. **Generate** (`/generate`) - Image generation with progress indicator

---

## 🔧 Technical Constraints (MVP)

### Performance Targets
| Metric | Target | Critical? |
|--------|--------|-----------|
| Page Load Time | <3s | Yes |
| Chat API Response | <3s | Yes |
| SSE First Destination | <5s | Yes |
| SSE Complete (3 destinations) | <10s | Yes |
| Image Generation | <15s | No (nice-to-have) |
| Mobile Responsiveness | 100% | Yes |

### Architecture
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Zustand
- **Backend**: Python FastAPI, LangGraph, Pydantic
- **AI Services**: OpenAI GPT-4o-mini (chat/recommendations), Gemini Imagen (images)
- **MCP Servers**: Search MCP, Places MCP

### Browser Support
- Chrome/Edge (latest 2 versions)
- Safari (iOS 14+)
- Mobile: iOS Safari, Chrome Android

### Data Storage
- Frontend: Zustand with persist middleware (localStorage, 7-day TTL)
- Backend: MemorySaver (in-memory, session-based)
- No persistent database for MVP

---

## 📊 Success Criteria & Validation

### MVP Launch Checklist
- [x] All P0 features functional
- [x] SSE streaming working
- [x] Session persistence working
- [x] Mobile responsive
- [x] AI recommendations testable
- [x] Image generation working
- [ ] Basic analytics tracking

### Post-Launch Validation
1. **User Feedback**: Collect qualitative feedback from 20+ users
2. **Technical Metrics**: Monitor API success rates, SSE reliability, load times
3. **Engagement**: Track completion rates per flow step
4. **Recommendation Quality**: Manual review of AI outputs

### Pivot/Iterate Triggers
- Recommendation accuracy <50%
- Completion rate <40%
- Image generation fail rate >30%
- SSE stream reliability <80%
- Average session <2 minutes

---

## 🚀 Implementation Status

### Completed Features
- ✅ ChatAgent with Human-in-the-loop pattern
- ✅ Session-based conversation with MemorySaver
- ✅ RecommendationAgent with SSE streaming
- ✅ ImageAgent with Gemini Imagen
- ✅ Provider Strategy Pattern (OpenAI/Gemini)
- ✅ MCP integration (Search, Places)
- ✅ Frontend state management (Zustand)
- ✅ Concept selection UI
- ✅ Destinations carousel with SSE
- ✅ TripKit package page
- ✅ Seasonal effects (snow animation)

### In Progress
- 🔄 Analytics integration
- 🔄 Error boundary improvements
- 🔄 Performance optimization

### Planned (Post-MVP)
- ⏳ User authentication
- ⏳ Persistent database (Supabase)
- ⏳ Social sharing
- ⏳ O2O rental system

---

## 📝 Open Questions & Assumptions

### Assumptions
1. Users will tolerate 10-15s image generation wait times
2. AI recommendations can achieve 70%+ accuracy without training data
3. Users don't need authentication for MVP value
4. Session-based storage sufficient for MVP
5. SSE streaming provides better UX than batch loading

### Open Questions
1. Should we add more than 3 concepts in the future?
2. How to handle international users (multi-language support)?
3. Should image generation be mandatory or optional per destination?
4. What metrics define "recommendation accuracy"?

### Risks & Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| AI recommendation quality poor | High | Extensive prompt engineering + fallback curated lists |
| Image generation too slow | Medium | Set expectations (loading animation) + async processing |
| SSE connection drops | Medium | Automatic reconnection + fallback batch API |
| No user retention mechanism | Low | Acceptable for MVP validation phase |

---

## 📞 Stakeholders

### Product Team
- **Product Manager**: Define requirements, prioritize features
- **Designer**: UI/UX design, brand identity
- **QA**: Testing, user acceptance

### Engineering Team
- **Frontend**: Next.js, Zustand, Tailwind CSS
- **Backend**: FastAPI, LangGraph, Python
- **AI/ML**: Prompt engineering, Agent design, MCP integration

### External Dependencies
- **OpenAI API**: GPT-4o-mini (chatbot, recommendations)
- **Google Gemini**: Imagen (image generation)
- **Google Maps**: Places API (location enrichment)
- **Tavily**: Search API (keyword extraction)
- **Vercel**: Frontend hosting

---

## 📚 Appendix

### Related Documents
- [TRD_TripKit_MVP.md](./TRD_TripKit_MVP.md) - Technical Requirements
- [API_Documentation.md](./API_Documentation.md) - API Specifications
- [AI_Integration_Guide.md](./AI_Integration_Guide.md) - AI Integration Guide
- [Frontend_Design_Specification.md](./Frontend_Design_Specification.md) - Frontend Design

### Glossary
- **Film Aesthetic**: Visual style mimicking analog film cameras (grain, color shifts, vignetting)
- **Hidden Spots**: Non-mainstream locations favored by locals
- **O2O**: Online-to-Offline service model
- **Concept**: Predefined aesthetic/thematic travel style
- **SSE**: Server-Sent Events for real-time streaming
- **Human-in-the-loop**: AI workflow pattern that pauses for user input
- **MCP**: Model Context Protocol for AI tool integration

### Revision History
| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0.0 | 2025-12-03 | Initial MVP PRD | Product Team |
| 2.0.0 | 2025-12-10 | Updated to reflect actual implementation: SSE streaming, ChatAgent, session persistence, Gemini Imagen, 6-page flow | Product Team |

---

**Document Status**: ✅ Updated for Current Implementation
**Next Review**: Post-MVP validation phase
