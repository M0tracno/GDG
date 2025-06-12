#!/usr/bin/env node

/**
 * Quick Import Deduplication Fix
 * Systematically fixes duplicate import issues by removing the first import and keeping the more complete one
 */

const fs = require('fs');
const path = require('path');

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

function fixDuplicateImports(content) {
  const lines = content.split('\n');
  const result = [];
  let skipNextMuiImport = false;
  let seenMuiImports = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check for single-line MUI imports
    if (line.includes("from '@mui/icons-material'") && line.includes('import {')) {
      if (seenMuiImports) {
        // Skip this line as it's a duplicate
        continue;
      }
      seenMuiImports = true;
    }
    
    result.push(line);
  }
  
  return result.join('\n');
}

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const originalLines = content.split('\n').length;
    
    const fixedContent = fixDuplicateImports(content);
    const fixedLines = fixedContent.split('\n').length;
    
    if (fixedLines !== originalLines) {
      fs.writeFileSync(filePath, fixedContent, 'utf8');
      console.log(`✅ Fixed: ${path.relative(process.cwd(), filePath)} (removed ${originalLines - fixedLines} lines)`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function main() {
  console.log('🔧 Running quick import deduplication...\n');
  
  const files = findJSFiles();
  let fixedCount = 0;
  
  for (const file of files) {
    if (processFile(file)) {
      fixedCount++;
    }
  }
  
  console.log(`\n🎉 Fixed ${fixedCount} files`);
  console.log('Run "npm run build" to check for remaining errors.');
}

if (require.main === module) {
  main();
}
