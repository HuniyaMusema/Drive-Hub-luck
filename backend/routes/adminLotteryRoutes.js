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
router.get('/', protect, isAdminOrLotteryStaff, requireModule('Lottery_Module_Active'), getAllLotteries);
router.get('/current', protect, isAdminOrLotteryStaff, requireModule('Lottery_Module_Active'), getCurrentLottery);
router.get('/payments', protect, isAdminOrLotteryStaff, requireModule('Lottery_Module_Active'), requirePermission('Staff_Can_View_Payments'), getLotteryPayments);
router.get('/numbers', protect, isAdminOrLotteryStaff, requireModule('Lottery_Module_Active'), getLotteryNumbers);
router.post('/payments/:id/verify', protect, isAdminOrLotteryStaff, requireModule('Lottery_Module_Active'), requirePermission('Staff_Can_Verify_Payments'), verifyPayment);
router.post('/payments/:id/reject', protect, isAdminOrLotteryStaff, requireModule('Lottery_Module_Active'), requirePermission('Staff_Can_Verify_Payments'), rejectPayment);

module.exports = router;
