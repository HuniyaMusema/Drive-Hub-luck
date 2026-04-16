const pool = require('../config/pgPool');
const { translate } = require('../utils/i18n');

const ALLOWED_TYPES = [
  'registration',
  'payment_pending',
  'payment_approved',
  'payment_rejected',
  'ticket_assigned',
  'lottery_result',
  'reminder',
  'system_update',
];

/**
 * @param {string} userId
 * @param {string} title
 * @param {string} message
 * @param {string} type          - must be in ALLOWED_TYPES
 * @param {object} [client]      - optional pg transaction client
 * @param {string} [referenceId] - optional UUID of the related entity (payment, lottery, etc.)
 *                                 When provided, the DB unique index prevents duplicate events.
 * @param {object} [metadata]    - optional JSONB payload (payment_id, ticket_number, etc.)
 */
const createNotification = async (userId, titleOrKey, messageOrKey, type, client = null, referenceId = null, metadata = null) => {
  if (!ALLOWED_TYPES.includes(type)) {
    console.error(`[NotificationService.createNotification] Invalid type: "${type}". Allowed types: ${ALLOWED_TYPES.join(', ')}`);
    return;
  }

  const db = client || pool;
  try {
    // 1. Get the user's language preference
    const userRes = await db.query('SELECT language FROM users WHERE id = $1', [userId]);
    const lang = userRes.rows[0]?.language || 'en';

    // 2. Translate the title and message using i18n utility
    // We pass metadata as interpolation parameters (e.g. for {rejection_reason})
    const title = translate(lang, titleOrKey, metadata || {});
    const message = translate(lang, messageOrKey, metadata || {});

    await db.query(
      `INSERT INTO notifications (user_id, title, message, type, reference_id, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id, type, reference_id)
       WHERE is_deleted = FALSE AND reference_id IS NOT NULL
       DO NOTHING`,
      [userId, title, message, type, referenceId, metadata ? JSON.stringify(metadata) : null]
    );
  } catch (error) {
    console.error('[NotificationService.createNotification]', error.message);
  }
};

const notifyAdminsAndStaff = async (title, message, type, client = null) => {
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
  ALLOWED_TYPES,
  createNotification,
  notifyAdminsAndStaff,
};
