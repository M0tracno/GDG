const fs = require('fs');
const path = require('path');

// Clean up the corrupted enhancedFacultyService.js file
function cleanUpFacultyService() {
  console.log('🔧 Cleaning up corrupted enhancedFacultyService.js...');
  
  const filePath = path.join(process.cwd(), 'src/services/enhancedFacultyService.js');
  
  if (!fs.existsSync(filePath)) {
    console.log('❌ enhancedFacultyService.js not found');
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Find the last valid closing brace before the corrupted part
  // Look for the end of the getCommunicationData method
  const validEndPattern = /messagesSentToday:\s*3\s*}\s*}\s*};\s*}\s*}/;
  const match = content.match(validEndPattern);
  
  if (match) {
    const validEndIndex = content.indexOf(match[0]) + match[0].length;
    const validContent = content.substring(0, validEndIndex);
    
    // Add proper class closing and export
    const cleanContent = validContent + '\n}\n\nexport default new EnhancedFacultyService();';
    
    fs.writeFileSync(filePath, cleanContent, 'utf8');
    console.log('✅ Successfully cleaned up enhancedFacultyService.js');
  } else {
    console.log('❌ Could not find valid end point in file');
    
    // Fallback: try to find any valid closing pattern
    const lines = content.split('\n');
    let validLines = [];
    let braceCount = 0;
    let insideClass = false;
    
    for (const line of lines) {
      validLines.push(line);
      
      // Track class definition
      if (line.includes('class EnhancedFacultyService')) {
        insideClass = true;
      }
      
      // Count braces to detect when we should stop
      braceCount += (line.match(/{/g) || []).length;
      braceCount -= (line.match(/}/g) || []).length;
      
      // If we're at the end of what looks like the communication data method
      if (insideClass && line.includes('messagesSentToday') && braceCount <= 1) {
        // Add remaining braces to close properly
        validLines.push('    }');
        validLines.push('  }');
        validLines.push('}');
        validLines.push('');
        validLines.push('export default new EnhancedFacultyService();');
        break;
      }
    }
    
    fs.writeFileSync(filePath, validLines.join('\n'), 'utf8');
    console.log('✅ Applied fallback cleanup to enhancedFacultyService.js');
  }
}

console.log('🚀 Starting faculty service cleanup...\n');
cleanUpFacultyService();
console.log('\n🎉 Faculty service cleanup completed!');
