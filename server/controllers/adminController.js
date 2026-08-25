const mongoose = require('mongoose');
const User = require('../models/User');
const Application = require('../models/Application');
const Interview = require('../models/Interview');
const Timeline = require('../models/Timeline');

/**
 * @desc    Get platform-wide analytics and statistics for Admin Dashboard
 * @route   GET /api/admin/dashboard
 * @access  Private/Admin
 */
const getAdminDashboardStats = async (req, res, next) => {
  try {
    // 1. Core counters
    const [
      totalUsers,
      activeUsers,
      blockedUsers,
      totalApplications,
      totalInterviews,
      totalSelected,
      totalRejected,
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'user', isBlocked: false }),
      User.countDocuments({ role: 'user', isBlocked: true }),
      Application.countDocuments(),
      Interview.countDocuments(),
      Application.countDocuments({ status: 'Selected' }),
      Application.countDocuments({ status: 'Rejected' }),
    ]);

    // 2. Global status breakdown aggregation
    const statusDistributionAggregate = await Application.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const statusCounts = {
      Applied: 0,
      'Online Assessment': 0,
      'OA Cleared': 0,
      Interview: 0,
      Selected: 0,
      Rejected: 0,
      Withdrawn: 0,
    };
    statusDistributionAggregate.forEach((item) => {
      if (statusCounts[item._id] !== undefined) {
        statusCounts[item._id] = item.count;
      }
    });

    // 3. User registration trend over the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const userRegistrationAggregate = await User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo }, role: 'user' } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const userGrowthTrend = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const monthLabel = `${monthNames[month - 1]} ${year.toString().slice(-2)}`;

      const found = userRegistrationAggregate.find(
        (u) => u._id.year === year && u._id.month === month
      );

      userGrowthTrend.push({
        month: monthLabel,
        users: found ? found.count : 0,
      });
    }

    // 4. Top companies applied across the platform
    const topCompaniesAggregate = await Application.aggregate([
      { $group: { _id: '$companyName', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 },
    ]);

    const topCompanies = topCompaniesAggregate.map((c) => ({
      company: c._id,
      count: c.count,
    }));

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        blockedUsers,
        totalApplications,
        totalInterviews,
        totalSelected,
        totalRejected,
        statusCounts,
        userGrowthTrend,
        topCompanies,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get paginated users list with search and filters
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
const getUsers = async (req, res, next) => {
  try {
    const {
      search,
      status, // 'active', 'blocked'
      role,   // 'user', 'admin'
      sort = 'newest',
      page = 1,
      limit = 10,
    } = req.query;

    const query = {};

    // Search by name or email
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: searchRegex }, { email: searchRegex }];
    }

    // Filter by active/blocked
    if (status === 'active') {
      query.isBlocked = false;
    } else if (status === 'blocked') {
      query.isBlocked = true;
    }

    // Filter by role
    if (role && role !== 'all') {
      query.role = role;
    }

    // Sorting
    let sortOptions = { createdAt: -1 };
    if (sort === 'oldest') sortOptions = { createdAt: 1 };
    if (sort === 'name-asc') sortOptions = { name: 1 };
    if (sort === 'name-desc') sortOptions = { name: -1 };

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    const [totalUsers, users] = await Promise.all([
      User.countDocuments(query),
      User.find(query).sort(sortOptions).skip(skip).limit(limitNum).lean(),
    ]);

    // Enhance users with their application count
    const userIds = users.map((u) => u._id);
    const appCounts = await Application.aggregate([
      { $match: { userId: { $in: userIds } } },
      { $group: { _id: '$userId', count: { $sum: 1 } } },
    ]);

    const countMap = {};
    appCounts.forEach((ac) => {
      countMap[ac._id.toString()] = ac.count;
    });

    const enrichedUsers = users.map((user) => ({
      ...user,
      applicationCount: countMap[user._id.toString()] || 0,
    }));

    const totalPages = Math.ceil(totalUsers / limitNum) || 1;

    res.status(200).json({
      success: true,
      count: enrichedUsers.length,
      totalUsers,
      totalPages,
      currentPage: pageNum,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1,
      users: enrichedUsers,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get detailed user information including their recent activity
 * @route   GET /api/admin/users/:id
 * @access  Private/Admin
 */
const getUserDetails = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const [applicationCount, interviewCount, recentApplications] = await Promise.all([
      Application.countDocuments({ userId: user._id }),
      Interview.countDocuments({ userId: user._id }),
      Application.find({ userId: user._id }).sort({ appliedDate: -1 }).limit(10),
    ]);

    res.status(200).json({
      success: true,
      user,
      stats: {
        applicationCount,
        interviewCount,
      },
      recentApplications,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle block/unblock status of a user
 * @route   PATCH /api/admin/users/:id/status
 * @access  Private/Admin
 */
const toggleUserBlock = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Safety guard: Admin cannot block their own account
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Security warning: You cannot block your own administrative account.',
      });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.name} has been ${user.isBlocked ? 'blocked' : 'unblocked'}.`,
      isBlocked: user.isBlocked,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a user and purge all their applications and interviews
 * @route   DELETE /api/admin/users/:id
 * @access  Private/Admin
 */
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Safety guard: Admin cannot delete their own account
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Security warning: You cannot delete your own administrative account.',
      });
    }

    // Cascade delete user data
    await Promise.all([
      Application.deleteMany({ userId: user._id }),
      Timeline.deleteMany({ userId: user._id }),
      Interview.deleteMany({ userId: user._id }),
      User.findByIdAndDelete(user._id),
    ]);

    res.status(200).json({
      success: true,
      message: `User ${user.name} and all associated records deleted successfully.`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all applications across platform (Admin oversight)
 * @route   GET /api/admin/applications
 * @access  Private/Admin
 */
const getAllApplications = async (req, res, next) => {
  try {
    const { search, status, page = 1, limit = 10 } = req.query;
    const query = {};

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ companyName: searchRegex }, { jobTitle: searchRegex }];
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    const [totalApplications, applications] = await Promise.all([
      Application.countDocuments(query),
      Application.find(query)
        .sort({ appliedDate: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('userId', 'name email avatar')
        .lean(),
    ]);

    const totalPages = Math.ceil(totalApplications / limitNum) || 1;

    res.status(200).json({
      success: true,
      count: applications.length,
      totalApplications,
      totalPages,
      currentPage: pageNum,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1,
      applications,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminDashboardStats,
  getUsers,
  getUserDetails,
  toggleUserBlock,
  deleteUser,
  getAllApplications,
};
