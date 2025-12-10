-- Add location fields to sessions table
-- This stores the physical location and Google Meet link for each session

ALTER TABLE sessions 
ADD COLUMN IF NOT EXISTS physical_location VARCHAR(255),
ADD COLUMN IF NOT EXISTS google_meet_link VARCHAR(500);

-- Add comments for documentation
COMMENT ON COLUMN sessions.physical_location IS 'Physical meeting location for in-person sessions';
COMMENT ON COLUMN sessions.google_meet_link IS 'Google Meet link for online sessions (from tutor_subjects)';

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_sessions_physical_location ON sessions(physical_location);

SELECT 'Sessions location fields added successfully!' AS status;
