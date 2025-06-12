// filepath: c:\Users\AYUSHMAN NANDA\OneDrive\Desktop\GDC\security-dashboard-backup.js
// Backup of SecurityDashboard.js before complete rewrite
const fs = require('fs');
const path = require('path');

// Copy the original file to a backup
const srcPath = path.join(__dirname, 'src', 'components', 'security', 'SecurityDashboard.js');
const backupContent = fs.readFileSync(srcPath, 'utf8');
fs.writeFileSync(path.join(__dirname, 'security-dashboard-backup.js'), backupContent);

console.log('SecurityDashboard.js backup created successfully!');
