# E2E 테스트 가이드

퍼스널 브랜딩 리포트 생성 시스템의 전체 워크플로우를 자동으로 테스트하는 E2E 테스트 Agent입니다.

## 개요

E2ETestAgent는 다음 전체 여정을 자동으로 실행하고 검증합니다:

1. ✅ 세션 생성
2. ✅ 이력서 파일 업로드
3. ✅ 포트폴리오 파일 업로드 (선택)
4. ✅ PSA 설문 100문항 제출
5. ✅ PSA 설문 분석 (Brief Report 생성)
6. ✅ 향상된 질문 생성 (PSA 기반)
7. ✅ 질문 응답 제출
8. ✅ 최종 리포트 생성
9. ✅ 리포트 완료 대기 및 검증
10. ✅ 생성된 아티팩트 검증 (PDF, Web Profile, Social Assets)
11. ✅ 테스트 데이터 정리 (옵션)

## 빠른 시작

### 1. API를 통한 실행

```bash
# 기본 테스트 실행 (자동으로 테스트 데이터 사용)
curl -X POST http://localhost:3000/api/test/e2e \
  -H "Content-Type: application/json"

# 커스텀 이메일로 실행
curl -X POST http://localhost:3000/api/test/e2e \
  -H "Content-Type: application/json" \
  -d '{
    "email": "my-test@example.com",
    "cleanupAfterTest": true,
    "timeoutMs": 300000
  }'
```

### 2. Agent를 직접 호출

```typescript
import { E2ETestAgent } from '@/agents/e2e-test-agent';
import { getTestFixtures } from '@/test-data/fixtures';

const agent = new E2ETestAgent();
const config = {
  email: 'test@example.com',
  ...getTestFixtures(),
  cleanupAfterTest: true,
  timeoutMs: 300000,
};

const result = await agent.process(config, {
  sessionId: 'e2e-test',
  data: {},
});

console.log(result.data);
```

## API 응답 형식

### 성공 응답

```json
{
  "data": {
    "testId": "e2e-test-1234567890",
    "startTime": "2025-01-01T12:00:00.000Z",
    "endTime": "2025-01-01T12:05:00.000Z",
    "totalDuration": 300000,
    "success": true,
    "steps": [
      {
        "stepName": "Create Session",
        "stepNumber": 1,
        "success": true,
        "duration": 150,
        "data": {
          "sessionId": "uuid-here"
        }
      }
      // ... 나머지 단계들
    ],
    "summary": {
      "totalSteps": 11,
      "passedSteps": 11,
      "failedSteps": 0,
      "warningCount": 0
    },
    "sessionData": {
      "sessionId": "uuid-here",
      "email": "test@example.com",
      "reportId": "report-uuid",
      "pdfUrl": "https://...",
      "webProfileSlug": "kim-chulsoo"
    }
  },
  "message": "E2E test completed successfully"
}
```

### 실패 응답

```json
{
  "error": "E2E test failed",
  "details": {
    "testId": "e2e-test-1234567890",
    "success": false,
    "steps": [
      {
        "stepName": "Create Session",
        "stepNumber": 1,
        "success": true,
        "duration": 150
      },
      {
        "stepName": "Upload Resume",
        "stepNumber": 2,
        "success": false,
        "duration": 100,
        "error": "File upload to storage failed: ..."
      }
    ],
    "summary": {
      "totalSteps": 2,
      "passedSteps": 1,
      "failedSteps": 1,
      "warningCount": 0
    },
    "errors": [
      "Step 2 (Upload Resume): File upload to storage failed: ..."
    ]
  }
}
```

## 테스트 데이터 커스터마이징

기본 제공되는 테스트 데이터 대신 커스텀 데이터를 사용하려면:

```typescript
const customConfig = {
  email: 'custom@example.com',
  resumeFile: {
    filename: 'my-resume.txt',
    content: '나의 이력서 내용...',
    mimeType: 'text/plain',
  },
  portfolioFile: {
    filename: 'my-portfolio.txt',
    content: '나의 포트폴리오 내용...',
    mimeType: 'text/plain',
  },
  surveyData: {
    answers: {
      1: 7, 2: 6, 3: 5, // ... 100개 답변
    },
  },
  questionnaireData: {
    answers: {
      q1: '나의 가장 큰 성취는...',
      q2: '5년 후 나는...',
      // ...
    },
  },
  cleanupAfterTest: true,
  timeoutMs: 300000,
};
```

## 테스트 Fixtures

`test-data/fixtures.ts`에서 다음 함수들을 제공합니다:

### `getTestFixtures()`
완전한 테스트 데이터 세트를 반환합니다:
- 상세한 이력서 (프로덕트 매니저 5년 경력)
- 포트폴리오 (3개 프로젝트)
- PSA 설문 100개 답변 (전략적 설계자 페르소나)
- 질문지 7개 답변

### `getMinimalTestFixtures()`
빠른 테스트를 위한 최소 데이터:
- 간단한 이력서 (4줄)
- PSA 설문 100개 답변 (모두 5점)
- 질문지 3개 답변

### 개별 Fixture 함수
- `getTestResumeFile()`: 이력서 데이터만
- `getTestPortfolioFile()`: 포트폴리오 데이터만
- `getTestSurveyData()`: PSA 설문 답변만
- `getTestQuestionnaireData()`: 질문지 답변만

## 주요 검증 항목

E2ETestAgent는 다음 항목들을 자동으로 검증합니다:

1. **데이터베이스 생성**
   - report_sessions 레코드 생성
   - uploads 레코드 생성
   - survey_responses 100개 생성
   - brief_reports 레코드 생성
   - question_answers 레코드 생성
   - reports 레코드 생성

2. **파일 업로드**
   - Supabase Storage에 파일 업로드
   - Public URL 생성
   - parsed_data JSONB에 텍스트 추출

3. **플래그 업데이트**
   - survey_completed: false → true
   - brief_report_generated: false → true
   - status: pending → in_progress → completed

4. **아티팩트 생성**
   - PDF URL 존재 여부
   - Web Profile slug 생성 여부
   - Social Assets 생성 여부

## 문제 해결

### 테스트가 타임아웃되는 경우

```json
{
  "timeoutMs": 600000  // 10분으로 증가
}
```

### Cleanup을 건너뛰고 데이터 확인하기

```json
{
  "cleanupAfterTest": false
}
```

생성된 sessionId로 데이터베이스를 직접 확인할 수 있습니다.

### 특정 단계만 테스트하기

현재는 전체 워크플로우만 지원합니다. 개별 단계 테스트가 필요한 경우 각 Agent의 유닛 테스트를 작성하는 것을 권장합니다.

## 통합 방법

### CI/CD 파이프라인에 통합

```yaml
# .github/workflows/e2e-test.yml
name: E2E Test

on: [push, pull_request]

jobs:
  e2e-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run build
      - run: npm run start &
      - name: Wait for server
        run: npx wait-on http://localhost:3000
      - name: Run E2E test
        run: |
          curl -X POST http://localhost:3000/api/test/e2e \
            -H "Content-Type: application/json" \
            -d '{"cleanupAfterTest": true}' \
            --fail
```

### 로컬 개발에서 정기적으로 실행

```bash
# package.json
{
  "scripts": {
    "test:e2e": "curl -X POST http://localhost:3000/api/test/e2e -H 'Content-Type: application/json'"
  }
}
```

```bash
npm run dev  # 별도 터미널
npm run test:e2e  # 개발 서버 실행 후
```

## 성능 벤치마크

일반적인 실행 시간 (로컬 환경):

- **전체 워크플로우**: 2-5분
  - 세션 생성: ~100ms
  - 파일 업로드: ~500ms
  - PSA 설문 제출: ~300ms
  - PSA 분석 (LLM): ~10-20초
  - 질문 생성 (LLM): ~5-10초
  - 리포트 생성 (LLM 다중 호출): ~60-120초
  - 아티팩트 검증: ~500ms
  - Cleanup: ~1초

## 제한 사항

현재 E2ETestAgent는 다음 제한이 있습니다:

1. **Mock 데이터 사용**: Figma/Canva MCP는 실제로 호출되지 않고 mock 데이터 사용
2. **실제 LLM 호출**: Claude API를 실제로 호출하므로 비용 발생
3. **순차 실행**: 병렬 처리 없이 순차적으로 실행
4. **에러 복구 없음**: 중간 단계 실패 시 재시도하지 않음

## 향후 개선 계획

- [ ] 개별 단계별 테스트 지원
- [ ] Mock LLM 응답 옵션 추가 (비용 절감)
- [ ] 병렬 실행 지원 (여러 세션 동시 테스트)
- [ ] 성능 메트릭 수집 및 리포팅
- [ ] Snapshot 테스트 (생성된 콘텐츠 비교)
- [ ] 에러 복구 및 재시도 로직

## 라이선스

프로젝트 라이선스를 따릅니다.
