/**
 * Security Audit Script
 * Automated security scanning and vulnerability assessment
 * Part of the Educational Management System - AdminDashboard Enhancement Project
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class SecurityAuditor {
  constructor(options = {}) {
    this.options = {
      outputDir: options.outputDir || './security-reports',
      scanDepth: options.scanDepth || 'comprehensive',
      severity: options.severity || 'all',
      includeRecommendations: options.includeRecommendations !== false,
      ...options
    };

    this.vulnerabilities = [];
    this.securityMetrics = {
      criticalIssues: 0,
      highIssues: 0,
      mediumIssues: 0,
      lowIssues: 0,
      infoIssues: 0,
      totalScanned: 0,
      securityScore: 0
    };

    this.securityPatterns = this.initializeSecurityPatterns();
  }

  initializeSecurityPatterns() {
    return {
      // XSS Vulnerabilities
      xss: [
        {
          pattern: /innerHTML\s*=\s*[^;]+/g,
          severity: 'high',
          type: 'XSS',
          description: 'Direct innerHTML assignment without sanitization'
        },
        {
          pattern: /dangerouslySetInnerHTML/g,
          severity: 'high',
          type: 'XSS',
          description: 'Use of dangerouslySetInnerHTML without proper sanitization'
        },
        {
          pattern: /document\.write\(/g,
          severity: 'high',
          type: 'XSS',
          description: 'Use of document.write() which can lead to XSS'
        }
      ],

      // SQL Injection
      sqlInjection: [
        {
          pattern: /query\s*\+\s*.*\+/g,
          severity: 'critical',
          type: 'SQL_INJECTION',
          description: 'String concatenation in SQL queries'
        },
        {
          pattern: /\$\{.*\}.*SELECT|INSERT|UPDATE|DELETE/g,
          severity: 'critical',
          type: 'SQL_INJECTION',
          description: 'Template literals in SQL queries without parameterization'
        }
      ],

      // Authentication Issues
      authentication: [
        {
          pattern: /password.*=.*['"].*['"];/g,
          severity: 'critical',
          type: 'AUTH',
          description: 'Hardcoded password detected'
        },
        {
          pattern: /token.*=.*['"].*['"];/g,
          severity: 'high',
          type: 'AUTH',
          description: 'Hardcoded token detected'
        },
        {
          pattern: /localStorage\.setItem\(['"]token/g,
          severity: 'medium',
          type: 'AUTH',
          description: 'Token stored in localStorage without encryption'
        }
      ],

      // Sensitive Data Exposure
      dataExposure: [
        {
          pattern: /console\.log\(.*password/gi,
          severity: 'high',
          type: 'DATA_EXPOSURE',
          description: 'Password logged to console'
        },
        {
          pattern: /console\.log\(.*token/gi,
          severity: 'high',
          type: 'DATA_EXPOSURE',
          description: 'Token logged to console'
        },
        {
          pattern: /JSON\.stringify\(.*password/gi,
          severity: 'medium',
          type: 'DATA_EXPOSURE',
          description: 'Password serialized in JSON'
        }
      ],

      // CSRF Vulnerabilities
      csrf: [
        {
          pattern: /fetch\(.*POST.*\)/g,
          severity: 'medium',
          type: 'CSRF',
          description: 'POST request without CSRF protection verification'
        },
        {
          pattern: /axios\.post\(/g,
          severity: 'medium',
          type: 'CSRF',
          description: 'POST request - verify CSRF protection'
        }
      ],

      // Insecure Dependencies
      dependencies: [
        {
          pattern: /require\(['"].*['"].*[<>=]/g,
          severity: 'low',
          type: 'DEPENDENCY',
          description: 'Version-specific dependency - check for vulnerabilities'
        }
      ],

      // Input Validation
      inputValidation: [
        {
          pattern: /eval\(/g,
          severity: 'critical',
          type: 'INPUT_VALIDATION',
          description: 'Use of eval() function - potential code injection'
        },
        {
          pattern: /Function\(/g,
          severity: 'high',
          type: 'INPUT_VALIDATION',
          description: 'Dynamic function creation - potential code injection'
        }
      ],

      // File Access
      fileAccess: [
        {
          pattern: /\.\.\/|\.\.\\\/g,
          severity: 'high',
          type: 'FILE_ACCESS',
          description: 'Path traversal pattern detected'
        },
        {
          pattern: /fs\.readFile\(.*\+/g,
          severity: 'medium',
          type: 'FILE_ACCESS',
          description: 'Dynamic file path construction'
        }
      ]
    };
  }

  async runSecurityAudit(projectPath = '.') {
    console.log('🔒 Starting Security Audit...');
    
    try {
      await this.ensureOutputDirectory();
      
      const startTime = Date.now();
      const files = await this.scanProjectFiles(projectPath);
      
      // Scan each file for vulnerabilities
      for (const file of files) {
        await this.scanFile(file);
      }

      // Analyze dependencies
      await this.analyzeDependencies(projectPath);

      // Calculate security score
      this.calculateSecurityScore();

      const auditTime = Date.now() - startTime;
      
      // Generate reports
      await this.generateReports(auditTime);
      
      console.log(`✅ Security audit completed in ${auditTime}ms`);
      console.log(`📊 Security Score: ${this.securityMetrics.securityScore}/100`);
      
      return {
        vulnerabilities: this.vulnerabilities,
        metrics: this.securityMetrics,
        auditTime
      };

    } catch (error) {
      console.error('❌ Security audit failed:', error.message);
      throw error;
    }
  }

  async scanProjectFiles(projectPath) {
    const files = [];
    
    async function scan(dir) {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          // Skip node_modules and other irrelevant directories
          if (!['node_modules', '.git', 'dist', 'build', '.next'].includes(entry.name)) {
            await scan(fullPath);
          }
        } else if (entry.isFile()) {
          // Include relevant file types
          const ext = path.extname(entry.name).toLowerCase();
          if (['.js', '.jsx', '.ts', '.tsx', '.json', '.html', '.css'].includes(ext)) {
            files.push(fullPath);
          }
        }
      }
    }
    
    await scan(projectPath);
    this.securityMetrics.totalScanned = files.length;
    return files;
  }

  async scanFile(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const relativePath = path.relative(process.cwd(), filePath);
      
      // Scan for each pattern category
      for (const [category, patterns] of Object.entries(this.securityPatterns)) {
        for (const pattern of patterns) {
          const matches = content.match(pattern.pattern);
          
          if (matches) {
            for (const match of matches) {
              const lineNumber = this.getLineNumber(content, match);
              
              this.vulnerabilities.push({
                file: relativePath,
                line: lineNumber,
                category,
                type: pattern.type,
                severity: pattern.severity,
                description: pattern.description,
                code: match.trim(),
                recommendation: this.getRecommendation(pattern.type, match)
              });
              
              this.updateMetrics(pattern.severity);
            }
          }
        }
      }
      
    } catch (error) {
      console.warn(`⚠️ Could not scan file ${filePath}:`, error.message);
    }
  }

  getLineNumber(content, match) {
    const index = content.indexOf(match);
    const beforeMatch = content.substring(0, index);
    return beforeMatch.split('\n').length;
  }

  getRecommendation(type, code) {
    const recommendations = {
      'XSS': 'Use proper input sanitization and avoid direct DOM manipulation. Consider using libraries like DOMPurify.',
      'SQL_INJECTION': 'Use parameterized queries or prepared statements. Never concatenate user input directly into SQL.',
      'AUTH': 'Remove hardcoded credentials. Use environment variables or secure configuration management.',
      'DATA_EXPOSURE': 'Remove sensitive data from logs. Use proper logging levels and sanitize output.',
      'CSRF': 'Implement CSRF tokens for state-changing operations. Use SameSite cookies and verify referrer headers.',
      'DEPENDENCY': 'Update dependencies to latest secure versions. Use tools like npm audit to check for vulnerabilities.',
      'INPUT_VALIDATION': 'Avoid dynamic code execution. Implement proper input validation and sanitization.',
      'FILE_ACCESS': 'Validate and sanitize file paths. Use path.resolve() and check against allowed directories.'
    };
    
    return recommendations[type] || 'Review this code for potential security implications.';
  }

  updateMetrics(severity) {
    switch (severity) {
      case 'critical':
        this.securityMetrics.criticalIssues++;
        break;
      case 'high':
        this.securityMetrics.highIssues++;
        break;
      case 'medium':
        this.securityMetrics.mediumIssues++;
        break;
      case 'low':
        this.securityMetrics.lowIssues++;
        break;
      default:
        this.securityMetrics.infoIssues++;
    }
  }

  calculateSecurityScore() {
    const { criticalIssues, highIssues, mediumIssues, lowIssues } = this.securityMetrics;
    
    // Security score calculation (lower issues = higher score)
    const totalIssues = criticalIssues + highIssues + mediumIssues + lowIssues;
    
    if (totalIssues === 0) {
      this.securityMetrics.securityScore = 100;
      return;
    }
    
    // Weight different severity levels
    const weightedScore = 100 - (
      criticalIssues * 25 +
      highIssues * 15 +
      mediumIssues * 8 +
      lowIssues * 3
    );
    
    this.securityMetrics.securityScore = Math.max(0, Math.min(100, weightedScore));
  }

  async analyzeDependencies(projectPath) {
    try {
      const packageJsonPath = path.join(projectPath, 'package.json');
      const packageLockPath = path.join(projectPath, 'package-lock.json');
      
      // Check if package.json exists
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
      
      // Analyze dependencies for known vulnerable versions
      const dependencies = { 
        ...packageJson.dependencies, 
        ...packageJson.devDependencies 
      };
      
      // Check for outdated or vulnerable packages
      const vulnerablePackages = [
        'lodash@<4.17.21',
        'axios@<0.21.1',
        'react@<17.0.2',
        'express@<4.17.3'
      ];
      
      for (const [pkg, version] of Object.entries(dependencies)) {
        // Simple version check (in production, use npm audit API)
        if (this.isVulnerableVersion(pkg, version)) {
          this.vulnerabilities.push({
            file: 'package.json',
            line: 0,
            category: 'dependencies',
            type: 'VULNERABLE_DEPENDENCY',
            severity: 'high',
            description: `Potentially vulnerable dependency: ${pkg}@${version}`,
            code: `"${pkg}": "${version}"`,
            recommendation: `Update ${pkg} to the latest secure version. Run 'npm audit' for detailed vulnerability information.`
          });
          
          this.updateMetrics('high');
        }
      }
      
    } catch (error) {
      console.warn('⚠️ Could not analyze dependencies:', error.message);
    }
  }

  isVulnerableVersion(pkg, version) {
    // Simplified vulnerability check
    // In production, integrate with npm audit API or vulnerability databases
    const knownVulnerable = {
      'lodash': ['4.17.20', '4.17.19'],
      'axios': ['0.19.0', '0.20.0'],
      'react': ['16.13.0', '16.14.0']
    };
    
    return knownVulnerable[pkg]?.includes(version.replace(/[^0-9.]/g, ''));
  }

  async ensureOutputDirectory() {
    try {
      await fs.mkdir(this.options.outputDir, { recursive: true });
    } catch (error) {
      if (error.code !== 'EEXIST') {
        throw error;
      }
    }
  }

  async generateReports(auditTime) {
    const timestamp = new Date().toISOString();
    
    // Generate JSON report
    await this.generateJsonReport(timestamp, auditTime);
    
    // Generate HTML report
    await this.generateHtmlReport(timestamp, auditTime);
    
    // Generate Markdown report
    await this.generateMarkdownReport(timestamp, auditTime);
    
    // Generate security summary
    await this.generateSecuritySummary();
  }

  async generateJsonReport(timestamp, auditTime) {
    const report = {
      timestamp,
      auditTime,
      metrics: this.securityMetrics,
      vulnerabilities: this.vulnerabilities,
      summary: {
        totalVulnerabilities: this.vulnerabilities.length,
        securityScore: this.securityMetrics.securityScore,
        riskLevel: this.getRiskLevel()
      }
    };
    
    const filePath = path.join(this.options.outputDir, 'security-audit.json');
    await fs.writeFile(filePath, JSON.stringify(report, null, 2));
  }

  async generateHtmlReport(timestamp, auditTime) {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Security Audit Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #e1e5e9; }
        .security-score { font-size: 3rem; font-weight: bold; color: ${this.getScoreColor()}; margin: 20px 0; }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 30px 0; }
        .metric-card { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; border-left: 4px solid #007bff; }
        .vulnerability { margin: 20px 0; padding: 20px; border-radius: 8px; border-left: 4px solid #dc3545; background: #fff5f5; }
        .severity-critical { border-left-color: #dc3545; background: #fff5f5; }
        .severity-high { border-left-color: #fd7e14; background: #fff8f0; }
        .severity-medium { border-left-color: #ffc107; background: #fffbf0; }
        .severity-low { border-left-color: #28a745; background: #f0fff4; }
        .file-path { color: #6c757d; font-family: monospace; font-size: 0.9em; }
        .code-snippet { background: #f8f9fa; padding: 10px; border-radius: 4px; font-family: monospace; margin: 10px 0; }
        .recommendation { background: #e7f3ff; padding: 15px; border-radius: 4px; margin-top: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔒 Security Audit Report</h1>
            <div class="security-score">${this.securityMetrics.securityScore}/100</div>
            <p>Risk Level: <strong>${this.getRiskLevel()}</strong></p>
            <p>Generated: ${timestamp}</p>
            <p>Audit Time: ${auditTime}ms</p>
        </div>
        
        <div class="metrics">
            <div class="metric-card">
                <h3>Critical Issues</h3>
                <div style="font-size: 2rem; color: #dc3545; font-weight: bold;">${this.securityMetrics.criticalIssues}</div>
            </div>
            <div class="metric-card">
                <h3>High Issues</h3>
                <div style="font-size: 2rem; color: #fd7e14; font-weight: bold;">${this.securityMetrics.highIssues}</div>
            </div>
            <div class="metric-card">
                <h3>Medium Issues</h3>
                <div style="font-size: 2rem; color: #ffc107; font-weight: bold;">${this.securityMetrics.mediumIssues}</div>
            </div>
            <div class="metric-card">
                <h3>Low Issues</h3>
                <div style="font-size: 2rem; color: #28a745; font-weight: bold;">${this.securityMetrics.lowIssues}</div>
            </div>
            <div class="metric-card">
                <h3>Files Scanned</h3>
                <div style="font-size: 2rem; color: #6c757d; font-weight: bold;">${this.securityMetrics.totalScanned}</div>
            </div>
        </div>
        
        <h2>Vulnerabilities Found</h2>
        ${this.generateVulnerabilityHtml()}
        
        <div style="margin-top: 40px; padding: 20px; background: #e7f3ff; border-radius: 8px;">
            <h3>📋 Recommendations</h3>
            <ul>
                <li>Address critical and high severity issues immediately</li>
                <li>Implement automated security testing in CI/CD pipeline</li>
                <li>Regular dependency updates and vulnerability scanning</li>
                <li>Code review process with security focus</li>
                <li>Security training for development team</li>
            </ul>
        </div>
    </div>
</body>
</html>`;
    
    const filePath = path.join(this.options.outputDir, 'security-audit.html');
    await fs.writeFile(filePath, html);
  }

  generateVulnerabilityHtml() {
    if (this.vulnerabilities.length === 0) {
      return '<div style="text-align: center; padding: 40px; color: #28a745;"><h3>✅ No vulnerabilities found!</h3></div>';
    }
    
    return this.vulnerabilities.map(vuln => `
      <div class="vulnerability severity-${vuln.severity}">
        <h4>${vuln.type} - ${vuln.severity.toUpperCase()}</h4>
        <div class="file-path">${vuln.file}:${vuln.line}</div>
        <p>${vuln.description}</p>
        <div class="code-snippet">${this.escapeHtml(vuln.code)}</div>
        <div class="recommendation">
          <strong>💡 Recommendation:</strong> ${vuln.recommendation}
        </div>
      </div>
    `).join('');
  }

  async generateMarkdownReport(timestamp, auditTime) {
    const markdown = `# 🔒 Security Audit Report

**Security Score:** ${this.securityMetrics.securityScore}/100  
**Risk Level:** ${this.getRiskLevel()}  
**Generated:** ${timestamp}  
**Audit Time:** ${auditTime}ms  

## 📊 Security Metrics

| Severity | Count |
|----------|--------|
| Critical | ${this.securityMetrics.criticalIssues} |
| High     | ${this.securityMetrics.highIssues} |
| Medium   | ${this.securityMetrics.mediumIssues} |
| Low      | ${this.securityMetrics.lowIssues} |
| **Total Files Scanned** | ${this.securityMetrics.totalScanned} |

## 🚨 Vulnerabilities

${this.generateVulnerabilityMarkdown()}

## 📋 Recommendations

- ⚠️ **Immediate Action Required:** Address all critical and high severity issues
- 🔄 **Automation:** Implement automated security testing in CI/CD pipeline
- 📦 **Dependencies:** Regular dependency updates and vulnerability scanning
- 👥 **Process:** Code review process with security focus
- 🎓 **Training:** Security training for development team

## 🔍 Next Steps

1. Fix critical and high severity vulnerabilities
2. Review and update security policies
3. Implement automated security scanning
4. Schedule regular security audits
5. Update development practices
`;
    
    const filePath = path.join(this.options.outputDir, 'security-audit.md');
    await fs.writeFile(filePath, markdown);
  }

  generateVulnerabilityMarkdown() {
    if (this.vulnerabilities.length === 0) {
      return '✅ **No vulnerabilities found!** Your code appears to be secure.';
    }
    
    return this.vulnerabilities.map(vuln => `
### ${vuln.type} - ${vuln.severity.toUpperCase()}

**File:** \`${vuln.file}:${vuln.line}\`  
**Description:** ${vuln.description}

\`\`\`javascript
${vuln.code}
\`\`\`

**💡 Recommendation:** ${vuln.recommendation}

---
`).join('');
  }

  async generateSecuritySummary() {
    const summary = {
      timestamp: new Date().toISOString(),
      score: this.securityMetrics.securityScore,
      riskLevel: this.getRiskLevel(),
      issues: {
        critical: this.securityMetrics.criticalIssues,
        high: this.securityMetrics.highIssues,
        medium: this.securityMetrics.mediumIssues,
        low: this.securityMetrics.lowIssues
      },
      topVulnerabilities: this.getTopVulnerabilities(),
      recommendations: this.getTopRecommendations()
    };
    
    const filePath = path.join(this.options.outputDir, 'security-summary.json');
    await fs.writeFile(filePath, JSON.stringify(summary, null, 2));
  }

  getRiskLevel() {
    const score = this.securityMetrics.securityScore;
    if (score >= 90) return 'LOW';
    if (score >= 70) return 'MEDIUM';
    if (score >= 50) return 'HIGH';
    return 'CRITICAL';
  }

  getScoreColor() {
    const score = this.securityMetrics.securityScore;
    if (score >= 90) return '#28a745';
    if (score >= 70) return '#ffc107';
    if (score >= 50) return '#fd7e14';
    return '#dc3545';
  }

  getTopVulnerabilities() {
    return this.vulnerabilities
      .filter(v => ['critical', 'high'].includes(v.severity))
      .slice(0, 5)
      .map(v => ({
        type: v.type,
        severity: v.severity,
        file: v.file,
        description: v.description
      }));
  }

  getTopRecommendations() {
    const recommendations = new Map();
    
    this.vulnerabilities.forEach(vuln => {
      const key = vuln.type;
      if (!recommendations.has(key)) {
        recommendations.set(key, {
          type: vuln.type,
          count: 0,
          recommendation: vuln.recommendation
        });
      }
      recommendations.get(key).count++;
    });
    
    return Array.from(recommendations.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  escapeHtml(text) {
    const div = { innerHTML: text };
    return (div.textContent || div.innerText || '').replace(/[<>&"']/g, (char) => {
      const chars = { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' };
      return chars[char];
    });
  }
}

// CLI Interface
if (require.main === module) {
  const auditor = new SecurityAuditor({
    outputDir: './security-reports',
    scanDepth: 'comprehensive'
  });
  
  auditor.runSecurityAudit(process.argv[2] || '.')
    .then(results => {
      console.log('\n📊 Security Audit Summary:');
      console.log(`  Security Score: ${results.metrics.securityScore}/100`);
      console.log(`  Total Vulnerabilities: ${results.vulnerabilities.length}`);
      console.log(`  Critical: ${results.metrics.criticalIssues}`);
      console.log(`  High: ${results.metrics.highIssues}`);
      console.log(`  Medium: ${results.metrics.mediumIssues}`);
      console.log(`  Low: ${results.metrics.lowIssues}`);
      console.log('\n📁 Reports generated in ./security-reports/');
    })
    .catch(error => {
      console.error('❌ Security audit failed:', error);
      process.exit(1);
    });
}

module.exports = SecurityAuditor;
