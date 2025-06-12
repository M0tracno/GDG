const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'components', 'mobile', 'MobileOptimization.js');

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

// Fix the imports
if (!content.includes('import { useMediaQuery } from')) {
  content = content.replace('import React, { useRef, useEffect, useState } from \'react\';', 
                           'import React, { useRef, useEffect, useState } from \'react\';\nimport { useMediaQuery } from \'@mui/material\';\nimport { useTheme } from \'@mui/material/styles\';');
}

// Fix the useGestureDetection hook which seems to be malformed
content = content.replace('// Touch gesture detection hook\n  const {', 
                         '// Touch gesture detection hook\nexport const useGestureDetection = (element, options = {}) => {\n  const {');

// Fix the useResponsiveDesign hook
content = content.replace('export const useResponsiveDesign = () => {const', 
                         'export const useResponsiveDesign = () => {\n  const theme = useTheme();\n  const');

// Write the fixed content back
fs.writeFileSync(filePath, content);

console.log('Fixed MobileOptimization.js');
