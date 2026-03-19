// pages/ChatPage.jsx - Main chat interface
import { useEffect, useState } from 'react';
import { useChat } from '../context/ChatContext';
import { useSocket } from '../context/SocketContext';
import ChatWindow from '../components/chat/ChatWindow';
import MessageInput from '../components/chat/MessageInput';
import ChatHeader from '../components/chat/ChatHeader';
import AIAssistantPanel from '../components/ai/AIAssistantPanel';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineSparkles } from 'react-icons/hi';

const ChatPage = () => {
  const { selectedChat } = useChat();
  const { joinChat, leaveChat } = useSocket();
  const [showAIPanel, setShowAIPanel] = useState(false);

  useEffect(() => {
    if (selectedChat) {
      joinChat(selectedChat._id);
      return () => leaveChat(selectedChat._id);
    }
  }, [selectedChat, joinChat, leaveChat]);

  return (
    <div style={{ display: 'flex', height: '100%', width: '100%', overflow: 'hidden', position: 'relative' }}>
      
      {/* Main Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', minWidth: 0, background: 'var(--glass-bg)' }}>
        {selectedChat ? (
          <>
            <ChatHeader onToggleAI={() => setShowAIPanel(!showAIPanel)} />
            <ChatWindow />
            <MessageInput />
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring' }}
              style={{ width: 80, height: 80, borderRadius: 20, background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}
            >
              <HiOutlineSparkles size={40} color="white" />
            </motion.div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>Welcome to NovaTalk</h2>
            <p>Select a chat or start a new conversation to begin.</p>
          </div>
        )}
      </div>

      {/* AI Assistant Side Panel */}
      <AnimatePresence>
        {showAIPanel && selectedChat && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 380, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{ borderLeft: '1px solid var(--glass-border)', background: 'var(--bg-secondary)', overflow: 'hidden', flexShrink: 0 }}
          >
            <AIAssistantPanel onClose={() => setShowAIPanel(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatPage;
