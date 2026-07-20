const express = require('express');
const router = express.Router();

// ── Mock payment routes (only available outside production) ──
if (process.env.NODE_ENV !== 'production') {
  const mockRoutes = require('./payments/mock');
  router.use('/mock', mockRoutes);
}

// ── SSLCommerz routes (TODO: add when real gateway is configured) ──
// const sslcommerzRoutes = require('./payments/sslcommerz');
// router.use('/sslcommerz', sslcommerzRoutes);

module.exports = router;
