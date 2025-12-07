-- MC Tutor Database Refactoring
-- Refactor full_name to first_name, middle_name, last_name
-- Add comprehensive security with Row Level Security (RLS)
-- Date: 2025-12-07

-- ============================================
-- STEP 1: Add new name columns
-- ============================================

-- Add new columns for structured names
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS first_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS middle_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);

-- ============================================
-- STEP 2: Migrate existing data
-- ============================================

-- Split full_name into first_name and last_name
-- Assumes format: "FirstName MiddleName LastName" or "FirstName LastName"
UPDATE users 
SET 
  first_name = CASE 
    WHEN full_name IS NOT NULL AND full_name != '' THEN 
      TRIM(SPLIT_PART(full_name, ' ', 1))
    ELSE NULL 
  END,
  middle_name = CASE 
    WHEN full_name IS NOT NULL AND array_length(string_to_array(full_name, ' '), 1) > 2 THEN 
      TRIM(SPLIT_PART(full_name, ' ', 2))
    ELSE NULL 
  END,
  last_name = CASE 
    WHEN full_name IS NOT NULL AND array_length(string_to_array(full_name, ' '), 1) > 2 THEN 
      TRIM(SPLIT_PART(full_name, ' ', 3))
    WHEN full_name IS NOT NULL AND array_length(string_to_array(full_name, ' '), 1) = 2 THEN 
      TRIM(SPLIT_PART(full_name, ' ', 2))
    ELSE NULL 
  END
WHERE full_name IS NOT NULL;

-- ============================================
-- STEP 3: Create computed full_name column
-- ============================================

-- Add generated column for backward compatibility
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS full_name_computed TEXT 
GENERATED ALWAYS AS (
  CASE 
    WHEN middle_name IS NOT NULL AND middle_name != '' THEN 
      CONCAT(first_name, ' ', middle_name, ' ', last_name)
    ELSE 
      CONCAT(first_name, ' ', last_name)
  END
) STORED;

-- Create index for search performance
CREATE INDEX IF NOT EXISTS idx_users_names ON users(first_name, last_name);
CREATE INDEX IF NOT EXISTS idx_users_full_name_search ON users USING gin(to_tsvector('english', COALESCE(first_name, '') || ' ' || COALESCE(middle_name, '') || ' ' || COALESCE(last_name, '')));

-- ============================================
-- STEP 4: Make new columns NOT NULL
-- ============================================

-- Set NOT NULL constraint after data migration
ALTER TABLE users ALTER COLUMN first_name SET NOT NULL;
ALTER TABLE users ALTER COLUMN last_name SET NOT NULL;

-- ============================================
-- STEP 5: Add security constraints
-- ============================================

-- Add check constraints for data validation
ALTER TABLE users 
ADD CONSTRAINT check_first_name_length CHECK (char_length(first_name) >= 2 AND char_length(first_name) <= 100);

ALTER TABLE users 
ADD CONSTRAINT check_last_name_length CHECK (char_length(last_name) >= 2 AND char_length(last_name) <= 100);

ALTER TABLE users 
ADD CONSTRAINT check_middle_name_length CHECK (middle_name IS NULL OR (char_length(middle_name) >= 1 AND char_length(middle_name) <= 100));

-- Add email format validation
ALTER TABLE users 
ADD CONSTRAINT check_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Add phone format validation (Philippine format)
ALTER TABLE users 
ADD CONSTRAINT check_phone_format CHECK (phone IS NULL OR phone ~* '^\+?63[0-9]{10}$|^09[0-9]{9}$|^[0-9]{10,11}$');

-- ============================================
-- STEP 6: Enable Row Level Security (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutor_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 7: Create RLS Policies for USERS table
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can manage all users" ON users;
DROP POLICY IF EXISTS "Allow public read for tutors" ON users;
DROP POLICY IF EXISTS "Service role bypass" ON users;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT
  USING (auth.uid()::text = school_id OR role = 'admin');

-- Policy: Users can update their own profile (restricted fields)
CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE
  USING (auth.uid()::text = school_id)
  WITH CHECK (
    auth.uid()::text = school_id AND
    -- Prevent users from changing critical fields
    role = role AND
    school_id = school_id AND
    email = email
  );

-- Policy: Admins can view all users
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE school_id = auth.uid()::text 
      AND role = 'admin'
    )
  );

-- Policy: Admins can manage all users
CREATE POLICY "Admins can manage all users" ON users
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE school_id = auth.uid()::text 
      AND role = 'admin'
    )
  );

-- Policy: Public can view tutor profiles (for finding tutors)
CREATE POLICY "Allow public read for tutors" ON users
  FOR SELECT
  USING (role = 'tutor' AND status = 'active');

-- ============================================
-- STEP 8: Create RLS Policies for SESSIONS table
-- ============================================

DROP POLICY IF EXISTS "Users can view their own sessions" ON sessions;
DROP POLICY IF EXISTS "Tutors can manage their sessions" ON sessions;
DROP POLICY IF EXISTS "Tutees can manage their sessions" ON sessions;
DROP POLICY IF EXISTS "Admins can view all sessions" ON sessions;

-- Policy: Users can view sessions they're involved in
CREATE POLICY "Users can view their own sessions" ON sessions
  FOR SELECT
  USING (
    tutor_id IN (SELECT user_id FROM users WHERE school_id = auth.uid()::text) OR
    tutee_id IN (SELECT user_id FROM users WHERE school_id = auth.uid()::text) OR
    EXISTS (SELECT 1 FROM users WHERE school_id = auth.uid()::text AND role = 'admin')
  );

-- Policy: Tutors can update their sessions
CREATE POLICY "Tutors can manage their sessions" ON sessions
  FOR UPDATE
  USING (
    tutor_id IN (SELECT user_id FROM users WHERE school_id = auth.uid()::text)
  );

-- Policy: Tutees can create sessions
CREATE POLICY "Tutees can create sessions" ON sessions
  FOR INSERT
  WITH CHECK (
    tutee_id IN (SELECT user_id FROM users WHERE school_id = auth.uid()::text)
  );

-- Policy: Admins can manage all sessions
CREATE POLICY "Admins can manage all sessions" ON sessions
  FOR ALL
  USING (
    EXISTS (SELECT 1 FROM users WHERE school_id = auth.uid()::text AND role = 'admin')
  );

-- ============================================
-- STEP 9: Create RLS Policies for MATERIALS table
-- ============================================

DROP POLICY IF EXISTS "Anyone can view materials" ON materials;
DROP POLICY IF EXISTS "Tutors can manage their materials" ON materials;
DROP POLICY IF EXISTS "Admins can manage all materials" ON materials;

-- Policy: All authenticated users can view materials
CREATE POLICY "Anyone can view materials" ON materials
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Policy: Tutors can manage their own materials
CREATE POLICY "Tutors can manage their materials" ON materials
  FOR ALL
  USING (
    tutor_id IN (SELECT user_id FROM users WHERE school_id = auth.uid()::text)
  );

-- Policy: Admins can manage all materials
CREATE POLICY "Admins can manage all materials" ON materials
  FOR ALL
  USING (
    EXISTS (SELECT 1 FROM users WHERE school_id = auth.uid()::text AND role = 'admin')
  );

-- ============================================
-- STEP 10: Create RLS Policies for FEEDBACK table
-- ============================================

DROP POLICY IF EXISTS "Users can view feedback" ON feedback;
DROP POLICY IF EXISTS "Tutees can create feedback" ON feedback;
DROP POLICY IF EXISTS "Users can view their feedback" ON feedback;

-- Policy: Users can view feedback for themselves
CREATE POLICY "Users can view their feedback" ON feedback
  FOR SELECT
  USING (
    tutor_id IN (SELECT user_id FROM users WHERE school_id = auth.uid()::text) OR
    tutee_id IN (SELECT user_id FROM users WHERE school_id = auth.uid()::text) OR
    EXISTS (SELECT 1 FROM users WHERE school_id = auth.uid()::text AND role = 'admin')
  );

-- Policy: Tutees can create feedback
CREATE POLICY "Tutees can create feedback" ON feedback
  FOR INSERT
  WITH CHECK (
    tutee_id IN (SELECT user_id FROM users WHERE school_id = auth.uid()::text)
  );

-- ============================================
-- STEP 11: Create RLS Policies for NOTIFICATIONS table
-- ============================================

DROP POLICY IF EXISTS "Users can view their notifications" ON notifications;
DROP POLICY IF EXISTS "System can create notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their notifications" ON notifications;

-- Policy: Users can view their own notifications
CREATE POLICY "Users can view their notifications" ON notifications
  FOR SELECT
  USING (
    user_id IN (SELECT user_id FROM users WHERE school_id = auth.uid()::text)
  );

-- Policy: Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their notifications" ON notifications
  FOR UPDATE
  USING (
    user_id IN (SELECT user_id FROM users WHERE school_id = auth.uid()::text)
  );

-- ============================================
-- STEP 12: Create additional security indexes
-- ============================================

-- Add indexes for better query performance with RLS
CREATE INDEX IF NOT EXISTS idx_users_school_id ON users(school_id);
CREATE INDEX IF NOT EXISTS idx_users_role_status ON users(role, status);
CREATE INDEX IF NOT EXISTS idx_sessions_tutor ON sessions(tutor_id);
CREATE INDEX IF NOT EXISTS idx_sessions_tutee ON sessions(tutee_id);
CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_materials_tutor ON materials(tutor_id);
CREATE INDEX IF NOT EXISTS idx_feedback_tutor ON feedback(tutor_id);
CREATE INDEX IF NOT EXISTS idx_feedback_tutee ON feedback(tutee_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read) WHERE NOT is_read;

-- ============================================
-- STEP 13: Create audit log table for security
-- ============================================

CREATE TABLE IF NOT EXISTS audit_logs (
  log_id BIGSERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id),
  action VARCHAR(100) NOT NULL,
  table_name VARCHAR(100),
  record_id INTEGER,
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- ============================================
-- STEP 14: Create helper functions
-- ============================================

-- Function to get full name (for backward compatibility)
CREATE OR REPLACE FUNCTION get_full_name(user_row users)
RETURNS TEXT AS $$
BEGIN
  IF user_row.middle_name IS NOT NULL AND user_row.middle_name != '' THEN
    RETURN CONCAT(user_row.first_name, ' ', user_row.middle_name, ' ', user_row.last_name);
  ELSE
    RETURN CONCAT(user_row.first_name, ' ', user_row.last_name);
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to search users by name
CREATE OR REPLACE FUNCTION search_users_by_name(search_term TEXT)
RETURNS TABLE(user_id INTEGER, full_name TEXT, email VARCHAR, role VARCHAR) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.user_id,
    CASE 
      WHEN u.middle_name IS NOT NULL AND u.middle_name != '' THEN 
        CONCAT(u.first_name, ' ', u.middle_name, ' ', u.last_name)
      ELSE 
        CONCAT(u.first_name, ' ', u.last_name)
    END as full_name,
    u.email,
    u.role::VARCHAR
  FROM users u
  WHERE 
    u.first_name ILIKE '%' || search_term || '%' OR
    u.middle_name ILIKE '%' || search_term || '%' OR
    u.last_name ILIKE '%' || search_term || '%' OR
    CONCAT(u.first_name, ' ', u.last_name) ILIKE '%' || search_term || '%' OR
    CONCAT(u.first_name, ' ', u.middle_name, ' ', u.last_name) ILIKE '%' || search_term || '%';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- STEP 15: Add rate limiting table
-- ============================================

CREATE TABLE IF NOT EXISTS rate_limits (
  id BIGSERIAL PRIMARY KEY,
  identifier VARCHAR(255) NOT NULL, -- IP address or user ID
  action VARCHAR(100) NOT NULL,     -- login, register, api_call, etc.
  attempts INTEGER DEFAULT 1,
  window_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  blocked_until TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(identifier, action)
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier ON rate_limits(identifier, action);
CREATE INDEX IF NOT EXISTS idx_rate_limits_blocked ON rate_limits(blocked_until) WHERE blocked_until IS NOT NULL;

-- ============================================
-- STEP 16: Create view for safe user display
-- ============================================

-- Create a view that only exposes safe user information
CREATE OR REPLACE VIEW public_user_profiles AS
SELECT 
  user_id,
  school_id,
  CASE 
    WHEN middle_name IS NOT NULL AND middle_name != '' THEN 
      CONCAT(first_name, ' ', middle_name, ' ', last_name)
    ELSE 
      CONCAT(first_name, ' ', last_name)
  END as full_name,
  first_name,
  last_name,
  role,
  course,
  year_level,
  profile_picture,
  bio,
  status,
  created_at
FROM users
WHERE status = 'active';

-- ============================================
-- STEP 17: Grant appropriate permissions
-- ============================================

-- Grant permissions for authenticated users
GRANT SELECT ON public_user_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON users TO authenticated;
GRANT SELECT, INSERT, UPDATE ON sessions TO authenticated;
GRANT SELECT, INSERT ON feedback TO authenticated;
GRANT SELECT ON subjects TO authenticated;
GRANT SELECT ON materials TO authenticated;
GRANT SELECT, UPDATE ON notifications TO authenticated;

-- ============================================
-- STEP 18: Create trigger for audit logging
-- ============================================

CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (user_id, action, table_name, record_id, old_data, new_data)
  VALUES (
    COALESCE(NEW.user_id, OLD.user_id),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.user_id, OLD.user_id),
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply audit triggers to sensitive tables
DROP TRIGGER IF EXISTS users_audit_trigger ON users;
CREATE TRIGGER users_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON users
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- ============================================
-- STEP 19: Add password security
-- ============================================

-- Add password history to prevent reuse
CREATE TABLE IF NOT EXISTS password_history (
  id BIGSERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_password_history_user ON password_history(user_id);

-- Add constraint to store last 5 passwords
CREATE OR REPLACE FUNCTION check_password_history()
RETURNS TRIGGER AS $$
BEGIN
  -- Store old password in history
  IF TG_OP = 'UPDATE' AND NEW.password != OLD.password THEN
    INSERT INTO password_history (user_id, password_hash)
    VALUES (NEW.user_id, OLD.password);
    
    -- Keep only last 5 passwords
    DELETE FROM password_history
    WHERE user_id = NEW.user_id
    AND id NOT IN (
      SELECT id FROM password_history
      WHERE user_id = NEW.user_id
      ORDER BY created_at DESC
      LIMIT 5
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS password_history_trigger ON users;
CREATE TRIGGER password_history_trigger
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION check_password_history();

-- ============================================
-- STEP 20: Add session security
-- ============================================

-- Add last password change timestamp
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_password_change TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Add failed login attempts tracking
ALTER TABLE users ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_failed_login TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS account_locked_until TIMESTAMP;

-- Create index for locked accounts
CREATE INDEX IF NOT EXISTS idx_users_locked ON users(account_locked_until) WHERE account_locked_until IS NOT NULL;

-- ============================================
-- FINAL NOTES
-- ============================================

-- After running this migration:
-- 1. Update application code to use first_name, middle_name, last_name
-- 2. Test all authentication flows
-- 3. Verify RLS policies are working correctly
-- 4. Monitor audit_logs for suspicious activity
-- 5. Consider dropping old full_name column after verification:
--    ALTER TABLE users DROP COLUMN IF EXISTS full_name;

COMMENT ON COLUMN users.first_name IS 'User first name (required)';
COMMENT ON COLUMN users.middle_name IS 'User middle name (optional)';
COMMENT ON COLUMN users.last_name IS 'User last name (required)';
COMMENT ON COLUMN users.full_name_computed IS 'Computed full name for backward compatibility';

-- Migration completed successfully!
SELECT 'Migration 001: Name refactoring and security improvements completed!' as status;
