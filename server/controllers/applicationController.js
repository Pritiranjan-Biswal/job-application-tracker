const mongoose = require('mongoose');
const Application = require('../models/Application');
const Timeline = require('../models/Timeline');
const Interview = require('../models/Interview');

/**
 * @desc    Get all applications for current user with Search, Filter, Sort & Pagination
 * @route   GET /api/applications
 * @access  Private
 */
const getApplications = async (req, res, next) => {
  try {
    const {
      search,
      status,
      jobType,
      source,
      priority,
      startDate,
      endDate,
      sort = 'newest',
      page = 1,
      limit = 10,
    } = req.query;

    // Base query scoped to the authenticated user
    const query = { userId: req.user._id };

    // 1. Search filter across companyName, jobTitle, and location
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { companyName: searchRegex },
        { jobTitle: searchRegex },
        { location: searchRegex },
      ];
    }

    // 2. Direct filter criteria
    if (status && status !== 'all') {
      query.status = status;
    }
    if (jobType && jobType !== 'all') {
      query.jobType = jobType;
    }
    if (source && source !== 'all') {
      query.source = source;
    }
    if (priority && priority !== 'all') {
      query.priority = priority;
    }

    // 3. Date range filter on appliedDate
    if (startDate || endDate) {
      query.appliedDate = {};
      if (startDate) query.appliedDate.$gte = new Date(startDate);
      if (endDate) query.appliedDate.$lte = new Date(endDate);
    }

    // 4. Sorting logic
    let sortOptions = {};
    switch (sort) {
      case 'oldest':
        sortOptions = { appliedDate: 1 };
        break;
      case 'company-asc':
        sortOptions = { companyName: 1 };
        break;
      case 'company-desc':
        sortOptions = { companyName: -1 };
        break;
      case 'followUpDate-asc':
        sortOptions = { followUpDate: 1 };
        break;
      case 'newest':
      default:
        sortOptions = { appliedDate: -1, createdAt: -1 };
        break;
    }

    // 5. Pagination calculation
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    // Execute queries in parallel for performance
    const [totalApplications, applications] = await Promise.all([
      Application.countDocuments(query),
      Application.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
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

/**
 * @desc    Get single application by ID with timeline and interviews
 * @route   GET /api/applications/:id
 * @access  Private
 */
const getApplicationById = async (req, res, next) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      userId: req.user._id, // Enforce ownership
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found or unauthorized access.',
      });
    }

    // Fetch timeline and interviews
    const [timeline, interviews] = await Promise.all([
      Timeline.find({ applicationId: application._id }).sort({ date: 1, createdAt: 1 }),
      Interview.find({ applicationId: application._id }).sort({ interviewDate: 1 }),
    ]);

    res.status(200).json({
      success: true,
      application,
      timeline,
      interviews,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new job application
 * @route   POST /api/applications
 * @access  Private
 */
const createApplication = async (req, res, next) => {
  try {
    const {
      companyName,
      jobTitle,
      jobType,
      location,
      salary,
      jobUrl,
      appliedDate,
      status = 'Applied',
      source,
      notes,
      followUpDate,
      priority,
      resumeUrl,
      resumePublicId,
    } = req.body;

    if (!companyName || !jobTitle) {
      return res.status(400).json({
        success: false,
        message: 'Please provide company name and job title.',
      });
    }

    // 1. Create application
    const application = await Application.create({
      userId: req.user._id,
      companyName: companyName.trim(),
      jobTitle: jobTitle.trim(),
      jobType: jobType || 'Full Time',
      location: location || 'Remote',
      salary: salary || 'Not Disclosed',
      jobUrl: jobUrl || '',
      appliedDate: appliedDate || Date.now(),
      status: status || 'Applied',
      source: source || 'LinkedIn',
      notes: notes || '',
      followUpDate: followUpDate || null,
      priority: priority || 'Medium',
      resumeUrl: resumeUrl || '',
      resumePublicId: resumePublicId || '',
    });

    // 2. Automatically record initial timeline event
    await Timeline.create({
      applicationId: application._id,
      userId: req.user._id,
      status: application.status,
      description: `Application logged for ${application.jobTitle} at ${application.companyName} via ${application.source}.`,
      date: application.appliedDate || Date.now(),
    });

    res.status(201).json({
      success: true,
      message: 'Job application created successfully!',
      application,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an existing job application
 * @route   PUT /api/applications/:id
 * @access  Private
 */
const updateApplication = async (req, res, next) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found or unauthorized access.',
      });
    }

    const previousStatus = application.status;
    const newStatus = req.body.status;

    // Update application fields
    const updatedApplication = await Application.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    // If status transitioned, automatically add a Timeline history event
    if (newStatus && newStatus !== previousStatus) {
      let description = `Status changed from ${previousStatus} to ${newStatus}.`;
      if (newStatus === 'Online Assessment') {
        description = 'Received Online Assessment link/invitation.';
      } else if (newStatus === 'OA Cleared') {
        description = 'Successfully passed Online Assessment round!';
      } else if (newStatus === 'Interview') {
        description = 'Interview invitation received and scheduled.';
      } else if (newStatus === 'Selected') {
        description = 'Received Job Offer / Selection confirmation! 🎉';
      } else if (newStatus === 'Rejected') {
        description = 'Application status updated to Rejected.';
      }

      await Timeline.create({
        applicationId: application._id,
        userId: req.user._id,
        status: newStatus,
        description: req.body.timelineNote || description,
        date: new Date(),
      });
    }

    res.status(200).json({
      success: true,
      message: 'Application updated successfully!',
      application: updatedApplication,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete an application and its associated timeline/interviews
 * @route   DELETE /api/applications/:id
 * @access  Private
 */
const deleteApplication = async (req, res, next) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found or unauthorized access.',
      });
    }

    // Cascade delete timeline records & interviews
    await Promise.all([
      Timeline.deleteMany({ applicationId: application._id }),
      Interview.deleteMany({ applicationId: application._id }),
      Application.findByIdAndDelete(application._id),
    ]);

    res.status(200).json({
      success: true,
      message: 'Application and associated data deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add custom timeline milestone or note to an application
 * @route   POST /api/applications/:id/timeline
 * @access  Private
 */
const addTimelineEvent = async (req, res, next) => {
  try {
    const { status, description, date } = req.body;

    const application = await Application.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found or unauthorized access.',
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a status or event title.',
      });
    }

    const event = await Timeline.create({
      applicationId: application._id,
      userId: req.user._id,
      status: status.trim(),
      description: description || '',
      date: date || new Date(),
    });

    res.status(201).json({
      success: true,
      message: 'Timeline event added.',
      event,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get dashboard metrics & aggregation analytics for authenticated user
 * @route   GET /api/applications/stats/dashboard
 * @access  Private
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);

    // 1. Status breakdown aggregation
    const statusCountsAggregate = await Application.aggregate([
      { $match: { userId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
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

    let totalApplications = 0;
    statusCountsAggregate.forEach((item) => {
      if (statusCounts[item._id] !== undefined) {
        statusCounts[item._id] = item.count;
      }
      totalApplications += item.count;
    });

    // 2. Monthly applications velocity (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const monthlyTrendAggregate = await Application.aggregate([
      {
        $match: {
          userId,
          appliedDate: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$appliedDate' },
            month: { $month: '$appliedDate' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Format monthly data with friendly month names
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyTrend = [];

    // Create 6-month continuous timeline
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const monthLabel = `${monthNames[month - 1]} ${year.toString().slice(-2)}`;

      const found = monthlyTrendAggregate.find(
        (m) => m._id.year === year && m._id.month === month
      );

      monthlyTrend.push({
        month: monthLabel,
        applications: found ? found.count : 0,
      });
    }

    // 3. Application source breakdown
    const sourceBreakdownAggregate = await Application.aggregate([
      { $match: { userId } },
      { $group: { _id: '$source', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const sourceBreakdown = sourceBreakdownAggregate.map((item) => ({
      source: item._id || 'Other',
      count: item.count,
    }));

    // 4. Conversion rates calculation
    const oaClearedCount = statusCounts['OA Cleared'] + statusCounts['Interview'] + statusCounts['Selected'];
    const interviewCount = statusCounts['Interview'] + statusCounts['Selected'];
    const selectedCount = statusCounts['Selected'];

    const interviewConversionRate = totalApplications > 0
      ? ((interviewCount / totalApplications) * 100).toFixed(1)
      : 0;

    const selectionRate = totalApplications > 0
      ? ((selectedCount / totalApplications) * 100).toFixed(1)
      : 0;

    // 5. Upcoming interviews (within next 14 days)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingInterviews = await Interview.find({
      userId,
      interviewDate: { $gte: today },
      status: { $in: ['Scheduled', 'Rescheduled'] },
    })
      .sort({ interviewDate: 1 })
      .limit(5)
      .lean();

    // 6. Upcoming follow-ups
    const upcomingFollowUps = await Application.find({
      userId,
      followUpDate: { $gte: today },
      status: { $nin: ['Selected', 'Rejected', 'Withdrawn'] },
    })
      .sort({ followUpDate: 1 })
      .limit(5)
      .select('companyName jobTitle followUpDate status')
      .lean();

    res.status(200).json({
      success: true,
      stats: {
        totalApplications,
        statusCounts,
        interviewConversionRate: Number(interviewConversionRate),
        selectionRate: Number(selectionRate),
        monthlyTrend,
        sourceBreakdown,
        upcomingInterviews,
        upcomingFollowUps,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getApplications,
  getApplicationById,
  createApplication,
  updateApplication,
  deleteApplication,
  addTimelineEvent,
  getDashboardStats,
};
