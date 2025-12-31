-- Add UNIQUE constraint on web_profiles.slug
-- This prevents duplicate slugs at the database level

-- Add UNIQUE constraint
ALTER TABLE web_profiles
ADD CONSTRAINT web_profiles_slug_key UNIQUE (slug);

-- Create index for performance (if not already created by UNIQUE constraint)
CREATE INDEX IF NOT EXISTS idx_web_profiles_slug ON web_profiles(slug);

-- Add helpful comment
COMMENT ON CONSTRAINT web_profiles_slug_key ON web_profiles
IS 'Ensures each web profile has a unique slug for URL routing';
