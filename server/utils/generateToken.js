const jwt = require('jsonwebtoken');

/**
 * Generate a signed JWT token and attach it as an HTTP-only secure cookie.
 * @param {Object} res - Express response object
 * @param {Object} user - Mongoose User document
 * @returns {string} - Generated JWT token
 */
const generateTokenAndSetCookie = (res, user) => {
  const payload = {
    id: user._id,
    role: user.role,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET || 'fallback_secret_key_job_tracker_2026', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

  const cookieOptions = {
    httpOnly: true, // Prevents XSS attacks from reading the cookie
    secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // CSRF protection
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    path: '/',
  };

  res.cookie('jwt', token, cookieOptions);

  return token;
};

module.exports = generateTokenAndSetCookie;
