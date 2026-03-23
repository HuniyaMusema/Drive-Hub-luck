const express = require('express');
const router  = express.Router();

const {
  createLottery,
  getCurrentLottery,
  startLottery,
  stopLottery,
  getAllLotteries,
  getLotteryPayments,
  verifyPayment,
  rejectPayment,
  getLotteryNumbers,
} = require('../controllers/adminLotteryController');

const { protect, admin, isAdminOrLotteryStaff } = require('../middleware/authMiddleware');

// ── Admin-Only Routes ────────────────────────────────────────────────────────
router.post('/', protect, admin, createLottery);
router.put('/:id/start', protect, admin, startLottery);
router.put('/:id/stop', protect, admin, stopLottery);

// ── Admin-or-Lottery-Staff Routes ───────────────────────────────────────────
router.get('/', protect, isAdminOrLotteryStaff, getAllLotteries);
router.get('/current', protect, isAdminOrLotteryStaff, getCurrentLottery);
router.get('/payments', protect, isAdminOrLotteryStaff, getLotteryPayments);
router.get('/numbers', protect, isAdminOrLotteryStaff, getLotteryNumbers);
router.post('/payments/:id/verify', protect, isAdminOrLotteryStaff, verifyPayment);
router.post('/payments/:id/reject', protect, isAdminOrLotteryStaff, rejectPayment);

module.exports = router;
