// components/chat/MessageInput.jsx - Text input with socket typing events
import { useState, useRef, useEffect } from 'react';
import { useChat } from '../../context/ChatContext';
import { useSocket } from '../../context/SocketContext';
import { HiOutlinePaperAirplane, HiOutlineMicrophone, HiOutlinePaperClip, HiOutlineEmojiHappy, HiOutlineTranslate } from 'react-icons/hi';
import EmojiPicker from 'emoji-picker-react';
import VoiceRecorder from './VoiceRecorder';
import toast from 'react-hot-toast';
import api from '../../api';

const MessageInput = () => {
  const [content, setContent] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const [smartReplies, setSmartReplies] = useState([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { selectedChat, sendMessage, messages } = useChat();
  const { emitTyping, emitMessage } = useSocket();
  const typingTimeoutRef = useRef(null);
  const inputRef = useRef(null);

  // Generate smart replies occasionally
  useEffect(() => {
    if (!selectedChat || messages.length === 0 || messages[messages.length - 1].sender._id === JSON.parse(localStorage.getItem('nexus_user') || '{}')._id) {
      setSmartReplies([]);
      return;
    }
    
    // Only generate 30% of the time to save API calls
    if (Math.random() > 0.3) {
      setSmartReplies([]);
      return;
    }

    const generateReplies = async () => {
      setLoadingReplies(true);
      try {
        const recentContext = messages.slice(-3).map(m => `${m.sender.name}: ${m.content}`).join('\n');
        const res = await api.post('/ai/smart-reply', { context: recentContext });
        setSmartReplies(res.data.suggestions || []);
      } catch (err) {
        setSmartReplies([]);
      } finally {
        setLoadingReplies(false);
      }
    };
    generateReplies();
  }, [selectedChat, messages]);

  const handleTyping = (e) => {
    setContent(e.target.value);
    
    // Typing indicator logic
    if (e.target.value) {
      emitTyping(selectedChat._id, true);
      
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        emitTyping(selectedChat._id, false);
      }, 2000);
    } else {
      emitTyping(selectedChat._id, false);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    }
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!content.trim() || !selectedChat) return;

    try {
      const message = await sendMessage(content, selectedChat._id);
      emitMessage(selectedChat._id, message);
      setContent('');
      setSmartReplies([]);
      emitTyping(selectedChat._id, false);
    } catch (err) {
      console.error(err);
    }
  };

  const onEmojiClick = (emojiData) => {
    setContent(prev => prev + emojiData.emoji);
    setShowEmojis(false);
    inputRef.current?.focus();
  };

  const handleTranslateInput = async (targetLang) => {
    if (!content.trim()) return;
    setIsTranslating(true);
    try {
      const res = await api.post('/ai/translate', { text: content, targetLang });
      if (res.data.translated && res.data.translated.trim() !== '') {
        setContent(res.data.translated);
      } else {
        toast.error('Could not translate text.');
      }
    } catch (err) {
      toast.error('Translation failed');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleTranscribe = (text) => {
    setContent(text);
    setShowVoiceRecorder(false);
  };

  const handleSendAudio = async (blob) => {
    // In a full implementation, upload blob to Cloudinary and send URL as type 'voice'
    toast.error("Audio messaging requires Cloudinary upload implementation. Use 'To Text' instead!", { duration: 4000 });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds 10MB limit');
      e.target.value = null;
      return;
    }

    setIsUploading(true);
    const loadingToast = toast.loading('Uploading file...');
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('nexus_token');
      const apiUrl = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/upload` : '/api/upload';
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      
      const attachment = {
        url: data.url,
        publicId: data.publicId,
        type: data.resourceType === 'image' || data.resourceType === 'video' ? data.resourceType : 'document',
        name: file.name,
        size: file.size
      };

      const messageType = data.resourceType === 'image' ? 'image' : (data.resourceType === 'video' ? 'video' : 'file');
      
      const message = await sendMessage(content.trim() || file.name, selectedChat._id, messageType, { attachments: [attachment] });
      emitMessage(selectedChat._id, message);
      
      setContent('');
      toast.success('File sent successfully', { id: loadingToast });
    } catch (err) {
      console.error('Upload Error:', err.response?.data || err);
      const errMsg = err.response?.data?.error || err.response?.data?.message || err.message || 'Unknown error';
      toast.error(`Error: ${errMsg}`, { id: loadingToast, duration: 6000 });
    } finally {
      setIsUploading(false);
      e.target.value = null;
    }
  };

  if (!selectedChat) return null;

  return (
    <div style={{ borderTop: '1px solid var(--glass-border)', padding: '16px 24px', position: 'relative', background: 'var(--bg-secondary)' }}>
      
      {/* Action Bar (Smart Replies & Translate) */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, overflowX: 'auto', paddingBottom: 4, alignItems: 'center' }}>
        {/* Translation Buttons */}
        {content.trim() && (
          <div style={{ display: 'flex', gap: 4, borderRight: '1px solid var(--glass-border)', paddingRight: 8, marginRight: 4 }}>
            <button 
              type="button"
              onClick={(e) => { e.preventDefault(); handleTranslateInput('Hindi'); }}
              disabled={isTranslating}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
              className="glass-hover"
            >
              <HiOutlineTranslate />
              To Hindi
            </button>
            <button 
              type="button"
              onClick={(e) => { e.preventDefault(); handleTranslateInput('English'); }}
              disabled={isTranslating}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
              className="glass-hover"
            >
              <HiOutlineTranslate />
              To English
            </button>
          </div>
        )}

        {/* Smart Replies */}
        {smartReplies.map((reply, idx) => (
          <button
            key={idx}
            onClick={() => { setContent(reply); handleSend(); }}
            style={{
              background: 'rgba(0, 212, 255, 0.1)', border: '1px solid rgba(0, 212, 255, 0.2)',
              color: 'var(--neon-blue)', padding: '6px 14px', borderRadius: 20,
              fontSize: '0.85rem', whiteSpace: 'nowrap', cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            className="glass-hover"
          >
            {reply}
          </button>
        ))}
      </div>

      {/* Emoji Picker */}
      {showEmojis && (
        <div style={{ position: 'absolute', bottom: '100%', right: 24, marginBottom: 16, zIndex: 100 }}>
          <EmojiPicker onEmojiClick={onEmojiClick} theme="dark" />
        </div>
      )}

      {/* Input or Voice Recorder */}
      {showVoiceRecorder ? (
        <VoiceRecorder 
          onSend={handleSendAudio} 
          onTranscribe={handleTranscribe}
          onCancel={() => setShowVoiceRecorder(false)} 
        />
      ) : (
        <form onSubmit={handleSend} style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
          <div style={{ flex: 1, background: 'var(--bg-primary)', borderRadius: 24, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 12, border: '1px solid var(--glass-border)' }}>
            <HiOutlinePaperClip 
              size={20} 
              color={isUploading ? 'var(--text-muted)' : 'var(--neon-blue)'} 
              style={{ cursor: isUploading ? 'not-allowed' : 'pointer' }} 
              onClick={() => !isUploading && document.getElementById('file-upload').click()} 
            />
            <input 
              type="file" 
              id="file-upload" 
              style={{ display: 'none' }} 
              onChange={handleFileUpload} 
              accept="image/*,video/*,application/pdf,.doc,.docx,.xls,.xlsx"
            />
            
            <input
              ref={inputRef}
              type="text"
              placeholder={isTranslating ? "Translating..." : "Type a message..."}
              value={content}
              disabled={isTranslating}
              onChange={handleTyping}
              style={{ flex: 1, background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', padding: '8px 0', fontSize: '0.95rem' }}
            />

            <HiOutlineEmojiHappy size={22} color={showEmojis ? 'var(--neon-blue)' : 'var(--text-muted)'} style={{ cursor: 'pointer' }} onClick={() => setShowEmojis(!showEmojis)} />
            <HiOutlineMicrophone size={20} color="var(--text-muted)" style={{ cursor: 'pointer' }} onClick={() => setShowVoiceRecorder(true)} />
          </div>

          <button 
            type="submit" 
            disabled={!content.trim() || isTranslating || isUploading}
            style={{
              width: 48, height: 48, borderRadius: '50%', border: 'none',
              background: content.trim() && !isUploading ? 'var(--accent-gradient)' : 'var(--bg-tertiary)',
              color: content.trim() && !isUploading ? 'white' : 'var(--text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: content.trim() && !isUploading ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s', flexShrink: 0
            }}
            className={content.trim() ? 'glass-hover' : ''}
          >
            <HiOutlinePaperAirplane size={22} style={{ transform: 'rotate(90deg) translateX(-2px)' }} />
          </button>
        </form>
      )}


    </div>
  );
};

export default MessageInput;
