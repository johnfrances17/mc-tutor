-- Migration: Clean up meet.google.com/new links
-- Date: December 11, 2025
-- Purpose: Remove auto-generated /new links and set to null so tutors can set real permanent links

-- Update tutor_subjects table - set /new links to null
UPDATE tutor_subjects 
SET google_meet_link = NULL,
    updated_at = CURRENT_TIMESTAMP
WHERE google_meet_link = 'https://meet.google.com/new';

-- Update sessions table - set /new links to null  
UPDATE sessions
SET google_meet_link = NULL,
    updated_at = CURRENT_TIMESTAMP
WHERE google_meet_link = 'https://meet.google.com/new';

-- Add comments
COMMENT ON COLUMN tutor_subjects.google_meet_link IS 'Real Google Meet link (format: https://meet.google.com/xxx-yyyy-zzz) set by tutor after creating their room. Null until tutor sets it.';
COMMENT ON COLUMN sessions.google_meet_link IS 'Google Meet link inherited from tutor_subjects. Null if tutor has not set up their meeting room yet.';
