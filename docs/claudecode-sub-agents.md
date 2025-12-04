# TripKit Sub-Agent System Guide

**"실무에서 검증된 Claude Code Sub-Agent 활용 가이드"**

---

## 📋 Overview

이 디렉토리는 TripKit 프로젝트의 **Claude Code Sub-Agent** 설정 파일을 포함합니다.
각 Sub-Agent는 특정 도메인에 특화되어 있으며, Task tool을 통해 독립적으로 작업을 수행합니다.

### Sub-Agent의 장점

1. **전문화**: 각 에이전트가 특정 영역의 전문가
2. **병렬 처리**: 여러 작업을 동시에 진행 가능
3. **컨텍스트 분리**: 각 에이전트가 독립적인 컨텍스트 보유
4. **품질 향상**: 전문화된 지식으로 더 나은 결과
5. **유지보수성**: 역할이 명확하여 관리 용이

---

## 🤖 Available Sub-Agents

| 에이전트 | 파일 | 전문 분야 |
|----------|------|-----------|
| Frontend Developer | `frontend-developer.md` | React, Next.js, TypeScript, Tailwind |
| Backend Developer | `backend-developer.md` | Supabase, Python, MCP 서버 |
| LangGraph Specialist | `langgraph-specialist.md` | LangGraph, StateGraph, 워크플로우 |
| Test Engineer | `test-engineer.md` | Jest, Pytest, Playwright |
| Documentation Specialist | `documentation-specialist.md` | API 문서, Mermaid 다이어그램 |
| DevOps Engineer | `devops-engineer.md` | Docker, CI/CD, Vercel |

---

## 🎯 역할 할당 매트릭스

### Frontend Developer (필수 담당)
- React/Next.js 컴포넌트 생성
- TypeScript 타입 정의
- Zustand 상태 관리
- Tailwind CSS 스타일링
- 접근성 구현

### Backend Developer (필수 담당)
- Supabase 스키마 설계
- RLS 정책 구현
- Python 백엔드 로직
- MCP 서버 개발
- API 엔드포인트

### LangGraph Specialist (필수 담당)
- StateGraph 설계
- Node/Edge 구현
- 워크플로우 아키텍처
- MCP와 LangGraph 통합
- 프롬프트 엔지니어링

### Test Engineer (필수 담당)
- 단위 테스트 (Jest, Pytest)
- 통합 테스트
- E2E 테스트 (Playwright)
- 커버리지 관리

### Documentation Specialist (필수 담당)
- API 문서
- 아키텍처 문서 (ADRs)
- README/CHANGELOG
- Mermaid 다이어그램

### DevOps Engineer (필수 담당)
- Docker 구성
- CI/CD 파이프라인
- Vercel 배포
- 환경 관리

---

## 📋 상세 에이전트 정보

### 1. Frontend Developer

**파일**: `frontend-developer.md`
**전문 분야**: React, Next.js, TypeScript, Tailwind CSS, Zustand

#### 역할 할당 (MUST Handle)

이 에이전트는 다음 작업에 **반드시** 할당되어야 합니다:
- React 컴포넌트 생성 및 리팩토링
- Next.js 페이지 및 라우팅 구현
- TypeScript 타입 정의 및 인터페이스 설계
- Tailwind CSS 스타일링 및 반응형 디자인
- Zustand 상태 관리 로직
- 접근성 (a11y) 구현
- 성능 최적화 (React.memo, useCallback, useMemo)

#### 위임 규칙 (MUST NOT Handle)

이 에이전트는 다음 작업을 처리하면 **안됩니다**. 적절한 에이전트에게 위임하세요:

| 작업 유형 | 위임 대상 |
|-----------|----------|
| Supabase 스키마 | → backend-developer |
| RLS 정책 | → backend-developer |
| Python 코드 | → backend-developer |
| MCP 서버 로직 | → backend-developer |
| LangGraph 워크플로우 | → langgraph-specialist |
| 테스트 코드 작성 | → test-engineer |
| API 문서 작성 | → documentation-specialist |
| Docker 설정 | → devops-engineer |
| CI/CD 파이프라인 | → devops-engineer |

**사용 예시**:
```
Task: "Create a FilmAestheticCard component that displays film stock information with vintage styling"
Agent: frontend-developer
Model: sonnet
```

---

### 2. Backend Developer

**파일**: `backend-developer.md`
**전문 분야**: Supabase, Python, LangGraph, MCP Servers

#### 역할 할당 (MUST Handle)

이 에이전트는 다음 작업에 **반드시** 할당되어야 합니다:
- Supabase 데이터베이스 스키마 설계
- Supabase RLS (Row Level Security) 정책 구현
- Supabase Edge Functions 개발
- Python 백엔드 서비스 개발
- MCP (Model Context Protocol) 서버 구축
- API 엔드포인트 설계 및 구현
- Supabase Auth 통합

#### 위임 규칙 (MUST NOT Handle)

이 에이전트는 다음 작업을 처리하면 **안됩니다**. 적절한 에이전트에게 위임하세요:

| 작업 유형 | 위임 대상 |
|-----------|----------|
| React 컴포넌트 | → frontend-developer |
| UI/UX 구현 | → frontend-developer |
| Tailwind 스타일링 | → frontend-developer |
| LangGraph 워크플로우 설계 | → langgraph-specialist |
| 테스트 코드 작성 | → test-engineer |
| API 문서 작성 | → documentation-specialist |
| Docker 설정 | → devops-engineer |
| CI/CD 파이프라인 | → devops-engineer |

**사용 예시**:
```
Task: "Create Supabase migration for storing user travel vibes with RLS policies"
Agent: backend-developer
Model: sonnet
```

---

### 3. LangGraph Specialist

**파일**: `langgraph-specialist.md`
**전문 분야**: LangGraph, StateGraph, Multi-Agent Systems

#### 역할 할당 (MUST Handle)

이 에이전트는 다음 작업에 **반드시** 할당되어야 합니다:
- LangGraph StateGraph 설계 및 구현
- 멀티 에이전트 시스템 아키텍처 설계
- Node, Edge, Conditional routing 구현
- State 스키마 정의 (TypedDict, Pydantic)
- Checkpointer 구성 및 상태 관리
- MCP 서버와 LangGraph 통합
- 프롬프트 엔지니어링 및 최적화
- 워크플로우 디버깅 및 시각화
- 비동기 워크플로우 오케스트레이션

#### 위임 규칙 (MUST NOT Handle)

이 에이전트는 다음 작업을 처리하면 **안됩니다**. 적절한 에이전트에게 위임하세요:

| 작업 유형 | 위임 대상 |
|-----------|----------|
| React/Next.js UI 컴포넌트 | → frontend-developer |
| Tailwind 스타일링 | → frontend-developer |
| Supabase 스키마/RLS | → backend-developer |
| 데이터베이스 마이그레이션 | → backend-developer |
| MCP 서버 구현 (워크플로우 외) | → backend-developer |
| 단위/통합 테스트 | → test-engineer |
| 워크플로우 테스트 | → test-engineer |
| CI/CD 구성 | → devops-engineer |
| 기술 문서 | → documentation-specialist |

**사용 예시**:
```
Task: "Design a LangGraph workflow for vibe extraction with 5-step conversation flow"
Agent: langgraph-specialist
Model: sonnet  # 복잡한 로직은 opus도 고려
```

---

### 4. Test Engineer

**파일**: `test-engineer.md`
**전문 분야**: Jest, Pytest, React Testing Library, Playwright

#### 역할 할당 (MUST Handle)

이 에이전트는 다음 작업에 **반드시** 할당되어야 합니다:
- 단위 테스트 작성 (Jest, Pytest)
- 통합 테스트 구현
- E2E 테스트 시나리오 (Playwright)
- 컴포넌트 테스트 (React Testing Library)
- API 엔드포인트 테스트
- 테스트 커버리지 관리 (목표: >80%)
- CI/CD 파이프라인 테스트 구성
- 버그 재현 및 회귀 테스트
- Mock 및 Stub 설정
- 테스트 데이터 생성

#### 위임 규칙 (MUST NOT Handle)

이 에이전트는 다음 작업을 처리하면 **안됩니다**. 적절한 에이전트에게 위임하세요:

| 작업 유형 | 위임 대상 |
|-----------|----------|
| React 컴포넌트 구현 | → frontend-developer |
| UI 스타일링 수정 | → frontend-developer |
| Backend API 구현 | → backend-developer |
| 데이터베이스 스키마 변경 | → backend-developer |
| LangGraph 워크플로우 설계 | → langgraph-specialist |
| CI/CD 파이프라인 설정 | → devops-engineer |
| Docker 구성 | → devops-engineer |
| 테스트 문서 | → documentation-specialist |

**사용 예시**:
```
Task: "Write comprehensive tests for the VibeExtractionAgent including unit and integration tests"
Agent: test-engineer
Model: haiku  # 테스트 코드는 haiku로 충분
```

---

### 5. Documentation Specialist

**파일**: `documentation-specialist.md`
**전문 분야**: Technical Writing, API Documentation, Mermaid Diagrams

#### 역할 할당 (MUST Handle)

이 에이전트는 다음 작업에 **반드시** 할당되어야 합니다:
- API 문서 작성 및 업데이트
- 아키텍처 문서 (ADRs)
- 사용자 가이드 및 튜토리얼
- README 및 CHANGELOG 관리
- 코드 주석 및 docstring 개선
- Mermaid 다이어그램 생성
- OpenAPI/Swagger 명세
- 컴포넌트 문서
- 마이그레이션 가이드
- 릴리스 노트

#### 위임 규칙 (MUST NOT Handle)

이 에이전트는 다음 작업을 처리하면 **안됩니다**. 적절한 에이전트에게 위임하세요:

| 작업 유형 | 위임 대상 |
|-----------|----------|
| React 컴포넌트 코드 | → frontend-developer |
| UI 구현 | → frontend-developer |
| Backend API 코드 | → backend-developer |
| 데이터베이스 스키마 | → backend-developer |
| LangGraph 워크플로우 | → langgraph-specialist |
| 테스트 코드 | → test-engineer |
| CI/CD 파이프라인 | → devops-engineer |
| Docker 설정 | → devops-engineer |

**사용 예시**:
```
Task: "Create comprehensive API documentation for the new /api/recommendations/hidden-spots endpoint"
Agent: documentation-specialist
Model: haiku
```

---

### 6. DevOps Engineer

**파일**: `devops-engineer.md`
**전문 분야**: Docker, GitHub Actions, Vercel, CI/CD

#### 역할 할당 (MUST Handle)

이 에이전트는 다음 작업에 **반드시** 할당되어야 합니다:
- Docker 컨테이너화 및 Docker Compose 설정
- GitHub Actions CI/CD 파이프라인 구성
- Vercel 배포 설정 및 최적화
- 환경 변수 및 시크릿 관리
- 모니터링 및 로깅 구성
- 빌드 최적화 (속도, 캐싱)
- Infrastructure as Code
- SSL/HTTPS 구성
- 성능 최적화 (CDN, 캐싱)
- 보안 강화 (헤더, CSP)

#### 위임 규칙 (MUST NOT Handle)

이 에이전트는 다음 작업을 처리하면 **안됩니다**. 적절한 에이전트에게 위임하세요:

| 작업 유형 | 위임 대상 |
|-----------|----------|
| React 컴포넌트 | → frontend-developer |
| UI/UX 구현 | → frontend-developer |
| Backend API 로직 | → backend-developer |
| 데이터베이스 스키마 | → backend-developer |
| LangGraph 워크플로우 | → langgraph-specialist |
| 테스트 코드 작성 | → test-engineer |
| API 문서 | → documentation-specialist |
| README 컨텐츠 | → documentation-specialist |

**사용 예시**:
```
Task: "Setup GitHub Actions workflow for running tests and deploying to Vercel on merge to main"
Agent: devops-engineer
Model: sonnet
```

---

## 🎯 Sub-Agent 사용 패턴

### Pattern 1: Single Agent for Specific Task

가장 기본적인 패턴입니다. 명확한 작업을 특정 에이전트에게 위임합니다.

```
User: "Create a new DestinationCard component for displaying travel recommendations"

Main Claude:
┌─────────────────────────────────────────┐
│ 1. 요구사항 분석                           │
│ 2. frontend-developer에게 위임 결정        │
│ 3. Task tool 호출                        │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│ Frontend Developer Sub-Agent             │
│ - 컴포넌트 구조 설계                       │
│ - TypeScript 타입 정의                    │
│ - Tailwind 스타일링                       │
│ - 접근성 속성 추가                         │
│ - Lint 검증                              │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│ Main Claude                              │
│ - 결과 확인 및 사용자에게 전달              │
└─────────────────────────────────────────┘
```

### Pattern 2: Sequential Agent Chain

여러 에이전트가 순차적으로 작업하는 패턴입니다.

```
User: "Implement a new feature: AI-generated travel journal entries"

Main Claude → backend-developer → frontend-developer → test-engineer → documentation-specialist
      ↓              ↓                  ↓                  ↓                    ↓
   Plan        API endpoint        UI component        Test cases        API docs
```

### Pattern 3: Parallel Agent Execution

독립적인 작업들을 병렬로 실행하는 패턴입니다.

```
User: "Prepare for production launch: tests, docs, deployment"

Main Claude
     ├─→ test-engineer (Run all tests)
     ├─→ documentation-specialist (Update README, CHANGELOG)
     └─→ devops-engineer (Setup CI/CD, deployment)

모두 완료 후 결과 취합
```

---

## 💡 Best Practices

### 1. 명확한 작업 정의

**Good**:
```
Task: "Create a ConceptCard component that displays the three travel concepts (Flâneur, Film Log, Midnight) with hover effects and selection state management"
Agent: frontend-developer
```

**Bad**:
```
Task: "Make the concept thing"
Agent: frontend-developer
```

### 2. 적절한 모델 선택

| 작업 유형 | 모델 | 설명 |
|-----------|------|------|
| 컴포넌트 생성 | sonnet | 빠른 작업 |
| Supabase 스키마 | sonnet | 일반 개발 |
| LangGraph 워크플로우 | sonnet/opus | 복잡한 설계 |
| 단위 테스트 | haiku | 반복 작업 |
| API 문서 | haiku | 문서화 |
| CI/CD 설정 | sonnet | 인프라 |

### 3. 컨텍스트 제공

에이전트에게 충분한 컨텍스트를 제공하세요:

```
Task: "Create a HiddenSpotCard component.
Reference: See TravelVibeCard for similar design patterns.
This component will display hidden local spots with:
- Name, address, description
- Photography tips (bullet list)
- Best time to visit
- Film stock recommendations
Style: Vintage aesthetic matching Film Log concept"

Agent: frontend-developer
```

### 4. 결과 검증

에이전트 작업 후 항상 결과를 확인하세요:

```
// After agent completes
Main Claude should:
1. Read generated files
2. Run lint/type-check
3. Verify tests pass
4. Confirm with user
```

---

## 🚫 Anti-Patterns (피해야 할 패턴)

### ❌ 너무 모호한 작업
```
Bad: "Fix the app"
Good: "Fix TypeScript type error in useChatStore.ts:45 where Message type is incompatible"
```

### ❌ 잘못된 에이전트 선택
```
Bad: Task: "Write Supabase migration" → frontend-developer
Good: Task: "Write Supabase migration" → backend-developer
```

### ❌ 과도한 작업 범위
```
Bad: "Implement entire vibe extraction feature from scratch"
Good: Split into multiple tasks:
  1. "Design LangGraph workflow" → langgraph-specialist
  2. "Implement conversation nodes" → backend-developer
  3. "Create chat UI" → frontend-developer
```

### ❌ 의존성 무시
```
Bad: 병렬 실행
  - frontend: "Create component using VibeName type"
  - backend: "Define VibeName type"

Good: 순차 실행
  1. backend: "Define VibeName type"
  2. frontend: "Create component using VibeName type"
```

---

## 📊 Quick Reference

| 작업 유형 | 에이전트 | 모델 |
|-----------|---------|------|
| 컴포넌트 생성 | frontend-developer | sonnet |
| Supabase 스키마 | backend-developer | sonnet |
| LangGraph 워크플로우 | langgraph-specialist | sonnet/opus |
| 단위 테스트 | test-engineer | haiku |
| API 문서 | documentation-specialist | haiku |
| CI/CD 설정 | devops-engineer | sonnet |

---

## 📚 References

- **Claude Code Documentation**: [claude.ai/claude-code](https://claude.ai/claude-code)
- **에이전트 설정 파일**: `.claude/agents/` 디렉토리
- **Task Tool Reference**: SuperClaude COMMANDS.md
- **Multi-Agent Patterns**: SuperClaude ORCHESTRATOR.md

---

**Last Updated**: 2025-12-04
**Maintained By**: TripKit Development Team
