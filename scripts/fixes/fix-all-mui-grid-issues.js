const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all React files that might have MUI Grid issues
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
  
  return [...new Set(allFiles)]; // Remove duplicates
}

function fixMuiGridInFile(filePath) {
  console.log(`Checking: ${filePath}`);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;
    
    // Check if file contains Grid components
    if (!content.includes('<Grid') && !content.includes('Grid ')) {
      return;
    }
    
    // Remove 'item' prop and convert xs/sm/md/lg/xl props to size object
    const originalContent = content;
    content = content.replace(
      /<Grid\s+item\s+([^>]*?)>/g,
      (match, props) => {
        hasChanges = true;
        // Extract size props
        const sizeProps = {};
        const remainingProps = [];
        
        // Match xs, sm, md, lg, xl props
        const sizeRegex = /(xs|sm|md|lg|xl)=\{?(\d+|true|false)\}?/g;
        let sizeMatch;
        
        while ((sizeMatch = sizeRegex.exec(props)) !== null) {
          const value = sizeMatch[2];
          if (value === 'true') {
            sizeProps[sizeMatch[1]] = true;
          } else if (value === 'false') {
            sizeProps[sizeMatch[1]] = false;
          } else {
            sizeProps[sizeMatch[1]] = parseInt(value);
          }
        }
        
        // Remove size props from remaining props
        let cleanProps = props.replace(/(xs|sm|md|lg|xl)=\{?\w+\}?\s*/g, '');
        
        // Build the new Grid component
        let newGrid = '<Grid';
        
        // Add size prop if we have size properties
        if (Object.keys(sizeProps).length > 0) {
          const sizeString = JSON.stringify(sizeProps).replace(/"/g, '');
          newGrid += ` size={${sizeString}}`;
        }
        
        // Add remaining props
        if (cleanProps.trim()) {
          newGrid += ` ${cleanProps.trim()}`;
        }
        
        newGrid += '>';
        return newGrid;
      }
    );
    
    // Fix cases where Grid has size props but no 'item' prop
    content = content.replace(
      /<Grid\s+(?!.*item)([^>]*?)(xs|sm|md|lg|xl)=\{?(\d+|true|false)\}?([^>]*?)>/g,
      (match, beforeProps, sizeProp, sizeValue, afterProps) => {
        // Only fix if this is not already a container Grid
        if (beforeProps.includes('container') || afterProps.includes('container')) {
          return match;
        }
        
        hasChanges = true;
        const allProps = beforeProps + sizeProp + '=' + sizeValue + afterProps;
        
        // Extract all size props
        const sizeProps = {};
        const sizeRegex = /(xs|sm|md|lg|xl)=\{?(\d+|true|false)\}?/g;
        let sizeMatch;
        
        while ((sizeMatch = sizeRegex.exec(allProps)) !== null) {
          const value = sizeMatch[2];
          if (value === 'true') {
            sizeProps[sizeMatch[1]] = true;
          } else if (value === 'false') {
            sizeProps[sizeMatch[1]] = false;
          } else {
            sizeProps[sizeMatch[1]] = parseInt(value);
          }
        }
        
        // Remove size props from remaining props
        let cleanProps = allProps.replace(/(xs|sm|md|lg|xl)=\{?\w+\}?\s*/g, '');
        
        // Build the new Grid component
        let newGrid = '<Grid';
        
        // Add size prop
        if (Object.keys(sizeProps).length > 0) {
          const sizeString = JSON.stringify(sizeProps).replace(/"/g, '');
          newGrid += ` size={${sizeString}}`;
        }
        
        // Add remaining props
        if (cleanProps.trim()) {
          newGrid += ` ${cleanProps.trim()}`;
        }
        
        newGrid += '>';
        return newGrid;
      }
    );
    
    // Fix container prop usage
    content = content.replace(
      /<Grid\s+container=\{true\}/g,
      '<Grid container'
    );
    
    content = content.replace(
      /<Grid\s+container\s+/g,
      '<Grid container '
    );
    
    if (hasChanges || content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
    }
    
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
  }
}

// Check if glob is available, if not install it
try {
  require('glob');
} catch (e) {
  console.log('Installing glob package...');
  require('child_process').execSync('npm install glob', { stdio: 'inherit' });
  console.log('Glob installed successfully');
}

// Find and fix all React files
console.log('🔍 Searching for React files with potential MUI Grid issues...\n');
const reactFiles = findReactFiles();

console.log(`Found ${reactFiles.length} React files to check\n`);

reactFiles.forEach(file => {
  const fullPath = path.resolve(file);
  if (fs.existsSync(fullPath)) {
    fixMuiGridInFile(fullPath);
  }
});

console.log('\n🎉 MUI Grid migration completed!');
console.log('All Grid components have been updated to use the new Grid v2 syntax.');
