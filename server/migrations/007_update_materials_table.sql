-- ===================================
-- Migration: Update Materials Table Schema
-- Date: 2025-12-07
-- Description: Add categorization and tracking for study materials
-- ===================================

-- Step 1: Add new columns for categorization
ALTER TABLE materials ADD COLUMN IF NOT EXISTS file_name VARCHAR(255);
ALTER TABLE materials ADD COLUMN IF NOT EXISTS category VARCHAR(50);
ALTER TABLE materials ADD COLUMN IF NOT EXISTS topic VARCHAR(100);
ALTER TABLE materials ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE materials ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT TRUE;
ALTER TABLE materials ADD COLUMN IF NOT EXISTS download_count INTEGER DEFAULT 0;

-- Step 2: Add category constraint
ALTER TABLE materials 
  DROP CONSTRAINT IF EXISTS check_material_category;

ALTER TABLE materials 
  ADD CONSTRAINT check_material_category 
  CHECK (category IN ('notes', 'handout', 'exercise', 'exam', 'other') OR category IS NULL);

-- Step 3: Migrate file_path to file_name if file_name is empty
UPDATE materials 
SET file_name = SUBSTRING(file_path FROM '[^/]+$')
WHERE file_name IS NULL AND file_path IS NOT NULL;

-- Step 4: Create indexes
CREATE INDEX IF NOT EXISTS idx_materials_uploader ON materials(uploader_id);
CREATE INDEX IF NOT EXISTS idx_materials_subject ON materials(subject_id);
CREATE INDEX IF NOT EXISTS idx_materials_category ON materials(category);
CREATE INDEX IF NOT EXISTS idx_materials_public ON materials(is_public);
CREATE INDEX IF NOT EXISTS idx_materials_tags ON materials USING GIN(tags);

COMMENT ON COLUMN materials.category IS 'Type: notes, handout, exercise, exam, other';
COMMENT ON COLUMN materials.tags IS 'Array of searchable tags';
COMMENT ON COLUMN materials.is_public IS 'Whether material is visible to all users';
