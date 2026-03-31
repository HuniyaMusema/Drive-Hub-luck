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

const getUsers = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, name, email, role, status, suspension_reason, created_at, mode FROM users ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('[getUsers]', error.message);
    res.status(500).json({ message: 'Server error fetching users' });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const carsCount = await pool.query("SELECT COUNT(*) FROM cars");
    const lotteryEntriesCount = await pool.query("SELECT COUNT(*) FROM lottery_numbers");
    const pendingPaymentsCount = await pool.query("SELECT COUNT(*) FROM payments WHERE status = 'pending'");
    const usersCount = await pool.query("SELECT COUNT(*) FROM users");
    
    // Revenue logic: just multiply payments approved by an assumed ticket price
    const approvedPaymentsCount = await pool.query("SELECT COUNT(*) FROM payments WHERE status = 'approved'");
    const revenue = parseInt(approvedPaymentsCount.rows[0].count) * 15;

    res.json({
      totalVehicles: parseInt(carsCount.rows[0].count),
      lotteryEntries: parseInt(lotteryEntriesCount.rows[0].count),
      pendingPayments: parseInt(pendingPaymentsCount.rows[0].count),
      registeredUsers: parseInt(usersCount.rows[0].count),
      revenue: revenue
    });
  } catch (error) {
    console.error('[getDashboardStats]', error.message);
    res.status(500).json({ message: 'Server error fetching stats' });
  }
};

const updateUserStatus = async (req, res) => {
  const { id } = req.params;
  const { status, reason } = req.body;

  const validStatuses = ['active', 'suspended'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  if (id === req.user.id) {
    return res.status(400).json({ message: 'Cannot suspend your own account' });
  }

  try {
    const { rows } = await pool.query(
      'UPDATE users SET status = $1, suspension_reason = $2 WHERE id = $3 RETURNING id, name, email, role, status, suspension_reason',
      [status, reason || null, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('[updateUserStatus]', error.message);
    res.status(500).json({ message: 'Server error updating user status' });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;

  if (id === req.user.id.toString()) {
    return res.status(400).json({ message: 'Cannot delete yourself' });
  }

  try {
    const { rowCount } = await pool.query('DELETE FROM users WHERE id = $1', [id]);

    if (rowCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('[deleteUser]', error.message);
    res.status(500).json({ message: 'Server error deleting user' });
  }
};

module.exports = {
  toggleMode,
  getUsers,
  getDashboardStats,
  updateUserStatus,
  deleteUser
};
