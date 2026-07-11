const supabase = require('../config/supabaseClient');

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'No token provided.',
      });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify the token using Supabase Auth
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: authError ? authError.message : 'Invalid token.',
      });
    }

    // Fetch user's profile from the database
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return res.status(401).json({
        success: false,
        error: 'PROFILE_NOT_FOUND',
        message: 'User profile not found in database.',
      });
    }

    // Attach user profile to req.user
    req.user = profile;
    next();
  } catch (err) {
    console.error('[authMiddleware] Unexpected error:', err.message);
    return res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Authentication failed due to server error.',
    });
  }
}

module.exports = authMiddleware;
