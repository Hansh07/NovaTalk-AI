// controllers/chatController.js - Chat/room management handlers
const Chat = require('../models/Chat');
const User = require('../models/User');
const Message = require('../models/Message');

// POST /api/chats - Create or access a 1-on-1 chat
const accessChat = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: 'userId is required' });

    // Check if 1-on-1 chat already exists
    let chat = await Chat.findOne({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: req.user._id } } },
        { users: { $elemMatch: { $eq: userId } } },
      ],
    }).populate('users', '-password')
      .populate('latestMessage');

    if (chat) {
      return res.json(chat);
    }

    // Create new 1-on-1 chat
    const newChat = await Chat.create({
      chatName: 'Direct Message',
      isGroupChat: false,
      users: [req.user._id, userId],
    });

    const fullChat = await Chat.findById(newChat._id)
      .populate('users', '-password');

    res.status(201).json(fullChat);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/chats - Get all chats for current user
const getChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      users: { $elemMatch: { $eq: req.user._id } },
    })
      .populate('users', '-password')
      .populate('admin', '-password')
      .populate({
        path: 'latestMessage',
        populate: { path: 'sender', select: 'name avatar email' },
      })
      .sort({ updatedAt: -1 });

    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /api/chats/group - Create group chat
const createGroupChat = async (req, res) => {
  try {
    let { users, chatName, description } = req.body;
    if (!users || users.length < 1) {
      return res.status(400).json({ message: 'At least 2 users required for group chat' });
    }

    // Add current user to the group
    users = [...new Set([...users, req.user._id.toString()])];

    const groupChat = await Chat.create({
      chatName: chatName || 'New Group',
      isGroupChat: true,
      users,
      admin: req.user._id,
      description: description || '',
    });

    const fullChat = await Chat.findById(groupChat._id)
      .populate('users', '-password')
      .populate('admin', '-password');

    res.status(201).json(fullChat);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PUT /api/chats/group/:chatId - Update group chat
const updateGroupChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { chatName, description } = req.body;

    const chat = await Chat.findByIdAndUpdate(chatId,
      { chatName, description },
      { new: true }
    ).populate('users', '-password').populate('admin', '-password');

    if (!chat) return res.status(404).json({ message: 'Chat not found' });
    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PUT /api/chats/group/:chatId/add - Add user to group
const addToGroup = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { userId } = req.body;

    const chat = await Chat.findByIdAndUpdate(chatId,
      { $addToSet: { users: userId } },
      { new: true }
    ).populate('users', '-password').populate('admin', '-password');

    if (!chat) return res.status(404).json({ message: 'Chat not found' });
    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PUT /api/chats/group/:chatId/remove - Remove user from group
const removeFromGroup = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { userId } = req.body;

    const chat = await Chat.findByIdAndUpdate(chatId,
      { $pull: { users: userId } },
      { new: true }
    ).populate('users', '-password').populate('admin', '-password');

    if (!chat) return res.status(404).json({ message: 'Chat not found' });
    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PUT /api/chats/:chatId/pin/:messageId - Pin/unpin a message
const togglePinMessage = async (req, res) => {
  try {
    const { chatId, messageId } = req.params;
    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: 'Chat not found' });

    const isPinned = chat.pinnedMessages.includes(messageId);
    if (isPinned) {
      chat.pinnedMessages.pull(messageId);
    } else {
      chat.pinnedMessages.push(messageId);
    }

    await chat.save();

    // Update message pin status
    await Message.findByIdAndUpdate(messageId, { isPinned: !isPinned });

    const updated = await Chat.findById(chatId)
      .populate('users', '-password')
      .populate('pinnedMessages');

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  accessChat, getChats, createGroupChat, updateGroupChat,
  addToGroup, removeFromGroup, togglePinMessage,
};
