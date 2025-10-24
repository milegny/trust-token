export const theme = {
  colors: {
    // Primary brand color
    primary: {
      main: '#FFD83D',
      light: '#FFE570',
      dark: '#E6C234',
      contrast: '#1a1a1a',
    },
    
    // Background colors
    background: {
      dark: '#1a1a1a',
      medium: '#2a2a2a',
      light: '#3a3a3a',
      lighter: '#4a4a4a',
      white: '#ffffff',
    },
    
    // Text colors
    text: {
      primary: '#ffffff',
      secondary: '#e0e0e0',
      tertiary: '#b0b0b0',
      disabled: '#808080',
      dark: '#1a1a1a',
    },
    
    // Semantic colors
    success: {
      main: '#4CAF50',
      light: '#81C784',
      dark: '#388E3C',
    },
    error: {
      main: '#F44336',
      light: '#E57373',
      dark: '#D32F2F',
    },
    warning: {
      main: '#FF9800',
      light: '#FFB74D',
      dark: '#F57C00',
    },
    info: {
      main: '#2196F3',
      light: '#64B5F6',
      dark: '#1976D2',
    },
    
    // UI colors
    border: {
      light: '#4a4a4a',
      medium: '#3a3a3a',
      dark: '#2a2a2a',
    },
    
    // Overlay
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
  
  // Typography
  typography: {
    fontFamily: {
      primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      mono: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
    },
    fontSize: {
      xs: '0.75rem',     // 12px
      sm: '0.875rem',    // 14px
      base: '1rem',      // 16px
      lg: '1.125rem',    // 18px
      xl: '1.25rem',     // 20px
      '2xl': '1.5rem',   // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
      '5xl': '3rem',     // 48px
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  
  // Spacing
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
    '4xl': '6rem',   // 96px
  },
  
  // Border radius
  borderRadius: {
    none: '0',
    sm: '0.25rem',   // 4px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    '2xl': '1.5rem', // 24px
    full: '9999px',
  },
  
  // Shadows
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    glow: '0 0 20px rgba(255, 216, 61, 0.3)',
  },
  
  // Transitions
  transitions: {
    fast: '150ms ease-in-out',
    normal: '300ms ease-in-out',
    slow: '500ms ease-in-out',
  },
  
  // Breakpoints
  breakpoints: {
    xs: '320px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  
  // Z-index
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },
};

export type Theme = typeof theme;

// Light mode overrides
export const lightTheme: Partial<Theme> = {
  colors: {
    ...theme.colors,
    background: {
      dark: '#ffffff',
      medium: '#f5f5f5',
      light: '#e0e0e0',
      lighter: '#d0d0d0',
      white: '#ffffff',
    },
    text: {
      primary: '#1a1a1a',
      secondary: '#2a2a2a',
      tertiary: '#4a4a4a',
      disabled: '#808080',
      dark: '#1a1a1a',
    },
    border: {
      light: '#e0e0e0',
      medium: '#d0d0d0',
      dark: '#c0c0c0',
    },
  },
};

export default theme;
