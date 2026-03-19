// context/AuthContext.jsx - Authentication state management
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('nexus_token'));
  const [loading, setLoading] = useState(true);

  // Load user on mount if token exists
  useEffect(() => {
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  const loadUser = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data);
    } catch (err) {
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { user: userData, token: accessToken, refreshToken } = res.data;
      
      localStorage.setItem('nexus_token', accessToken);
      localStorage.setItem('nexus_refresh', refreshToken);
      setToken(accessToken);
      setUser(userData);
      
      toast.success('Welcome back!');
      return true;
    } catch (err) {
      console.error('Login error:', err);
      throw err;
    }
  };

  const googleLogin = async (googleToken) => {
    try {
      const res = await api.post('/auth/google', { token: googleToken });
      const { user: userData, token: accessToken, refreshToken } = res.data;
      
      localStorage.setItem('nexus_token', accessToken);
      localStorage.setItem('nexus_refresh', refreshToken);
      setToken(accessToken);
      setUser(userData);
      
      toast.success('Successfully authenticated with Google!');
      return true;
    } catch (err) {
      console.error('Google Auth Error:', err);
      throw err;
    }
  };

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    const { user: userData, token: accessToken, refreshToken } = res.data;
    setUser(userData);
    setToken(accessToken);
    localStorage.setItem('nexus_token', accessToken);
    localStorage.setItem('nexus_refresh', refreshToken);
    return userData;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('nexus_token');
    localStorage.removeItem('nexus_refresh');
  };

  const updateUser = (updates) => {
    setUser(prev => ({ ...prev, ...updates }));
  };

  return (
    <AuthContext.Provider value={{
      user, token, loading,
      login, googleLogin, register, logout, updateProfile: updateUser, loadUser,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};
