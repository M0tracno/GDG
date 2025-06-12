#!/usr/bin/env node

/**
 * Advanced Duplicate Import Cleanup Script
 * Systematically fixes all duplicate import issues
 */

const fs = require('fs');
const path = require('path');

let totalFixedFiles = 0;
let totalFixesMade = 0;

/**
 * Find all JS/JSX files recursively
 */
function findJSFiles(dir = './src', files = []) {
  try {
    const dirItems = fs.readdirSync(dir);
    
    for (const item of dirItems) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        findJSFiles(fullPath, files);
      } else if (item.endsWith('.js') || item.endsWith('.jsx')) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error.message);
  }
  
  return files;
}

/**
 * Extract and consolidate imports from a file
 */
function consolidateImports(content) {
  const lines = content.split('\n');
  const imports = { react: [], mui: [], muiIcons: [], other: [] };
  const nonImportLines = [];
  
  let inMuiImport = false;
  let inMuiIconImport = false;
  let currentImportLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // React imports
    if (line.startsWith('import React') || line.startsWith("import React")) {
      imports.react.push(line);
      continue;
    }
    
    // MUI Material imports
    if (line.includes("from '@mui/material'")) {
      if (line.startsWith('import {')) {
        // Extract imports from this line
        const importMatch = line.match(/import\s*{\s*([^}]+)\s*}\s*from\s*'@mui\/material'/);
        if (importMatch) {
          const importItems = importMatch[1].split(',').map(item => item.trim()).filter(Boolean);
          imports.mui.push(...importItems);
        }
      }
      continue;
    }
    
    // MUI Icons imports
    if (line.includes("from '@mui/icons-material'")) {
      if (line.startsWith('import {')) {
        // Extract imports from this line
        const importMatch = line.match(/import\s*{\s*([^}]+)\s*}\s*from\s*'@mui\/icons-material'/);
        if (importMatch) {
          const importItems = importMatch[1].split(',').map(item => item.trim()).filter(Boolean);
          imports.muiIcons.push(...importItems);
        }
      }
      continue;
    }
    
    // Multi-line MUI imports
    if (line.startsWith('import {') && !line.includes('from')) {
      inMuiImport = true;
      currentImportLines = [line];
      continue;
    }
    
    if (inMuiImport) {
      currentImportLines.push(line);
      if (line.includes("from '@mui/material'")) {
        // Process multi-line MUI import
        const fullImport = currentImportLines.join(' ');
        const importMatch = fullImport.match(/import\s*{\s*([^}]+)\s*}\s*from\s*'@mui\/material'/);
        if (importMatch) {
          const importItems = importMatch[1].split(',').map(item => item.trim()).filter(Boolean);
          imports.mui.push(...importItems);
        }
        inMuiImport = false;
        currentImportLines = [];
        continue;
      } else if (line.includes("from '@mui/icons-material'")) {
        // Process multi-line MUI icons import
        const fullImport = currentImportLines.join(' ');
        const importMatch = fullImport.match(/import\s*{\s*([^}]+)\s*}\s*from\s*'@mui\/icons-material'/);
        if (importMatch) {
          const importItems = importMatch[1].split(',').map(item => item.trim()).filter(Boolean);
          imports.muiIcons.push(...importItems);
        }
        inMuiImport = false;
        currentImportLines = [];
        continue;
      }
      continue;
    }
    
    // Other imports
    if (line.startsWith('import ')) {
      imports.other.push(line);
      continue;
    }
    
    // Non-import lines
    nonImportLines.push(lines[i]);
  }
  
  return { imports, nonImportLines };
}

/**
 * Remove duplicate imports and fix aliases
 */
function deduplicateImports(imports) {
  // Deduplicate MUI imports
  const muiSet = new Set();
  imports.mui.forEach(item => {
    if (item && !muiSet.has(item)) {
      muiSet.add(item);
    }
  });
  imports.mui = Array.from(muiSet);
  
  // Deduplicate MUI Icons imports and fix conflicts
  const iconMap = new Map();
  const conflictMap = new Map();
  
  imports.muiIcons.forEach(item => {
    if (!item) return;
    
    const trimmed = item.trim();
    if (trimmed.includes(' as ')) {
      const [original, alias] = trimmed.split(' as ').map(s => s.trim());
      
      if (iconMap.has(alias)) {
        // Conflict detected, use different alias
        let counter = 2;
        let newAlias = `${alias}${counter}`;
        while (iconMap.has(newAlias)) {
          counter++;
          newAlias = `${alias}${counter}`;
        }
        conflictMap.set(alias, newAlias);
        iconMap.set(newAlias, `${original} as ${newAlias}`);
      } else {
        iconMap.set(alias, trimmed);
      }
    } else {
      if (!iconMap.has(trimmed)) {
        iconMap.set(trimmed, trimmed);
      }
    }
  });
  
  imports.muiIcons = Array.from(iconMap.values());
  
  // Deduplicate other imports
  imports.other = [...new Set(imports.other)];
  
  return { imports, conflictMap };
}

/**
 * Generate clean import statements
 */
function generateImports(imports) {
  const importLines = [];
  
  // React imports
  if (imports.react.length > 0) {
    importLines.push(...imports.react);
  }
  
  // MUI Material imports
  if (imports.mui.length > 0) {
    const sortedMui = imports.mui.sort();
    if (sortedMui.length <= 5) {
      importLines.push(`import { ${sortedMui.join(', ')} } from '@mui/material';`);
    } else {
      importLines.push('import {');
      sortedMui.forEach((item, index) => {
        const comma = index < sortedMui.length - 1 ? ',' : '';
        importLines.push(`  ${item}${comma}`);
      });
      importLines.push("} from '@mui/material';");
    }
  }
  
  // MUI Icons imports
  if (imports.muiIcons.length > 0) {
    const sortedIcons = imports.muiIcons.sort();
    if (sortedIcons.length <= 5) {
      importLines.push(`import { ${sortedIcons.join(', ')} } from '@mui/icons-material';`);
    } else {
      importLines.push('import {');
      sortedIcons.forEach((item, index) => {
        const comma = index < sortedIcons.length - 1 ? ',' : '';
        importLines.push(`  ${item}${comma}`);
      });
      importLines.push("} from '@mui/icons-material';");
    }
  }
  
  // Other imports
  if (imports.other.length > 0) {
    importLines.push(...imports.other);
  }
  
  return importLines;
}

/**
 * Process a single file
 */
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const { imports, nonImportLines } = consolidateImports(content);
    
    // Check if there are duplicates
    const originalMuiCount = imports.mui.length;
    const originalIconCount = imports.muiIcons.length;
    
    const { imports: cleanImports, conflictMap } = deduplicateImports(imports);
    
    const hasChanges = 
      cleanImports.mui.length !== originalMuiCount || 
      cleanImports.muiIcons.length !== originalIconCount ||
      conflictMap.size > 0;
    
    if (hasChanges) {
      const importLines = generateImports(cleanImports);
      let newContent = importLines.join('\n') + '\n\n' + nonImportLines.join('\n');
      
      // Update references for conflicted aliases
      for (const [oldAlias, newAlias] of conflictMap) {
        const regex = new RegExp(`<${oldAlias}\\b`, 'g');
        newContent = newContent.replace(regex, `<${newAlias}`);
      }
      
      fs.writeFileSync(filePath, newContent, 'utf8');
      
      const fixes = [];
      if (cleanImports.mui.length !== originalMuiCount) {
        fixes.push(`Deduplicated ${originalMuiCount - cleanImports.mui.length} MUI imports`);
      }
      if (cleanImports.muiIcons.length !== originalIconCount) {
        fixes.push(`Deduplicated ${originalIconCount - cleanImports.muiIcons.length} icon imports`);
      }
      if (conflictMap.size > 0) {
        fixes.push(`Resolved ${conflictMap.size} alias conflicts`);
      }
      
      console.log(`✅ Fixed: ${path.relative(process.cwd(), filePath)}`);
      fixes.forEach(fix => console.log(`   - ${fix}`));
      
      totalFixedFiles++;
      totalFixesMade += fixes.length;
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Main execution
 */
function main() {
  console.log('🔧 Running advanced duplicate import cleanup...\n');
  
  const files = findJSFiles();
  console.log(`Found ${files.length} JavaScript files to check\n`);
  
  for (const file of files) {
    processFile(file);
  }
  
  console.log(`\n🎉 Advanced cleanup complete!`);
  console.log(`Fixed ${totalFixesMade} issues in ${totalFixedFiles} files`);
  console.log('Run "npm run build" to check for remaining errors.');
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { processFile };
