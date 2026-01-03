-- ==========================================
-- Migration: 013 - Add Waitlist Table
-- Description: MVP 대기자 명단 관리
-- Date: 2026-01-01
-- ==========================================

BEGIN;

-- Waitlist table
CREATE TABLE waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES report_sessions(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  phone TEXT, -- Optional phone number
  position INTEGER, -- Auto-incremented position in queue
  status TEXT DEFAULT 'active', -- active, notified, converted
  utm_source TEXT, -- Optional: tracking parameter for marketing
  utm_campaign TEXT, -- Optional: tracking parameter for marketing
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_email UNIQUE(email),
  CONSTRAINT unique_session UNIQUE(session_id),
  CONSTRAINT valid_status CHECK (status IN ('active', 'notified', 'converted'))
);

-- Indexes for performance
CREATE INDEX idx_waitlist_email ON waitlist(email);
CREATE INDEX idx_waitlist_session_id ON waitlist(session_id);
CREATE INDEX idx_waitlist_status ON waitlist(status);
CREATE INDEX idx_waitlist_position ON waitlist(position);
CREATE INDEX idx_waitlist_created_at ON waitlist(created_at);

-- RLS Policies
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Users can view their own waitlist entry
CREATE POLICY "Users can view their waitlist entry"
  ON waitlist FOR SELECT
  USING (true);

-- Users can insert their waitlist entry
CREATE POLICY "Users can insert their waitlist entry"
  ON waitlist FOR INSERT
  WITH CHECK (true);

-- Users can update their waitlist entry
CREATE POLICY "Users can update their waitlist entry"
  ON waitlist FOR UPDATE
  USING (true);

-- Function to auto-assign position
CREATE OR REPLACE FUNCTION assign_waitlist_position()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.position IS NULL THEN
    NEW.position := (SELECT COALESCE(MAX(position), 0) + 1 FROM waitlist);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-assign position on insert
CREATE TRIGGER trigger_assign_waitlist_position
  BEFORE INSERT ON waitlist
  FOR EACH ROW
  EXECUTE FUNCTION assign_waitlist_position();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_waitlist_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on row update
CREATE TRIGGER trigger_update_waitlist_timestamp
  BEFORE UPDATE ON waitlist
  FOR EACH ROW
  EXECUTE FUNCTION update_waitlist_updated_at();

-- Comments for documentation
COMMENT ON TABLE waitlist IS 'MVP waitlist for users who completed PSA survey';
COMMENT ON COLUMN waitlist.position IS 'Auto-incremented queue position (1, 2, 3, ...)';
COMMENT ON COLUMN waitlist.status IS 'Waitlist status: active (waiting), notified (invited), converted (upgraded to premium)';
COMMENT ON COLUMN waitlist.email IS 'User email (unique across waitlist, required)';
COMMENT ON COLUMN waitlist.phone IS 'User phone number (optional)';
COMMENT ON COLUMN waitlist.session_id IS 'Foreign key to report_sessions (one waitlist entry per session)';

COMMIT;
