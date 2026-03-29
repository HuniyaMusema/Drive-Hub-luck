const express = require('express');
const router = express.Router();
const { createBackup, getBackups } = require('../controllers/backupController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, admin, getBackups)
  .post(protect, admin, createBackup);

module.exports = router;
