# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A multi-agent AI system that analyzes resumes and portfolios to automatically generate professional personal branding reports. Built with Next.js 14 and Claude Agent SDK, featuring 9 specialized AI agents that collaborate to produce web profiles and brand analysis.

**Key outputs:**
- Public web profile page (shareable URL at `/p/[slug]`)
- Brand strategy and content analysis

**User flow:** Email-based session (no login) → PSA Survey (60 questions) → **Brief report (무료)** → File upload → Enhanced questionnaire (9 questions) → **Full report generation (유료)**

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

The system uses 9 specialized agents orchestrated in a specific workflow:

### Orchestration Flow

**Phase 1 (무료 티어) - PSA 설문만으로 약식 보고서 생성:**
```
/api/survey/analyze
├─ SurveyAnalyzerAgent      → BriefAnalysis (템플릿 기반, <1초)
└─ WebProfileGeneratorAgent → Public web profile (/p/[slug])
```

**Brief Report Generation (Rule-Based Template System):**
- **Processing:** Template-based (no LLM calls)
- **Speed:** <1 second (vs 10-30s with AI)
- **Cost:** $0 (vs $0.002-0.005 with AI)
- **Content:**
  - `strengthsSummary`: 30 pre-written templates (10 personas × 3 variants)
  - `strengthsScenarios`: 22 scenario templates matched to top categories
  - `shadowSides`: Generated from persona metadata + reframing
  - `brandingKeywords`: From persona metadata
- **Templates:** `lib/templates/persona-templates.ts`, `lib/templates/scenario-pool.ts`
- **Selection logic:** `lib/templates/template-selector.ts` (variant: balanced/spiked/mixed)

**Phase 2 (유료 티어) - OrchestratorAgent 전체 워크플로우:**
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
└─ Step 5: Completion
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

PostgreSQL via Supabase with 9 main tables:

**Core Tables:**
- `report_sessions` - User sessions (email, status, survey_completed, brief_report_generated, timestamps)
- `uploads` - File uploads with `parsed_data` JSONB column containing extracted text
- `question_answers` - User questionnaire responses

**PSA Survey Tables (NEW):**
- `survey_questions` - Fixed 50-question PSA survey (version controlled)
- `survey_responses` - User answers to survey questions (1-7 Likert scale)
- `brief_reports` - AI-generated brief analysis (persona, scores, strengths)

**Output Tables:**
- `reports` - Generated reports (brand_strategy, content, pdf_url)
- `web_profiles` - Public profiles (slug, profile_data, seo_data, is_public)

**Migrations:**
- `001_initial_schema.sql` - Core tables
- `002_strengthen_rls.sql` - RLS policies
- `003_add_unique_constraints.sql` - Constraints
- `004_add_survey_system.sql` - PSA survey tables
- `005_seed_survey_questions.sql` - Original 100 survey questions (deprecated)
- `006_update_survey_to_50_questions.sql` - 50 survey questions (deprecated)
- `007_update_survey_to_60_questions.sql` - **Current: 60 survey questions** (5 categories × 12 questions)

**Storage buckets:** Must be manually created in Supabase dashboard as public buckets.

## PSA Survey API Routes (NEW)

**Survey Management:**
- `GET /api/survey/questions` - Retrieve 50 survey questions organized by category
- `POST /api/survey/submit` - Submit user's 50 answers (validates completeness)
- `POST /api/survey/analyze` - Trigger SurveyAnalyzerAgent to generate brief report
- `GET /api/survey/result?sessionId=xxx` - Retrieve brief analysis results

**Enhanced Question Generation:**
- `POST /api/questions/generate` - Now accepts PSA results to generate 7-10 focused questions (instead of 15-20)

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

**User Journey:**
1. `/start` - Email collection and session creation
2. `/survey` - PSA 60-question survey with progress tracking
3. `/survey-result` - **Brief analysis (무료 티어)** with persona card, radar chart, and web profile
4. `/upload` - **Resume and portfolio file upload (유료 전환 시점)**
5. `/questions` - Enhanced questionnaire (9 questions: Soul Questions 3 + Expertise 4 + Edge 2)
6. `/generating` - Full report generation progress
7. `/result` - **Full branding report (유료 티어)** with brand strategy and content analysis
8. `/p/[slug]` - Public web profile (shareable, generated in Phase 1)

**Design System:**
- Upload/Questions pages: `bg-gradient-to-br from-blue-50 to-indigo-100`
- Survey pages: `bg-gradient-to-br from-purple-50 to-indigo-100` [NEW]
- Survey result: Dark gradient hero `from-purple-900 via-indigo-900 to-blue-900` [NEW]
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

## Playwright E2E Testing (NEW)

**End-to-End testing system** powered by Playwright with AI-based failure analysis.

### Testing Commands

```bash
# Run all E2E tests
npm run test:e2e

# Run tests with UI (visual debugging)
npm run test:e2e:ui

# Run specific test file
npm run test:e2e -- tests/e2e/start.spec.ts

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
