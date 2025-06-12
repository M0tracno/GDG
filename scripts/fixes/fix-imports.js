const fs = require('fs');
const path = require('path');

// Function to fix common import issues
function fixImportSyntax(filePath) {
  try {
    console.log(`Processing ${filePath}...`);
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Fix malformed imports - use 'import' on a single line
    content = content.replace(/import\s*{[\s\n]+/g, 'import {');
    
    // Fix dangling curly braces in imports
    content = content.replace(/}\s*from\s*'([^']+)';?,\s*$/gm, "} from '$1';");
    
    // Fix imports that have an import inside braces
    content = content.replace(/import\s*{\s*import/g, 'import');
    
    // Fix missing commas in import lists
    content = content.replace(/}(\s*)from/g, '} $1from');
    
    // Fix incomplete imports that end with identifier
    const iconMatches = content.match(/(\s+)([a-zA-Z]+\s+as\s+[a-zA-Z]+Icon)(\s*\n)/g);
    if (iconMatches) {
      iconMatches.forEach(match => {
        content = content.replace(match, match.trim() + " } from '@mui/icons-material';\n");
      });
    }
    
    // Write fixed content back to file
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Fixed ${filePath}`);
    return true;
  } catch (err) {
    console.error(`Error fixing ${filePath}:`, err);
    return false;
  }
}

// Fix specific files with known issues
const filesToFix = [
  'src/pages/Phase3BTestPage.js',
  'src/pages/Phase3CTestPage.js',
  'src/pages/Phase3TestPage.js',
  'src/pages/Phase5SecurityTestPage.js',
  'src/pages/RoleSelection.js',
  'src/pages/SetupPassword.js',
  'src/pages/StudentDashboard.js',
  'src/pages/StudentLogin.js',
  'src/reportWebVitals.js',
  'src/services/firebaseEmailService.js',
];

// Process each file
let fixedCount = 0;
filesToFix.forEach(file => {
  const fullPath = path.resolve(process.cwd(), file);
  if (fs.existsSync(fullPath)) {
    const success = fixImportSyntax(fullPath);
    if (success) fixedCount++;
  } else {
    console.log(`File not found: ${fullPath}`);
  }
});

console.log(`Fixed ${fixedCount} of ${filesToFix.length} files`);
