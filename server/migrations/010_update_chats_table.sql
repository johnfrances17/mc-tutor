-- ===================================
-- Migration: Update Chats Table Schema
-- Date: 2025-12-07
-- Description: Add read tracking and constraint
-- ===================================

-- Step 1: Add read_at column
ALTER TABLE chats ADD COLUMN IF NOT EXISTS read_at TIMESTAMP;

-- Step 2: Add constraint to prevent self-messaging
ALTER TABLE chats 
  DROP CONSTRAINT IF EXISTS check_different_chat_users;

ALTER TABLE chats 
  ADD CONSTRAINT check_different_chat_users 
  CHECK (sender_id != receiver_id);

-- Step 3: Create indexes
CREATE INDEX IF NOT EXISTS idx_chats_sender ON chats(sender_id);
CREATE INDEX IF NOT EXISTS idx_chats_receiver ON chats(receiver_id);
CREATE INDEX IF NOT EXISTS idx_chats_created ON chats(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chats_unread ON chats(receiver_id, is_read) WHERE is_read = FALSE;

-- Step 4: Create composite index for conversation retrieval
CREATE INDEX IF NOT EXISTS idx_chats_conversation ON chats(sender_id, receiver_id, created_at DESC);

COMMENT ON TABLE chats IS 'One-to-one chat messages between users';
COMMENT ON COLUMN chats.is_read IS 'Whether message has been read by receiver';
COMMENT ON COLUMN chats.read_at IS 'Timestamp when message was read';
