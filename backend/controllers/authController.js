const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('../config/pgPool');
const SettingsManager = require('../services/SettingsManager');
const { v4: uuidv4 } = require('uuid');

// Generate JWT
<<<<<<< HEAD
const generateToken = (id, sessionToken) => {
  return jwt.sign({ id, sessionToken }, process.env.JWT_SECRET, {
=======
const generateToken = (id, role, mode = null) => {
  return jwt.sign({ id, role, mode }, process.env.JWT_SECRET, {
>>>>>>> 67becb57e5a0738af6d5398be4809facff116285
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const security = SettingsManager.getSetting('Security', {});
  const isRegistrationEnabled = security.registrationEnabled !== false;
  if (!isRegistrationEnabled) {
    return res.status(403).json({ message: 'Registration is currently disabled by an administrator' });
  }

  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please add all fields' });
  }

  try {
    // Check if user exists
    const { rows: existing } = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const { rows } = await pool.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, 'user')
       RETURNING id, name, email, role, created_at`,
      [name, email, hashedPassword]
    );

    const user = rows[0];

    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
<<<<<<< HEAD
      token: generateToken(user.id, null), // sessionToken is optional here or we can initialize it
=======
      token: generateToken(user.id, user.role),
>>>>>>> 67becb57e5a0738af6d5398be4809facff116285
    });
  } catch (error) {
    console.error('[registerUser]', error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const { rows } = await pool.query(
      'SELECT id, name, email, password, role FROM users WHERE email = $1',
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

<<<<<<< HEAD
    const security = SettingsManager.getSetting('Security', {});
    const multiLoginEnabled = security.multiLoginEnabled === true;
    let sessionToken = user.session_token;

    if (!multiLoginEnabled || !sessionToken) {
      sessionToken = uuidv4();
      await pool.query('UPDATE users SET session_token = $1 WHERE id = $2', [sessionToken, user.id]);
    }
=======
    const { mode } = req.body;
>>>>>>> 67becb57e5a0738af6d5398be4809facff116285

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
<<<<<<< HEAD
      token: generateToken(user.id, sessionToken),
=======
      token: generateToken(user.id, user.role, mode),
>>>>>>> 67becb57e5a0738af6d5398be4809facff116285
    });
  } catch (error) {
    console.error('[loginUser]', error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  res.status(200).json(req.user);
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
};
