import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { jest } from '@jest/globals';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';

import { constructor } from '@mui/material';
// Comprehensive testing utilities and helpers

// Test setup utilities
export const testUtils = {
  // Custom render function with providers
  renderWithProviders: (component, options = {}) => {
    const {
      theme = createTheme(),
      route = '/',
      ...renderOptions
    } = options;

    const AllProviders = ({ children }) => (
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          {children}
        </ThemeProvider>
      </BrowserRouter>
    );

    // Set initial route
    window.history.pushState({}, 'Test page', route);

    return {
      ...render(component, { wrapper: AllProviders, ...renderOptions }),
      // Custom utilities
      findByTestId: (testId) => screen.findByTestId(testId),
      queryByTestId: (testId) => screen.queryByTestId(testId),
      getAllByTestId: (testId) => screen.getAllByTestId(testId),
    };
  },

  // Mock API responses
  mockApi: {
    success: (data) => Promise.resolve({ data, status: 200 }),
    error: (message = 'API Error', status = 500) => 
      Promise.reject({ message, status }),
    loading: () => new Promise(() => {}), // Never resolves for loading states
  },

  // Common test data factories
  createMockUser: (overrides = {}) => ({
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    role: 'admin',
    ...overrides,
  }),

  createMockStudent: (overrides = {}) => ({
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    studentId: 'STU001',
    course: 'Computer Science',
    year: 2,
    ...overrides,
  }),

  createMockCourse: (overrides = {}) => ({
    id: '1',
    name: 'Introduction to React',
    code: 'CS101',
    instructor: 'Dr. Smith',
    credits: 3,
    semester: 'Fall 2024',
    ...overrides,
  }),
};

// Accessibility testing helpers
export const a11yHelpers = {
  // Check for proper ARIA labels
  checkAriaLabels: async (container) => {
    const elementsNeedingLabels = container.querySelectorAll(
      'input, button, select, textarea, [role="button"], [role="link"]'
    );
    
    const violations = [];
    elementsNeedingLabels.forEach(element => {
      const hasLabel = element.getAttribute('aria-label') ||
                      element.getAttribute('aria-labelledby') ||
                      element.closest('label') ||
                      element.querySelector('label');
      
      if (!hasLabel) {
        violations.push({
          element: element.tagName,
          text: element.textContent?.substring(0, 50),
          violation: 'Missing accessible name',
        });
      }
    });
    
    return violations;
  },

  // Check color contrast
  checkColorContrast: (element) => {
    const computedStyle = window.getComputedStyle(element);
    const backgroundColor = computedStyle.backgroundColor;
    const color = computedStyle.color;
    
    // Simple check - in real scenario, use a proper contrast checking library
    return {
      backgroundColor,
      color,
      // This would need proper implementation with luminance calculation
      contrastRatio: 'needs proper implementation',
      meetsWCAG: true, // Placeholder
    };
  },

  // Check keyboard navigation
  testKeyboardNavigation: async (container) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const navigationTest = [];
    
    focusableElements.forEach((element, index) => {
      element.focus();
      const isFocused = document.activeElement === element;
      navigationTest.push({
        index,
        element: element.tagName,
        canFocus: isFocused,
        tabIndex: element.tabIndex,
      });
    });
    
    return navigationTest;
  },

  // Screen reader compatibility
  checkScreenReaderCompatibility: (container) => {
    const issues = [];
    
    // Check for images without alt text
    const images = container.querySelectorAll('img');
    images.forEach(img => {
      if (!img.getAttribute('alt')) {
        issues.push({
          type: 'missing-alt-text',
          element: 'img',
          src: img.src,
        });
      }
    });
    
    // Check for headings hierarchy
    const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const headingLevels = Array.from(headings).map(h => parseInt(h.tagName[1]));
    
    for (let i = 1; i < headingLevels.length; i++) {
      if (headingLevels[i] - headingLevels[i - 1] > 1) {
        issues.push({
          type: 'heading-hierarchy-skip',
          from: `h${headingLevels[i - 1]}`,
          to: `h${headingLevels[i]}`,
        });
      }
    }
    
    return issues;
  },
};

// Performance testing helpers
export const performanceHelpers = {
  // Measure component render time
  measureRenderTime: async (renderFunction) => {
    const start = performance.now();
    const result = await renderFunction();
    const end = performance.now();
    
    return {
      renderTime: end - start,
      result,
    };
  },

  // Check for memory leaks
  checkMemoryLeaks: (component, iterations = 10) => {
    const measurements = [];
    
    for (let i = 0; i < iterations; i++) {
      const { unmount } = testUtils.renderWithProviders(component);
      
      if (performance.memory) {
        measurements.push({
          iteration: i,
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
        });
      }
      
      unmount();
    }
    
    // Analyze memory growth
    if (measurements.length > 1) {
      const first = measurements[0];
      const last = measurements[measurements.length - 1];
      const growth = last.usedJSHeapSize - first.usedJSHeapSize;
      
      return {
        measurements,
        memoryGrowth: growth,
        potentialLeak: growth > 1024 * 1024, // More than 1MB growth
      };
    }
    
    return { measurements, memoryGrowth: 0, potentialLeak: false };
  },

  // Bundle size analysis
  analyzeBundleSize: () => {
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
    
    return {
      scripts: scripts.map(script => ({
        src: script.src,
        size: 'unknown', // Would need server-side analysis
      })),
      styles: styles.map(style => ({
        href: style.href,
        size: 'unknown', // Would need server-side analysis
      })),
    };
  },
};

// Integration testing helpers
export const integrationHelpers = {
  // Mock complex interactions
  mockUserJourney: {
    login: async (credentials = { email: 'test@example.com', password: 'password' }) => {
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /login/i });
      
      fireEvent.change(emailInput, { target: { value: credentials.email } });
      fireEvent.change(passwordInput, { target: { value: credentials.password } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.queryByText(/logging in/i)).not.toBeInTheDocument();
      });
    },

    navigation: async (menuItem) => {
      const menuButton = screen.getByRole('button', { name: menuItem });
      fireEvent.click(menuButton);
      
      await waitFor(() => {
        expect(screen.getByText(new RegExp(menuItem, 'i'))).toBeInTheDocument();
      });
    },

    formSubmission: async (formData, formSelector = 'form') => {
      const form = screen.getByRole('form') || document.querySelector(formSelector);
      
      Object.entries(formData).forEach(([field, value]) => {
        const input = within(form).getByLabelText(new RegExp(field, 'i'));
        fireEvent.change(input, { target: { value } });
      });
      
      const submitButton = within(form).getByRole('button', { name: /submit/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.queryByText(/submitting/i)).not.toBeInTheDocument();
      });
    },
  },

  // API integration testing
  mockApiCalls: {
    setupSuccessfulApi: () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, data: {} }),
        })
      );
    },

    setupFailedApi: (status = 500, message = 'Server Error') => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: false,
          status,
          json: () => Promise.resolve({ error: message }),
        })
      );
    },

    setupNetworkError: () => {
      global.fetch = jest.fn(() =>
        Promise.reject(new Error('Network Error'))
      );
    },
  },
};

// Visual regression testing helpers
export const visualTestingHelpers = {
  // Take component snapshot
  takeSnapshot: (component, name) => {
    const { container } = testUtils.renderWithProviders(component);
    expect(container.firstChild).toMatchSnapshot(name);
  },

  // Compare visual states
  compareStates: (component, states) => {
    const snapshots = {};
    
    states.forEach(state => {
      const { container } = testUtils.renderWithProviders(
        React.cloneElement(component, state.props)
      );
      snapshots[state.name] = container.innerHTML;
    });
    
    return snapshots;
  },
};

// Custom testing hooks
export const useTestingHelpers = () => {
  return {
    // Mock console methods to capture logs
    mockConsole: () => {
      const originalConsole = { ...console };
      const logs = [];
      
      console.log = jest.fn((...args) => logs.push({ type: 'log', args }));
      console.warn = jest.fn((...args) => logs.push({ type: 'warn', args }));
      console.error = jest.fn((...args) => logs.push({ type: 'error', args }));
      
      return {
        logs,
        restore: () => {
          Object.assign(console, originalConsole);
        },
      };
    },

    // Mock timers for testing time-dependent code
    mockTimers: () => {
      jest.useFakeTimers();
      return {
        advanceTime: (ms) => jest.advanceTimersByTime(ms),
        restore: () => jest.useRealTimers(),
      };
    },
  };
};

// Test configuration
export const testConfig = {
  setupFile: () => {
    // Mock IntersectionObserver
    global.IntersectionObserver = class IntersectionObserver {
      constructor() {}
      observe() {}
      unobserve() {}
      disconnect() {}
    };

    // Mock ResizeObserver
    global.ResizeObserver = class ResizeObserver {
      constructor() {}
      observe() {}
      unobserve() {}
      disconnect() {}
    };

    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  },

  teardownFile: () => {
    // Clean up any global state
    localStorage.clear();
    sessionStorage.clear();
    
    // Reset fetch mocks
    if (global.fetch && global.fetch.mockRestore) {
      global.fetch.mockRestore();
    }
  },
};

export default {
  testUtils,
  a11yHelpers,
  performanceHelpers,
  integrationHelpers,
  visualTestingHelpers,
  useTestingHelpers,
  testConfig,
};

