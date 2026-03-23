const pool = require('../config/pgPool');

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all pending payments with user & lottery number details
// @route   GET /api/admin/payments/pending
// @access  Private / Admin
// ─────────────────────────────────────────────────────────────────────────────
const getPendingPayments = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT
         p.id             AS payment_id,
         u.name           AS user_name,
         u.email          AS user_email,
         ln.number        AS lottery_number,
         p.receipt_url,
         p.method         AS payment_method,
         p.created_at
       FROM   payments p
       JOIN   users          u  ON u.id  = p.user_id
       JOIN   lottery_numbers ln ON ln.id = p.lottery_number_id
       WHERE  p.status = 'pending'
       ORDER  BY p.created_at ASC`
    );

    return res.status(200).json({
      count: rows.length,
      payments: rows,
    });
  } catch (error) {
    console.error('[getPendingPayments]', error.message);
    return res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Approve a pending payment & confirm the linked lottery number
// @route   PUT /api/admin/payments/:id/approve
// @access  Private / Admin
// ─────────────────────────────────────────────────────────────────────────────
const approvePayment = async (req, res) => {
  const { id } = req.params;        // payment_id
  const adminId = req.user.id;      // from JWT via protect middleware

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // ── 1. Fetch payment (must exist and still be pending) ──────────────────
    const { rows } = await client.query(
      `SELECT id, status, lottery_number_id
       FROM   payments
       WHERE  id = $1`,
      [id]
    );

    if (rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Payment not found.' });
    }

    if (rows[0].status !== 'pending') {
      await client.query('ROLLBACK');
      return res.status(400).json({
        message: `Payment is already '${rows[0].status}' and cannot be approved again.`,
      });
    }

    const { lottery_number_id } = rows[0];

    // ── 2. Approve the payment ──────────────────────────────────────────────
    const { rows: updatedPayment } = await client.query(
      `UPDATE payments
       SET    status      = 'approved',
              reviewed_by = $1,
              reviewed_at = NOW(),
              updated_at  = NOW()
       WHERE  id = $2
       RETURNING id, status, reviewed_by, reviewed_at`,
      [adminId, id]
    );

    // ── 3. Confirm the linked lottery number ────────────────────────────────
    await client.query(
      `UPDATE lottery_numbers
       SET    status     = 'confirmed',
              updated_at = NOW()
       WHERE  id = $1`,
      [lottery_number_id]
    );

    await client.query('COMMIT');

    return res.status(200).json({
      message: 'Payment approved and lottery number confirmed.',
      payment: updatedPayment[0],
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[approvePayment]', error.message);
    return res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Reject a pending payment & release the linked lottery number
// @route   PUT /api/admin/payments/:id/reject
// @access  Private / Admin
// ─────────────────────────────────────────────────────────────────────────────
const rejectPayment = async (req, res) => {
  const { id } = req.params;
  const adminId = req.user.id;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // ── 1. Fetch payment (must exist and still be pending) ──────────────────
    const { rows } = await client.query(
      `SELECT id, status, lottery_number_id
       FROM   payments
       WHERE  id = $1`,
      [id]
    );

    if (rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Payment not found.' });
    }

    if (rows[0].status !== 'pending') {
      await client.query('ROLLBACK');
      return res.status(400).json({
        message: `Payment is already '${rows[0].status}' and cannot be rejected.`,
      });
    }

    const { lottery_number_id } = rows[0];

    // ── 2. Reject the payment ───────────────────────────────────────────────
    const { rows: updatedPayment } = await client.query(
      `UPDATE payments
       SET    status      = 'rejected',
              reviewed_by = $1,
              reviewed_at = NOW(),
              updated_at  = NOW()
       WHERE  id = $2
       RETURNING id, status, reviewed_by, reviewed_at`,
      [adminId, id]
    );

    // ── 3. Release the lottery number back to available ─────────────────────
    await client.query(
      `UPDATE lottery_numbers
       SET    status     = 'available',
              user_id    = NULL,
              updated_at = NOW()
       WHERE  id = $1`,
      [lottery_number_id]
    );

    await client.query('COMMIT');

    return res.status(200).json({
      message: 'Payment rejected and lottery number released.',
      payment: updatedPayment[0],
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[rejectPayment]', error.message);
    return res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
};

module.exports = {
  getPendingPayments,
  approvePayment,
  rejectPayment,
};
