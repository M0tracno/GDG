#!/usr/bin/env node

/**
 * Comprehensive Duplicate Import Fixer
 * Systematically fixes all duplicate import issues in the codebase
 */

const fs = require('fs');
const path = require('path');

let totalFixedFiles = 0;
let totalIssuesFixed = 0;

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
 * Parse and consolidate imports from file content
 */
function consolidateImports(content) {
  const lines = content.split('\n');
  const imports = {
    react: [],
    mui: new Set(),
    muiIcons: new Set(),
    muiStyles: new Set(),
    other: []
  };
  
  const nonImportLines = [];
  let inMultiLineImport = false;
  let currentImportBuffer = '';
  let currentImportType = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();
    
    // Skip empty lines and comments at the beginning
    if (!trimmedLine || trimmedLine.startsWith('//') || trimmedLine.startsWith('/*')) {
      if (!inMultiLineImport) {
        nonImportLines.push(line);
      }
      continue;
    }
    
    // React imports
    if (trimmedLine.startsWith('import React')) {
      if (!inMultiLineImport) {
        imports.react.push(trimmedLine);
        continue;
      }
    }
    
    // Start of import statement
    if (trimmedLine.startsWith('import {') || trimmedLine.startsWith('import ')) {
      inMultiLineImport = true;
      currentImportBuffer = trimmedLine;
      
      // Determine import type
      if (trimmedLine.includes("from '@mui/material'")) {
        currentImportType = 'mui';
      } else if (trimmedLine.includes("from '@mui/icons-material'")) {
        currentImportType = 'muiIcons';
      } else if (trimmedLine.includes("from '@mui/styles'")) {
        currentImportType = 'muiStyles';
      } else {
        currentImportType = 'other';
      }
      
      // Check if it's a single-line import
      if (trimmedLine.includes('from ')) {
        processImportLine(currentImportBuffer, imports, currentImportType);
        inMultiLineImport = false;
        currentImportBuffer = '';
        currentImportType = null;
      }
      continue;
    }
    
    // Continuation of multi-line import
    if (inMultiLineImport) {
      currentImportBuffer += ' ' + trimmedLine;
      
      // End of multi-line import
      if (trimmedLine.includes('from ') && trimmedLine.endsWith(';')) {
        processImportLine(currentImportBuffer, imports, currentImportType);
        inMultiLineImport = false;
        currentImportBuffer = '';
        currentImportType = null;
      }
      continue;
    }
    
    // Non-import lines
    nonImportLines.push(line);
  }
  
  return { imports, nonImportLines };
}

/**
 * Process a single import line
 */
function processImportLine(importLine, imports, type) {
  if (type === 'other') {
    // Check if it's already in other imports
    if (!imports.other.some(existing => existing.trim() === importLine.trim())) {
      imports.other.push(importLine);
    }
    return;
  }
  
  // Extract imports from the line
  const match = importLine.match(/import\s*{\s*([^}]+)\s*}\s*from/);
  if (match) {
    const importItems = match[1]
      .split(',')
      .map(item => item.trim())
      .filter(item => item.length > 0);
    
    importItems.forEach(item => {
      if (type === 'mui') {
        imports.mui.add(item);
      } else if (type === 'muiIcons') {
        imports.muiIcons.add(item);
      } else if (type === 'muiStyles') {
        imports.muiStyles.add(item);
      }
    });
  }
}

/**
 * Generate clean import statements
 */
function generateCleanImports(imports) {
  const importLines = [];
  
  // React imports
  if (imports.react.length > 0) {
    importLines.push(...imports.react);
  }
  
  // MUI Material imports
  if (imports.mui.size > 0) {
    const sortedMui = Array.from(imports.mui).sort();
    if (sortedMui.length <= 6) {
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
  if (imports.muiIcons.size > 0) {
    const sortedIcons = Array.from(imports.muiIcons).sort();
    if (sortedIcons.length <= 6) {
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
  
  // MUI Styles imports
  if (imports.muiStyles.size > 0) {
    const sortedStyles = Array.from(imports.muiStyles).sort();
    importLines.push(`import { ${sortedStyles.join(', ')} } from '@mui/styles';`);
  }
  
  // Other imports
  if (imports.other.length > 0) {
    imports.other.forEach(importLine => {
      if (!importLines.includes(importLine)) {
        importLines.push(importLine);
      }
    });
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
    
    // Check if consolidation is needed
    const originalMuiCount = imports.mui.size;
    const originalIconCount = imports.muiIcons.size;
    const originalOtherCount = imports.other.length;
    
    // Count original imports in file to see if there were duplicates
    const originalContent = content;
    const muiImportMatches = (originalContent.match(/from '@mui\/material'/g) || []).length;
    const iconImportMatches = (originalContent.match(/from '@mui\/icons-material'/g) || []).length;
    
    const hasDuplicates = muiImportMatches > 1 || iconImportMatches > 1;
    
    if (hasDuplicates || originalContent.includes('const theme = useTheme();') && originalContent.includes('makeStyles((theme)')) {
      const cleanImportLines = generateCleanImports(imports);
      
      // Remove misplaced useTheme calls inside makeStyles
      let cleanNonImportContent = nonImportLines.join('\n');
      cleanNonImportContent = cleanNonImportContent.replace(
        /makeStyles\(\(theme\)\s*=>\s*\(\{\s*const\s+theme\s*=\s*useTheme\(\);\s*/g,
        'makeStyles((theme) => ({\n'
      );
      
      const newContent = cleanImportLines.join('\n') + '\n\n' + cleanNonImportContent;
      
      fs.writeFileSync(filePath, newContent, 'utf8');
      
      const issuesFixed = [];
      if (muiImportMatches > 1) {
        issuesFixed.push(`Consolidated ${muiImportMatches} MUI imports into 1`);
      }
      if (iconImportMatches > 1) {
        issuesFixed.push(`Consolidated ${iconImportMatches} icon imports into 1`);
      }
      if (originalContent.includes('const theme = useTheme();') && originalContent.includes('makeStyles((theme)')) {
        issuesFixed.push('Removed misplaced useTheme() call');
      }
      
      console.log(`✅ Fixed: ${path.relative(process.cwd(), filePath)}`);
      issuesFixed.forEach(fix => console.log(`   - ${fix}`));
      
      totalFixedFiles++;
      totalIssuesFixed += issuesFixed.length;
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
  console.log('🔧 Running comprehensive duplicate import cleanup...\n');
  
  const files = findJSFiles();
  console.log(`Found ${files.length} JavaScript files to check\n`);
  
  for (const file of files) {
    processFile(file);
  }
  
  console.log(`\n🎉 Comprehensive cleanup complete!`);
  console.log(`Fixed ${totalIssuesFixed} issues in ${totalFixedFiles} files`);
  console.log('Run "npm run build" to verify all errors are resolved.');
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { processFile, consolidateImports };
