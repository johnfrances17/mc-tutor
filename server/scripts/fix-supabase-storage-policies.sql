-- =====================================================
-- SUPABASE STORAGE POLICIES FIX
-- =====================================================
-- Run this in Supabase SQL Editor to allow uploads
-- Dashboard > SQL Editor > New Query > Paste this > Run
-- =====================================================

-- 1. Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies (if any) to start fresh
DROP POLICY IF EXISTS "Allow public uploads to avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access to avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow public deletes from avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow public uploads to materials" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access to materials" ON storage.objects;
DROP POLICY IF EXISTS "Allow public deletes from materials" ON storage.objects;

-- 3. Create policies for AVATARS bucket
-- Allow anyone to upload (INSERT)
CREATE POLICY "Allow public uploads to avatars"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'avatars');

-- Allow anyone to read (SELECT)
CREATE POLICY "Allow public access to avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Allow anyone to delete (DELETE)
CREATE POLICY "Allow public deletes from avatars"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'avatars');

-- Allow anyone to update (UPDATE)
CREATE POLICY "Allow public updates to avatars"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'avatars')
WITH CHECK (bucket_id = 'avatars');

-- 4. Create policies for MATERIALS bucket
-- Allow anyone to upload (INSERT)
CREATE POLICY "Allow public uploads to materials"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'materials');

-- Allow anyone to read (SELECT)
CREATE POLICY "Allow public access to materials"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'materials');

-- Allow anyone to delete (DELETE)
CREATE POLICY "Allow public deletes from materials"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'materials');

-- Allow anyone to update (UPDATE)
CREATE POLICY "Allow public updates to materials"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'materials')
WITH CHECK (bucket_id = 'materials');

-- 5. Verify policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'objects'
AND schemaname = 'storage'
ORDER BY policyname;

-- Expected output: Should show 8 policies (4 for avatars, 4 for materials)
-- If you see the policies listed, you're good to go! ✅
