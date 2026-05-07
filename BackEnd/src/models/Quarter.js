const mongoose = require('mongoose');
const { QUARTER_STATUS_VALUES } = require('../config/constants');

const quarterSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: [true, 'Quarter label is required'],
      unique: true,
      trim: true, // e.g. "Q3-2026"
    },
    status: {
      type: String,
      enum: QUARTER_STATUS_VALUES,
      default: 'open',
    },
    openedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    closedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    openedAt: {
      type: Date,
      default: Date.now,
    },
    closedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: false,
  }
);

quarterSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Quarter', quarterSchema);
