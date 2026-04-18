# Requirements Document

## Introduction

The Notification System for Gech Car Lottery keeps users informed about key lifecycle events: account creation, payment submission and review, lottery ticket assignment, lottery draw results, pending payment reminders, and automated payment status updates. Notifications are stored per user in a PostgreSQL `notifications` table and surfaced through a bell icon dropdown and a dedicated notifications page in the React frontend. The system builds on the existing `NotificationService`, `notificationController`, and `NotificationBell` component already present in the codebase.

---

## Glossary

- **Notification_System**: The end-to-end feature responsible for creating, storing, retrieving, and displaying notifications.
- **Notification_Service**: The backend service (`backend/services/NotificationService.js`) that writes notification records to the database.
- **Notification_Controller**: The backend controller (`backend/controllers/notificationController.js`) that exposes REST endpoints for notification management.
- **Notification_Bell**: The frontend component (`frontend/src/components/NotificationBell.tsx`) that displays the unread notification count and links to the notifications page.
- **Notifications_Page**: A dedicated frontend page where a user can view, mark as read, and delete their notifications.
- **Auth_Controller**: The backend controller (`backend/controllers/authController.js`) responsible for user registration and authentication.
- **Admin_Lottery_Controller**: The backend controller (`backend/controllers/adminLotteryController.js`) responsible for payment verification, rejection, and winner selection.
- **Lottery_Controller**: The backend controller (`backend/controllers/lotteryController.js`) responsible for payment submission by users.
- **Reminder_Job**: A scheduled cron job that runs periodically to send payment reminder notifications to users with pending payments.
- **Auto_Payment_Job**: A scheduled background job that automatically processes pending payments after a configured time interval and triggers the corresponding notification.
- **Settings_Manager**: The backend service (`backend/services/SettingsManager.js`) that reads and writes application configuration from the `app_settings` table.
- **User**: A registered account with role `user` in the `users` table.
- **Admin**: A registered account with role `admin` or `lottery_staff` in the `users` table.
- **Notification**: A record in the `notifications` table with fields: `id`, `user_id`, `title`, `message`, `type`, `is_read`, `is_deleted`, `created_at`, `updated_at`.
- **Notification_Type**: One of the following semantic string values stored in the `type` column: `registration`, `payment_pending`, `payment_approved`, `payment_rejected`, `ticket_assigned`, `lottery_result`, `reminder`, `system_update`.
- **Pending_Payment_Threshold**: A configurable duration (in hours or days) after which a user with an unreviewed payment receives a reminder notification. Stored in `app_settings` via Settings_Manager.
- **Auto_Payment_Interval**: A configurable duration (in minutes) after which the Auto_Payment_Job automatically processes pending payments. Stored in `app_settings` via Settings_Manager and shared as the single source of truth between the job and any related timing logic.
- **Soft_Delete**: Marking a notification record with `is_deleted = TRUE` rather than removing the row from the database.

---

## Requirements

### Requirement 1: User Registration Notification

**User Story:** As a new user, I want to receive a welcome notification immediately after my account is created, so that I know my registration was successful.

#### Acceptance Criteria

1. WHEN a user is successfully inserted into the `users` table via the registration endpoint, THE Notification_Service SHALL create a notification for that user with type `registration`, title `"Welcome to Gech Car Lottery"`, and message `"Your account has been created successfully. Welcome to the Gech Car Lottery!"`.
2. WHEN the user insertion into the `users` table fails or returns an error, THE Auth_Controller SHALL NOT create a welcome notification for that user.
3. THE Notification_Service SHALL store the welcome notification under the newly created user's `user_id` in the `notifications` table before the registration response is returned to the client.

---

### Requirement 2: Payment Submission Notification

**User Story:** As a user, I want to receive a notification when I upload a payment receipt, so that I know my payment is under review.

#### Acceptance Criteria

1. WHEN a user successfully submits a payment receipt via the payment submission endpoint, THE Notification_Service SHALL create a notification for that user with type `payment_pending`, title `"Payment Under Review"`, and message `"Your payment is under review"`.
2. WHEN a payment receipt is submitted, THE Notification_Service SHALL also create a notification for all Admins with type `payment_pending`, title `"New Payment Pending"`, and a message identifying the user and ticket number.
3. IF the payment submission fails before the database commit, THEN THE Notification_Service SHALL NOT persist any notification for that payment event.

---

### Requirement 3: Admin Payment Decision Notification

**User Story:** As a user, I want to receive a notification when an admin approves or rejects my payment, so that I know the outcome and can act accordingly.

#### Acceptance Criteria

1. WHEN an Admin approves a payment, THE Notification_Service SHALL create a notification for the payment owner with type `payment_approved`, title `"Payment Approved"`, and message `"Your lottery number is confirmed"`.
2. WHEN an Admin rejects a payment, THE Notification_Service SHALL create a notification for the payment owner with type `payment_rejected`, title `"Payment Rejected"`, and message `"Your payment was rejected. Please try again"`.
3. IF the payment approval or rejection database transaction is rolled back, THEN THE Notification_Service SHALL NOT persist the corresponding user notification.

---

### Requirement 4: Lottery Ticket Assignment Notification

**User Story:** As a user, I want to receive a notification when a lottery ticket number is assigned to me, so that I know my ticket is secured.

#### Acceptance Criteria

1. WHEN a lottery number's status is updated to `confirmed` for a user, THE Notification_Service SHALL create a notification for that user with type `ticket_assigned`, title `"Ticket Assigned"`, and message `"Your lottery ticket number has been assigned."`.
2. THE Notification_Service SHALL create the ticket assignment notification within the same database transaction that confirms the lottery number status.

---

### Requirement 5: Lottery Draw Completion Notification

**User Story:** As a participating user, I want to receive a notification when the lottery draw is completed, so that I know the winner has been selected.

#### Acceptance Criteria

1. WHEN the lottery draw is completed and a winner is selected via the pick-winner endpoint, THE Notification_Service SHALL create a notification for every user who holds a `confirmed` lottery number in that lottery, with type `lottery_result`, title `"Lottery Draw Completed"`, and message `"Winner has been selected"`.
2. THE Notification_Service SHALL create the draw completion notifications within the same database transaction that closes the lottery.
3. IF no confirmed participants exist at the time of the draw, THEN THE Notification_Service SHALL NOT create any draw completion notifications.

---

### Requirement 6: Pending Payment Reminder Notification

**User Story:** As a user who has not completed payment, I want to receive a reminder notification after a configurable period, so that I do not miss the deadline to secure my lottery ticket.

#### Acceptance Criteria

1. WHILE a user has a payment with status `pending` that was created more than `Pending_Payment_Threshold` ago, THE Reminder_Job SHALL create a notification for that user with type `reminder`, title `"Payment Reminder"`, and message `"Reminder: Your payment is still pending. Please complete it to secure your lottery ticket."`.
2. THE Reminder_Job SHALL run on a scheduled interval and SHALL NOT create duplicate reminder notifications for the same pending payment within the same 24-hour window.
3. WHERE the `Pending_Payment_Threshold` is configurable via application settings, THE Reminder_Job SHALL read the threshold value from Settings_Manager before each execution.
4. IF a payment's status changes from `pending` to `approved` or `rejected` before the reminder threshold is reached, THEN THE Reminder_Job SHALL NOT send a reminder notification for that payment.

---

### Requirement 7: Automated Pending Payment Processing Notification

**User Story:** As a user with a pending payment, I want to receive a notification when the system automatically processes my payment status, so that I know to check my ticket status.

#### Acceptance Criteria

1. WHEN the Auto_Payment_Job automatically updates a pending payment's status, THE Notification_Service SHALL immediately create a notification for the affected user with type `system_update`, title `"Payment Status Updated"`, and message `"Your payment status has been updated. Please check your lottery ticket status."`.
2. THE Auto_Payment_Job SHALL read the `Auto_Payment_Interval` value exclusively from Settings_Manager, which serves as the single source of truth for this timing configuration.
3. THE Auto_Payment_Job SHALL run as a background scheduled task and SHALL trigger the notification within the same processing cycle as the payment status update, with no additional delay.
4. THE Auto_Payment_Job SHALL NOT create duplicate notifications for the same payment auto-processing event.
5. IF the Auto_Payment_Job fails to update a payment's status, THEN THE Notification_Service SHALL NOT create a notification for that event.

---

### Requirement 8: Notification Retrieval

**User Story:** As a user, I want to retrieve my notifications sorted by newest first, so that I can see the most recent updates at the top.

#### Acceptance Criteria

1. WHEN a user requests their notifications, THE Notification_Controller SHALL return all notifications belonging to that user where `is_deleted` is `FALSE`, ordered by `created_at` descending.
2. THE Notification_Controller SHALL include the fields `id`, `title`, `message`, `type`, `is_read`, and `created_at` in each notification record returned.
3. WHEN a user requests their notifications, THE Notification_Controller SHALL return only notifications where `user_id` matches the authenticated user's `id`.

---

### Requirement 9: Mark Notification as Read

**User Story:** As a user, I want to mark individual notifications as read, so that I can track which updates I have already seen.

#### Acceptance Criteria

1. WHEN a user marks a notification as read, THE Notification_Controller SHALL update the `is_read` field to `TRUE` for that notification record.
2. IF the notification `id` does not exist, belongs to a different user, or has `is_deleted = TRUE`, THEN THE Notification_Controller SHALL return a 404 error response.
3. WHEN a user marks all notifications as read, THE Notification_Controller SHALL update `is_read` to `TRUE` for all notifications where `user_id` matches the authenticated user's `id`, `is_read` is `FALSE`, and `is_deleted` is `FALSE`.

---

### Requirement 10: Soft Delete Notification

**User Story:** As a user, I want to remove a notification from my list, so that I can keep my notification list clean without permanently destroying records.

#### Acceptance Criteria

1. WHEN a user deletes a notification, THE Notification_Controller SHALL set `is_deleted = TRUE` on that notification record rather than removing the row from the database.
2. IF the notification `id` does not exist or does not belong to the authenticated user, THEN THE Notification_Controller SHALL return a 404 error response.
3. WHEN a user requests their notifications, THE Notification_Controller SHALL exclude all notifications where `is_deleted` is `TRUE` from the response.
4. THE Notification_System SHALL retain soft-deleted notification records in the `notifications` table to preserve audit history and prevent accidental loss of critical system notifications.

---

### Requirement 11: Unread Count Display

**User Story:** As a user, I want to see a live unread notification count on the bell icon, so that I know at a glance if I have new notifications.

#### Acceptance Criteria

1. WHILE a user is authenticated and viewing any page, THE Notification_Bell SHALL display the count of notifications where `is_read` is `FALSE` and `is_deleted` is `FALSE` for that user.
2. WHEN the unread count exceeds 9, THE Notification_Bell SHALL display `"9+"` instead of the exact count.
3. THE Notification_Bell SHALL refresh the unread count by polling the server at a fixed interval of 15 seconds for the MVP release.
4. WHEN the unread count is 0, THE Notification_Bell SHALL NOT display a count badge.
5. WHERE a real-time transport (e.g., Supabase Realtime or WebSocket) becomes available in a future release, THE Notification_Bell SHALL be migrated from polling to event-driven updates to reduce unnecessary server load.

---

### Requirement 12: Notifications Page Display

**User Story:** As a user, I want a dedicated page to view all my notifications, so that I can review my full notification history.

#### Acceptance Criteria

1. WHEN a user navigates to the notifications page, THE Notifications_Page SHALL display all non-deleted notifications for the authenticated user sorted by `created_at` descending.
2. THE Notifications_Page SHALL visually distinguish unread notifications from read notifications.
3. THE Notifications_Page SHALL display the notification `type` visually (e.g., color-coded or icon-based) to differentiate `registration`, `payment_pending`, `payment_approved`, `payment_rejected`, `ticket_assigned`, `lottery_result`, `reminder`, and `system_update` notifications.
4. THE Notifications_Page SHALL provide controls to mark individual notifications as read and to mark all notifications as read at once.
5. THE Notifications_Page SHALL provide a control to soft-delete individual notifications.

---

### Requirement 13: Notification Type Enforcement

**User Story:** As a developer, I want all notifications to use a defined set of semantic types, so that the UI can render them consistently and future filtering is reliable.

#### Acceptance Criteria

1. THE Notification_Service SHALL only accept one of the following values for the `type` field when creating a notification: `registration`, `payment_pending`, `payment_approved`, `payment_rejected`, `ticket_assigned`, `lottery_result`, `reminder`, `system_update`.
2. IF a caller attempts to create a notification with a `type` value outside the allowed set, THEN THE Notification_Service SHALL reject the request and log an error without writing to the database.
3. THE Notification_System SHALL enforce the allowed type values at the database level via a CHECK constraint on the `notifications.type` column.

---

### Requirement 14: Data Isolation and Security

**User Story:** As a user, I want my notifications to be stored securely and only visible to me, so that my notification data is private.

#### Acceptance Criteria

1. THE Notification_System SHALL store all notifications in the `notifications` table with a `user_id` foreign key referencing the `users` table.
2. WHEN a user account is deleted, THE Notification_System SHALL cascade-delete all notification records belonging to that user.
3. THE Notification_Controller SHALL enforce that all read, update, and delete operations on notifications are scoped to the authenticated user's `user_id`.
4. THE Notification_System SHALL implement row-level security on the `notifications` table so that database-level queries cannot return notifications belonging to a different user.
