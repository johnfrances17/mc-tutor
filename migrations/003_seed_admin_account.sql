-- =====================================================
-- MC TUTOR - SEED ADMIN ACCOUNT
-- Creates default admin account for system access
-- Date: December 4, 2025
-- Safe to run multiple times (idempotent)
-- =====================================================

-- Note: Password is "admin123" hashed with bcrypt (10 rounds)
-- Generated using: bcrypt.hash('admin123', 10)
-- Hash: $2a$10$rH3K7YzqQOWWPvVLx3Y3mOGWJ3L2tEgLV5FZX.8YmQX9Q7XqYn3Gu

DO $$
DECLARE
    admin_exists BOOLEAN;
BEGIN
    -- Check if admin account already exists
    SELECT EXISTS (
        SELECT 1 FROM users 
        WHERE school_id = '000000' 
        OR (email = 'admin@mabinicolleges.edu.ph' AND role = 'admin')
    ) INTO admin_exists;

    IF NOT admin_exists THEN
        -- Insert admin account
        INSERT INTO users (
            school_id,
            email,
            password,
            full_name,
            role,
            phone,
            year_level,
            course,
            status,
            created_at,
            updated_at,
            last_active
        ) VALUES (
            '000000',
            'admin@mabinicolleges.edu.ph',
            '$2a$10$rH3K7YzqQOWWPvVLx3Y3mOGWJ3L2tEgLV5FZX.8YmQX9Q7XqYn3Gu',  -- admin123
            'System Administrator',
            'admin',
            NULL,
            NULL,
            NULL,
            'active',
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
        );
        
        RAISE NOTICE 'Admin account created successfully';
        RAISE NOTICE 'School ID: 000000';
        RAISE NOTICE 'Email: admin@mabinicolleges.edu.ph';
        RAISE NOTICE 'Password: admin123';
        RAISE NOTICE 'Please change the password after first login!';
    ELSE
        RAISE NOTICE 'Admin account already exists - skipping creation';
    END IF;
END $$;

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================
-- Uncomment to verify admin account was created:
/*
SELECT 
    user_id,
    school_id,
    email,
    full_name,
    role,
    status,
    created_at
FROM users 
WHERE school_id = '000000' OR role = 'admin';
*/

-- =====================================================
-- ADDITIONAL TEST ACCOUNTS (OPTIONAL)
-- =====================================================
-- Uncomment to create test accounts for development:
/*
DO $$
BEGIN
    -- Test Tutor Account
    IF NOT EXISTS (SELECT 1 FROM users WHERE school_id = '111111') THEN
        INSERT INTO users (school_id, email, password, full_name, role, phone, year_level, course, status)
        VALUES (
            '111111',
            'tutor@mabinicolleges.edu.ph',
            '$2a$10$rH3K7YzqQOWWPvVLx3Y3mOGWJ3L2tEgLV5FZX.8YmQX9Q7XqYn3Gu',  -- admin123
            'Test Tutor',
            'tutor',
            '09123456789',
            '4th Year',
            'BSCS',
            'active'
        );
        RAISE NOTICE 'Test tutor account created (111111 / admin123)';
    END IF;

    -- Test Student Account
    IF NOT EXISTS (SELECT 1 FROM users WHERE school_id = '222222') THEN
        INSERT INTO users (school_id, email, password, full_name, role, phone, year_level, course, status)
        VALUES (
            '222222',
            'student@mabinicolleges.edu.ph',
            '$2a$10$rH3K7YzqQOWWPvVLx3Y3mOGWJ3L2tEgLV5FZX.8YmQX9Q7XqYn3Gu',  -- admin123
            'Test Student',
            'tutee',
            '09123456789',
            '1st Year',
            'BSCS',
            'active'
        );
        RAISE NOTICE 'Test student account created (222222 / admin123)';
    END IF;
END $$;
*/
