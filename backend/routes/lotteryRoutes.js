const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  participateLottery,
  getLotteryEntries,
  getTakenNumbers,
  submitLotteryPayment,
  getCurrentLottery
} = require('../controllers/lotteryController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { requireModule } = require('../middleware/systemGuards');

// Receipt image upload (multer)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename:    (req, file, cb) => cb(null, `receipt-${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`),
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit

router.post('/upload-receipt', protect, upload.single('receipt'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  res.json({ url: `/uploads/${req.file.filename}` });
});

router.route('/').get(protect, authorize(['admin', 'lottery_staff'], 'lottery_mode'), getLotteryEntries);
router.get('/taken', getTakenNumbers);
router.get('/current', getCurrentLottery);
router.post('/participate', protect, authorize(['user']), requireModule('lotteryModuleEnabled'), participateLottery);
router.post('/submit-payment', protect, authorize(['user']), submitLotteryPayment);

module.exports = router;


