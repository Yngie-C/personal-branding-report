# Vercel 배포 가이드

이 문서는 Personal Branding Report 프로젝트를 Vercel에 배포하는 전체 과정을 설명합니다.

## 목차

1. [사전 준비사항](#사전-준비사항)
2. [Supabase 프로젝트 설정](#supabase-프로젝트-설정)
3. [Vercel 프로젝트 생성](#vercel-프로젝트-생성)
4. [환경 변수 설정](#환경-변수-설정)
5. [배포 실행](#배포-실행)
6. [배포 후 확인사항](#배포-후-확인사항)
7. [도메인 설정 (옵션)](#도메인-설정-옵션)
8. [문제 해결](#문제-해결)

---

## 사전 준비사항

배포 전에 다음 항목들을 준비해주세요:

- [x] GitHub 계정
- [x] Vercel 계정 (https://vercel.com)
- [x] Supabase 계정 (https://supabase.com)
- [x] Anthropic API Key (https://console.anthropic.com)
- [x] 프로젝트 코드가 GitHub repository에 push되어 있어야 함

---

## Supabase 프로젝트 설정

### 1. 새 Supabase 프로젝트 생성

1. [Supabase Dashboard](https://app.supabase.com)에 로그인
2. **"New Project"** 클릭
3. 프로젝트 정보 입력:
   - **Name**: `personal-branding-report` (또는 원하는 이름)
   - **Database Password**: 강력한 비밀번호 설정 (안전하게 보관!)
   - **Region**: `Northeast Asia (Seoul)` 추천 (한국 사용자 대상)
4. **"Create new project"** 클릭 (생성 완료까지 약 2-3분 소요)

### 2. Database Migrations 실행

프로젝트가 생성되면 다음 순서대로 migration을 실행하세요:

1. Supabase Dashboard → **"SQL Editor"** 메뉴로 이동
2. **"New query"** 클릭
3. 다음 migration 파일들을 **순서대로** 실행:

```bash
# 실행 순서 (파일명 순서대로)
1. supabase/migrations/001_initial_schema.sql
2. supabase/migrations/002_strengthen_rls.sql
3. supabase/migrations/003_add_unique_constraints.sql
4. supabase/migrations/004_add_survey_system.sql
5. supabase/migrations/007_update_survey_to_60_questions.sql
```

**각 파일을 하나씩 복사 → 붙여넣기 → Run 하세요.**

> **주의:** Migration 005, 006은 deprecated되었으므로 실행하지 마세요. 007 버전이 최신입니다.

### 3. Storage Buckets 생성

1. Supabase Dashboard → **"Storage"** 메뉴로 이동
2. 다음 4개 bucket을 **각각** 생성:
   - `resumes` (Public bucket)
   - `portfolios` (Public bucket)
   - `assets` (Public bucket)
   - `reports` (Public bucket)

**각 bucket 생성 방법:**
1. **"New bucket"** 클릭
2. **Name** 입력 (위 이름 중 하나)
3. **"Public bucket"** 체크박스 활성화 ✅
4. **"Create bucket"** 클릭

> **중요:** 모든 bucket은 반드시 **Public**으로 설정해야 합니다.

### 4. API Keys 복사

1. Supabase Dashboard → **"Settings"** → **"API"** 메뉴로 이동
2. 다음 3가지 값을 복사해서 안전하게 보관:
   - **Project URL** (예: `https://xxxxx.supabase.co`)
   - **anon public** key
   - **service_role** key (🔒 절대 외부에 노출하지 마세요!)

---

## Vercel 프로젝트 생성

### 1. GitHub Repository 연동

1. [Vercel Dashboard](https://vercel.com/dashboard)에 로그인
2. **"Add New..."** → **"Project"** 클릭
3. **"Import Git Repository"** 섹션에서 GitHub repository 선택
   - GitHub 계정 연동이 안 되어 있다면 **"Install Vercel for GitHub"** 클릭
4. Repository 선택: `personal-branding-report`

### 2. 프로젝트 설정

다음 설정을 확인/입력하세요:

- **Framework Preset**: `Next.js` (자동 감지됨)
- **Root Directory**: `./` (기본값 유지)
- **Build Command**: `npm run build` (기본값 유지)
- **Output Directory**: `.next` (기본값 유지)
- **Install Command**: `npm install` (기본값 유지)

> **Node.js Version**: Vercel은 자동으로 최신 LTS 버전을 사용합니다. 특정 버전이 필요하면 `package.json`에 명시하세요.

---

## 환경 변수 설정

**아직 "Deploy" 버튼을 누르지 마세요!** 먼저 환경 변수를 설정해야 합니다.

### Environment Variables 추가

Vercel 프로젝트 설정 화면에서:

1. **"Environment Variables"** 섹션으로 스크롤
2. 다음 4개 환경 변수를 **하나씩** 추가:

| Key | Value | Environment |
|-----|-------|-------------|
| `ANTHROPIC_API_KEY` | `sk-ant-api03-...` (Anthropic API Key) | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxx.supabase.co` | Production, Preview, Development |
| `NEXT_SUPABASE_PUBLISHABLE_KEY` | `eyJhbGc...` (Supabase anon key) | Production, Preview, Development |
| `NEXT_SUPABASE_SECRET_KEY` | `eyJhbGc...` (Supabase service_role key) | Production, Preview, Development |

**각 변수 추가 방법:**
1. **Key** 입력
2. **Value** 입력
3. **Environment** 체크박스 3개 모두 선택 ✅
4. **"Add"** 클릭

### 환경 변수 값 확인

| 변수명 | 값 가져오는 곳 |
|--------|---------------|
| `ANTHROPIC_API_KEY` | [Anthropic Console](https://console.anthropic.com) → API Keys |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Settings → API → Project URL |
| `NEXT_SUPABASE_PUBLISHABLE_KEY` | Supabase Dashboard → Settings → API → anon public key |
| `NEXT_SUPABASE_SECRET_KEY` | Supabase Dashboard → Settings → API → service_role key |

> **보안 주의:**
> - `NEXT_SUPABASE_SECRET_KEY`는 절대 클라이언트 코드에서 사용하지 마세요
> - `.env.local` 파일은 절대 Git에 커밋하지 마세요 (`.gitignore`에 이미 포함됨)

---

## 배포 실행

모든 설정이 완료되었으면:

1. **"Deploy"** 버튼 클릭
2. 배포 진행 상황을 실시간으로 확인 (약 2-5분 소요)
3. 배포 완료 시 **"Visit"** 버튼으로 사이트 확인

배포 로그에서 다음 단계들이 성공적으로 완료되는지 확인하세요:
- ✅ Installing dependencies
- ✅ Building application
- ✅ Collecting page data
- ✅ Finalizing deployment

---

## 배포 후 확인사항

### 1. 사이트 동작 테스트

배포된 URL에서 다음 기능들을 테스트하세요:

- [ ] **랜딩 페이지** (`/`) 로딩 확인
- [ ] **PSA 설문** (`/survey`) 진입 및 질문 표시 확인
- [ ] **설문 제출** → 60개 질문 모두 답변 후 제출
- [ ] **분석 결과** (`/survey-result`) 페이지 표시 확인
  - Persona card 표시
  - Radar chart 렌더링
  - 강점 요약 표시
- [ ] **공개 프로필** (`/p/[slug]`) 접근 확인

### 2. 환경 변수 확인

만약 다음과 같은 에러가 발생하면:
```
Error: Missing environment variable: ANTHROPIC_API_KEY
```

**해결 방법:**
1. Vercel Dashboard → 프로젝트 선택 → **"Settings"** → **"Environment Variables"**
2. 해당 변수가 올바르게 설정되었는지 확인
3. 변수 수정 후 **"Redeploy"** 필요 (Deployments → 최신 배포 → ⋯ → Redeploy)

### 3. Database 연결 확인

설문 제출 시 `500 Internal Server Error`가 발생하면:

1. Supabase Dashboard → **"Table Editor"**에서 테이블 확인
   - `report_sessions`, `survey_questions`, `survey_responses`, `brief_reports` 테이블 존재 확인
2. Migration이 올바르게 실행되었는지 재확인
3. Vercel Logs에서 에러 메시지 확인 (Dashboard → Deployments → Runtime Logs)

### 4. API Logs 확인

Vercel Dashboard에서:
1. **"Deployments"** → 최신 배포 클릭
2. **"Runtime Logs"** 탭에서 실시간 로그 확인
3. 에러 발생 시 stack trace 확인

---

## 도메인 설정 (옵션)

커스텀 도메인을 연결하려면:

### 1. 도메인 추가

1. Vercel Dashboard → 프로젝트 → **"Settings"** → **"Domains"**
2. **"Add"** 버튼 클릭
3. 도메인 입력 (예: `mybrand.com`)

### 2. DNS 설정

도메인 등록 업체(GoDaddy, Namecheap 등)에서 다음 DNS 레코드 추가:

**Option A: CNAME (추천)**
```
Type: CNAME
Name: www (또는 @)
Value: cname.vercel-dns.com
```

**Option B: A Record**
```
Type: A
Name: @
Value: 76.76.21.21
```

DNS 전파 완료까지 최대 48시간 소요 (보통 10-30분)

### 3. SSL 인증서

Vercel이 자동으로 Let's Encrypt SSL 인증서를 발급합니다 (무료).
- 도메인 추가 후 약 5-10분 내 자동 활성화
- HTTPS 자동 리다이렉트 활성화됨

---

## 문제 해결

### 1. 빌드 실패 (Build Error)

**에러:** `Error: Command "npm run build" exited with 1`

**해결 방법:**
1. 로컬에서 `npm run build` 실행하여 에러 재현
2. TypeScript 에러 확인 (`npm run lint`)
3. 에러 수정 후 Git push → Vercel 자동 재배포

### 2. 런타임 에러 (500 Internal Server Error)

**증상:** 페이지가 로딩되지 않거나 API 호출 실패

**해결 방법:**
1. Vercel → **"Deployments"** → **"Runtime Logs"** 확인
2. 환경 변수가 올바르게 설정되었는지 확인
3. Supabase 연결 테스트:
   ```bash
   curl https://YOUR_SUPABASE_URL/rest/v1/ \
     -H "apikey: YOUR_ANON_KEY"
   ```

### 3. Survey Analyzer 타임아웃

**에러:** `Function execution timed out after 10s`

**원인:** Claude API 호출이 10초를 초과함

**해결 방법:**
1. Vercel Dashboard → **"Settings"** → **"Functions"**
2. **"Max Duration"** 설정 확인
   - Free plan: 10초 (제한)
   - Pro plan: 최대 60초 설정 가능
3. Pro plan으로 업그레이드 필요할 수 있음

**임시 해결책:** Brief report generation을 template 기반으로 전환 (이미 구현됨 - `lib/templates/`)

### 4. Image/File Upload 실패

**증상:** Resume/portfolio 업로드 시 에러

**해결 방법:**
1. Supabase Storage bucket이 **Public**으로 설정되었는지 확인
2. Bucket 이름 확인: `resumes`, `portfolios`, `assets`, `reports`
3. Supabase Dashboard → **"Storage"** → Bucket 클릭 → **"Make public"**

### 5. CORS 에러

**에러:** `Access to fetch at 'https://xxx.supabase.co' from origin 'https://xxx.vercel.app' has been blocked by CORS policy`

**해결 방법:**
1. Supabase Dashboard → **"Settings"** → **"API"** → **"CORS"**
2. Vercel 도메인을 Allowed Origins에 추가
   ```
   https://your-project.vercel.app
   https://*.vercel.app
   ```

### 6. Git LFS 파일 누락

**증상:** 이미지나 PDF 파일이 표시되지 않음

**해결 방법:**
1. `.gitattributes` 확인하여 LFS 설정 확인
2. Vercel에서 LFS 파일 자동으로 다운로드됨 (별도 설정 불필요)
3. 파일이 실제로 Git LFS에 저장되었는지 확인:
   ```bash
   git lfs ls-files
   ```

---

## 지속적 배포 (Continuous Deployment)

Vercel은 GitHub와 연동되어 자동 배포됩니다:

- **Main branch push** → Production 자동 배포
- **PR 생성** → Preview deployment 자동 생성
- **Commit 시마다** 배포 상태를 GitHub PR에 코멘트

### 배포 알림 설정

Vercel Dashboard → **"Settings"** → **"Notifications"**에서:
- ✅ Deployment Started
- ✅ Deployment Ready
- ✅ Deployment Failed

Slack, Discord, Email 등으로 알림 수신 가능

---

## 성능 최적화 팁

배포 후 성능을 개선하려면:

### 1. Edge Functions 활용

Vercel의 Edge Network를 활용하여 전 세계 사용자에게 빠른 응답 제공

### 2. Image Optimization

Next.js `Image` 컴포넌트 사용 (이미 적용됨):
```tsx
import Image from 'next/image';

<Image src="/hero.jpg" width={800} height={600} alt="Hero" />
```

### 3. Analytics 설정

Vercel Dashboard → **"Analytics"** 탭에서:
- Real User Monitoring (RUM) 활성화
- Web Vitals 추적 (LCP, FID, CLS)

### 4. Caching 전략

API Routes에 캐싱 헤더 추가:
```typescript
export const revalidate = 3600; // 1시간 캐싱
```

---

## 모니터링 및 유지보수

### Vercel Monitoring

- **Real-time Logs**: Runtime Logs에서 에러 즉시 확인
- **Performance Insights**: Web Vitals 점수 추적
- **Usage Dashboard**: 함수 실행 시간, 대역폭 사용량 확인

### Supabase Monitoring

- **Database Usage**: Storage, Bandwidth 사용량 추적
- **API Logs**: SQL 쿼리 성능 분석
- **Auth Logs**: 사용자 활동 모니터링 (Phase 2)

---

## 추가 리소스

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Documentation](https://supabase.com/docs)
- [Anthropic API Documentation](https://docs.anthropic.com)

---

## 체크리스트

배포 전 최종 확인:

- [ ] GitHub repository에 최신 코드 push 완료
- [ ] Supabase 프로젝트 생성 및 migrations 실행
- [ ] Supabase Storage buckets 생성 (4개, 모두 Public)
- [ ] Vercel 프로젝트 생성 및 GitHub 연동
- [ ] 환경 변수 4개 모두 설정
- [ ] 첫 배포 성공
- [ ] 랜딩 페이지 로딩 확인
- [ ] PSA 설문 진행 테스트
- [ ] 분석 결과 페이지 확인
- [ ] 공개 프로필 접근 확인

모든 항목이 체크되면 배포 완료입니다! 🎉

---

**문제가 발생하거나 질문이 있으시면:**
- Vercel Runtime Logs 확인
- Supabase Logs 확인
- GitHub Issues에 보고

Happy Deploying! 🚀
