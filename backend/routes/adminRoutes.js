const express = require('express');
const router = express.Router();
<<<<<<< HEAD
const { toggleMode, getUsers, getDashboardStats, updateUserStatus, deleteUser } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.patch('/mode', protect, authorize(['admin']), toggleMode);

router.get('/users', protect, authorize(['admin']), getUsers);
router.patch('/users/:id/status', protect, authorize(['admin']), updateUserStatus);
router.delete('/users/:id', protect, authorize(['admin']), deleteUser);
router.get('/dashboard-stats', protect, authorize(['admin', 'lottery_staff']), getDashboardStats);

=======
const { toggleMode } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// @desc    Toggle admin operational mode
// @route   PATCH /api/admin/mode
// @access  Private/Admin
router.patch('/mode', protect, authorize(['admin']), toggleMode);

>>>>>>> 326023c160955673a9228ba12856ca7c2ba911e9
module.exports = router;
