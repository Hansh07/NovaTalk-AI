// context/ThemeContext.jsx - Dark/light theme management with localStorage persistence
import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('nexus_theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('nexus_theme', theme);
  }, [theme]);

  const setThemeName = (newTheme) => {
    setTheme(newTheme);
  };

  const isDark = theme === 'dark' || theme === 'cyberpunk' || theme === 'matrix' || theme === 'synthwave';

  const availableThemes = [
    { id: 'dark', name: 'Nexus Dark', icon: '🌌' },
    { id: 'light', name: 'Bright Light', icon: '☀️' },
    { id: 'cyberpunk', name: 'Cyberpunk', icon: '🦾' },
    { id: 'matrix', name: 'Matrix', icon: '💻' },
    { id: 'synthwave', name: 'Synthwave', icon: '🌆' },
    { id: 'sakura', name: 'Sakura Blush', icon: '🌸' },
    { id: 'ocean', name: 'Ocean Breeze', icon: '🌊' },
    { id: 'sunset', name: 'Warm Sunset', icon: '🌅' }
  ];

  return (
    <ThemeContext.Provider value={{ theme, setThemeName, isDark, availableThemes }}>
      {children}
    </ThemeContext.Provider>
  );
};
