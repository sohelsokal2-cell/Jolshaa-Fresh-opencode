const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const csrfMiddleware = require('../middleware/csrfMiddleware');
const { getTurnCredentials, getLivekitToken } = require('../controllers/callController');

// GET /api/calls/turn-credentials
router.get('/turn-credentials', authMiddleware, getTurnCredentials);

// POST /api/calls/livekit/token
router.post('/livekit/token', csrfMiddleware, authMiddleware, getLivekitToken);

module.exports = router;
