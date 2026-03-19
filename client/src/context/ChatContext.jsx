// context/ChatContext.jsx - Chat and messaging state management
import { createContext, useContext, useState, useCallback } from 'react';
import api from '../api';

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingChats, setLoadingChats] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const [notifications, setNotifications] = useState([]);

  // Fetch all chats
  const fetchChats = useCallback(async () => {
    setLoadingChats(true);
    try {
      const res = await api.get('/chats');
      setChats(res.data);
    } catch (err) {
      console.error('Failed to fetch chats:', err);
    } finally {
      setLoadingChats(false);
    }
  }, []);

  // Fetch messages for a chat
  const fetchMessages = useCallback(async (chatId) => {
    setLoadingMessages(true);
    try {
      const res = await api.get(`/messages/${chatId}`);
      setMessages(res.data.messages || []);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  // Select a chat
  const selectChat = useCallback(async (chat) => {
    setSelectedChat(chat);
    if (chat?._id) {
      await fetchMessages(chat._id);
    }
    // Clear notifications for this chat
    setNotifications(prev => prev.filter(n => n.chatId !== chat?._id));
  }, [fetchMessages]);

  // Send a message (via API, then socket broadcasts)
  const sendMessage = useCallback(async (content, chatId, type = 'text', extras = {}) => {
    try {
      const res = await api.post('/messages', { content, chatId, type, ...extras });
      setMessages(prev => [...prev, res.data]);

      // Update latest message in chats
      setChats(prev => prev.map(c =>
        c._id === chatId ? { ...c, latestMessage: res.data } : c
      ));

      return res.data;
    } catch (err) {
      console.error('Failed to send message:', err);
      throw err;
    }
  }, []);

  // Add incoming message (from socket)
  const addMessage = useCallback((message) => {
    setMessages(prev => {
      if (prev.find(m => m._id === message._id)) return prev;
      return [...prev, message];
    });

    setChats(prev => prev.map(c =>
      c._id === message.chat?._id || c._id === message.chat
        ? { ...c, latestMessage: message }
        : c
    ));
  }, []);

  // Update a message (edit)
  const updateMessage = useCallback((updatedMessage) => {
    setMessages(prev => prev.map(m =>
      m._id === updatedMessage._id ? updatedMessage : m
    ));
  }, []);

  // Remove a message (delete)
  const removeMessage = useCallback((messageId) => {
    setMessages(prev => prev.map(m =>
      m._id === messageId ? { ...m, isDeleted: true, content: 'This message was deleted' } : m
    ));
  }, []);

  // Set typing user for a chat
  const setTyping = useCallback((chatId, userId, name, isTyping) => {
    setTypingUsers(prev => {
      const chatTypers = { ...(prev[chatId] || {}) };
      if (isTyping) {
        chatTypers[userId] = name;
      } else {
        delete chatTypers[userId];
      }
      return { ...prev, [chatId]: chatTypers };
    });
  }, []);

  // Add notification
  const addNotification = useCallback((notification) => {
    setNotifications(prev => [notification, ...prev]);
  }, []);

  // Create group chat
  const createGroup = useCallback(async (chatName, users, description) => {
    try {
      const res = await api.post('/chats/group', { chatName, users, description });
      setChats(prev => [res.data, ...prev]);
      return res.data;
    } catch (err) {
      console.error('Failed to create group:', err);
      throw err;
    }
  }, []);

  // Access / create 1-on-1 chat
  const accessChat = useCallback(async (userId) => {
    try {
      const res = await api.post('/chats', { userId });
      const exists = chats.find(c => c._id === res.data._id);
      if (!exists) {
        setChats(prev => [res.data, ...prev]);
      }
      setSelectedChat(res.data);
      await fetchMessages(res.data._id);
      return res.data;
    } catch (err) {
      console.error('Failed to access chat:', err);
      throw err;
    }
  }, [chats, fetchMessages]);

  return (
    <ChatContext.Provider value={{
      chats, selectedChat, messages, loadingChats, loadingMessages,
      typingUsers, notifications,
      fetchChats, fetchMessages, selectChat, sendMessage,
      addMessage, updateMessage, removeMessage,
      setTyping, addNotification, createGroup, accessChat,
      setSelectedChat, setMessages,
    }}>
      {children}
    </ChatContext.Provider>
  );
};
