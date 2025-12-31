-- Migration: Make email nullable in report_sessions table
-- Purpose: Allow users to complete survey and view brief report before providing email
-- Date: 2025-12-30

-- Make email column nullable
ALTER TABLE report_sessions
ALTER COLUMN email DROP NOT NULL;

-- Add index for performance on null email lookups (for cleanup queries)
CREATE INDEX idx_report_sessions_null_email ON report_sessions(created_at)
WHERE email IS NULL;

-- Add cleanup function for abandoned sessions (no email after 24 hours)
CREATE OR REPLACE FUNCTION cleanup_abandoned_sessions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM report_sessions
  WHERE email IS NULL
  AND created_at < NOW() - INTERVAL '24 hours';

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Add comment to cleanup function
COMMENT ON FUNCTION cleanup_abandoned_sessions() IS
'Cleanup sessions created without email after 24 hours. Run daily via cron or scheduled job.';
