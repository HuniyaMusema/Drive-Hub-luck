const express = require('express');
const router  = express.Router();

const {
  createLottery,
  getCurrentLottery,
  startLottery,
  stopLottery,
  getAllLotteries,
} = require('../controllers/adminLotteryController');

const { protect, admin } = require('../middleware/authMiddleware');

// All routes require authentication AND admin role
router.use(protect, admin);

// POST   /api/admin/lottery          → create new lottery
router.post('/', createLottery);

// GET    /api/admin/lottery          → list all lotteries (history)
router.get('/', getAllLotteries);

// GET    /api/admin/lottery/current  → get the active lottery
router.get('/current', getCurrentLottery);

// PUT    /api/admin/lottery/:id/start → activate a lottery
router.put('/:id/start', startLottery);

// PUT    /api/admin/lottery/:id/stop  → close a lottery
router.put('/:id/stop', stopLottery);

module.exports = router;
