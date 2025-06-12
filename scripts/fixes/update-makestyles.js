// update-makestyles.js
// Script to update makeStyles imports to use our compatibility layer
const fs = require('fs');
const path = require('path');

// Store updated files
const updatedFiles = [];

// Process a single file
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Replace direct Material-UI makeStyles imports with our compatibility layer
    const originalContent = content;
    
    // Replace import for makeStyles
    content = content.replace(
      /import\s*{\s*([^}]*)(makeStyles)([^}]*)\s*}\s*from\s*['"]@mui\/material\/styles['"]/g,
      (match, before, makeStyles, after) => {
        const remainingImports = (before + after).replace(/,\s*,/g, ',').replace(/^\s*,\s*|\s*,\s*$/g, '');
        const makeStylesImport = "import makeStyles from '../../utils/makeStylesCompat'";
        
        if (remainingImports) {
          return `import { ${remainingImports} } from '@mui/material/styles';\n${makeStylesImport}`;
        } else {
          return makeStylesImport;
        }
      }
    );
    
    // Check if content was modified
    if (content !== originalContent) {
      modified = true;
      fs.writeFileSync(filePath, content, 'utf8');
      updatedFiles.push(filePath);
      console.log(`Updated makeStyles in: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
  }
}

// Process directory recursively
function processDirectory(directoryPath) {
  const files = fs.readdirSync(directoryPath);
  
  files.forEach(file => {
    const filePath = path.join(directoryPath, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      // Skip node_modules and build directories
      if (file !== 'node_modules' && file !== 'build') {
        processDirectory(filePath);
      }
    } else if (stats.isFile() && 
              (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.tsx'))) {
      processFile(filePath);
    }
  });
}

// Main execution
const srcPath = path.join(__dirname, 'src');
console.log(`Starting makeStyles migration for files in ${srcPath}`);
processDirectory(srcPath);
console.log(`Migration complete. Updated ${updatedFiles.length} files.`);
