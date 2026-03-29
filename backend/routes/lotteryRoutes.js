const express = require('express');
const router = express.Router();
const {
  participateLottery,
  getLotteryEntries,
  pickWinner
} = require('../controllers/lotteryController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { requireModule } = require('../middleware/systemGuards');

router.route('/').get(protect, authorize(['admin', 'lottery_staff'], 'lottery_mode'), getLotteryEntries);
router.post('/participate', protect, requireModule('lotteryModuleEnabled'), participateLottery);
router.put('/pick-winner', protect, authorize(['admin', 'lottery_staff'], 'lottery_mode'), pickWinner);

module.exports = router;

