const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, getProfileHistory, updateUserLanguage, forgotPassword, resetPassword, verifyEmail, resendVerification } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.get('/profile-history', protect, getProfileHistory);
router.patch('/language', protect, updateUserLanguage);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);

module.exports = router;
