-- ==========================================
-- Migration 008: Add Soul Questions Support
-- ==========================================
-- Description: Add support for Soul Questions, reframing data, and question metadata
-- Date: 2025-12-28
-- ==========================================

-- 1. Add metadata column to question_answers table
-- Stores: totalQuestions, structure ('soul-expertise-edge' or 'fallback'), completedAt, categories
ALTER TABLE question_answers
ADD COLUMN IF NOT EXISTS metadata JSONB;

-- 2. Add low_score_reframing column to brief_reports table
-- Stores: lowScoreCategories with reframedLabel and reframedDescription
ALTER TABLE brief_reports
ADD COLUMN IF NOT EXISTS low_score_reframing JSONB;

-- 3. Add selected_soul_questions column to brief_reports table
-- Stores: Array of Soul Question IDs that were selected for this user
ALTER TABLE brief_reports
ADD COLUMN IF NOT EXISTS selected_soul_questions TEXT[];

-- 4. Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_question_answers_metadata
ON question_answers USING GIN (metadata);

CREATE INDEX IF NOT EXISTS idx_brief_reports_low_score_reframing
ON brief_reports USING GIN (low_score_reframing);

CREATE INDEX IF NOT EXISTS idx_brief_reports_selected_soul_questions
ON brief_reports USING GIN (selected_soul_questions);

-- 5. Add column comments for documentation
COMMENT ON COLUMN question_answers.metadata IS
'질문 구조 메타데이터: totalQuestions (총 질문 수), structure (soul-expertise-edge | fallback), completedAt (완료 시간), categories (카테고리 배열)';

COMMENT ON COLUMN brief_reports.low_score_reframing IS
'낮은 점수 카테고리 리프레이밍 정보: category, reframedLabel (긍정적 라벨), reframedDescription (긍정적 설명)';

COMMENT ON COLUMN brief_reports.selected_soul_questions IS
'선택된 Soul Question ID 배열 (3개): PSA 분석 기반 매칭된 철학 질문들';

-- 6. Verify migration success
DO $$
BEGIN
  -- Check if columns were added successfully
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'question_answers' AND column_name = 'metadata'
  ) THEN
    RAISE EXCEPTION 'Failed to add metadata column to question_answers';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'brief_reports' AND column_name = 'low_score_reframing'
  ) THEN
    RAISE EXCEPTION 'Failed to add low_score_reframing column to brief_reports';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'brief_reports' AND column_name = 'selected_soul_questions'
  ) THEN
    RAISE EXCEPTION 'Failed to add selected_soul_questions column to brief_reports';
  END IF;

  RAISE NOTICE 'Migration 008 completed successfully';
END $$;
