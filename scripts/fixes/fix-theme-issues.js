const fs = require('fs');
const path = require('path');

// Files with theme-related issues
const FILES_WITH_THEME_ISSUES = [
  'src/components/security/MFASetupDialog.js',
  'src/components/security/PrivacyConsentManager.js',
  'src/components/security/SecurityDashboard.js',
  'src/pages/Phase2TestPage.js',
  'src/pages/Phase5SecurityTestPage.js'
];

function fixThemeIssues(filePath) {
  console.log(`Fixing theme issues in ${filePath}`);
  const fullPath = path.join(__dirname, filePath);
  
  try {
    if (!fs.existsSync(fullPath)) {
      console.log(`File not found: ${fullPath}`);
      return false;
    }
    
    const content = fs.readFileSync(fullPath, 'utf8');
    const lines = content.split('\n');
    
    // Check if useTheme is already imported
    let hasUseThemeImport = content.includes('useTheme') && content.includes('@mui/material/styles');
    
    // Add the import if needed
    let updatedContent = content;
    if (!hasUseThemeImport) {
      // Find a good place to add the import
      const importRegex = /import .* from/;
      const lastImportIndex = lines.findIndex((line, i, array) => 
        importRegex.test(line) && 
        (i === array.length - 1 || !importRegex.test(array[i + 1]))
      );
      
      if (lastImportIndex !== -1) {
        // Add import after the last import
        const newImport = 'import { useTheme } from \'@mui/material/styles\';';
        const updatedLines = [
          ...lines.slice(0, lastImportIndex + 1),
          newImport,
          ...lines.slice(lastImportIndex + 1)
        ];
        updatedContent = updatedLines.join('\n');
      } else {
        // Add import at the beginning
        updatedContent = `import { useTheme } from '@mui/material/styles';\n${content}`;
      }
    }
    
    // Find component function and add theme hook if needed
    if (!content.includes('const theme = useTheme()')) {
      const componentFunctionRegex = /(export\s+default\s+function|export\s+function|function|const)\s+(\w+)\s*\([^)]*\)\s*\{/;
      const componentMatch = updatedContent.match(componentFunctionRegex);
      
      if (componentMatch) {
        const functionPos = componentMatch.index + componentMatch[0].length;
        const beforeFunction = updatedContent.substring(0, functionPos);
        const afterFunction = updatedContent.substring(functionPos);
        
        updatedContent = `${beforeFunction}\n  const theme = useTheme();${afterFunction}`;
      }
    }
    
    // Replace direct references to 'theme' with 'theme.'
    updatedContent = updatedContent.replace(/theme is not defined/g, 'theme.palette');
    
    // Write the changes back to the file
    fs.writeFileSync(fullPath, updatedContent);
    return true;
  } catch (error) {
    console.error(`Error fixing theme issues in ${filePath}:`, error);
    return false;
  }
}

function main() {
  console.log('Fixing theme-related ESLint issues...');
  
  let fixedFiles = 0;
  
  // Check if files exist
  console.log('Checking for files:');
  FILES_WITH_THEME_ISSUES.forEach(file => {
    const fullPath = path.join(__dirname, file);
    console.log(`${file}: ${fs.existsSync(fullPath) ? 'Exists' : 'Not found'}`);
  });
  
  FILES_WITH_THEME_ISSUES.forEach(file => {
    if (fixThemeIssues(file)) {
      fixedFiles++;
    }
  });
  
  console.log(`\nFixed theme issues in ${fixedFiles} files.`);
}

main();
