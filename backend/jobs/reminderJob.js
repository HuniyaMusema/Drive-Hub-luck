const cron = require('node-cron');
const pool = require('../config/pgPool');
const SettingsManager = require('../services/SettingsManager');
const NotificationService = require('../services/NotificationService');

async function runReminderJob() {
  // Read threshold from settings, fall back to 24 hours
  const settings = SettingsManager.getSetting('Notifications', {});
  const thresholdHours =
    settings && settings.pendingPaymentThresholdHours != null
      ? settings.pendingPaymentThresholdHours
      : 24;

  let pendingPayments;
  try {
    const { rows } = await pool.query(
      `SELECT id, user_id FROM payments
       WHERE status = 'pending'
         AND created_at < NOW() - ($1 || ' hours')::INTERVAL`,
      [thresholdHours]
    );
    pendingPayments = rows;
  } catch (err) {
    console.error('[ReminderJob] Failed to query pending payments:', err.message);
    return;
  }

  for (const payment of pendingPayments) {
    try {
      const { rows: existing } = await pool.query(
        `SELECT 1 FROM notifications
         WHERE user_id = $1
           AND type = 'reminder'
           AND created_at > NOW() - INTERVAL '24 hours'`,
        [payment.user_id]
      );

      if (existing.length === 0) {
        await NotificationService.createNotification(
          payment.user_id,
          'Payment Reminder',
          'Reminder: Your payment is still pending. Please complete it to secure your lottery ticket.',
          'reminder',
          null,
          payment.id,
          { entity_type: 'payment', event_action: 'reminder_sent', payment_id: payment.id }
        );
      }
    } catch (err) {
      console.error(`[ReminderJob] Error processing payment ${payment.id}:`, err.message);
    }
  }
}

function start() {
  // Run every hour
  cron.schedule('0 * * * *', () => {
    console.log('[ReminderJob] Running reminder job...');
    runReminderJob().catch((err) =>
      console.error('[ReminderJob] Unhandled error:', err.message)
    );
  });
  console.log('[ReminderJob] Scheduled to run every hour.');
}

module.exports = { start, runReminderJob };
