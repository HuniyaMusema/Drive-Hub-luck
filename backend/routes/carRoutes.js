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

// Multer Config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`);
  }
});

const upload = multer({ storage: storage });

router.post('/upload', protect, authorize(['admin'], 'car_mode'), upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  res.json({ 
    url: `/uploads/${req.file.filename}` 
  });
});
router.route('/').get(getCars).post(protect, authorize(['admin'], 'car_mode'), createCar);
router
  .route('/:id')
  .get(getCarById)
  .put(protect, authorize(['admin'], 'car_mode'), updateCar)
  .delete(protect, authorize(['admin'], 'car_mode'), deleteCar);

module.exports = router;

