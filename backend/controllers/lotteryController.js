const pool = require('../config/pgPool');

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
      [lotteryId]
    );

    if (available.length === 0) {
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
       ORDER BY ln.created_at DESC`
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error('[getLotteryEntries]', error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Pick a winner (Logic for selecting from confirmed participants)
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

