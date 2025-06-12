import { createTheme } from '@mui/material/styles';

// Create a futuristic theme with modern colors and effects
const futuristicTheme = createTheme({
  palette: {
    primary: {
      main: '#3a86ff', // Vibrant blue
      light: '#6ba1ff',
      dark: '#0052cc',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#8338ec', // Vibrant purple
      light: '#a55ffd',
      dark: '#5a1db3',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
      dark: '#121212',
      gradient: 'linear-gradient(135deg, #3a86ff 0%, #8338ec 100%)',
      glassEffect: 'rgba(255, 255, 255, 0.8)',
    },
    success: {
      main: '#06d6a0', // Teal
      light: '#39e5b8',
      dark: '#049e76',
      contrastText: '#ffffff',
    },
    error: {
      main: '#ef476f', // Pink-red
      light: '#ff6b8a',
      dark: '#d1285a',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#ffd166', // Yellow
      light: '#ffe082',
      dark: '#f9a825',
      contrastText: '#2b2d42',
    },
    info: {
      main: '#118ab2', // Blue-teal
      light: '#4fc3f7',
      dark: '#0277bd',
      contrastText: '#ffffff',
    },
    text: {
      primary: '#2d3436',
      secondary: '#636e72',
      disabled: '#b0bec5',
      hint: '#78909c',
    },
    divider: 'rgba(0, 0, 0, 0.08)',
    action: {
      active: 'rgba(0, 0, 0, 0.54)',
      hover: 'rgba(0, 0, 0, 0.04)',
      selected: 'rgba(0, 0, 0, 0.08)',
      disabled: 'rgba(0, 0, 0, 0.26)',
      disabledBackground: 'rgba(0, 0, 0, 0.12)',
    },
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", sans-serif',
    fontSize: 14,
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
      marginBottom: '24px',
      background: 'linear-gradient(45deg, #3a86ff 30%, #8338ec 90%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.25,
      letterSpacing: '-0.01em',
      marginBottom: '20px',
      color: '#2d3436',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.3,
      marginBottom: '18px',
      color: '#2d3436',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.35,
      marginBottom: '16px',
      color: '#2d3436',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
      marginBottom: '14px',
      color: '#2d3436',
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.45,
      marginBottom: '12px',
      color: '#2d3436',
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.5,
      letterSpacing: '0.00938em',
      marginBottom: '8px',
      color: '#2d3436',
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.57,
      letterSpacing: '0.00714em',
      marginBottom: '6px',
      color: '#636e72',
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.6,
      letterSpacing: '0.00938em',
      marginBottom: '16px',
      color: '#2d3436',
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.6,
      letterSpacing: '0.01071em',
      marginBottom: '12px',
      color: '#636e72',
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.75,
      letterSpacing: '0.02857em',
      textTransform: 'none',
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 400,
      lineHeight: 1.66,
      letterSpacing: '0.03333em',
      color: '#78909c',
    },
    overline: {
      fontSize: '0.75rem',
      fontWeight: 500,
      lineHeight: 2.66,
      letterSpacing: '0.08333em',
      textTransform: 'uppercase',
      color: '#78909c',
    },
  },
  spacing: 8, // Base spacing unit
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0px 1px 3px rgba(0, 0, 0, 0.08), 0px 1px 2px rgba(0, 0, 0, 0.06)',
    '0px 2px 6px rgba(0, 0, 0, 0.08), 0px 1px 3px rgba(0, 0, 0, 0.06)',
    '0px 3px 8px rgba(0, 0, 0, 0.08), 0px 2px 4px rgba(0, 0, 0, 0.06)',
    '0px 4px 10px rgba(0, 0, 0, 0.08), 0px 2px 6px rgba(0, 0, 0, 0.06)',
    '0px 6px 14px rgba(0, 0, 0, 0.08), 0px 3px 8px rgba(0, 0, 0, 0.06)',
    '0px 8px 18px rgba(0, 0, 0, 0.08), 0px 4px 10px rgba(0, 0, 0, 0.06)',
    '0px 10px 22px rgba(0, 0, 0, 0.08), 0px 5px 12px rgba(0, 0, 0, 0.06)',
    '0px 12px 26px rgba(0, 0, 0, 0.08), 0px 6px 14px rgba(0, 0, 0, 0.06)',
    '0px 14px 30px rgba(0, 0, 0, 0.08), 0px 7px 16px rgba(0, 0, 0, 0.06)',
    '0px 16px 34px rgba(0, 0, 0, 0.08), 0px 8px 18px rgba(0, 0, 0, 0.06)',
    '0px 18px 38px rgba(0, 0, 0, 0.08), 0px 9px 20px rgba(0, 0, 0, 0.06)',
    '0px 20px 42px rgba(0, 0, 0, 0.08), 0px 10px 22px rgba(0, 0, 0, 0.06)',
    '0px 22px 46px rgba(0, 0, 0, 0.08), 0px 11px 24px rgba(0, 0, 0, 0.06)',
    '0px 24px 50px rgba(0, 0, 0, 0.08), 0px 12px 26px rgba(0, 0, 0, 0.06)',
    '0px 26px 54px rgba(0, 0, 0, 0.08), 0px 13px 28px rgba(0, 0, 0, 0.06)',
    '0px 28px 58px rgba(0, 0, 0, 0.08), 0px 14px 30px rgba(0, 0, 0, 0.06)',
    '0px 30px 62px rgba(0, 0, 0, 0.08), 0px 15px 32px rgba(0, 0, 0, 0.06)',
    '0px 32px 66px rgba(0, 0, 0, 0.08), 0px 16px 34px rgba(0, 0, 0, 0.06)',
    '0px 34px 70px rgba(0, 0, 0, 0.08), 0px 17px 36px rgba(0, 0, 0, 0.06)',
    '0px 36px 74px rgba(0, 0, 0, 0.08), 0px 18px 38px rgba(0, 0, 0, 0.06)',
    '0px 38px 78px rgba(0, 0, 0, 0.08), 0px 19px 40px rgba(0, 0, 0, 0.06)',
    '0px 40px 82px rgba(0, 0, 0, 0.08), 0px 20px 42px rgba(0, 0, 0, 0.06)',
    '0px 42px 86px rgba(0, 0, 0, 0.08), 0px 21px 44px rgba(0, 0, 0, 0.06)',
    '0px 44px 90px rgba(0, 0, 0, 0.08), 0px 22px 46px rgba(0, 0, 0, 0.06)',
  ],
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
  zIndex: {
    mobileStepper: 1000,
    speedDial: 1050,
    appBar: 1100,
    drawer: 1200,
    modal: 1300,
    snackbar: 1400,
    tooltip: 1500,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          padding: '8px 16px',
          fontWeight: 500,
          boxShadow: '0 4px 20px rgba(58, 134, 255, 0.2)',
          '&:hover': {
            boxShadow: '0 6px 25px rgba(58, 134, 255, 0.3)',
          },
        },
        contained: {
          background: 'linear-gradient(45deg, #3a86ff 30%, #8338ec 90%)',
          color: 'white',
          '&:hover': {
            background: 'linear-gradient(45deg, #2d6bff 30%, #6b2fd3 90%)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '&:hover fieldset': {
              borderColor: '#3a86ff',
            },
          },
        },
      },
    },
  },
  props: {
    MuiButton: {
      disableElevation: true,
    },
    MuiPaper: {
      elevation: 0,
    },
    MuiAppBar: {
      elevation: 0,
    },
    MuiCard: {
      elevation: 0,
    },
    MuiInputBase: {
      spellCheck: false,
    },
    MuiTextField: {
      variant: 'outlined',
      margin: 'normal',
      fullWidth: true,
    },
    MuiLink: {
      underline: 'hover',
    },
    MuiMenu: {
      getContentAnchorEl: null,
    },
    MuiTooltip: {
      arrow: true,
    },
  },
});

export default futuristicTheme;



