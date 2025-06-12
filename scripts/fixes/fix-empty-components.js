#!/usr/bin/env node

/**
 * Fix Empty Component Attributes Script
 * Fixes component={} patterns in JSX
 */

const fs = require('fs');
const path = require('path');

const results = {
  filesProcessed: 0,
  filesFixed: 0,
  errors: []
};

/**
 * Find all JS/JSX files to process
 */
function findSourceFiles(dir = './src', files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory() && !['node_modules', 'build', '.git'].includes(entry.name)) {
      findSourceFiles(fullPath, files);
    } else if (entry.isFile() && /\.(js|jsx|ts|tsx)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }
  
  return files;
}

/**
 * Fix empty component attributes
 */
function fixEmptyComponents(content, filePath) {
  let modified = false;
  let newContent = content;

  // Check if Paper is imported, if not add it
  const needsPaperImport = /component=\{\s*\}/.test(content) && 
                          !/Paper/.test(content) && 
                          /@mui\/material/.test(content);

  if (needsPaperImport) {
    // Add Paper to existing @mui/material import
    const materialImportMatch = content.match(/import\s*\{\s*([^}]+)\s*\}\s*from\s*['"]@mui\/material['"]/);
    if (materialImportMatch) {
      const existingImports = materialImportMatch[1];
      if (!existingImports.includes('Paper')) {
        const newImports = existingImports + ', Paper';
        newContent = newContent.replace(
          /import\s*\{\s*([^}]+)\s*\}\s*from\s*['"]@mui\/material['"]/,
          `import { ${newImports} } from '@mui/material'`
        );
        modified = true;
      }
    }
  }

  // Fix empty component attributes
  const patterns = [
    { pattern: /component=\{\s*\}/g, replacement: 'component={Paper}' },
    { pattern: /component=\{\}/g, replacement: 'component={Paper}' },
  ];

  patterns.forEach(({ pattern, replacement }) => {
    if (pattern.test(newContent)) {
      newContent = newContent.replace(pattern, replacement);
      modified = true;
    }
  });

  return { content: newContent, modified };
}

/**
 * Process a single file
 */
function processFile(filePath) {
  try {
    console.log(`Processing: ${filePath}`);
    
    const originalContent = fs.readFileSync(filePath, 'utf8');
    
    // Skip files that don't have empty component attributes
    if (!/component=\{\s*\}/.test(originalContent)) {
      return;
    }
    
    const result = fixEmptyComponents(originalContent, filePath);
    
    if (result.modified) {
      fs.writeFileSync(filePath, result.content);
      results.filesFixed++;
      console.log(`  ✓ Fixed empty component attributes`);
    } else {
      console.log(`  ✓ No changes needed`);
    }
    
    results.filesProcessed++;
    
  } catch (error) {
    console.error(`  ✗ Error processing ${filePath}:`, error.message);
    results.errors.push({ file: filePath, error: error.message });
  }
}

/**
 * Main execution function
 */
function main() {
  console.log('🚀 Starting Empty Component Attributes Fix\n');
  
  const startTime = Date.now();
  const sourceFiles = findSourceFiles();
  
  console.log(`Found ${sourceFiles.length} source files\n`);
  
  // Process each file
  for (const file of sourceFiles) {
    processFile(file);
  }
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 FIX SUMMARY');
  console.log('='.repeat(60));
  console.log(`Files processed: ${results.filesProcessed}`);
  console.log(`Files fixed: ${results.filesFixed}`);
  console.log(`Execution time: ${duration}s`);
  
  if (results.errors.length > 0) {
    console.log(`\n❌ Errors encountered: ${results.errors.length}`);
    results.errors.forEach(error => {
      console.log(`  ${error.file}: ${error.error}`);
    });
  }
  
  if (results.filesFixed > 0) {
    console.log(`\n🎉 Fix complete! Fixed ${results.filesFixed} files with empty component attributes.`);
    console.log('Run "npm run build" to verify the fixes.');
  } else {
    console.log('\n✨ No empty component attributes found!');
  }
}

// Run the fix
if (require.main === module) {
  main();
}

module.exports = {
  processFile,
  fixEmptyComponents
};
