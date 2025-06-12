#!/usr/bin/env node

/**
 * Fix Incomplete Import Aliases Script
 * Systematically fixes all "as," patterns in import statements
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
 * Fix incomplete import aliases in a file
 */
function fixIncompleteImports(content, filePath) {
  let modified = false;
  let newContent = content;

  // Common incomplete import patterns and their fixes
  const fixPatterns = [
    // Pattern: "as," -> "as [ComponentName],"
    { pattern: /(\w+)\s+as\s*,/g, getReplacementFn: (match, componentName) => `${componentName} as ${componentName}Icon,` },
    
    // Pattern: "as}" -> "as [ComponentName]}"
    { pattern: /(\w+)\s+as\s*}/g, getReplacementFn: (match, componentName) => `${componentName} as ${componentName}Icon}` },
    
    // Specific known patterns from the build errors
    { pattern: /Assignment\s+as\s*,/g, replacement: 'Assignment as AssignmentIcon,' },
    { pattern: /Person\s+as\s*,/g, replacement: 'Person as PersonIcon,' },
    { pattern: /School\s+as\s*,/g, replacement: 'School as SchoolIcon,' },
    { pattern: /Settings\s+as\s*,/g, replacement: 'Settings as SettingsIcon,' },
    { pattern: /Warning\s+as\s*,/g, replacement: 'Warning as WarningIcon,' },
    { pattern: /Warning\s+as\s*}/g, replacement: 'Warning as WarningIcon}' },
    { pattern: /TrendingUp\s+as\s*,/g, replacement: 'TrendingUp as TrendingUpIcon,' },
    { pattern: /FilterList\s+as\s*,/g, replacement: 'FilterList as FilterIcon,' },
    { pattern: /PhoneAndroid\s+as\s*,/g, replacement: 'PhoneAndroid as PhoneIcon,' },
    { pattern: /Schedule\s+as\s*,/g, replacement: 'Schedule as ScheduleIcon,' },
    { pattern: /Book\s+as\s*,/g, replacement: 'Book as BookIcon,' },
    { pattern: /Phone\s+as\s*,/g, replacement: 'Phone as PhoneIcon,' },
    { pattern: /Upload\s+as\s*,/g, replacement: 'Upload as UploadIcon,' },
    { pattern: /CloudUpload\s+as\s+Cloud\s*,/g, replacement: 'CloudUpload as CloudIcon,' },
    
    // Fix malformed closing braces
    { pattern: /CheckCircle\s+as\s*}/g, replacement: 'CheckCircle as CheckIcon}' },
    { pattern: /(\w+)\s+as\s*}\s*from/g, getReplacementFn: (match, componentName) => `${componentName} as ${componentName}Icon} from` },
  ];

  fixPatterns.forEach(({ pattern, replacement, getReplacementFn }) => {
    if (pattern.test(newContent)) {
      if (replacement) {
        newContent = newContent.replace(pattern, replacement);
        modified = true;
      } else if (getReplacementFn) {
        newContent = newContent.replace(pattern, getReplacementFn);
        modified = true;
      }
    }
  });

  // Fix double spaces and formatting issues
  if (modified) {
    // Clean up any double commas
    newContent = newContent.replace(/,,+/g, ',');
    
    // Clean up spaces before commas in imports
    newContent = newContent.replace(/\s+,/g, ',');
    
    // Clean up trailing commas before closing braces
    newContent = newContent.replace(/,\s*}/g, '}');
  }

  return { content: newContent, modified };
}

/**
 * Process a single file
 */
function processFile(filePath) {
  try {
    console.log(`Processing: ${filePath}`);
    
    const originalContent = fs.readFileSync(filePath, 'utf8');
    
    // Skip files that don't have imports
    if (!originalContent.includes('import {') || !originalContent.includes('@mui/icons-material')) {
      return;
    }
    
    const result = fixIncompleteImports(originalContent, filePath);
    
    if (result.modified) {
      fs.writeFileSync(filePath, result.content);
      results.filesFixed++;
      console.log(`  ✓ Fixed incomplete imports`);
    } else {
      console.log(`  ✓ No incomplete imports found`);
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
  console.log('🚀 Starting Incomplete Import Alias Fix\n');
  
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
    console.log(`\n🎉 Fix complete! Fixed ${results.filesFixed} files with incomplete imports.`);
    console.log('Run "npm run build" to verify the fixes.');
  } else {
    console.log('\n✨ No incomplete imports found!');
  }
}

// Run the fix
if (require.main === module) {
  main();
}

module.exports = {
  processFile,
  fixIncompleteImports
};
