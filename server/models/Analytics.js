// models/Analytics.js - Analytics schema for tracking user/team engagement
const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  chat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
  },
  date: {
    type: Date,
    default: Date.now,
  },
  messageCount: {
    type: Number,
    default: 0,
  },
  sentimentScores: {
    positive: { type: Number, default: 0 },
    negative: { type: Number, default: 0 },
    neutral: { type: Number, default: 0 },
  },
  activityHours: [{
    hour: Number, // 0-23
    count: Number,
  }],
  productivityScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  communicationScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  topEmojis: [{
    emoji: String,
    count: Number,
  }],
  avgResponseTime: {
    type: Number, // in seconds
    default: 0,
  },
}, {
  timestamps: true,
});

analyticsSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('Analytics', analyticsSchema);
