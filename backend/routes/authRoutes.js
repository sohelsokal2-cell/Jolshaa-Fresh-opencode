const express = require('express');
const router = express.Router();
const { signup, login, logout, me, deleteAccount } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const csrfMiddleware = require('../middleware/csrfMiddleware');

// POST /api/auth/signup
router.post('/signup', csrfMiddleware, signup);

// POST /api/auth/login
router.post('/login', csrfMiddleware, login);

// POST /api/auth/logout
router.post('/logout', authMiddleware, csrfMiddleware, logout);

// GET /api/auth/me
router.get('/me', authMiddleware, me);

// POST /api/auth/delete-account
router.post('/delete-account', authMiddleware, csrfMiddleware, deleteAccount);

module.exports = router;
