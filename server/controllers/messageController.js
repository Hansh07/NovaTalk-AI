// controllers/messageController.js - Message CRUD, reactions, search, threads
const Message = require('../models/Message');
const Chat = require('../models/Chat');
const aiService = require('../services/aiService');
const moderationService = require('../services/moderationService');
const analyticsService = require('../services/analyticsService');

// POST /api/messages - Send a message
const sendMessage = async (req, res) => {
  try {
    const { content, chatId, type = 'text', replyTo, attachments } = req.body;
    if (!chatId) return res.status(400).json({ message: 'chatId is required' });

    // Check if user is muted
    if (req.user.isMuted && req.user.mutedUntil > new Date()) {
      return res.status(403).json({ message: 'You are muted', mutedUntil: req.user.mutedUntil });
    }

    // Content moderation (async, non-blocking)
    let sentiment = { label: 'neutral', score: 0.5 };
    let toxicity = { isToxic: false, score: 0, categories: [] };

    if (content && type === 'text') {
      [sentiment, toxicity] = await Promise.all([
        aiService.analyzeSentiment(content),
        moderationService.moderateMessage(content, req.user._id),
      ]);

      if (toxicity.action === 'block') {
        return res.status(403).json({ message: 'Message blocked for policy violations' });
      }
    }

    const messageData = {
      sender: req.user._id,
      chat: chatId,
      content: content || '',
      type,
      replyTo: replyTo || null,
      attachments: attachments || [],
      sentiment,
      toxicity,
    };

    let message = await Message.create(messageData);
    message = await message.populate('sender', 'name avatar email');
    message = await message.populate('chat');
    message = await message.populate('replyTo');

    // Update chat's latest message
    await Chat.findByIdAndUpdate(chatId, { latestMessage: message._id });

    // Record analytics (async)
    analyticsService.recordMessage(req.user._id, chatId, sentiment);

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/messages/:chatId - Get messages for a chat
const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const messages = await Message.find({ chat: chatId, isDeleted: false })
      .populate('sender', 'name avatar email')
      .populate('replyTo')
      .populate('reactions.user', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Message.countDocuments({ chat: chatId, isDeleted: false });

    res.json({
      messages: messages.reverse(),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PUT /api/messages/:messageId - Edit a message
const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: 'Message not found' });
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    message.content = content;
    message.isEdited = true;
    await message.save();

    const updated = await Message.findById(messageId)
      .populate('sender', 'name avatar email');

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// DELETE /api/messages/:messageId - Soft delete a message
const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: 'Message not found' });
    if (message.sender.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    message.isDeleted = true;
    message.content = 'This message was deleted';
    await message.save();

    res.json({ message: 'Message deleted', id: messageId });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /api/messages/:messageId/react - Toggle reaction on message
const toggleReaction = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: 'Message not found' });

    const existingIndex = message.reactions.findIndex(
      r => r.emoji === emoji && r.user.toString() === req.user._id.toString()
    );

    if (existingIndex > -1) {
      message.reactions.splice(existingIndex, 1);
    } else {
      message.reactions.push({ emoji, user: req.user._id });
    }

    await message.save();

    const updated = await Message.findById(messageId)
      .populate('reactions.user', 'name avatar');

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/messages/:chatId/search - Search messages in chat
const searchMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { q } = req.query;
    if (!q) return res.json([]);

    const messages = await Message.find({
      chat: chatId,
      isDeleted: false,
      $text: { $search: q },
    })
      .populate('sender', 'name avatar email')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(messages);
  } catch (error) {
    // Fallback regex search if text index not available
    try {
      const messages = await Message.find({
        chat: req.params.chatId,
        isDeleted: false,
        content: { $regex: req.query.q, $options: 'i' },
      })
        .populate('sender', 'name avatar email')
        .sort({ createdAt: -1 })
        .limit(20);
      res.json(messages);
    } catch (e) {
      res.status(500).json({ message: 'Server error' });
    }
  }
};

// POST /api/messages/:messageId/thread - Reply in thread
const replyInThread = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content, type = 'text' } = req.body;

    const parentMessage = await Message.findById(messageId);
    if (!parentMessage) return res.status(404).json({ message: 'Message not found' });

    const reply = await Message.create({
      sender: req.user._id,
      chat: parentMessage.chat,
      content,
      type,
      replyTo: messageId,
    });

    parentMessage.thread.push(reply._id);
    await parentMessage.save();

    const populated = await reply.populate('sender', 'name avatar email');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  sendMessage, getMessages, editMessage, deleteMessage,
  toggleReaction, searchMessages, replyInThread,
};
