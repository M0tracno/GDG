const fs = require('fs');
const path = require('path');

function getFilesRecursively(dir, extensions = ['.js', '.jsx']) {
  let results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat && stat.isDirectory()) {
      if (!['node_modules', 'build', 'dist', '.git'].includes(file)) {
        results = results.concat(getFilesRecursively(filePath, extensions));
      }
    } else {
      if (extensions.some(ext => file.endsWith(ext))) {
        results.push(filePath);
      }
    }
  });
  
  return results;
}

function fixOrphanedImports(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  const fixedLines = [];
  let hasChanges = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // Skip orphaned import closing braces
    if (trimmed === '} from \'@mui/icons-material\';' || 
        trimmed === '} from "@mui/icons-material";' ||
        trimmed === '} from \'@mui/material\';' ||
        trimmed === '} from "@mui/material";' ||
        trimmed === '} from \'@mui/lab\';' ||
        trimmed === '} from "@mui/lab";') {
      // Check if there's a corresponding opening import
      let hasOpeningImport = false;
      for (let j = i - 1; j >= 0; j--) {
        const prevLine = lines[j].trim();
        if (prevLine.startsWith('import {') && !prevLine.includes('}')) {
          hasOpeningImport = true;
          break;
        }
        if (prevLine.startsWith('import') && prevLine.includes('}')) {
          break;
        }
        if (prevLine && !prevLine.startsWith('//') && !prevLine.includes(',') && 
            !prevLine.match(/^\s*[A-Z][a-zA-Z]*\s*,?\s*$/)) {
          break;
        }
      }
      
      if (!hasOpeningImport) {
        hasChanges = true;
        continue; // Skip this orphaned closing brace
      }
    }
    
    // Skip lines that are just comments in the middle of nowhere
    if (trimmed.startsWith('// src/components/') && i > 0 && lines[i-1].trim().includes('from \'@mui/')) {
      hasChanges = true;
      continue;
    }
    
    fixedLines.push(line);
  }
  
  if (hasChanges) {
    const newContent = fixedLines.join('\n');
    fs.writeFileSync(filePath, newContent);
    return true;
  }
  
  return false;
}

function main() {
  const srcDir = path.join(__dirname, 'src');
  const files = getFilesRecursively(srcDir);
  
  console.log(`Scanning ${files.length} files for orphaned imports...`);
  
  let fixedFiles = 0;
  
  files.forEach(filePath => {
    try {
      const relativePath = path.relative(__dirname, filePath);
      
      if (fixOrphanedImports(filePath)) {
        console.log(`Fixed: ${relativePath}`);
        fixedFiles++;
      }
    } catch (error) {
      console.error(`Error processing ${filePath}:`, error.message);
    }
  });
  
  console.log(`\nFixed orphaned imports in ${fixedFiles} files.`);
}

main();
