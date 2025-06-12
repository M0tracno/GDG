import { createTheme } from '@mui/material/styles';

// Enhanced Theme System for Phase 1

// Color palette definitions
const lightPalette = {
  primary: {
    main: '#667eea',
    light: '#9ca3f7',
    dark: '#3b4ddd',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#f093fb',
    light: '#f5b7ff',
    dark: '#d26ef8',
    contrastText: '#ffffff',
  },
  success: {
    main: '#06d6a0',
    light: '#6aecce',
    dark: '#049e76',
    contrastText: '#ffffff',
  },
  warning: {
    main: '#f9ca24',
    light: '#fce38a',
    dark: '#f79f1f',
    contrastText: '#000000',
  },
  error: {
    main: '#ff6b6b',
    light: '#ff9999',
    dark: '#ee5a52',
    contrastText: '#ffffff',
  },
  info: {
    main: '#3742fa',
    light: '#5352ed',
    dark: '#2f3542',
    contrastText: '#ffffff',
  },
  background: {
    default: '#f8fafc',
    paper: '#ffffff',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    glassEffect: 'rgba(255, 255, 255, 0.95)',
    modernGradient: 'linear-gradient(135deg, #667eea 0%, #f093fb 50%, #f5576c 100%)',
  },
  text: {
    primary: '#2d3748',
    secondary: '#4a5568',
    disabled: '#a0aec0',
  }
};

const darkPalette = {
  primary: {
    main: '#8b9dc3',
    light: '#b8c5d1',
    dark: '#5d6d7e',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#bb86fc',
    light: '#d2a7ff',
    dark: '#9965f4',
    contrastText: '#000000',
  },
  success: {
    main: '#4caf50',
    light: '#81c784',
    dark: '#388e3c',
    contrastText: '#ffffff',
  },
  warning: {
    main: '#ff9800',
    light: '#ffb74d',
    dark: '#f57c00',
    contrastText: '#000000',
  },
  error: {
    main: '#f44336',
    light: '#e57373',
    dark: '#d32f2f',
    contrastText: '#ffffff',
  },
  info: {
    main: '#2196f3',
    light: '#64b5f6',
    dark: '#1976d2',
    contrastText: '#ffffff',
  },
  background: {
    default: '#0a0e27',
    paper: '#1a1d3a',
    gradient: 'linear-gradient(135deg, #232526 0%, #414345 100%)',
    glassEffect: 'rgba(26, 29, 58, 0.95)',
    modernGradient: 'linear-gradient(135deg, #434343 0%, #000000 100%)',
  },
  text: {
    primary: '#ffffff',
    secondary: '#b0bec5',
    disabled: '#6b7280',
  }
};

// Typography enhancements
const typography = {
  fontFamily: [
    'Inter',
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
  ].join(','),
  h1: {
    fontSize: '2.5rem',
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
  },
  h2: {
    fontSize: '2rem',
    fontWeight: 600,
    lineHeight: 1.3,
    letterSpacing: '-0.01em',
  },
  h3: {
    fontSize: '1.75rem',
    fontWeight: 600,
    lineHeight: 1.3,
  },
  h4: {
    fontSize: '1.5rem',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  h5: {
    fontSize: '1.25rem',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  h6: {
    fontSize: '1rem',
    fontWeight: 600,
    lineHeight: 1.5,
  },
  body1: {
    fontSize: '1rem',
    lineHeight: 1.6,
  },
  body2: {
    fontSize: '0.875rem',
    lineHeight: 1.6,
  },
  button: {
    fontWeight: 600,
    textTransform: 'none',
    letterSpacing: '0.02em',
  },
};

// Enhanced component customizations
const getComponentOverrides = (isDark) => ({
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        scrollbarWidth: 'thin',
        scrollbarColor: isDark ? '#6b7280 #374151' : '#cbd5e0 #f7fafc',
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: isDark ? '#374151' : '#f7fafc',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: isDark ? '#6b7280' : '#cbd5e0',
          borderRadius: '4px',
          '&:hover': {
            backgroundColor: isDark ? '#9ca3af' : '#a0aec0',
          },
        },
      },
      '*': {
        '&:focus-visible': {
          outline: `2px solid ${isDark ? '#bb86fc' : '#667eea'}`,
          outlineOffset: '2px',
        },
      },
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: '12px',
        padding: '8px 24px',
        fontSize: '0.875rem',
        fontWeight: 600,
        textTransform: 'none',
        boxShadow: 'none',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          transform: 'translateY(-1px)',
        },
      },
      contained: {
        background: isDark 
          ? 'linear-gradient(135deg, #bb86fc 0%, #6200ea 100%)'
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        '&:hover': {
          background: isDark
            ? 'linear-gradient(135deg, #d2a7ff 0%, #7c4dff 100%)'
            : 'linear-gradient(135deg, #9ca3f7 0%, #8b5fbf 100%)',
        },
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: '16px',
        boxShadow: isDark
          ? '0 4px 24px rgba(0, 0, 0, 0.4)'
          : '0 4px 24px rgba(0, 0, 0, 0.08)',
        backdropFilter: 'blur(10px)',
        border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.05)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: isDark
            ? '0 8px 32px rgba(0, 0, 0, 0.5)'
            : '0 8px 32px rgba(0, 0, 0, 0.12)',
        },
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        backdropFilter: 'blur(10px)',
        border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.05)',
      },
      elevation1: {
        boxShadow: isDark
          ? '0 2px 8px rgba(0, 0, 0, 0.3)'
          : '0 2px 8px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  MuiAppBar: {
    styleOverrides: {
      root: {
        backdropFilter: 'blur(20px)',
        backgroundColor: isDark
          ? 'rgba(26, 29, 58, 0.9)'
          : 'rgba(255, 255, 255, 0.9)',
        boxShadow: isDark
          ? '0 2px 24px rgba(0, 0, 0, 0.4)'
          : '0 2px 24px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: '12px',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: isDark ? '#bb86fc' : '#667eea',
            },
          },
          '&.Mui-focused': {
            '& .MuiOutlinedInput-notchedOutline': {
              borderWidth: '2px',
              borderColor: isDark ? '#bb86fc' : '#667eea',
            },
          },
        },
      },
    },
  },
});

// Breakpoints for responsive design
const breakpoints = {
  values: {
    xs: 0,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    xxl: 1536,
  },
};

// Spacing system
const spacing = 8; // Base spacing unit

// Shape system
const shape = {
  borderRadius: 12,
};

// Shadow system - Material-UI requires 25 shadow levels (0-24)
const shadows = (isDark) => [
  'none',
  isDark ? '0 2px 4px rgba(0, 0, 0, 0.3)' : '0 2px 4px rgba(0, 0, 0, 0.05)',
  isDark ? '0 4px 8px rgba(0, 0, 0, 0.4)' : '0 4px 8px rgba(0, 0, 0, 0.08)',
  isDark ? '0 8px 16px rgba(0, 0, 0, 0.5)' : '0 8px 16px rgba(0, 0, 0, 0.12)',
  isDark ? '0 12px 24px rgba(0, 0, 0, 0.6)' : '0 12px 24px rgba(0, 0, 0, 0.15)',
  isDark ? '0 16px 32px rgba(0, 0, 0, 0.7)' : '0 16px 32px rgba(0, 0, 0, 0.18)',
  isDark ? '0 20px 40px rgba(0, 0, 0, 0.8)' : '0 20px 40px rgba(0, 0, 0, 0.20)',
  isDark ? '0 24px 48px rgba(0, 0, 0, 0.9)' : '0 24px 48px rgba(0, 0, 0, 0.22)',
  isDark ? '0 28px 56px rgba(0, 0, 0, 1.0)' : '0 28px 56px rgba(0, 0, 0, 0.24)',
  isDark ? '0 32px 64px rgba(0, 0, 0, 1.1)' : '0 32px 64px rgba(0, 0, 0, 0.26)',
  isDark ? '0 36px 72px rgba(0, 0, 0, 1.2)' : '0 36px 72px rgba(0, 0, 0, 0.28)',
  isDark ? '0 40px 80px rgba(0, 0, 0, 1.3)' : '0 40px 80px rgba(0, 0, 0, 0.30)',
  isDark ? '0 44px 88px rgba(0, 0, 0, 1.4)' : '0 44px 88px rgba(0, 0, 0, 0.32)',
  isDark ? '0 48px 96px rgba(0, 0, 0, 1.5)' : '0 48px 96px rgba(0, 0, 0, 0.34)',
  isDark ? '0 52px 104px rgba(0, 0, 0, 1.6)' : '0 52px 104px rgba(0, 0, 0, 0.36)',
  isDark ? '0 56px 112px rgba(0, 0, 0, 1.7)' : '0 56px 112px rgba(0, 0, 0, 0.38)',
  isDark ? '0 60px 120px rgba(0, 0, 0, 1.8)' : '0 60px 120px rgba(0, 0, 0, 0.40)',
  isDark ? '0 64px 128px rgba(0, 0, 0, 1.9)' : '0 64px 128px rgba(0, 0, 0, 0.42)',
  isDark ? '0 68px 136px rgba(0, 0, 0, 2.0)' : '0 68px 136px rgba(0, 0, 0, 0.44)',
  isDark ? '0 72px 144px rgba(0, 0, 0, 2.1)' : '0 72px 144px rgba(0, 0, 0, 0.46)',
  isDark ? '0 76px 152px rgba(0, 0, 0, 2.2)' : '0 76px 152px rgba(0, 0, 0, 0.48)',
  isDark ? '0 80px 160px rgba(0, 0, 0, 2.3)' : '0 80px 160px rgba(0, 0, 0, 0.50)',
  isDark ? '0 84px 168px rgba(0, 0, 0, 2.4)' : '0 84px 168px rgba(0, 0, 0, 0.52)',
  isDark ? '0 88px 176px rgba(0, 0, 0, 2.5)' : '0 88px 176px rgba(0, 0, 0, 0.54)',
  isDark ? '0 92px 184px rgba(0, 0, 0, 2.6)' : '0 92px 184px rgba(0, 0, 0, 0.56)',
];

// Create enhanced theme function
const createEnhancedTheme = (isDark = false, LinkBehavior) => {
  const palette = isDark ? darkPalette : lightPalette;
  
  return createTheme({
    palette: {
      mode: isDark ? 'dark' : 'light',
      ...palette,
    },
    typography,
    breakpoints,
    spacing,
    shape,
    shadows: shadows(isDark),
    components: {
      ...getComponentOverrides(isDark),
      MuiLink: {
        defaultProps: {
          component: LinkBehavior,
        },
      },
      MuiButtonBase: {
        defaultProps: {
          LinkComponent: LinkBehavior,
        },
      },
    },
    transitions: {
      duration: {
        shortest: 150,
        shorter: 200,
        short: 250,
        standard: 300,
        complex: 375,
        enteringScreen: 225,
        leavingScreen: 195,
      },
      easing: {
        easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
        easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
        easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
        sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
      },
    },
    // Custom theme properties
    custom: {
      gradients: {
        primary: isDark 
          ? 'linear-gradient(135deg, #bb86fc 0%, #6200ea 100%)'
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        secondary: isDark
          ? 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)'
          : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        background: isDark
          ? 'linear-gradient(135deg, #0a0e27 0%, #1a1d3a 100%)'
          : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      },
      animations: {
        fadeIn: {
          '@keyframes fadeIn': {
            from: { opacity: 0, transform: 'translateY(20px)' },
            to: { opacity: 1, transform: 'translateY(0)' },
          },
          animation: 'fadeIn 0.3s ease-out',
        },
        slideIn: {
          '@keyframes slideIn': {
            from: { transform: 'translateX(-100%)' },
            to: { transform: 'translateX(0)' },
          },
          animation: 'slideIn 0.3s ease-out',
        },
      },
      glassmorphism: {
        background: isDark
          ? 'rgba(26, 29, 58, 0.8)'
          : 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
        border: isDark 
          ? '1px solid rgba(255, 255, 255, 0.1)'
          : '1px solid rgba(0, 0, 0, 0.05)',
      },
    },
  });
};

export default createEnhancedTheme;

