const express = require('express');
const router = express.Router();
const {
  getCars,
  getCarById,
  createCar,
  updateCar,
  deleteCar,
} = require('../controllers/carController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/').get(getCars).post(protect, authorize(['admin'], 'car_mode'), createCar);
router
  .route('/:id')
  .get(getCarById)
  .put(protect, authorize(['admin'], 'car_mode'), updateCar)
  .delete(protect, authorize(['admin'], 'car_mode'), deleteCar);

module.exports = router;

