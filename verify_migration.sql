-- =====================================================
-- VERIFICATION QUERIES
-- Run these in Supabase SQL Editor to verify migration
-- =====================================================

-- 1. Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
-- Expected: 9 tables (users, subjects, tutor_subjects, tutor_availability, 
--           sessions, feedback, notifications, study_materials, chat_messages)

-- 2. Check ENUM types were created
SELECT typname 
FROM pg_type 
WHERE typtype = 'e' 
ORDER BY typname;
-- Expected: 7 types (user_role, user_status, session_type, session_status, 
--           notification_type, proficiency_level, day_of_week)

-- 3. Verify subjects were loaded
SELECT COUNT(*) as total_subjects FROM subjects;
-- Expected: 62 subjects

SELECT course, COUNT(*) as subject_count 
FROM subjects 
GROUP BY course 
ORDER BY course;
-- Should show distribution across all courses

-- 4. Check indexes were created
SELECT schemaname, tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY tablename, indexname;
-- Expected: 20+ indexes

-- 5. Check RLS is enabled on all tables
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
-- Expected: All tables should have rowsecurity = true

-- 6. Check RLS policies exist
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;
-- Expected: 30+ policies

-- 7. Check triggers were created
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
ORDER BY event_object_table;
-- Expected: update_users_updated_at, update_sessions_updated_at

-- 8. Check functions exist
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
ORDER BY routine_name;
-- Expected: update_updated_at_column, get_upcoming_sessions

-- =====================================================
-- SAMPLE DATA QUERIES (Optional - for testing)
-- =====================================================

-- View Computer Science subjects
SELECT subject_code, subject_name 
FROM subjects 
WHERE course LIKE '%Computer Science%' 
ORDER BY subject_code;

-- View all courses with subject counts
SELECT 
  course,
  COUNT(*) as total_subjects,
  array_agg(subject_code ORDER BY subject_code) as subject_codes
FROM subjects 
GROUP BY course 
ORDER BY course;

-- =====================================================
-- TEST RLS POLICIES (After creating users)
-- =====================================================

-- Note: These will only work after you create Supabase Auth users
-- and link them to the users table

-- Test viewing subjects (should work for everyone)
-- SELECT * FROM subjects LIMIT 5;

-- Test viewing users (should fail without auth or show limited results)
-- SELECT * FROM users LIMIT 5;

-- =====================================================
-- NEXT STEPS CHECKLIST
-- =====================================================

-- ✅ Phase 1: Database Migration - COMPLETE!
-- 
-- 📦 Phase 2: Create Storage Buckets
--    1. Go to Storage in Supabase Dashboard
--    2. Create bucket: profile-pictures (public)
--    3. Create bucket: study-materials (private)
--    4. Create bucket: chat-data (private, optional)
--
-- 🔐 Phase 3: Set Up Authentication
--    1. Go to Authentication → Users
--    2. Create admin user: admin@mabini.edu
--    3. Create test users from your MySQL database
--    4. Link auth.uid() to users.user_id
--
-- 📊 Phase 4: Migrate Data
--    1. Export users from MySQL (without passwords)
--    2. Import sessions, feedback, tutor_subjects
--    3. Upload files to Storage buckets
--    4. Update file paths in database
--
-- 🔧 Phase 5: Update Application Code
--    1. Install Supabase client library
--    2. Update config/database.php to use Supabase
--    3. Convert mysqli queries to Supabase queries
--    4. Update file upload code for Storage API
--
-- ✅ Everything looks good! Continue with the setup guide.
