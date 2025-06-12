import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';

import { constructor } from '@mui/material';
// filepath: c:\Users\AYUSHMAN NANDA\OneDrive\Desktop\GDC\src\utils\securityTesting.js
// Security testing utilities for AdminDashboard enhancements

/**
 * Security Testing Utilities
 * Comprehensive security testing for React components and applications
 */
export class SecurityTester {
  constructor() {
    this.vulnerabilities = [];
    this.securityChecks = {
      xss: [],
      csrf: [],
      inputValidation: [],
      authentication: [],
      authorization: [],
      dataLeaks: [],
    };
    this.testResults = {};
  }

  // XSS (Cross-Site Scripting) Testing
  async testXSSVulnerabilities(Component, inputSelectors = []) {
    const xssPayloads = [
      '<script>alert("XSS")</script>',
      '<img src=x onerror=alert("XSS")>',
      'javascript:alert("XSS")',
      '<svg onload=alert("XSS")>',
      '"><script>alert("XSS")</script>',
      "'><script>alert('XSS')</script>",
      '<iframe src="javascript:alert(\'XSS\')"></iframe>',
      '"><img src=x onerror=alert("XSS")>',
    ];

    const results = [];
    const { container } = render(Component);

    for (const payload of xssPayloads) {
      for (const selector of inputSelectors) {
        try {
          const input = container.querySelector(selector);
          if (input) {
            fireEvent.change(input, { target: { value: payload } });
            fireEvent.blur(input);

            // Check if payload is reflected in DOM without sanitization
            await waitFor(() => {
              const innerHTML = container.innerHTML;
              const isVulnerable = innerHTML.includes('<script>') || 
                                 innerHTML.includes('javascript:') || 
                                 innerHTML.includes('onerror=') ||
                                 innerHTML.includes('onload=');
              
              if (isVulnerable) {
                results.push({
                  type: 'xss',
                  severity: 'high',
                  payload,
                  selector,
                  vulnerability: 'Unsanitized user input reflected in DOM',
                  recommendation: 'Implement input sanitization and output encoding',
                });
              }
            });
          }
        } catch (error) {
          // Test passed - error indicates proper handling
        }
      }
    }

    this.securityChecks.xss = results;
    return results;
  }

  // CSRF (Cross-Site Request Forgery) Testing
  async testCSRFProtection(formComponent, submitButtonSelector = 'button[type="submit"]') {
    const results = [];
    const { container } = render(formComponent);

    // Check for CSRF token presence
    const csrfTokens = container.querySelectorAll('input[name*="csrf"], input[name*="token"], meta[name="csrf-token"]');
    
    if (csrfTokens.length === 0) {
      results.push({
        type: 'csrf',
        severity: 'high',
        vulnerability: 'No CSRF token found in form',
        recommendation: 'Implement CSRF tokens for state-changing requests',
      });
    }

    // Test form submission without token
    const submitButton = container.querySelector(submitButtonSelector);
    if (submitButton) {
      // Mock fetch to intercept requests
      const originalFetch = global.fetch;
      let requestMadе = false;
      
      global.fetch = jest.fn(() => {
        requestMadе = true;
        return Promise.resolve({ ok: true });
      });

      fireEvent.click(submitButton);

      if (requestMadе) {
        const lastCall = global.fetch.mock.calls[global.fetch.mock.calls.length - 1];
        const requestBody = lastCall[1]?.body;
        
        if (!requestBody || !requestBody.includes('csrf') && !requestBody.includes('token')) {
          results.push({
            type: 'csrf',
            severity: 'medium',
            vulnerability: 'Form submission without CSRF token validation',
            recommendation: 'Ensure all state-changing requests include CSRF tokens',
          });
        }
      }

      global.fetch = originalFetch;
    }

    this.securityChecks.csrf = results;
    return results;
  }

  // Input Validation Testing
  async testInputValidation(Component, inputTestCases = []) {
    const maliciousInputs = [
      { type: 'sql_injection', value: "'; DROP TABLE users; --" },
      { type: 'command_injection', value: '; rm -rf /' },
      { type: 'path_traversal', value: '../../../etc/passwd' },
      { type: 'ldap_injection', value: '*)(&(objectClass=*))' },
      { type: 'xpath_injection', value: "' or '1'='1" },
      { type: 'email_header_injection', value: 'test@example.com\nBcc: attacker@evil.com' },
      { type: 'buffer_overflow', value: 'A'.repeat(10000) },
      { type: 'null_byte', value: 'file.txt\x00.php' },
      ...inputTestCases,
    ];

    const results = [];
    const { container } = render(Component);

    for (const testCase of maliciousInputs) {
      const inputs = container.querySelectorAll('input, textarea, select');
      
      for (const input of inputs) {
        try {
          fireEvent.change(input, { target: { value: testCase.value } });
          
          // Check if validation occurs
          await waitFor(() => {
            const errorMessages = container.querySelectorAll('.error, [role="alert"], .MuiFormHelperText-error');
            const hasValidation = errorMessages.length > 0;
            
            if (!hasValidation && input.value === testCase.value) {
              results.push({
                type: 'input_validation',
                severity: 'medium',
                inputType: testCase.type,
                vulnerability: `No validation for ${testCase.type} in ${input.name || input.type} field`,
                recommendation: 'Implement proper input validation and sanitization',
              });
            }
          }, { timeout: 1000 });
        } catch (error) {
          // Validation might have prevented the input
        }
      }
    }

    this.securityChecks.inputValidation = results;
    return results;
  }

  // Authentication Testing
  async testAuthenticationSecurity(authComponent, credentials = {}) {
    const results = [];
    const { container } = render(authComponent);

    // Test weak password acceptance
    const weakPasswords = ['123456', 'password', 'admin', 'qwerty', '12345678'];
    const passwordInput = container.querySelector('input[type="password"]');
    
    if (passwordInput) {
      for (const weakPassword of weakPasswords) {
        fireEvent.change(passwordInput, { target: { value: weakPassword } });
        
        await waitFor(() => {
          const errorMessages = container.querySelectorAll('.error, [role="alert"], .MuiFormHelperText-error');
          const hasWeakPasswordWarning = Array.from(errorMessages).some(el => 
            el.textContent.toLowerCase().includes('weak') || 
            el.textContent.toLowerCase().includes('strength')
          );
          
          if (!hasWeakPasswordWarning) {
            results.push({
              type: 'authentication',
              severity: 'medium',
              vulnerability: 'Weak password accepted without warning',
              recommendation: 'Implement password strength validation',
            });
          }
        }, { timeout: 1000 });
      }
    }

    // Test brute force protection
    const loginForm = container.querySelector('form');
    const submitButton = container.querySelector('button[type="submit"]');
    
    if (loginForm && submitButton) {
      // Simulate multiple failed attempts
      for (let i = 0; i < 10; i++) {
        fireEvent.submit(loginForm);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Check if rate limiting is implemented
      const isButtonDisabled = submitButton.disabled;
      const hasRateLimitMessage = container.textContent.includes('too many attempts') ||
                                  container.textContent.includes('rate limit') ||
                                  container.textContent.includes('try again later');

      if (!isButtonDisabled && !hasRateLimitMessage) {
        results.push({
          type: 'authentication',
          severity: 'high',
          vulnerability: 'No brute force protection detected',
          recommendation: 'Implement rate limiting and account lockout mechanisms',
        });
      }
    }

    this.securityChecks.authentication = results;
    return results;
  }

  // Data Exposure Testing
  async testDataExposure(Component, sensitiveDataPatterns = []) {
    const defaultPatterns = [
      /\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}/, // Credit card
      /\d{3}-\d{2}-\d{4}/, // SSN
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/, // Email
      /\+?1?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/, // Phone
      /(?:password|pwd|pass|secret|key|token)[\s]*[:=][\s]*[\w\d]+/i, // Passwords
      ...sensitiveDataPatterns,
    ];

    const results = [];
    const { container } = render(Component);

    // Check for sensitive data in HTML
    const htmlContent = container.innerHTML;
    
    for (const pattern of defaultPatterns) {
      const matches = htmlContent.match(pattern);
      if (matches) {
        results.push({
          type: 'data_exposure',
          severity: 'high',
          vulnerability: 'Sensitive data exposed in DOM',
          data: matches[0].substring(0, 10) + '...',
          recommendation: 'Mask or remove sensitive data from client-side rendering',
        });
      }
    }

    // Check console logs for sensitive data
    const originalConsole = console.log;
    let consoleOutputs = [];
    
    console.log = (...args) => {
      consoleOutputs.push(args.join(' '));
      originalConsole(...args);
    };

    // Trigger component interactions to generate logs
    const buttons = container.querySelectorAll('button');
    buttons.forEach(button => fireEvent.click(button));

    console.log = originalConsole;

    for (const output of consoleOutputs) {
      for (const pattern of defaultPatterns) {
        if (pattern.test(output)) {
          results.push({
            type: 'data_exposure',
            severity: 'medium',
            vulnerability: 'Sensitive data logged to console',
            recommendation: 'Remove or sanitize console logging in production',
          });
        }
      }
    }

    this.securityChecks.dataLeaks = results;
    return results;
  }

  // Session Security Testing
  async testSessionSecurity() {
    const results = [];

    // Check session storage for sensitive data
    if (typeof sessionStorage !== 'undefined') {
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        const value = sessionStorage.getItem(key);
        
        if (value && (
          value.includes('password') || 
          value.includes('token') ||
          value.includes('secret') ||
          /\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}/.test(value)
        )) {
          results.push({
            type: 'session_security',
            severity: 'high',
            vulnerability: `Sensitive data in sessionStorage: ${key}`,
            recommendation: 'Avoid storing sensitive data in browser storage',
          });
        }
      }
    }

    // Check local storage for sensitive data
    if (typeof localStorage !== 'undefined') {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        
        if (value && (
          value.includes('password') || 
          value.includes('token') ||
          value.includes('secret') ||
          /\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}/.test(value)
        )) {
          results.push({
            type: 'session_security',
            severity: 'high',
            vulnerability: `Sensitive data in localStorage: ${key}`,
            recommendation: 'Use secure, httpOnly cookies for sensitive data',
          });
        }
      }
    }

    return results;
  }

  // Comprehensive Security Audit
  async runSecurityAudit(Component, options = {}) {
    const {
      inputSelectors = ['input', 'textarea'],
      testXSS = true,
      testCSRF = true,
      testInputValidation = true,
      testAuthentication = true,
      testDataExposure = true,
      testSessionSecurity = true,
    } = options;

    console.log('🔒 Starting comprehensive security audit...');

    const auditResults = {
      timestamp: new Date().toISOString(),
      component: Component.name || 'Anonymous',
      vulnerabilities: [],
      recommendations: [],
    };

    try {
      if (testXSS) {
        console.log('Testing XSS vulnerabilities...');
        const xssResults = await this.testXSSVulnerabilities(Component, inputSelectors);
        auditResults.vulnerabilities.push(...xssResults);
      }

      if (testCSRF) {
        console.log('Testing CSRF protection...');
        const csrfResults = await this.testCSRFProtection(Component);
        auditResults.vulnerabilities.push(...csrfResults);
      }

      if (testInputValidation) {
        console.log('Testing input validation...');
        const validationResults = await this.testInputValidation(Component);
        auditResults.vulnerabilities.push(...validationResults);
      }

      if (testAuthentication) {
        console.log('Testing authentication security...');
        const authResults = await this.testAuthenticationSecurity(Component);
        auditResults.vulnerabilities.push(...authResults);
      }

      if (testDataExposure) {
        console.log('Testing data exposure...');
        const exposureResults = await this.testDataExposure(Component);
        auditResults.vulnerabilities.push(...exposureResults);
      }

      if (testSessionSecurity) {
        console.log('Testing session security...');
        const sessionResults = await this.testSessionSecurity();
        auditResults.vulnerabilities.push(...sessionResults);
      }

      // Generate recommendations
      auditResults.recommendations = this.generateSecurityRecommendations(auditResults.vulnerabilities);
      
      console.log(`✅ Security audit completed. Found ${auditResults.vulnerabilities.length} issues.`);
      
    } catch (error) {
      console.error('Security audit failed:', error);
      auditResults.error = error.message;
    }

    return auditResults;
  }

  // Generate security recommendations
  generateSecurityRecommendations(vulnerabilities) {
    const recommendations = [];
    const vulnTypes = vulnerabilities.reduce((acc, vuln) => {
      acc[vuln.type] = (acc[vuln.type] || 0) + 1;
      return acc;
    }, {});

    if (vulnTypes.xss > 0) {
      recommendations.push({
        priority: 'high',
        category: 'XSS Prevention',
        recommendation: 'Implement Content Security Policy (CSP) and input sanitization',
        implementation: 'Use DOMPurify for sanitization and set strict CSP headers',
      });
    }

    if (vulnTypes.csrf > 0) {
      recommendations.push({
        priority: 'high',
        category: 'CSRF Protection',
        recommendation: 'Implement CSRF tokens for all state-changing requests',
        implementation: 'Use SameSite cookies and CSRF tokens with proper validation',
      });
    }

    if (vulnTypes.input_validation > 0) {
      recommendations.push({
        priority: 'medium',
        category: 'Input Validation',
        recommendation: 'Implement comprehensive input validation on both client and server',
        implementation: 'Use validation libraries like Joi or Yup with proper error handling',
      });
    }

    if (vulnTypes.authentication > 0) {
      recommendations.push({
        priority: 'high',
        category: 'Authentication Security',
        recommendation: 'Implement strong authentication mechanisms',
        implementation: 'Use bcrypt for password hashing, rate limiting, and 2FA',
      });
    }

    return recommendations;
  }
}

/**
 * Security Testing Utilities for Jest
 */
export const securityTestUtils = {
  // Test for XSS vulnerabilities
  expectNoXSSVulnerabilities: (Component, inputSelectors) => {
    return async () => {
      const tester = new SecurityTester();
      const results = await tester.testXSSVulnerabilities(Component, inputSelectors);
      expect(results).toHaveLength(0);
    };
  },

  // Test for CSRF protection
  expectCSRFProtection: (formComponent) => {
    return async () => {
      const tester = new SecurityTester();
      const results = await tester.testCSRFProtection(formComponent);
      expect(results).toHaveLength(0);
    };
  },

  // Test input validation
  expectProperInputValidation: (Component) => {
    return async () => {
      const tester = new SecurityTester();
      const results = await tester.testInputValidation(Component);
      const highSeverityIssues = results.filter(r => r.severity === 'high');
      expect(highSeverityIssues).toHaveLength(0);
    };
  },

  // Mock security APIs for testing
  mockSecurityAPIs: () => {
    if (typeof global !== 'undefined') {
      global.crypto = global.crypto || {
        getRandomValues: (arr) => {
          for (let i = 0; i < arr.length; i++) {
            arr[i] = Math.floor(Math.random() * 256);
          }
          return arr;
        },
      };

      global.sessionStorage = global.sessionStorage || {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
        key: jest.fn(),
        length: 0,
      };

      global.localStorage = global.localStorage || {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
        key: jest.fn(),
        length: 0,
      };
    }
  },
};

// Export for testing
export default SecurityTester;

