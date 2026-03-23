const express = require('express');
const router  = express.Router();

const { getPendingPayments, approvePayment, rejectPayment } = require('../controllers/adminPaymentController');
const { protect, admin }                                     = require('../middleware/authMiddleware');

// All routes require authentication AND admin role
router.use(protect, admin);

// GET  /api/admin/payments/pending      → list all pending payments
router.get('/pending', getPendingPayments);

// PUT  /api/admin/payments/:id/approve  → approve a payment
router.put('/:id/approve', approvePayment);

// PUT  /api/admin/payments/:id/reject   → reject a payment
router.put('/:id/reject', rejectPayment);

module.exports = router;
