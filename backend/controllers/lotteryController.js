const pool = require('../config/pgPool');
<<<<<<< HEAD
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

    const lotterySettings = SettingsManager.getSetting('Lottery', {});
    const maxTickets = lotterySettings.maxTicketsPerUser || 1;

    if (existing.length >= maxTickets) {
      return res.status(400).json({ 
        message: `You have reached the maximum allowed tickets (${maxTickets}) for this lottery.`, 
        numbers: existing.map(e => e.number)
      });
    }

    // 3. Find available numbers
    const { rows: available } = await pool.query(
      "SELECT id FROM lottery_numbers WHERE lottery_id = $1 AND status = 'available'",
=======

// @desc    Participate in the lottery
// @route   POST /api/lottery/participate
// @access  Private
const participateLottery = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Get active lottery
    const { rows: lotteryRows } = await client.query(
      "SELECT id FROM lottery_settings WHERE status = 'active' ORDER BY created_at DESC LIMIT 1"
    );

    if (lotteryRows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'No active lottery at the moment.' });
    }

    const lotteryId = lotteryRows[0].id;

    // 2. Check if user already participated in THIS lottery
    const { rows: existing } = await client.query(
      "SELECT id FROM lottery_numbers WHERE lottery_id = $1 AND user_id = $2",
      [lotteryId, req.user.id]
    );

    if (existing.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'You have already entered this lottery!' });
    }

    // 3. Find an available number
    const { rows: available } = await client.query(
      "SELECT id, number FROM lottery_numbers WHERE lottery_id = $1 AND status = 'available' ORDER BY number LIMIT 1 FOR UPDATE SKIP LOCKED",
>>>>>>> 67becb57e5a0738af6d5398be4809facff116285
      [lotteryId]
    );

    if (available.length === 0) {
<<<<<<< HEAD
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
=======
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'No more tickets available for this lottery.' });
    }

    const ticket = available[0];

    // 4. Assign to user
    const { rows: updated } = await client.query(
      "UPDATE lottery_numbers SET user_id = $1, status = 'confirmed', updated_at = NOW() WHERE id = $2 RETURNING *",
      [req.user.id, ticket.id]
    );

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Successfully participated!',
      ticket: updated[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[participateLottery]', error.message);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
};

// @desc    Get all lottery entries (User/Public view or Staff view)
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
>>>>>>> 67becb57e5a0738af6d5398be4809facff116285
       ORDER BY ln.created_at DESC`
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error('[getLotteryEntries]', error.message);
    res.status(500).json({ message: error.message });
  }
};

<<<<<<< HEAD
// @desc    Pick a winner (Select a random confirmed participant)
=======
// @desc    Pick a winner (Logic for selecting from confirmed participants)
>>>>>>> 67becb57e5a0738af6d5398be4809facff116285
// @route   PUT /api/lottery/pick-winner
// @access  Private/Admin
const pickWinner = async (req, res) => {
  try {
<<<<<<< HEAD
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
=======
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
      "SELECT id, number, user_id FROM lottery_numbers WHERE lottery_id = $1 AND status = 'confirmed'",
      [lotteryId]
    );

    if (participants.length === 0) {
      return res.status(400).json({ message: 'No confirmed participants to pick from.' });
    }

    // 3. Random pick
    const randomIndex = Math.floor(Math.random() * participants.length);
    const winner = participants[randomIndex];

    // Note: The schema doesn't have a 'winner' flag on lottery_numbers, 
    // but we can log it or use a separate winners table if needed.
    // For now, we'll just return the winner data.

    res.status(200).json({ 
      message: `Winner selected! Ticket Number: ${winner.number}`, 
>>>>>>> 67becb57e5a0738af6d5398be4809facff116285
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

