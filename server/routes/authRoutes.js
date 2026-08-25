const express = require('express');
const router = express.Router();
const {
  signup,
  login,
  logout,
  getMe,
  updatePassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);

// Protected routes
router.get('/me', protect, getMe);
router.put('/update-password', protect, updatePassword);

module.exports = router;
