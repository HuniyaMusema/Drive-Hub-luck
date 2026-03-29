const express = require('express');
const router = express.Router();
const {
  participateLottery,
  getLotteryEntries,
  pickWinner,
  getTakenNumbers,
  submitLotteryPayment
} = require('../controllers/lotteryController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { requireModule } = require('../middleware/systemGuards');

router.route('/').get(protect, authorize(['admin', 'lottery_staff'], 'lottery_mode'), getLotteryEntries);
<<<<<<< HEAD
router.get('/taken', protect, getTakenNumbers);
router.post('/participate', protect, requireModule('lotteryModuleEnabled'), participateLottery);
router.post('/submit-payment', protect, submitLotteryPayment);
=======
router.post('/participate', protect, requireModule('lotteryModuleEnabled'), participateLottery);
>>>>>>> 326023c160955673a9228ba12856ca7c2ba911e9
router.put('/pick-winner', protect, authorize(['admin', 'lottery_staff'], 'lottery_mode'), pickWinner);

module.exports = router;

