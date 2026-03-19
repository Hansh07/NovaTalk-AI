// socket/socketHandler.js - Socket.io real-time event manager
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Track online users: Map<userId, Set<socketId>>
const onlineUsers = new Map();

const initializeSocket = (io) => {
  // Auth middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication error'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (!user) return next(new Error('User not found'));

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user._id.toString();
    console.log(`🔌 User connected: ${socket.user.name} (${socket.id})`);

    // Track online status
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);

    // Update user status to online
    User.findByIdAndUpdate(userId, { status: 'online', lastSeen: new Date() }).exec();

    // Broadcast online status
    io.emit('user:online', {
      userId,
      name: socket.user.name,
      avatar: socket.user.avatar,
    });

    // Send list of online users to the connecting client
    const onlineUserIds = Array.from(onlineUsers.keys());
    socket.emit('users:online', onlineUserIds);

    // ============ CHAT ROOM EVENTS ============

    // Join a chat room
    socket.on('chat:join', (chatId) => {
      socket.join(chatId);
      console.log(`👤 ${socket.user.name} joined chat ${chatId}`);
    });

    // Leave a chat room
    socket.on('chat:leave', (chatId) => {
      socket.leave(chatId);
      console.log(`👤 ${socket.user.name} left chat ${chatId}`);
    });

    // ============ MESSAGING EVENTS ============

    // New message sent
    socket.on('message:send', (data) => {
      const { chatId, message } = data;
      // Broadcast to everyone in the chat except sender
      socket.to(chatId).emit('message:received', message);
    });

    // Message edited
    socket.on('message:edit', (data) => {
      const { chatId, message } = data;
      socket.to(chatId).emit('message:edited', message);
    });

    // Message deleted
    socket.on('message:delete', (data) => {
      const { chatId, messageId } = data;
      socket.to(chatId).emit('message:deleted', { chatId, messageId });
    });

    // Message reaction
    socket.on('message:react', (data) => {
      const { chatId, messageId, reactions } = data;
      socket.to(chatId).emit('message:reacted', { messageId, reactions });
    });

    // ============ TYPING EVENTS ============

    // Start typing
    socket.on('typing:start', (data) => {
      const { chatId } = data;
      console.log(`[SOCKET DEBUG] User ${socket.user.name} started typing in chat ${chatId}`);
      if (!chatId) return console.log('[SOCKET DEBUG] ERROR: chatId is undefined!');
      
      socket.to(chatId).emit('typing:started', {
        chatId,
        userId,
        name: socket.user.name,
      });
      console.log(`[SOCKET DEBUG] Broadcast typing:started to room ${chatId} for user ${userId}`);
    });

    // Stop typing
    socket.on('typing:stop', (data) => {
      const { chatId } = data;
      socket.to(chatId).emit('typing:stopped', {
        chatId,
        userId,
      });
    });

    // ============ PRESENCE EVENTS ============

    // User status change
    socket.on('user:status', async (data) => {
      const { status } = data;
      await User.findByIdAndUpdate(userId, { status });
      io.emit('user:statusChanged', { userId, status });
    });

    // ============ NOTIFICATION EVENTS ============

    // Send notification to specific user
    socket.on('notification:send', (data) => {
      const { targetUserId, notification } = data;
      const targetSockets = onlineUsers.get(targetUserId);
      if (targetSockets) {
        targetSockets.forEach(socketId => {
          io.to(socketId).emit('notification:received', notification);
        });
      }
    });

    // ============ DISCONNECT ============

    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${socket.user.name} (${socket.id})`);

      // Remove socket from tracking
      const userSockets = onlineUsers.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          onlineUsers.delete(userId);
          // Update user status to offline
          User.findByIdAndUpdate(userId, { status: 'offline', lastSeen: new Date() }).exec();
          // Broadcast offline status
          io.emit('user:offline', { userId });
        }
      }
    });
  });
};

module.exports = { initializeSocket, onlineUsers };
