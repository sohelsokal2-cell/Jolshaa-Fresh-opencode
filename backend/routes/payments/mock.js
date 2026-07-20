const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/authMiddleware');
const csrfMiddleware = require('../../middleware/csrfMiddleware');
const { mockInitPayment, mockConfirmPayment } = require('../../controllers/mockPaymentController');

// POST /api/payments/mock/init
router.post('/init', csrfMiddleware, authMiddleware, mockInitPayment);

// POST /api/payments/mock/confirm
router.post('/confirm', csrfMiddleware, authMiddleware, mockConfirmPayment);

module.exports = router;
