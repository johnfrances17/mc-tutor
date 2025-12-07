-- ===================================
-- Migration: Create Courses Table
-- Date: 2025-12-07
-- Description: Create courses reference table for standardized course codes
-- ===================================

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
  course_id SERIAL PRIMARY KEY,
  course_code VARCHAR(10) UNIQUE NOT NULL,
  course_name VARCHAR(100) NOT NULL,
  department VARCHAR(50),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial course data
INSERT INTO courses (course_code, course_name, department, description) VALUES
  ('BSA', 'BS in Accountancy', 'Business', 'Bachelor of Science in Accountancy'),
  ('BSBA', 'BS in Business Administration', 'Business', 'Bachelor of Science in Business Administration'),
  ('BSED', 'Bachelor in Secondary Education', 'Education', 'Bachelor in Secondary Education'),
  ('BSN', 'BS in Nursing', 'Health Sciences', 'Bachelor of Science in Nursing'),
  ('BSCS', 'BS in Computer Science', 'Technology', 'Bachelor of Science in Computer Science'),
  ('BSCrim', 'BS in Criminology', 'Social Sciences', 'Bachelor of Science in Criminology')
ON CONFLICT (course_code) DO NOTHING;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_courses_code ON courses(course_code);

COMMENT ON TABLE courses IS 'Reference table for academic courses offered at Mabini College';
