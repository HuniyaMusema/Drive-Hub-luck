const pool = require('../config/pgPool');
const SettingsManager = require('../services/SettingsManager');

// @desc    Participate in the lottery (Assign a random available number)
// @route   POST /api/lottery/participate
// @access  Private
const participateLottery = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Get the current active lottery
    const { rows: lotteryRows } = await client.query(
      "SELECT id FROM lottery_settings WHERE status = 'active' ORDER BY created_at DESC LIMIT 1"
    );

    if (lotteryRows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'No active lottery currently running.' });
    }
    const lotteryId = lotteryRows[0].id;

    // 2. Check if user already has a number for THIS lottery
    const { rows: existing } = await client.query(
      'SELECT id, number FROM lottery_numbers WHERE lottery_id = $1 AND user_id = $2',
      [lotteryId, req.user.id]
    );

    const lotterySettings = SettingsManager.getSetting('Lottery', {});
    const maxTickets = lotterySettings.maxTicketsPerUser || 1;

    if (existing.length >= maxTickets) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        message: `You have reached the maximum allowed tickets (${maxTickets}) for this lottery.`, 
        numbers: existing.map(e => e.number)
      });
    }

    // 3. Find available numbers (Using FOR UPDATE SKIP LOCKED for concurrency safety)
    const { rows: available } = await client.query(
      "SELECT id, number FROM lottery_numbers WHERE lottery_id = $1 AND status = 'available' ORDER BY number LIMIT 100 FOR UPDATE SKIP LOCKED",
      [lotteryId]
    );

    if (available.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'All lottery numbers have been taken.' });
    }

    // 4. Assign a random available number from the fetched batch
    const randomIndex = Math.floor(Math.random() * available.length);
    const chosenNumber = available[randomIndex];

    const { rows: updated } = await client.query(
      `UPDATE lottery_numbers 
       SET user_id = $1, status = 'confirmed', updated_at = NOW() 
       WHERE id = $2 
       RETURNING *`,
      [req.user.id, chosenNumber.id]
    );

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Successfully participated!',
      ticket: updated[0]
    });
  } catch (error) {
    if (client) await client.query('ROLLBACK');
    console.error('[participateLottery]', error.message);
    res.status(500).json({ message: error.message });
  } finally {
    if (client) client.release();
  }
};

// @desc    Get all lottery entries (joined with users)
// @route   GET /api/lottery
// @access  Private (Staff/Admin)
const getLotteryEntries = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT ln.*, u.name AS user_name, u.email AS user_email, ls.prize_text 
       FROM lottery_numbers ln 
       JOIN users u ON ln.user_id = u.id 
       JOIN lottery_settings ls ON ln.lottery_id = ls.id 
       WHERE ln.user_id IS NOT NULL 
       ORDER BY ln.created_at DESC`
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error('[getLotteryEntries]', error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Pick a winner (Select a random confirmed participant)
// @route   PUT /api/lottery/pick-winner
// @access  Private/Admin
const pickWinner = async (req, res) => {
  try {
    // 1. Get active lottery
    const { rows: lotteryRows } = await pool.query(
      "SELECT id FROM lottery_settings WHERE status = 'active' ORDER BY created_at DESC LIMIT 1"
    );

    if (lotteryRows.length === 0) {
      return res.status(400).json({ message: 'No active lottery found.' });
    }

    const lotteryId = lotteryRows[0].id;

    // 2. Get all confirmed participants
    const { rows: participants } = await pool.query(
      `SELECT ln.*, u.name as user_name, u.email as user_email
       FROM lottery_numbers ln
       JOIN users u ON ln.user_id = u.id
       WHERE ln.lottery_id = $1 AND ln.status = 'confirmed'
       ORDER BY RANDOM()
       LIMIT 1`,
      [lotteryId]
    );

    if (participants.length === 0) {
      return res.status(400).json({ message: 'No confirmed participants to pick from.' });
    }

    const winner = participants[0];

    res.status(200).json({ 
      message: `Winner selected! Ticket Number: ${winner.number}`, 
      winner 
    });
  } catch (error) {
    console.error('[pickWinner]', error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  participateLottery,
  getLotteryEntries,
  pickWinner
};
