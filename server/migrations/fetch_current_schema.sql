-- Run this in Supabase SQL Editor to get the current schema

-- ============================================
-- 1. List all tables
-- ============================================
SELECT 
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- ============================================
-- 2. Get users table structure
-- ============================================
SELECT 
  column_name,
  data_type,
  character_maximum_length,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'users'
ORDER BY ordinal_position;

-- ============================================
-- 3. List all views
-- ============================================
SELECT 
  table_name as view_name
FROM information_schema.views
WHERE table_schema = 'public'
ORDER BY table_name;

-- ============================================
-- 4. Get view definitions
-- ============================================
SELECT 
  table_name as view_name,
  view_definition
FROM information_schema.views
WHERE table_schema = 'public'
ORDER BY table_name;

-- ============================================
-- 5. List all constraints on users table
-- ============================================
SELECT
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_schema = 'public' 
  AND tc.table_name = 'users'
ORDER BY tc.constraint_type, tc.constraint_name;

-- ============================================
-- 6. List all indexes on users table
-- ============================================
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'users'
ORDER BY indexname;

-- ============================================
-- 7. Check RLS status
-- ============================================
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- ============================================
-- 8. Sample data from users table
-- ============================================
SELECT 
  user_id,
  email,
  role,
  status,
  created_at
FROM users
LIMIT 5;
