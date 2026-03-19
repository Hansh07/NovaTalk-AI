// components/layout/Sidebar.jsx - Main navigation and chat list
import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { HiOutlineChatAlt2, HiOutlineChartSquareBar, HiOutlineShieldCheck, HiOutlinePlus, HiOutlineSearch } from 'react-icons/hi';
import api from '../../api';
import toast from 'react-hot-toast';

const Sidebar = () => {
  const { chats, selectedChat, selectChat, accessChat, fetchChats, typingUsers } = useChat();
  const { user } = useAuth();
  const { onlineUsers } = useSocket();
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  const handleSearch = async (e) => {
    const term = e.target.value;
    setSearch(term);
    if (!term) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await api.get(`/users?search=${term}`);
      setSearchResults(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  const handleStartChat = async (userId) => {
    try {
      await accessChat(userId);
      setSearch('');
      setSearchResults([]);
    } catch (err) {
      toast.error('Failed to start chat');
    }
  };

  const getChatName = (chat) => {
    if (chat.isGroupChat) return chat.chatName;
    const otherUser = chat.users.find(u => u._id !== user._id);
    return otherUser?.name || 'Unknown User';
  };

  const getChatAvatar = (chat) => {
    if (chat.isGroupChat) return null;
    const otherUser = chat.users.find(u => u._id !== user._id);
    return otherUser?.avatar || null;
  };

  const isOnline = (chat) => {
    if (chat.isGroupChat) return false;
    const otherUser = chat.users.find(u => u._id !== user._id);
    return otherUser ? onlineUsers.includes(otherUser._id) : false;
  };

  const getTypingText = (chat) => {
    const activeTypers = Object.values(typingUsers[chat._id] || {});
    if (activeTypers.length === 0) return null;
    return `${activeTypers.length > 1 ? activeTypers.length + ' people are' : activeTypers[0] + ' is'} typing...`;
  };

  return (
    <div className="sidebar" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Search Header */}
      <div style={{ padding: '20px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 16 }}>Chats</h2>
        <div style={{ position: 'relative' }}>
          <HiOutlineSearch style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search users..."
            className="glass-input"
            style={{ paddingLeft: 36, paddingRight: 36 }}
            value={search}
            onChange={handleSearch}
          />
        </div>
      </div>

      {/* Navigation Links */}
      <div style={{ padding: '0 20px 16px', display: 'flex', gap: 8, borderBottom: '1px solid var(--glass-border)' }}>
        <NavLink to="/chat" className={({isActive}) => `nav-icon ${isActive ? 'active' : ''}`} title="Chats">
          <HiOutlineChatAlt2 size={22} />
        </NavLink>
        <NavLink to="/analytics" className={({isActive}) => `nav-icon ${isActive ? 'active' : ''}`} title="Analytics">
          <HiOutlineChartSquareBar size={22} />
        </NavLink>
        {(user?.role === 'admin' || user?.role === 'owner') && (
          <NavLink to="/moderation" className={({isActive}) => `nav-icon ${isActive ? 'active' : ''}`} title="Moderation">
            <HiOutlineShieldCheck size={22} />
          </NavLink>
        )}
      </div>

      {/* Main List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 0' }}>
        {search ? (
          /* Search Results */
          <div>
            <div style={{ padding: '0 20px', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>
              Search Results
            </div>
            {searching ? (
              <div style={{ padding: '0 20px', color: 'var(--text-secondary)' }}>Searching...</div>
            ) : searchResults.length > 0 ? (
              searchResults.map(u => (
                <div
                  key={u._id}
                  onClick={() => handleStartChat(u._id)}
                  className="chat-list-item"
                >
                  <div className="avatar" style={{ background: 'var(--bg-tertiary)', overflow: 'hidden' }}>
                    {u.avatar ? (
                      <img src={u.avatar} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      u.name.charAt(0).toUpperCase()
                    )}
                    {onlineUsers.includes(u._id) && <div className="online-dot"></div>}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{u.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{u.email}</div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '0 20px', color: 'var(--text-secondary)' }}>No users found</div>
            )}
          </div>
        ) : (
          /* Recent Chats */
          chats.map(chat => (
            <div
              key={chat._id}
              onClick={() => selectChat(chat)}
              className={`chat-list-item ${selectedChat?._id === chat._id ? 'active' : ''}`}
            >
              <div className="avatar" style={{ background: chat.isGroupChat ? 'var(--accent-gradient)' : 'var(--bg-tertiary)', overflow: 'hidden' }}>
                {getChatAvatar(chat) ? (
                  <img src={getChatAvatar(chat)} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  getChatName(chat).charAt(0).toUpperCase()
                )}
                {isOnline(chat) && <div className="online-dot"></div>}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {getChatName(chat)}
                  </div>
                  {chat.latestMessage && (
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {new Date(chat.latestMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  )}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {getTypingText(chat) ? (
                    <span style={{ color: 'var(--neon-green)', fontWeight: 600 }}>{getTypingText(chat)}</span>
                  ) : chat.latestMessage ? (
                    chat.latestMessage.type === 'text' ? chat.latestMessage.content : `[${chat.latestMessage.type}]`
                  ) : <span style={{ fontStyle: 'italic' }}>No messages yet</span>}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <style>{`
        .nav-icon {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px 0;
          border-radius: 8px;
          color: var(--text-muted);
          transition: all 0.2s;
        }
        .nav-icon:hover { background: rgba(255,255,255,0.05); color: var(--text-primary); }
        .nav-icon.active { background: rgba(0, 212, 255, 0.15); color: var(--neon-blue); }
        
        .chat-list-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 20px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .chat-list-item:hover { background: rgba(255,255,255,0.03); }
        .chat-list-item.active { background: rgba(255,255,255,0.08); border-left: 3px solid var(--neon-purple); }
      `}</style>
    </div>
  );
};

export default Sidebar;
