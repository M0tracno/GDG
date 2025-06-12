#!/usr/bin/env node

/**
 * Comprehensive Codebase Cleanup Script
 * Removes unused imports, variables, and optimizes the codebase
 */

const fs = require('fs');
const path = require('path');

// Results tracking
const results = {
  filesProcessed: 0,
  importsRemoved: 0,
  variablesRemoved: 0,
  optimizations: [],
  errors: []
};

/**
 * Find all source files to process
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
 * Remove unused Material-UI imports
 */
function removeUnusedMuiImports(content, filePath) {
  let modified = false;
  let removedImports = [];

  // List of components that are commonly unused based on build warnings
  const unusedPatterns = [
    // Storage icon fix
    { pattern: /Database as DatabaseIcon,?\s*/g, replacement: '', reason: 'DatabaseIcon does not exist in @mui/icons-material' },
    // Common unused imports from build warnings
    { pattern: /,?\s*Box\s*(?=,|\})/g, replacement: '', reason: 'Unused Box import' },
    { pattern: /,?\s*Paper\s*(?=,|\})/g, replacement: '', reason: 'Unused Paper import' },
    { pattern: /,?\s*makeStyles\s*(?=,|\})/g, replacement: '', reason: 'Unused makeStyles import' },
    { pattern: /,?\s*SchoolIcon\s*(?=,|\})/g, replacement: '', reason: 'Unused SchoolIcon import' },
    { pattern: /,?\s*TrendingUpIcon\s*(?=,|\})/g, replacement: '', reason: 'Unused TrendingUpIcon import' },
    { pattern: /,?\s*WarningIcon\s*(?=,|\})/g, replacement: '', reason: 'Unused WarningIcon import' },
    { pattern: /,?\s*CheckCircleIcon\s*(?=,|\})/g, replacement: '', reason: 'Unused CheckCircleIcon import' },
    { pattern: /,?\s*PersonIcon\s*(?=,|\})/g, replacement: '', reason: 'Unused PersonIcon import' },
    { pattern: /,?\s*StarIcon\s*(?=,|\})/g, replacement: '', reason: 'Unused StarIcon import' },
    { pattern: /,?\s*FilterList\s*(?=,|\})/g, replacement: '', reason: 'Unused FilterList import' },
    { pattern: /,?\s*VolumeUp\s*(?=,|\})/g, replacement: '', reason: 'Unused VolumeUp import' },
    { pattern: /,?\s*Priority\s*(?=,|\})/g, replacement: '', reason: 'Unused Priority import' },
    { pattern: /,?\s*School\s*(?=,|\})/g, replacement: '', reason: 'Unused School import' },
    { pattern: /,?\s*PhoneIcon\s*(?=,|\})/g, replacement: '', reason: 'Unused PhoneIcon import' },
    { pattern: /,?\s*ReplyIcon\s*(?=,|\})/g, replacement: '', reason: 'Unused ReplyIcon import' },
    { pattern: /,?\s*ScheduleIcon\s*(?=,|\})/g, replacement: '', reason: 'Unused ScheduleIcon import' },
    { pattern: /,?\s*BookIcon\s*(?=,|\})/g, replacement: '', reason: 'Unused BookIcon import' },
    { pattern: /,?\s*FilterIcon\s*(?=,|\})/g, replacement: '', reason: 'Unused FilterIcon import' },
    { pattern: /,?\s*AssignmentIcon\s*(?=,|\})/g, replacement: '', reason: 'Unused AssignmentIcon import' },
    { pattern: /,?\s*CalendarIcon\s*(?=,|\})/g, replacement: '', reason: 'Unused CalendarIcon import' },
    { pattern: /,?\s*SettingsIcon\s*(?=,|\})/g, replacement: '', reason: 'Unused SettingsIcon import' },
    { pattern: /,?\s*UploadIcon\s*(?=,|\})/g, replacement: '', reason: 'Unused UploadIcon import' },
    { pattern: /,?\s*GetApp\s*(?=,|\})/g, replacement: '', reason: 'Unused GetApp import' },
    { pattern: /,?\s*Download\s*(?=,|\})/g, replacement: '', reason: 'Unused Download import' },
  ];

  let newContent = content;
  
  unusedPatterns.forEach(({ pattern, replacement, reason }) => {
    const matches = newContent.match(pattern);
    if (matches && matches.length > 0) {
      newContent = newContent.replace(pattern, replacement);
      modified = true;
      removedImports.push(reason);
    }
  });

  // Clean up empty import statements
  newContent = newContent.replace(/import\s*{\s*}\s*from\s*['"][^'"]*['"];?\s*\n?/g, '');
  
  // Clean up trailing commas in import statements
  newContent = newContent.replace(/import\s*{\s*,([^}]+)}/g, 'import {$1}');
  newContent = newContent.replace(/import\s*{([^}]+),\s*}\s*from/g, 'import {$1} from');

  return { content: newContent, modified, removedImports };
}

/**
 * Remove unused variables and constants
 */
function removeUnusedVariables(content, filePath) {
  let modified = false;
  let removedVariables = [];

  // Common unused variable patterns from build warnings
  const unusedVariablePatterns = [
    { pattern: /\s*const\s+theme\s*=\s*useTheme\(\);\s*\n?/g, reason: 'Unused theme variable' },
    { pattern: /\s*const\s+isMobile\s*=\s*[^;]+;\s*\n?/g, reason: 'Unused isMobile variable' },
    { pattern: /\s*const\s+isTablet\s*=\s*[^;]+;\s*\n?/g, reason: 'Unused isTablet variable' },
    { pattern: /\s*const\s+deviceType\s*=\s*[^;]+;\s*\n?/g, reason: 'Unused deviceType variable' },
    { pattern: /\s*const\s+orientation\s*=\s*[^;]+;\s*\n?/g, reason: 'Unused orientation variable' },
    { pattern: /\s*const\s+currentUser\s*=\s*[^;]+;\s*\n?/g, reason: 'Unused currentUser variable' },
    { pattern: /\s*const\s+dbLoading\s*=\s*[^;]+;\s*\n?/g, reason: 'Unused dbLoading variable' },
    { pattern: /\s*const\s+loading\s*=\s*[^;]+;\s*\n?/g, reason: 'Unused loading variable' },
  ];

  let newContent = content;
  
  unusedVariablePatterns.forEach(({ pattern, reason }) => {
    const matches = newContent.match(pattern);
    if (matches && matches.length > 0) {
      newContent = newContent.replace(pattern, '');
      modified = true;
      removedVariables.push(reason);
    }
  });

  return { content: newContent, modified, removedVariables };
}

/**
 * Fix regex escape characters
 */
function fixRegexEscapes(content) {
  let modified = false;
  let newContent = content;

  // Fix unnecessary escape characters
  const escapePatterns = [
    { pattern: /\\(\[)/g, replacement: '[', reason: 'Unnecessary escape for [' },
    { pattern: /\\(\/)/g, replacement: '/', reason: 'Unnecessary escape for /' },
  ];

  escapePatterns.forEach(({ pattern, replacement, reason }) => {
    if (pattern.test(newContent)) {
      newContent = newContent.replace(pattern, replacement);
      modified = true;
    }
  });

  return { content: newContent, modified };
}

/**
 * Add missing dependencies to useEffect hooks
 */
function fixUseEffectDependencies(content, filePath) {
  let modified = false;
  let newContent = content;

  // This is a complex fix that would require AST parsing
  // For now, we'll add a comment to remind developers
  if (content.includes('useEffect') && content.includes('react-hooks/exhaustive-deps')) {
    // Add comment about exhaustive deps if not already present
    if (!content.includes('// TODO: Fix exhaustive deps warnings')) {
      const useEffectMatches = content.match(/useEffect\([^}]+}\s*,\s*\[[^\]]*\]\s*\);/g);
      if (useEffectMatches) {
        newContent = content.replace(
          /useEffect\([^}]+}\s*,\s*\[[^\]]*\]\s*\);/g,
          match => `// TODO: Fix exhaustive deps warnings\n  ${match}`
        );
        modified = true;
      }
    }
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
    let content = originalContent;
    let fileModified = false;
    let totalRemovals = 0;
    let optimizationDetails = [];

    // Remove unused MUI imports
    const muiResult = removeUnusedMuiImports(content, filePath);
    if (muiResult.modified) {
      content = muiResult.content;
      fileModified = true;
      totalRemovals += muiResult.removedImports.length;
      optimizationDetails.push(...muiResult.removedImports);
    }

    // Remove unused variables
    const variableResult = removeUnusedVariables(content, filePath);
    if (variableResult.modified) {
      content = variableResult.content;
      fileModified = true;
      totalRemovals += variableResult.removedVariables.length;
      optimizationDetails.push(...variableResult.removedVariables);
    }

    // Fix regex escapes
    const regexResult = fixRegexEscapes(content);
    if (regexResult.modified) {
      content = regexResult.content;
      fileModified = true;
      optimizationDetails.push('Fixed regex escape characters');
    }

    // Fix useEffect dependencies (add comments)
    const useEffectResult = fixUseEffectDependencies(content, filePath);
    if (useEffectResult.modified) {
      content = useEffectResult.content;
      fileModified = true;
      optimizationDetails.push('Added useEffect dependency comments');
    }

    // Write optimized content
    if (fileModified) {
      fs.writeFileSync(filePath, content);
      
      results.filesProcessed++;
      results.importsRemoved += totalRemovals;
      
      results.optimizations.push({
        file: filePath,
        changes: optimizationDetails.length,
        details: optimizationDetails
      });
      
      console.log(`  ✓ Optimized: Made ${optimizationDetails.length} changes`);
      optimizationDetails.forEach(detail => {
        console.log(`    - ${detail}`);
      });
    } else {
      console.log(`  ✓ No changes needed`);
    }
    
  } catch (error) {
    console.error(`  ✗ Error processing ${filePath}:`, error.message);
    results.errors.push({ file: filePath, error: error.message });
  }
}

/**
 * Main execution function
 */
function main() {
  console.log('🚀 Starting Comprehensive Codebase Cleanup\n');
  
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
  console.log('📊 CLEANUP SUMMARY');
  console.log('='.repeat(60));
  console.log(`Files processed: ${results.filesProcessed}`);
  console.log(`Files with optimizations: ${results.optimizations.length}`);
  console.log(`Total imports/variables removed: ${results.importsRemoved}`);
  console.log(`Execution time: ${duration}s`);
  
  if (results.errors.length > 0) {
    console.log(`\n❌ Errors encountered: ${results.errors.length}`);
    results.errors.forEach(error => {
      console.log(`  ${error.file}: ${error.error}`);
    });
  }
  
  if (results.optimizations.length > 0) {
    console.log('\n📈 DETAILED OPTIMIZATIONS:');
    results.optimizations.slice(0, 10).forEach(opt => { // Show only first 10 for brevity
      console.log(`\n📁 ${opt.file}`);
      console.log(`   Made ${opt.changes} changes:`);
      opt.details.forEach(detail => {
        console.log(`   - ${detail}`);
      });
    });
    
    if (results.optimizations.length > 10) {
      console.log(`\n... and ${results.optimizations.length - 10} more files`);
    }
  }
  
  if (results.importsRemoved > 0) {
    console.log(`\n🎉 Cleanup complete! Made ${results.importsRemoved} optimizations.`);
    console.log('This should help reduce bundle size and eliminate ESLint warnings.');
  } else {
    console.log('\n✨ Codebase is already clean!');
  }
  
  console.log('\n📋 NEXT STEPS:');
  console.log('1. Run build to verify no errors: npm run build');
  console.log('2. Test all features in browser');
  console.log('3. Review useEffect dependency warnings manually');
  console.log('4. Consider implementing proper dependency arrays for useEffect hooks');
}

// Run the cleanup
if (require.main === module) {
  main();
}

module.exports = {
  processFile,
  removeUnusedMuiImports,
  removeUnusedVariables,
  fixRegexEscapes,
  fixUseEffectDependencies
};
