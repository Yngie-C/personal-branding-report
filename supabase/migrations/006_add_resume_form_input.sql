-- ==========================================
-- Resume Form Input Support
-- Migration: 006_add_resume_form_input
-- ==========================================
--
-- 이 마이그레이션은 uploads 테이블에 폼 입력 지원을 추가합니다.
-- - source: 데이터 출처 ('file' 또는 'form')
-- - form_input: 폼으로 입력된 구조화된 데이터 (JSONB)

-- uploads 테이블에 source와 form_input 컬럼 추가
ALTER TABLE uploads
ADD COLUMN source TEXT DEFAULT 'file', -- 'file' or 'form'
ADD COLUMN form_input JSONB;           -- Form으로 입력된 구조화된 데이터

-- 제약 조건: source가 'form'인 경우 form_input 필수
ALTER TABLE uploads
ADD CONSTRAINT check_form_input_when_source_form
CHECK (
  (source = 'file' AND form_input IS NULL) OR
  (source = 'form' AND form_input IS NOT NULL)
);

-- source 값 제약: 'file' 또는 'form'만 허용
ALTER TABLE uploads
ADD CONSTRAINT check_source_valid_value
CHECK (source IN ('file', 'form'));

-- 인덱스 추가 (source별 조회 성능 향상)
CREATE INDEX idx_uploads_source ON uploads(source);

-- 코멘트 추가
COMMENT ON COLUMN uploads.source IS 'Data source: file (uploaded) or form (manual input)';
COMMENT ON COLUMN uploads.form_input IS 'Structured resume data when source is form';
