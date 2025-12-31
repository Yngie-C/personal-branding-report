# E2E Testing Guide

Playwright 기반 E2E (End-to-End) 테스트 시스템 문서입니다.

## 목차

- [개요](#개요)
- [테스트 실행](#테스트-실행)
- [테스트 구조](#테스트-구조)
- [Helper Functions](#helper-functions)
- [QA Analyzer Agent](#qa-analyzer-agent)
- [트러블슈팅](#트러블슈팅)

---

## 개요

이 E2E 테스트 시스템은 Playwright를 사용하여 전체 User Flow (start → upload → survey → survey-result → questions → generating → result → public profile)를 자동으로 테스트합니다.

### 주요 기능

✅ **8개 페이지 전체 테스트**
✅ **브라우저 자동화** (Chromium)
✅ **AI 기반 실패 분석** (Claude Sonnet 4.5)
✅ **네트워크/콘솔 로그 수집**
✅ **스크린샷 캡처 (실패 시)**
✅ **세션 관리 및 자동 Cleanup**

---

## 테스트 실행

### 로컬 환경

**1. 의존성 설치**
```bash
npm install
npx playwright install chromium
```

**2. 환경 변수 설정**

`.env.local` 파일에 다음 변수를 추가하세요:
```bash
ANTHROPIC_API_KEY=your_api_key_here
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
NEXT_SUPABASE_SECRET_KEY=your_service_secret_key
```

**3. 개발 서버 실행 (별도 터미널)**
```bash
npm run dev
```

**4. 테스트 실행**

```bash
# 모든 E2E 테스트 실행
npm run test:e2e

# UI 모드로 실행 (시각적 디버깅)
npm run test:e2e:ui

# 특정 테스트만 실행
npm run test:e2e -- tests/e2e/start.spec.ts

# 헤드리스 모드 끄기 (브라우저 보이기)
npm run test:e2e:headed

# 디버그 모드
npm run test:e2e:debug
```

**5. 테스트 리포트 보기**
```bash
npm run test:e2e:report
```

---

## 테스트 구조

### 디렉토리 구조

```
tests/
├── e2e/                        # E2E 테스트 파일
│   ├── start.spec.ts          # /start 페이지 테스트
│   ├── upload.spec.ts         # /upload 페이지 테스트
│   ├── survey.spec.ts         # /survey 페이지 테스트 (100문항)
│   ├── survey-result.spec.ts  # /survey-result 페이지 테스트
│   ├── questions.spec.ts      # /questions 페이지 테스트
│   ├── generating.spec.ts     # /generating 페이지 테스트
│   ├── result.spec.ts         # /result 페이지 테스트
│   ├── public-profile.spec.ts # /p/[slug] 페이지 테스트
│   └── user-flow.spec.ts      # 전체 여정 통합 테스트
├── fixtures/                   # 테스트 데이터
│   ├── session-manager.ts     # 세션 생성/정리 헬퍼
│   ├── test-files.ts          # 업로드용 파일 fixtures
│   ├── survey-answers.ts      # 설문 답변 세트
│   └── questionnaire-answers.ts # 질문지 답변
├── helpers/                    # 유틸리티
│   ├── network-logger.ts      # API 로그 수집
│   ├── console-logger.ts      # 브라우저 콘솔 로그
│   ├── screenshot-helper.ts   # 스크린샷 캡처
│   └── report-writer.ts       # 리포트 저장
├── agents/                     # QA AI Agent
│   └── qa-analyzer-agent.ts   # 실패 분석 Agent
└── reports/                    # 테스트 결과물
    ├── screenshots/            # 실패 시 스크린샷
    ├── network-logs/           # 네트워크 로그 (JSON)
    └── ai-analysis/            # AI 분석 리포트 (Markdown)
```

### 주요 테스트 파일

| 파일 | 설명 | 테스트 수 |
|------|------|---------|
| `start.spec.ts` | 이메일 입력, 세션 생성 | 7 |
| `upload.spec.ts` | 이력서/포트폴리오 업로드 | 8 |
| `survey.spec.ts` | 100문항 PSA 설문 | 12 |
| `survey-result.spec.ts` | 페르소나 분석 결과 | 8 |
| `questions.spec.ts` | AI 맞춤 질문 | 8 |
| `generating.spec.ts` | 리포트 생성 진행 | 7 |
| `result.spec.ts` | 최종 결과 다운로드 | 9 |
| `public-profile.spec.ts` | 공개 프로필 | 10 |
| `user-flow.spec.ts` | **전체 통합 테스트** | 2 |

---

## Helper Functions

### 1. SessionManager

세션 생성 및 정리를 자동화합니다.

```typescript
import { createSessionManager } from '../fixtures/session-manager';

const sessionManager = createSessionManager();

// 세션 생성
const sessionId = await sessionManager.createSession(page);

// 세션 정리 (테스트 종료 시)
await sessionManager.cleanupSession(sessionId);
```

### 2. NetworkLogger

API 호출 및 네트워크 트래픽을 기록합니다.

```typescript
import { createNetworkLogger } from '../helpers/network-logger';

const networkLogger = createNetworkLogger();
networkLogger.start(page);

// 로그 가져오기
const logs = networkLogger.getLogs();
const apiLogs = networkLogger.getAPILogs();
const failed = networkLogger.getFailedRequests();
```

### 3. Screenshot Helper

스크린샷을 캡처합니다.

```typescript
import { captureFailureScreenshot } from '../helpers/screenshot-helper';

const screenshotPath = await captureFailureScreenshot(page, testInfo.title);
```

---

## QA Analyzer Agent

테스트 실패 시 Claude가 자동으로 원인을 분석하고 해결책을 제시합니다.

### 사용 방법

```typescript
import { createQAAnalyzerAgent } from '../agents/qa-analyzer-agent';

const qaAgent = createQAAnalyzerAgent();

try {
  // 테스트 로직
  await page.goto('/start');
  // ...
} catch (error) {
  // 실패 시 AI 분석
  const screenshotPath = await captureFailureScreenshot(page, testName);
  const networkLogs = await networkLogger.getLogs();

  const analysis = await qaAgent.analyzeFailure({
    testName: 'My Test',
    error: error.message,
    screenshotPath,
    networkLogs,
    pageURL: page.url(),
  });

  console.log('Root Cause:', analysis.rootCause);
  console.log('Severity:', analysis.severity);

  // 리포트 저장
  saveAIAnalysisReport(testName, analysis.reportMarkdown);
}
```

### AI 분석 리포트 예시

```markdown
# E2E Test Failure Analysis

**Test**: should complete survey
**Severity**: HIGH

## Root Cause
API 호출 타임아웃: /api/survey/submit이 30초 내 응답하지 않음

## Impacted Components
- app/api/survey/submit/route.ts
- agents/survey-analyzer.ts

## Suggested Fixes
1. API timeout 설정을 60초로 증가
2. LLM 호출에 재시도 로직 추가
3. 프론트엔드에서 로딩 상태 개선

## Related Issues
- /api/questions/generate도 유사한 타임아웃 가능성
```

---

## 트러블슈팅

### 문제: 테스트가 /start로 계속 리다이렉트됨

**원인**: sessionId가 localStorage에 없음

**해결**:
```typescript
// beforeEach에서 세션 생성 확인
test.beforeEach(async ({ page }) => {
  sessionId = await sessionManager.createSession(page);
  expect(sessionId).toBeTruthy();
});
```

---

### 문제: 설문 제출 후 /survey-result로 이동하지 않음

**원인**: LLM 분석이 오래 걸림 (10-30초)

**해결**:
```typescript
// timeout 증가
await expect(page).toHaveURL('/survey-result', { timeout: 90000 });
```

---

### 문제: "Timeout exceeded while waiting for response" 에러

**원인**: API 호출이 완료되지 않음

**해결**:
1. 개발 서버가 실행 중인지 확인 (`npm run dev`)
2. API 로그 확인 (network logger 사용)
3. Supabase 연결 확인 (환경 변수)

---

### 문제: AI 분석 리포트가 생성되지 않음

**원인**: `ANTHROPIC_API_KEY`가 설정되지 않음

**해결**:
```bash
# .env.local에 추가
ANTHROPIC_API_KEY=your_key_here
```

---

### 문제: cleanup 실패 (세션이 삭제되지 않음)

**원인**: `NEXT_SUPABASE_SECRET_KEY`가 없음

**해결**:
```bash
# .env.local에 secret key 추가
NEXT_SUPABASE_SECRET_KEY=your_secret_key
```

---

## 모범 사례

### ✅ DO

- **각 테스트를 독립적으로 작성**
  다른 테스트에 의존하지 않도록 합니다.

- **afterEach에서 cleanup 수행**
  테스트 데이터를 정리하여 다음 테스트에 영향을 주지 않습니다.

- **의미 있는 테스트 이름 사용**
  `should display error when...` 형식으로 작성합니다.

- **적절한 timeout 설정**
  LLM 호출 등 오래 걸리는 작업은 timeout을 충분히 설정합니다.

### ❌ DON'T

- **hardcoded sessionId 사용 금지**
  항상 SessionManager로 동적으로 생성합니다.

- **실제 프로덕션 DB 사용 금지**
  테스트 전용 Supabase 프로젝트를 사용합니다.

- **테스트 간 데이터 공유 금지**
  각 테스트는 자체 fixture를 사용합니다.

- **무한 대기 금지**
  항상 timeout을 명시적으로 설정합니다.

---

## CI/CD

GitHub Actions에서 자동으로 E2E 테스트가 실행됩니다.

- **Trigger**: Push to main/develop, Pull Request
- **실행 시간**: 약 15-20분
- **Artifacts**: 실패 시 스크린샷, 네트워크 로그, AI 분석 리포트 업로드

워크플로우 파일: `.github/workflows/e2e-tests.yml`

---

## 추가 리소스

- [Playwright 공식 문서](https://playwright.dev/docs/intro)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [프로젝트 계획서](/Users/gichang_lee/.claude/plans/nested-wobbling-wadler.md)

---

**Generated by Playwright E2E Test Suite**
