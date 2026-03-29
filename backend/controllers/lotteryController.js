const pool = require('../config/pgPool');
const SettingsManager = require('../services/SettingsManager');

// @desc    Participate in the lottery (Assign a random available number)
// @route   POST /api/lottery/participate
// @access  Private
const participateLottery = async (req, res) => {
  try {
    // 1. Get the current active lottery
    const { rows: lotteryRows } = await pool.query(
      "SELECT id FROM lottery_settings WHERE status = 'active' LIMIT 1"
    );

    if (lotteryRows.length === 0) {
      return res.status(404).json({ message: 'No active lottery currently running.' });
    }
    const lotteryId = lotteryRows[0].id;

    // 2. Check if user already has a number for THIS lottery
    const { rows: existing } = await pool.query(
      'SELECT id, number FROM lottery_numbers WHERE lottery_id = $1 AND user_id = $2',
      [lotteryId, req.user.id]
    );

    const maxTickets = SettingsManager.getSetting('Lottery_Max_Tickets', 1);

    if (existing.length >= maxTickets) {
      return res.status(400).json({ 
        message: `You have reached the maximum allowed tickets (${maxTickets}) for this lottery.`, 
        numbers: existing.map(e => e.number)
      });
    }

    // 3. Find available numbers
    const { rows: available } = await pool.query(
      "SELECT id FROM lottery_numbers WHERE lottery_id = $1 AND status = 'available'",
      [lotteryId]
    );

    if (available.length === 0) {
      return res.status(400).json({ message: 'All lottery numbers have been taken.' });
    }

    // 4. Assign a random available number
    const randomIndex = Math.floor(Math.random() * available.length);
    const chosenNumberId = available[randomIndex].id;

    const { rows: updated } = await pool.query(
      `UPDATE lottery_numbers 
       SET user_id = $1, status = 'confirmed', updated_at = NOW() 
       WHERE id = $2 
       RETURNING *`,
      [req.user.id, chosenNumberId]
    );

    res.status(201).json(updated[0]);
  } catch (error) {
    console.error('[participateLottery]', error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all lottery entries (joined with users)
// @route   GET /api/lottery
// @access  Private/Admin
const getLotteryEntries = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT ln.*, u.name as user_name, u.email as user_email 
       FROM lottery_numbers ln
       LEFT JOIN users u ON ln.user_id = u.id
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
    const { rows: winners } = await pool.query(
      `SELECT ln.*, u.name as user_name, u.email as user_email
       FROM lottery_numbers ln
       JOIN users u ON ln.user_id = u.id
       WHERE ln.status = 'confirmed'
       ORDER BY RANDOM()
       LIMIT 1`
    );

    if (winners.length === 0) {
      return res.status(400).json({ message: 'No confirmed participants to pick from.' });
    }

    const winner = winners[0];

    res.status(200).json({ 
      message: `Winner selected! Number: ${winner.number}`, 
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

