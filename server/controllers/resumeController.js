const User = require('../models/User');
const Application = require('../models/Application');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');

/**
 * @desc    Upload resume PDF/DOC file to Cloudinary & update user profile
 * @route   POST /api/resumes/upload
 * @access  Private
 */
const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please select a file to upload.',
      });
    }

    const { applicationId } = req.body;

    // Upload to Cloudinary (or fallback to local static URL)
    const uploadResult = await uploadToCloudinary(
      req.file.path,
      'job_tracker/resumes',
      'auto'
    );

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // If user already had a Cloudinary resume, remove the old one in background
    if (user.resume && user.resume.publicId) {
      deleteFromCloudinary(user.resume.publicId).catch((err) =>
        console.error('Failed to clean up old resume:', err.message)
      );
    }

    // Update user profile with latest resume metadata
    user.resume = {
      url: uploadResult.url,
      publicId: uploadResult.publicId,
      fileName: req.file.originalname,
      uploadedAt: new Date(),
    };
    await user.save();

    // If an applicationId was specified, attach this resume to the application
    if (applicationId) {
      await Application.findOneAndUpdate(
        { _id: applicationId, userId: req.user._id },
        {
          resumeUrl: uploadResult.url,
          resumePublicId: uploadResult.publicId,
        }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Resume uploaded successfully!',
      resume: user.resume,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current user's resume metadata
 * @route   GET /api/resumes
 * @access  Private
 */
const getResume = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.status(200).json({
      success: true,
      resume: user.resume || null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete current resume
 * @route   DELETE /api/resumes
 * @access  Private
 */
const deleteResume = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.resume && user.resume.publicId) {
      await deleteFromCloudinary(user.resume.publicId);
    }

    user.resume = {
      url: '',
      publicId: '',
      fileName: '',
      uploadedAt: null,
    };
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Resume removed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadResume,
  getResume,
  deleteResume,
};
