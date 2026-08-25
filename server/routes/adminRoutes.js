const express = require('express');
const router = express.Router();
const {
  getAdminDashboardStats,
  getUsers,
  getUserDetails,
  toggleUserBlock,
  deleteUser,
  getAllApplications,
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/adminMiddleware');

// Enforce both JWT authentication and Admin RBAC for all admin routes
router.use(protect, requireAdmin);

router.get('/dashboard', getAdminDashboardStats);
router.get('/applications', getAllApplications);

router.route('/users')
  .get(getUsers);

router.route('/users/:id')
  .get(getUserDetails)
  .delete(deleteUser);

router.patch('/users/:id/status', toggleUserBlock);

module.exports = router;
