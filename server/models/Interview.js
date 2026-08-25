const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema(
  {
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: [true, 'Interview must be associated with an application'],
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Interview must belong to a user'],
      index: true,
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    jobTitle: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
    },
    round: {
      type: String,
      required: [true, 'Interview round name is required'],
      default: 'Technical Round 1',
      trim: true,
    },
    interviewType: {
      type: String,
      default: 'Google Meet',
      trim: true,
    },
    interviewDate: {
      type: Date,
      required: [true, 'Interview date and time is required'],
      index: true,
    },
    meetingLink: {
      type: String,
      trim: true,
      default: '',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['Scheduled', 'Completed', 'Rescheduled', 'Cancelled'],
      default: 'Scheduled',
    },
    feedback: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for querying upcoming interviews efficiently
interviewSchema.index({ userId: 1, interviewDate: 1 });
interviewSchema.index({ userId: 1, status: 1 });

const Interview = mongoose.model('Interview', interviewSchema);

module.exports = Interview;
