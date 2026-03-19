// components/chat/ChatWindow.jsx - Message list and scrolling
import { useEffect, useRef } from 'react';
import { useChat } from '../../context/ChatContext';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';

const ChatWindow = () => {
  const { messages, loadingMessages, selectedChat, typingUsers } = useChat();
  const bottomRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers, selectedChat]);

  if (loadingMessages) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="shimmer" style={{ width: 150, height: 20, borderRadius: 10 }}></div>
      </div>
    );
  }

  const activeTypers = Object.values(typingUsers[selectedChat?._id] || {});

  return (
    <div className="messages-container">
      {/* Messages */}
      {messages.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          No messages yet. Say hello!
        </div>
      ) : (
        messages.map((msg, idx) => {
          const showAvatar = idx === 0 || messages[idx - 1].sender._id !== msg.sender._id;
          return <MessageBubble key={msg._id} message={msg} showAvatar={showAvatar} />;
        })
      )}

      {/* Typing Indicator */}
      {activeTypers.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 16px 12px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
          <div className="avatar" style={{ width: 24, height: 24, fontSize: '0.6rem', background: 'var(--bg-tertiary)' }}>
            {activeTypers[0].charAt(0).toUpperCase()}
          </div>
          <span>{activeTypers.join(', ')} {activeTypers.length > 1 ? 'are' : 'is'} typing</span>
          <TypingIndicator />
        </div>
      )}

      {/* Invisible element for scrolling */}
      <div ref={bottomRef} style={{ height: 1 }} />
    </div>
  );
};

export default ChatWindow;
