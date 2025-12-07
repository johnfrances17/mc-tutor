-- ===================================
-- Migration: Create Tutor Stats Table
-- Date: 2025-12-07
-- Description: Aggregated statistics for tutor performance
-- ===================================

CREATE TABLE IF NOT EXISTS tutor_stats (
  tutor_id INTEGER PRIMARY KEY,
  total_sessions INTEGER DEFAULT 0,
  completed_sessions INTEGER DEFAULT 0,
  cancelled_sessions INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0.00,
  total_ratings INTEGER DEFAULT 0,
  subjects_taught INTEGER DEFAULT 0,
  last_session_date DATE,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_tutor_stats_user 
    FOREIGN KEY (tutor_id) 
    REFERENCES users(user_id) 
    ON DELETE CASCADE,
  
  CONSTRAINT check_rating_range 
    CHECK (average_rating BETWEEN 0 AND 5)
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_tutor_stats_rating ON tutor_stats(average_rating);

-- Initialize stats for existing tutors
INSERT INTO tutor_stats (tutor_id)
SELECT user_id 
FROM users 
WHERE role = 'tutor'
ON CONFLICT (tutor_id) DO NOTHING;

COMMENT ON TABLE tutor_stats IS 'Aggregated performance statistics for tutors';
