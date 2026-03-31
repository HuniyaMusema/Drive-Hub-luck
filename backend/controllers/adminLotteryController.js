const pool = require('../config/pgPool');

// ─────────────────────────────────────────────────────────────────────────────
// Helper: fetch the current active lottery (used by multiple handlers)
// ─────────────────────────────────────────────────────────────────────────────
const fetchActiveLottery = async (client) => {
  const { rows } = await (client || pool).query(
    `SELECT ls.*, c.name AS prize_car_name
     FROM   lottery_settings ls
     LEFT JOIN cars c ON c.id = ls.prize_car_id
     WHERE  ls.status = 'active'
     ORDER  BY ls.created_at DESC
     LIMIT  1`
  );
  return rows[0] || null;
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper: create an audit log entry
// ─────────────────────────────────────────────────────────────────────────────
const createAuditLog = async (client, action_type, performed_by, target_id, details) => {
  await client.query(
    `INSERT INTO audit_logs (action_type, performed_by, target_id, details)
     VALUES ($1, $2, $3, $4)`,
    [action_type, performed_by, target_id, details ? JSON.stringify(details) : null]
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Create a new lottery + bulk-generate lottery numbers
// @route   POST /api/admin/lottery
// @access  Private / Admin
// ─────────────────────────────────────────────────────────────────────────────
const createLottery = async (req, res) => {
  const { start_number, end_number, prize_text, prize_car_id } = req.body;

  // ── Validation ─────────────────────────────────────────────────────────────
  if (start_number === undefined || end_number === undefined) {
    return res
      .status(400)
      .json({ message: 'start_number and end_number are required.' });
  }

  const start = parseInt(start_number, 10);
  const end   = parseInt(end_number,   10);

  if (isNaN(start) || isNaN(end)) {
    return res
      .status(400)
      .json({ message: 'start_number and end_number must be integers.' });
  }

  if (end < start) {
    return res.status(400).json({
      message: 'end_number must be greater than or equal to start_number.',
    });
  }

  if (!prize_text && !prize_car_id) {
    return res.status(400).json({
      message: 'A prize must be provided: either prize_text or prize_car_id.',
    });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // ── Guard: no active lottery already running ────────────────────────────
    const existing = await fetchActiveLottery(client);
    if (existing) {
      await client.query('ROLLBACK');
      return res.status(409).json({
        message:
          'An active lottery already exists. Stop it before creating a new one.',
        activeLottery: existing,
      });
    }

    // ── Insert lottery_settings row ────────────────────────────────────────
    const lotteryResult = await client.query(
      `INSERT INTO lottery_settings
         (start_number, end_number, prize_text, prize_car_id, status)
       VALUES ($1, $2, $3, $4, 'active')
       RETURNING *`,
      [start, end, prize_text || null, prize_car_id || null]
    );
    const lottery = lotteryResult.rows[0];

    // ── Bulk-insert lottery_numbers for the full range ─────────────────────
    // Build a single multi-row INSERT for efficiency
    if (end - start + 1 > 0) {
      const values = [];
      const params = [];
      let   paramIdx = 1;

      for (let num = start; num <= end; num++) {
        values.push(`($${paramIdx}, $${paramIdx + 1}, 'available')`);
        params.push(lottery.id, num);
        paramIdx += 2;
      }

      await client.query(
        `INSERT INTO lottery_numbers (lottery_id, number, status)
         VALUES ${values.join(', ')}`,
        params
      );
    }

    await createAuditLog(client, 'LOTTERY_CREATED', req.user.id, lottery.id, { start, end });

    await client.query('COMMIT');

    return res.status(201).json({
      message: 'Lottery created successfully.',
      lottery,
      numbers_generated: end - start + 1,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[createLottery]', error.message);
    return res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get the current (most recent active) lottery with summary stats
// @route   GET /api/admin/lottery/current
// @access  Private / Admin
// ─────────────────────────────────────────────────────────────────────────────
const getCurrentLottery = async (req, res) => {
  try {
    // Active lottery details
    const { rows: lotteryRows } = await pool.query(
      `SELECT ls.*, c.name AS prize_car_name
       FROM   lottery_settings ls
       LEFT JOIN cars c ON c.id = ls.prize_car_id
       WHERE  ls.status = 'active'
       ORDER  BY ls.created_at DESC
       LIMIT  1`
    );

    if (lotteryRows.length === 0) {
      return res.status(404).json({ message: 'No active lottery found.' });
    }

    const lottery = lotteryRows[0];

    // Number stats for this lottery
    const { rows: statsRows } = await pool.query(
      `SELECT status, COUNT(*)::int AS count
       FROM   lottery_numbers
       WHERE  lottery_id = $1
       GROUP  BY status`,
      [lottery.id]
    );

    const stats = { available: 0, pending: 0, confirmed: 0 };
    statsRows.forEach(({ status, count }) => {
      stats[status] = count;
    });

    return res.status(200).json({ lottery, number_stats: stats });
  } catch (error) {
    console.error('[getCurrentLottery]', error.message);
    return res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Start (activate) a lottery by ID
// @route   PUT /api/admin/lottery/:id/start
// @access  Private / Admin
// ─────────────────────────────────────────────────────────────────────────────
const startLottery = async (req, res) => {
  const { id } = req.params;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Check the target lottery exists
    const { rows } = await client.query(
      `SELECT * FROM lottery_settings WHERE id = $1`,
      [id]
    );

    if (rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Lottery not found.' });
    }

    const target = rows[0];

    if (target.status === 'active') {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Lottery is already active.' });
    }

    // Ensure no other lottery is currently active
    const active = await fetchActiveLottery(client);
    if (active && active.id !== id) {
      await client.query('ROLLBACK');
      return res.status(409).json({
        message:
          'Another lottery is currently active. Stop it before starting this one.',
        activeLottery: active,
      });
    }

    const { rows: updated } = await client.query(
      `UPDATE lottery_settings
       SET    status = 'active', updated_at = NOW()
       WHERE  id = $1
       RETURNING *`,
      [id]
    );

    await client.query('COMMIT');

    return res.status(200).json({
      message: 'Lottery started successfully.',
      lottery: updated[0],
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[startLottery]', error.message);
    return res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Stop (close) a lottery by ID
// @route   PUT /api/admin/lottery/:id/stop
// @access  Private / Admin
// ─────────────────────────────────────────────────────────────────────────────
const stopLottery = async (req, res) => {
  const { id } = req.params;

  try {
    const { rows } = await pool.query(
      `SELECT * FROM lottery_settings WHERE id = $1`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Lottery not found.' });
    }

    if (rows[0].status === 'closed') {
      return res.status(400).json({ message: 'Lottery is already closed.' });
    }

    const { rows: updated } = await pool.query(
      `UPDATE lottery_settings
       SET    status = 'closed', updated_at = NOW()
       WHERE  id = $1
       RETURNING *`,
      [id]
    );

    return res.status(200).json({
      message: 'Lottery stopped successfully.',
      lottery: updated[0],
    });
  } catch (error) {
    console.error('[stopLottery]', error.message);
    return res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all lotteries (history)
// @route   GET /api/admin/lottery
// @access  Private / Admin
// ─────────────────────────────────────────────────────────────────────────────
const getAllLotteries = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT ls.*, c.name AS prize_car_name
       FROM   lottery_settings ls
       LEFT JOIN cars c ON c.id = ls.prize_car_id
       ORDER  BY ls.created_at DESC`
    );

    return res.status(200).json({ lotteries: rows });
  } catch (error) {
    console.error('[getAllLotteries]', error.message);
    return res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all lottery payments
// @route   GET /api/admin/lottery/payments
// @access  Private / Admin / LotteryStaff
// ─────────────────────────────────────────────────────────────────────────────
const getLotteryPayments = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT p.*, u.name as user_name, u.email as user_email, ln.number as ticket_number
       FROM payments p
       JOIN users u ON p.user_id = u.id
       JOIN lottery_numbers ln ON p.lottery_number_id = ln.id
       ORDER BY p.created_at DESC`
    );
    return res.status(200).json(rows);
  } catch (error) {
    console.error('[getLotteryPayments]', error.message);
    return res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Verify (approve) a lottery payment
// @route   POST /api/admin/lottery/payments/:id/verify
// @access  Private / Admin / LotteryStaff
// ─────────────────────────────────────────────────────────────────────────────
const verifyPayment = async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { rows } = await client.query('SELECT * FROM payments WHERE id = $1', [id]);
    if (rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (rows[0].status !== 'pending') {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: `Payment is already ${rows[0].status}` });
    }

    const payment = rows[0];

    // 1. Approve the payment
    const { rows: updated } = await client.query(
      `UPDATE payments 
       SET status = 'approved', reviewed_by = $1, reviewed_at = NOW(), updated_at = NOW()
       WHERE id = $2 
       RETURNING *`,
      [req.user.id, id]
    );

    // 2. CRITICAL: Lock the lottery number to this user (confirmed)
    await client.query(
      `UPDATE lottery_numbers
       SET status = 'confirmed', user_id = $1, updated_at = NOW()
       WHERE id = $2`,
      [payment.user_id, payment.lottery_number_id]
    );

    await createAuditLog(client, 'PAYMENT_VERIFIED', req.user.id, id, { status: 'approved', lottery_number_id: payment.lottery_number_id });

    await client.query('COMMIT');
    return res.status(200).json(updated[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[verifyPayment]', error.message);
    return res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Reject a lottery payment
// @route   POST /api/admin/lottery/payments/:id/reject
// @access  Private / Admin / LotteryStaff
// ─────────────────────────────────────────────────────────────────────────────
const rejectPayment = async (req, res) => {
  const { id } = req.params;
  const { rejection_reason } = req.body;

  if (!rejection_reason) {
    return res.status(400).json({ message: 'Rejection reason is required' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { rows } = await client.query('SELECT * FROM payments WHERE id = $1', [id]);
    if (rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Payment not found' });
    }

    const payment = rows[0];

    // 1. Reject the payment
    const { rows: updated } = await client.query(
      `UPDATE payments 
       SET status = 'rejected', reviewed_by = $1, reviewed_at = NOW(), rejection_reason = $2, updated_at = NOW()
       WHERE id = $3 
       RETURNING *`,
      [req.user.id, rejection_reason, id]
    );

    // 2. CRITICAL: Release the lottery number back to available so others can pick it
    await client.query(
      `UPDATE lottery_numbers
       SET status = 'available', user_id = NULL, updated_at = NOW()
       WHERE id = $1`,
      [payment.lottery_number_id]
    );

    await createAuditLog(client, 'PAYMENT_REJECTED', req.user.id, id, { reason: rejection_reason, lottery_number_id: payment.lottery_number_id });

    await client.query('COMMIT');
    return res.status(200).json(updated[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[rejectPayment]', error.message);
    return res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get lottery numbers history
// @route   GET /api/admin/lottery/numbers
// @access  Private / Admin / LotteryStaff
// ─────────────────────────────────────────────────────────────────────────────
const getLotteryNumbers = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT ln.*, u.name as assigned_to_name
       FROM lottery_numbers ln
       LEFT JOIN users u ON ln.user_id = u.id
       ORDER BY ln.number ASC`
    );
    return res.status(200).json(rows);
  } catch (error) {
    console.error('[getLotteryNumbers]', error.message);
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createLottery,
  getCurrentLottery,
  startLottery,
  stopLottery,
  getAllLotteries,
  getLotteryPayments,
  verifyPayment,
  rejectPayment,
  getLotteryNumbers,
};
