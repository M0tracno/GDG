import { configure } from '@testing-library/react';
import { performanceTestUtils } from './performanceTesting';
import { securityTestUtils } from './securityTesting';

import { constructor, toString } from '@mui/material';
// filepath: c:\Users\AYUSHMAN NANDA\OneDrive\Desktop\GDC\src\utils\testSetup.js
// Test setup configuration

// Configure testing library
configure({
  testIdAttribute: 'data-testid',
  asyncUtilTimeout: 5000,
});

// Mock performance and security APIs
performanceTestUtils.mockPerformanceAPIs();
securityTestUtils.mockSecurityAPIs();

// Global test utilities
global.testUtils = {
  waitForLoadingToFinish: async () => {
    const { waitForElementToBeRemoved, screen } = await import('@testing-library/react');
    try {
      await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'), {
        timeout: 5000,
      });
    } catch (error) {
      // Loading indicator might not be present
    }
  },
  
  mockApiResponse: (data, delay = 0) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          ok: true,
          json: () => Promise.resolve(data),
          status: 200,
        });
      }, delay);
    });
  },
  
  mockApiError: (message = 'API Error', status = 500, delay = 0) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        reject({
          message,
          status,
          response: { status, statusText: message },
        });
      }, delay);
    });
  },
};

// Mock console methods to reduce noise in tests
const originalError = console.error;
const originalWarn = console.warn;

console.error = (...args) => {
  // Filter out specific React warnings that are expected in tests
  const message = args[0];
  if (
    typeof message === 'string' &&
    (message.includes('Warning: ReactDOM.render is no longer supported') ||
     message.includes('Warning: An invalid form control') ||
     message.includes('Warning: Each child in a list should have a unique'))
  ) {
    return;
  }
  originalError.call(console, ...args);
};

console.warn = (...args) => {
  // Filter out specific warnings
  const message = args[0];
  if (
    typeof message === 'string' &&
    (message.includes('componentWillMount') ||
     message.includes('componentWillReceiveProps'))
  ) {
    return;
  }
  originalWarn.call(console, ...args);
};

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor(callback, options) {
    this.callback = callback;
    this.options = options;
  }
  
  observe(target) {
    // Simulate immediate intersection
    this.callback([{
      target,
      isIntersecting: true,
      intersectionRatio: 1,
      boundingClientRect: target.getBoundingClientRect(),
      intersectionRect: target.getBoundingClientRect(),
      rootBounds: null,
      time: Date.now(),
    }], this);
  }
  
  unobserve() {}
  disconnect() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor(callback) {
    this.callback = callback;
  }
  
  observe(target) {
    // Simulate immediate resize
    this.callback([{
      target,
      contentRect: {
        width: 1024,
        height: 768,
        top: 0,
        left: 0,
        bottom: 768,
        right: 1024,
      },
    }], this);
  }
  
  unobserve() {}
  disconnect() {}
};

// Mock MutationObserver
global.MutationObserver = class MutationObserver {
  constructor(callback) {
    this.callback = callback;
  }
  
  observe() {}
  disconnect() {}
};

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000',
    origin: 'http://localhost:3000',
    protocol: 'http:',
    host: 'localhost:3000',
    hostname: 'localhost',
    port: '3000',
    pathname: '/',
    search: '',
    hash: '',
    assign: jest.fn(),
    replace: jest.fn(),
    reload: jest.fn(),
  },
  writable: true,
});

// Mock localStorage and sessionStorage
const createStorage = () => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    key: jest.fn((index) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    }),
    get length() {
      return Object.keys(store).length;
    },
  };
};

Object.defineProperty(window, 'localStorage', {
  value: createStorage(),
});

Object.defineProperty(window, 'sessionStorage', {
  value: createStorage(),
});

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    blob: () => Promise.resolve(new Blob()),
  })
);

// Mock crypto.getRandomValues
Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: jest.fn().mockImplementation((arr) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    }),
    subtle: {
      digest: jest.fn().mockResolvedValue(new ArrayBuffer(32)),
    },
  },
});

// Mock Canvas API for chart testing
HTMLCanvasElement.prototype.getContext = jest.fn().mockReturnValue({
  fillRect: jest.fn(),
  clearRect: jest.fn(),
  getImageData: jest.fn(() => ({ data: new Array(4) })),
  putImageData: jest.fn(),
  createImageData: jest.fn(() => []),
  setTransform: jest.fn(),
  drawImage: jest.fn(),
  save: jest.fn(),
  fillText: jest.fn(),
  restore: jest.fn(),
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  closePath: jest.fn(),
  stroke: jest.fn(),
  translate: jest.fn(),
  scale: jest.fn(),
  rotate: jest.fn(),
  arc: jest.fn(),
  fill: jest.fn(),
  measureText: jest.fn(() => ({ width: 0 })),
  transform: jest.fn(),
  rect: jest.fn(),
  clip: jest.fn(),
});

// Mock File and FileReader
global.File = class File {
  constructor(chunks, filename, opts = {}) {
    this.chunks = chunks;
    this.name = filename;
    this.type = opts.type || '';
    this.size = chunks.reduce((size, chunk) => size + chunk.length, 0);
  }
};

global.FileReader = class FileReader {
  constructor() {
    this.readAsDataURL = jest.fn();
    this.readAsText = jest.fn();
    this.result = null;
    this.error = null;
    this.onload = null;
    this.onerror = null;
  }
};

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mocked-url');
global.URL.revokeObjectURL = jest.fn();

// Setup global test environment variables
process.env.REACT_APP_TEST_MODE = 'true';
process.env.NODE_ENV = 'test';

// Custom matchers for performance testing
expect.extend({
  toRenderWithinTime(received, timeLimit) {
    const pass = received <= timeLimit;
    return {
      message: () =>
        `expected render time ${received}ms to be ${pass ? 'greater' : 'less'} than ${timeLimit}ms`,
      pass,
    };
  },
  
  toHaveNoSecurityVulnerabilities(received) {
    const highSeverityIssues = received.filter(issue => issue.severity === 'high');
    const pass = highSeverityIssues.length === 0;
    return {
      message: () =>
        `expected no high severity security issues, but found ${highSeverityIssues.length}`,
      pass,
    };
  },
  
  toHaveGoodPerformanceScore(received, threshold = 70) {
    const pass = received >= threshold;
    return {
      message: () =>
        `expected performance score ${received} to be ${pass ? 'lower' : 'higher'} than ${threshold}`,
      pass,
    };
  },
});

// Cleanup function for after each test
afterEach(() => {
  // Clear all mocks
  jest.clearAllMocks();
  
  // Clear timers
  jest.clearAllTimers();
  
  // Reset fetch mock
  if (global.fetch && global.fetch.mockClear) {
    global.fetch.mockClear();
  }
  
  // Clear storage
  window.localStorage.clear();
  window.sessionStorage.clear();
});

// Global error handler for unhandled promises
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

console.log('🧪 Test environment setup completed');

