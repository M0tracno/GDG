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

function fixDuplicateImports(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  const imports = {
    mui: new Set(),
    muiIcons: new Set(),
    muiLab: new Set(),
    muiStyles: new Set(),
    other: []
  };
  
  const nonImportLines = [];
  let inImportSection = true;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    if (trimmed.startsWith('import') && (
        trimmed.includes('@mui/material') ||
        trimmed.includes('@mui/icons-material') ||
        trimmed.includes('@mui/lab') ||
        trimmed.includes('@mui/material/styles')
    )) {
      // Parse MUI imports
      if (trimmed.includes('@mui/material/styles')) {
        const match = trimmed.match(/import\s*{([^}]+)}\s*from\s*['"]@mui\/material\/styles['"]/);
        if (match) {
          const importItems = match[1].split(',').map(item => item.trim());
          importItems.forEach(item => imports.muiStyles.add(item));
        }
      } else if (trimmed.includes('@mui/material')) {
        const match = trimmed.match(/import\s*{([^}]+)}\s*from\s*['"]@mui\/material['"]/);
        if (match) {
          const importItems = match[1].split(',').map(item => item.trim());
          importItems.forEach(item => imports.mui.add(item));
        }
      } else if (trimmed.includes('@mui/icons-material')) {
        const match = trimmed.match(/import\s*{([^}]+)}\s*from\s*['"]@mui\/icons-material['"]/);
        if (match) {
          const importItems = match[1].split(',').map(item => item.trim());
          importItems.forEach(item => imports.muiIcons.add(item));
        }
      } else if (trimmed.includes('@mui/lab')) {
        const match = trimmed.match(/import\s*{([^}]+)}\s*from\s*['"]@mui\/lab['"]/);
        if (match) {
          const importItems = match[1].split(',').map(item => item.trim());
          importItems.forEach(item => imports.muiLab.add(item));
        }
      }
    } else if (trimmed.startsWith('import')) {
      // Other imports
      imports.other.push(line);
    } else {
      if (trimmed || !inImportSection) {
        inImportSection = false;
        nonImportLines.push(line);
      }
    }
  }
  
  // Build new content
  const newLines = [];
  
  // Add other imports first
  imports.other.forEach(importLine => {
    newLines.push(importLine);
  });
  
  // Add consolidated MUI imports
  if (imports.mui.size > 0) {
    const sortedImports = Array.from(imports.mui).sort();
    newLines.push(`import { ${sortedImports.join(', ')} } from '@mui/material';`);
  }
  
  if (imports.muiIcons.size > 0) {
    const sortedIcons = Array.from(imports.muiIcons).sort();
    newLines.push(`import { ${sortedIcons.join(', ')} } from '@mui/icons-material';`);
  }
  
  if (imports.muiLab.size > 0) {
    const sortedLab = Array.from(imports.muiLab).sort();
    newLines.push(`import { ${sortedLab.join(', ')} } from '@mui/lab';`);
  }
  
  if (imports.muiStyles.size > 0) {
    const sortedStyles = Array.from(imports.muiStyles).sort();
    newLines.push(`import { ${sortedStyles.join(', ')} } from '@mui/material/styles';`);
  }
  
  // Add empty line after imports if there are imports
  if (newLines.length > 0) {
    newLines.push('');
  }
  
  // Add the rest of the file
  newLines.push(...nonImportLines);
  
  // Write back to file
  const newContent = newLines.join('\n');
  fs.writeFileSync(filePath, newContent);
  
  return {
    mui: imports.mui.size,
    muiIcons: imports.muiIcons.size,
    muiLab: imports.muiLab.size,
    muiStyles: imports.muiStyles.size
  };
}

function main() {
  const srcDir = path.join(__dirname, 'src');
  const files = getFilesRecursively(srcDir);
  
  console.log(`Processing ${files.length} files for duplicate import cleanup...`);
  
  let processedFiles = 0;
  
  files.forEach(filePath => {
    try {
      const relativePath = path.relative(__dirname, filePath);
      const result = fixDuplicateImports(filePath);
      
      if (result.mui > 0 || result.muiIcons > 0 || result.muiLab > 0 || result.muiStyles > 0) {
        console.log(`${relativePath}: Consolidated imports - MUI: ${result.mui}, Icons: ${result.muiIcons}, Lab: ${result.muiLab}, Styles: ${result.muiStyles}`);
        processedFiles++;
      }
    } catch (error) {
      console.error(`Error processing ${filePath}:`, error.message);
    }
  });
  
  console.log(`\nProcessed ${processedFiles} files with MUI imports.`);
}

main();
