const express = require('express');
const router = express.Router();
const {
  getInterviews,
  getUpcomingInterviews,
  createInterview,
  updateInterview,
  deleteInterview,
} = require('../controllers/interviewController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // Protect all interview endpoints

router.get('/upcoming', getUpcomingInterviews);

router.route('/')
  .get(getInterviews)
  .post(createInterview);

router.route('/:id')
  .put(updateInterview)
  .delete(deleteInterview);

module.exports = router;
