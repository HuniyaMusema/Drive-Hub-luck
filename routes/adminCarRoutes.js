const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');

const {
  addCar,
  getAllCars,
  getCarById,
  updateCar,
  deleteCar,
} = require('../controllers/adminCarController');

// All routes require authentication AND admin role
router.use(protect, admin);

router.route('/')
  .post(addCar)
  .get(getAllCars);

router.route('/:id')
  .get(getCarById)
  .put(updateCar)
  .delete(deleteCar);

module.exports = router;
