const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
  getCars,
  getCarById,
  createCar,
  updateCar,
  deleteCar,
} = require('../controllers/carController');
const { protect, authorize } = require('../middleware/authMiddleware');

const { createClient } = require('@supabase/supabase-js');
const { supabase, supabaseAdmin } = require('../config/supabase');

// Multer Config
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/upload', protect, authorize(['admin'], 'car_mode'), upload.single('image'), async (req, res) => {
  const client = supabaseAdmin || supabase; // Fallback to public if admin not available
  
  if (!client) {
    return res.status(500).json({ message: 'Supabase is not configured. Please add SUPABASE_URL and SUPABASE_ANON_KEY to your .env file.' });
  }

  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    const file = req.file;
    const fileExt = path.extname(file.originalname);
    const fileName = `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
    const filePath = `${fileName}`;

    const { data, error } = await client.storage
      .from('Car images')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      });

    if (error) {
      throw error;
    }

    const { data: publicUrlData } = client.storage
      .from('Car images')
      .getPublicUrl(filePath);

    res.json({ 
      url: publicUrlData.publicUrl 
    });
  } catch (error) {
    console.error('[Upload]', error.message);
    res.status(500).json({ message: 'Upload to Supabase failed: ' + error.message });
  }
});
router.route('/').get(getCars).post(protect, authorize(['admin'], 'car_mode'), createCar);
router
  .route('/:id')
  .get(getCarById)
  .put(protect, authorize(['admin'], 'car_mode'), updateCar)
  .delete(protect, authorize(['admin'], 'car_mode'), deleteCar);

module.exports = router;

