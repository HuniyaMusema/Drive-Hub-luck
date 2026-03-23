const jwt = require('jsonwebtoken');
const pool = require('../config/pgPool');

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
        'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
        [decoded.id]
      );

      if (rows.length === 0) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      req.user = rows[0];
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

// Admin authentication middleware
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

module.exports = { protect, admin, isLotteryStaff, isAdminOrLotteryStaff };
