-- ===================================
-- CREATE MATERIALS TABLE (if not exists)
-- ===================================
-- This table stores metadata for study materials uploaded by tutors
-- The actual files are stored in Supabase Storage "materials" bucket
-- ===================================

CREATE TABLE IF NOT EXISTS materials (
    material_id SERIAL PRIMARY KEY,
    tutor_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    subject_id INTEGER NOT NULL REFERENCES subjects(subject_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    filename VARCHAR(255) NOT NULL,
    file_size BIGINT,
    file_type VARCHAR(100),
    category VARCHAR(50) CHECK (category IN ('lecture', 'assignment', 'quiz', 'reference', 'other')),
    tags TEXT[],
    download_count INTEGER DEFAULT 0,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_materials_tutor ON materials(tutor_id);
CREATE INDEX IF NOT EXISTS idx_materials_subject ON materials(subject_id);
CREATE INDEX IF NOT EXISTS idx_materials_category ON materials(category);
CREATE INDEX IF NOT EXISTS idx_materials_uploaded ON materials(uploaded_at DESC);

-- Add comment
COMMENT ON TABLE materials IS 'Study materials uploaded by tutors. Files stored in Supabase Storage "materials" bucket.';

-- Grant permissions
-- Note: Execute these in Supabase SQL Editor with proper roles
-- GRANT SELECT ON materials TO authenticated;
-- GRANT INSERT, UPDATE, DELETE ON materials TO authenticated;

SELECT 'Materials table created/verified successfully!' AS status;
