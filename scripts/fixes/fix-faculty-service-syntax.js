const fs = require('fs');
const path = require('path');

async function fixFacultyServiceSyntax() {
  const filePath = path.join(process.cwd(), 'src', 'services', 'enhancedFacultyService.js');
  
  console.log('🔧 Fixing syntax errors in enhancedFacultyService.js...');
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix malformed closing braces
    content = content.replace(/\}\s*\}\s*;/g, '}');
    
    // Fix missing commas and semicolons in object properties
    content = content.replace(/(\w+):\s*(\d+)\s*$/gm, '$1: $2,');
    content = content.replace(/(\w+):\s*'([^']+)'\s*$/gm, "$1: '$2',");
    content = content.replace(/(\w+):\s*\[([^\]]+)\]\s*$/gm, '$1: [$2],');
    content = content.replace(/(\w+):\s*\{([^}]+)\}\s*$/gm, '$1: {$2},');
    
    // Fix incomplete method definitions
    content = content.replace(/async\s+(\w+)\(\)\s*\{\s*$/gm, 'async $1() {');
    
    // Remove duplicate export statements
    const exportMatches = content.match(/export default new EnhancedFacultyService\(\);/g);
    if (exportMatches && exportMatches.length > 1) {
      content = content.replace(/export default new EnhancedFacultyService\(\);/g, '');
      content += '\nexport default new EnhancedFacultyService();\n';
    }
    
    // Fix missing return statements and method closures
    content = content.replace(/(\s+)}\s*(\w+\s*\(\s*\)\s*\{)/g, '$1}\n\n  $2');
    
    // Ensure proper class structure
    const lines = content.split('\n');
    let inClass = false;
    let braceCount = 0;
    let fixedLines = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.includes('class EnhancedFacultyService')) {
        inClass = true;
        braceCount = 0;
      }
      
      if (inClass) {
        braceCount += (line.match(/\{/g) || []).length;
        braceCount -= (line.match(/\}/g) || []).length;
        
        if (braceCount === 0 && line.includes('}') && !line.includes('export')) {
          fixedLines.push(line);
          inClass = false;
        } else {
          fixedLines.push(line);
        }
      } else {
        fixedLines.push(line);
      }
    }
    
    content = fixedLines.join('\n');
    
    // Final cleanup
    content = content.replace(/\n{3,}/g, '\n\n');
    content = content.replace(/,\s*}/g, '\n  }');
    content = content.replace(/,\s*],/g, '\n  ],');
    
    fs.writeFileSync(filePath, content);
    console.log('✅ Fixed syntax errors in enhancedFacultyService.js');
    
    return true;
  } catch (error) {
    console.error('❌ Error fixing faculty service syntax:', error);
    return false;
  }
}

if (require.main === module) {
  fixFacultyServiceSyntax().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { fixFacultyServiceSyntax };
