require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const healthRoutes = require('./routes/healthRoutes');
const authRoutes   = require('./routes/authRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const callRoutes   = require('./routes/callRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Security headers
app.use(helmet());

// CORS — only allow configured origin
const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(cors({
  origin: allowedOrigin,
  credentials: true,
}));

// Rate limiting — global
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'TOO_MANY_REQUESTS', message: 'Too many requests, please try again later.' },
});
app.use(globalLimiter);

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'TOO_MANY_REQUESTS', message: 'Too many auth attempts, please try again later.' },
});

app.use(express.json({ limit: '1mb' }));

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth',   authLimiter, authRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/calls', callRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error('[server] Unhandled error:', err.message);
  res.status(500).json({ success: false, error: 'SERVER_ERROR', message: 'An unexpected error occurred.' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Jolshaa backend running on http://localhost:${PORT}`);
});
