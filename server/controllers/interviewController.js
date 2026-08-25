const Interview = require('../models/Interview');
const Application = require('../models/Application');
const Timeline = require('../models/Timeline');
const { sendInterviewReminder } = require('../utils/emailService');

/**
 * @desc    Get all interviews for current user
 * @route   GET /api/interviews
 * @access  Private
 */
const getInterviews = async (req, res, next) => {
  try {
    const { status, timeframe } = req.query;
    const query = { userId: req.user._id };

    if (status && status !== 'all') {
      query.status = status;
    }

    if (timeframe === 'upcoming') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      query.interviewDate = { $gte: today };
    } else if (timeframe === 'past') {
      const today = new Date();
      query.interviewDate = { $lt: today };
    }

    const interviews = await Interview.find(query)
      .sort({ interviewDate: 1 })
      .populate('applicationId', 'companyName jobTitle location status')
      .lean();

    res.status(200).json({
      success: true,
      count: interviews.length,
      interviews,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get upcoming interviews (for dashboard widget / alert)
 * @route   GET /api/interviews/upcoming
 * @access  Private
 */
const getUpcomingInterviews = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const interviews = await Interview.find({
      userId: req.user._id,
      interviewDate: { $gte: today },
      status: { $in: ['Scheduled', 'Rescheduled'] },
    })
      .sort({ interviewDate: 1 })
      .limit(10)
      .populate('applicationId', 'companyName jobTitle salary location')
      .lean();

    res.status(200).json({
      success: true,
      count: interviews.length,
      interviews,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Schedule / Create a new interview
 * @route   POST /api/interviews
 * @access  Private
 */
const createInterview = async (req, res, next) => {
  try {
    const {
      applicationId,
      companyName,
      jobTitle,
      round,
      interviewType,
      interviewDate,
      meetingLink,
      notes,
    } = req.body;

    if (!applicationId || !interviewDate || !round) {
      return res.status(400).json({
        success: false,
        message: 'Please provide application ID, interview round, and interview date.',
      });
    }

    // Verify application belongs to user
    const application = await Application.findOne({
      _id: applicationId,
      userId: req.user._id,
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Associated application not found.',
      });
    }

    const compName = companyName || application.companyName;
    const title = jobTitle || application.jobTitle;

    // 1. Create interview document
    const interview = await Interview.create({
      applicationId: application._id,
      userId: req.user._id,
      companyName: compName,
      jobTitle: title,
      round,
      interviewType: interviewType || 'Google Meet',
      interviewDate,
      meetingLink: meetingLink || '',
      notes: notes || '',
      status: 'Scheduled',
    });

    // 2. Automatically advance application stage to 'Interview' if it was in earlier stage
    if (['Applied', 'Online Assessment', 'OA Cleared'].includes(application.status)) {
      application.status = 'Interview';
      await application.save();
    }

    // 3. Log timeline event
    const formattedDate = new Date(interviewDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    await Timeline.create({
      applicationId: application._id,
      userId: req.user._id,
      status: 'Interview',
      description: `Interview Scheduled: ${round} via ${interview.interviewType} on ${formattedDate}.`,
      date: new Date(),
    });

    // 4. Send email alert asynchronously
    sendInterviewReminder(req.user, interview).catch((err) =>
      console.error('Interview reminder email error:', err.message)
    );

    res.status(201).json({
      success: true,
      message: 'Interview scheduled successfully!',
      interview,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update interview details / status
 * @route   PUT /api/interviews/:id
 * @access  Private
 */
const updateInterview = async (req, res, next) => {
  try {
    const interview = await Interview.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found or unauthorized access.',
      });
    }

    const previousStatus = interview.status;
    const updatedInterview = await Interview.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    // If status changed to Completed/Rescheduled, add note to timeline
    if (req.body.status && req.body.status !== previousStatus) {
      await Timeline.create({
        applicationId: interview.applicationId,
        userId: req.user._id,
        status: 'Interview',
        description: `Interview ${interview.round} marked as ${req.body.status}. ${req.body.feedback ? `Feedback: ${req.body.feedback}` : ''}`,
        date: new Date(),
      });
    }

    res.status(200).json({
      success: true,
      message: 'Interview updated successfully!',
      interview: updatedInterview,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete an interview
 * @route   DELETE /api/interviews/:id
 * @access  Private
 */
const deleteInterview = async (req, res, next) => {
  try {
    const interview = await Interview.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found or unauthorized access.',
      });
    }

    await Interview.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Interview deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInterviews,
  getUpcomingInterviews,
  createInterview,
  updateInterview,
  deleteInterview,
};
