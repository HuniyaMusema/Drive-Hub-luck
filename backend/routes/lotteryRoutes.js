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

const { supabaseAdmin } = require('../config/supabase');

// Receipt image upload (multer memory storage)
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit

router.post('/upload-receipt', protect, upload.single('receipt'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  try {
    const fileName = `receipt-${Date.now()}-${req.file.originalname.replace(/\s+/g, '-')}`;
    
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not initialized');
    }

    const { data, error } = await supabaseAdmin.storage
      .from('receipts')
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false
      });

    if (error) {
      throw new Error(`Failed to upload to Supabase: ${error.message}`);
    }

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('receipts')
      .getPublicUrl(fileName);

    res.json({ url: publicUrl });
  } catch (error) {
    console.error('[upload-receipt]', error.message);
    res.status(500).json({ message: 'Upload failed.', details: error.message });
  }
});

router.route('/').get(protect, authorize(['admin', 'lottery_staff'], 'lottery_mode'), getLotteryEntries);
router.get('/taken', getTakenNumbers);
router.get('/current', getCurrentLottery);
router.post('/participate', protect, authorize(['user']), requireModule('lotteryModuleEnabled'), participateLottery);
router.post('/submit-payment', protect, authorize(['user']), submitLotteryPayment);

module.exports = router;


