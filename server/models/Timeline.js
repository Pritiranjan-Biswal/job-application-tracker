const mongoose = require('mongoose');

const timelineSchema = new mongoose.Schema(
  {
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: [true, 'Timeline event must belong to an application'],
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Timeline event must belong to a user'],
      index: true,
    },
    status: {
      type: String,
      required: [true, 'Status is required for timeline event'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

timelineSchema.index({ applicationId: 1, date: 1 });

const Timeline = mongoose.model('Timeline', timelineSchema);

module.exports = Timeline;
