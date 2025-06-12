const fs = require('fs');
const path = require('path');

// Path to the file
const filePath = path.join(__dirname, 'src/components/immersive/ARVRLearningSpace.js');

// Read the file content
let content = fs.readFileSync(filePath, 'utf8');

// Replace all instances of MuiBox with Box
const updatedContent = content.replace(/MuiBox/g, 'Box');

// Write the updated content back to the file
fs.writeFileSync(filePath, updatedContent, 'utf8');

console.log('Successfully replaced all MuiBox instances with Box in ARVRLearningSpace.js');
