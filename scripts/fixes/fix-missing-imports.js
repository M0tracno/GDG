const fs = require('fs');
const path = require('path');

// Common MUI imports that need to be added
const MUI_CORE_IMPORTS = [
  'Box',
  'Paper',
  'Typography',
  'Button',
  'TextField',
  'Grid',
  'Card',
  'CardContent',
  'CardActions',
  'Container',
  'AppBar',
  'Toolbar',
  'IconButton',
  'MenuItem',
  'Select',
  'FormControl',
  'InputLabel',
  'Chip',
  'Avatar',
  'List',
  'ListItem',
  'ListItemText',
  'ListItemIcon',
  'TableContainer',
  'Table',
  'TableHead',
  'TableBody',
  'TableRow',
  'TableCell',
  'Dialog',
  'DialogTitle',
  'DialogContent',
  'DialogActions',
  'Drawer',
  'Divider',
  'Tab',
  'Tabs',
  'Switch',
  'FormControlLabel',
  'Checkbox',
  'Radio',
  'RadioGroup',
  'Slider',
  'CircularProgress',
  'LinearProgress',
  'Snackbar',
  'Alert',
  'Accordion',
  'AccordionSummary',
  'AccordionDetails',
  'Badge',
  'Tooltip',
  'Backdrop'
];

// MUI Material components that are not in @mui/icons-material
const MUI_MATERIAL_IMPORTS = [
  'CssBaseline',
  'useTheme',
  'ThemeProvider',
  'createTheme',
  'styled',
  'alpha',
  'ScopedCssBaseline'
];

const MUI_ICONS = [
  // Original icons
  'School',
  'Download',
  'VolumeUp',
  'CalendarIcon',
  'FilterIcon',
  'ScheduleIcon',
  'GetApp',
  'CloudUploadIcon',
  'CheckCircleIcon',
  // Missing icons from error messages
  'AddIcon',
  'SaveIcon',
  'HistoryIcon',
  'Refresh',
  'SendIcon',
  'CheckIcon',
  'QuestionIcon',
  'StudentIcon',
  'People',
  'PanTool',
  'Chat',
  'CameraAlt',
  'VideocamOff',
  'Mic',
  'MicOff',
  'VolumeOff',
  'StopScreenShare',
  'ScreenShare',
  'Stop',
  'RecordVoiceOver',
  'ThreeDRotation',
  'FullscreenExit',
  'Fullscreen',  'Settings',
  'AccountCircle',
  'Menu',
  'LogoutIcon',
  'Assignment',
  'Grade',
  'Announcement',
  'Schedule',
  'MarkEmailRead',
  'Delete',
  'ExpandMore',
  'NotificationsActive',
  'Email',
  'Phone',
  'Message',
  'Close',
  'TrendingDownIcon',
  'AssignmentIcon',
  'QuizIcon',
  'StarIcon',
  'CheckCircle',
  'Warning',
  'EventNoteIcon',
  'GradeIcon',
  'EditIcon',
  'CancelIcon',
  'DevicesIcon',
  'LaptopIcon',
  'PaletteIcon',
  'LightModeIcon',
  'DarkModeIcon',
  'NotificationsIcon',
  'LanguageIcon',
  'AccessibilityIcon',
  'SecurityIcon',
  'StorageIcon',
  'BackupIcon',
  'CloseIcon',
  'VpnKeyIcon',
  'DashboardIcon',
  'PeopleIcon',
  'SchoolIcon',
  'BookIcon',
  'ReportsIcon',
  'BarChartIcon',
  'SettingsIcon',
  'MenuIcon',
  'NoteAddIcon',
  'PersonIcon',
  'PersonAddIcon',
  'DeleteIcon',
  'DatabaseIcon',
  'BackupIcon',
  'TrendingUpIcon',
  'ImportExportIcon',
  'EventIcon',
  'RestoreIcon',
  'WarningIcon',
  'LineChartIcon'
];

const MUI_LAB_IMPORTS = [
  'TreeView',
  'TreeItem'
];

function getFilesRecursively(dir, extensions = ['.js', '.jsx']) {
  let results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat && stat.isDirectory()) {
      // Skip node_modules and build directories
      if (!['node_modules', 'build', 'dist', '.git'].includes(file)) {
        results = results.concat(getFilesRecursively(filePath, extensions));
      }
    } else {
      if (extensions.some(ext => file.endsWith(ext))) {
        results.push(filePath);
      }
    }
  });
  
  return results;
}

function analyzeFileForMissingImports(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  // Find existing imports
  const existingImports = {
    mui: new Set(),
    muiIcons: new Set(),
    muiLab: new Set(),
    muiStyles: new Set()  // Added to track style imports like useTheme
  };
  
  let importSectionEnd = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.startsWith('import') && line.includes('@mui/material')) {
      // Extract imported components
      const match = line.match(/import\s*{([^}]+)}\s*from\s*['"]@mui\/material['"]/);
      if (match) {
        const imports = match[1].split(',').map(imp => imp.trim().split(' as ')[0].trim());
        imports.forEach(imp => existingImports.mui.add(imp));
      }
      importSectionEnd = i + 1;
    } else if (line.startsWith('import') && line.includes('@mui/icons-material')) {
      const match = line.match(/import\s*{([^}]+)}\s*from\s*['"]@mui\/icons-material['"]/);
      if (match) {
        const imports = match[1].split(',').map(imp => imp.trim().split(' as ')[0].trim());
        imports.forEach(imp => existingImports.muiIcons.add(imp));
      }
      importSectionEnd = i + 1;    } else if (line.startsWith('import') && line.includes('@mui/lab')) {
      const match = line.match(/import\s*{([^}]+)}\s*from\s*['"]@mui\/lab['"]/);
      if (match) {
        const imports = match[1].split(',').map(imp => imp.trim().split(' as ')[0].trim());
        imports.forEach(imp => existingImports.muiLab.add(imp));
      }
      importSectionEnd = i + 1;
    } else if (line.startsWith('import') && line.includes('@mui/material/styles')) {
      const match = line.match(/import\s*{([^}]+)}\s*from\s*['"]@mui\/material\/styles['"]/);
      if (match) {
        const imports = match[1].split(',').map(imp => imp.trim().split(' as ')[0].trim());
        imports.forEach(imp => existingImports.muiStyles.add(imp));
      }
      importSectionEnd = i + 1;
    } else if (line.startsWith('import')) {
      importSectionEnd = i + 1;
    } else if (line.trim() && !line.startsWith('//') && !line.startsWith('/*')) {
      break; // End of import section
    }
  }
  
  // Find missing imports by checking usage in the file
  const missingImports = {
    mui: new Set(),
    muiIcons: new Set(),
    muiLab: new Set(),
    muiMaterial: new Set()
  };
  
  // Check for MUI core components
  MUI_CORE_IMPORTS.forEach(component => {
    if (!existingImports.mui.has(component)) {
      // Check if component is used in JSX
      const jsxPattern = new RegExp(`<${component}[\\s>]`, 'g');
      if (jsxPattern.test(content)) {
        missingImports.mui.add(component);
      }
    }
  });
  
  // Check for MUI icons
  MUI_ICONS.forEach(icon => {
    if (!existingImports.muiIcons.has(icon)) {
      // Check if icon is used
      const iconPattern = new RegExp(`<${icon}[\\s/>]`, 'g');
      if (iconPattern.test(content)) {
        missingImports.muiIcons.add(icon);
      }
    }
  });
    // Check for MUI lab components
  MUI_LAB_IMPORTS.forEach(component => {
    if (!existingImports.muiLab.has(component)) {
      const labPattern = new RegExp(`<${component}[\\s>]`, 'g');
      if (labPattern.test(content)) {
        missingImports.muiLab.add(component);
      }
    }
  });
  
  // Check for MUI material components
  MUI_MATERIAL_IMPORTS.forEach(component => {
    if (!existingImports.mui.has(component)) {
      const materialPattern = new RegExp(`<${component}[\\s>]`, 'g');
      if (materialPattern.test(content) || content.includes(`${component}`)) {
        missingImports.muiMaterial.add(component);
      }
    }
  });
    // Check for theme usage
  const hasThemeUsage = (content.includes('theme.') || content.includes('theme is not defined')) && 
                        !existingImports.muiStyles.has('useTheme');
  
  return {
    missingImports,
    importSectionEnd,
    hasThemeUsage,
    existingImports
  };
}

function addMissingImports(filePath) {
  const analysis = analyzeFileForMissingImports(filePath);
  const { missingImports, importSectionEnd, hasThemeUsage, existingImports } = analysis;
  
  if (missingImports.mui.size === 0 && missingImports.muiIcons.size === 0 && 
      missingImports.muiLab.size === 0 && missingImports.muiMaterial.size === 0 && !hasThemeUsage) {
    return false; // No missing imports
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  const newImports = [];
  
  // Add MUI core imports
  if (missingImports.mui.size > 0) {
    const allMuiImports = new Set([...existingImports.mui, ...missingImports.mui]);
    const importLine = `import { ${Array.from(allMuiImports).sort().join(', ')} } from '@mui/material';`;
    
    // Remove existing MUI material imports
    const filteredLines = lines.filter(line => 
      !line.trim().startsWith('import') || !line.includes('@mui/material')
    );
    newImports.push(importLine);
  }
  
  // Add MUI icons imports
  if (missingImports.muiIcons.size > 0) {
    const allIconImports = new Set([...existingImports.muiIcons, ...missingImports.muiIcons]);
    const iconImportLine = `import { ${Array.from(allIconImports).sort().join(', ')} } from '@mui/icons-material';`;
    
    // Remove existing MUI icons imports
    const filteredLines = lines.filter(line => 
      !line.trim().startsWith('import') || !line.includes('@mui/icons-material')
    );
    newImports.push(iconImportLine);
  }
  
  // Add MUI lab imports
  if (missingImports.muiLab.size > 0) {
    const allLabImports = new Set([...existingImports.muiLab, ...missingImports.muiLab]);
    const labImportLine = `import { ${Array.from(allLabImports).sort().join(', ')} } from '@mui/lab';`;
    
    // Remove existing MUI lab imports
    const filteredLines = lines.filter(line => 
      !line.trim().startsWith('import') || !line.includes('@mui/lab')
    );
    newImports.push(labImportLine);
  }
  
  // Add useTheme import if theme is used
  if (hasThemeUsage && !content.includes('useTheme')) {
    newImports.push(`import { useTheme } from '@mui/material/styles';`);
  }
  
  if (newImports.length > 0) {
    // Find the best place to insert imports
    let insertIndex = importSectionEnd;
    
    // Rebuild the file content
    const newLines = [...lines];
    
    // Remove old MUI imports
    const cleanedLines = newLines.filter(line => {
      const trimmed = line.trim();
      return !(trimmed.startsWith('import') && 
               (trimmed.includes('@mui/material') || 
                trimmed.includes('@mui/icons-material') || 
                trimmed.includes('@mui/lab')));
    });
    
    // Insert new imports at the beginning after React imports
    let reactImportEnd = 0;
    for (let i = 0; i < cleanedLines.length; i++) {
      if (cleanedLines[i].trim().startsWith('import') && cleanedLines[i].includes('react')) {
        reactImportEnd = i + 1;
      } else if (cleanedLines[i].trim().startsWith('import')) {
        break;
      }
    }
    
    // Insert new imports
    const finalLines = [
      ...cleanedLines.slice(0, reactImportEnd),
      ...newImports,
      ...cleanedLines.slice(reactImportEnd)
    ];
    
    // Add theme hook if needed
    if (hasThemeUsage && !content.includes('const theme = useTheme()')) {
      // Find the function/component start and add theme hook
      const functionStartRegex = /(const|function|export\s+default\s+function|export\s+function)\s+\w+/;
      let addedThemeHook = false;
      
      for (let i = 0; i < finalLines.length; i++) {
        if (functionStartRegex.test(finalLines[i]) && finalLines[i].includes('{')) {
          // Insert theme hook after the opening brace
          finalLines.splice(i + 1, 0, '  const theme = useTheme();');
          addedThemeHook = true;
          break;
        }
      }
    }
    
    const newContent = finalLines.join('\n');
    fs.writeFileSync(filePath, newContent);
    return true;
  }
  
  return false;
}

function main() {
  const srcDir = path.join(__dirname, 'src');
  const files = getFilesRecursively(srcDir);
  
  console.log(`Found ${files.length} files to process...`);
  
  let fixedFiles = 0;
  let totalMissingImports = 0;
  
  files.forEach(filePath => {
    try {
      const relativePath = path.relative(__dirname, filePath);
      const analysis = analyzeFileForMissingImports(filePath);
      const missingCount = analysis.missingImports.mui.size + 
                          analysis.missingImports.muiIcons.size + 
                          analysis.missingImports.muiLab.size +
                          (analysis.hasThemeUsage ? 1 : 0);
      
      if (missingCount > 0) {
        console.log(`${relativePath}: Found ${missingCount} missing imports`);
        if (addMissingImports(filePath)) {
          fixedFiles++;
          totalMissingImports += missingCount;
        }
      }
    } catch (error) {
      console.error(`Error processing ${filePath}:`, error.message);
    }
  });
  
  console.log(`\nFixed ${totalMissingImports} missing imports in ${fixedFiles} files.`);
}

main();
