const cron = require('node-cron');
const pool = require('../config/pgPool');
const SettingsManager = require('../services/SettingsManager');
const NotificationService = require('../services/NotificationService');

async function runAutoPaymentJob() {
  // Re-read interval on each tick — SettingsManager is the single source of truth
  const settings = SettingsManager.getSetting('Notifications', {});
  const intervalMinutes =
    settings && settings.autoPaymentIntervalMinutes != null
      ? settings.autoPaymentIntervalMinutes
      : 60;

  let pendingPayments;
  try {
    const { rows } = await pool.query(
      `SELECT id, user_id FROM payments
       WHERE status = 'pending'
         AND created_at < NOW() - ($1 || ' minutes')::INTERVAL`,
      [intervalMinutes]
    );
    pendingPayments = rows;
  } catch (err) {
    console.error('[AutoPaymentJob] Failed to query pending payments:', err.message);
    return;
  }

  for (const payment of pendingPayments) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Auto-approve the payment
      await client.query(
        `UPDATE payments SET status = 'approved', updated_at = NOW() WHERE id = $1`,
        [payment.id]
      );

      // Time-window guard: check for a recent system_update notification for this user
      const { rows: existing } = await client.query(
        `SELECT 1 FROM notifications
         WHERE user_id = $1
           AND type = 'system_update'
           AND created_at > NOW() - ($2 || ' minutes')::INTERVAL`,
        [payment.user_id, intervalMinutes]
      );

      if (existing.length === 0) {
        await NotificationService.createNotification(
          payment.user_id,
          'Payment Status Updated',
          'Your payment status has been updated. Please check your lottery ticket status.',
          'system_update',
          client,
          payment.id,
          { entity_type: 'payment', event_action: 'auto_processed', payment_id: payment.id }
        );
      }

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      console.error(`[AutoPaymentJob] Error processing payment ${payment.id}:`, err.message);
    } finally {
      client.release();
    }
  }
}

function start() {
  const settings = SettingsManager.getSetting('Notifications', {});
  const intervalMinutes =
    settings && settings.autoPaymentIntervalMinutes != null
      ? settings.autoPaymentIntervalMinutes
      : 60;

  // Convert minutes to a cron expression
  // e.g. 60 min → '0 * * * *', 30 min → '*/30 * * * *'
  let cronExpression;
  if (intervalMinutes >= 60 && intervalMinutes % 60 === 0) {
    cronExpression = '0 * * * *';
  } else {
    cronExpression = `*/${intervalMinutes} * * * *`;
  }

  cron.schedule(cronExpression, () => {
    console.log('[AutoPaymentJob] Running auto-payment job...');
    runAutoPaymentJob().catch((err) =>
      console.error('[AutoPaymentJob] Unhandled error:', err.message)
    );
  });

  console.log(`[AutoPaymentJob] Scheduled to run every ${intervalMinutes} minute(s) (cron: ${cronExpression}).`);
}

module.exports = { start, runAutoPaymentJob };
