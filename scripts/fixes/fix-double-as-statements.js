#!/usr/bin/env node

/**
 * Fix Double As Statements Script
 * Fixes patterns like "Delete as Delete as DeleteIcon" -> "Delete as DeleteIcon"
 */

const fs = require('fs');
const path = require('path');

/**
 * Find all JS/JSX files recursively
 */
function findJSFiles(dir = './src', files = []) {
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
  
  return files;
}

/**
 * Fix double as statements in content
 */
function fixDoubleAsStatements(content) {
  // Pattern to match "Xyz as Xyz as XyzIcon" and replace with "Xyz as XyzIcon"
  const doubleAsRegex = /(\w+)\s+as\s+\1\s+as\s+(\w+Icon)/g;
  
  // Additional patterns for edge cases like "Add as Add as AddIcon,  Edit as EditIcon"
  const doubleAsWithCommaRegex = /(\w+)\s+as\s+\1\s+as\s+(\w+Icon),\s+/g;
  
  let fixedContent = content;
  fixedContent = fixedContent.replace(doubleAsRegex, '$1 as $2');
  fixedContent = fixedContent.replace(doubleAsWithCommaRegex, '$1 as $2, ');
  
  return fixedContent;
}

/**
 * Process a single file
 */
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    const fixedContent = fixDoubleAsStatements(content);
    
    if (fixedContent !== originalContent) {
      fs.writeFileSync(filePath, fixedContent, 'utf8');
      console.log(`✅ Fixed: ${path.relative(process.cwd(), filePath)}`);
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
  console.log('🔧 Fixing double "as" statements in import declarations...\n');
  
  const files = findJSFiles();
  console.log(`Found ${files.length} JavaScript files to check\n`);
  
  let fixedCount = 0;
  
  for (const file of files) {
    if (processFile(file)) {
      fixedCount++;
    }
  }
  
  console.log(`\n🎉 Fixed ${fixedCount} files with double "as" statements`);
  console.log('You can now run "npm run build" to check for remaining errors.');
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { processFile, fixDoubleAsStatements };
