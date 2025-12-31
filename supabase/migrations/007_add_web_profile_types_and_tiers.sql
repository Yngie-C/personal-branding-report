-- ==========================================
-- Migration: 007 - Add Web Profile Types and Report Tiers
-- Description: 무료/유료 티어 구분 및 웹 프로필 타입 추가
-- Date: 2025-12-27
-- ==========================================

BEGIN;

-- 1. web_profiles 테이블에 type 컬럼 추가
ALTER TABLE web_profiles
ADD COLUMN type TEXT NOT NULL DEFAULT 'full';

-- type 컬럼에 대한 제약 조건 추가
ALTER TABLE web_profiles
ADD CONSTRAINT valid_profile_type CHECK (type IN ('brief', 'full'));

COMMENT ON COLUMN web_profiles.type IS 'Profile type: brief (free tier, from PSA) or full (premium tier, from full report)';

-- 2. report_sessions 테이블에 tier 컬럼 추가
ALTER TABLE report_sessions
ADD COLUMN tier TEXT NOT NULL DEFAULT 'free';

-- tier 컬럼에 대한 제약 조건 추가
ALTER TABLE report_sessions
ADD CONSTRAINT valid_tier CHECK (tier IN ('free', 'premium'));

COMMENT ON COLUMN report_sessions.tier IS 'Service tier: free (brief report + web profile) or premium (PDF + social assets)';

-- 3. slug 유니크 제약 조건 재구성
-- 기존 unique constraint 제거
ALTER TABLE web_profiles DROP CONSTRAINT IF EXISTS web_profiles_slug_key;

-- 새로운 composite unique constraint 추가
-- 한 세션에서 brief와 full 프로필 모두 생성 가능
ALTER TABLE web_profiles
ADD CONSTRAINT unique_session_type UNIQUE(session_id, type);

COMMENT ON CONSTRAINT unique_session_type ON web_profiles IS 'Allows one brief and one full profile per session';

-- slug는 여전히 글로벌하게 유니크해야 함 (URL 접근용)
ALTER TABLE web_profiles
ADD CONSTRAINT unique_slug UNIQUE(slug);

-- 4. 인덱스 생성 (성능 최적화)
CREATE INDEX idx_web_profiles_type ON web_profiles(type);
CREATE INDEX idx_report_sessions_tier ON report_sessions(tier);

COMMENT ON INDEX idx_web_profiles_type IS 'Index for filtering web profiles by type (brief/full)';
COMMENT ON INDEX idx_report_sessions_tier IS 'Index for filtering report sessions by tier (free/premium)';

-- 5. 기존 데이터 백필 (이미 기본값으로 처리되지만 명시적 확인)
-- 기존 web_profiles는 모두 'full' 타입으로 설정됨 (DEFAULT 'full')
-- 기존 report_sessions는 모두 'free' 티어로 설정됨 (DEFAULT 'free')

COMMIT;

-- ==========================================
-- Rollback Script (필요시 사용)
-- ==========================================
-- BEGIN;
-- DROP INDEX IF EXISTS idx_report_sessions_tier;
-- DROP INDEX IF EXISTS idx_web_profiles_type;
-- ALTER TABLE web_profiles DROP CONSTRAINT IF EXISTS unique_slug;
-- ALTER TABLE web_profiles DROP CONSTRAINT IF EXISTS unique_session_type;
-- ALTER TABLE web_profiles DROP CONSTRAINT IF EXISTS valid_profile_type;
-- ALTER TABLE web_profiles DROP COLUMN IF EXISTS type;
-- ALTER TABLE report_sessions DROP CONSTRAINT IF EXISTS valid_tier;
-- ALTER TABLE report_sessions DROP COLUMN IF EXISTS tier;
-- ALTER TABLE web_profiles ADD CONSTRAINT web_profiles_slug_key UNIQUE(slug);
-- COMMIT;
