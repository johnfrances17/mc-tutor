-- Add location preferences to tutor_subjects table
-- This allows tutors to specify their teaching locations (both physical and online)
-- Google Meet links are auto-generated for all subjects

ALTER TABLE tutor_subjects 
ADD COLUMN IF NOT EXISTS preferred_location VARCHAR(100) DEFAULT 'both' CHECK (preferred_location IN ('online', 'physical', 'both')),
ADD COLUMN IF NOT EXISTS physical_location VARCHAR(255),
ADD COLUMN IF NOT EXISTS google_meet_link VARCHAR(500),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Create an index for faster filtering by location preference
CREATE INDEX IF NOT EXISTS idx_tutor_subjects_location ON tutor_subjects(preferred_location);

-- Add comment for documentation
COMMENT ON COLUMN tutor_subjects.preferred_location IS 'Location options: both (default), online, or physical - always set to both for flexibility';
COMMENT ON COLUMN tutor_subjects.physical_location IS 'Physical meeting location (required) - where tutor meets students in person';
COMMENT ON COLUMN tutor_subjects.google_meet_link IS 'Auto-generated non-expiry Google Meet link for online sessions (always generated)';

-- Update existing records to have 'both' as default if they don't have location data
UPDATE tutor_subjects 
SET preferred_location = 'both' 
WHERE preferred_location IS NULL OR preferred_location = '';

SELECT 'Location preferences migration completed successfully!' AS status;
