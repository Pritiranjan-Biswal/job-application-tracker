const express = require('express');
const router = express.Router();
const { getProfile, updateProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // Protect all user routes

router.route('/profile')
  .get(getProfile)
  .put(updateProfile);

module.exports = router;
