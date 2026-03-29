const express = require('express');
const router = express.Router();
const { getAuditLogs } = require('../controllers/auditLogsController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', protect, admin, getAuditLogs);

module.exports = router;
