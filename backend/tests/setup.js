// Increase default timeout for tests
jest.setTimeout(10000);

// Silence console logs during tests
if (process.env.NODE_ENV !== 'debug') {
  global.console = {
    ...console,
    // Keep error logs for debugging
    log: jest.fn(),
    info: jest.fn(),
    warn: jest.fn()
  };
} 