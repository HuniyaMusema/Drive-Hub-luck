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
const { requireModule, requirePermission } = require('../middleware/systemGuards');

// ── Admin-Only Routes ────────────────────────────────────────────────────────
router.post('/', protect, admin, createLottery);
router.put('/:id/start', protect, admin, startLottery);
router.put('/:id/stop', protect, admin, stopLottery);

// ── Admin-or-Lottery-Staff Routes ───────────────────────────────────────────
router.get('/', protect, isAdminOrLotteryStaff, requireModule('lotteryModuleEnabled'), getAllLotteries);
router.get('/current', protect, isAdminOrLotteryStaff, requireModule('lotteryModuleEnabled'), getCurrentLottery);
router.get('/payments', protect, isAdminOrLotteryStaff, requireModule('lotteryModuleEnabled'), requirePermission('staffPaymentVerification'), getLotteryPayments);
router.get('/numbers', protect, isAdminOrLotteryStaff, requireModule('lotteryModuleEnabled'), requirePermission('staffNumberGeneration'), getLotteryNumbers);
router.post('/payments/:id/verify', protect, isAdminOrLotteryStaff, requireModule('lotteryModuleEnabled'), requirePermission('staffPaymentVerification'), verifyPayment);
router.post('/payments/:id/reject', protect, isAdminOrLotteryStaff, requireModule('lotteryModuleEnabled'), requirePermission('staffPaymentVerification'), rejectPayment);

module.exports = router;
