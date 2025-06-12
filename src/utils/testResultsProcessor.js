// filepath: c:\Users\AYUSHMAN NANDA\OneDrive\Desktop\GDC\src\utils\testResultsProcessor.js
// Custom test results processor for performance metrics
const fs = require('fs');
const path = require('path');

module.exports = (results) => {
  // Extract performance metrics from test results
  const performanceMetrics = {
    totalTests: results.numTotalTests,
    passedTests: results.numPassedTests,
    failedTests: results.numFailedTests,
    totalTime: results.testResults.reduce((sum, result) => sum + result.perfStats.runtime, 0),
    averageTime: 0,
    slowestTests: [],
    coverageMetrics: results.coverageMap ? extractCoverageMetrics(results.coverageMap) : null,
    securityIssues: [],
    performanceIssues: [],
  };

  // Calculate average test time
  if (results.numTotalTests > 0) {
    performanceMetrics.averageTime = performanceMetrics.totalTime / results.numTotalTests;
  }

  // Find slowest tests (top 10)
  const allTests = results.testResults.flatMap(result => 
    result.testResults.map(test => ({
      name: `${result.testFilePath}:${test.title}`,
      duration: test.duration || 0,
    }))
  );

  performanceMetrics.slowestTests = allTests
    .sort((a, b) => b.duration - a.duration)
    .slice(0, 10);

  // Extract security and performance issues from test names/results
  results.testResults.forEach(result => {
    result.testResults.forEach(test => {
      if (test.failureMessages && test.failureMessages.length > 0) {
        // Check for security-related failures
        const securityKeywords = ['security', 'xss', 'csrf', 'vulnerability', 'sanitize'];
        const performanceKeywords = ['performance', 'render time', 'memory', 'bundle'];
        
        const isSecurityIssue = securityKeywords.some(keyword => 
          test.title.toLowerCase().includes(keyword) ||
          test.failureMessages.some(msg => msg.toLowerCase().includes(keyword))
        );
        
        const isPerformanceIssue = performanceKeywords.some(keyword => 
          test.title.toLowerCase().includes(keyword) ||
          test.failureMessages.some(msg => msg.toLowerCase().includes(keyword))
        );

        if (isSecurityIssue) {
          performanceMetrics.securityIssues.push({
            test: test.title,
            file: result.testFilePath,
            messages: test.failureMessages,
          });
        }

        if (isPerformanceIssue) {
          performanceMetrics.performanceIssues.push({
            test: test.title,
            file: result.testFilePath,
            messages: test.failureMessages,
          });
        }
      }
    });
  });

  // Generate detailed report
  const report = generateDetailedReport(performanceMetrics, results);
  
  // Save reports
  saveReports(performanceMetrics, report);
  
  // Log summary to console
  logSummary(performanceMetrics);

  return results;
};

function extractCoverageMetrics(coverageMap) {
  const fileCoverage = coverageMap.files();
  const summary = coverageMap.getCoverageSummary();
  
  return {
    lines: {
      total: summary.lines.total,
      covered: summary.lines.covered,
      percentage: summary.lines.pct,
    },
    functions: {
      total: summary.functions.total,
      covered: summary.functions.covered,
      percentage: summary.functions.pct,
    },
    branches: {
      total: summary.branches.total,
      covered: summary.branches.covered,
      percentage: summary.branches.pct,
    },
    statements: {
      total: summary.statements.total,
      covered: summary.statements.covered,
      percentage: summary.statements.pct,
    },
    files: fileCoverage.length,
  };
}

function generateDetailedReport(metrics, results) {
  const timestamp = new Date().toISOString();
  
  return {
    timestamp,
    summary: {
      totalTests: metrics.totalTests,
      passedTests: metrics.passedTests,
      failedTests: metrics.failedTests,
      successRate: metrics.totalTests > 0 ? (metrics.passedTests / metrics.totalTests * 100).toFixed(2) : 0,
      totalTime: `${metrics.totalTime.toFixed(2)}ms`,
      averageTime: `${metrics.averageTime.toFixed(2)}ms`,
    },
    performance: {
      slowestTests: metrics.slowestTests,
      performanceIssues: metrics.performanceIssues,
      recommendations: generatePerformanceRecommendations(metrics),
    },
    security: {
      securityIssues: metrics.securityIssues,
      recommendations: generateSecurityRecommendations(metrics),
    },
    coverage: metrics.coverageMetrics,
    suites: results.testResults.map(result => ({
      file: result.testFilePath,
      numTests: result.numPassingTests + result.numFailingTests,
      passed: result.numPassingTests,
      failed: result.numFailingTests,
      runtime: `${result.perfStats.runtime}ms`,
    })),
  };
}

function generatePerformanceRecommendations(metrics) {
  const recommendations = [];
  
  // Check for slow tests
  if (metrics.slowestTests.length > 0 && metrics.slowestTests[0].duration > 5000) {
    recommendations.push({
      type: 'slow_tests',
      priority: 'medium',
      message: `Found ${metrics.slowestTests.filter(t => t.duration > 5000).length} tests taking longer than 5 seconds`,
      suggestion: 'Consider optimizing slow tests or splitting them into smaller units',
    });
  }

  // Check average test time
  if (metrics.averageTime > 1000) {
    recommendations.push({
      type: 'average_time',
      priority: 'medium',
      message: `Average test time (${metrics.averageTime.toFixed(2)}ms) is high`,
      suggestion: 'Review test setup and teardown processes, consider using test doubles',
    });
  }

  // Check for performance test failures
  if (metrics.performanceIssues.length > 0) {
    recommendations.push({
      type: 'performance_failures',
      priority: 'high',
      message: `${metrics.performanceIssues.length} performance-related test failures`,
      suggestion: 'Address performance issues before deploying to production',
    });
  }

  return recommendations;
}

function generateSecurityRecommendations(metrics) {
  const recommendations = [];
  
  if (metrics.securityIssues.length > 0) {
    recommendations.push({
      type: 'security_failures',
      priority: 'high',
      message: `${metrics.securityIssues.length} security-related test failures`,
      suggestion: 'Fix security vulnerabilities immediately before deployment',
    });
  }

  return recommendations;
}

function saveReports(metrics, report) {
  const resultsDir = path.join(process.cwd(), 'test-results');
  
  // Ensure results directory exists
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }

  // Save performance metrics as JSON
  fs.writeFileSync(
    path.join(resultsDir, 'performance-metrics.json'),
    JSON.stringify(metrics, null, 2)
  );

  // Save detailed report as JSON
  fs.writeFileSync(
    path.join(resultsDir, 'detailed-report.json'),
    JSON.stringify(report, null, 2)
  );

  // Generate markdown report
  const markdownReport = generateMarkdownReport(report);
  fs.writeFileSync(
    path.join(resultsDir, 'test-report.md'),
    markdownReport
  );
}

function generateMarkdownReport(report) {
  return `# Test Results Report

**Generated:** ${report.timestamp}

## Summary

| Metric | Value |
|--------|--------|
| Total Tests | ${report.summary.totalTests} |
| Passed Tests | ${report.summary.passedTests} |
| Failed Tests | ${report.summary.failedTests} |
| Success Rate | ${report.summary.successRate}% |
| Total Time | ${report.summary.totalTime} |
| Average Time | ${report.summary.averageTime} |

## Performance Analysis

### Slowest Tests
${report.performance.slowestTests.map(test => 
  `- **${test.name}**: ${test.duration}ms`
).join('\n')}

### Performance Recommendations
${report.performance.recommendations.map(rec => 
  `- **${rec.type}** (${rec.priority}): ${rec.message}\n  *Suggestion: ${rec.suggestion}*`
).join('\n\n')}

## Security Analysis

### Security Issues
${report.security.securityIssues.length > 0 
  ? report.security.securityIssues.map(issue => 
      `- **${issue.test}** in ${issue.file}`
    ).join('\n')
  : '✅ No security issues found'
}

### Security Recommendations
${report.security.recommendations.map(rec => 
  `- **${rec.type}** (${rec.priority}): ${rec.message}\n  *Suggestion: ${rec.suggestion}*`
).join('\n\n')}

## Coverage Report

${report.coverage ? `
| Type | Total | Covered | Percentage |
|------|-------|---------|------------|
| Lines | ${report.coverage.lines.total} | ${report.coverage.lines.covered} | ${report.coverage.lines.percentage}% |
| Functions | ${report.coverage.functions.total} | ${report.coverage.functions.covered} | ${report.coverage.functions.percentage}% |
| Branches | ${report.coverage.branches.total} | ${report.coverage.branches.covered} | ${report.coverage.branches.percentage}% |
| Statements | ${report.coverage.statements.total} | ${report.coverage.statements.covered} | ${report.coverage.statements.percentage}% |
` : 'Coverage data not available'}

## Test Suites

${report.suites.map(suite => 
  `### ${path.basename(suite.file)}
- Tests: ${suite.numTests}
- Passed: ${suite.passed}
- Failed: ${suite.failed}
- Runtime: ${suite.runtime}`
).join('\n\n')}
`;
}

function logSummary(metrics) {
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST PERFORMANCE SUMMARY');
  console.log('='.repeat(60));
  console.log(`📈 Total Tests: ${metrics.totalTests}`);
  console.log(`✅ Passed: ${metrics.passedTests}`);
  console.log(`❌ Failed: ${metrics.failedTests}`);
  console.log(`⏱️  Total Time: ${metrics.totalTime.toFixed(2)}ms`);
  console.log(`⏱️  Average Time: ${metrics.averageTime.toFixed(2)}ms`);
  
  if (metrics.slowestTests.length > 0) {
    console.log(`🐌 Slowest Test: ${metrics.slowestTests[0].name} (${metrics.slowestTests[0].duration}ms)`);
  }
  
  if (metrics.securityIssues.length > 0) {
    console.log(`🔒 Security Issues: ${metrics.securityIssues.length}`);
  }
  
  if (metrics.performanceIssues.length > 0) {
    console.log(`⚡ Performance Issues: ${metrics.performanceIssues.length}`);
  }
  
  console.log('='.repeat(60));
  console.log('📋 Detailed reports saved to test-results/ directory');
  console.log('='.repeat(60) + '\n');
}

