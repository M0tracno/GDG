// filepath: c:\Users\AYUSHMAN NANDA\OneDrive\Desktop\GDC\scripts\performanceAnalysis.js
// Performance analysis script for the educational management system
const fs = require('fs');
const path = require('path');

/**
 * Comprehensive Performance Analysis
 * Analyzes bundle size, loading performance, and optimization opportunities
 */
class PerformanceAnalyzer {
  constructor() {
    this.results = {
      bundleAnalysis: null,
      performanceMetrics: null,
      recommendations: [],
      timestamp: new Date().toISOString(),
    };
  }

  async runAnalysis() {
    console.log('🚀 Starting comprehensive performance analysis...\n');
    
    try {
      await this.analyzeBundleSize();
      await this.analyzePerformanceMetrics();
      await this.generateRecommendations();
      await this.generateReport();
      
      console.log('✅ Performance analysis completed successfully!');
      return this.results;
    } catch (error) {
      console.error('❌ Performance analysis failed:', error.message);
      throw error;
    }
  }

  async analyzeBundleSize() {
    console.log('📦 Analyzing bundle size...');
    
    const buildDir = path.join(process.cwd(), 'build');
    const staticDir = path.join(buildDir, 'static');
    
    if (!fs.existsSync(buildDir)) {
      console.log('⚠️  No build directory found. Run "npm run build" first.');
      return;
    }

    const bundleAnalysis = {
      totalSize: 0,
      jsFiles: [],
      cssFiles: [],
      assets: [],
      gzipEstimate: 0,
    };

    // Analyze JavaScript files
    const jsDir = path.join(staticDir, 'js');
    if (fs.existsSync(jsDir)) {
      const jsFiles = fs.readdirSync(jsDir).filter(file => file.endsWith('.js'));
      
      for (const file of jsFiles) {
        const filePath = path.join(jsDir, file);
        const stats = fs.statSync(filePath);
        const fileInfo = {
          name: file,
          size: stats.size,
          sizeFormatted: this.formatBytes(stats.size),
          type: this.getFileType(file),
        };
        
        bundleAnalysis.jsFiles.push(fileInfo);
        bundleAnalysis.totalSize += stats.size;
      }
    }

    // Analyze CSS files
    const cssDir = path.join(staticDir, 'css');
    if (fs.existsSync(cssDir)) {
      const cssFiles = fs.readdirSync(cssDir).filter(file => file.endsWith('.css'));
      
      for (const file of cssFiles) {
        const filePath = path.join(cssDir, file);
        const stats = fs.statSync(filePath);
        const fileInfo = {
          name: file,
          size: stats.size,
          sizeFormatted: this.formatBytes(stats.size),
        };
        
        bundleAnalysis.cssFiles.push(fileInfo);
        bundleAnalysis.totalSize += stats.size;
      }
    }

    // Analyze other assets
    const mediaDir = path.join(staticDir, 'media');
    if (fs.existsSync(mediaDir)) {
      const mediaFiles = fs.readdirSync(mediaDir);
      
      for (const file of mediaFiles) {
        const filePath = path.join(mediaDir, file);
        const stats = fs.statSync(filePath);
        const fileInfo = {
          name: file,
          size: stats.size,
          sizeFormatted: this.formatBytes(stats.size),
          type: path.extname(file).slice(1),
        };
        
        bundleAnalysis.assets.push(fileInfo);
        bundleAnalysis.totalSize += stats.size;
      }
    }

    // Estimate gzip compression
    bundleAnalysis.gzipEstimate = Math.floor(bundleAnalysis.totalSize * 0.3); // ~70% compression

    // Sort files by size
    bundleAnalysis.jsFiles.sort((a, b) => b.size - a.size);
    bundleAnalysis.cssFiles.sort((a, b) => b.size - a.size);
    bundleAnalysis.assets.sort((a, b) => b.size - a.size);

    this.results.bundleAnalysis = bundleAnalysis;
    
    console.log(`   Total bundle size: ${this.formatBytes(bundleAnalysis.totalSize)}`);
    console.log(`   Estimated gzipped: ${this.formatBytes(bundleAnalysis.gzipEstimate)}`);
    console.log(`   JavaScript files: ${bundleAnalysis.jsFiles.length}`);
    console.log(`   CSS files: ${bundleAnalysis.cssFiles.length}`);
    console.log(`   Asset files: ${bundleAnalysis.assets.length}\n`);
  }

  getFileType(filename) {
    if (filename.includes('main')) return 'main';
    if (filename.includes('vendor') || filename.includes('node_modules')) return 'vendor';
    if (filename.includes('chunk')) return 'chunk';
    if (filename.includes('runtime')) return 'runtime';
    return 'unknown';
  }

  async analyzePerformanceMetrics() {
    console.log('⚡ Analyzing performance metrics...');
    
    // Read test results if available
    const testResultsPath = path.join(process.cwd(), 'test-results', 'performance-metrics.json');
    let performanceMetrics = null;
    
    if (fs.existsSync(testResultsPath)) {
      try {
        const data = fs.readFileSync(testResultsPath, 'utf8');
        performanceMetrics = JSON.parse(data);
        console.log('   Found test performance metrics');
      } catch (error) {
        console.log('   Could not read test performance metrics');
      }
    }

    // Analyze current performance based on bundle analysis
    const analysis = {
      loadTimeEstimate: this.estimateLoadTime(),
      renderTimeEstimate: this.estimateRenderTime(),
      memoryUsageEstimate: this.estimateMemoryUsage(),
      networkRequests: this.estimateNetworkRequests(),
      cacheEfficiency: this.estimateCacheEfficiency(),
      testMetrics: performanceMetrics,
    };

    this.results.performanceMetrics = analysis;
    
    console.log(`   Estimated load time: ${analysis.loadTimeEstimate}ms`);
    console.log(`   Estimated render time: ${analysis.renderTimeEstimate}ms`);
    console.log(`   Estimated memory usage: ${this.formatBytes(analysis.memoryUsageEstimate)}`);
    console.log(`   Estimated network requests: ${analysis.networkRequests}\n`);
  }

  estimateLoadTime() {
    if (!this.results.bundleAnalysis) return 0;
    
    const { totalSize } = this.results.bundleAnalysis;
    // Estimate based on average connection speed (5 Mbps)
    const averageSpeed = 5 * 1024 * 1024 / 8; // 5 Mbps in bytes per second
    return Math.floor((totalSize / averageSpeed) * 1000); // Convert to milliseconds
  }

  estimateRenderTime() {
    if (!this.results.bundleAnalysis) return 0;
    
    const jsSize = this.results.bundleAnalysis.jsFiles.reduce((sum, file) => sum + file.size, 0);
    // Estimate 1ms per 10KB of JavaScript
    return Math.floor(jsSize / 10240);
  }

  estimateMemoryUsage() {
    if (!this.results.bundleAnalysis) return 0;
    
    const jsSize = this.results.bundleAnalysis.jsFiles.reduce((sum, file) => sum + file.size, 0);
    // Estimate memory usage as 3x the JavaScript bundle size
    return jsSize * 3;
  }

  estimateNetworkRequests() {
    if (!this.results.bundleAnalysis) return 0;
    
    return this.results.bundleAnalysis.jsFiles.length + 
           this.results.bundleAnalysis.cssFiles.length + 
           Math.min(this.results.bundleAnalysis.assets.length, 10); // Limit asset count
  }

  estimateCacheEfficiency() {
    if (!this.results.bundleAnalysis) return 0;
    
    const hasContentHashing = this.results.bundleAnalysis.jsFiles.some(file => 
      file.name.match(/\.[a-f0-9]{8,}\./));
    
    return hasContentHashing ? 85 : 50; // Higher efficiency with content hashing
  }

  async generateRecommendations() {
    console.log('💡 Generating optimization recommendations...');
    
    const recommendations = [];
    const { bundleAnalysis, performanceMetrics } = this.results;

    // Bundle size recommendations
    if (bundleAnalysis && bundleAnalysis.totalSize > 1024 * 1024) { // > 1MB
      recommendations.push({
        type: 'bundle_size',
        priority: 'high',
        title: 'Large bundle size',
        description: `Total bundle size (${this.formatBytes(bundleAnalysis.totalSize)}) exceeds 1MB`,
        impact: 'Slower initial page load, especially on slower connections',
        solutions: [
          'Implement code splitting for route-based chunks',
          'Use dynamic imports for large components',
          'Remove unused dependencies with tree shaking',
          'Consider lazy loading non-critical features',
        ],
        estimatedSavings: '20-40% reduction in bundle size',
      });
    }

    // JavaScript file analysis
    if (bundleAnalysis && bundleAnalysis.jsFiles.length > 0) {
      const largestJs = bundleAnalysis.jsFiles[0];
      if (largestJs.size > 500 * 1024) { // > 500KB
        recommendations.push({
          type: 'large_js_files',
          priority: 'medium',
          title: 'Large JavaScript files',
          description: `Largest JS file (${largestJs.name}) is ${largestJs.sizeFormatted}`,
          impact: 'Increased parse time and memory usage',
          solutions: [
            'Split large files into smaller chunks',
            'Move vendor dependencies to separate bundle',
            'Use dynamic imports for optional features',
            'Implement progressive loading',
          ],
          estimatedSavings: '15-30% faster JavaScript execution',
        });
      }

      // Check for missing vendor bundle
      const hasVendorBundle = bundleAnalysis.jsFiles.some(file => file.type === 'vendor');
      if (!hasVendorBundle && bundleAnalysis.jsFiles.length > 1) {
        recommendations.push({
          type: 'vendor_bundling',
          priority: 'medium',
          title: 'Missing vendor bundle separation',
          description: 'Vendor dependencies are not separated from application code',
          impact: 'Poor caching efficiency for dependencies',
          solutions: [
            'Configure webpack to create separate vendor bundle',
            'Use splitChunks optimization for node_modules',
            'Implement long-term caching for vendor dependencies',
          ],
          estimatedSavings: '50% better cache efficiency for repeat visits',
        });
      }
    }

    // Performance metrics recommendations
    if (performanceMetrics) {
      if (performanceMetrics.loadTimeEstimate > 3000) {
        recommendations.push({
          type: 'load_time',
          priority: 'high',
          title: 'Slow estimated load time',
          description: `Estimated load time (${performanceMetrics.loadTimeEstimate}ms) exceeds 3 seconds`,
          impact: 'Poor user experience, higher bounce rate',
          solutions: [
            'Implement critical resource preloading',
            'Use service workers for caching',
            'Optimize images and compress assets',
            'Consider using a CDN',
          ],
          estimatedSavings: '40-60% faster load times',
        });
      }

      if (performanceMetrics.networkRequests > 15) {
        recommendations.push({
          type: 'network_requests',
          priority: 'medium',
          title: 'Too many network requests',
          description: `Estimated ${performanceMetrics.networkRequests} network requests`,
          impact: 'Increased latency, especially on slower connections',
          solutions: [
            'Bundle smaller files together',
            'Use HTTP/2 multiplexing',
            'Implement resource inlining for critical assets',
            'Use icon fonts or SVG sprites',
          ],
          estimatedSavings: '20-30% faster resource loading',
        });
      }

      if (performanceMetrics.cacheEfficiency < 70) {
        recommendations.push({
          type: 'caching',
          priority: 'medium',
          title: 'Poor cache efficiency',
          description: `Cache efficiency estimated at ${performanceMetrics.cacheEfficiency}%`,
          impact: 'Slower repeat visits, increased bandwidth usage',
          solutions: [
            'Implement content-based hashing for static assets',
            'Configure proper cache headers',
            'Use service workers for application caching',
            'Separate frequently changing code from stable dependencies',
          ],
          estimatedSavings: 'Up to 80% faster repeat page loads',
        });
      }
    }

    // Test-based recommendations
    if (performanceMetrics && performanceMetrics.testMetrics) {
      const { testMetrics } = performanceMetrics;
      
      if (testMetrics.averageRenderTime > 50) {
        recommendations.push({
          type: 'render_performance',
          priority: 'high',
          title: 'Slow component rendering',
          description: `Average component render time (${testMetrics.averageRenderTime.toFixed(2)}ms) is high`,
          impact: 'Poor interactive experience, janky animations',
          solutions: [
            'Use React.memo for expensive components',
            'Implement useCallback and useMemo optimizations',
            'Reduce component re-renders',
            'Use virtual scrolling for large lists',
          ],
          estimatedSavings: '60-80% faster component updates',
        });
      }

      if (testMetrics.performanceIssues && testMetrics.performanceIssues.length > 0) {
        recommendations.push({
          type: 'test_failures',
          priority: 'high',
          title: 'Performance test failures',
          description: `${testMetrics.performanceIssues.length} performance tests are failing`,
          impact: 'Regression in application performance',
          solutions: [
            'Review and fix failing performance tests',
            'Update performance thresholds if necessary',
            'Implement performance monitoring in CI/CD',
          ],
          estimatedSavings: 'Prevent performance regressions',
        });
      }
    }

    this.results.recommendations = recommendations;
    console.log(`   Generated ${recommendations.length} recommendations\n`);
  }

  async generateReport() {
    console.log('📋 Generating performance report...');
    
    const reportDir = path.join(process.cwd(), 'performance-reports');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    // Generate JSON report
    const jsonReport = {
      ...this.results,
      summary: this.generateSummary(),
    };

    fs.writeFileSync(
      path.join(reportDir, 'performance-analysis.json'),
      JSON.stringify(jsonReport, null, 2)
    );

    // Generate Markdown report
    const markdownReport = this.generateMarkdownReport(jsonReport);
    fs.writeFileSync(
      path.join(reportDir, 'performance-report.md'),
      markdownReport
    );

    // Generate HTML report
    const htmlReport = this.generateHtmlReport(jsonReport);
    fs.writeFileSync(
      path.join(reportDir, 'performance-report.html'),
      htmlReport
    );

    console.log('   Reports saved to performance-reports/ directory');
  }

  generateSummary() {
    const { bundleAnalysis, performanceMetrics, recommendations } = this.results;
    
    return {
      bundleSize: bundleAnalysis ? this.formatBytes(bundleAnalysis.totalSize) : 'N/A',
      estimatedLoadTime: performanceMetrics ? `${performanceMetrics.loadTimeEstimate}ms` : 'N/A',
      criticalIssues: recommendations.filter(r => r.priority === 'high').length,
      totalRecommendations: recommendations.length,
      overallScore: this.calculateOverallScore(),
    };
  }

  calculateOverallScore() {
    let score = 100;
    const { bundleAnalysis, performanceMetrics, recommendations } = this.results;

    // Deduct points for bundle size
    if (bundleAnalysis && bundleAnalysis.totalSize > 2 * 1024 * 1024) score -= 25;
    else if (bundleAnalysis && bundleAnalysis.totalSize > 1024 * 1024) score -= 15;

    // Deduct points for estimated load time
    if (performanceMetrics && performanceMetrics.loadTimeEstimate > 5000) score -= 25;
    else if (performanceMetrics && performanceMetrics.loadTimeEstimate > 3000) score -= 15;

    // Deduct points for high priority recommendations
    const criticalIssues = recommendations.filter(r => r.priority === 'high').length;
    score -= criticalIssues * 15;

    // Deduct points for medium priority recommendations
    const mediumIssues = recommendations.filter(r => r.priority === 'medium').length;
    score -= mediumIssues * 5;

    return Math.max(0, score);
  }

  generateMarkdownReport(report) {
    return `# Performance Analysis Report

**Generated:** ${report.timestamp}
**Overall Score:** ${report.summary.overallScore}/100

## Summary

| Metric | Value |
|--------|-------|
| Bundle Size | ${report.summary.bundleSize} |
| Estimated Load Time | ${report.summary.estimatedLoadTime} |
| Critical Issues | ${report.summary.criticalIssues} |
| Total Recommendations | ${report.summary.totalRecommendations} |

## Bundle Analysis

${report.bundleAnalysis ? `
### JavaScript Files
${report.bundleAnalysis.jsFiles.map(file => 
  `- **${file.name}** (${file.type}): ${file.sizeFormatted}`
).join('\n')}

### CSS Files
${report.bundleAnalysis.cssFiles.map(file => 
  `- **${file.name}**: ${file.sizeFormatted}`
).join('\n')}

### Total Size Breakdown
- **Total Bundle Size:** ${this.formatBytes(report.bundleAnalysis.totalSize)}
- **Estimated Gzipped:** ${this.formatBytes(report.bundleAnalysis.gzipEstimate)}
- **JavaScript:** ${this.formatBytes(report.bundleAnalysis.jsFiles.reduce((sum, f) => sum + f.size, 0))}
- **CSS:** ${this.formatBytes(report.bundleAnalysis.cssFiles.reduce((sum, f) => sum + f.size, 0))}
` : 'Bundle analysis not available'}

## Performance Metrics

${report.performanceMetrics ? `
| Metric | Value |
|--------|-------|
| Estimated Load Time | ${report.performanceMetrics.loadTimeEstimate}ms |
| Estimated Render Time | ${report.performanceMetrics.renderTimeEstimate}ms |
| Estimated Memory Usage | ${this.formatBytes(report.performanceMetrics.memoryUsageEstimate)} |
| Network Requests | ${report.performanceMetrics.networkRequests} |
| Cache Efficiency | ${report.performanceMetrics.cacheEfficiency}% |
` : 'Performance metrics not available'}

## Recommendations

${report.recommendations.map(rec => `
### ${rec.title} (${rec.priority.toUpperCase()})

**Description:** ${rec.description}

**Impact:** ${rec.impact}

**Solutions:**
${rec.solutions.map(solution => `- ${solution}`).join('\n')}

**Estimated Savings:** ${rec.estimatedSavings}
`).join('\n')}

## Next Steps

1. **High Priority Issues:** Address ${report.recommendations.filter(r => r.priority === 'high').length} critical performance issues first
2. **Bundle Optimization:** Implement code splitting and lazy loading
3. **Caching Strategy:** Improve cache efficiency for better repeat performance
4. **Monitoring:** Set up continuous performance monitoring
5. **Testing:** Add performance regression tests to CI/CD pipeline

---
*Report generated by Performance Analyzer v1.0*
`;
  }

  generateHtmlReport(report) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Performance Analysis Report</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .score { font-size: 2em; font-weight: bold; color: ${report.summary.overallScore >= 80 ? '#4caf50' : report.summary.overallScore >= 60 ? '#ff9800' : '#f44336'}; }
        .metric-card { background: white; border: 1px solid #ddd; border-radius: 8px; padding: 15px; margin: 10px 0; }
        .priority-high { border-left: 5px solid #f44336; }
        .priority-medium { border-left: 5px solid #ff9800; }
        .priority-low { border-left: 5px solid #4caf50; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f5f5f5; }
        .file-list { max-height: 300px; overflow-y: auto; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Performance Analysis Report</h1>
        <p><strong>Generated:</strong> ${report.timestamp}</p>
        <div class="score">Overall Score: ${report.summary.overallScore}/100</div>
    </div>

    <div class="metric-card">
        <h2>Summary</h2>
        <table>
            <tr><th>Metric</th><th>Value</th></tr>
            <tr><td>Bundle Size</td><td>${report.summary.bundleSize}</td></tr>
            <tr><td>Estimated Load Time</td><td>${report.summary.estimatedLoadTime}</td></tr>
            <tr><td>Critical Issues</td><td>${report.summary.criticalIssues}</td></tr>
            <tr><td>Total Recommendations</td><td>${report.summary.totalRecommendations}</td></tr>
        </table>
    </div>

    ${report.bundleAnalysis ? `
    <div class="metric-card">
        <h2>Bundle Analysis</h2>
        <h3>JavaScript Files</h3>
        <div class="file-list">
            ${report.bundleAnalysis.jsFiles.map(file => 
                `<div><strong>${file.name}</strong> (${file.type}): ${file.sizeFormatted}</div>`
            ).join('')}
        </div>
        <h3>CSS Files</h3>
        <div class="file-list">
            ${report.bundleAnalysis.cssFiles.map(file => 
                `<div><strong>${file.name}</strong>: ${file.sizeFormatted}</div>`
            ).join('')}
        </div>
    </div>
    ` : ''}

    <div class="metric-card">
        <h2>Recommendations</h2>
        ${report.recommendations.map(rec => `
            <div class="metric-card priority-${rec.priority}">
                <h3>${rec.title} <span style="color: ${rec.priority === 'high' ? '#f44336' : rec.priority === 'medium' ? '#ff9800' : '#4caf50'};">(${rec.priority.toUpperCase()})</span></h3>
                <p><strong>Description:</strong> ${rec.description}</p>
                <p><strong>Impact:</strong> ${rec.impact}</p>
                <p><strong>Solutions:</strong></p>
                <ul>${rec.solutions.map(solution => `<li>${solution}</li>`).join('')}</ul>
                <p><strong>Estimated Savings:</strong> ${rec.estimatedSavings}</p>
            </div>
        `).join('')}
    </div>

    <div class="metric-card">
        <h2>Next Steps</h2>
        <ol>
            <li><strong>High Priority Issues:</strong> Address ${report.recommendations.filter(r => r.priority === 'high').length} critical performance issues first</li>
            <li><strong>Bundle Optimization:</strong> Implement code splitting and lazy loading</li>
            <li><strong>Caching Strategy:</strong> Improve cache efficiency for better repeat performance</li>
            <li><strong>Monitoring:</strong> Set up continuous performance monitoring</li>
            <li><strong>Testing:</strong> Add performance regression tests to CI/CD pipeline</li>
        </ol>
    </div>
</body>
</html>`;
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Run analysis if called directly
if (require.main === module) {
  const analyzer = new PerformanceAnalyzer();
  analyzer.runAnalysis().catch(console.error);
}

module.exports = PerformanceAnalyzer;
