// components/ai/AIAssistantPanel.jsx - Sidebar AI Assistant
import { useState, useRef, useEffect } from 'react';
import { useChat } from '../../context/ChatContext';
import { HiOutlineX, HiOutlineSparkles, HiOutlinePaperAirplane, HiOutlineDocumentText, HiOutlineCode } from 'react-icons/hi';
import api from '../../api';

const AIAssistantPanel = ({ onClose }) => {
  const [messages, setMessages] = useState([{ role: 'assistant', content: 'Hi! I am NovaTalk AI. Ask me anything, summarize the chat, or have me explain code snippets.' }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { messages: chatMessages } = useChat();
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const newMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, newMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', { messages: [...messages.slice(1), newMsg] });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error processing your request.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action) => {
    if (loading) return;
    setLoading(true);

    try {
      if (action === 'summarize') {
        setMessages(prev => [...prev, { role: 'user', content: 'Summarize the current chat context.' }]);
        const context = chatMessages.slice(-20).map(m => `${m.sender.name}: ${m.content}`).join('\n');
        
        if (!context) {
          setMessages(prev => [...prev, { role: 'assistant', content: 'There are no recent messages to summarize.' }]);
          return;
        }

        const res = await api.post('/ai/summarize', { messages: [{ sender: 'System', content: context }] });
        setMessages(prev => [...prev, { role: 'assistant', content: res.data.summary }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Failed to complete the action.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HiOutlineSparkles color="white" size={18} />
          </div>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }} className="gradient-text">NovaTalk AI</h3>
        </div>
        <HiOutlineX size={20} color="var(--text-muted)" style={{ cursor: 'pointer' }} onClick={onClose} />
      </div>

      {/* Quick Actions */}
      <div style={{ padding: '12px 20px', display: 'flex', gap: 8, borderBottom: '1px solid var(--glass-border)', overflowX: 'auto' }}>
        <button onClick={() => handleAction('summarize')} className="neon-btn" style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 6, borderRadius: 8 }}>
          <HiOutlineDocumentText />
          <span>Summarize Chat</span>
        </button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ display: 'flex', gap: 12, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
            {msg.role === 'assistant' && (
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--accent-gradient)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <HiOutlineSparkles color="white" size={14} />
              </div>
            )}
            <div style={{
              background: msg.role === 'user' ? 'rgba(0, 212, 255, 0.1)' : 'var(--bg-tertiary)',
              border: `1px solid ${msg.role === 'user' ? 'rgba(0, 212, 255, 0.2)' : 'var(--glass-border)'}`,
              padding: '10px 14px', borderRadius: 12,
              borderTopRightRadius: msg.role === 'user' ? 4 : 12,
              borderTopLeftRadius: msg.role === 'assistant' ? 4 : 12,
              fontSize: '0.9rem', lineHeight: 1.5,
              wordBreak: 'break-word', whiteSpace: 'pre-wrap'
            }}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--accent-gradient)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <HiOutlineSparkles color="white" size={14} />
            </div>
            <div style={{ background: 'var(--bg-tertiary)', padding: '12px 16px', borderRadius: 12, borderTopLeftRadius: 4 }}>
              <div className="typing-dots"><span></span><span></span><span></span></div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} style={{ padding: '16px 20px', borderTop: '1px solid var(--glass-border)' }}>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            className="glass-input"
            placeholder="Ask NovaTalk AI..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            style={{ paddingRight: 40 }}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            style={{
              position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', color: input.trim() ? 'var(--neon-blue)' : 'var(--text-muted)',
              cursor: input.trim() && !loading ? 'pointer' : 'not-allowed'
            }}
          >
            <HiOutlinePaperAirplane size={20} style={{ transform: 'rotate(90deg)' }} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default AIAssistantPanel;
