const fs = require('fs');
const path = require('path');

function fixMakeStylesIssue() {
  const filePath = path.join(__dirname, 'src/pages/Phase5SecurityTestPage.js');
  
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${filePath}`);
      return false;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check if makeStyles is undefined
    if (!content.includes('makeStyles is not defined') && !content.includes('makeStyles')) {
      console.log('No makeStyles issue found in the file');
      return false;
    }
    
    // Add import for makeStyles
    let updatedContent = content;
    const makeStylesImport = "import { makeStyles } from '@mui/styles';";
    
    if (!content.includes(makeStylesImport)) {
      // Find a good place to add the import
      const lines = content.split('\n');
      const lastImportIndex = lines.findIndex((line, i, array) => 
        line.trim().startsWith('import') && 
        (i === array.length - 1 || !array[i + 1].trim().startsWith('import'))
      );
      
      if (lastImportIndex !== -1) {
        lines.splice(lastImportIndex + 1, 0, makeStylesImport);
        updatedContent = lines.join('\n');
      } else {
        updatedContent = `${makeStylesImport}\n${content}`;
      }
    }
    
    // Write changes
    fs.writeFileSync(filePath, updatedContent);
    console.log('Fixed makeStyles import in Phase5SecurityTestPage.js');
    return true;
  } catch (error) {
    console.error(`Error fixing makeStyles issue:`, error);
    return false;
  }
}

console.log('Fixing makeStyles issue...');
fixMakeStylesIssue();
console.log('Done!');
