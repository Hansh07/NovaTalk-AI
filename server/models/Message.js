// models/Message.js - Message schema with reactions, threads, sentiment, translations
const mongoose = require('mongoose');

const reactionSchema = new mongoose.Schema({
  emoji: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { _id: false });

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  chat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true,
  },
  content: {
    type: String,
    default: '',
    trim: true,
  },
  type: {
    type: String,
    enum: ['text', 'image', 'file', 'voice', 'ai', 'system'],
    default: 'text',
  },
  attachments: [{
    url: String,
    publicId: String,
    type: { type: String }, // image, document, audio, video
    name: String,
    size: Number,
  }],
  reactions: [reactionSchema],
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null,
  },
  thread: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
  }],
  isEdited: {
    type: Boolean,
    default: false,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  isPinned: {
    type: Boolean,
    default: false,
  },
  // AI-powered metadata
  sentiment: {
    label: { type: String, enum: ['positive', 'negative', 'neutral', 'mixed'], default: 'neutral' },
    score: { type: Number, default: 0 },
  },
  toxicity: {
    isToxic: { type: Boolean, default: false },
    score: { type: Number, default: 0 },
    categories: [String],
  },
  translation: {
    originalLang: { type: String, default: '' },
    translatedText: { type: String, default: '' },
    targetLang: { type: String, default: '' },
  },
  // Voice message metadata
  voiceData: {
    duration: { type: Number, default: 0 },
    transcription: { type: String, default: '' },
    emotion: { type: String, default: '' },
  },
  readBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
}, {
  timestamps: true,
});

// Index for search
messageSchema.index({ content: 'text' });
messageSchema.index({ chat: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
