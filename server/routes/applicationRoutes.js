const express = require('express');
const router = express.Router();
const {
  getApplications,
  getApplicationById,
  createApplication,
  updateApplication,
  deleteApplication,
  addTimelineEvent,
  getDashboardStats,
} = require('../controllers/applicationController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // Protect all application endpoints

router.get('/stats/dashboard', getDashboardStats);

router.route('/')
  .get(getApplications)
  .post(createApplication);

router.route('/:id')
  .get(getApplicationById)
  .put(updateApplication)
  .delete(deleteApplication);

router.post('/:id/timeline', addTimelineEvent);

module.exports = router;
