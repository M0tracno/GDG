const fs = require('fs');
const path = require('path');

// Define the path to SecurityDashboard.js
const securityDashboardPath = path.join(__dirname, 'src', 'components', 'security', 'SecurityDashboard.js');

// Read the content of the file
let content = fs.readFileSync(securityDashboardPath, 'utf8');

// Fix syntax errors in the useStyles declaration
content = content.replace(/}\);\),/g, '});');

// Fix trailing commas after the closing parenthesis and braces
content = content.replace(/};\),/g, '});');

// Fix misplaced commas
content = content.replace(/const SecurityDashboard = \(\) => \{,/g, 'const SecurityDashboard = () => {');

// Fix variable declaration with commas instead of semicolons
const fixDeclarationRegex = /(const|let|var) \[(\w+), set(\w+)\] = useState\((.*?)\);,/g;
content = content.replace(fixDeclarationRegex, '$1 [$2, set$3] = useState($4);');

// Fix standard statements ending with commas instead of semicolons
content = content.replace(/;\s*,/g, ';');
content = content.replace(/\)\s*,/g, ')');
content = content.replace(/}\s*,/g, '}');

// Fix useEffect with commas
content = content.replace(/useEffect\(\(\) => \{,/g, 'useEffect(() => {');
content = content.replace(/}, \[\]\);,/g, '}, []);');

// Fix function declarations with commas
content = content.replace(/const (\w+) = (async )?\(\) => \{,/g, 'const $1 = $2() => {');
content = content.replace(/const (\w+) = (async )?\(([^)]*)\) => \{,/g, 'const $1 = $2($3) => {');

// Fix try-catch blocks with commas
content = content.replace(/try \{,/g, 'try {');
content = content.replace(/} catch \((\w+)\) \{,/g, '} catch ($1) {');
content = content.replace(/} finally \{,/g, '} finally {');

// Fix switch statements with commas
content = content.replace(/switch \(([^)]*)\) \{,/g, 'switch ($1) {');
content = content.replace(/case '(\w+)': return (.*?);,/g, "case '$1': return $2;");

// Write the corrected content back to the file
fs.writeFileSync(securityDashboardPath, content);

console.log('Fixed syntax errors in SecurityDashboard.js');
