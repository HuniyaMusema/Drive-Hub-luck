const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const pool = require('../config/pgPool');
const SettingsManager = require('../services/SettingsManager');
const { v4: uuidv4 } = require('uuid');
const { sendPasswordResetEmail } = require('../services/emailService');

// @desc    Generate JWT
// @param   {string} id - User ID
// @param   {string} role - User Role
// @param   {string} sessionToken - Unique session identifier
// @param   {string} mode - Optional operational mode (lottery_mode, car_mode)
const generateToken = (id, role, sessionToken = null, mode = null) => {
  return jwt.sign({ id, role, sessionToken, mode }, process.env.JWT_SECRET, {
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

  // Enforce password policy from settings
  const minLength = security.minPasswordLength || 8;
  if (password.length < minLength) {
    return res.status(400).json({ message: `Password must be at least ${minLength} characters.` });
  }
  if (security.requireUppercase !== false && !/[A-Z]/.test(password)) {
    return res.status(400).json({ message: 'Password must contain at least one uppercase letter.' });
  }
  if (security.requireNumbers !== false && !/[0-9]/.test(password)) {
    return res.status(400).json({ message: 'Password must contain at least one number.' });
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
       RETURNING id, name, email, role, created_at, language`,
      [name, email, hashedPassword]
    );

    const user = rows[0];

    const sessionToken = uuidv4();
    await pool.query('UPDATE users SET session_token = $1 WHERE id = $2', [sessionToken, user.id]);

    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      language: user.language,
      token: generateToken(user.id, user.role, sessionToken),
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
  const { email, password, mode } = req.body;

  try {
    const { rows } = await pool.query(
      'SELECT id, name, email, password, role, session_token, language FROM users WHERE email = $1',
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

    // Respect multiLoginEnabled setting:
    // If disabled (default), rotate session token to kick other sessions.
    // If enabled, keep existing session token so multiple devices stay logged in.
    const security = SettingsManager.getSetting('Security', {});
    const multiLoginEnabled = security.multiLoginEnabled === true;

    let sessionToken = user.session_token;
    if (!multiLoginEnabled || !sessionToken) {
      sessionToken = uuidv4();
      await pool.query('UPDATE users SET session_token = $1 WHERE id = $2', [sessionToken, user.id]);
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      language: user.language,
      token: generateToken(user.id, user.role, sessionToken, mode),
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

// @desc    Get user profile history (rentals, lottery)
// @route   GET /api/auth/profile-history
// @access  Private
const getProfileHistory = async (req, res) => {
  try {
    const rentals = await pool.query(`
      SELECT r.*, c.name as car_name, c.images->>0 as car_image
      FROM rental_requests r
      JOIN cars c ON r.car_id = c.id
      WHERE r.user_id = $1
      ORDER BY r.created_at DESC
    `, [req.user.id]);

    const lotteries = await pool.query(`
      SELECT * FROM (
        SELECT 
          ln.number, 
          ln.id, 
          ls.status as lottery_status, 
          c.name as prize_name, 
          p.status as payment_status, 
          p.created_at as payment_date, 
          ln.created_at as reservation_date,
          ln.status as number_status
        FROM payments p
        JOIN lottery_numbers ln ON p.lottery_number_id = ln.id
        JOIN lottery_settings ls ON ln.lottery_id = ls.id
        LEFT JOIN cars c ON ls.prize_car_id = c.id
        WHERE p.user_id = $1

        UNION ALL

        SELECT 
          ln.number, 
          ln.id, 
          ls.status as lottery_status, 
          c.name as prize_name, 
          NULL::payment_status as payment_status, 
          NULL::timestamptz as payment_date, 
          ln.created_at as reservation_date,
          ln.status as number_status
        FROM lottery_numbers ln
        JOIN lottery_settings ls ON ln.lottery_id = ls.id
        LEFT JOIN cars c ON ls.prize_car_id = c.id
        WHERE ln.user_id = $1
        AND ls.status = 'active'
        AND NOT EXISTS (SELECT 1 FROM payments p WHERE p.lottery_number_id = ln.id AND p.user_id = $1)
      ) AS history
      ORDER BY COALESCE(payment_date, reservation_date) DESC
    `, [req.user.id]);

    res.json({
      rentals: rentals.rows.map(r => ({
        id: r.id, car: r.car_name, dates: `${new Date(r.start_date).toLocaleDateString()} - ${new Date(r.end_date).toLocaleDateString()}`,
        status: r.status, price: parseFloat(r.total_price), image: r.car_image
      })),
      lotteries: lotteries.rows.map(l => ({
        id: l.id, 
        number: l.number, 
        date: l.payment_date || l.reservation_date, 
        status: l.number_status,
        payment_status: l.payment_status || null,
        lottery_status: l.lottery_status,
        prize: l.prize_name || "Unknown Prize"
      }))
    });
  } catch (error) {
    console.error('[getProfileHistory]', error.message);
    res.status(500).json({ message: 'Server error retrieving history' });
  }
};

// @desc    Update user language
// @route   PATCH /api/auth/language
// @access  Private
const updateUserLanguage = async (req, res) => {
  const { language } = req.body;
  if (!language || typeof language !== 'string') {
    return res.status(400).json({ message: 'Invalid language preference' });
  }

  try {
    await pool.query('UPDATE users SET language = $1 WHERE id = $2', [language, req.user.id]);
    res.status(200).json({ message: 'Language updated successfully', language });
  } catch (error) {
    console.error('[updateUserLanguage]', error.message);
    res.status(500).json({ message: 'Server error updating language' });
  }
};

// @desc    Request password reset — sends email with token link
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  try {
    const { rows } = await pool.query(
      'SELECT id, name, email FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    // Always return 200 to prevent email enumeration attacks
    if (rows.length === 0) {
      return res.status(200).json({ message: 'If that email is registered, a reset link has been sent.' });
    }

    const user = rows[0];

    // Generate a secure random token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Store the hashed token in the DB
    await pool.query(
      'UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE id = $3',
      [hashedToken, expiresAt, user.id]
    );

    // Build the reset URL (the raw token goes in the URL, not the hash)
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
    const resetUrl = `${frontendUrl}/auth/reset-password?token=${resetToken}`;

    await sendPasswordResetEmail(user.email, user.name, resetToken, resetUrl);

    res.status(200).json({ message: 'If that email is registered, a reset link has been sent.' });
  } catch (error) {
    console.error('[forgotPassword]', error.message);
    res.status(500).json({ message: 'Failed to send reset email. Please try again later.' });
  }
};

// @desc    Reset password using the token from the email link
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) {
    return res.status(400).json({ message: 'Token and new password are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  try {
    // Hash the incoming raw token to compare against the stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const { rows } = await pool.query(
      `SELECT id, name, email FROM users 
       WHERE reset_token = $1 AND reset_token_expires > NOW()`,
      [hashedToken]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: 'Reset link is invalid or has expired. Please request a new one.' });
    }

    const user = rows[0];

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update the password and clear the reset token in one query
    await pool.query(
      `UPDATE users 
       SET password = $1, reset_token = NULL, reset_token_expires = NULL, session_token = NULL 
       WHERE id = $2`,
      [hashedPassword, user.id]
    );

    console.log(`[resetPassword] Password successfully reset for user: ${user.email}`);
    res.status(200).json({ message: 'Password reset successfully. You can now log in.' });
  } catch (error) {
    console.error('[resetPassword]', error.message);
    res.status(500).json({ message: 'Server error resetting password.' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  getProfileHistory,
  updateUserLanguage,
  forgotPassword,
  resetPassword,
};

