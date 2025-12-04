-- =====================================================
-- MC TUTOR - DATABASE OPTIMIZATION MIGRATION (SAFE VERSION)
-- Phase 1: Add randomized IDs and improve structure
-- Date: December 4, 2025
-- Safe to run multiple times (idempotent)
-- Broken into discrete statements to avoid syntax errors
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- STEP 1: Add new columns for randomized short IDs
-- =====================================================

-- Add session_code to sessions table (12-char ULID-style)
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS session_code VARCHAR(12) UNIQUE;

-- Add notification_code to notifications table
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS notification_code VARCHAR(12) UNIQUE;

-- Add soft delete column to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- =====================================================
-- STEP 2: Create function to generate short random IDs
-- =====================================================

CREATE OR REPLACE FUNCTION generate_short_id(prefix TEXT DEFAULT '')
RETURNS VARCHAR(12) AS $$
DECLARE
    chars TEXT := '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
    result TEXT := prefix;
    i INTEGER;
BEGIN
    FOR i IN 1..(12 - LENGTH(prefix)) LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- =====================================================
-- STEP 3: Create trigger functions for auto-generation
-- =====================================================

CREATE OR REPLACE FUNCTION generate_session_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.session_code IS NULL THEN
        LOOP
            NEW.session_code := generate_short_id('S');
            BEGIN
                PERFORM 1 FROM sessions WHERE session_code = NEW.session_code;
                IF NOT FOUND THEN
                    EXIT;
                END IF;
            EXCEPTION WHEN unique_violation THEN
                CONTINUE;
            END;
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_notification_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.notification_code IS NULL THEN
        LOOP
            NEW.notification_code := generate_short_id('N');
            BEGIN
                PERFORM 1 FROM notifications WHERE notification_code = NEW.notification_code;
                IF NOT FOUND THEN
                    EXIT;
                END IF;
            EXCEPTION WHEN unique_violation THEN
                CONTINUE;
            END;
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- STEP 4: Create triggers
-- =====================================================

DROP TRIGGER IF EXISTS trg_generate_session_code ON sessions;
CREATE TRIGGER trg_generate_session_code
    BEFORE INSERT ON sessions
    FOR EACH ROW
    EXECUTE FUNCTION generate_session_code();

DROP TRIGGER IF EXISTS trg_generate_notification_code ON notifications;
CREATE TRIGGER trg_generate_notification_code
    BEFORE INSERT ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION generate_notification_code();

-- =====================================================
-- STEP 5: Backfill existing records with codes
-- =====================================================

-- Backfill sessions (only if codes don't exist)
UPDATE sessions 
SET session_code = generate_short_id('S')
WHERE session_code IS NULL;

-- Backfill notifications (only if codes don't exist)
UPDATE notifications 
SET notification_code = generate_short_id('N')
WHERE notification_code IS NULL;

-- =====================================================
-- STEP 6: Add composite indexes for optimization
-- =====================================================

-- Sessions: Optimize common queries
CREATE INDEX IF NOT EXISTS idx_sessions_tutor_status_date 
    ON sessions(tutor_id, status, session_date);

CREATE INDEX IF NOT EXISTS idx_sessions_tutee_status_date 
    ON sessions(tutee_id, status, session_date);

CREATE INDEX IF NOT EXISTS idx_sessions_code 
    ON sessions(session_code) WHERE session_code IS NOT NULL;

-- Subjects: Optimize code lookups
CREATE INDEX IF NOT EXISTS idx_subjects_code_id 
    ON subjects(subject_code, subject_id);

-- Notifications: Optimize by code
CREATE INDEX IF NOT EXISTS idx_notifications_code 
    ON notifications(notification_code) WHERE notification_code IS NOT NULL;

-- Users: Optimize soft delete queries
CREATE INDEX IF NOT EXISTS idx_users_active 
    ON users(user_id, status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_users_deleted_at 
    ON users(deleted_at) WHERE deleted_at IS NULL;

-- =====================================================
-- STEP 7: Add check constraints
-- =====================================================

-- Ensure session times are logical (ignore if exists)
DO $$ 
BEGIN
    ALTER TABLE sessions 
    ADD CONSTRAINT chk_session_times 
    CHECK (end_time > start_time);
EXCEPTION 
    WHEN duplicate_object THEN NULL;
END $$;

-- =====================================================
-- STEP 8: Create helper views
-- =====================================================

-- View: Active tutors only
CREATE OR REPLACE VIEW active_tutors AS
SELECT 
    user_id,
    student_id,
    full_name,
    email,
    phone,
    profile_picture,
    created_at
FROM users
WHERE role = 'tutor' 
    AND status = 'active' 
    AND deleted_at IS NULL;

-- View: Active students only
CREATE OR REPLACE VIEW active_students AS
SELECT 
    user_id,
    student_id,
    full_name,
    email,
    phone,
    year_level,
    course,
    profile_picture,
    created_at
FROM users
WHERE role = 'tutee' 
    AND status = 'active' 
    AND deleted_at IS NULL;

-- View: Upcoming sessions with details
CREATE OR REPLACE VIEW upcoming_sessions AS
SELECT 
    s.session_id,
    s.session_code,
    s.session_date,
    s.start_time,
    s.end_time,
    s.status,
    s.session_type,
    s.location,
    s.meeting_link,
    t.user_id as tutor_id,
    t.student_id as tutor_student_id,
    t.full_name as tutor_name,
    st.user_id as tutee_id,
    st.student_id as tutee_student_id,
    st.full_name as tutee_name,
    subj.subject_id,
    subj.subject_code,
    subj.subject_name
FROM sessions s
JOIN users t ON s.tutor_id = t.user_id
JOIN users st ON s.tutee_id = st.user_id
JOIN subjects subj ON s.subject_id = subj.subject_id
WHERE s.status IN ('pending', 'confirmed')
    AND s.session_date >= CURRENT_DATE
    AND t.deleted_at IS NULL
    AND st.deleted_at IS NULL
ORDER BY s.session_date, s.start_time;

-- =====================================================
-- STEP 9: Create helper functions
-- =====================================================

-- Enhanced function to get sessions by code or ID
CREATE OR REPLACE FUNCTION get_session_by_identifier(p_identifier TEXT)
RETURNS TABLE (
    session_id INTEGER,
    session_code VARCHAR,
    tutor_name VARCHAR,
    tutee_name VARCHAR,
    subject_name VARCHAR,
    subject_code VARCHAR,
    session_date DATE,
    start_time TIME,
    end_time TIME,
    status session_status,
    session_type session_type,
    location VARCHAR,
    meeting_link VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.session_id,
        s.session_code,
        u_tutor.full_name as tutor_name,
        u_tutee.full_name as tutee_name,
        subj.subject_name,
        subj.subject_code,
        s.session_date,
        s.start_time,
        s.end_time,
        s.status,
        s.session_type,
        s.location,
        s.meeting_link
    FROM sessions s
    JOIN users u_tutor ON s.tutor_id = u_tutor.user_id
    JOIN users u_tutee ON s.tutee_id = u_tutee.user_id
    JOIN subjects subj ON s.subject_id = subj.subject_id
    WHERE s.session_code = p_identifier 
        OR (p_identifier ~ '^\d+$' AND s.session_id = p_identifier::INTEGER);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to soft delete user
CREATE OR REPLACE FUNCTION soft_delete_user(p_user_id INTEGER)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE users 
    SET status = 'inactive', 
        deleted_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = p_user_id 
        AND deleted_at IS NULL;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to restore soft deleted user
CREATE OR REPLACE FUNCTION restore_user(p_user_id INTEGER)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE users 
    SET status = 'active', 
        deleted_at = NULL,
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = p_user_id 
        AND deleted_at IS NOT NULL;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STEP 10: Update RLS policies for soft delete
-- =====================================================

-- Drop old policies that don't consider soft delete
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Public can view tutor profiles" ON users;
DROP POLICY IF EXISTS "Tutors can view their sessions" ON sessions;
DROP POLICY IF EXISTS "Students can view their sessions" ON sessions;

-- Recreate with soft delete awareness
CREATE POLICY "Users can view own profile"
ON users FOR SELECT
USING (auth.uid()::text = user_id::text AND deleted_at IS NULL);

CREATE POLICY "Public can view tutor profiles"
ON users FOR SELECT
USING (role = 'tutor' AND status = 'active' AND deleted_at IS NULL);

CREATE POLICY "Tutors can view their sessions"
ON sessions FOR SELECT
USING (
    tutor_id::text = auth.uid()::text AND 
    EXISTS (SELECT 1 FROM users WHERE user_id = sessions.tutor_id AND deleted_at IS NULL)
);

CREATE POLICY "Students can view their sessions"
ON sessions FOR SELECT
USING (
    tutee_id::text = auth.uid()::text AND
    EXISTS (SELECT 1 FROM users WHERE user_id = sessions.tutee_id AND deleted_at IS NULL)
);

-- =====================================================
-- COMPLETION
-- =====================================================
-- Migration completed successfully!
-- New columns added: session_code, notification_code, deleted_at
-- Triggers created for auto-generation
-- Indexes added for performance
-- Helper views and functions created
-- RLS policies updated
-- =====================================================
