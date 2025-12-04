-- =====================================================
-- MC TUTOR - DATABASE OPTIMIZATION ROLLBACK
-- Reverts changes from 001_optimize_database_ids.sql
-- Date: December 4, 2025
-- =====================================================

-- Drop new columns
ALTER TABLE sessions DROP COLUMN IF EXISTS session_code;
ALTER TABLE notifications DROP COLUMN IF EXISTS notification_code;
ALTER TABLE users DROP COLUMN IF EXISTS deleted_at;

-- Drop new indexes
DROP INDEX IF EXISTS idx_sessions_tutor_status_date;
DROP INDEX IF EXISTS idx_sessions_tutee_status_date;
DROP INDEX IF EXISTS idx_sessions_code;
DROP INDEX IF EXISTS idx_subjects_code_id;
DROP INDEX IF EXISTS idx_notifications_code;
DROP INDEX IF EXISTS idx_users_active;
DROP INDEX IF EXISTS idx_users_deleted_at;

-- Drop new constraints
ALTER TABLE sessions DROP CONSTRAINT IF EXISTS chk_session_times;
ALTER TABLE sessions DROP CONSTRAINT IF EXISTS chk_session_future_date;

-- Drop new views
DROP VIEW IF EXISTS active_tutors;
DROP VIEW IF EXISTS active_students;
DROP VIEW IF EXISTS upcoming_sessions;

-- Drop new functions
DROP FUNCTION IF EXISTS generate_short_id(TEXT);
DROP FUNCTION IF EXISTS generate_session_code();
DROP FUNCTION IF EXISTS generate_notification_code();
DROP FUNCTION IF EXISTS get_session_by_identifier(TEXT);
DROP FUNCTION IF EXISTS soft_delete_user(INTEGER);
DROP FUNCTION IF EXISTS restore_user(INTEGER);

-- Drop triggers
DROP TRIGGER IF EXISTS trg_generate_session_code ON sessions;
DROP TRIGGER IF EXISTS trg_generate_notification_code ON notifications;

-- Restore original RLS policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Public can view tutor profiles" ON users;
DROP POLICY IF EXISTS "Tutors can view their sessions" ON sessions;
DROP POLICY IF EXISTS "Students can view their sessions" ON sessions;

CREATE POLICY "Users can view own profile"
ON users FOR SELECT
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Public can view tutor profiles"
ON users FOR SELECT
USING (role = 'tutor' AND status = 'active');

CREATE POLICY "Tutors can view their sessions"
ON sessions FOR SELECT
USING (tutor_id::text = auth.uid()::text);

CREATE POLICY "Students can view their sessions"
ON sessions FOR SELECT
USING (tutee_id::text = auth.uid()::text);

RAISE NOTICE '✅ Rollback completed successfully!';
