const fs = require('fs');
const path = require('path');

// Fix RoleSelection.js
const fixRoleSelection = () => {
  const filePath = path.resolve(process.cwd(), 'src/pages/RoleSelection.js');
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Add missing import for SupervisorAccount icon
  if (content.includes('SupervisorAccount as AdminIcon')) {
    content = content.replace(
      /SupervisorAccount as AdminIcon/,
      "import { SupervisorAccount as AdminIcon } from '@mui/icons-material';"
    );
  }
  
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`Fixed ${filePath}`);
};

// Fix StudentDashboard.js
const fixStudentDashboard = () => {
  const filePath = path.resolve(process.cwd(), 'src/pages/StudentDashboard.js');
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Add missing import for Chat icon
  if (content.includes('Chat as ChatIcon')) {
    content = content.replace(
      /Chat as ChatIcon} from '@mui\/icons-material';/,
      "import { Chat as ChatIcon } from '@mui/icons-material';"
    );
  }
  
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`Fixed ${filePath}`);
};

// Fix StudentLogin.js
const fixStudentLogin = () => {
  const filePath = path.resolve(process.cwd(), 'src/pages/StudentLogin.js');
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Add missing import for ArrowBack icon
  if (content.includes('ArrowBack as ArrowBackIcon')) {
    content = content.replace(
      /ArrowBack as ArrowBackIcon/,
      "import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';"
    );
  }
  
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`Fixed ${filePath}`);
};

// Fix SetupPassword.js
const fixSetupPassword = () => {
  const filePath = path.resolve(process.cwd(), 'src/pages/SetupPassword.js');
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Fix import statement structure
  content = content.replace(
    /import {\s*\nimport axios from 'axios';/,
    'import axios from \'axios\';\nimport {'
  );
  
  // Fix Visibility imports if missing
  if (content.includes('Visibility,')) {
    content = content.replace(
      /Visibility,/,
      "import { Visibility,"
    );
    
    // Look for the end of the import section to close it properly
    const visibilityOffMatch = content.match(/VisibilityOff[^\n]*?(?=\n)/);
    if (visibilityOffMatch) {
      content = content.replace(
        visibilityOffMatch[0],
        `${visibilityOffMatch[0]} } from '@mui/icons-material';`
      );
    }
  }
  
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`Fixed ${filePath}`);
};

// Fix Phase3CTestPage.js specific issues
const fixPhase3C = () => {
  const filePath = path.resolve(process.cwd(), 'src/pages/Phase3CTestPage.js');
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Fix TrendingUp icon import
  if (content.includes('TrendingUp as TrendingUpIcon')) {
    content = content.replace(
      /TrendingUp as TrendingUpIcon} from '@mui\/icons-material';/,
      "import { TrendingUp as TrendingUpIcon } from '@mui/icons-material';"
    );
  }
  
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`Fixed ${filePath}`);
};

// Fix firebaseEmailService.js
const fixFirebaseEmailService = () => {
  const filePath = path.resolve(process.cwd(), 'src/services/firebaseEmailService.js');
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Fix import for onAuthStateChanged
  if (content.includes('onAuthStateChanged')) {
    content = content.replace(
      /onAuthStateChanged\s*\n}\s*from\s*'firebase\/auth';/,
      "import { onAuthStateChanged } from 'firebase/auth';"
    );
  }
  
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`Fixed ${filePath}`);
};

// Run all specific fixes
fixRoleSelection();
fixStudentDashboard();
fixStudentLogin();
fixSetupPassword();
fixPhase3C();
fixFirebaseEmailService();

console.log("Finished additional specific fixes");
