const express = require('express');
const router = express.Router();
const { toggleMode, getUsers, getDashboardStats, updateUserStatus, deleteUser } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.patch('/mode', protect, authorize(['admin']), toggleMode);

router.get('/users', protect, authorize(['admin']), getUsers);
router.patch('/users/:id/status', protect, authorize(['admin']), updateUserStatus);
router.delete('/users/:id', protect, authorize(['admin']), deleteUser);
router.get('/dashboard-stats', protect, authorize(['admin', 'lottery_staff']), getDashboardStats);

module.exports = router;
