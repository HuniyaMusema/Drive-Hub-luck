const express = require('express');
const router = express.Router();
const { getSettings, updateSetting, getPublicStats } = require('../controllers/settingsController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/stats', getPublicStats);

router.route('/')
  .get(getSettings);

router.route('/:key')
  .put(protect, admin, updateSetting);

module.exports = router;
