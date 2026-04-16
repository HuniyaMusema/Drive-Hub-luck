const pool = require('../config/pgPool');
const bcrypt = require('bcryptjs');

const createStaffAccount = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  try {
    // Check if user already exists
    const userExist = await pool.query('SELECT email FROM users WHERE email = $1', [email]);
    if (userExist.rows.length > 0) {
      return res.status(400).json({ message: 'A user with this email already exists' });
    }

    // Explicitly add enum if not present to avoid constraint errors
    await pool.query(`ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'lottery_staff'`);

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert staff account explicitly mapped to the lottery_staff role
    const { rows } = await pool.query(
      `INSERT INTO users (name, email, password, role) 
       VALUES ($1, $2, $3, 'lottery_staff') 
       RETURNING id, name, email, role, status, created_at`,
      [name, email, hashedPassword]
    );

    res.status(201).json({
      message: 'Staff account created successfully',
      user: rows[0],
    });
  } catch (error) {
    console.error('[createStaffAccount]', error);
    res.status(500).json({ message: 'Server error creating staff account' });
  }
};

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
    const [
      carsCount,
      lotteryEntriesCount,
      pendingPaymentsCount,
      usersCount,
      revenueResult
    ] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM cars"),
      pool.query("SELECT COUNT(*) FROM lottery_numbers WHERE status != 'available'"),
      pool.query("SELECT COUNT(*) FROM payments WHERE status = 'pending'"),
      pool.query("SELECT COUNT(*) FROM users WHERE role = 'user'"),
      pool.query(`
        SELECT COALESCE(SUM(ls.ticket_price), 0) AS total
        FROM payments p
        CROSS JOIN LATERAL unnest(COALESCE(p.ticket_ids, ARRAY[p.lottery_number_id])) AS t_id
        JOIN lottery_numbers ln ON t_id = ln.id
        JOIN lottery_settings ls ON ln.lottery_id = ls.id
        WHERE p.status = 'approved'
      `)
    ]);

    res.json({
      totalVehicles: parseInt(carsCount.rows[0].count),
      lotteryEntries: parseInt(lotteryEntriesCount.rows[0].count),
      pendingPayments: parseInt(pendingPaymentsCount.rows[0].count),
      registeredUsers: parseInt(usersCount.rows[0].count),
      revenue: parseFloat(revenueResult.rows[0].total)
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
  createStaffAccount,
  toggleMode,
  getUsers,
  getDashboardStats,
  updateUserStatus,
  deleteUser
};
