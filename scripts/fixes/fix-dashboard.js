const fs = require('fs');

const filePath = 'src/components/security/SecurityDashboard.js';

try {
  console.log('Fixing SecurityDashboard.js...');
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix the corrupted CSS-in-JS syntax where colons became commas
  content = content.replace(/(\w+):\s*{,/g, '$1: {');
  content = content.replace(/},\s*}/g, '}\n}');
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ Fixed SecurityDashboard.js');
} catch (error) {
  console.error('❌ Error:', error.message);
}
