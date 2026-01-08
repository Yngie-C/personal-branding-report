-- Migration: 014_strength_focused_report
-- Description: Add strength-focused sections (replaces lowScoreCategories & shadowSides)
-- Date: 2026-01-08

-- ============================================================
-- brief_reports 테이블에 새 컬럼 추가
-- ============================================================

-- 강점 활용 팁 (JSONB 배열)
-- 형식: [{ strength: string, tip: string, scenario: string }, ...]
ALTER TABLE brief_reports
ADD COLUMN IF NOT EXISTS strength_tips JSONB;

-- 브랜딩 메시지 가이드 (JSONB 객체)
-- 형식: { selfIntro: string, linkedinHeadline: string, elevatorPitch: string, hashtags: string[] }
ALTER TABLE brief_reports
ADD COLUMN IF NOT EXISTS branding_messages JSONB;

-- ============================================================
-- 기존 컬럼 deprecated 표시 (삭제하지 않음 - 하위 호환)
-- ============================================================

-- shadow_sides는 유지 (기존 데이터 호환)
COMMENT ON COLUMN brief_reports.shadow_sides IS 'DEPRECATED: Use branding_messages instead. Kept for backward compatibility.';

-- low_score_reframing도 유지 (기존 데이터 호환)
COMMENT ON COLUMN brief_reports.low_score_reframing IS 'DEPRECATED: Use strength_tips instead. Kept for backward compatibility.';

-- ============================================================
-- 인덱스 (선택적)
-- ============================================================

-- 브랜딩 메시지 해시태그로 검색할 경우를 위한 GIN 인덱스
-- CREATE INDEX IF NOT EXISTS idx_brief_reports_branding_hashtags
-- ON brief_reports USING GIN ((branding_messages -> 'hashtags'));

-- ============================================================
-- 테이블 코멘트 업데이트
-- ============================================================

COMMENT ON TABLE brief_reports IS 'Brief analysis report with strength-focused sections (v2). New sections: strength_tips, branding_messages.';
