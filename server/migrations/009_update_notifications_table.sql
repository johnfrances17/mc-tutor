-- ===================================
-- Migration: Update Notifications Table Schema
-- Date: 2025-12-07
-- Description: Add type constraints and related entity tracking
-- ===================================

-- Step 1: Add new columns
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS title VARCHAR(100);
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS related_id INTEGER;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS related_type VARCHAR(20);
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS read_at TIMESTAMP;

-- Step 2: Update existing notifications with default title
UPDATE notifications 
SET title = 'Notification'
WHERE title IS NULL;

-- Step 3: Add type constraint
ALTER TABLE notifications 
  DROP CONSTRAINT IF EXISTS check_notification_type;

ALTER TABLE notifications 
  ADD CONSTRAINT check_notification_type 
  CHECK (type IN (
    'session_request', 'session_approved', 'session_rejected', 
    'session_reminder', 'session_completed', 'new_material',
    'new_feedback', 'system_announcement'
  ));

-- Step 4: Add related_type constraint
ALTER TABLE notifications 
  DROP CONSTRAINT IF EXISTS check_related_type;

ALTER TABLE notifications 
  ADD CONSTRAINT check_related_type 
  CHECK (related_type IN ('session', 'material', 'feedback', 'user') OR related_type IS NULL);

-- Step 5: Create indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

COMMENT ON COLUMN notifications.type IS 'Notification category/event type';
COMMENT ON COLUMN notifications.related_id IS 'ID of related entity (session_id, material_id, etc.)';
COMMENT ON COLUMN notifications.related_type IS 'Type of related entity';
