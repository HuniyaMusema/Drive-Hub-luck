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
    const { rows: reservedNumbers } = await client.query(
      `UPDATE lottery_numbers 
       SET user_id = $1, status = 'pending', updated_at = NOW() 
       WHERE lottery_id = $2 AND number = ANY($3::int[])
       RETURNING id, number, status`,
      [req.user.id, lotteryId, numbers]
    );

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Numbers reserved. Please complete payment.',
      tickets: reservedNumbers
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[participateLottery]', error.message);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
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

    // 1. Verify the number belongs to the user, is pending, AND its lottery is still active
    const { rows: numbers } = await client.query(
      `SELECT ln.id FROM lottery_numbers ln
       JOIN lottery_settings ls ON ln.lottery_id = ls.id
       WHERE ln.id = $1 AND ln.user_id = $2 AND ln.status = 'pending' AND ls.status = 'active'`,
      [lotteryNumberId, req.user.id]
    );

    if (numbers.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Invalid ticket, ticket not in pending state, or lottery is no longer active.' });
    }

    // 2. Create the payment record
    await client.query(
      `INSERT INTO payments (user_id, lottery_number_id, receipt_url, method, status)
       VALUES ($1, $2, $3, $4, 'pending')`,
      [req.user.id, lotteryNumberId, receiptUrl, method]
    );

    // 3. Notify Admin/Staff
    const { rows: ticketInfo } = await client.query(
      'SELECT number FROM lottery_numbers WHERE id = $1',
      [lotteryNumberId]
    );
    const ticketNumber = ticketInfo[0]?.number || 'Unknown';
    const notificationService = require('../services/notificationService');
    
    // Notify Admin/Staff
    await notificationService.notifyAdminsAndStaff(
      'New Payment Pending',
      `User ${req.user.name} uploaded a receipt for ticket #${ticketNumber}.`,
      'info',
      client
    );

    // Notify User
    await notificationService.createNotification(
      req.user.id,
      'Payment Under Review',
      `Your payment for ticket #${ticketNumber} has been received and is under review.`,
      'info',
      client
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
    // Scope to active lottery by default; pass ?lottery_id=<id> for historical lookup
    const lotteryId = req.query.lottery_id;

    let query, params;

    if (req.user.role === 'admin' || req.user.role === 'lottery_staff') {
      if (lotteryId) {
        query = `
          SELECT ln.*, ls.prize_text, ls.status as lottery_status, u.name as user_name
          FROM lottery_numbers ln
          JOIN lottery_settings ls ON ln.lottery_id = ls.id
          LEFT JOIN users u ON ln.user_id = u.id
          WHERE ln.lottery_id = $1 AND ln.status != 'available'
          ORDER BY ln.updated_at DESC`;
        params = [lotteryId];
      } else {
        // Default: only entries for the current active lottery
        query = `
          SELECT ln.*, ls.prize_text, ls.status as lottery_status, u.name as user_name
          FROM lottery_numbers ln
          JOIN lottery_settings ls ON ln.lottery_id = ls.id
          LEFT JOIN users u ON ln.user_id = u.id
          WHERE ls.status = 'active' AND ln.status != 'available'
          ORDER BY ln.updated_at DESC`;
        params = [];
      }
    } else {
      // Regular users: their own entries across all lotteries (for history)
      query = `
        SELECT ln.*, ls.prize_text, ls.status as lottery_status, u.name as user_name
        FROM lottery_numbers ln
        JOIN lottery_settings ls ON ln.lottery_id = ls.id
        JOIN users u ON ln.user_id = u.id
        WHERE ln.user_id = $1
        ORDER BY ln.updated_at DESC`;
      params = [req.user.id];
    }

    const { rows } = await pool.query(query, params);
    res.status(200).json(rows);
  } catch (error) {
    console.error('[getLotteryEntries]', error.message);
    res.status(500).json({ message: error.message });
  }
};


// @desc    Get all taken numbers for the active lottery
// @route   GET /api/lottery/taken
// @access  Public
const getTakenNumbers = async (req, res) => {
  try {
    const { rows: lotteryRows } = await pool.query(
      "SELECT id FROM lottery_settings WHERE status = 'active' LIMIT 1"
    );
    if (lotteryRows.length === 0) return res.status(200).json([]);
    
    const { rows } = await pool.query(
      "SELECT number FROM lottery_numbers WHERE lottery_id = $1 AND status != 'available'",
      [lotteryRows[0].id]
    );
    res.status(200).json(rows.map(r => r.number));
  } catch (error) {
    console.error('[getTakenNumbers]', error.message);
    res.status(500).json({ message: error.message });
  }
};


// @desc    Get the current active lottery with summary stats
// @route   GET /api/lottery/current
// @access  Private
const getCurrentLottery = async (req, res) => {
  try {
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

module.exports = {
  participateLottery,
  getLotteryEntries,
  getTakenNumbers,
  submitLotteryPayment,
  getCurrentLottery,
};
