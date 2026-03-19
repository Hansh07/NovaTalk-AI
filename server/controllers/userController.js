// controllers/userController.js - User management handlers
const User = require('../models/User');

// GET /api/users - Search users
const getUsers = async (req, res) => {
  try {
    const keyword = req.query.search
      ? {
          $or: [
            { name: { $regex: req.query.search, $options: 'i' } },
            { email: { $regex: req.query.search, $options: 'i' } },
          ],
        }
      : {};

    const users = await User.find({ ...keyword, _id: { $ne: req.user._id } })
      .select('-password')
      .limit(20);

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PUT /api/users/profile - Update profile
const updateProfile = async (req, res) => {
  try {
    const { name, avatar, statusMessage, preferences } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (avatar) user.avatar = avatar;
    if (statusMessage !== undefined) user.statusMessage = statusMessage;
    if (preferences) user.preferences = { ...user.preferences, ...preferences };

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PUT /api/users/status - Update online status
const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { status, lastSeen: new Date() },
      { new: true }
    );
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/users/online - Get online users
const getOnlineUsers = async (req, res) => {
  try {
    const users = await User.find({
      status: 'online',
      _id: { $ne: req.user._id },
    }).select('name avatar email status');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getUsers, updateProfile, updateStatus, getOnlineUsers };
