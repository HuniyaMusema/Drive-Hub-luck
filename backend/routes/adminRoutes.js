const express = require('express');
const router = express.Router();
const { toggleMode } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// @desc    Toggle admin operational mode
// @route   PATCH /api/admin/mode
// @access  Private/Admin
router.patch('/mode', protect, authorize(['admin']), toggleMode);

module.exports = router;
