const fs = require('fs');
const path = require('path');

// Define the file path
const filePath = path.resolve(__dirname, 'src/components/immersive/ARVRLearningSpace.js');

// Read the file
let fileContent = fs.readFileSync(filePath, 'utf8');

// Create a new file with all MuiBox replaced with Box
let fixedContent = fileContent.replace(/MuiBox/g, 'Box');

// Fix any incorrect Box closing tags that might be present
fixedContent = fixedContent.replace(/<\/MuiBox>/g, '</Box>');

// Save the fixed content
fs.writeFileSync(filePath, fixedContent, 'utf8');

console.log("Fixed all MuiBox references in ARVRLearningSpace.js");
