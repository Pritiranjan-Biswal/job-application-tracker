const User = require('../models/User');
const Application = require('../models/Application');

/**
 * @desc    Get current user profile with stats
 * @route   GET /api/users/profile
 * @access  Private
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const applicationCount = await Application.countDocuments({ userId: req.user._id });

    res.status(200).json({
      success: true,
      user,
      stats: {
        applicationCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile details
 * @route   PUT /api/users/profile
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const {
      name,
      avatar,
      headline,
      bio,
      skills,
      preferredRole,
      preferredLocation,
      githubUrl,
      linkedinUrl,
      portfolioUrl,
    } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name.trim();
    if (avatar !== undefined) user.avatar = avatar;
    if (headline !== undefined) user.headline = headline.trim();
    if (bio !== undefined) user.bio = bio.trim();
    if (skills) {
      user.skills = Array.isArray(skills)
        ? skills
        : skills.split(',').map((s) => s.trim()).filter(Boolean);
    }
    if (preferredRole !== undefined) user.preferredRole = preferredRole.trim();
    if (preferredLocation !== undefined) user.preferredLocation = preferredLocation.trim();
    if (githubUrl !== undefined) user.githubUrl = githubUrl.trim();
    if (linkedinUrl !== undefined) user.linkedinUrl = linkedinUrl.trim();
    if (portfolioUrl !== undefined) user.portfolioUrl = portfolioUrl.trim();

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
};
