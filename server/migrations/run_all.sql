-- ===================================
-- MASTER MIGRATION SCRIPT
-- Date: 2025-12-07
-- Description: Run all migrations in correct order
-- ===================================

-- Note: Execute each migration file in order:
-- 1. 001_create_courses_table.sql
-- 2. 002_update_users_table.sql
-- 3. 003_update_subjects_table.sql
-- 4. 004_create_tutor_availability.sql
-- 5. 005_create_tutor_stats.sql
-- 6. 006_update_sessions_table.sql
-- 7. 007_update_materials_table.sql
-- 8. 008_update_feedback_table.sql
-- 9. 009_update_notifications_table.sql
-- 10. 010_update_chats_table.sql
-- 11. 011_update_tutor_subjects_table.sql

\echo 'Starting database migration...'
\echo ''

\echo '1. Creating courses table...'
\i '001_create_courses_table.sql'
\echo 'Done!'
\echo ''

\echo '2. Updating users table...'
\i '002_update_users_table.sql'
\echo 'Done!'
\echo ''

\echo '3. Updating subjects table...'
\i '003_update_subjects_table.sql'
\echo 'Done!'
\echo ''

\echo '4. Creating tutor_availability table...'
\i '004_create_tutor_availability.sql'
\echo 'Done!'
\echo ''

\echo '5. Creating tutor_stats table...'
\i '005_create_tutor_stats.sql'
\echo 'Done!'
\echo ''

\echo '6. Updating sessions table...'
\i '006_update_sessions_table.sql'
\echo 'Done!'
\echo ''

\echo '7. Updating materials table...'
\i '007_update_materials_table.sql'
\echo 'Done!'
\echo ''

\echo '8. Updating feedback table...'
\i '008_update_feedback_table.sql'
\echo 'Done!'
\echo ''

\echo '9. Updating notifications table...'
\i '009_update_notifications_table.sql'
\echo 'Done!'
\echo ''

\echo '10. Updating chats table...'
\i '010_update_chats_table.sql'
\echo 'Done!'
\echo ''

\echo '11. Updating tutor_subjects table...'
\i '011_update_tutor_subjects_table.sql'
\echo 'Done!'
\echo ''

\echo '====================================='
\echo 'All migrations completed successfully!'
\echo '====================================='
