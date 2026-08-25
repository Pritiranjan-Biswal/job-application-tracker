const User = require('../models/User');
const generateTokenAndSetCookie = require('../utils/generateToken');
const { sendWelcomeEmail } = require('../utils/emailService');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/signup
 * @access  Public
 */
const signup = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Validate inputs
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match.',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    // Enforce default 'user' role — NEVER permit public signup to assign 'admin'
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: 'user',
      isBlocked: false,
    });

    // Generate JWT and attach HTTP-only cookie
    const token = generateTokenAndSetCookie(res, user);

    // Asynchronously send welcome email without blocking response
    sendWelcomeEmail(user).catch((err) =>
      console.error('Welcome email error:', err.message)
    );

    // Return sanitized user object
    res.status(201).json({
      success: true,
      message: 'Account registered successfully!',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        headline: user.headline,
        skills: user.skills,
        preferredRole: user.preferredRole,
        preferredLocation: user.preferredLocation,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user & get token in HTTP-only cookie
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    // Find user by email and explicitly select password field
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Compare password with bcrypt
    const isPasswordMatched = await user.comparePassword(password);
    if (!isPasswordMatched) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Check if account is suspended
    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended by an administrator. Please contact support.',
      });
    }

    // Generate JWT and attach HTTP-only cookie
    const token = generateTokenAndSetCookie(res, user);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully!',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        headline: user.headline,
        bio: user.bio,
        skills: user.skills,
        preferredRole: user.preferredRole,
        preferredLocation: user.preferredLocation,
        githubUrl: user.githubUrl,
        linkedinUrl: user.linkedinUrl,
        portfolioUrl: user.portfolioUrl,
        resume: user.resume,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout user & clear HTTP-only cookie
 * @route   POST /api/auth/logout
 * @access  Public
 */
const logout = (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
};

/**
 * @desc    Get currently authenticated user's session profile
 * @route   GET /api/auth/me
 * @access  Private (User/Admin)
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User session not found.',
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update current user's password
 * @route   PUT /api/auth/update-password
 * @access  Private
 */
const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both current and new password.',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.',
      });
    }

    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect.',
      });
    }

    user.password = newPassword;
    await user.save();

    // Re-issue token cookie
    generateTokenAndSetCookie(res, user);

    res.status(200).json({
      success: true,
      message: 'Password updated successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signup,
  login,
  logout,
  getMe,
  updatePassword,
};
