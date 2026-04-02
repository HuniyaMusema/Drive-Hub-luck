const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, getProfileHistory, updateUserLanguage } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.get('/profile-history', protect, getProfileHistory);
router.patch('/language', protect, updateUserLanguage);

module.exports = router;
