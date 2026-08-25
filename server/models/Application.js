const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Application must belong to a user'],
      index: true,
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [100, 'Company name cannot exceed 100 characters'],
    },
    jobTitle: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: [100, 'Job title cannot exceed 100 characters'],
    },
    jobType: {
      type: String,
      enum: ['Full Time', 'Part Time', 'Internship', 'Contract', 'Remote'],
      default: 'Full Time',
    },
    location: {
      type: String,
      trim: true,
      default: 'Remote',
    },
    salary: {
      type: String,
      trim: true,
      default: 'Not Disclosed',
    },
    jobUrl: {
      type: String,
      trim: true,
      default: '',
    },
    appliedDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: [
        'Applied',
        'Online Assessment',
        'OA Cleared',
        'Interview',
        'Selected',
        'Rejected',
        'Withdrawn',
      ],
      default: 'Applied',
    },
    source: {
      type: String,
      enum: [
        'LinkedIn',
        'Indeed',
        'Naukri',
        'Company Portal',
        'Referral',
        'Glassdoor',
        'Campus Placement',
        'Other',
      ],
      default: 'LinkedIn',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    followUpDate: {
      type: Date,
      default: null,
    },
    resumeUrl: {
      type: String,
      default: '',
    },
    resumePublicId: {
      type: String,
      default: '',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound indexes for fast searching and filtering per user
applicationSchema.index({ userId: 1, status: 1 });
applicationSchema.index({ userId: 1, companyName: 1 });
applicationSchema.index({ userId: 1, appliedDate: -1 });

// Virtual population for timeline stages
applicationSchema.virtual('timeline', {
  ref: 'Timeline',
  localField: '_id',
  foreignField: 'applicationId',
});

// Virtual population for interviews
applicationSchema.virtual('interviews', {
  ref: 'Interview',
  localField: '_id',
  foreignField: 'applicationId',
});

const Application = mongoose.model('Application', applicationSchema);

module.exports = Application;
