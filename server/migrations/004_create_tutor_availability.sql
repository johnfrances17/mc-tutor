-- ===================================
-- Migration: Create Tutor Availability Table
-- Date: 2025-12-07
-- Description: Track tutor availability schedule
-- ===================================

CREATE TABLE IF NOT EXISTS tutor_availability (
  availability_id SERIAL PRIMARY KEY,
  tutor_id INTEGER NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_tutor_availability_user 
    FOREIGN KEY (tutor_id) 
    REFERENCES users(user_id) 
    ON DELETE CASCADE,
  
  CONSTRAINT check_valid_time_range 
    CHECK (end_time > start_time),
  
  CONSTRAINT unique_tutor_schedule 
    UNIQUE(tutor_id, day_of_week, start_time)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tutor_availability_tutor ON tutor_availability(tutor_id);
CREATE INDEX IF NOT EXISTS idx_tutor_availability_day ON tutor_availability(day_of_week);
CREATE INDEX IF NOT EXISTS idx_tutor_availability_active ON tutor_availability(is_available);

COMMENT ON TABLE tutor_availability IS 'Weekly availability schedule for tutors';
COMMENT ON COLUMN tutor_availability.day_of_week IS '0=Sunday, 1=Monday, ..., 6=Saturday';
