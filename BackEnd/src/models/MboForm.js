const mongoose = require('mongoose');
const { MBO_STATUS_VALUES, REVIEW_DECISION_VALUES } = require('../config/constants');

const objectiveSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Objective title is required'],
      trim: true,
    },
    keyResults: {
      type: [String],
      validate: {
        validator: (v) => Array.isArray(v) && v.length >= 1,
        message: 'At least one key result is required',
      },
    },
    progress: {
      type: String,
      required: [true, 'Progress is required'],
    },
    selfScore: {
      type: Number,
      required: [true, 'Self score is required'],
      min: 1,
      max: 100,
    },
    notes: {
      type: String,
      default: '',
    },
    accomplishment: {
      type: String,
      default: '',
    },
    managerComment: {
      type: String,
      default: '',
    },
    achievedPercent: {
      type: Number,
      min: 0,
      max: 100,
    },
    accomplished: {
      type: Boolean,
    },
  },
  { _id: false }
);

const mentorReviewSchema = new mongoose.Schema(
  {
    decision: {
      type: String,
      enum: REVIEW_DECISION_VALUES,
    },
    comment: {
      type: String,
    },
    reviewedAt: {
      type: Date,
    },
    mentorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { _id: false }
);

const mboFormSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    quarterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quarter',
      required: true,
    },
    objectives: {
      type: [objectiveSchema],
      default: [],
    },
    status: {
      type: String,
      enum: MBO_STATUS_VALUES,
      default: 'draft',
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
    submissionCount: {
      type: Number,
      default: 0,
    },
    mentorReview: {
      type: mentorReviewSchema,
      default: null,
    },
    finalReview: {
      type: mentorReviewSchema,
      default: null,
    },
    submittedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: { createdAt: false, updatedAt: 'updatedAt' },
  }
);

// ── Compound unique index: one form per employee per quarter ──
mboFormSchema.index({ employeeId: 1, quarterId: 1 }, { unique: true });
mboFormSchema.index({ status: 1 });
mboFormSchema.index({ quarterId: 1 });

mboFormSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('MboForm', mboFormSchema);
