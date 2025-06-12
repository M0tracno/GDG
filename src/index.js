import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import * as serviceWorker from './serviceWorker';

// Apply scrollTop fix immediately to prevent MUI transition errors

// Apply the fix globally
const applyGlobalScrollTopFix = () => {
  // Apply the scrollTop fix logic immediately
  if (typeof window !== 'undefined') {
    // Patch Element.prototype.scrollTop
    const originalDescriptor = Object.getOwnPropertyDescriptor(Element.prototype, 'scrollTop');
    
    if (originalDescriptor) {
      Object.defineProperty(Element.prototype, 'scrollTop', {
        get() {
          try {
            if (!this || this === null || this === undefined) {
              return 0;
            }
            return originalDescriptor.get.call(this) || 0;
          } catch (error) {
            return 0;
          }
        },
        set(value) {
          try {
            if (!this || this === null || this === undefined) {
              return;
            }
            if (originalDescriptor.set) {
              originalDescriptor.set.call(this, value);
            }
          } catch (error) {
            // Silently ignore errors
          }
        },
        configurable: true,
        enumerable: true
      });
    }

    // Suppress scrollTop errors
    const originalError = console.error;
    console.error = (...args) => {
      const errorMessage = args[0];
      if (typeof errorMessage === 'string') {
        const suppressedErrors = [
          'scrollTop',
          'Cannot read properties of null',
          'Cannot read properties of undefined',
          'reflow'
        ];
        
        if (suppressedErrors.some(err => errorMessage.includes(err))) {
          console.warn('MUI transition error suppressed:', args[0]);
          return;
        }
      }
      originalError(...args);
    };
  }
};

// Apply fix immediately
applyGlobalScrollTopFix();

// Log environment configuration
console.log('Environment Configuration:', {
  NODE_ENV: process.env.NODE_ENV,
  REACT_APP_API_URL: process.env.REACT_APP_API_URL,
  PUBLIC_URL: process.env.PUBLIC_URL
});

// Add error handling for debugging
window.addEventListener('error', (event) => {
  console.error('Global error caught:', {
    message: event.error?.message,
    stack: event.error?.stack,
    location: window.location.href,
    timestamp: new Date().toISOString()
  });
});

// Add unhandled promise rejection handling
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled Promise Rejection:', {
    reason: event.reason,
    location: window.location.href,
    timestamp: new Date().toISOString()
  });
});

// React 18 rendering with error boundary
const rootElement = document.getElementById('root');
const renderApp = () => {
  try {
    const root = createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error('Error rendering app:', error);
    // Show error UI
    rootElement.innerHTML = `
      <div style="padding: 20px; font-family: Arial, sans-serif;">
        <h2 style="color: red;">Application Error</h2>
        <p>Something went wrong while loading the application. Please try refreshing the page.</p>
        <pre style="background: #f1f1f1; padding: 10px; border-radius: 5px; white-space: pre-wrap;">
          Error: ${error.message}
          Stack: ${error.stack}
        </pre>
        <button onclick="window.location.reload()" style="padding: 10px 20px; margin-top: 20px;">
          Reload Application
        </button>
      </div>
    `;
  }
};

renderApp();

// Register service worker for offline capabilities
if (process.env.NODE_ENV === 'production') {
  serviceWorker.register({
    onUpdate: (registration) => {
      // Show a notification to the user that a new version is available
      const updateButton = document.createElement('div');
      updateButton.style.position = 'fixed';
      updateButton.style.bottom = '20px';
      updateButton.style.right = '20px';
      updateButton.style.padding = '10px 20px';
      updateButton.style.backgroundColor = '#4caf50';
      updateButton.style.color = 'white';
      updateButton.style.borderRadius = '4px';
      updateButton.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
      updateButton.style.cursor = 'pointer';
      updateButton.style.zIndex = '9999';
      updateButton.textContent = 'Update Available - Click to Refresh';
      
      updateButton.addEventListener('click', () => {
        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
        window.location.reload();
      });
      
      document.body.appendChild(updateButton);
    }
  });
} else {
  serviceWorker.unregister();
}

// Performance monitoring
// Only log performance metrics in development
if (process.env.NODE_ENV !== 'production') {
  reportWebVitals(console.log);
} 



