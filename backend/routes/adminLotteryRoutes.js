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

const { protect, authorize } = require('../middleware/authMiddleware');
const { requireModule, requirePermission } = require('../middleware/systemGuards');

// All routes require authentication AND authorized role/mode (admin/lottery_staff in lottery_mode)
router.use(protect, authorize(['admin', 'lottery_staff'], 'lottery_mode'));

// ── Admin-Only or Staff-Allowed Routes ──────────────────────────────────────
router.post('/', createLottery);
router.get('/', getAllLotteries);
router.get('/current', getCurrentLottery);
router.put('/:id/start', startLottery);
router.put('/:id/stop', stopLottery);

// ── Advanced Features with Module/Permission Guards ─────────────────────────
router.get('/payments', requireModule('lotteryModuleEnabled'), requirePermission('staffPaymentVerification'), getLotteryPayments);
router.get('/numbers', requireModule('lotteryModuleEnabled'), requirePermission('staffNumberGeneration'), getLotteryNumbers);
router.post('/payments/:id/verify', requireModule('lotteryModuleEnabled'), requirePermission('staffPaymentVerification'), verifyPayment);
router.post('/payments/:id/reject', requireModule('lotteryModuleEnabled'), requirePermission('staffPaymentVerification'), rejectPayment);

module.exports = router;

