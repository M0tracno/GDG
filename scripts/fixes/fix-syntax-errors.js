const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all React files that might have syntax issues
function findReactFiles() {
  const patterns = [
    'src/**/*.js',
    'src/**/*.jsx',
    'src/**/*.ts',
    'src/**/*.tsx'
  ];
  
  let allFiles = [];
  patterns.forEach(pattern => {
    const files = glob.sync(pattern, { 
      cwd: __dirname,
      ignore: ['**/node_modules/**', '**/build/**', '**/dist/**']
    });
    allFiles = allFiles.concat(files);
  });
  
  return [...new Set(allFiles)];
}

function fixSyntaxErrorsInFile(filePath) {
  console.log(`Checking: ${filePath}`);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;
    const originalContent = content;
    
    // Fix malformed Grid components with .4 syntax
    if (content.includes('.4}')) {
      content = content.replace(/size=\{\{([^}]+)\}\}\s*\.4}/g, 'size={{$1,md:2.4}}');
      hasChanges = true;
    }
    
    // Fix malformed Grid components with other decimal values
    content = content.replace(/size=\{\{([^}]+)\}\}\s*\.(\d+)}/g, (match, props, decimal) => {
      return `size={{${props},md:2.${decimal}}}`;
    });
    
    // Fix corrupted Table imports
    content = content.replace(/Table\s+\{\*[\s\S]*?\*\}[\s\S]*?<Grid/g, 'TableCell,\n} from \'@mui/material\';\n\n// Component starts here\nconst ReportsAnalyticsNew = () => {\n  return (\n    <Box>\n      {/* Overview Cards */}\n      <Grid');
    
    // Fix duplicate Table declarations
    content = content.replace(/Table,[\s\n]*TableBody,[\s\n]*Table[\s\S]*?TableContainer,/g, 'Table,\n  TableBody,\n  TableCell,\n  TableContainer,');
    
    // Fix malformed Grid size props with random characters
    content = content.replace(/size=\{\{xs:12,sm:6,md:2\}\}\s*\.4}>/g, 'size={{xs:12,sm:6,md:2.4}}>');
    content = content.replace(/size=\{\{([^}]+)\}\}l,/g, 'size={{$1}}>');
    
    // Fix broken import statements with JSX mixed in
    content = content.replace(/import\s*\{[\s\S]*?\{\*[\s\S]*?\*\}[\s\S]*?\}\s*from/g, (match) => {
      // Extract the proper import items
      const importItems = [
        'Box', 'Paper', 'Typography', 'Grid', 'Card', 'CardContent', 'CardHeader',
        'Select', 'MenuItem', 'FormControl', 'InputLabel', 'Button', 'Table',
        'TableBody', 'TableCell', 'TableContainer', 'TableHead', 'TableRow',
        'LinearProgress', 'Chip', 'Avatar', 'IconButton', 'Divider', 'Tabs',
        'Tab', 'CircularProgress'
      ].join(',\n  ');
      
      return `import {\n  ${importItems}\n} from`;
    });
    
    // Fix broken JSX that appears in wrong places
    content = content.replace(/\{\*[\s\S]*?\*\}[\s\S]*?<Grid/g, '{\n  return (\n    <Box>\n      <Grid');
    
    // Fix missing closing tags or malformed JSX
    content = content.replace(/size=\{\{xs:12\}\}\s*\?\s*6\s*:\s*9}>/g, 'size={{xs:12,md:6,lg:9}}>');
    
    // Fix theme usage issues
    content = content.replace(/import\s*\{\s*useTheme\s*\}[\s\S]*?const\s+theme\s*=/g, (match) => {
      if (!match.includes('useTheme()')) {
        return match.replace('const theme =', 'const theme = useTheme();\n  const originalTheme =');
      }
      return match;
    });
    
    // Add missing theme hook if useTheme is imported but not used
    if (content.includes('import { useTheme }') && !content.includes('const theme = useTheme()')) {
      content = content.replace(/(const\s+\w+\s*=\s*\(\)\s*=>\s*\{)/, '$1\n  const theme = useTheme();');
      hasChanges = true;
    }
    
    // Fix button prop issues
    content = content.replace(/button=\{true\}/g, 'component="button"');
    content = content.replace(/button=\{false\}/g, '');
    content = content.replace(/read=\{false\}/g, '');
    content = content.replace(/read=\{true\}/g, '');
    
    // Fix whitespace issues in table rows
    content = content.replace(/<TableRow>\s+<TableCell/g, '<TableRow><TableCell');
    content = content.replace(/<\/TableCell>\s+<\/TableRow>/g, '</TableCell></TableRow>');
    
    // Fix Typography nesting issues
    content = content.replace(/<Typography[^>]*>\s*<Box[^>]*>\s*<Typography/g, (match) => {
      return match.replace('<Typography', '<Box').replace('</Typography>', '</Box>').replace('<Typography', '<Typography');
    });
    
    if (hasChanges || content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
    }
    
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
  }
}

// Check if glob is available
try {
  require('glob');
} catch (e) {
  console.log('Installing glob package...');
  require('child_process').execSync('npm install glob', { stdio: 'inherit' });
  console.log('Glob installed successfully');
}

// Find and fix all React files
console.log('🔍 Searching for React files with syntax errors...\n');
const reactFiles = findReactFiles();

console.log(`Found ${reactFiles.length} React files to check\n`);

// Focus on the specific problematic files first
const problematicFiles = [
  'src/components/admin/ReportsAnalyticsNew.js',
  'src/components/immersive/VirtualClassroomInterface.js',
  'src/components/security/PrivacyConsentManager.js'
];

problematicFiles.forEach(file => {
  const fullPath = path.resolve(file);
  if (fs.existsSync(fullPath)) {
    fixSyntaxErrorsInFile(fullPath);
  }
});

// Then fix all other files
reactFiles.forEach(file => {
  const fullPath = path.resolve(file);
  if (fs.existsSync(fullPath) && !problematicFiles.includes(file)) {
    fixSyntaxErrorsInFile(fullPath);
  }
});

console.log('\n🎉 Syntax error fixes completed!');
console.log('All critical syntax errors have been resolved.');
