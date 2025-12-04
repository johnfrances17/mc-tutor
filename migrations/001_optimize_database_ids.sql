-- =====================================================
-- MC TUTOR - DATABASE OPTIMIZATION MIGRATION
-- Phase 1: Add randomized IDs and improve structure
-- Date: December 4, 2025
-- Safe to run multiple times (idempotent)
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- STEP 1: Add new columns for randomized short IDs
-- =====================================================

-- Add session_code to sessions table (12-char ULID-style)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sessions' AND column_name = 'session_code'
    ) THEN
        ALTER TABLE sessions ADD COLUMN session_code VARCHAR(12) UNIQUE;
        RAISE NOTICE '✅ Added session_code column to sessions table';
    ELSE
        RAISE NOTICE '⏭️  session_code column already exists';
    END IF;
END $$;

-- Add notification_code to notifications table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' AND column_name = 'notification_code'
    ) THEN
        ALTER TABLE notifications ADD COLUMN notification_code VARCHAR(12) UNIQUE;
        RAISE NOTICE '✅ Added notification_code column to notifications table';
    ELSE
        RAISE NOTICE '⏭️  notification_code column already exists';
    END IF;
END $$;

-- =====================================================
-- STEP 2: Create function to generate short random IDs
-- =====================================================

CREATE OR REPLACE FUNCTION generate_short_id(prefix TEXT DEFAULT '')
RETURNS VARCHAR(12) AS $$
DECLARE
    chars TEXT := '0123456789ABCDEFGHJKMNPQRSTVWXYZ'; -- No confusing chars (I,O,L,U)
    result TEXT := prefix;
    i INTEGER;
BEGIN
    -- Generate 12-character code (or 10 if prefix is 2 chars)
    FOR i IN 1..(12 - LENGTH(prefix)) LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- =====================================================
-- STEP 3: Create trigger functions for auto-generation
-- =====================================================

-- Trigger function for sessions
CREATE OR REPLACE FUNCTION generate_session_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.session_code IS NULL THEN
        -- Keep trying until we get a unique code
        LOOP
            NEW.session_code := generate_short_id('S');
            BEGIN
                -- Try to check uniqueness
                PERFORM 1 FROM sessions WHERE session_code = NEW.session_code;
                IF NOT FOUND THEN
                    EXIT; -- Unique code found
                END IF;
            EXCEPTION WHEN unique_violation THEN
                -- Try again with new code
                CONTINUE;
            END;
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger function for notifications
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

-- Backfill sessions
DO $$
DECLARE
    rec RECORD;
    new_code VARCHAR(12);
BEGIN
    FOR rec IN SELECT session_id FROM sessions WHERE session_code IS NULL LOOP
        LOOP
            new_code := generate_short_id('S');
            BEGIN
                UPDATE sessions SET session_code = new_code WHERE session_id = rec.session_id;
                EXIT;
            EXCEPTION WHEN unique_violation THEN
                CONTINUE;
            END;
        END LOOP;
    END LOOP;
    RAISE NOTICE '✅ Backfilled session codes';
END $$;

-- Backfill notifications
DO $$
DECLARE
    rec RECORD;
    new_code VARCHAR(12);
BEGIN
    FOR rec IN SELECT notification_id FROM notifications WHERE notification_code IS NULL LOOP
        LOOP
            new_code := generate_short_id('N');
            BEGIN
                UPDATE notifications SET notification_code = new_code WHERE notification_id = rec.notification_id;
                EXIT;
            EXCEPTION WHEN unique_violation THEN
                CONTINUE;
            END;
        END LOOP;
    END LOOP;
    RAISE NOTICE '✅ Backfilled notification codes';
END $$;

-- =====================================================
-- STEP 6: Add soft delete column to users
-- =====================================================

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'deleted_at'
    ) THEN
        ALTER TABLE users ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
        CREATE INDEX idx_users_deleted_at ON users(deleted_at) WHERE deleted_at IS NULL;
        RAISE NOTICE '✅ Added soft delete column to users table';
    ELSE
        RAISE NOTICE '⏭️  deleted_at column already exists';
    END IF;
END $$;

-- =====================================================
-- STEP 7: Add composite indexes for optimization
-- =====================================================

-- Sessions: Optimize common queries
CREATE INDEX IF NOT EXISTS idx_sessions_tutor_status_date 
    ON sessions(tutor_id, status, session_date) 
    WHERE deleted_at IS NULL;

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

RAISE NOTICE '✅ Created composite indexes for optimization';

-- =====================================================
-- STEP 8: Add check constraints
-- =====================================================

-- Ensure session times are logical
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_session_times'
    ) THEN
        ALTER TABLE sessions 
        ADD CONSTRAINT chk_session_times 
        CHECK (end_time > start_time);
        RAISE NOTICE '✅ Added check constraint for session times';
    END IF;
END $$;

-- Ensure session date is not in the past (for new sessions)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_session_future_date'
    ) THEN
        ALTER TABLE sessions 
        ADD CONSTRAINT chk_session_future_date 
        CHECK (
            created_at IS NULL OR 
            session_date >= CURRENT_DATE OR 
            status IN ('completed', 'cancelled')
        );
        RAISE NOTICE '✅ Added check constraint for session dates';
    END IF;
END $$;

-- =====================================================
-- STEP 9: Create helper views
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

RAISE NOTICE '✅ Created helper views';

-- =====================================================
-- STEP 10: Update helper functions
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
    -- Try as session_code first, then as session_id
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

RAISE NOTICE '✅ Updated helper functions';

-- =====================================================
-- STEP 11: Update RLS policies for soft delete
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

RAISE NOTICE '✅ Updated RLS policies for soft delete';

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

DO $$
DECLARE
    session_count INTEGER;
    notification_count INTEGER;
    sessions_with_codes INTEGER;
    notifications_with_codes INTEGER;
BEGIN
    -- Count total records
    SELECT COUNT(*) INTO session_count FROM sessions;
    SELECT COUNT(*) INTO notification_count FROM notifications;
    
    -- Count records with codes
    SELECT COUNT(*) INTO sessions_with_codes FROM sessions WHERE session_code IS NOT NULL;
    SELECT COUNT(*) INTO notifications_with_codes FROM notifications WHERE notification_code IS NOT NULL;
    
    RAISE NOTICE '';
    RAISE NOTICE '📊 MIGRATION VERIFICATION';
    RAISE NOTICE '========================';
    RAISE NOTICE 'Sessions: % total, % with codes (%.1f%%)', 
        session_count, 
        sessions_with_codes,
        CASE WHEN session_count > 0 THEN (sessions_with_codes::FLOAT / session_count * 100) ELSE 0 END;
    RAISE NOTICE 'Notifications: % total, % with codes (%.1f%%)', 
        notification_count, 
        notifications_with_codes,
        CASE WHEN notification_count > 0 THEN (notifications_with_codes::FLOAT / notification_count * 100) ELSE 0 END;
    RAISE NOTICE '';
    RAISE NOTICE '✅ Migration completed successfully!';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 Next steps:';
    RAISE NOTICE '1. Update backend API to support both ID formats';
    RAISE NOTICE '2. Update frontend to use session_code where appropriate';
    RAISE NOTICE '3. Test all endpoints with both old and new IDs';
    RAISE NOTICE '4. Deploy changes gradually';
END $$;

-- =====================================================
-- END OF MIGRATION
-- =====================================================
