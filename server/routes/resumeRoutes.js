const express = require('express');
const router = express.Router();
const {
  uploadResume,
  getResume,
  deleteResume,
} = require('../controllers/resumeController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(protect); // Protect all resume routes

router.route('/')
  .get(getResume)
  .delete(deleteResume);

router.post('/upload', upload.single('resume'), uploadResume);

module.exports = router;
