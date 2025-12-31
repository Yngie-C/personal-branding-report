-- ==========================================
-- PSA Survey System Tables
-- Migration: 004_add_survey_system
-- ==========================================

-- Survey Questions (Fixed 100 questions)
CREATE TABLE survey_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_number INTEGER NOT NULL, -- 1 to 100
  category TEXT NOT NULL, -- innovation, execution, influence, collaboration, resilience
  question_text TEXT NOT NULL,
  question_hint TEXT,
  version INTEGER DEFAULT 1, -- For future versioning
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_question_number_version UNIQUE(question_number, version),
  CONSTRAINT valid_category CHECK (category IN ('innovation', 'execution', 'influence', 'collaboration', 'resilience')),
  CONSTRAINT valid_question_number CHECK (question_number >= 1 AND question_number <= 100)
);

-- Survey Responses (User answers)
CREATE TABLE survey_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES report_sessions(id) ON DELETE CASCADE,
  question_id UUID REFERENCES survey_questions(id),
  question_number INTEGER NOT NULL,
  category TEXT NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 7), -- 7-point Likert scale
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_session_question UNIQUE(session_id, question_id),
  CONSTRAINT valid_score CHECK (score >= 1 AND score <= 7)
);

-- Brief Reports (Summary after survey)
CREATE TABLE brief_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES report_sessions(id) ON DELETE CASCADE,

  -- Persona data
  persona_type TEXT NOT NULL,
  persona_title TEXT NOT NULL,
  persona_tagline TEXT NOT NULL,

  -- Category scores (normalized 0-100)
  scores JSONB NOT NULL, -- { byCategory: [...] }

  -- Top strengths
  top_categories TEXT[] NOT NULL,

  -- Analysis output
  strengths_summary TEXT NOT NULL,
  shadow_sides TEXT,
  branding_keywords TEXT[] NOT NULL,

  -- Radar chart data
  radar_data JSONB NOT NULL, -- For visualization

  -- Metadata
  total_score DECIMAL(5,2),
  completion_time_seconds INTEGER,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_session_brief UNIQUE(session_id),
  CONSTRAINT valid_total_score CHECK (total_score >= 0 AND total_score <= 100)
);

-- Modify report_sessions to track survey completion
ALTER TABLE report_sessions
ADD COLUMN survey_completed BOOLEAN DEFAULT false,
ADD COLUMN brief_report_generated BOOLEAN DEFAULT false;

-- Indexes for performance
CREATE INDEX idx_survey_questions_category ON survey_questions(category);
CREATE INDEX idx_survey_questions_version ON survey_questions(version, is_active);
CREATE INDEX idx_survey_questions_number ON survey_questions(question_number);

CREATE INDEX idx_survey_responses_session_id ON survey_responses(session_id);
CREATE INDEX idx_survey_responses_category ON survey_responses(category);
CREATE INDEX idx_survey_responses_question_id ON survey_responses(question_id);

CREATE INDEX idx_brief_reports_session_id ON brief_reports(session_id);
CREATE INDEX idx_brief_reports_persona_type ON brief_reports(persona_type);

-- RLS Policies
ALTER TABLE survey_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE brief_reports ENABLE ROW LEVEL SECURITY;

-- Survey questions are viewable by everyone (public read)
CREATE POLICY "Survey questions are viewable by everyone"
  ON survey_questions FOR SELECT
  USING (is_active = true);

-- Users can manage their survey responses
CREATE POLICY "Users can insert their survey responses"
  ON survey_responses FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view their survey responses"
  ON survey_responses FOR SELECT
  USING (true);

CREATE POLICY "Users can update their survey responses"
  ON survey_responses FOR UPDATE
  USING (true);

-- Users can view their brief reports
CREATE POLICY "Users can view their brief reports"
  ON brief_reports FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their brief reports"
  ON brief_reports FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their brief reports"
  ON brief_reports FOR UPDATE
  USING (true);

-- Comments for documentation
COMMENT ON TABLE survey_questions IS 'Fixed 100 survey questions (PSA: Professional Strength Assessment)';
COMMENT ON TABLE survey_responses IS 'User responses to survey questions (1-7 Likert scale)';
COMMENT ON TABLE brief_reports IS 'Brief analysis report generated after survey completion';
COMMENT ON COLUMN report_sessions.survey_completed IS 'Whether user has completed the 100-question PSA survey';
COMMENT ON COLUMN report_sessions.brief_report_generated IS 'Whether brief analysis report has been generated';
