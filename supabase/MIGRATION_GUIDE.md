# 🗄️ Supabase 마이그레이션 가이드

이 가이드는 PSA 설문 시스템을 포함한 전체 데이터베이스 스키마를 Supabase에 설정하는 방법을 안내합니다.

## 📋 사전 준비

1. **Supabase 프로젝트 생성**
   - https://supabase.com/dashboard 접속
   - 새 프로젝트 생성 또는 기존 프로젝트 선택
   - 프로젝트 URL과 API 키 확인

2. **환경 변수 설정**
   ```bash
   # .env.local.example을 .env.local로 복사
   cp .env.local.example .env.local

   # .env.local 파일 편집
   # Supabase Dashboard > Settings > API에서 정보 복사
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_SUPABASE_PUBLISHABLE_KEY=your_publishable_key_here
   NEXT_SUPABASE_SECRET_KEY=your_secret_key_here
   ```

## 🚀 마이그레이션 실행

### 방법 1: Supabase Dashboard (추천)

**단계별 실행:**

1. **Supabase Dashboard 접속**
   - 프로젝트 선택
   - 좌측 메뉴에서 `SQL Editor` 클릭
   - 또는 직접 접속: https://app.supabase.com/project/_/sql

2. **마이그레이션 파일 순서대로 실행**

   아래 순서대로 각 파일의 내용을 복사하여 SQL Editor에 붙여넣고 `Run` 버튼 클릭:

   ```
   ✅ Step 1: migrations/001_initial_schema.sql
   ✅ Step 2: migrations/002_strengthen_rls.sql
   ✅ Step 3: migrations/003_add_unique_constraints.sql
   ✅ Step 4: migrations/004_add_survey_system.sql (PSA 설문)
   ✅ Step 5: migrations/005_seed_survey_questions.sql (100개 질문 데이터)
   ```

3. **실행 확인**
   - 좌측 메뉴 `Database` → `Tables` 클릭
   - 다음 테이블들이 생성되었는지 확인:
     - `report_sessions`
     - `uploads`
     - `question_answers`
     - `survey_questions` ⭐️ NEW
     - `survey_responses` ⭐️ NEW
     - `brief_reports` ⭐️ NEW
     - `reports`
     - `web_profiles`
     - `social_assets`

4. **survey_questions 테이블 데이터 확인**
   ```sql
   SELECT COUNT(*) FROM survey_questions;
   -- 결과: 100 (5개 카테고리 × 20문항)
   ```

### 방법 2: psql CLI (선택사항)

Supabase CLI가 설치되어 있다면:

```bash
# 프로젝트 루트에서
cd supabase/migrations

# 각 파일 순서대로 실행
psql "$DATABASE_URL" -f 001_initial_schema.sql
psql "$DATABASE_URL" -f 002_strengthen_rls.sql
psql "$DATABASE_URL" -f 003_add_unique_constraints.sql
psql "$DATABASE_URL" -f 004_add_survey_system.sql
psql "$DATABASE_URL" -f 005_seed_survey_questions.sql
```

## 🪣 Storage 버킷 생성

마이그레이션 후 Storage 버킷을 수동으로 생성해야 합니다:

1. **Supabase Dashboard → Storage**
2. **New bucket** 클릭하여 다음 4개 버킷 생성:
   - `resumes` (public: true)
   - `portfolios` (public: true)
   - `assets` (public: true)
   - `reports` (public: true)

3. **Public 설정 확인**
   - 각 버킷 설정에서 "Public bucket" 체크
   - 또는 SQL로 일괄 설정:
   ```sql
   UPDATE storage.buckets
   SET public = true
   WHERE name IN ('resumes', 'portfolios', 'assets', 'reports');
   ```

## ✅ 검증

모든 설정이 완료되었는지 확인:

```sql
-- 1. 테이블 개수 확인 (9개 있어야 함)
SELECT COUNT(*) FROM information_schema.tables
WHERE table_schema = 'public';

-- 2. PSA 설문 질문 개수 확인 (100개)
SELECT category, COUNT(*)
FROM survey_questions
GROUP BY category
ORDER BY category;

-- 3. Storage 버킷 확인 (4개)
SELECT name, public FROM storage.buckets;

-- 4. RLS 정책 확인
SELECT tablename, policyname
FROM pg_policies
WHERE schemaname = 'public';
```

**기대 결과:**
- ✅ 테이블: 9개
- ✅ survey_questions: 각 카테고리별 20개씩 총 100개
- ✅ Storage 버킷: 4개 (모두 public)
- ✅ RLS 정책: 여러 개 설정됨

## 🐛 트러블슈팅

### 오류: "relation already exists"
```sql
-- 기존 테이블 확인
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- 필요시 테이블 삭제 후 재실행 (주의: 데이터 손실)
DROP TABLE IF EXISTS survey_responses CASCADE;
DROP TABLE IF EXISTS survey_questions CASCADE;
DROP TABLE IF EXISTS brief_reports CASCADE;
```

### 오류: "permission denied"
- Supabase Dashboard의 SQL Editor를 사용하세요 (자동으로 admin 권한)
- 또는 `NEXT_SUPABASE_SECRET_KEY`를 사용하는지 확인

### survey_questions가 비어있음
```sql
-- 005_seed_survey_questions.sql을 다시 실행
-- 또는 수동으로 데이터 확인:
SELECT * FROM survey_questions LIMIT 5;
```

## 📊 데이터베이스 구조

### Core Tables (기존)
- `report_sessions` - 사용자 세션
- `uploads` - 파일 업로드
- `question_answers` - 맞춤형 질문 응답
- `reports` - 최종 리포트
- `web_profiles` - 웹 프로필
- `social_assets` - 소셜 에셋

### PSA Survey Tables (신규) ⭐️
- `survey_questions` - 고정형 100개 질문
- `survey_responses` - 사용자 응답 (1-7 점수)
- `brief_reports` - 약식 분석 결과 (페르소나, 강점 등)

## 🎯 다음 단계

마이그레이션 완료 후:

1. ✅ 개발 서버 실행
   ```bash
   npm run dev
   ```

2. ✅ 테스트 플로우
   - http://localhost:3000/start
   - 이메일 입력 → 파일 업로드 → PSA 설문 → 결과 확인

3. ✅ 데모 파일 사용
   - `demo/resume_sample.docx`
   - `demo/portfolio_sample.docx`

---

**문의사항이 있으면 CLAUDE.md를 참고하거나 이슈를 등록해주세요!** 🚀
