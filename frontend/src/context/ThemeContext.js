import React, { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved || 'light';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    
    // Apply dark mode class to html element
    if (theme === 'dark') {
      document.documentElement.classList.add('dark-mode');
      document.body.style.backgroundColor = '#0f172a';
    } else {
      document.documentElement.classList.remove('dark-mode');
      document.body.style.backgroundColor = '#f5f7fa';
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};