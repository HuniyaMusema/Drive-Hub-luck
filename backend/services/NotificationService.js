const pool = require('../config/pgPool');
const SettingsManager = require('../services/SettingsManager');

const createNotification = async (userId, title, message, type = 'info', client = null) => {
  // Respect emailEnabled setting — if disabled, skip in-app notifications too
  const notifications = SettingsManager.getSetting('Notifications', {});
  if (notifications.emailEnabled === false) return;

  const db = client || pool;
  try {
    await db.query(
      `INSERT INTO notifications (user_id, title, message, type)
       VALUES ($1, $2, $3, $4)`,
      [userId, title, message, type]
    );
  } catch (error) {
    console.error('[NotificationService.createNotification]', error.message);
  }
};

const notifyAdminsAndStaff = async (title, message, type = 'info', client = null) => {
  const notifications = SettingsManager.getSetting('Notifications', {});

  // Check alert-specific settings
  const isLargePaymentAlert = title.toLowerCase().includes('payment') || message.toLowerCase().includes('payment');
  const isSuspiciousAlert = type === 'warning' || type === 'error';

  if (isLargePaymentAlert && notifications.adminAlertLargePayment === false) return;
  if (isSuspiciousAlert && notifications.adminAlertSuspicious === false) return;
  if (notifications.emailEnabled === false) return;

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
