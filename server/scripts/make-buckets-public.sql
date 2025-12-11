-- Make Supabase Storage buckets public
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/axrzqrzlnceaiuiyixif/sql

-- Make avatars bucket public
UPDATE storage.buckets 
SET public = true 
WHERE name = 'avatars';

-- Make materials bucket public
UPDATE storage.buckets 
SET public = true 
WHERE name = 'materials';

-- Verify buckets are now public
SELECT name, public, created_at 
FROM storage.buckets 
WHERE name IN ('avatars', 'materials');
