// components/chat/ChatHeader.jsx - Header for active chat
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { HiOutlineSparkles, HiOutlineInformationCircle, HiOutlineDotsVertical, HiX } from 'react-icons/hi';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ChatHeader = ({ onToggleAI }) => {
  const { selectedChat } = useChat();
  const { user } = useAuth();
  const { onlineUsers } = useSocket();
  const [showDP, setShowDP] = useState(false);

  if (!selectedChat) return null;

  const chatName = selectedChat.isGroupChat 
    ? selectedChat.chatName 
    : selectedChat.users.find(u => u._id !== user._id)?.name || 'Unknown User';
    
  const chatAvatar = selectedChat.isGroupChat 
    ? null 
    : selectedChat.users.find(u => u._id !== user._id)?.avatar;

  const isOnline = !selectedChat.isGroupChat && 
    onlineUsers.includes(selectedChat.users.find(u => u._id !== user._id)?._id);

  return (
    <div style={{
      padding: '16px 24px',
      borderBottom: '1px solid var(--glass-border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: 'rgba(255,255,255,0.02)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div 
          className="avatar" 
          style={{ background: selectedChat.isGroupChat ? 'var(--accent-gradient)' : 'var(--bg-tertiary)', overflow: 'hidden', cursor: chatAvatar ? 'pointer' : 'default' }}
          onClick={() => chatAvatar && setShowDP(true)}
        >
          {chatAvatar ? (
            <img src={chatAvatar} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            chatName?.charAt(0).toUpperCase()
          )}
          {isOnline && <div className="online-dot" style={{ bottom: 2, right: 2, width: 12, height: 12 }}></div>}
        </div>
        <div>
          <h3 style={{ fontWeight: 700, fontSize: '1.1rem', margin: 0 }}>{chatName}</h3>
          <p style={{ fontSize: '0.8rem', color: isOnline ? 'var(--neon-green)' : 'var(--text-secondary)', margin: 0 }}>
            {selectedChat.isGroupChat 
              ? `${selectedChat.users.length} members` 
              : (isOnline ? 'Online' : 'Offline')}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button 
          onClick={onToggleAI}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'var(--accent-gradient)',
            border: 'none', borderRadius: 20,
            color: 'white', padding: '8px 16px',
            cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem'
          }}
          className="glass-hover"
        >
          <HiOutlineSparkles size={16} />
          <span>Ask AI</span>
        </button>

        <HiOutlineInformationCircle size={22} color="var(--text-muted)" style={{ cursor: 'pointer' }} className="glass-hover" />
        <HiOutlineDotsVertical size={20} color="var(--text-muted)" style={{ cursor: 'pointer' }} className="glass-hover" />
      </div>

      {/* Full Picture Modal */}
      <AnimatePresence>
        {showDP && chatAvatar && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDP(false)}
            style={{
              position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
              background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(10px)',
              zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}
            >
              <img 
                src={chatAvatar} 
                alt="Full Profile" 
                style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: 16, objectFit: 'contain', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }} 
              />
              <button 
                onClick={() => setShowDP(false)}
                style={{
                  position: 'absolute', top: -16, right: -16, width: 36, height: 36, borderRadius: '50%',
                  background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                }}
              >
                <HiX size={20} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatHeader;
