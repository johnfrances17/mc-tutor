-- ===================================
-- Migration: Update Sessions Table Schema
-- Date: 2025-12-07
-- Description: Improve session workflow with proper statuses and time types
-- ===================================

-- Step 1: Add new columns
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 60;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS meeting_link VARCHAR(255);
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS tutee_notes TEXT;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS tutor_notes TEXT;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP;

-- Step 2: Convert session_time from VARCHAR to TIME
-- First, add new column
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS session_time_new TIME;

-- Migrate data (handle common formats)
UPDATE sessions SET session_time_new = (
  CASE 
    WHEN session_time ~ '^[0-9]{1,2}:[0-9]{2}(:[0-9]{2})?$' THEN session_time::TIME
    WHEN session_time ~ '^[0-9]{1,2}:[0-9]{2} (AM|PM)$' THEN 
      TO_TIMESTAMP(session_time, 'HH12:MI AM')::TIME
    ELSE '00:00:00'::TIME
  END
)
WHERE session_time IS NOT NULL;

-- Drop old column and rename
ALTER TABLE sessions DROP COLUMN IF EXISTS session_time;
ALTER TABLE sessions RENAME COLUMN session_time_new TO session_time;

-- Step 3: Update status column with new workflow states
ALTER TABLE sessions 
  DROP CONSTRAINT IF EXISTS check_session_status;

ALTER TABLE sessions 
  ADD CONSTRAINT check_session_status 
  CHECK (status IN ('pending', 'approved', 'rejected', 'confirmed', 'completed', 'cancelled'));

-- Step 4: Update session_type constraint
ALTER TABLE sessions 
  DROP CONSTRAINT IF EXISTS check_session_type;

ALTER TABLE sessions 
  ADD CONSTRAINT check_session_type 
  CHECK (session_type IN ('online', 'face-to-face'));

-- Step 5: Add business logic constraints
ALTER TABLE sessions 
  DROP CONSTRAINT IF EXISTS check_different_users;

ALTER TABLE sessions 
  ADD CONSTRAINT check_different_users 
  CHECK (tutee_id != tutor_id);

-- Step 6: Rename 'notes' to maintain backward compatibility
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sessions' AND column_name = 'notes') THEN
    ALTER TABLE sessions RENAME COLUMN notes TO tutee_notes;
  END IF;
END $$;

-- Step 7: Create indexes
CREATE INDEX IF NOT EXISTS idx_sessions_tutee ON sessions(tutee_id);
CREATE INDEX IF NOT EXISTS idx_sessions_tutor ON sessions(tutor_id);
CREATE INDEX IF NOT EXISTS idx_sessions_subject ON sessions(subject_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(session_date);

COMMENT ON COLUMN sessions.session_time IS 'Start time of the tutoring session';
COMMENT ON COLUMN sessions.duration_minutes IS 'Duration of session in minutes';
COMMENT ON COLUMN sessions.status IS 'Workflow: pending→approved→confirmed→completed or cancelled/rejected';
