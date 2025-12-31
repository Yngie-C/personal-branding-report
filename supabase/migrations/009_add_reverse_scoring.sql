-- ==========================================
-- Add reverse scoring support
-- Migration: 009_add_reverse_scoring
-- ==========================================

-- Add is_reverse_scored column
ALTER TABLE survey_questions
ADD COLUMN is_reverse_scored BOOLEAN DEFAULT false;

-- Update constraint to allow 60 questions
ALTER TABLE survey_questions
DROP CONSTRAINT IF EXISTS valid_question_number;

ALTER TABLE survey_questions
ADD CONSTRAINT valid_question_number
CHECK (question_number >= 1 AND question_number <= 60);

-- Clean all test data (user confirmed this is safe)
DELETE FROM brief_reports;
DELETE FROM survey_responses;
DELETE FROM survey_questions WHERE version = 2;
DELETE FROM report_sessions WHERE survey_completed = true;

-- Verify cleanup
SELECT 'Cleanup complete' as status;
