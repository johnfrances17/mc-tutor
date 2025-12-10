-- Migration: Create Tutor Rating System
-- Date: December 11, 2025
-- Purpose: Allow students to rate tutors once per completed session (1-5 stars)

-- Create tutor_ratings table
CREATE TABLE IF NOT EXISTS tutor_ratings (
  rating_id SERIAL PRIMARY KEY,
  session_id INTEGER NOT NULL UNIQUE, -- One rating per session
  tutor_id INTEGER NOT NULL,
  tutee_id INTEGER NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT tutor_ratings_session_fkey FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE,
  CONSTRAINT tutor_ratings_tutor_fkey FOREIGN KEY (tutor_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT tutor_ratings_tutee_fkey FOREIGN KEY (tutee_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_tutor_ratings_tutor_id ON tutor_ratings(tutor_id);
CREATE INDEX IF NOT EXISTS idx_tutor_ratings_tutee_id ON tutor_ratings(tutee_id);
CREATE INDEX IF NOT EXISTS idx_tutor_ratings_session_id ON tutor_ratings(session_id);

-- Add average_rating column to users table for tutors
ALTER TABLE users ADD COLUMN IF NOT EXISTS average_rating NUMERIC(3,2) DEFAULT 0.00;
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_ratings INTEGER DEFAULT 0;

-- Create function to update tutor average rating
CREATE OR REPLACE FUNCTION update_tutor_average_rating()
RETURNS TRIGGER AS $$
BEGIN
  -- Recalculate average rating and total ratings for the tutor
  UPDATE users
  SET 
    average_rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM tutor_ratings
      WHERE tutor_id = COALESCE(NEW.tutor_id, OLD.tutor_id)
    ),
    total_ratings = (
      SELECT COUNT(*)
      FROM tutor_ratings
      WHERE tutor_id = COALESCE(NEW.tutor_id, OLD.tutor_id)
    )
  WHERE user_id = COALESCE(NEW.tutor_id, OLD.tutor_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update average rating
DROP TRIGGER IF EXISTS trigger_update_tutor_rating ON tutor_ratings;
CREATE TRIGGER trigger_update_tutor_rating
AFTER INSERT OR UPDATE OR DELETE ON tutor_ratings
FOR EACH ROW
EXECUTE FUNCTION update_tutor_average_rating();

-- Add comments
COMMENT ON TABLE tutor_ratings IS 'Student ratings for tutors - one rating per completed session';
COMMENT ON COLUMN tutor_ratings.session_id IS 'Links to completed session - unique constraint ensures one rating per session';
COMMENT ON COLUMN tutor_ratings.rating IS 'Rating from 1 to 5 stars';
COMMENT ON COLUMN users.average_rating IS 'Calculated average rating for tutors (0.00 to 5.00)';
COMMENT ON COLUMN users.total_ratings IS 'Total number of ratings received by tutor';

-- Initialize average ratings for existing tutors
UPDATE users
SET 
  average_rating = 0.00,
  total_ratings = 0
WHERE role = 'tutor';
