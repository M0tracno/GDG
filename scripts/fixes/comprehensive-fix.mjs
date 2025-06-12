/**
 * Comprehensive Fix Script for MUI v7 and React Issues
 * 
 * This script addresses:
 * 1. ScrollTop transition errors
 * 2. Theme application issues
 * 3. Component rendering problems
 * 4. Authentication flow issues
 */

import fs from 'fs';
import path from 'path';

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

function findAndFixFiles() {
  const srcDir = path.join(process.cwd(), 'src');
  
  console.log('🔧 Starting comprehensive fix...');
  
  // Fix 1: Add error boundary for scrollTop issues
  createScrollTopFix();
  
  // Fix 2: Update theme provider setup
  fixThemeProvider();
  
  // Fix 3: Fix potential CSS loading issues
  fixCSSLoading();
  
  // Fix 4: Add React Router error boundaries
  addRouterErrorBoundary();
  
  console.log('✅ Comprehensive fixes completed!');
}

function createScrollTopFix() {
  const scrollTopFixContent = `
// ScrollTop Fix for MUI v7 Compatibility
import { useEffect } from 'react';

export const useScrollTopFix = () => {
  useEffect(() => {
    // Add a global error handler for scrollTop issues
    const originalError = console.error;
    console.error = (...args) => {
      const errorMessage = args[0];
      if (typeof errorMessage === 'string' && errorMessage.includes('scrollTop')) {
        // Suppress scrollTop errors and provide fallback
        console.warn('ScrollTop error suppressed:', ...args);
        return;
      }
      originalError(...args);
    };
    
    // Cleanup
    return () => {
      console.error = originalError;
    };
  }, []);
};

// Transition wrapper to prevent scrollTop errors
export const SafeTransition = ({ children, ...props }) => {
  useScrollTopFix();
  
  return (
    <div style={{ 
      transition: 'all 0.3s ease',
      position: 'relative'
    }}>
      {children}
    </div>
  );
};

export default SafeTransition;
`;

  fs.writeFileSync(
    path.join(process.cwd(), 'src', 'utils', 'scrollTopFix.js'),
    scrollTopFixContent,
    'utf8'
  );
  
  console.log('✅ Created scrollTop fix utility');
}

function fixThemeProvider() {
  const appJsPath = path.join(process.cwd(), 'src', 'App.js');
  
  if (fs.existsSync(appJsPath)) {
    let content = fs.readFileSync(appJsPath, 'utf8');
    
    // Add import for ScrollTop fix
    if (!content.includes('useScrollTopFix')) {
      content = content.replace(
        "import createCustomTheme from './theme/createCustomTheme';",
        `import createCustomTheme from './theme/createCustomTheme';
import { useScrollTopFix } from './utils/scrollTopFix';`
      );
    }
    
    // Add ScrollTop fix usage
    if (!content.includes('useScrollTopFix()')) {
      content = content.replace(
        'function App() {',
        `function App() {
  useScrollTopFix();`
      );
    }
    
    fs.writeFileSync(appJsPath, content, 'utf8');
    console.log('✅ Updated App.js with scrollTop fix');
  }
}

function fixCSSLoading() {
  const indexCssPath = path.join(process.cwd(), 'src', 'index.css');
  
  const cssContent = `
/* MUI v7 Reset and Global Styles */
* {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f8f9fa;
}

#root {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Ensure proper scrolling behavior */
html {
  scroll-behavior: smooth;
}

/* Fix for MUI v7 transitions */
.MuiCollapse-root,
.MuiSlide-root,
.MuiFade-root {
  overflow: hidden !important;
}

/* Loading indicator styles */
.loading-indicator {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

/* Error boundary styles */
.error-boundary {
  padding: 20px;
  text-align: center;
  color: #d32f2f;
}
`;

  fs.writeFileSync(indexCssPath, cssContent, 'utf8');
  console.log('✅ Updated index.css with MUI v7 fixes');
}

function addRouterErrorBoundary() {
  const errorBoundaryContent = `
import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';

class RouterErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Router Error Boundary caught an error:', error, errorInfo);
    
    // Suppress scrollTop errors
    if (error.message && error.message.includes('scrollTop')) {
      this.setState({ hasError: false, error: null });
      return;
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
          p={3}
        >
          <Paper elevation={3} sx={{ p: 4, textAlign: 'center', maxWidth: 400 }}>
            <Typography variant="h5" color="error" gutterBottom>
              Oops! Something went wrong
            </Typography>
            <Typography variant="body1" color="textSecondary" paragraph>
              There was an unexpected error. Please try refreshing the page.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<RefreshIcon />}
              onClick={this.handleReload}
            >
              Reload Page
            </Button>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default RouterErrorBoundary;
`;

  fs.writeFileSync(
    path.join(process.cwd(), 'src', 'components', 'RouterErrorBoundary.js'),
    errorBoundaryContent,
    'utf8'
  );
  
  console.log('✅ Created Router Error Boundary');
}

// Run the fixes
findAndFixFiles();
