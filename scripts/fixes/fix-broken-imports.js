const fs = require('fs');
const path = require('path');

// List of files with broken import structures
const filesToFix = [
  'src/components/security/SecurityDashboard.js',
  'src/components/security/SecurityIntegrationExample.js', 
  'src/components/security/SecuritySettings.js',
  'src/pages/Phase5SecurityTestPage.js'
];

function fixImportStructure(content) {
  // Pattern to find broken import structures where icons are mixed with material components
  const brokenPattern = /(@mui\/material';[\s\S]*?)(  [A-Z]\w* as \w*Icon,[\s\S]*?)(\n\nconst|export|\/\*\*)/g;
  
  return content.replace(brokenPattern, (match, beforeIcons, iconsSection, afterMatch) => {
    // Extract the material imports before the icons
    const materialImportsMatch = beforeIcons.match(/import\s*{([^}]*)} from '@mui\/material';/s);
    if (!materialImportsMatch) return match;
    
    let materialImports = materialImportsMatch[1];
    
    // Clean up the icons section to create proper icon imports
    const iconLines = iconsSection.split('\n').filter(line => line.trim());
    const iconImports = iconLines
      .map(line => line.trim().replace(/,$/, ''))
      .filter(line => line.length > 0 && !line.includes('} from'))
      .join(',\n  ');
    
    // Construct the fixed import structure
    return `@mui/material';
import {
  ${iconImports}
} from '@mui/icons-material';
${afterMatch}`;
  });
}

function fixFile(filePath) {
  try {
    const fullPath = path.join(__dirname, filePath);
    console.log(`Fixing ${filePath}...`);
    
    const content = fs.readFileSync(fullPath, 'utf8');
    
    // Look for the pattern where material UI components import is followed by icon imports without proper structure
    let fixedContent = content;
    
    // Find the specific pattern in these files
    const materialImportMatch = content.match(/import\s*{([^}]*)} from '@mui\/material';/s);
    if (materialImportMatch) {
      const afterMaterialImport = content.substring(content.indexOf("} from '@mui/material';") + "} from '@mui/material';".length);
      
      // Look for icon imports that start immediately after (without proper import statement)
      const iconStartMatch = afterMaterialImport.match(/\n\s*([A-Z]\w* as \w*Icon,[\s\S]*?)(\n\nconst|\nexport|\n\/\*\*)/);
      
      if (iconStartMatch) {
        const iconSection = iconStartMatch[1];
        const iconLines = iconSection.split('\n')
          .map(line => line.trim())
          .filter(line => line && !line.includes('/**') && !line.includes('*/'))
          .map(line => line.replace(/,$/, ''));
        
        // Create proper icon import
        const iconImport = `\nimport {\n  ${iconLines.join(',\n  ')}\n} from '@mui/icons-material';`;
        
        // Remove the broken icon section and add proper import
        const beforeIcons = content.substring(0, content.indexOf("} from '@mui/material';") + "} from '@mui/material';".length);
        const afterIcons = content.substring(content.indexOf(iconStartMatch[0]) + iconStartMatch[1].length);
        
        fixedContent = beforeIcons + iconImport + '\n' + afterIcons;
      }
    }
    
    if (fixedContent !== content) {
      fs.writeFileSync(fullPath, fixedContent, 'utf8');
      console.log(`✅ Fixed imports in ${filePath}`);
      return true;
    } else {
      console.log(`ℹ️  No fixes needed for ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
    return false;
  }
}

console.log('🔧 Fixing broken import structures...\n');

let fixedCount = 0;
filesToFix.forEach(filePath => {
  if (fixFile(filePath)) {
    fixedCount++;
  }
});

console.log(`\n✨ Fixed import structures in ${fixedCount} files`);
