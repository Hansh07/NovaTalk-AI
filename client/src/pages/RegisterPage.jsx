// pages/RegisterPage.jsx - Glassmorphism registration page
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { HiOutlineUser, HiOutlineMail, HiOutlineLockClosed, HiOutlineSparkles } from 'react-icons/hi';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) return toast.error('Please fill all fields');
    if (password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await register(name, email, password);
      toast.success('Account created successfully!');
      navigate('/', { replace: true });
    } catch (err) {
      // Show specific server error if available
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || 'Registration failed';
      setAuthError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      await googleLogin(credentialResponse.credential);
      navigate('/', { replace: true });
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Google authentication failed';
      setAuthError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      <div className="animated-bg">
        <div className="orb"></div>
        <div className="orb"></div>
        <div className="orb"></div>
      </div>

      <div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 440, padding: '0 20px' }}
      >
        <div className="glass" style={{ padding: 40 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              style={{
                width: 64, height: 64, borderRadius: 16,
                background: 'linear-gradient(135deg, #00d4ff, #a855f7)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 16,
              }}
            >
              <HiOutlineSparkles size={32} color="white" />
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: 4 }}>
              Join <span className="gradient-text">NovaTalk</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              AI-Driven Conversations
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ position: 'relative' }}>
              <HiOutlineUser size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input type="text" placeholder="Full name" className="glass-input" style={{ paddingLeft: 42 }}
                value={name} onChange={(e) => setName(e.target.value)} id="register-name" />
            </div>
            <div style={{ position: 'relative' }}>
              <HiOutlineMail size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input type="email" placeholder="Email address" className="glass-input" style={{ paddingLeft: 42 }}
                value={email} onChange={(e) => setEmail(e.target.value)} id="register-email" />
            </div>
            <div style={{ position: 'relative' }}>
              <HiOutlineLockClosed size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input type="password" placeholder="Password (min 6 chars)" className="glass-input" style={{ paddingLeft: 42 }}
                value={password} onChange={(e) => setPassword(e.target.value)} id="register-password" />
            </div>

            {authError && (
              <p style={{ color: 'var(--neon-red)', textAlign: 'center', fontSize: '0.85rem', marginTop: -8 }}>
                {authError}
              </p>
            )}

            <button
                type="submit"
                disabled={loading}
                className={`btn-primary ${loading ? 'opacity-70 cursor-not-allowed' : 'glass-hover'}`}
                style={{ width: '100%', padding: '12px', marginTop: '8px' }}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0', opacity: 0.6 }}>
              <div style={{ flex: 1, height: 1, background: 'var(--glass-border)' }}></div>
              <span style={{ margin: '0 12px', fontSize: '0.85rem' }}>OR CONTINUE WITH</span>
              <div style={{ flex: 1, height: 1, background: 'var(--glass-border)' }}></div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => {
                  setAuthError('Google Login Failed');
                }}
                theme="filled_black"
                shape="pill"
                text="continue_with"
                width="100%"
              />
            </div>

            <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.95rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Already have an account? </span>
              <Link to="/login" style={{ color: 'var(--neon-blue)', fontWeight: 600, textDecoration: 'none' }}>
                Sign in
              </Link>
            </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
