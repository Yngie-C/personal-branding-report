# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A multi-agent AI system that analyzes professional strengths through psychometric surveys to automatically generate personal branding reports. Built with Next.js 14 and Claude Agent SDK.

**Current Implementation Status:**
- ✅ **Phase 1 (무료 티어) - LIVE**: PSA Survey → Brief Report → Public Web Profile
- 🚧 **Phase 2 (유료 티어) - COMING SOON**: Resume Upload → Enhanced Questions → Full Report

**Key outputs (Phase 1):**
- Brief analysis report with persona identification (10 types)
- Public web profile page (shareable URL at `/p/[slug]`)
- Radar chart visualization of 5 professional dimensions

**User flow (Current):**
```
/ (Landing) → /survey (60 questions) → /survey-result (Brief report) → /p/[slug] (Public profile)
```

**User flow (Planned - Phase 2):**
```
/ → /survey → /survey-result → /upload → /questions → /generating → /result
```

## Development Commands

```bash
# Development
npm run dev              # Start dev server at http://localhost:3000
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run ESLint

# Database
# Run migration in Supabase SQL Editor: supabase/migrations/001_initial_schema.sql
# Create storage buckets manually: resumes, portfolios, assets, reports (all public)
```

## Environment Setup

Required environment variables in `.env.local`:

```bash
ANTHROPIC_API_KEY=           # Claude API key (required for all agents)
NEXT_PUBLIC_SUPABASE_URL=    # Supabase project URL
NEXT_SUPABASE_PUBLISHABLE_KEY=   # Supabase publishable key (replaces anon key)
NEXT_SUPABASE_SECRET_KEY=   # Supabase secret key (replaces service_role key)
```

## PSA Survey System (NEW)

**Professional Strength Assessment** - A 60-question psychometric survey that analyzes user strengths across 5 dimensions. The brief report is generated without requiring resume upload (free tier), while the full branding report requires resume and portfolio (paid tier).

### Survey Flow

```
1. PSA Survey (60Q) → 2. Brief Report (무료) → 3. File Upload → 4. Enhanced Questions (9Q) → 5. Full Report (유료)
```

**Key Features:**
- **60 questions** across 5 categories (12 questions each)
- **7-point Likert scale** (1: 전혀 그렇지 않다 ~ 7: 매우 그렇다)
- **10 persona types** mapped from top 2 category combinations
- **Brief analysis report** with radar chart and strengths summary (이력서 없이 PSA만으로 생성)
- **Enhanced questioning** - 9 questions (Soul Questions 3 + Expertise 4 + Edge 2)

**5 Categories:**
1. **혁신 사고** (Innovation & Vision)
2. **철저 실행** (Execution & Discipline)
3. **대인 영향** (Influence & Impact)
4. **협업 공감** (Collaboration & Synergy)
5. **상황 회복** (Resilience & Adaptability)

**10 Persona Types:**
- 전략적 설계자 (Innovation + Execution)
- 시장 파괴자 (Innovation + Influence)
- 창의적 촉매 (Innovation + Collaboration)
- 적응형 선구자 (Innovation + Resilience)
- 퍼포먼스 드라이버 (Execution + Influence)
- 신뢰의 중추 (Execution + Collaboration)
- 강철의 완결자 (Execution + Resilience)
- 공감형 리더 (Influence + Collaboration)
- 흔들리지 않는 대변인 (Influence + Resilience)
- 회복탄력적 중재자 (Collaboration + Resilience)

## Multi-Agent Architecture

### Current Implementation (Phase 1 - LIVE)

**Template-Based Brief Report Generation:**
```
/api/survey/analyze
├─ Template Selector → BriefAnalysis (Rule-based, <1초)
└─ Database Insert  → Web profile data (/p/[slug])
```

**Note:** Currently uses template-based generation instead of AI agents for cost efficiency ($0 vs $0.002-0.005 per report). Phase 2 will introduce full multi-agent workflow.

### Agent 목록 (13개)

**Phase 1 (무료 티어) - 활성화:**
- `SurveyAnalyzerAgent` - PSA 설문 분석 (템플릿 기반, LLM 미사용)
- `BriefWebProfileGeneratorAgent` - 약식 웹 프로필 생성 (/p/[slug])

**Phase 2 (유료 티어) - 구현 완료:**
- `OrchestratorAgent` - 전체 워크플로우 조율
- `ResumeParserAgent` - 이력서 파싱
- `PortfolioAnalyzerAgent` - 포트폴리오 분석
- `QuestionDesignerAgent` - 맞춤형 질문 생성
- `BrandStrategistAgent` - 브랜드 전략 수립
- `ContentWriterAgent` - 리포트 콘텐츠 작성
- `KeywordExtractorAgent` - SEO 키워드 추출
- `ReportAssemblerAgent` - 리포트 조합
- `TextPdfGeneratorAgent` - PDF 리포트 생성
- `SlideDeckGeneratorAgent` - 슬라이드 덱 생성

**인프라:**
- `E2ETestAgent` - E2E 테스트 자동화

### Phase 2 워크플로우 (유료 티어)

```
OrchestratorAgent (agents/orchestrator.ts)
├─ Step 1: Data Collection (Parallel)
│  ├─ ResumeParserAgent       → ParsedResume (personal info, experience, skills)
│  └─ PortfolioAnalyzerAgent  → PortfolioAnalysis (projects, strengths, style)
│
├─ Step 2: Brand Strategy
│  └─ BrandStrategistAgent    → BrandStrategy (essence, value prop, audience)
│
├─ Step 3: Content Generation (Parallel)
│  ├─ ContentWriterAgent      → ReportContent (story, strengths, vision)
│  └─ KeywordExtractorAgent   → Keywords (SEO keywords, hashtags)
│
├─ Step 4: Report Assembly
│  └─ ReportAssemblerAgent    → AssembledReport (structured pages)
│
├─ Step 5: PDF Generation
│  ├─ TextPdfGeneratorAgent   → PDF report
│  └─ SlideDeckGeneratorAgent → Slide deck (PPTX + PDF)
│
└─ Step 6: Completion
```

**Note:** `QuestionDesignerAgent`는 별도 API (`/api/questions/generate`)에서 실행되며, PSA 분석 결과를 기반으로 9개 질문 생성 (Soul Questions 3 + Expertise 4 + Edge 2)

### Agent Communication Pattern

All agents extend `BaseAgent<TInput, TOutput>` with:
- `process(input, context)`: Main processing method
- `callLLM(userMessage, previousMessages)`: Claude API calls with auto-retry
- `success(data, metadata)` / `failure(error)`: Standardized results

Context object contains:
- `sessionId`: Unique session identifier
- `data`: Shared data between agents

### Key Design Principles

**1. Agent Isolation:** Each agent has a single responsibility and can be modified independently

**2. Type Safety:** All agent inputs/outputs use TypeScript interfaces defined in `types/` directory:
   - `types/resume.ts` - ParsedResume
   - `types/portfolio.ts` - PortfolioAnalysis
   - `types/survey.ts` - SurveyQuestion, SurveyResponse, BriefAnalysis, PersonaMetadata [NEW]
   - `types/brand.ts` - BrandStrategy, Keywords, BrandingQuestions
   - `types/report.ts` - ReportContent, AssembledReport, WebProfile

**3. Error Resilience:** Built-in retry logic with exponential backoff (`lib/retry.ts`):
   - All LLM calls automatically retry up to 3 times
   - Retries on network errors (408, 429, 500, 502, 503, 504)
   - Exponential backoff: 2s, 4s, 8s delays

**4. Progress Tracking:** `ProgressTracker` class updates database at each workflow step:
   - 10 total steps tracked in `report_sessions` table
   - Real-time status updates: pending → in_progress → completed/failed

## Template System (Phase 1)

Brief Report 생성에 사용되는 템플릿 기반 시스템:

**핵심 파일:**
- `lib/templates/template-selector.ts` - 템플릿 선택 로직
- `lib/templates/persona-templates.ts` - 30개 템플릿 (10 personas × 3 variants)
- `lib/templates/scenario-pool.ts` - 20개 시나리오 템플릿

**Variant 선택 로직 (`selectVariant`):**
- `balanced`: Top 2 > 70, Bottom 2 > 50 (균형 잡힌 점수)
- `spiked`: Top 2 > 75, Bottom 2 < 50 (뾰족한 강점)
- `mixed`: 기본 fallback

**템플릿 구성:**
```typescript
{
  personaType: PersonaType,
  variant: 'balanced' | 'spiked' | 'mixed',
  summaryPoints: string[]  // 3개 bullet points (150-200자씩)
}
```

**성능:**
- 처리 시간: <1초
- 비용: $0 (LLM 호출 없음)

## Soul Questions System

PSA 결과 기반 맞춤형 질문 선택 시스템:

**핵심 파일:**
- `lib/soul-questions/matching-logic.ts` - 질문 매칭 로직
- `lib/soul-questions/reframing-strategy.ts` - 저점수 카테고리 리프레이밍

**질문 선택 로직 (`selectSoulQuestions`):**
1. 고정 질문 `soul_identity_1` 항상 포함
2. PSA 상위 카테고리와 매칭되는 질문 우선 선택
3. 정확히 3개 질문 반환

**리프레이밍 전략 (`getReframedLowScores`):**
- 순위 4위 이하 카테고리 필터링
- 긍정적 관점으로 재해석된 라벨/설명 제공
- 예: "낮은 혁신 점수" → "안정적이고 검증된 방법 선호"

## File Parsing System

Files are parsed immediately on upload (not during generation):

```typescript
// app/api/upload/route.ts
const buffer = Buffer.from(await file.arrayBuffer());
const parsed = await parseFile(buffer, file.type);  // Uses pdf-parse or mammoth
// Stores parsed.text and parsed.metadata in uploads.parsed_data
```

Agents receive pre-parsed text from database, not raw files.

## Database Schema

PostgreSQL via Supabase with 11 main tables:

**Core Tables:**
- `report_sessions` - User sessions (email, status, survey_completed, brief_report_generated, timestamps)
- `uploads` - File uploads with `parsed_data` JSONB column containing extracted text
- `question_answers` - User questionnaire responses

**PSA Survey Tables:**
- `survey_questions` - 60개 PSA 설문 문항 (version controlled)
- `survey_responses` - User answers to survey questions (1-7 Likert scale)
- `brief_reports` - 템플릿 기반 brief analysis (persona, scores, strengths)

**Output Tables:**
- `reports` - Generated reports (brand_strategy, content, pdf_url)
- `web_profiles` - Public profiles (slug, profile_data, seo_data, is_public)
- `social_assets` - 소셜 미디어 에셋 (linkedin, twitter, instagram, business_card)

**Marketing Tables:**
- `waitlist` - 대기자 명단 (position, status, email, utm_params)

**Migrations:**
- `001_initial_schema.sql` - Core tables
- `002_strengthen_rls.sql` - RLS policies
- `003_add_unique_constraints.sql` - Constraints
- `004_add_survey_system.sql` - PSA survey tables
- `005_seed_survey_questions.sql` - Original 100 survey questions (deprecated)
- `006_update_survey_to_50_questions.sql` - 50 survey questions (deprecated)
- `007_update_survey_to_60_questions.sql` - **Current: 60 survey questions** (5 categories × 12 questions)

**Storage buckets:** Must be manually created in Supabase dashboard as public buckets.

## API Routes

### Survey (Phase 1 - 무료 티어)

- `GET /api/survey/questions` - 60개 PSA 설문 문항 조회 (카테고리별 정리)
- `POST /api/survey/submit` - 60개 응답 제출 (완료 여부 검증)
- `POST /api/survey/analyze` - SurveyAnalyzerAgent로 Brief Report 생성
- `GET /api/survey/result?sessionId=xxx` - Brief Analysis 결과 조회
- `POST /api/survey/save-with-email` - 이메일과 함께 설문 결과 저장 (대안 경로)
- `POST /api/survey/analyze-temp` - 임시 분석 (미리보기, 세션 없이)

### Resume & Questions (Phase 2 - 유료 티어)

- `POST /api/upload` - 이력서/포트폴리오 파일 업로드
- `POST /api/parse-resume` - 업로드된 이력서 파싱 (ResumeParserAgent)
- `POST /api/resume-form` - 이력서 폼 데이터 저장 (파일 업로드 대안)
- `POST /api/questions/generate` - PSA 결과 기반 9개 맞춤 질문 생성
- `POST /api/questions` - 질문 응답 저장

### Report Generation (Phase 2 - 유료 티어)

- `POST /api/generate` - OrchestratorAgent로 전체 리포트 생성
- `GET /api/generate?sessionId=xxx` - 생성 진행률 조회
- `GET /api/results?sessionId=xxx` - 완성된 리포트 조회

### Session & Waitlist

- `POST /api/session` - 새 세션 생성 (이메일)
- `GET /api/session?id=xxx` - 세션 상태 조회
- `POST /api/waitlist/join` - 대기자 등록
- `GET /api/waitlist/status?sessionId=xxx` - 대기자 상태 확인

### Testing

- `POST /api/test/e2e` - E2E 테스트 실행 (E2ETestAgent)
- `GET /api/test/e2e` - 테스트 API 문서

## API Route Patterns

All API routes return consistent JSON:
```typescript
// Success
{ data: T, message?: string }

// Error
{ error: string }
```

File uploads use `FormData`:
```typescript
formData.append('file', file);
formData.append('sessionId', sessionId);
formData.append('fileType', 'resume' | 'portfolio');
```

Session management via localStorage on client:
```typescript
const sessionId = localStorage.getItem('sessionId');
```

## Frontend Pages

### ✅ Implemented Pages (Phase 1)

1. `/` - Landing page with dark glassmorphism design
2. `/survey` - PSA 60-question survey with progress tracking (10 pages × 6 questions)
3. `/survey-result` - Brief analysis with persona card, radar chart, strengths summary
4. `/p/[slug]` - Public web profile (shareable, SEO-optimized)

### 🚧 Coming Soon Pages (Phase 2)

5. `/start` - Currently redirects to `/survey`
6. `/upload` - Resume and portfolio file upload (ComingSoon component)
7. `/questions` - Enhanced questionnaire (ComingSoon component)
8. `/generating` - Full report generation progress (ComingSoon component)
9. `/result` - Full branding report with brand strategy (ComingSoon component)

**Design System:**
- Upload/Questions pages: `bg-gradient-to-br from-blue-50 to-indigo-100`
- Survey pages: **Dark glassmorphism** `bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900` [UPDATED]
  - Header/cards: `bg-white/5` + `backdrop-blur-md` (glassmorphism)
  - Question cards: `bg-white/90` + `backdrop-blur-md` (high readability)
  - Buttons: Gradient `from-indigo-600 to-purple-600` with glow effects
  - Likert scale: Enhanced borders (`border-4 sm:border-[5px]`) + ring effects on selection
- Survey result: Dark gradient hero `from-purple-900 via-indigo-900 to-blue-900`
- Cards: `bg-white rounded-2xl shadow-lg`
- Buttons: Uses `@/components/ui/button` (shadcn/ui)
- Icons: lucide-react
- Charts: recharts for radar visualization [NEW]

## Common Patterns

### PSA Survey Integration Example

The `SurveyAnalyzerAgent` demonstrates how to integrate psychometric analysis:

```typescript
// agents/survey-analyzer.ts
export class SurveyAnalyzerAgent extends BaseAgent<SurveyResponse, BriefAnalysis> {
  async process(input: SurveyResponse, context: AgentContext) {
    // 1. Calculate category scores (average 1-7, normalize to 0-100)
    const categoryScores = this.calculateCategoryScores(input.answers);

    // 2. Identify top 2 categories
    const topCategories = this.getTopCategories(categoryScores);

    // 3. Map to persona (e.g., innovation+execution → "전략적 설계자")
    const persona = getPersonaByCategories(topCategories);

    // 4. Generate AI analysis
    const analysis = await this.callLLM(`
      사용자의 PSA 점수를 분석하여 강점 요약과 주의점을 작성하세요.
      페르소나: ${persona.title}
      점수: ${JSON.stringify(categoryScores)}
    `);

    return this.success({ categoryScores, persona, strengthsSummary: analysis });
  }
}
```

### Adding a New Agent

1. Create file in `agents/` extending `BaseAgent<TInput, TOutput>`
2. Define input/output interfaces in `types/`
3. Implement `async process(input, context): Promise<AgentResult<TOutput>>`
4. Add to orchestrator workflow with progress tracking
5. Update orchestrator's `process()` method with new step

### Modifying Agent Logic

Agents use system prompts (Korean) to guide Claude's behavior. To change output:
1. Update system prompt in agent constructor
2. Modify output interface in `types/`
3. Update downstream agents that consume the output
4. Test the full workflow

### Testing Agent Workflows

Trigger via API route:
```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "your-session-id"}'
```

Monitor progress in `report_sessions.status` and console logs.

## Language and Localization

- **UI text:** Korean (all component text, API messages)
- **System prompts:** Korean (agent instructions to Claude)
- **Input:** Accepts both Korean and English (resume, portfolio, questionnaire)
- **Output:** Korean (all generated report content)

## Known Limitations

- No authentication system - sessions identified by email only
- File size limit: 10MB per upload
- Supported formats: PDF, DOCX (resume/portfolio), PNG, JPG (portfolio only)
- No real-time UI updates during generation (polling required)
- PSA survey: All 60 questions must be answered to submit (no partial saves except localStorage)
- Brief report generation is synchronous (may take 10-20 seconds for LLM analysis)

## Troubleshooting

**Claude API errors:** Check `ANTHROPIC_API_KEY` and rate limits. Retry logic handles transient failures automatically.

**File upload failures:** Verify Supabase storage buckets exist and are public. Check file size (<10MB) and type.

**Agent workflow hangs:** Check console logs for specific agent failure. Each agent logs start/completion. Progress tracked in database.

**Missing parsed text:** Files must be PDF/DOCX for text extraction. Images don't extract text. Check `uploads.parsed_data` in database.

**Survey errors:** Ensure migrations 004 and 006 are applied. Verify `survey_questions` table has 60 active rows (version 2). Check `survey_completed` and `brief_report_generated` flags in `report_sessions`.

**Persona mapping issues:** Verify top 2 categories exist in `PersonaMap` (types/survey.ts). Check that category keys match pattern: `"category1-category2"`.

## Playwright E2E Testing

**End-to-End testing system** powered by Playwright with AI-based failure analysis.

### Testing Status

**✅ Active Tests (Phase 1 - Implemented Features):**
- `survey.spec.ts` - PSA survey functionality
- `survey-result.spec.ts` - Brief report display
- `public-profile.spec.ts` - Public web profile
- `user-flow.spec.ts` - Complete Phase 1 journey (adjusted for current flow)

**⏸️  Skipped Tests (Phase 2 - Coming Soon):**
- `start.spec.ts` - Email collection (deprecated, now redirects to survey)
- `upload.spec.ts` - File upload (not yet implemented)
- `questions.spec.ts` - Enhanced questionnaire (not yet implemented)
- `generating.spec.ts` - Report generation (not yet implemented)
- `result.spec.ts` - Full report results (not yet implemented)

### Testing Commands

```bash
# Run only Phase 1 (active) tests
npm run test:e2e -- tests/e2e/survey.spec.ts tests/e2e/survey-result.spec.ts tests/e2e/public-profile.spec.ts

# Run specific test file
npm run test:e2e -- tests/e2e/survey.spec.ts

# Run in headed mode (show browser)
npm run test:e2e:headed

# Debug mode (step-by-step execution)
npm run test:e2e:debug

# View test report
npm run test:e2e:report
```

### Test Structure

```
tests/
├── e2e/                        # E2E test scenarios (9 files)
│   ├── start.spec.ts          # Email entry & session creation
│   ├── survey.spec.ts         # 60-question PSA survey
│   ├── survey-result.spec.ts  # Brief report (무료 티어)
│   ├── upload.spec.ts         # Resume/portfolio upload (유료 전환)
│   ├── questions.spec.ts      # Enhanced questionnaire (9 questions)
│   ├── generating.spec.ts     # Full report generation progress
│   ├── result.spec.ts         # Final branding report output
│   ├── public-profile.spec.ts # Public web profile
│   └── user-flow.spec.ts      # Complete user journey
├── fixtures/                   # Test data & helpers
│   ├── session-manager.ts     # Session lifecycle management
│   ├── test-files.ts          # Mock PDF/DOCX files
│   ├── survey-answers.ts      # Pre-defined survey responses
│   └── questionnaire-answers.ts
├── helpers/                    # Utility functions
│   ├── network-logger.ts      # API call logging
│   ├── console-logger.ts      # Browser console capture
│   ├── screenshot-helper.ts   # Screenshot capture
│   └── report-writer.ts       # Report generation
├── agents/                     # QA AI Agent
│   └── qa-analyzer-agent.ts   # AI-powered failure analysis
└── reports/                    # Test outputs
    ├── screenshots/            # Failure screenshots
    ├── network-logs/           # API logs (JSON)
    └── ai-analysis/            # AI analysis reports (Markdown)
```

### Key Features

✅ **Complete User Flow Testing** - Tests all 8 pages from start to result
✅ **AI-Powered Failure Analysis** - Claude analyzes failures with screenshots
✅ **Network Logging** - Captures all API calls and responses
✅ **Session Management** - Automatic test data creation and cleanup
✅ **CI/CD Integration** - Automated testing on GitHub Actions
✅ **Multimodal Analysis** - Claude reads screenshots to identify UI issues

### QA Analyzer Agent

When tests fail, the QA Analyzer Agent automatically:

1. **Analyzes screenshot** - Identifies UI state, error messages, loading indicators
2. **Reviews network logs** - Checks API responses, status codes, timing
3. **Examines console errors** - Parses JavaScript errors and stack traces
4. **Generates report** - Provides root cause, impacted components, and suggested fixes

**Example AI Analysis Output:**

```markdown
## Root Cause
API 호출 타임아웃: /api/survey/submit이 30초 내 응답하지 않음.
LLM 분석 소요 시간(10-30초)이 Playwright의 기본 timeout(10초)을 초과함.

## Suggested Fixes
1. **playwright.config.ts**: timeout을 60000ms로 증가
2. **survey.spec.ts**: waitForResponse timeout을 30000ms로 설정
3. **app/api/survey/submit/route.ts**: 비동기 처리 개선 (백그라운드 job 고려)

## Severity
HIGH - 핵심 User Flow 차단
```

### Test Execution Flow

```
1. beforeEach → Create session via SessionManager
2. Test logic → Navigate pages, interact with UI, verify results
3. On failure → Capture screenshot + network logs + console errors
4. AI Analysis → QA Agent analyzes failure data
5. Generate report → Markdown report saved to tests/reports/ai-analysis/
6. afterEach → Cleanup session from Supabase
```

### Environment Variables (Testing)

Required for E2E tests:

```bash
ANTHROPIC_API_KEY=           # For QA Analyzer Agent
NEXT_PUBLIC_SUPABASE_URL=    # For SessionManager cleanup
NEXT_SUPABASE_SECRET_KEY=   # For database cleanup operations
```

### CI/CD

GitHub Actions workflow (`.github/workflows/e2e-tests.yml`):

- **Triggers**: Push to main/develop, Pull Requests
- **Runs**: Playwright tests on ubuntu-latest
- **Artifacts**: Screenshots, network logs, AI analysis reports (on failure)
- **Duration**: ~15-20 minutes for full test suite

### Testing Best Practices

- **Independent tests**: Each test creates its own session, no shared state
- **Cleanup**: `afterEach` hook deletes test data from Supabase
- **Timeouts**: LLM operations use extended timeouts (60-90s)
- **Fixtures**: Use pre-defined fixtures for consistent test data
- **Mock when needed**: Mock API responses for error scenarios

### Common Test Patterns

**Session creation:**
```typescript
const sessionManager = createSessionManager();
const sessionId = await sessionManager.createSession(page, 'test@example.com');
```

**60-question survey shortcut:**
```typescript
// Instead of clicking 60 buttons, inject answers via localStorage
const answers = generateBalancedAnswers(60);
await page.evaluate((data) => {
  localStorage.setItem('survey-answers', JSON.stringify(data));
}, answers);
```

**Network logging:**
```typescript
const networkLogger = createNetworkLogger();
networkLogger.start(page);
// ... perform actions ...
const apiLogs = networkLogger.getAPILogs();
```

**AI analysis on failure:**
```typescript
try {
  // Test logic
} catch (error) {
  const screenshotPath = await captureFailureScreenshot(page, testName);
  const analysis = await qaAgent.analyzeFailure({
    testName, error: error.message, screenshotPath, networkLogs
  });
  saveAIAnalysisReport(testName, analysis.reportMarkdown);
  throw error; // Re-throw to fail the test
}
```

### Troubleshooting E2E Tests

**"sessionId not found" errors:**
- Ensure `SessionManager.createSession()` is called in `beforeEach`
- Check localStorage persistence between page navigations

**Timeout errors on /survey-result:**
- LLM analysis takes 10-30 seconds, increase `waitForURL` timeout to 90000ms

**Cleanup failures:**
- Verify `NEXT_SUPABASE_SECRET_KEY` is set correctly
- Check foreign key constraints (delete in correct order)

**AI analysis not generating:**
- Confirm `ANTHROPIC_API_KEY` is set in `.env.local`
- Check API rate limits if many tests fail simultaneously

For detailed testing documentation, see `tests/README.md`.
