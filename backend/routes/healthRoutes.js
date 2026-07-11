const express = require('express');
const router = express.Router();
const supabase = require('../config/supabaseClient');

// GET /api/health
// Basic server health — no DB call
router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Jolshaa backend is running',
  });
});

// GET /api/health/db
// Checks Supabase connection by counting rows in profiles table
router.get('/db', async (req, res) => {
  try {
    const { count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (error) {
      return res.status(500).json({
        status: 'error',
        database: 'connection failed',
        message: error.message,
      });
    }

    return res.json({
      status: 'ok',
      database: 'connected',
      profileCount: count,
    });
  } catch (err) {
    return res.status(500).json({
      status: 'error',
      database: 'connection failed',
      message: err.message,
    });
  }
});

module.exports = router;
