#!/usr/bin/env node

/**
 * Comprehensive MUI Import Fixer
 * 
 * This script analyzes React components and adds missing MUI imports based on usage.
 */

const fs = require('fs');
const path = require('path');

let filesProcessed = 0;
let totalImportsAdded = 0;

// Common MUI components mapping
const muiComponents = {
  // Layout
  'Box': '@mui/material',
  'Container': '@mui/material',
  'Grid': '@mui/material',
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
  'InputAdornment': '@mui/material',
  'FormHelperText': '@mui/material',
  
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
  'TablePagination': '@mui/material',
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
  'useMediaQuery': '@mui/material'
};

// Style-related imports
const styleImports = {
  'styled': '@mui/material/styles',
  'useTheme': '@mui/material/styles',
  'createTheme': '@mui/material/styles',
  'ThemeProvider': '@mui/material/styles',
  'alpha': '@mui/material/styles',
  'darken': '@mui/material/styles',
  'lighten': '@mui/material/styles'
};

// Lab components
const labComponents = {
  'Timeline': '@mui/lab',
  'TimelineItem': '@mui/lab',
  'TimelineContent': '@mui/lab',
  'TimelineDot': '@mui/lab',
  'TimelineOppositeContent': '@mui/lab',
  'TimelineSeparator': '@mui/lab',
  'TreeView': '@mui/lab',
  'TreeItem': '@mui/lab'
};

// Extract existing imports from file content
function extractCurrentImports(content) {
  const imports = {
    mui: new Set(),
    muiStyles: new Set(),
    muiLab: new Set(),
    other: new Set()
  };
  
  // Match MUI Material imports
  const muiRegex = /import\s*{\s*([^}]+)\s*}\s*from\s*['"]@mui\/material['"]/g;
  let match;
  while ((match = muiRegex.exec(content)) !== null) {
    const importList = match[1].split(',').map(imp => imp.trim()).filter(Boolean);
    importList.forEach(imp => imports.mui.add(imp));
  }
  
  // Match MUI Styles imports
  const stylesRegex = /import\s*{\s*([^}]+)\s*}\s*from\s*['"]@mui\/material\/styles['"]/g;
  while ((match = stylesRegex.exec(content)) !== null) {
    const importList = match[1].split(',').map(imp => imp.trim()).filter(Boolean);
    importList.forEach(imp => imports.muiStyles.add(imp));
  }
  
  // Match MUI Lab imports
  const labRegex = /import\s*{\s*([^}]+)\s*}\s*from\s*['"]@mui\/lab['"]/g;
  while ((match = labRegex.exec(content)) !== null) {
    const importList = match[1].split(',').map(imp => imp.trim()).filter(Boolean);
    importList.forEach(imp => imports.muiLab.add(imp));
  }
  
  return imports;
}

// Extract used components from file content
function extractUsedComponents(content) {
  const usedComponents = new Set();
  
  // Find JSX components: <ComponentName
  const jsxRegex = /<(\w+)/g;
  let match;
  while ((match = jsxRegex.exec(content)) !== null) {
    const component = match[1];
    if (muiComponents[component] || styleImports[component] || labComponents[component]) {
      usedComponents.add(component);
    }
  }
  
  // Find function calls: ComponentName(
  const functionCallRegex = /(\w+)\s*\(/g;
  while ((match = functionCallRegex.exec(content)) !== null) {
    const component = match[1];
    if (muiComponents[component] || styleImports[component] || labComponents[component]) {
      usedComponents.add(component);
    }
  }
  
  // Find property access: theme.spacing, alpha(), etc.
  const propertyRegex = /(\w+)\s*\./g;
  while ((match = propertyRegex.exec(content)) !== null) {
    const component = match[1];
    if (muiComponents[component] || styleImports[component] || labComponents[component]) {
      usedComponents.add(component);
    }
  }
  
  return Array.from(usedComponents);
}

// Generate import statements for missing components
function generateMissingImports(usedComponents, currentImports) {
  const missing = {
    mui: [],
    muiStyles: [],
    muiLab: []
  };
  
  usedComponents.forEach(component => {
    if (muiComponents[component] && !currentImports.mui.has(component)) {
      missing.mui.push(component);
    } else if (styleImports[component] && !currentImports.muiStyles.has(component)) {
      missing.muiStyles.push(component);
    } else if (labComponents[component] && !currentImports.muiLab.has(component)) {
      missing.muiLab.push(component);
    }
  });
  
  const importStatements = [];
  
  if (missing.mui.length > 0) {
    importStatements.push(`import { ${missing.mui.sort().join(', ')} } from '@mui/material';`);
  }
  
  if (missing.muiStyles.length > 0) {
    importStatements.push(`import { ${missing.muiStyles.sort().join(', ')} } from '@mui/material/styles';`);
  }
  
  if (missing.muiLab.length > 0) {
    importStatements.push(`import { ${missing.muiLab.sort().join(', ')} } from '@mui/lab';`);
  }
  
  return importStatements;
}

// Process a single file
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Skip files that don't seem to be React components
    if (!content.includes('import') || !content.includes('React')) {
      return;
    }
    
    const currentImports = extractCurrentImports(content);
    const usedComponents = extractUsedComponents(content);
    const missingImports = generateMissingImports(usedComponents, currentImports);
    
    if (missingImports.length === 0) {
      filesProcessed++;
      return;
    }
    
    // Find the position to insert imports (after existing imports)
    const importRegex = /import.*from.*['"][^'"]*['"];\s*\n/g;
    let lastImportEnd = 0;
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      lastImportEnd = match.index + match[0].length;
    }
    
    // If no imports found, insert at the beginning
    if (lastImportEnd === 0) {
      const reactImportMatch = content.match(/import.*React.*\n/);
      if (reactImportMatch) {
        lastImportEnd = reactImportMatch.index + reactImportMatch[0].length;
      }
    }
    
    // Insert the missing imports
    const beforeImports = content.substring(0, lastImportEnd);
    const afterImports = content.substring(lastImportEnd);
    const newImports = missingImports.join('\n') + '\n';
    
    const newContent = beforeImports + newImports + afterImports;
    
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`✓ Added ${missingImports.length} import(s) to ${path.basename(filePath)}`);
    totalImportsAdded += missingImports.length;
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
console.log(`Starting MUI import fix for files in ${srcPath}`);
processDirectory(srcPath);
console.log(`\nCompleted: Processed ${filesProcessed} files, added ${totalImportsAdded} imports.`);
