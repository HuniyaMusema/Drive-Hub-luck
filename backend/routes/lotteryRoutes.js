const express = require('express');
const router = express.Router();
const {
  participateLottery,
  getLotteryEntries,
  pickWinner
} = require('../controllers/lotteryController');
const { protect, admin } = require('../middleware/authMiddleware');
const { requireModule } = require('../middleware/systemGuards');

router.route('/').get(protect, admin, getLotteryEntries);
router.post('/participate', protect, requireModule('lotteryModuleEnabled'), participateLottery);
router.put('/pick-winner', protect, admin, pickWinner);

module.exports = router;
