const pool = require('../config/pgPool');

// @desc    Get all audit logs
// @route   GET /api/admin/logs
// @access  Private/Admin
const getAuditLogs = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT al.*, u.name as user_name, u.email as user_email 
       FROM audit_logs al
       JOIN users u ON al.performed_by = u.id
       ORDER BY al.timestamp DESC`
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error('[getAuditLogs]', error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAuditLogs };
