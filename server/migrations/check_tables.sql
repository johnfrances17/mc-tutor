-- Quick Check: List all tables in database
-- Run this in Supabase SQL Editor to see what you have

SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled,
  CASE 
    WHEN rowsecurity = true THEN '🔴 UNRESTRICTED'
    ELSE '✅ OK'
  END as status
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Check for duplicate/similar tables
SELECT tablename, COUNT(*) as count
FROM pg_tables 
WHERE schemaname = 'public'
  AND (
    tablename LIKE '%user%' 
    OR tablename LIKE '%student%'
    OR tablename LIKE '%tutor%'
    OR tablename LIKE '%session%'
  )
GROUP BY tablename
ORDER BY tablename;

-- Check all views
SELECT 
  schemaname,
  viewname,
  '📄 VIEW' as type
FROM pg_views 
WHERE schemaname = 'public'
ORDER BY viewname;
