const supabase = require('../config/supabaseClient');

// Validate email format
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// POST /api/auth/signup
async function signup(req, res) {
  try {
    const { name, email, phone, password, dateOfBirth, gender } = req.body;

    // --- Input validation ---
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Name is required.',
      });
    }

    if (!email || typeof email !== 'string' || email.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Email is required.',
      });
    }

    if (!isValidEmail(email.trim())) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_EMAIL',
        message: 'Email format is invalid.',
      });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'WEAK_PASSWORD',
        message: 'Password must be at least 6 characters.',
      });
    }

    const trimmedName  = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    // --- Step 1: Create user in Supabase Auth ---
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
    });

    if (authError) {
      // Duplicate email — Supabase returns this specific message
      if (
        authError.message.toLowerCase().includes('user already registered') ||
        authError.message.toLowerCase().includes('already been registered')
      ) {
        return res.status(409).json({
          success: false,
          error: 'EMAIL_ALREADY_EXISTS',
          message: 'An account with this email already exists.',
        });
      }

      return res.status(500).json({
        success: false,
        error: 'AUTH_ERROR',
        message: authError.message,
      });
    }

    const authUser = authData?.user;

    if (!authUser) {
      return res.status(500).json({
        success: false,
        error: 'AUTH_ERROR',
        message: 'User creation failed. No user returned from auth.',
      });
    }

    // --- Step 2: Insert row into profiles table ---
    const profileRow = {
      id:             authUser.id,
      name:           trimmedName,
      email:          trimmedEmail,
      phone:          phone?.trim() || null,
      date_of_birth:  dateOfBirth  || null,
      gender:         gender       || null,
    };

    const { error: profileError } = await supabase
      .from('profiles')
      .insert(profileRow);

    if (profileError) {
      // Auth user was created but profile insert failed.
      // Log clearly so this can be debugged/fixed — do NOT silently swallow.
      console.error('[signup] Profile insert failed for user', authUser.id, profileError.message);

      return res.status(500).json({
        success: false,
        error: 'PROFILE_INSERT_FAILED',
        message: 'Account created in auth but profile could not be saved. Contact support.',
      });
    }

    // --- Success ---
    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      user: {
        id:    authUser.id,
        name:  trimmedName,
        email: trimmedEmail,
      },
    });
  } catch (err) {
    console.error('[signup] Unexpected error:', err.message);
    return res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'An unexpected error occurred. Please try again.',
    });
  }
}

// POST /api/auth/login
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Email and password are required.',
      });
    }

    // Sign in with Supabase Auth
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (authError) {
      return res.status(401).json({
        success: false,
        error: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password.',
      });
    }

    const { session, user } = data;

    // Fetch user profile info from database
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      console.error('[login] Profile fetch failed for user', user.id, profileError?.message);
      return res.status(500).json({
        success: false,
        error: 'PROFILE_NOT_FOUND',
        message: 'Authentication succeeded, but profile was not found.',
      });
    }

    return res.json({
      success: true,
      session: {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      },
      user: {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        profilePhotoUrl: profile.profile_photo_url,
        isAdmin: profile.is_admin,
      },
    });
  } catch (err) {
    console.error('[login] Unexpected error:', err.message);
    return res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'An unexpected error occurred. Please try again.',
    });
  }
}

// POST /api/auth/logout
async function logout(req, res) {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return res.status(500).json({
        success: false,
        error: 'LOGOUT_ERROR',
        message: error.message,
      });
    }

    return res.json({
      success: true,
      message: 'Logged out successfully.',
    });
  } catch (err) {
    console.error('[logout] Unexpected error:', err.message);
    return res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'An unexpected error occurred. Please try again.',
    });
  }
}

// GET /api/auth/me
async function me(req, res) {
  try {
    // req.user is set by authMiddleware
    return res.json({
      success: true,
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        profilePhotoUrl: req.user.profile_photo_url,
        isAdmin: req.user.is_admin,
      },
    });
  } catch (err) {
    console.error('[me] Unexpected error:', err.message);
    return res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'An unexpected error occurred. Please try again.',
    });
  }
}

module.exports = { signup, login, logout, me };
