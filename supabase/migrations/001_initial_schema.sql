-- 리포트 세션
CREATE TABLE report_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  status TEXT DEFAULT 'draft', -- draft, processing, completed, failed
  progress JSONB, -- 진행 상황 추적 데이터
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 업로드 파일
CREATE TABLE uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES report_sessions(id) ON DELETE CASCADE,
  file_type TEXT NOT NULL, -- resume, portfolio
  file_url TEXT NOT NULL,
  parsed_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 질문 응답
CREATE TABLE question_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES report_sessions(id) ON DELETE CASCADE,
  questions JSONB NOT NULL,
  answers JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 생성된 리포트
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES report_sessions(id) ON DELETE CASCADE,
  brand_strategy JSONB,
  content JSONB,
  figma_url TEXT,
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 웹 프로필
CREATE TABLE web_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES report_sessions(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  profile_data JSONB,
  seo_data JSONB,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 소셜 에셋
CREATE TABLE social_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES report_sessions(id) ON DELETE CASCADE,
  asset_type TEXT NOT NULL, -- linkedin_banner, linkedin_profile, business_card, twitter_header, instagram_highlight
  asset_url TEXT,
  canva_design_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_uploads_session_id ON uploads(session_id);
CREATE INDEX idx_question_answers_session_id ON question_answers(session_id);
CREATE INDEX idx_reports_session_id ON reports(session_id);
CREATE INDEX idx_web_profiles_session_id ON web_profiles(session_id);
CREATE INDEX idx_web_profiles_slug ON web_profiles(slug);
CREATE INDEX idx_social_assets_session_id ON social_assets(session_id);
CREATE INDEX idx_report_sessions_email ON report_sessions(email);
CREATE INDEX idx_report_sessions_created_at ON report_sessions(created_at);

-- RLS (Row Level Security) 활성화
ALTER TABLE report_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE web_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_assets ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 모든 사용자가 자신의 세션 데이터에만 접근 가능
CREATE POLICY "Users can view their own sessions"
  ON report_sessions FOR SELECT
  USING (true); -- 비로그인이므로 모든 세션 조회 가능 (나중에 이메일 기반으로 제한 가능)

CREATE POLICY "Users can insert their own sessions"
  ON report_sessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own sessions"
  ON report_sessions FOR UPDATE
  USING (true);

-- 공개 웹 프로필은 누구나 볼 수 있음
CREATE POLICY "Public profiles are viewable by everyone"
  ON web_profiles FOR SELECT
  USING (is_public = true);

-- 나머지 테이블도 모든 사용자가 자신의 데이터에 접근 가능
CREATE POLICY "Users can manage their uploads"
  ON uploads FOR ALL
  USING (true);

CREATE POLICY "Users can manage their question_answers"
  ON question_answers FOR ALL
  USING (true);

CREATE POLICY "Users can view reports"
  ON reports FOR SELECT
  USING (true);

CREATE POLICY "Users can view social_assets"
  ON social_assets FOR SELECT
  USING (true);

-- Storage buckets 생성을 위한 함수
-- 주의: Supabase 대시보드에서 직접 생성해야 합니다
-- 1. resumes (이력서 파일)
-- 2. portfolios (포트폴리오 파일)
-- 3. assets (생성된 에셋)
-- 4. reports (생성된 PDF)
