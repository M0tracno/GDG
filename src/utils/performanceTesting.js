import { render, screen, waitFor, act } from '@testing-library/react';
import { performance } from 'perf_hooks';

import { constructor } from '@mui/material';
// filepath: c:\Users\AYUSHMAN NANDA\OneDrive\Desktop\GDC\src\utils\performanceTesting.js
// Performance testing utilities for AdminDashboard enhancements

/**
 * Performance Testing Utilities
 * Comprehensive performance testing and monitoring for React components
 */
export class PerformanceTester {
  constructor() {
    this.metrics = {
      renderTimes: [],
      memoryUsage: [],
      bundleSize: 0,
      componentMounts: 0,
      reRenders: 0,
      apiCallTimes: [],
      lazyLoadTimes: [],
    };
    this.observers = [];
    this.isMonitoring = false;
  }

  // Start performance monitoring
  startMonitoring() {
    this.isMonitoring = true;
    this.setupObservers();
    this.trackMemoryUsage();
    return this;
  }

  // Stop performance monitoring
  stopMonitoring() {
    this.isMonitoring = false;
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    return this.getReport();
  }

  // Setup performance observers
  setupObservers() {
    // Performance Observer for navigation and paint metrics
    if (typeof PerformanceObserver !== 'undefined') {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (entry.entryType === 'navigation') {
            this.metrics.navigationTiming = {
              domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
              loadComplete: entry.loadEventEnd - entry.loadEventStart,
              firstByte: entry.responseStart - entry.requestStart,
            };
          }
          
          if (entry.entryType === 'paint') {
            this.metrics.paintTiming = this.metrics.paintTiming || {};
            this.metrics.paintTiming[entry.name] = entry.startTime;
          }
        });
      });

      try {
        observer.observe({ entryTypes: ['navigation', 'paint', 'measure'] });
        this.observers.push(observer);
      } catch (e) {
        console.warn('Performance Observer not supported:', e);
      }
    }

    // Intersection Observer for lazy loading metrics
    if (typeof IntersectionObserver !== 'undefined') {
      const lazyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const loadStart = performance.now();
            this.metrics.lazyLoadTimes.push({
              element: entry.target.tagName,
              timestamp: loadStart,
            });
          }
        });
      });
      this.observers.push(lazyObserver);
    }
  }

  // Track memory usage
  trackMemoryUsage() {
    if (typeof performance !== 'undefined' && performance.memory) {
      const measureMemory = () => {
        if (!this.isMonitoring) return;
        
        this.metrics.memoryUsage.push({
          timestamp: Date.now(),
          used: performance.memory.usedJSHeapSize,
          total: performance.memory.totalJSHeapSize,
          limit: performance.memory.jsHeapSizeLimit,
        });

        setTimeout(measureMemory, 1000); // Measure every second
      };
      measureMemory();
    }
  }

  // Measure component render time
  async measureRenderTime(Component, props = {}) {
    const startTime = performance.now();
    
    await act(async () => {
      render(Component, props);
    });
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    this.metrics.renderTimes.push({
      component: Component.name || 'Anonymous',
      time: renderTime,
      timestamp: Date.now(),
    });
    
    return renderTime;
  }

  // Measure API call performance
  async measureApiCall(apiFunction, ...args) {
    const startTime = performance.now();
    
    try {
      const result = await apiFunction(...args);
      const endTime = performance.now();
      const callTime = endTime - startTime;
      
      this.metrics.apiCallTimes.push({
        function: apiFunction.name,
        time: callTime,
        success: true,
        timestamp: Date.now(),
      });
      
      return { result, time: callTime };
    } catch (error) {
      const endTime = performance.now();
      const callTime = endTime - startTime;
      
      this.metrics.apiCallTimes.push({
        function: apiFunction.name,
        time: callTime,
        success: false,
        error: error.message,
        timestamp: Date.now(),
      });
      
      throw error;
    }
  }

  // Measure bundle size (client-side estimation)
  estimateBundleSize() {
    if (typeof navigator !== 'undefined' && navigator.connection) {
      const connection = navigator.connection;
      this.metrics.networkInfo = {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
      };
    }

    // Estimate bundle size from script tags
    const scripts = document.querySelectorAll('script[src]');
    let estimatedSize = 0;
    
    scripts.forEach(script => {
      // This is an estimation - actual implementation would need build tools
      estimatedSize += script.src.length * 100; // Rough estimation
    });
    
    this.metrics.bundleSize = estimatedSize;
    return estimatedSize;
  }

  // Test responsive performance
  async testResponsivePerformance(Component, breakpoints = [320, 768, 1024, 1920]) {
    const responsiveMetrics = {};
    
    for (const width of breakpoints) {
      // Simulate viewport resize
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: width,
      });
      
      window.dispatchEvent(new Event('resize'));
      
      // Measure render time at this breakpoint
      const renderTime = await this.measureRenderTime(Component);
      responsiveMetrics[`${width}px`] = renderTime;
      
      // Wait a bit for any resize handlers
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    this.metrics.responsivePerformance = responsiveMetrics;
    return responsiveMetrics;
  }

  // Get performance report
  getReport() {
    const avgRenderTime = this.metrics.renderTimes.length > 0 
      ? this.metrics.renderTimes.reduce((sum, item) => sum + item.time, 0) / this.metrics.renderTimes.length
      : 0;

    const avgApiTime = this.metrics.apiCallTimes.length > 0
      ? this.metrics.apiCallTimes.reduce((sum, item) => sum + item.time, 0) / this.metrics.apiCallTimes.length
      : 0;

    const memoryTrend = this.metrics.memoryUsage.length > 1 
      ? this.metrics.memoryUsage[this.metrics.memoryUsage.length - 1].used - this.metrics.memoryUsage[0].used
      : 0;

    return {
      summary: {
        averageRenderTime: avgRenderTime,
        averageApiTime: avgApiTime,
        memoryTrend: memoryTrend,
        totalRenders: this.metrics.renderTimes.length,
        totalApiCalls: this.metrics.apiCallTimes.length,
      },
      detailed: this.metrics,
      recommendations: this.generateRecommendations(),
    };
  }

  // Generate performance recommendations
  generateRecommendations() {
    const recommendations = [];
    
    // Render time recommendations
    const avgRenderTime = this.metrics.renderTimes.length > 0 
      ? this.metrics.renderTimes.reduce((sum, item) => sum + item.time, 0) / this.metrics.renderTimes.length
      : 0;
    
    if (avgRenderTime > 16) { // 60 FPS threshold
      recommendations.push({
        type: 'render',
        severity: 'high',
        message: `Average render time (${avgRenderTime.toFixed(2)}ms) exceeds 16ms target for 60 FPS`,
        solution: 'Consider using React.memo, useMemo, or useCallback for optimization',
      });
    }

    // Memory recommendations
    if (this.metrics.memoryUsage.length > 0) {
      const latestMemory = this.metrics.memoryUsage[this.metrics.memoryUsage.length - 1];
      const memoryUsagePercent = (latestMemory.used / latestMemory.limit) * 100;
      
      if (memoryUsagePercent > 80) {
        recommendations.push({
          type: 'memory',
          severity: 'high',
          message: `Memory usage is ${memoryUsagePercent.toFixed(1)}% of available heap`,
          solution: 'Check for memory leaks, optimize component cleanup, consider lazy loading',
        });
      }
    }

    // API performance recommendations
    const slowApiCalls = this.metrics.apiCallTimes.filter(call => call.time > 1000);
    if (slowApiCalls.length > 0) {
      recommendations.push({
        type: 'api',
        severity: 'medium',
        message: `${slowApiCalls.length} API calls took longer than 1 second`,
        solution: 'Implement caching, request optimization, or loading states',
      });
    }

    return recommendations;
  }
}

/**
 * Performance Testing Hooks
 */
export const usePerformanceTesting = () => {
  const tester = new PerformanceTester();
  
  return {
    startTest: () => tester.startMonitoring(),
    stopTest: () => tester.stopMonitoring(),
    measureRender: (Component, props) => tester.measureRenderTime(Component, props),
    measureApi: (apiFunction, ...args) => tester.measureApiCall(apiFunction, ...args),
    testResponsive: (Component, breakpoints) => tester.testResponsivePerformance(Component, breakpoints),
  };
};

/**
 * Performance Test Utilities for Jest
 */
export const performanceTestUtils = {
  // Assert render time is within threshold
  expectRenderTimeBelow: (Component, threshold = 16, props = {}) => {
    return async () => {
      const tester = new PerformanceTester();
      const renderTime = await tester.measureRenderTime(Component, props);
      expect(renderTime).toBeLessThan(threshold);
    };
  },

  // Assert no memory leaks
  expectNoMemoryLeaks: (Component, iterations = 10) => {
    return async () => {
      const tester = new PerformanceTester();
      tester.startMonitoring();
      
      const initialMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
      
      // Render and unmount component multiple times
      for (let i = 0; i < iterations; i++) {
        const { unmount } = render(Component);
        unmount();
      }
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const finalMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Allow for small increase but flag significant leaks
      expect(memoryIncrease).toBeLessThan(1024 * 1024); // 1MB threshold
      
      tester.stopMonitoring();
    };
  },

  // Mock performance APIs for testing
  mockPerformanceAPIs: () => {
    if (typeof global !== 'undefined') {
      global.performance = global.performance || {
        now: () => Date.now(),
        memory: {
          usedJSHeapSize: 1024 * 1024,
          totalJSHeapSize: 2 * 1024 * 1024,
          jsHeapSizeLimit: 4 * 1024 * 1024,
        },
      };

      global.PerformanceObserver = global.PerformanceObserver || class {
        constructor(callback) {
          this.callback = callback;
        }
        observe() {}
        disconnect() {}
      };

      global.IntersectionObserver = global.IntersectionObserver || class {
        constructor(callback) {
          this.callback = callback;
        }
        observe() {}
        unobserve() {}
        disconnect() {}
      };
    }
  },
};

// Export for testing
export default PerformanceTester;

