-- Migration: add_notification_updates.sql
-- Adds is_deleted column, enforces semantic type CHECK constraint,
-- updates type column default, creates composite partial index,
-- adds metadata JSONB column, adds reference_id for DB-level duplicate protection.
-- Idempotent: safe to run multiple times.

-- 1. Add is_deleted column if it doesn't already exist
ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;

-- 2. Drop old type check constraint if it exists, then add the new one
ALTER TABLE notifications
  DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE notifications
  ADD CONSTRAINT notifications_type_check
  CHECK (type IN (
    'registration',
    'payment_pending',
    'payment_approved',
    'payment_rejected',
    'ticket_assigned',
    'lottery_result',
    'reminder',
    'system_update'
  ));

-- 3. Update the type column default to 'system_update'
ALTER TABLE notifications
  ALTER COLUMN type SET DEFAULT 'system_update';

-- 4. Create composite partial index for efficient unread count queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON notifications(user_id, is_read, is_deleted)
  WHERE is_read = FALSE AND is_deleted = FALSE;

-- 5. Add metadata column for storing contextual data (payment_id, ticket number, etc.)
ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS metadata JSONB;

-- 6. Add reference_id for DB-level duplicate protection
--    Stores the related entity ID (payment_id, lottery_id, etc.)
ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS reference_id UUID;

-- 7. Unique partial index to prevent duplicate notifications per event
--    Prevents: same user + same type + same reference_id from being inserted twice
--    Only applies to non-deleted notifications (soft-deleted ones are excluded)
CREATE UNIQUE INDEX IF NOT EXISTS unique_notification_event
  ON notifications (user_id, type, reference_id)
  WHERE is_deleted = FALSE AND reference_id IS NOT NULL;
