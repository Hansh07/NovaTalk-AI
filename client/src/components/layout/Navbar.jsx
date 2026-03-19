// components/layout/Navbar.jsx - Top navigation header
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useChat } from '../../context/ChatContext';
import { HiOutlineMoon, HiOutlineSun, HiOutlineBell, HiOutlineLogout, HiOutlineCamera, HiX } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user, logout, updateUser } = useAuth();
  const { theme, setThemeName, availableThemes } = useTheme();
  const { notifications } = useChat();
  const [showMenu, setShowMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showDP, setShowDP] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image limits to 5MB');
      e.target.value = null;
      return;
    }

    setIsUploading(true);
    const loadingToast = toast.loading('Uploading photo...');
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      const token = localStorage.getItem('nexus_token');
      
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      
      const updateRes = await api.put('/users/profile', { avatar: data.url });
      updateUser({ avatar: updateRes.data.avatar });
      
      toast.success('Profile photo updated!', { id: loadingToast });
      setShowMenu(false);
    } catch (err) {
      console.error(err);
      toast.error('Failed to upload photo', { id: loadingToast });
    } finally {
      setIsUploading(false);
      e.target.value = null;
    }
  };

  return (
    <div style={{
      height: 64,
      background: 'var(--glass-bg)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--glass-border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      position: 'relative',
      zIndex: 40,
    }}>
      <div style={{ fontWeight: 800, fontSize: '1.25rem' }}>
        <span className="gradient-text">NovaTalk</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Notifications */}
        <div style={{ position: 'relative', cursor: 'pointer', padding: 8 }} className="glass-hover rounded">
          <HiOutlineBell size={22} color="var(--text-primary)" />
          {notifications.length > 0 && (
            <div style={{
              position: 'absolute', top: 4, right: 6,
              background: 'var(--neon-pink)', width: 10, height: 10, borderRadius: '50%'
            }}></div>
          )}
        </div>

        {/* Theme Toggle Dropdown */}
        <div style={{ position: 'relative' }}>
          <div 
            onClick={() => { setShowThemeMenu(!showThemeMenu); setShowMenu(false); }} 
            style={{ cursor: 'pointer', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6 }} 
            className="glass-hover rounded"
          >
            <span>{availableThemes.find(t => t.id === theme)?.icon || '🌌'}</span>
            <span className="sm-block" style={{ fontSize: '0.85rem', fontWeight: 600, display: 'none' }}>Theme</span>
          </div>
          
          <AnimatePresence>
            {showThemeMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                style={{
                  position: 'absolute', top: '100%', right: 0, marginTop: 8,
                  width: 180, background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)',
                  borderRadius: 12, boxShadow: 'var(--glass-shadow)', overflow: 'hidden'
                }}
              >
                <div style={{ padding: '8px 12px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, borderBottom: '1px solid var(--glass-border)' }}>
                  Select Theme
                </div>
                {availableThemes.map(t => (
                  <div 
                    key={t.id}
                    onClick={() => { setThemeName(t.id); setShowThemeMenu(false); }}
                    className="dropdown-item"
                    style={{ 
                      padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
                      background: theme === t.id ? 'rgba(0, 212, 255, 0.1)' : 'transparent',
                      color: theme === t.id ? 'var(--neon-blue)' : 'var(--text-primary)'
                    }}
                  >
                    <span style={{ fontSize: '1.2rem' }}>{t.icon}</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: theme === t.id ? 600 : 400 }}>{t.name}</span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Menu */}
        <div style={{ position: 'relative' }}>
          <div 
            onClick={() => { setShowMenu(!showMenu); setShowThemeMenu(false); }}
            style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', padding: '4px 8px', borderRadius: 24 }}
            className="glass-hover"
          >
            <div style={{ textAlign: 'right', display: 'none' }} className="sm-block">
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user?.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user?.role}</div>
            </div>
            <div 
              className="avatar" 
              style={{ background: 'var(--accent-gradient)', cursor: user?.avatar ? 'pointer' : 'default' }}
              onClick={(e) => {
                if (user?.avatar) {
                  e.stopPropagation();
                  setShowDP(true);
                }
              }}
            >
              {user?.avatar ? (
                <img src={user.avatar} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                user?.name?.charAt(0).toUpperCase()
              )}
            </div>
          </div>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                style={{
                  position: 'absolute', top: '100%', right: 0, marginTop: 8,
                  width: 200, background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)',
                  borderRadius: 12, boxShadow: 'var(--glass-shadow)', overflow: 'hidden'
                }}
              >
                <div style={{ padding: 16, borderBottom: '1px solid var(--glass-border)' }}>
                  <div style={{ fontWeight: 600 }}>{user?.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{user?.email}</div>
                  <div style={{ display: 'inline-block', marginTop: 8 }} className={`badge ${user?.toxicityScore > 30 ? 'badge-negative' : 'badge-positive'}`}>
                    Toxicity: {Math.round(user?.toxicityScore || 0)}/100
                  </div>
                </div>
                
                <input 
                  type="file" 
                  id="avatar-upload" 
                  style={{ display: 'none' }} 
                  onChange={handleAvatarUpload} 
                  accept="image/*"
                />
                <div 
                  onClick={() => !isUploading && document.getElementById('avatar-upload').click()}
                  style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8, cursor: isUploading ? 'not-allowed' : 'pointer', color: 'var(--text-primary)' }}
                  className="dropdown-item"
                >
                  <HiOutlineCamera size={18} />
                  <span>{isUploading ? 'Uploading...' : 'Update Photo'}</span>
                </div>
                
                <div 
                  onClick={logout}
                  style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: '#ef4444' }}
                  className="dropdown-item"
                >
                  <HiOutlineLogout size={18} />
                  <span>Logout</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Full Picture Modal */}
      <AnimatePresence>
        {showDP && user?.avatar && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDP(false)}
            style={{
              position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
              background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(10px)',
              zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center',
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
                src={user.avatar} 
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

      <style>{`
        .rounded { border-radius: 8px; }
        .dropdown-item:hover { background: rgba(255,255,255,0.05); }
        @media (min-width: 640px) { .sm-block { display: block !important; } }
      `}</style>
    </div>
  );
};

export default Navbar;
