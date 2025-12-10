-- Add location preferences to tutor_subjects table
-- This allows tutors to specify their preferred teaching location for each subject

ALTER TABLE tutor_subjects 
ADD COLUMN IF NOT EXISTS preferred_location VARCHAR(100) DEFAULT 'online' CHECK (preferred_location IN ('online', 'physical', 'both')),
ADD COLUMN IF NOT EXISTS physical_location VARCHAR(255),
ADD COLUMN IF NOT EXISTS google_meet_link VARCHAR(500),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Create an index for faster filtering by location preference
CREATE INDEX IF NOT EXISTS idx_tutor_subjects_location ON tutor_subjects(preferred_location);

-- Add comment for documentation
COMMENT ON COLUMN tutor_subjects.preferred_location IS 'Tutor preference: online (Google Meet), physical (in-person), or both';
COMMENT ON COLUMN tutor_subjects.physical_location IS 'Physical meeting location if preferred_location is physical or both';
COMMENT ON COLUMN tutor_subjects.google_meet_link IS 'Auto-generated non-expiry Google Meet link for online sessions';
