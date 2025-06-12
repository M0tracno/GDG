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

function fixMalformedImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let hasChanges = false;
  
  // Fix duplicate import statements like "import {\nimport {"
  content = content.replace(/import\s*{\s*\nimport\s*{/g, 'import {');
  if (content !== fs.readFileSync(filePath, 'utf8')) hasChanges = true;
  
  // Fix orphaned import items that are not part of a proper import statement
  const lines = content.split('\n');
  const fixedLines = [];
  let inImportSection = true;
  let currentImport = null;
  let importBuffer = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // Check if we're still in the import section
    if (!trimmed.startsWith('import') && !trimmed.startsWith('}') && 
        !trimmed.includes('from ') && trimmed && 
        !trimmed.startsWith('//') && !trimmed.startsWith('/*') &&
        !trimmed.includes(',') && !trimmed.match(/^\s*[A-Z][a-zA-Z]*\s*,?\s*$/)) {
      inImportSection = false;
    }
    
    if (inImportSection) {
      // Handle import statements
      if (trimmed.startsWith('import')) {
        // Complete any pending import
        if (importBuffer.length > 0) {
          // This was an incomplete import, skip it
          importBuffer = [];
        }
        
        if (trimmed.includes('from ') && trimmed.includes('{') && trimmed.includes('}')) {
          // Complete import on one line
          fixedLines.push(line);
        } else if (trimmed.includes('from ') && !trimmed.includes('{')) {
          // Default import
          fixedLines.push(line);
        } else if (trimmed.includes('{') && !trimmed.includes('}')) {
          // Start of multi-line import
          currentImport = line;
        } else {
          // Malformed import, skip
          hasChanges = true;
        }
      } else if (trimmed.includes('} from ')) {
        // End of multi-line import
        if (currentImport) {
          fixedLines.push(currentImport + ' ' + trimmed);
          currentImport = null;
        } else {
          fixedLines.push(line);
        }
      } else if (currentImport && (trimmed.includes(',') || trimmed.match(/^\s*[A-Z][a-zA-Z]*\s*,?\s*$/))) {
        // Part of multi-line import
        currentImport += ' ' + trimmed;
      } else if (trimmed.startsWith('//') || trimmed.startsWith('/*') || !trimmed) {
        // Comments or empty lines
        fixedLines.push(line);
      } else {
        // Orphaned import item, skip it
        hasChanges = true;
      }
    } else {
      // Not in import section anymore
      fixedLines.push(line);
    }
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
  
  console.log(`Scanning ${files.length} files for malformed imports...`);
  
  let fixedFiles = 0;
  
  files.forEach(filePath => {
    try {
      const relativePath = path.relative(__dirname, filePath);
      
      if (fixMalformedImports(filePath)) {
        console.log(`Fixed: ${relativePath}`);
        fixedFiles++;
      }
    } catch (error) {
      console.error(`Error processing ${filePath}:`, error.message);
    }
  });
  
  console.log(`\nFixed malformed imports in ${fixedFiles} files.`);
}

main();
