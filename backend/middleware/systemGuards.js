const jwt = require('jsonwebtoken');
const pool = require('../config/pgPool');
const SettingsManager = require('../services/SettingsManager');

const maintenanceGuard = async (req, res, next) => {
  const operational = SettingsManager.getSetting('Operational', {});
  const platformActive = operational.platformEnabled !== false;
  
  // Whitelist auth and public settings to allow admin login during maintenance
  const isAuthRoute = req.path.startsWith('/api/auth');
  const isPublicSettings = req.path === '/api/settings' && req.method === 'GET';
  
  if (platformActive || isAuthRoute || isPublicSettings) return next();

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

    const operational = SettingsManager.getSetting('Operational', {});
    const isEnabled = operational[moduleSettingKey] !== false;
    
    if (!isEnabled) {
      return res.status(503).json({ message: `The ${moduleSettingKey.replace(/ModuleEnabled/g, '').replace(/([A-Z])/g, ' $1').trim()} module is currently disabled for maintenance.` });
    }
    next();
  };
};

const requirePermission = (permissionKey) => {
  return (req, res, next) => {
    if (req.user && req.user.role === 'admin') return next();

    // Check staff granular permission
    if (req.user && req.user.role === 'lottery_staff') {
      const lottery = SettingsManager.getSetting('Lottery', {});
      // Default to true if undefined, meaning staff inherit full access unless explicitly denied in Admin Settings
      const isAllowed = lottery[permissionKey] !== false;
      if (!isAllowed) {
        return res.status(403).json({ message: `Staff action restricted: ${permissionKey.replace(/([A-Z])/g, ' $1').trim()}` });
      }
    }
    
    // Admins and allowed staff bypass
    next();
  };
};

module.exports = { maintenanceGuard, requireModule, requirePermission };
