# Trip Kit - Product Requirements Document (PRD)
## MVP Version - 1 Week Sprint

---

## 📋 Document Information

- **Document Version**: 1.0.0
- **Last Updated**: 2025-12-03
- **Project Timeline**: 1 Week (MVP)
- **Target Launch**: Week 1 - Core Features Only
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

1. **AI Chatbot**: Extracts preferences step-by-step (mood → aesthetic → duration → interests → concept)
2. **Hidden Spot Recommendations**: Suggests authentic, local-favorite locations (not tourist traps)
3. **Image Generation**: Creates film-aesthetic preview images showing what the experience will look like
4. **Complete Styling Package**: Recommends [film camera + outfit + props + camera settings + angles]
5. **(Future) O2O Kit Delivery**: Physical rental kits delivered to your location (Post-MVP)

---

## 🎯 Product Vision & Goals

### Vision
**"여행의 감성을 설계하는 AI 큐레이터"**
*"The AI Curator That Designs Your Travel Vibe"*

Create the go-to platform where travelers discover their unique aesthetic identity and bring it to life through curated emotional experiences—not just destinations, but complete **vibe packages** that transform ordinary trips into unforgettable visual stories.

### Success Metrics (1-Week MVP)
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| User Onboarding Completion | 80% | Analytics tracking |
| AI Recommendation Accuracy | 70% | User feedback |
| Image Generation Success Rate | 90% | Technical metrics |
| Average Session Duration | 5+ min | Analytics |

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

② **시각화**: AI-generated preview images showing your imagined travel scene as reality

③ **실행 가능성**: Complete actionable package (location + outfit + film stock + camera settings + angles)

---

## 🎯 Core Features (MVP - Week 1)

### 1. AI Chatbot for Vibe Analysis & Destination Discovery
**Priority**: P0 (Critical)

#### User Story
> "As a traveler, I want to chat with AI about my travel vibe so that I receive personalized destinations that match my emotional and aesthetic preferences—not just efficient routes, but places that resonate with my mood and creative vision."

#### Functional Requirements
- **Chat Interface**: Natural, conversational text-based flow
- **Vibe Extraction Scenario**: 5-7 questions to deeply understand user's **travel vibe**:
  - **Mood**: Romantic, adventurous, nostalgic, peaceful (emotional state)
  - **Aesthetic**: Urban, nature, vintage, modern (visual preference)
  - **Duration**: Short (1-3d), medium (4-7d), long (8+d)
  - **Interests**: Photography, food, art, history, nature, architecture
  - **Concept Selection** (after destinations): Flâneur, Film Log, Midnight
- **AI Processing**:
  - LangGraph-powered state management
  - GPT-4 for natural language understanding and vibe extraction
  - Structured output: User messages → **Preference JSON** with reasoning
- **Output**:
  - 3 curated destination recommendations
  - Each with **matchReason** explaining why it fits user's vibe
  - Photography score, accessibility, safety ratings

#### Acceptance Criteria
- [ ] User can initiate conversation within 2 clicks
- [ ] AI responds within 3 seconds
- [ ] Conversation completes in 5-7 exchanges
- [ ] Recommendations include: location name, description, why it matches user
- [ ] User can restart or modify preferences

#### Technical Notes
- Use LangGraph for conversation state management
- Store conversation context in session storage (no DB for MVP)
- Prompt engineering for consistent recommendation quality

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

- **Selection Flow**: Single-choice selection → impacts all downstream recommendations

#### Acceptance Criteria
- [ ] All 3 concepts displayed with rich visuals
- [ ] User can select one concept
- [ ] Selection persists throughout session
- [ ] Visual feedback on selected concept
- [ ] Recommendations adapt based on concept choice

---

### 3. Hidden Spot Recommendations
**Priority**: P0 (Critical)

#### User Story
> "As a traveler, I want to discover hidden, local-favorite spots so that my travel experience feels authentic and unique."

#### Functional Requirements
- **Recommendation Engine**: AI-generated list of 5-10 locations per destination
- **Location Criteria**:
  - Non-mainstream (avoid top-10 tourist spots)
  - Photogenic & aesthetic
  - Accessible by public transport
  - Safe for travelers
  - Matches selected concept

- **Location Cards**: Each location includes:
  - Name & address
  - Short description (50-100 words)
  - Best time to visit
  - Photography tips
  - Estimated visit duration

#### Acceptance Criteria
- [ ] At least 5 locations recommended per destination
- [ ] Locations are non-touristy (verified via criteria)
- [ ] Each location includes complete information
- [ ] Locations sorted by relevance to user concept
- [ ] Responsive design for mobile viewing

---

### 4. AI Image Generation (Film Aesthetic Preview)
**Priority**: P1 (High)

#### User Story
> "As a user, I want to see AI-generated preview images showing what my travel vibe will look like in reality—myself at the location with the recommended styling and film aesthetic—so I can visualize and prepare for the perfect shot."

#### Functional Requirements
- **Image Generation Flow**:
  1. User selects a recommended location
  2. User uploads photo (optional for MVP - can use placeholder)
  3. AI generates preview image with:
     - Selected location background
     - Recommended outfit styling overlay
     - Film camera aesthetic filter
     - Specific film stock look (e.g., Kodak ColorPlus)

- **Film Stock Integration**: Apply authentic film aesthetics:
  - Kodak ColorPlus 200 (warm, nostalgic)
  - Fujifilm Superia (vibrant, saturated)
  - Ilford HP5 (monochrome, dramatic)

- **Output**: High-quality preview image (1080x1080 minimum)

#### Acceptance Criteria
- [ ] User can trigger image generation per location
- [ ] Image generation completes within 15 seconds
- [ ] Generated images display film aesthetic accurately
- [ ] Images downloadable
- [ ] Error handling for generation failures

#### Technical Notes
- Use DALL-E 3 or Stable Diffusion via API
- Prompt engineering template:
  ```
  [Location background] + [Recommended outfit] + [Film camera in hands] + [Film stock: {selected_film}]
  ```

---

### 5. Film Camera & Styling Recommendations
**Priority**: P1 (High)

#### User Story
> "As a photography enthusiast, I want specific film camera and styling recommendations so that I can prepare for aesthetic documentation."

#### Functional Requirements
- **Recommendation Package** (per location):
  1. **Film Camera**: Model name, characteristics, rental note (for future)
  2. **Film Stock**: Type, ISO, color profile, sample shots
  3. **Camera Settings**: Aperture, shutter speed, suggested lighting conditions
  4. **Best Angles**: 3-5 sample compositions with visual examples
  5. **Outfit Styling**: Color palette, style suggestions (casual, vintage, formal)
  6. **Props**: 2-3 small items to enhance photos (e.g., book, vintage map, flowers)

#### Acceptance Criteria
- [ ] Each location has complete recommendation package
- [ ] Recommendations align with selected concept
- [ ] Visual examples provided for angles/styling
- [ ] Information presented in scannable format
- [ ] Recommendations exportable (PDF/share for future)

---

## 🚫 MVP Exclusions (Post-Launch Features)

The following features are **explicitly out of scope** for the 1-week MVP:

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
1. Landing Page
   ↓
2. Start Chat → AI asks 5-7 questions
   ↓
3. Receive 3 destination recommendations
   ↓
4. Select 1 destination
   ↓
5. Choose concept (Flâneur/Film Log/Midnight)
   ↓
6. Browse hidden spot recommendations (5-10 locations)
   ↓
7. Select location → View details
   ↓
8. Generate AI preview image (optional)
   ↓
9. View film camera & styling recommendations
   ↓
10. Export/save recommendations (future: book kit)
```

### Error Handling
- AI chat timeout → Retry with fallback recommendations
- Image generation failure → Display placeholder + retry option
- No recommendations found → Suggest alternative destinations

---

## 🎨 Design Requirements

### Brand Identity
- **Color Palette**: Warm, nostalgic tones (sepia, cream, muted pastels)
- **Typography**: Vintage-modern hybrid (e.g., Libre Baskerville + Inter)
- **Imagery**: Film grain textures, analog aesthetics
- **Tone**: Warm, inspiring, culturally sophisticated

### UI/UX Principles
- **Mobile-First**: 80% of users expected on mobile
- **Minimal Friction**: Max 3 clicks to core value
- **Visual Storytelling**: Rich imagery over text
- **Scannable**: Use cards, icons, bullet points

### Key Screens (MVP)
1. Landing/Hero
2. Chat Interface
3. Concept Selection
4. Destination Results
5. Location Detail
6. Image Generation
7. Recommendations Summary

---

## 🔧 Technical Constraints (MVP)

### Performance Targets
| Metric | Target | Critical? |
|--------|--------|-----------|
| Page Load Time | <3s | Yes |
| AI Response Time | <5s | Yes |
| Image Generation | <15s | No (nice-to-have) |
| Mobile Responsiveness | 100% | Yes |

### Browser Support
- Chrome/Edge (latest 2 versions)
- Safari (iOS 14+)
- Mobile: iOS Safari, Chrome Android

### Data Storage
- Session storage only (no persistent DB for MVP)
- Recommendations cached per session
- No user data retention beyond session

---

## 📊 Success Criteria & Validation

### MVP Launch Checklist
- [ ] All P0 features functional
- [ ] No critical bugs
- [ ] Mobile responsive
- [ ] AI recommendations testable
- [ ] Image generation working (even if slow)
- [ ] Basic analytics tracking

### Post-Launch Validation (Week 2)
1. **User Feedback**: Collect qualitative feedback from 20+ users
2. **Technical Metrics**: Monitor API success rates, load times
3. **Engagement**: Track completion rates per flow step
4. **Recommendation Quality**: Manual review of AI outputs

### Pivot/Iterate Triggers
- Recommendation accuracy <50%
- Completion rate <40%
- Image generation fail rate >30%
- Average session <2 minutes

---

## 🚀 Launch Strategy

### Week 1: MVP Development
- Day 1-2: Core AI chatbot + concept selection
- Day 3-4: Recommendation engine + location cards
- Day 5-6: Image generation + styling recommendations
- Day 7: Testing, bug fixes, polish

### Week 2: Validation & Iteration
- Launch to closed beta (50-100 users)
- Collect feedback
- Iterate on core flows
- Plan v2.0 features

---

## 📝 Open Questions & Assumptions

### Assumptions
1. Users will tolerate 10-15s image generation wait times
2. AI recommendations can achieve 70%+ accuracy without training data
3. Users don't need authentication for MVP value
4. Session-based storage sufficient for MVP

### Open Questions
1. How to handle non-English speaking users? (Korean priority?)
2. Should we pre-generate location databases or rely on real-time AI?
3. Image generation: User photo upload mandatory or optional?
4. Concept selection: Allow multi-select or single-select only?

### Risks & Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| AI recommendation quality poor | High | Extensive prompt engineering + fallback curated lists |
| Image generation too slow | Medium | Set expectations (loading animation) + async processing |
| No user retention mechanism | Low | Acceptable for MVP validation phase |

---

## 📞 Stakeholders

### Product Team
- **Product Manager**: Define requirements, prioritize features
- **Designer**: UI/UX design, brand identity
- **QA**: Testing, user acceptance

### Engineering Team
- **Frontend**: Next.js, UI implementation
- **Backend**: API design, AI integration
- **AI/ML**: Prompt engineering, LangGraph, DALL-E integration

### External Dependencies
- **OpenAI API**: GPT-4 (chatbot), DALL-E 3 (images)
- **Supabase**: Future database (not MVP)
- **Hosting**: Vercel (Next.js deployment)

---

## 📚 Appendix

### Related Documents
- [TRD_TripKit_MVP.md](./TRD_TripKit_MVP.md) - Technical Requirements
- [API_Documentation.md](./API_Documentation.md) - API Specifications

### Glossary
- **Film Aesthetic**: Visual style mimicking analog film cameras (grain, color shifts, vignetting)
- **Hidden Spots**: Non-mainstream locations favored by locals
- **O2O**: Online-to-Offline service model
- **Concept**: Predefined aesthetic/thematic travel style

### Revision History
| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0.0 | 2025-12-03 | Initial MVP PRD | Product Team |

---

**Document Status**: ✅ Approved for Development
**Next Review**: End of Week 1 (MVP completion)
