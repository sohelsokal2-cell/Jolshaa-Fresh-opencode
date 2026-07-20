/**
 * CSRF protection for state-mutating routes.
 * For JWT Bearer-token APIs, CSRF is mitigated by:
 * 1. Requiring Authorization: Bearer <token> header (browsers can't set custom headers cross-origin)
 * 2. Validating the Origin/Referer header matches the allowed frontend URL
 */
const ALLOWED_ORIGIN = process.env.FRONTEND_URL || 'http://localhost:5173';

function csrfMiddleware(req, res, next) {
  // Safe methods don't need CSRF protection
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();

  const origin = req.headers.origin || req.headers.referer || '';

  // Allow requests with no origin (server-to-server, curl, Postman in dev)
  if (!origin) {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ success: false, error: 'CSRF_BLOCKED', message: 'Origin header required.' });
    }
    return next();
  }

  if (!origin.startsWith(ALLOWED_ORIGIN)) {
    return res.status(403).json({ success: false, error: 'CSRF_BLOCKED', message: 'Cross-origin request blocked.' });
  }

  next();
}

module.exports = csrfMiddleware;
