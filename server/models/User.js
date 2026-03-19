// models/User.js - User schema with roles, preferences, and toxicity tracking
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: 2,
    maxlength: 50,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: function() { return !this.googleId; },
    minlength: 6,
    select: false,
  },
  googleId: {
    type: String,
    sparse: true,
    unique: true,
  },
  avatar: {
    type: String,
    default: '',
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'owner'],
    default: 'user',
  },
  status: {
    type: String,
    enum: ['online', 'offline', 'away', 'busy'],
    default: 'offline',
  },
  statusMessage: {
    type: String,
    default: '',
    maxlength: 100,
  },
  lastSeen: {
    type: Date,
    default: Date.now,
  },
  preferences: {
    theme: { type: String, enum: ['dark', 'light'], default: 'dark' },
    language: { type: String, default: 'en' },
    notifications: { type: Boolean, default: true },
    translationEnabled: { type: Boolean, default: false },
  },
  toxicityScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  warnings: {
    type: Number,
    default: 0,
  },
  isMuted: {
    type: Boolean,
    default: false,
  },
  mutedUntil: {
    type: Date,
    default: null,
  },
  refreshToken: {
    type: String,
    select: false,
  },
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove sensitive fields from JSON output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
