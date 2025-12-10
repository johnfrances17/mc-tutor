-- ====================================================================
-- Migration: Remove Chat and Notification Tables
-- Description: Safely removes the chats and notifications tables
--              since these features have been removed from the application
-- Date: December 11, 2025
-- ====================================================================

-- WARNING: This migration will permanently delete the chats and notifications tables
-- and all their data. Make sure you have a backup before running this migration.

-- Step 1: Drop foreign key constraints first (if they exist)
-- This ensures clean removal without constraint violations

DO $$ 
BEGIN
    -- Drop chats table foreign keys
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'chats_sender_id_fkey' 
        AND table_name = 'chats'
    ) THEN
        ALTER TABLE chats DROP CONSTRAINT chats_sender_id_fkey;
        RAISE NOTICE 'Dropped constraint: chats_sender_id_fkey';
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'chats_receiver_id_fkey' 
        AND table_name = 'chats'
    ) THEN
        ALTER TABLE chats DROP CONSTRAINT chats_receiver_id_fkey;
        RAISE NOTICE 'Dropped constraint: chats_receiver_id_fkey';
    END IF;

    -- Drop notifications table foreign keys
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'notifications_user_id_fkey' 
        AND table_name = 'notifications'
    ) THEN
        ALTER TABLE notifications DROP CONSTRAINT notifications_user_id_fkey;
        RAISE NOTICE 'Dropped constraint: notifications_user_id_fkey';
    END IF;
END $$;

-- Step 2: Drop indexes (if any exist)
DROP INDEX IF EXISTS idx_chats_sender_id;
DROP INDEX IF EXISTS idx_chats_receiver_id;
DROP INDEX IF EXISTS idx_chats_created_at;
DROP INDEX IF EXISTS idx_notifications_user_id;
DROP INDEX IF EXISTS idx_notifications_is_read;
DROP INDEX IF EXISTS idx_notifications_created_at;

-- Step 3: Drop sequences associated with the tables
DROP SEQUENCE IF EXISTS chats_chat_id_seq CASCADE;
DROP SEQUENCE IF EXISTS notifications_notification_id_seq CASCADE;

-- Step 4: Drop the tables
DROP TABLE IF EXISTS chats CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;

-- Step 5: Verify removal
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chats') THEN
        RAISE NOTICE '✓ Table "chats" successfully removed';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') THEN
        RAISE NOTICE '✓ Table "notifications" successfully removed';
    END IF;
END $$;

-- Success message
SELECT 'Chat and notification tables have been successfully removed!' AS status;

-- ====================================================================
-- Post-Migration Notes:
-- ====================================================================
-- 1. The chats table stored all messenger/chat functionality
-- 2. The notifications table stored system notifications
-- 3. Both features have been completely removed from:
--    - Backend: ChatService, NotificationService, routes, controllers
--    - Frontend: messenger.html, notification buttons, related UI
-- 4. The application now focuses on core tutoring functionality:
--    - Session booking and management
--    - Study materials
--    - Feedback system
--    - User profiles
-- 5. If you need to restore these features in the future, you can:
--    - Restore from backup before running this migration
--    - Recreate the tables using the schema in database-schema.sql
-- ====================================================================
