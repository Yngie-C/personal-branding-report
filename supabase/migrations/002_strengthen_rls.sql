-- 002_strengthen_rls.sql
-- RLS (Row Level Security) 정책 강화
--
-- 주의: 현재 애플리케이션은 이메일 기반 세션을 사용하며,
-- 인증 시스템(JWT)이 없습니다. 따라서 이 마이그레이션은
-- 향후 인증 시스템 도입 시 적용하기 위한 준비용입니다.
--
-- 현재는 서버 측 Service Role Key로만 데이터베이스에 접근하므로
-- RLS 정책이 우회됩니다. 클라이언트 측에서 직접 접근하는 경우에만
-- RLS가 적용됩니다.

-- ============================================================
-- 향후 인증 시스템 도입 시 적용할 RLS 정책 (현재는 주석 처리)
-- ============================================================

/*
-- report_sessions: 이메일 기반 필터링
DROP POLICY IF EXISTS "Enable all for service role" ON report_sessions;
DROP POLICY IF EXISTS "Enable read access for all users" ON report_sessions;
DROP POLICY IF EXISTS "Enable insert for all users" ON report_sessions;
DROP POLICY IF EXISTS "Enable update for users based on email" ON report_sessions;

CREATE POLICY "Users can only access their own sessions"
ON report_sessions FOR ALL
USING (
  auth.jwt() ->> 'email' = email
);

-- uploads: session_id 기반 필터링
DROP POLICY IF EXISTS "Enable all for service role" ON uploads;
DROP POLICY IF EXISTS "Enable read access for all users" ON uploads;
DROP POLICY IF EXISTS "Enable insert for all users" ON uploads;

CREATE POLICY "Users can only access their own uploads"
ON uploads FOR ALL
USING (
  session_id IN (
    SELECT id FROM report_sessions
    WHERE email = auth.jwt() ->> 'email'
  )
);

-- question_answers: session_id 기반 필터링
DROP POLICY IF EXISTS "Enable all for service role" ON question_answers;
DROP POLICY IF EXISTS "Enable read access for all users" ON question_answers;
DROP POLICY IF EXISTS "Enable insert for all users" ON question_answers;
DROP POLICY IF EXISTS "Enable update for all users" ON question_answers;

CREATE POLICY "Users can only access their own answers"
ON question_answers FOR ALL
USING (
  session_id IN (
    SELECT id FROM report_sessions
    WHERE email = auth.jwt() ->> 'email'
  )
);

-- reports: session_id 기반 필터링
DROP POLICY IF EXISTS "Enable all for service role" ON reports;
DROP POLICY IF EXISTS "Enable read access for all users" ON reports;
DROP POLICY IF EXISTS "Enable insert for all users" ON reports;

CREATE POLICY "Users can only access their own reports"
ON reports FOR ALL
USING (
  session_id IN (
    SELECT id FROM report_sessions
    WHERE email = auth.jwt() ->> 'email'
  )
);

-- web_profiles: 공개 프로필은 모두 읽기 가능, 수정은 소유자만
DROP POLICY IF EXISTS "Enable all for service role" ON web_profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON web_profiles;
DROP POLICY IF EXISTS "Enable insert for all users" ON web_profiles;

CREATE POLICY "Public profiles are viewable by everyone"
ON web_profiles FOR SELECT
USING (is_public = true);

CREATE POLICY "Users can manage their own profiles"
ON web_profiles FOR ALL
USING (
  session_id IN (
    SELECT id FROM report_sessions
    WHERE email = auth.jwt() ->> 'email'
  )
);

-- social_assets: session_id 기반 필터링
DROP POLICY IF EXISTS "Enable all for service role" ON social_assets;
DROP POLICY IF EXISTS "Enable read access for all users" ON social_assets;
DROP POLICY IF EXISTS "Enable insert for all users" ON social_assets;

CREATE POLICY "Users can only access their own assets"
ON social_assets FOR ALL
USING (
  session_id IN (
    SELECT id FROM report_sessions
    WHERE email = auth.jwt() ->> 'email'
  )
);
*/

-- ============================================================
-- 현재 적용할 개선 사항
-- ============================================================

-- 1. 스토리지 버킷 공개 정책 확인 (이미 생성되어 있음)
-- resumes, portfolios, assets, reports 버킷은 모두 public 설정

-- 2. 테이블 코멘트 추가 (문서화)
COMMENT ON TABLE report_sessions IS '사용자 세션 관리 테이블. 이메일 기반으로 세션을 식별합니다.';
COMMENT ON TABLE uploads IS '업로드된 파일 정보 저장. parsed_data에 추출된 텍스트가 저장됩니다.';
COMMENT ON TABLE question_answers IS '사용자 질문 답변 저장. AI가 생성한 질문과 사용자 답변을 저장합니다.';
COMMENT ON TABLE reports IS '생성된 퍼스널 브랜딩 리포트 저장.';
COMMENT ON TABLE web_profiles IS '공개 웹 프로필. slug로 접근 가능하며 is_public 플래그로 공개 여부 제어.';
COMMENT ON TABLE social_assets IS '생성된 소셜 미디어 에셋 (LinkedIn, Twitter 등).';

-- 3. 인덱스 최적화 (성능 개선)
-- slug 검색 최적화 (이미 UNIQUE 제약 조건으로 인덱스 존재)
-- session_id 외래 키 인덱스 (이미 존재)

-- 추가 인덱스: 이메일로 세션 검색 최적화
CREATE INDEX IF NOT EXISTS idx_report_sessions_email
ON report_sessions(email);

-- 추가 인덱스: 상태별 세션 검색 최적화
CREATE INDEX IF NOT EXISTS idx_report_sessions_status
ON report_sessions(status);

-- 추가 인덱스: 공개 프로필 검색 최적화
CREATE INDEX IF NOT EXISTS idx_web_profiles_is_public
ON web_profiles(is_public)
WHERE is_public = true;

-- 4. 세션 자동 정리를 위한 함수 (선택사항)
-- 7일 이상 된 실패 세션 자동 정리
CREATE OR REPLACE FUNCTION cleanup_old_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM report_sessions
  WHERE status = 'failed'
    AND updated_at < NOW() - INTERVAL '7 days';
END;
$$;

COMMENT ON FUNCTION cleanup_old_sessions() IS '7일 이상 된 실패 세션을 자동으로 정리합니다.';

-- ============================================================
-- 향후 개선 사항 (TODO)
-- ============================================================

-- TODO: 인증 시스템 도입 시
-- 1. Supabase Auth 설정
-- 2. 이메일 기반 세션을 user_id 기반으로 마이그레이션
-- 3. 위의 주석 처리된 RLS 정책 적용
-- 4. Service Role Key 사용을 최소화하고 Anon Key + RLS 사용
