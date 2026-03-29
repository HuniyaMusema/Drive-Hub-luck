const pool = require('../config/pgPool');
const SettingsManager = require('../services/SettingsManager');

// @desc    Participate in the lottery (Assign specific chosen numbers)
// @route   POST /api/lottery/participate
// @access  Private
const participateLottery = async (req, res) => {
  const { numbers } = req.body; // Array of chosen numbers

  if (!numbers || !Array.isArray(numbers) || numbers.length === 0) {
    return res.status(400).json({ message: 'Please select at least one number.' });
  }

  const client = await pool.connect();

  try {
    const lotteryModuleEnabled = SettingsManager.getSetting('lotteryModuleEnabled', true);
    if (!lotteryModuleEnabled) {
      return res.status(403).json({ message: 'Lottery module is currently disabled' });
    }

    await client.query('BEGIN');

    // 1. Get the current active lottery
    const { rows: lotteryRows } = await client.query(
      "SELECT id FROM lottery_settings WHERE status = 'active' LIMIT 1 FOR SHARE"
    );

    if (lotteryRows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'No active lottery currently running.' });
    }
    const lotteryId = lotteryRows[0].id;

    // 2. Check availability of EVERY chosen number
    const { rows: matched } = await client.query(
      `SELECT id, number FROM lottery_numbers 
       WHERE lottery_id = $1 AND number = ANY($2::int[]) AND status = 'available'
       FOR UPDATE`,
      [lotteryId, numbers]
    );

    if (matched.length !== numbers.length) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        message: 'One or more selected numbers are no longer available.',
        availableFound: matched.map(m => m.number)
      });
    }

    // 3. Update status to 'pending' (waiting for payment)
    await client.query(
      `UPDATE lottery_numbers 
       SET user_id = $1, status = 'pending', updated_at = NOW() 
       WHERE lottery_id = $2 AND number = ANY($3::int[])`,
      [req.user.id, lotteryId, numbers]
    );

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Numbers reserved. Please complete payment.',
      numbers: numbers
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[participateLottery]', error.message);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
};

const getTakenNumbers = async (req, res) => {
  try {
    const { rows: lotteryRows } = await pool.query(
      "SELECT id FROM lottery_settings WHERE status = 'active' LIMIT 1"
    );

    if (lotteryRows.length === 0) {
      return res.status(200).json([]);
    }

    const { rows } = await pool.query(
      "SELECT number FROM lottery_numbers WHERE lottery_id = $1 AND status != 'available'",
      [lotteryRows[0].id]
    );

    res.json(rows.map(r => r.number));
  } catch (error) {
    console.error('[getTakenNumbers]', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

const submitLotteryPayment = async (req, res) => {
  const { lotteryNumberId, receiptUrl, method } = req.body;

  if (!lotteryNumberId || !receiptUrl || !method) {
    return res.status(400).json({ message: 'Missing required payment details.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Verify the number belongs to the user and is pending
    const { rows: numbers } = await client.query(
      "SELECT id FROM lottery_numbers WHERE id = $1 AND user_id = $2 AND status = 'pending'",
      [lotteryNumberId, req.user.id]
    );

    if (numbers.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Invalid ticket or ticket not in pending state.' });
    }

    // 2. Create the payment record
    await client.query(
      `INSERT INTO payments (user_id, lottery_number_id, receipt_url, method, status)
       VALUES ($1, $2, $3, $4, 'pending')`,
      [req.user.id, lotteryNumberId, receiptUrl, method]
    );

    await client.query('COMMIT');
    res.status(201).json({ message: 'Payment receipt submitted successfully. Waiting for admin approval.' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[submitLotteryPayment]', error.message);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
};

// @desc    Get all lottery entries (joined with users)
// @route   GET /api/lottery
// @access  Private
const getLotteryEntries = async (req, res) => {
  try {
    let query = `
      SELECT ln.*, ls.prize_text, ls.status as lottery_status, u.name as user_name
      FROM lottery_numbers ln
      JOIN lottery_settings ls ON ln.lottery_id = ls.id
      JOIN users u ON ln.user_id = u.id
    `;
    let params = [];

    // If not admin/staff, only show current user's entries
    if (req.user.role !== 'admin' && req.user.role !== 'lottery_staff') {
      query += ` WHERE ln.user_id = $1`;
      params.push(req.user.id);
    }

    query += ` ORDER BY ln.updated_at DESC`;

    const { rows } = await pool.query(query, params);
    res.status(200).json(rows);
  } catch (error) {
    console.error('[getLotteryEntries]', error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Pick a winner (Admin only)
// @route   PUT /api/lottery/pick-winner
// @access  Private/Admin
const pickWinner = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Find the active lottery
    const { rows: lotteryRows } = await client.query(
      "SELECT id FROM lottery_settings WHERE status = 'active' LIMIT 1 FOR UPDATE"
    );

    if (lotteryRows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'No active lottery found' });
    }

    const lotteryId = lotteryRows[0].id;

    // 2. Pick a random confirmed number from that lottery
    const { rows: winnerRows } = await client.query(
      `SELECT ln.*, u.name as user_name, u.email as user_email
       FROM lottery_numbers ln
       JOIN users u ON ln.user_id = u.id
       WHERE ln.lottery_id = $1 AND ln.status = 'confirmed'
       ORDER BY RANDOM()
       LIMIT 1`,
      [lotteryId]
    );

    if (winnerRows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'No participants found for this lottery' });
    }

    const winner = winnerRows[0];

    // 3. Update lottery status to closed
    await client.query(
      "UPDATE lottery_settings SET status = 'closed', updated_at = NOW() WHERE id = $1",
      [lotteryId]
    );

    await client.query('COMMIT');

    res.status(200).json({
      message: 'Winner picked successfully and lottery closed.',
      winner: {
        number: winner.number,
        name: winner.user_name,
        email: winner.user_email
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[pickWinner]', error.message);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
};

module.exports = {
  participateLottery,
  getLotteryEntries,
  pickWinner,
  getTakenNumbers,
  submitLotteryPayment,
};
