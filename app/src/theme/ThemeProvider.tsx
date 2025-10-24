import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { theme, lightTheme, Theme } from './theme';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    // Check localStorage first
    const stored = localStorage.getItem('theme-mode');
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
    
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
    
    // Default to dark
    return 'dark';
  });

  const currentTheme = mode === 'light' ? { ...theme, ...lightTheme } : theme;

  useEffect(() => {
    // Save to localStorage
    localStorage.setItem('theme-mode', mode);
    
    // Update document class
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(mode);
    
    // Update meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content',
        mode === 'dark' ? theme.colors.background.dark : lightTheme.colors!.background!.dark
      );
    }
  }, [mode]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      const stored = localStorage.getItem('theme-mode');
      if (!stored) {
        setMode(e.matches ? 'light' : 'dark');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    setMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setThemeMode = (newMode: ThemeMode) => {
    setMode(newMode);
  };

  return (
    <ThemeContext.Provider
      value={{
        mode,
        theme: currentTheme,
        toggleTheme,
        setTheme: setThemeMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
