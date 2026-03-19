// components/chat/MessageBubble.jsx - Individual message component
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { HiOutlineTranslate, HiOutlineExclamationCircle } from 'react-icons/hi';
import api from '../../api';
import toast from 'react-hot-toast';

const MessageBubble = ({ message, showAvatar }) => {
  const { user } = useAuth();
  const isMine = message.sender._id === user._id;
  
  const [showTranslate, setShowTranslate] = useState(false);
  const [translatedText, setTranslatedText] = useState(message.translation?.translatedText || '');
  const [translating, setTranslating] = useState(false);

  const handleTranslate = async () => {
    if (translatedText) {
      setShowTranslate(!showTranslate);
      return;
    }
    setTranslating(true);
    try {
      const res = await api.post('/ai/translate', { text: message.content, targetLang: user.preferences?.language || 'en' });
      setTranslatedText(res.data.translated);
      setShowTranslate(true);
    } catch (err) {
      toast.error('Translation failed');
    } finally {
      setTranslating(false);
    }
  };

  if (message.isDeleted) {
    return (
      <div className={`message-bubble ${isMine ? 'sent' : 'received'}`} style={{ opacity: 0.5, fontStyle: 'italic', padding: '8px 12px' }}>
        🚫 This message was deleted
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: 12, flexDirection: isMine ? 'row-reverse' : 'row', margin: showAvatar ? '8px 0 2px' : '2px 0', padding: '0 8px' }}>
      
      {/* Avatar Space */}
      <div style={{ width: 36, display: 'flex', justifyContent: 'center' }}>
        {!isMine && showAvatar && (
          <div className="avatar" style={{ width: 32, height: 32, fontSize: '0.8rem', background: 'var(--bg-tertiary)', alignSelf: 'flex-end', overflow: 'hidden' }}>
            {message.sender.avatar ? (
              <img src={message.sender.avatar} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              message.sender.name.charAt(0).toUpperCase()
            )}
          </div>
        )}
      </div>

      {/* Bubble Content */}
      <motion.div 
        layout
        className={`message-bubble ${isMine ? 'sent' : 'received'} tooltip`}
        data-tooltip={new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        style={{ position: 'relative', minWidth: 60 }}
      >
        {!isMine && showAvatar && (
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--neon-blue)', marginBottom: 4 }}>
            {message.sender.name}
          </div>
        )}

        {/* Text Content */}
        {message.content && (
          <div style={{ wordBreak: 'break-word', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: message.attachments?.length > 0 ? 8 : 0 }}>
            {showTranslate && translatedText ? (
              <div>
                <div style={{ color: 'var(--neon-blue)' }}>{translatedText}</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.6, marginTop: 4, fontStyle: 'italic' }}>{message.content}</div>
              </div>
            ) : (
              message.content
            )}
          </div>
        )}

        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
            {message.attachments.map((att, idx) => (
              <div key={idx}>
                {att.type === 'image' ? (
                  <img src={att.url} alt={att.name || 'attachment'} style={{ maxWidth: 200, maxHeight: 200, borderRadius: 8, objectFit: 'cover' }} />
                ) : att.type === 'video' ? (
                  <video src={att.url} controls style={{ maxWidth: 250, maxHeight: 250, borderRadius: 8 }} />
                ) : (
                  <a href={att.url} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 12px', background: 'rgba(255,255,255,0.1)', borderRadius: 8, textDecoration: 'none', color: 'inherit', fontSize: '0.85rem' }}>
                    📄 {att.name || 'Download File'}
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Actions (Hover) */}
        {!isMine && (
          <div style={{ position: 'absolute', top: -14, right: 0, display: 'flex', gap: 4, background: 'var(--bg-secondary)', padding: 4, borderRadius: 12, border: '1px solid var(--glass-border)', opacity: 0, transition: 'opacity 0.2s', className: 'bubble-actions' }}>
            <button onClick={handleTranslate} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }} title="Translate">
              <HiOutlineTranslate size={14} />
            </button>
          </div>
        )}

        {/* AI Flags */}
        {message.sentiment?.label && message.sentiment.label !== 'neutral' && (
          <div style={{ position: 'absolute', bottom: -6, right: isMine ? 'auto' : -10, left: isMine ? -10 : 'auto' }}>
            {message.sentiment.label === 'positive' && <span title="Positive sentiment">😊</span>}
            {message.sentiment.label === 'negative' && <span title="Negative sentiment">😠</span>}
          </div>
        )}
      </motion.div>

      <style>{`
        .message-bubble:hover .bubble-actions { opacity: 1 !important; }
      `}</style>
    </div>
  );
};

export default MessageBubble;
