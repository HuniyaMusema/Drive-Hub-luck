# Implementation Plan: Notification System

## Overview

Extend the existing notification infrastructure to enforce semantic types, soft-delete, and correct transactional wiring across all lifecycle events. The work is split into: DB migration, backend service/controller hardening, controller integration points, background jobs, and frontend polish.

## Tasks

- [x] 1. DB schema migration — add `is_deleted`, CHECK constraint, and composite index
  - Run `ALTER TABLE notifications ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE`
  - Drop any existing `notifications_type_check` constraint, then add the new CHECK constraint for the 8 allowed types: `registration`, `payment_pending`, `payment_approved`, `payment_rejected`, `ticket_assigned`, `lottery_result`, `reminder`, `system_update`
  - Change the column default: `ALTER COLUMN type SET DEFAULT 'system_update'`
  - Create `idx_notifications_user_unread` composite partial index on `(user_id, is_read, is_deleted) WHERE is_read = FALSE AND is_deleted = FALSE`
  - Write the migration as `backend/database/add_notification_updates.sql` so it is idempotent (`IF NOT EXISTS`, `DROP CONSTRAINT IF EXISTS`)
  - _Requirements: 10.1, 10.4, 13.1, 13.3_

- [x] 2. Harden `NotificationService`
  - [x] 2.1 Add `ALLOWED_TYPES` constant and type-guard in `createNotification`
    - Define `ALLOWED_TYPES` array with all 8 semantic type strings
    - At the top of `createNotification`, check `ALLOWED_TYPES.includes(type)`; if not, `console.error` and `return` without querying the DB
    - Remove the `emailEnabled` gate that currently skips in-app notifications (notifications are independent of email)
    - Update `notifyAdminsAndStaff` to remove the `adminAlertLargePayment` / `adminAlertSuspicious` / `emailEnabled` guards — those belong to the email service, not in-app notifications
    - _Requirements: 13.1, 13.2_

  - [ ]* 2.2 Write property test for `createNotification` type validation (Property 14)
    - **Property 14: Notification type validation rejects invalid types**
    - **Validates: Requirements 13.1, 13.2**
    - Use `fast-check` to generate arbitrary strings not in `ALLOWED_TYPES`; assert no DB insert is called and the function returns without throwing
    - Tag: `// Feature: notification-system, Property 14: type validation rejects invalid types`

  - [ ]* 2.3 Write unit tests for `NotificationService`
    - Test `createNotification` with each of the 8 valid types — assert DB insert is called
    - Test `createNotification` with invalid type — assert DB insert is NOT called
    - Test `notifyAdminsAndStaff` fans out to all admin/lottery_staff rows
    - _Requirements: 13.1, 13.2_

- [x] 3. Update `notificationController` — filter `is_deleted`, add soft-delete
  - [x] 3.1 Update `getUserNotifications` to filter `is_deleted = FALSE`
    - Change the SELECT query to add `AND is_deleted = FALSE` to the WHERE clause
    - Ensure ordering is `created_at DESC`
    - _Requirements: 8.1, 8.2, 8.3, 10.3_

  - [x] 3.2 Update `markAsRead` to respect `is_deleted`
    - Add `AND is_deleted = FALSE` to the UPDATE WHERE clause so deleted notifications return 404
    - _Requirements: 9.1, 9.2_

  - [x] 3.3 Update `markAllAsRead` to filter `is_deleted = FALSE`
    - Add `AND is_deleted = FALSE` to the UPDATE WHERE clause
    - _Requirements: 9.3_

  - [x] 3.4 Change `deleteNotification` from hard-delete to soft-delete
    - Replace `DELETE FROM notifications` with `UPDATE notifications SET is_deleted = TRUE, updated_at = NOW()`
    - Keep the `user_id = $2` scope check; return 404 if `rowCount === 0`
    - _Requirements: 10.1, 10.2, 10.4_

  - [ ]* 3.5 Write property tests for controller isolation and soft-delete (Properties 9, 11, 12)
    - **Property 9: Notification retrieval excludes deleted notifications and is user-scoped**
    - **Validates: Requirements 8.1, 8.3, 10.3, 14.3**
    - **Property 11: Mark-as-read and mark-all-as-read are correct and user-scoped**
    - **Validates: Requirements 9.1, 9.2, 9.3**
    - **Property 12: Soft delete sets is_deleted without removing the row**
    - **Validates: Requirements 10.1, 10.2, 10.4**
    - Use `fast-check` to generate multi-user notification sets with mixed `is_deleted` values; mock the pool and assert correct SQL filters and 404 paths
    - Tag: `// Feature: notification-system, Property 9/11/12`

  - [ ]* 3.6 Write property test for response shape (Property 10)
    - **Property 10: Notification response contains all required fields**
    - **Validates: Requirements 8.2**
    - Generate random notification rows; assert every returned object has `id`, `title`, `message`, `type`, `is_read`, `created_at`
    - Tag: `// Feature: notification-system, Property 10: response shape`

- [x] 4. Checkpoint — ensure DB migration and controller tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Wire notification calls into `authController`
  - [x] 5.1 Add welcome notification in `registerUser` after successful user insert
    - After the `INSERT INTO users` succeeds and `user.id` is available, call `NotificationService.createNotification(user.id, 'Welcome to Gech Car Lottery', 'Your account has been created successfully. Welcome to the Gech Car Lottery!', 'registration')`
    - This call uses the default pool (no transaction client needed here)
    - _Requirements: 1.1, 1.2, 1.3_

  - [ ]* 5.2 Write property test for registration notification (Property 1)
    - **Property 1: Registration notification is created for every new user**
    - **Validates: Requirements 1.1, 1.3**
    - Use `fast-check` to generate random user IDs; mock the DB insert and assert `createNotification` is called with `type='registration'` and the correct title/message
    - Tag: `// Feature: notification-system, Property 1: registration notification`

- [x] 6. Wire notification calls into `lotteryController.submitLotteryPayment`
  - [x] 6.1 Update the user notification call to use `payment_pending` type
    - Change the existing `createNotification` call type from `'info'` to `'payment_pending'`
    - Update title to `'Payment Under Review'` and message to `'Your payment is under review'`
    - _Requirements: 2.1_

  - [x] 6.2 Update the admin notification call to use `payment_pending` type
    - Change the existing `notifyAdminsAndStaff` call type from `'info'` to `'payment_pending'`
    - Keep title `'New Payment Pending'` and the existing descriptive message
    - _Requirements: 2.2_

  - [ ]* 6.3 Write property test for payment submission notifications (Property 2)
    - **Property 2: Payment submission creates notifications for user and all admins**
    - **Validates: Requirements 2.1, 2.2**
    - Use `fast-check` to generate random user + admin sets; assert both user and every admin/staff receive a `payment_pending` notification
    - Tag: `// Feature: notification-system, Property 2: payment submission notifications`

- [x] 7. Wire notification calls into `adminLotteryController`
  - [x] 7.1 Update `verifyPayment` — replace `'success'` type with `'payment_approved'` and add `ticket_assigned` notification
    - Change the existing `createNotification` call type from `'success'` to `'payment_approved'`
    - Update title to `'Payment Approved'` and message to `'Your lottery number is confirmed'`
    - After the `payment_approved` notification, add a second `createNotification` call for the same `payment.user_id` with type `'ticket_assigned'`, title `'Ticket Assigned'`, message `'Your lottery ticket number has been assigned.'`, passing the same `client`
    - Both calls must be within the existing transaction
    - _Requirements: 3.1, 4.1, 4.2_

  - [x] 7.2 Update `rejectPayment` — replace `'error'` type with `'payment_rejected'`
    - Change the existing `createNotification` call type from `'error'` to `'payment_rejected'`
    - Update title to `'Payment Rejected'` and message to `'Your payment was rejected. Please try again'`
    - _Requirements: 3.2_

  - [x] 7.3 Update `pickWinner` — notify all confirmed participants with `lottery_result`
    - After closing the lottery (before `COMMIT`), query all confirmed lottery numbers for `lotteryId`: `SELECT user_id FROM lottery_numbers WHERE lottery_id = $1 AND status = 'confirmed'`
    - For each participant, call `NotificationService.createNotification(participant.user_id, 'Lottery Draw Completed', 'Winner has been selected', 'lottery_result', client)`
    - If the confirmed participants query returns zero rows, skip the loop (no notifications)
    - _Requirements: 5.1, 5.2, 5.3_

  - [ ]* 7.4 Write property tests for payment decision and lottery draw notifications (Properties 3, 4, 5)
    - **Property 3: Payment decision creates correct notification for payment owner**
    - **Validates: Requirements 3.1, 3.2**
    - **Property 4: Ticket confirmation creates ticket_assigned notification**
    - **Validates: Requirements 4.1, 4.2**
    - **Property 5: Lottery draw notifies all confirmed participants**
    - **Validates: Requirements 5.1, 5.2, 5.3**
    - Use `fast-check` to generate random payment/user pairs and participant sets; assert correct notification types and that empty participant sets produce zero notifications
    - Tag: `// Feature: notification-system, Property 3/4/5`

- [x] 8. Checkpoint — ensure integration wiring tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Implement `ReminderJob` (`backend/jobs/reminderJob.js`)
  - [x] 9.1 Create the job file with cron scheduling
    - Create `backend/jobs/reminderJob.js`
    - Import `node-cron` (or `node-schedule`), `pool`, `SettingsManager`, and `NotificationService`
    - Schedule the job to run every hour (configurable via cron expression)
    - _Requirements: 6.1, 6.3_

  - [x] 9.2 Implement the reminder logic
    - On each tick, read `Notifications.pendingPaymentThresholdHours` from `SettingsManager`; fall back to `24` if null/undefined
    - Query payments with `status = 'pending'` created more than `thresholdHours` ago
    - For each payment, check that no `reminder` notification exists for that `user_id` in the last 24 hours: `SELECT 1 FROM notifications WHERE user_id = $1 AND type = 'reminder' AND created_at > NOW() - INTERVAL '24 hours'`
    - If no recent reminder exists, call `NotificationService.createNotification(userId, 'Payment Reminder', 'Reminder: Your payment is still pending. Please complete it to secure your lottery ticket.', 'reminder')`
    - Wrap each payment in a try/catch; log errors and continue to the next payment
    - _Requirements: 6.1, 6.2, 6.4_

  - [x] 9.3 Register `ReminderJob` in `backend/server.js`
    - Import and start the job after `SettingsManager.loadSettings()` resolves
    - _Requirements: 6.1_

  - [ ]* 9.4 Write property tests for `ReminderJob` (Properties 6, 7)
    - **Property 6: Reminder job only notifies eligible pending payments**
    - **Validates: Requirements 6.1, 6.4**
    - **Property 7: Reminder job is idempotent within a 24-hour window**
    - **Validates: Requirements 6.2**
    - Use `fast-check` to generate random pending payments at varying ages above/below threshold; assert only eligible ones get reminders and running the job twice produces exactly one reminder per payment
    - Tag: `// Feature: notification-system, Property 6/7`

- [x] 10. Implement `AutoPaymentJob` (`backend/jobs/autoPaymentJob.js`)
  - [x] 10.1 Create the job file with cron scheduling driven by `SettingsManager`
    - Create `backend/jobs/autoPaymentJob.js`
    - Import `node-cron`, `pool`, `SettingsManager`, and `NotificationService`
    - Read `Notifications.autoPaymentIntervalMinutes` from `SettingsManager`; fall back to `60`
    - Schedule the cron to run at the configured interval
    - _Requirements: 7.2, 7.3_

  - [x] 10.2 Implement the auto-processing logic
    - On each tick, re-read `Notifications.autoPaymentIntervalMinutes` from `SettingsManager` (single source of truth)
    - Query payments with `status = 'pending'` older than `intervalMinutes` minutes
    - For each payment, within a transaction: update the payment status (auto-approve per business rule), then call `NotificationService.createNotification(userId, 'Payment Status Updated', 'Your payment status has been updated. Please check your lottery ticket status.', 'system_update', client)`
    - Before creating the notification, check that no `system_update` notification exists for that `user_id` for the same payment event (use `details` or a time-window guard) to prevent duplicates
    - Wrap each payment in a try/catch; log errors and continue
    - _Requirements: 7.1, 7.3, 7.4, 7.5_

  - [x] 10.3 Register `AutoPaymentJob` in `backend/server.js`
    - Import and start the job after `SettingsManager.loadSettings()` resolves
    - _Requirements: 7.2_

  - [ ]* 10.4 Write property test for `AutoPaymentJob` (Property 8)
    - **Property 8: Auto-payment job creates system_update notification for each processed payment**
    - **Validates: Requirements 7.1, 7.4**
    - Use `fast-check` to generate random pending payments; run the job logic twice; assert exactly one `system_update` notification per payment
    - Tag: `// Feature: notification-system, Property 8: auto-payment job idempotency`

- [x] 11. Checkpoint — ensure job tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 12. Update `notificationService.ts` — align types with semantic schema
  - Replace the `type` union in the `Notification` interface from `'info' | 'success' | 'warning' | 'error'` to the 8 semantic types: `'registration' | 'payment_pending' | 'payment_approved' | 'payment_rejected' | 'ticket_assigned' | 'lottery_result' | 'reminder' | 'system_update'`
  - Export the `NotificationType` union type for use in components
  - No changes needed to the four API functions — they are already correct
  - _Requirements: 13.1_

- [x] 13. Update `NotificationBell.tsx` — verify badge logic matches spec
  - Confirm the `unreadCount > 9 ? '9+' : unreadCount` badge logic is present (it already is)
  - Confirm the badge is only rendered when `unreadCount > 0` (it already is via `{unreadCount > 0 && ...}`)
  - Confirm the polling interval is `15000` ms (it already is)
  - No code changes needed unless any of the above are missing
  - _Requirements: 11.1, 11.2, 11.3, 11.4_

  - [ ]* 13.1 Write property test for `NotificationBell` badge logic (Property 13)
    - **Property 13: Unread count badge displays correct value**
    - **Validates: Requirements 11.1, 11.2, 11.4**
    - Use `fast-check` to generate integer counts in range 0–100; render the badge logic and assert: count=0 → no badge, 1–9 → exact number, >9 → `"9+"`
    - Tag: `// Feature: notification-system, Property 13: unread count badge`

- [x] 14. Update `NotificationsPage` (`frontend/src/pages/Notifications.tsx`) — semantic type icons
  - Update the `getIcon` function to handle all 8 semantic types instead of the old `info/success/warning/error` set:
    - `registration` → `UserCheck` icon, teal color
    - `payment_pending` → `Clock` icon, amber color
    - `payment_approved` → `CheckCircle2` icon, green color
    - `payment_rejected` → `XCircle` icon, destructive color
    - `ticket_assigned` → `Ticket` icon, teal color
    - `lottery_result` → `Trophy` icon, gold color
    - `reminder` → `Bell` icon, amber color
    - `system_update` → `Info` icon, slate color
  - Update the `Notification` import to use the updated type from `notificationService.ts`
  - _Requirements: 12.2, 12.3, 12.4, 12.5_

  - [ ]* 14.1 Write unit tests for `NotificationsPage` rendering
    - Test that each of the 8 notification types renders the correct icon
    - Test that unread notifications have the highlighted style and read ones have the muted style
    - Test that "Mark as read", "Mark all as read", and "Delete" controls are present
    - _Requirements: 12.2, 12.3, 12.4, 12.5_

- [x] 15. Final checkpoint — ensure all tests pass end-to-end
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests use `fast-check` with a minimum of 100 iterations each
- The DB migration file (`add_notification_updates.sql`) must be run manually against the database before starting the backend
- Background jobs (`ReminderJob`, `AutoPaymentJob`) require `node-cron` — add to `backend/package.json` if not already present
- The `NotificationBell` and `Notifications.tsx` already have correct polling and badge logic; tasks 13 and 14 are primarily type-alignment and icon updates
