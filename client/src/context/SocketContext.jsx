// context/SocketContext.jsx - Socket.io connection and event management
import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useChat } from './ChatContext';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const { token, user } = useAuth();
  const { chats, selectedChat, addMessage, updateMessage, removeMessage, setTyping, addNotification } = useChat();
  const [connected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (!token) return;

    // Connect socket with auth
    socketRef.current = io(window.location.origin, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      setConnected(true);
      console.log('🔌 Socket connected');
      // Re-join active selected chat immediately if any
      if (selectedChat) {
        socket.emit('chat:join', selectedChat._id);
      }
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    // Online users list
    socket.on('users:online', (userIds) => {
      setOnlineUsers(userIds);
    });

    socket.on('user:online', ({ userId }) => {
      setOnlineUsers(prev => [...new Set([...prev, userId])]);
    });

    socket.on('user:offline', ({ userId }) => {
      setOnlineUsers(prev => prev.filter(id => id !== userId));
    });

    // Message events
    socket.on('message:received', (message) => {
      addMessage(message);
      // Add notification if not in current chat
      if (message.chat?._id !== selectedChat?._id && message.chat !== selectedChat?._id) {
        addNotification({
          id: Date.now(),
          chatId: message.chat?._id || message.chat,
          message: message.content,
          sender: message.sender,
          timestamp: new Date(),
        });
      }
    });

    socket.on('message:edited', (message) => {
      updateMessage(message);
    });

    socket.on('message:deleted', ({ messageId }) => {
      removeMessage(messageId);
    });

    socket.on('message:reacted', ({ messageId, reactions }) => {
      updateMessage(prev => prev._id === messageId ? { ...prev, reactions } : prev);
    });

    // Typing events
    socket.on('typing:started', ({ chatId, userId, name }) => {
      setTyping(chatId, userId, name, true);
    });

    socket.on('typing:stopped', ({ chatId, userId }) => {
      setTyping(chatId, userId, null, false);
    });

    return () => {
      socket.disconnect();
    };
  }, [token]);

  // Bind to all background chats when they load
  useEffect(() => {
    if (connected && socketRef.current && chats.length > 0) {
      chats.forEach(chat => {
        socketRef.current.emit('chat:join', chat._id);
      });
    }
  }, [chats, connected]);

  // Join a single chat room manually
  const joinChat = useCallback((chatId) => {
    socketRef.current?.emit('chat:join', chatId);
  }, []);

  // Leave a chat room manually
  const leaveChat = useCallback((chatId) => {
    // Only leave if explicitly requested, otherwise background typing is lost
    // socketRef.current?.emit('chat:leave', chatId);
  }, []);

  // Emit new message to room
  const emitMessage = useCallback((chatId, message) => {
    socketRef.current?.emit('message:send', { chatId, message });
  }, []);

  // Emit typing events
  const emitTyping = useCallback((chatId, isTyping) => {
    socketRef.current?.emit(isTyping ? 'typing:start' : 'typing:stop', { chatId });
  }, []);

  // Emit message edit
  const emitEdit = useCallback((chatId, message) => {
    socketRef.current?.emit('message:edit', { chatId, message });
  }, []);

  // Emit message delete
  const emitDelete = useCallback((chatId, messageId) => {
    socketRef.current?.emit('message:delete', { chatId, messageId });
  }, []);

  // Emit reaction
  const emitReaction = useCallback((chatId, messageId, reactions) => {
    socketRef.current?.emit('message:react', { chatId, messageId, reactions });
  }, []);

  return (
    <SocketContext.Provider value={{
      socket: socketRef.current, connected, onlineUsers,
      joinChat, leaveChat, emitMessage, emitTyping,
      emitEdit, emitDelete, emitReaction,
    }}>
      {children}
    </SocketContext.Provider>
  );
};
