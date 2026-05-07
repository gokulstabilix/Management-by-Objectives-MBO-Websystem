const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { ROLE_VALUES, LEVEL_VALUES } = require('../config/constants');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      select: false, // never returned by default
    },
    role: {
      type: String,
      enum: ROLE_VALUES,
      default: 'employee',
    },
    level: {
      type: String,
      enum: LEVEL_VALUES,
      default: null,
    },
    department: {
      type: String,
      default: null,
      trim: true,
    },
    mentorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: false },
  }
);

// ── Indexes ──────────────────────────────────
userSchema.index({ mentorId: 1 });
userSchema.index({ role: 1, level: 1 });

// ── Sanitize JSON output ─────────────────────
userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.passwordHash;
    delete ret.__v;
    return ret;
  },
});

userSchema.set('toObject', {
  transform: (_doc, ret) => {
    delete ret.passwordHash;
    delete ret.__v;
    return ret;
  },
});

// ── Pre-save: hash password ──────────────────
userSchema.pre('save', async function () {
  if (!this.isModified('passwordHash')) return;
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
});

// ── Instance method: compare password ────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

module.exports = mongoose.model('User', userSchema);
