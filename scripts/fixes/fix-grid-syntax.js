#!/usr/bin/env node

/**
 * Grid Syntax Fixer Script
 * 
 * This script fixes MUI Grid syntax issues by:
 * 1. Converting size={{ xs: 12 }} to item xs={12}
 * 2. Fixing malformed Grid syntax like size={{xs: 4}}>
 * 3. Ensuring proper Grid item structure
 */

const fs = require('fs');
const path = require('path');

let filesProcessed = 0;
let totalChanges = 0;

// Process a single file
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    let changes = 0;

    // Fix 1: Convert size={{ xs: 12, sm: 6, md: 3 }} to item xs={12} sm={6} md={3}
    content = content.replace(
      /<Grid\s+size=\{\{\s*([^}]+)\s*\}\}/g,
      (match, sizeProps) => {
        changes++;
        // Parse the size properties
        const props = sizeProps.split(',')
          .map(prop => prop.trim())
          .map(prop => {
            const [key, value] = prop.split(':').map(s => s.trim());
            return `${key}={${value}}`;
          })
          .join(' ');
        return `<Grid item ${props}`;
      }
    );

    // Fix 2: Handle malformed syntax like size={{xs: 4}}>
    content = content.replace(
      /<Grid\s+size=\{\{([^}]+)\}\}>/g,
      (match, sizeProps) => {
        changes++;
        const props = sizeProps.split(',')
          .map(prop => prop.trim())
          .map(prop => {
            const [key, value] = prop.split(':').map(s => s.trim());
            return `${key}={${value}}`;
          })
          .join(' ');
        return `<Grid item ${props}>`;
      }
    );

    // Fix 3: Handle simple size={{xs: 12}} md={4} patterns
    content = content.replace(
      /<Grid\s+size=\{\{\s*xs:\s*(\d+)\s*\}\}\s+md=\{(\d+)\}/g,
      '<Grid item xs={$1} md={$2}'
    );

    // Fix 4: Handle size={{ xs: 12 }} patterns
    content = content.replace(
      /<Grid\s+size=\{\{\s*xs:\s*(\d+)\s*\}\}/g,
      '<Grid item xs={$1}'
    );

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✓ Fixed ${changes} Grid syntax issues in ${path.basename(filePath)}`);
      totalChanges += changes;
    }

    filesProcessed++;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

// Process directory recursively
function processDirectory(directoryPath) {
  const items = fs.readdirSync(directoryPath);
  
  for (const item of items) {
    const itemPath = path.join(directoryPath, item);
    const stat = fs.statSync(itemPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      processDirectory(itemPath);
    } else if (stat.isFile() && (item.endsWith('.js') || item.endsWith('.jsx'))) {
      processFile(itemPath);
    }
  }
}

// Main execution
const srcPath = path.join(__dirname, 'src');
console.log(`Starting Grid syntax fix for files in ${srcPath}`);
processDirectory(srcPath);
console.log(`\nCompleted: Processed ${filesProcessed} files, made ${totalChanges} changes.`);
