const pool = require('../config/pgPool');

/**
 * @desc    Toggle admin operational mode
 * @route   PATCH /api/admin/mode
 * @access  Private/Admin
 */
const toggleMode = async (req, res) => {
  const { mode } = req.body;

  // Validate mode
  const validModes = ['car_mode', 'lottery_mode'];
  if (!mode || !validModes.includes(mode)) {
    return res.status(400).json({ 
      message: 'Invalid mode. Valid modes are: car_mode, lottery_mode' 
    });
  }

  try {
    const { rows } = await pool.query(
      'UPDATE users SET mode = $1 WHERE id = $2 RETURNING id, name, email, role, mode',
      [mode, req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('[toggleMode]', error.message);
    res.status(500).json({ message: 'Server error while updating mode' });
  }
};

module.exports = {
  toggleMode,
};
