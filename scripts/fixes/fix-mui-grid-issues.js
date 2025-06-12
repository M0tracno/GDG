const fs = require('fs');
const path = require('path');

// Files that need MUI Grid fixes
const filesToFix = [
  'src/pages/AdminDashboard.js',
  'src/components/student/StudentAttendance.js',
  'src/components/student/Quizzes.js',
  'src/components/student/Progress.js'
];

function fixMuiGridInFile(filePath) {
  console.log(`Fixing MUI Grid issues in: ${filePath}`);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remove 'item' prop and convert xs/sm/md/lg props to size object
    content = content.replace(
      /<Grid\s+item\s+([^>]*?)>/g,
      (match, props) => {
        // Extract size props
        const sizeProps = {};
        const remainingProps = [];
        
        // Match xs, sm, md, lg, xl props
        const sizeRegex = /(xs|sm|md|lg|xl)=\{?(\d+|true|false)\}?/g;
        let sizeMatch;
        
        while ((sizeMatch = sizeRegex.exec(props)) !== null) {
          sizeProps[sizeMatch[1]] = sizeMatch[2] === 'true' ? true : 
                                    sizeMatch[2] === 'false' ? false : 
                                    parseInt(sizeMatch[2]);
        }
        
        // Remove size props from remaining props
        let cleanProps = props.replace(/(xs|sm|md|lg|xl)=\{?\d+\}?\s*/g, '');
        
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
    
    // Fix container prop usage
    content = content.replace(
      /<Grid\s+container=\{true\}/g,
      '<Grid container'
    );
    
    content = content.replace(
      /<Grid\s+container\s+/g,
      '<Grid container '
    );
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Successfully fixed: ${filePath}`);
    
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error.message);
  }
}

// Fix all files
filesToFix.forEach(file => {
  const fullPath = path.resolve(file);
  if (fs.existsSync(fullPath)) {
    fixMuiGridInFile(fullPath);
  } else {
    console.log(`File not found: ${fullPath}`);
  }
});

console.log('MUI Grid fixes completed!');
