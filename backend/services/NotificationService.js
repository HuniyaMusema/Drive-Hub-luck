const pool = require('../config/pgPool');

/**
 * Create a new notification for a specific user.
 * @param {string} userId - UUID of the user to notify.
 * @param {string} title - Brief title of the notification.
 * @param {string} message - Detailed notification message.
 * @param {string} type - Type of notification (info, success, warning, error).
 * @param {object} client - Optional database client for transaction support.
 */
const createNotification = async (userId, title, message, type = 'info', client = null) => {
  const db = client || pool;
  try {
    await db.query(
      `INSERT INTO notifications (user_id, title, message, type)
       VALUES ($1, $2, $3, $4)`,
      [userId, title, message, type]
    );
  } catch (error) {
    console.error('[NotificationService.createNotification]', error.message);
    // We don't throw here to avoid failing the main action if notification fails
  }
};

/**
 * Notify all admin and lottery staff users.
 * @param {string} title - Brief title of the notification.
 * @param {string} message - Detailed notification message.
 * @param {string} type - Type of notification.
 * @param {object} client - Optional database client.
 */
const notifyAdminsAndStaff = async (title, message, type = 'info', client = null) => {
  const db = client || pool;
  try {
    const { rows: admins } = await db.query(
      "SELECT id FROM users WHERE role IN ('admin', 'lottery_staff')"
    );

    for (const admin of admins) {
      await createNotification(admin.id, title, message, type, db);
    }
  } catch (error) {
    console.error('[NotificationService.notifyAdminsAndStaff]', error.message);
  }
};

module.exports = {
  createNotification,
  notifyAdminsAndStaff,
};
