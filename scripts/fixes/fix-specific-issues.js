const fs = require('fs');
const path = require('path');

// Fix Phase3BTestPage.js
const fixPhase3B = () => {
  const filePath = path.resolve(process.cwd(), 'src/pages/Phase3BTestPage.js');
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Replace malformed imports with properly structured imports
  content = content.replace(
    /import React.+?{[\s\n]+import AdaptiveLearning.*?\/\/\s*Phase 3B:/s,
    `import React, { useState, useEffect, Suspense } from 'react';
import AdaptiveLearningDashboard from '../components/adaptive/AdaptiveLearningDashboard';
import PersonalizedContentAdapter from '../components/adaptive/PersonalizedContentAdapter';
import AdaptiveLearningService from '../services/AdaptiveLearningService';
import { Alert, Avatar, Box, Button, Card, CardContent, Chip, CircularProgress, Container, Grid, List, ListItem, ListItemIcon, ListItemText, Paper, Snackbar, Tab, Tabs, Typography, useTheme } from '@mui/material';
import { School } from '@mui/icons-material';

// Lazy load immersive components
const VirtualClassroomInterface = React.lazy(() => 
  import('../components/immersive/VirtualClassroomInterface').catch(() => ({
    default: () => <Alert severity="info">Virtual Classroom Interface not available</Alert>
  }))
);

const ARVRLearningSpace = React.lazy(() => 
  import('../components/immersive/ARVRLearningSpace').catch(() => ({
    default: () => <Alert severity="info">AR/VR Learning Space not available</Alert>
  }))
);

// Phase 3B:`
  );
  
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`Fixed ${filePath}`);
};

// Fix Phase3TestPage.js
const fixPhase3 = () => {
  const filePath = path.resolve(process.cwd(), 'src/pages/Phase3TestPage.js');
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Replace malformed lazy loading with properly structured lazy loading
  content = content.replace(
    /const VirtualClassroomInterface = React\.lazy\(\(\) =>\s+default: \(\) =>/s,
    'const VirtualClassroomInterface = React.lazy(() => import("../components/immersive/VirtualClassroomInterface").catch(() => ({ default: () =>'
  );
  
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`Fixed ${filePath}`);
};

// Fix Phase5SecurityTestPage.js
const fixPhase5Security = () => {
  const filePath = path.resolve(process.cwd(), 'src/pages/Phase5SecurityTestPage.js');
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Remove trailing commas after imports
  content = content.replace(/from '\.\.\/hooks\/security';,/g, "from '../hooks/security';");
  
  // Remove comments in inappropriate places
  content = content.replace(/}.*?,\s+\/\/\s*Auth hook/s, "}\n\n// Auth hook");
  
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`Fixed ${filePath}`);
};

// Fix reportWebVitals.js
const fixReportWebVitals = () => {
  const filePath = path.resolve(process.cwd(), 'src/reportWebVitals.js');
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Look for and fix syntax in the file
  content = content.replace(
    /getFID\(onPerfEntry\);\s+getCLS\(onPerfEntry\);\s+getLCP\(onPerfEntry\);\s+getTTFB\(onPerfEntry\);\s+}\);/s,
    'getFID(onPerfEntry);\n      getCLS(onPerfEntry);\n      getLCP(onPerfEntry);\n      getTTFB(onPerfEntry);\n    });\n  }'
  );
  
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`Fixed ${filePath}`);
};

// Run fixes for specific files with deeper issues
fixPhase3B();
fixPhase3();
fixPhase5Security();
fixReportWebVitals();

console.log("Finished specific fixes");
