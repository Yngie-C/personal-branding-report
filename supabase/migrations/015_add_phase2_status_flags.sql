-- Migration: Add Phase 2 status flags to report_sessions
-- Purpose: Track upload and questions completion status for Phase 2 flow validation

-- Add Phase 2 progress flags
ALTER TABLE report_sessions
ADD COLUMN IF NOT EXISTS upload_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS questions_completed BOOLEAN DEFAULT false;

-- Add indexes for query performance
CREATE INDEX IF NOT EXISTS idx_report_sessions_upload_completed
ON report_sessions(upload_completed);

CREATE INDEX IF NOT EXISTS idx_report_sessions_questions_completed
ON report_sessions(questions_completed);

-- Comments for documentation
COMMENT ON COLUMN report_sessions.upload_completed IS 'Whether user has uploaded resume/portfolio or submitted form for Phase 2';
COMMENT ON COLUMN report_sessions.questions_completed IS 'Whether user has completed enhanced questionnaire (9 questions) for Phase 2';
