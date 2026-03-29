const jwt = require('jsonwebtoken');
const pool = require('../config/pgPool');
const SettingsManager = require('../services/SettingsManager');

const maintenanceGuard = async (req, res, next) => {
  const platformActive = SettingsManager.getSetting('Platform_Active', true);
  if (platformActive) return next();

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const { rows } = await pool.query('SELECT role FROM users WHERE id = $1', [decoded.id]);
      if (rows.length > 0 && rows[0].role === 'admin') {
        return next();
      }
    } catch (e) {
      // fallback to unauthenticated response below
    }
  }

  return res.status(503).json({ message: 'System under maintenance' });
};

const requireModule = (moduleSettingKey) => {
  return async (req, res, next) => {
    // Check if req.user is already set by auth middleware
    if (req.user && req.user.role === 'admin') return next();

    // If not set, try to extract token (for public routes)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { rows } = await pool.query('SELECT role FROM users WHERE id = $1', [decoded.id]);
        if (rows.length > 0 && rows[0].role === 'admin') {
          return next();
        }
      } catch (e) {}
    }

    const isEnabled = SettingsManager.getSetting(moduleSettingKey, true);
    if (!isEnabled) {
      return res.status(403).json({ message: `The ${moduleSettingKey.replace(/_/g, ' ')} module is currently disabled.` });
    }
    next();
  };
};

const requirePermission = (permissionKey) => {
  return (req, res, next) => {
    if (req.user && req.user.role === 'admin') return next();

    // Check staff granular permission
    if (req.user && req.user.role === 'lottery_staff') {
      const isAllowed = SettingsManager.getSetting(permissionKey, false);
      if (!isAllowed) {
        return res.status(403).json({ message: `You lack the specific staff permission: ${permissionKey.replace(/_/g, ' ')}` });
      }
    }
    
    // Admins and allowed staff bypass
    next();
  };
};

module.exports = { maintenanceGuard, requireModule, requirePermission };
