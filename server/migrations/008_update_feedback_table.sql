-- ===================================
-- Migration: Update Feedback Table Schema
-- Date: 2025-12-07
-- Description: Add detailed ratings and constraints
-- ===================================

-- Step 1: Add detailed rating columns
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS knowledge_rating INTEGER;
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS communication_rating INTEGER;
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS punctuality_rating INTEGER;

-- Step 2: Add rating constraints
ALTER TABLE feedback 
  DROP CONSTRAINT IF EXISTS check_rating_range;

ALTER TABLE feedback 
  ADD CONSTRAINT check_rating_range 
  CHECK (rating BETWEEN 1 AND 5);

ALTER TABLE feedback 
  DROP CONSTRAINT IF EXISTS check_knowledge_rating;

ALTER TABLE feedback 
  ADD CONSTRAINT check_knowledge_rating 
  CHECK (knowledge_rating BETWEEN 1 AND 5 OR knowledge_rating IS NULL);

ALTER TABLE feedback 
  DROP CONSTRAINT IF EXISTS check_communication_rating;

ALTER TABLE feedback 
  ADD CONSTRAINT check_communication_rating 
  CHECK (communication_rating BETWEEN 1 AND 5 OR communication_rating IS NULL);

ALTER TABLE feedback 
  DROP CONSTRAINT IF EXISTS check_punctuality_rating;

ALTER TABLE feedback 
  ADD CONSTRAINT check_punctuality_rating 
  CHECK (punctuality_rating BETWEEN 1 AND 5 OR punctuality_rating IS NULL);

-- Step 3: Add unique constraint (one feedback per session)
ALTER TABLE feedback 
  DROP CONSTRAINT IF EXISTS unique_session_feedback;

ALTER TABLE feedback 
  ADD CONSTRAINT unique_session_feedback 
  UNIQUE(session_id);

-- Step 4: Create indexes
CREATE INDEX IF NOT EXISTS idx_feedback_session ON feedback(session_id);
CREATE INDEX IF NOT EXISTS idx_feedback_tutee ON feedback(tutee_id);
CREATE INDEX IF NOT EXISTS idx_feedback_tutor ON feedback(tutor_id);
CREATE INDEX IF NOT EXISTS idx_feedback_rating ON feedback(rating);

COMMENT ON COLUMN feedback.rating IS 'Overall rating (1-5 stars)';
COMMENT ON COLUMN feedback.knowledge_rating IS 'Subject knowledge rating (1-5)';
COMMENT ON COLUMN feedback.communication_rating IS 'Communication skills rating (1-5)';
COMMENT ON COLUMN feedback.punctuality_rating IS 'Punctuality rating (1-5)';
