// components/chat/TypingIndicator.jsx - Animated typing dots
const TypingIndicator = () => {
  return (
    <div className="typing-dots" style={{ padding: '4px 8px', background: 'var(--bg-tertiary)', borderRadius: 12, display: 'inline-flex' }}>
      <span></span>
      <span></span>
      <span></span>
    </div>
  );
};

export default TypingIndicator;
