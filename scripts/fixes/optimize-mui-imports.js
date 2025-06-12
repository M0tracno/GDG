#!/usr/bin/env node

/**
 * Material-UI Import Optimization Script
 * 
 * This script analyzes React components and optimizes Material-UI imports by:
 * 1. Identifying unused imports
 * 2. Organizing imports efficiently
 * 3. Reducing bundle size
 * 4. Improving code readability
 */

const fs = require('fs');
const path = require('path');

// Track optimization results
const results = {
  filesProcessed: 0,
  importsRemoved: 0,
  importsSaved: 0,
  errors: [],
  optimizations: []
};

// Common Material-UI components mapping
const muiComponents = {
  // Layout
  'Box': '@mui/material',
  'Container': '@mui/material',
  'Grid': '@mui/material',
  'Grid2': '@mui/material',
  'Stack': '@mui/material',
  
  // Inputs
  'Button': '@mui/material',
  'IconButton': '@mui/material',
  'TextField': '@mui/material',
  'Select': '@mui/material',
  'MenuItem': '@mui/material',
  'FormControl': '@mui/material',
  'FormControlLabel': '@mui/material',
  'InputLabel': '@mui/material',
  'Checkbox': '@mui/material',
  'Radio': '@mui/material',
  'Switch': '@mui/material',
  'Slider': '@mui/material',
  'Rating': '@mui/material',
  'Autocomplete': '@mui/material',
  'Fab': '@mui/material',
  
  // Data Display
  'Typography': '@mui/material',
  'Avatar': '@mui/material',
  'Badge': '@mui/material',
  'Chip': '@mui/material',
  'Divider': '@mui/material',
  'List': '@mui/material',
  'ListItem': '@mui/material',
  'ListItemText': '@mui/material',
  'ListItemIcon': '@mui/material',
  'ListItemAvatar': '@mui/material',
  'ListItemButton': '@mui/material',
  'Table': '@mui/material',
  'TableBody': '@mui/material',
  'TableCell': '@mui/material',
  'TableContainer': '@mui/material',
  'TableHead': '@mui/material',
  'TableRow': '@mui/material',
  'Tooltip': '@mui/material',
  
  // Feedback
  'Alert': '@mui/material',
  'CircularProgress': '@mui/material',
  'LinearProgress': '@mui/material',
  'Skeleton': '@mui/material',
  'Snackbar': '@mui/material',
  
  // Surfaces
  'Accordion': '@mui/material',
  'AccordionSummary': '@mui/material',
  'AccordionDetails': '@mui/material',
  'AppBar': '@mui/material',
  'Card': '@mui/material',
  'CardActions': '@mui/material',
  'CardContent': '@mui/material',
  'CardHeader': '@mui/material',
  'CardMedia': '@mui/material',
  'Paper': '@mui/material',
  'Toolbar': '@mui/material',
  
  // Navigation
  'BottomNavigation': '@mui/material',
  'BottomNavigationAction': '@mui/material',
  'Breadcrumbs': '@mui/material',
  'Drawer': '@mui/material',
  'Link': '@mui/material',
  'Menu': '@mui/material',
  'MenuList': '@mui/material',
  'Pagination': '@mui/material',
  'SpeedDial': '@mui/material',
  'SpeedDialAction': '@mui/material',
  'SpeedDialIcon': '@mui/material',
  'Step': '@mui/material',
  'StepLabel': '@mui/material',
  'Stepper': '@mui/material',
  'Tab': '@mui/material',
  'Tabs': '@mui/material',
  
  // Utils
  'Dialog': '@mui/material',
  'DialogActions': '@mui/material',
  'DialogContent': '@mui/material',
  'DialogContentText': '@mui/material',
  'DialogTitle': '@mui/material',
  'Modal': '@mui/material',
  'Popover': '@mui/material',
  'Popper': '@mui/material',
  'Grow': '@mui/material',
  'Fade': '@mui/material',
  'Slide': '@mui/material',
  'Zoom': '@mui/material',
  'Collapse': '@mui/material',
  'ClickAwayListener': '@mui/material',
  'Portal': '@mui/material',
  'TextareaAutosize': '@mui/material',
  'useScrollTrigger': '@mui/material',
  'CssBaseline': '@mui/material',
  'ScopedCssBaseline': '@mui/material',
  'GlobalStyles': '@mui/material',
  'useMediaQuery': '@mui/material',
  
  // Lab components (commonly used)
  'Timeline': '@mui/lab',
  'TimelineItem': '@mui/lab',
  'TimelineContent': '@mui/lab',
  'TimelineDot': '@mui/lab',
  'TimelineOppositeContent': '@mui/lab',
  'TimelineSeparator': '@mui/lab',
  'TreeView': '@mui/lab',
  'TreeItem': '@mui/lab'
};

// Style-related imports
const styleImports = {
  'styled': '@mui/material/styles',
  'useTheme': '@mui/material/styles',
  'createTheme': '@mui/material/styles',
  'ThemeProvider': '@mui/material/styles',
  'makeStyles': '@mui/styles',
  'withStyles': '@mui/styles',
  'alpha': '@mui/material/styles',
  'darken': '@mui/material/styles',
  'lighten': '@mui/material/styles'
};

/**
 * Find all JavaScript/TypeScript files in the src directory
 */
function findSourceFiles(dir = './src', files = []) {
  if (!fs.existsSync(dir)) {
    console.log(`Directory ${dir} does not exist.`);
    return files;
  }

  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Skip node_modules and other irrelevant directories
      if (!['node_modules', '.git', 'build', 'dist', 'coverage'].includes(item)) {
        findSourceFiles(fullPath, files);
      }
    } else if (stat.isFile() && /\.(js|jsx|ts|tsx)$/.test(item)) {
      files.push(fullPath);
    }
  }
  
  return files;
}

/**
 * Extract used components from file content
 */
function extractUsedComponents(content) {
  const usedComponents = new Set();
  
  // Find JSX components: <ComponentName
  const jsxRegex = /<(\w+)/g;
  let match;
  while ((match = jsxRegex.exec(content)) !== null) {
    const component = match[1];
    if (muiComponents[component] || styleImports[component]) {
      usedComponents.add(component);
    }
  }
  
  // Find function calls: ComponentName(
  const functionCallRegex = /(\w+)\s*\(/g;
  while ((match = functionCallRegex.exec(content)) !== null) {
    const component = match[1];
    if (muiComponents[component] || styleImports[component]) {
      usedComponents.add(component);
    }
  }
  
  // Find property access: theme.spacing, alpha(), etc.
  const propertyRegex = /(\w+)\s*\./g;
  while ((match = propertyRegex.exec(content)) !== null) {
    const component = match[1];
    if (muiComponents[component] || styleImports[component]) {
      usedComponents.add(component);
    }
  }
  
  return Array.from(usedComponents);
}

/**
 * Extract current imports from file content
 */
function extractCurrentImports(content) {
  const imports = {
    mui: [],
    muiStyles: [],
    muiLab: [],
    muiIcons: [],
    other: []
  };
  
  // Match MUI Material imports
  const muiRegex = /import\s*{\s*([^}]+)\s*}\s*from\s*['"]@mui\/material['"]/g;
  let match;
  while ((match = muiRegex.exec(content)) !== null) {
    const importList = match[1].split(',').map(imp => imp.trim()).filter(Boolean);
    imports.mui.push(...importList);
  }
  
  // Match MUI Styles imports
  const stylesRegex = /import\s*{\s*([^}]+)\s*}\s*from\s*['"]@mui\/material\/styles['"]/g;
  while ((match = stylesRegex.exec(content)) !== null) {
    const importList = match[1].split(',').map(imp => imp.trim()).filter(Boolean);
    imports.muiStyles.push(...importList);
  }
  
  // Match MUI Lab imports
  const labRegex = /import\s*{\s*([^}]+)\s*}\s*from\s*['"]@mui\/lab['"]/g;
  while ((match = labRegex.exec(content)) !== null) {
    const importList = match[1].split(',').map(imp => imp.trim()).filter(Boolean);
    imports.muiLab.push(...importList);
  }
  
  // Match MUI Icons imports
  const iconsRegex = /import\s*{\s*([^}]+)\s*}\s*from\s*['"]@mui\/icons-material['"]/g;
  while ((match = iconsRegex.exec(content)) !== null) {
    const importList = match[1].split(',').map(imp => imp.trim()).filter(Boolean);
    imports.muiIcons.push(...importList);
  }
  
  return imports;
}

/**
 * Generate optimized import statements
 */
function generateOptimizedImports(usedComponents, currentImports) {
  const optimizedImports = [];
  const usedSet = new Set(usedComponents);
  
  // Filter MUI Material imports
  const usedMuiComponents = currentImports.mui.filter(comp => {
    const cleanComp = comp.replace(/\s+as\s+\w+/g, '').trim();
    return usedSet.has(cleanComp);
  });
  
  if (usedMuiComponents.length > 0) {
    optimizedImports.push(`import { ${usedMuiComponents.sort().join(', ')} } from '@mui/material';`);
  }
  
  // Filter MUI Styles imports
  const usedStyleComponents = currentImports.muiStyles.filter(comp => {
    const cleanComp = comp.replace(/\s+as\s+\w+/g, '').trim();
    return usedSet.has(cleanComp);
  });
  
  if (usedStyleComponents.length > 0) {
    optimizedImports.push(`import { ${usedStyleComponents.sort().join(', ')} } from '@mui/material/styles';`);
  }
  
  // Filter MUI Lab imports
  const usedLabComponents = currentImports.muiLab.filter(comp => {
    const cleanComp = comp.replace(/\s+as\s+\w+/g, '').trim();
    return usedSet.has(cleanComp);
  });
  
  if (usedLabComponents.length > 0) {
    optimizedImports.push(`import { ${usedLabComponents.sort().join(', ')} } from '@mui/lab';`);
  }
  
  return optimizedImports;
}

/**
 * Process a single file
 */
function processFile(filePath) {
  try {
    console.log(`Processing: ${filePath}`);
    
    const content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Skip if no MUI imports
    if (!/@mui\//.test(content)) {
      return;
    }
    
    const usedComponents = extractUsedComponents(content);
    const currentImports = extractCurrentImports(content);
    
    // Calculate total current imports
    const totalCurrentImports = 
      currentImports.mui.length + 
      currentImports.muiStyles.length + 
      currentImports.muiLab.length;
    
    if (totalCurrentImports === 0) {
      return;
    }
    
    // Generate optimized imports
    const optimizedImports = generateOptimizedImports(usedComponents, currentImports);
    
    // Calculate unused imports
    const usedMuiSet = new Set(usedComponents);
    const unusedMui = currentImports.mui.filter(comp => {
      const cleanComp = comp.replace(/\s+as\s+\w+/g, '').trim();
      return !usedMuiSet.has(cleanComp);
    });
    
    const unusedStyles = currentImports.muiStyles.filter(comp => {
      const cleanComp = comp.replace(/\s+as\s+\w+/g, '').trim();
      return !usedMuiSet.has(cleanComp);
    });
    
    const totalUnused = unusedMui.length + unusedStyles.length;
    
    if (totalUnused === 0) {
      console.log(`  ✓ Already optimized (${totalCurrentImports} imports)`);
      return;
    }
    
    // Remove existing MUI imports
    let newContent = content
      .replace(/import\s*{\s*[^}]+\s*}\s*from\s*['"]@mui\/material['"]\s*;?\s*\n?/g, '')
      .replace(/import\s*{\s*[^}]+\s*}\s*from\s*['"]@mui\/material\/styles['"]\s*;?\s*\n?/g, '')
      .replace(/import\s*{\s*[^}]+\s*}\s*from\s*['"]@mui\/lab['"]\s*;?\s*\n?/g, '');
    
    // Find the position to insert optimized imports (after React import)
    const reactImportMatch = newContent.match(/import React[^;]*;/);
    if (reactImportMatch && optimizedImports.length > 0) {
      const insertPosition = reactImportMatch.index + reactImportMatch[0].length;
      newContent = 
        newContent.slice(0, insertPosition) + 
        '\n' + optimizedImports.join('\n') + 
        newContent.slice(insertPosition);
    }
    
    // Write optimized content
    if (newContent !== originalContent) {
      fs.writeFileSync(filePath, newContent);
      
      results.filesProcessed++;
      results.importsRemoved += totalUnused;
      results.importsSaved += totalCurrentImports - (totalCurrentImports - totalUnused);
      
      results.optimizations.push({
        file: filePath,
        removed: totalUnused,
        unusedComponents: [...unusedMui, ...unusedStyles]
      });
      
      console.log(`  ✓ Optimized: Removed ${totalUnused} unused imports`);
      if (unusedMui.length > 0) {
        console.log(`    Unused MUI: ${unusedMui.join(', ')}`);
      }
      if (unusedStyles.length > 0) {
        console.log(`    Unused Styles: ${unusedStyles.join(', ')}`);
      }
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
  console.log('🚀 Starting Material-UI Import Optimization\n');
  
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
  console.log('📊 OPTIMIZATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`Files processed: ${results.filesProcessed}`);
  console.log(`Files with optimizations: ${results.optimizations.length}`);
  console.log(`Total imports removed: ${results.importsRemoved}`);
  console.log(`Execution time: ${duration}s`);
  
  if (results.errors.length > 0) {
    console.log(`\n❌ Errors encountered: ${results.errors.length}`);
    results.errors.forEach(error => {
      console.log(`  ${error.file}: ${error.error}`);
    });
  }
  
  if (results.optimizations.length > 0) {
    console.log('\n📈 DETAILED OPTIMIZATIONS:');
    results.optimizations.forEach(opt => {
      console.log(`\n📁 ${opt.file}`);
      console.log(`   Removed ${opt.removed} unused imports:`);
      opt.unusedComponents.forEach(comp => {
        console.log(`   - ${comp}`);
      });
    });
  }
  
  if (results.importsRemoved > 0) {
    console.log(`\n🎉 Optimization complete! Removed ${results.importsRemoved} unused imports.`);
    console.log('This should help reduce bundle size and improve build times.');
  } else {
    console.log('\n✨ All imports are already optimized!');
  }
}

// Run the optimization
if (require.main === module) {
  main();
}

module.exports = {
  processFile,
  extractUsedComponents,
  extractCurrentImports,
  generateOptimizedImports
};
