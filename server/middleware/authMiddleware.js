const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect routes: Authenticate user using JWT from HTTP-only cookie or Authorization Header
 */
const protect = async (req, res, next) => {
  let token;

  // 1. Prioritize reading from HTTP-only Cookie
  if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  // 2. Fallback to Bearer token header (useful for API testing tools like Postman/cURL)
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized: No authentication token found. Please log in.',
    });
  }

  try {
    // Verify JWT
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'fallback_secret_key_job_tracker_2026'
    );

    // Fetch user without password
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.',
      });
    }

    // Check if user has been blocked by administrator
    if (user.isBlocked) {
      // Clear invalid cookie
      res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0),
      });

      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended by an administrator. Please contact support.',
      });
    }

    // Attach user document to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('JWT Verification Error:', error.message);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please log in again.',
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Not authorized: Invalid token verification.',
    });
  }
};

module.exports = { protect };
