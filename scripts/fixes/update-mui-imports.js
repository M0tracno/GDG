// update-mui-imports.js
// Script to update Material-UI v4 imports to MUI v5
const fs = require('fs');
const path = require('path');

// Store updated files
const updatedFiles = [];

// Define replacements
const importReplacements = [
  { from: /@material-ui\/core\/styles/g, to: '@mui/material/styles' },
  { from: /@material-ui\/core\/CssBaseline/g, to: '@mui/material/CssBaseline' },
  { from: /@material-ui\/lab\/Alert/g, to: '@mui/material/Alert' },
  { from: /@material-ui\/lab/g, to: '@mui/lab' },
  { from: /@material-ui\/icons/g, to: '@mui/icons-material' },
  { from: /@material-ui\/core\/[^'"]+/g, to: (match) => {
    const component = match.replace('@material-ui/core/', '');
    return `@mui/material/${component}`;
  }},
  { from: /@material-ui\/core/g, to: '@mui/material' },
  // Special case for makeStyles
  { 
    from: /import\s*{\s*([^}]*makeStyles[^}]*)\s*}\s*from\s*['"]@mui\/material['"]/g, 
    to: (match, imports) => {
      return 'import { styled } from \'@mui/material/styles\';';
    }
  }
];

// Process a single file
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Check for Material-UI imports
    if (content.includes('@material-ui')) {
      // Apply all replacements
      importReplacements.forEach(({ from, to }) => {
        const newContent = content.replace(from, to);
        if (newContent !== content) {
          content = newContent;
          modified = true;
        }
      });
      
      // Save file if modified
      if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        updatedFiles.push(filePath);
        console.log(`Updated: ${filePath}`);
      }
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
console.log(`Starting MUI migration for files in ${srcPath}`);
processDirectory(srcPath);
console.log(`Migration complete. Updated ${updatedFiles.length} files.`);
