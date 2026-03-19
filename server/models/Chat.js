// models/Chat.js - Chat/Room schema for 1-on-1 and group chats
const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  chatName: {
    type: String,
    trim: true,
    default: 'Unnamed Chat',
  },
  isGroupChat: {
    type: Boolean,
    default: false,
  },
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  latestMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
  },
  pinnedMessages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
  }],
  avatar: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
    maxlength: 500,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Chat', chatSchema);
