const jwt = require('jsonwebtoken');
const pool = require('../config/pgPool');
const SettingsManager = require('../services/SettingsManager');

// Protect routes
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from PostgreSQL (exclude password)
      const { rows } = await pool.query(
        'SELECT id, name, email, role, status, session_token, created_at FROM users WHERE id = $1',
        [decoded.id]
      );

      if (rows.length === 0) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      const user = rows[0];

      // Block suspended users
      if (user.status === 'suspended') {
        return res.status(403).json({ 
          message: 'Your account has been suspended. Please contact support.' 
        });
      }

      // Session Control: Verify multi-login guard
      const security = SettingsManager.getSetting('Security', {});
      const multiLoginEnabled = security.multiLoginEnabled === true;
      if (!multiLoginEnabled && decoded.sessionToken !== user.session_token) {
        return res.status(401).json({ message: 'Session expired. You logged in from another device.' });
      }

      req.user = {
        ...user,
        mode: decoded.mode || null, // Extract mode from JWT
      };

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

/**
 * Role and Mode-based authorization middleware
 * @param {Array} allowedRoles - List of authorized roles
 * @param {String} requiredMode - Required operational mode for admins
 */
const authorize = (allowedRoles, requiredMode) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const { role, mode } = req.user;

    // 1. Check if role is allowed
    if (!allowedRoles.includes(role)) {
      return res.status(403).json({
        message: `Your role (${role}) is not authorized for this action`
      });
    }

    // 2. Admin specific logic: Check mode
    // Bypassing strict mode requirements for admins who don't have a mode set
    if (role === 'admin' && mode && mode !== requiredMode) {
      return res.status(403).json({
        message: `Admin access denied: Operation requires '${requiredMode}' mode`
      });
    }

    // 3. lottery_staff: Ignore mode (always allowed if role matches)
    // Implicitly handled because we only check mode for 'admin' above.

    next();
  };
};

// Admin authentication middleware (Legacy, kept for compatibility)
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

// Lottery Staff authentication middleware
const isLotteryStaff = (req, res, next) => {
  if (req.user && req.user.role === 'lottery_staff') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as lottery staff' });
  }
};

// Admin or Lottery Staff authentication middleware
const isAdminOrLotteryStaff = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'lottery_staff')) {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized: Admin or Lottery Staff role required' });
  }
};

module.exports = {
  protect,
  admin,
  authorize,
  isLotteryStaff,
  isAdminOrLotteryStaff
};

