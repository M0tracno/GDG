const fs = require('fs');
const path = require('path');

// Define the path to SecurityDashboard.js
const securityDashboardPath = path.join(__dirname, 'src', 'components', 'security', 'SecurityDashboard.js');

// Read the content of the file
let content = fs.readFileSync(securityDashboardPath, 'utf8');

// Fix missing commas in objects
content = content.replace(/(\w+): {[^}]+top: theme\.spacing\(1\)\s+right: theme\.spacing\(1\)/g, 
                         '$1: {\n  position: \'absolute\',\n  top: theme.spacing(1),\n  right: theme.spacing(1)');

// Fix incorrect useEffect dependency array syntax
content = content.replace(/} \[]/g, '}, []');

// Fix useStyles declaration
content = content.replace(/}\)\);(\s+)const SecurityDashboard/g, '});\n\nconst SecurityDashboard');

// Fix variable declaration formatting
content = content.replace(/(\w+)\.(\w+);const/g, '$1.$2;\n\nconst');
content = content.replace(/useStyles\(\);const/g, 'useStyles();\nconst');

// Remove trailing commas after comment lines
content = content.replace(/\/\/\s*.*?,\s*\n/g, match => match.replace(',', ''));

// Fix mixed semicolons and commas in function bodies
content = content.replace(/(\/\/.*)\n\s*const (\w+)Response = await fetch/g, '$1\n    const $2Response = await fetch');

// Use more comprehensive approach for fixing commas instead of semicolons
const lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
  // Fix lines that end with a comma when they should end with semicolon
  if (lines[i].trim().match(/^(const|let|var|return|try|catch|finally|if|else|switch|case|break|continue|do|while|for).+,$/)) {
    lines[i] = lines[i].replace(/,$/, ';');
  }
  
  // Fix lines that are just closing braces with commas
  if (lines[i].trim().match(/^},$/) && !lines[i].includes('return {')) {
    lines[i] = lines[i].replace(/,$/, ';');
  }
}

content = lines.join('\n');

// Write the corrected content back to the file
fs.writeFileSync(securityDashboardPath, content);

console.log('Applied comprehensive fixes to SecurityDashboard.js');
