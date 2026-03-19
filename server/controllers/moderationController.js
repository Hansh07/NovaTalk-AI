// controllers/moderationController.js - Admin moderation handlers
const moderationService = require('../services/moderationService');
const User = require('../models/User');
const Message = require('../models/Message');

// GET /api/moderation/dashboard - Get moderation dashboard data
const getDashboard = async (req, res) => {
  try {
    const data = await moderationService.getDashboardData();

    // Flagged messages
    const flaggedMessages = await Message.find({
      'toxicity.isToxic': true,
    })
      .populate('sender', 'name email avatar')
      .populate('chat', 'chatName')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      ...data,
      flaggedMessages,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PUT /api/moderation/mute/:userId - Mute a user
const muteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { duration = 24 } = req.body; // hours

    const user = await User.findByIdAndUpdate(userId, {
      isMuted: true,
      mutedUntil: new Date(Date.now() + duration * 60 * 60 * 1000),
    }, { new: true });

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: `User muted for ${duration} hours`, user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PUT /api/moderation/unmute/:userId - Unmute a user
const unmuteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByIdAndUpdate(userId, {
      isMuted: false,
      mutedUntil: null,
    }, { new: true });

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User unmuted', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PUT /api/moderation/warn/:userId - Warn a user
const warnUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.warnings += 1;
    if (user.warnings >= 5) {
      user.isMuted = true;
      user.mutedUntil = new Date(Date.now() + 24 * 60 * 60 * 1000);
    }
    await user.save();

    res.json({ message: 'Warning issued', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getDashboard, muteUser, unmuteUser, warnUser };
