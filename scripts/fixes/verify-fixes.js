/**
 * Script to verify various fixes to the codebase
 */
const fs = require('fs');
const path = require('path');

console.log('Verifying fixes...');

function checkFile(filePath, searchRegex, message) {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const searchResult = fileContent.match(searchRegex);
    
    if (searchResult) {
      console.log(`✅ ${message}`);
      return true;
    } else {
      console.log(`❌ ${message}`);
      return false;
    }
  } catch (err) {
    console.error(`Error reading file ${filePath}:`, err);
    return false;
  }
}

// Check import paths in service files
checkFile(
  path.join(__dirname, 'src', 'services', 'courseAllocationService.js'),
  /import axios from ['"]\.\.\/utils\/mockApiService['"];/,
  'courseAllocationService.js has correct import path'
);

checkFile(
  path.join(__dirname, 'src', 'services', 'messagingService.js'),
  /import axios from ['"]\.\.\/utils\/mockApiService['"];/,
  'messagingService.js has correct import path'
);

// Check login pages hook usage
const loginPages = ['StudentLogin.js', 'FacultyLogin.js', 'AdminLogin.js', 'ParentLogin.js'];

loginPages.forEach(page => {
  const filePath = path.join(__dirname, 'src', 'pages', page);
  const roleName = page.replace('Login.js', '').toLowerCase();
  
  // Check that the hook is used inside the component
  checkFile(
    filePath,
    new RegExp(`const classes = useLoginFormStyles\\(['"]${roleName}['"]\\);`),
    `${page} has hook inside component`
  );
  
  // Check that the hook is not at the top level
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const hasTopLevelHook = /^const useStyles = useLoginFormStyles/.test(fileContent);
  
  if (!hasTopLevelHook) {
    console.log(`✅ ${page} does not have top-level hook usage`);
  } else {
    console.log(`❌ ${page} still has top-level hook usage`);
  }
});

// Check firebaseConfigService.js
checkFile(
  path.join(__dirname, 'src', 'utils', 'firebaseConfigService.js'),
  /const isDemoMode = \(\) =>/,
  'firebaseConfigService.js uses isDemoMode function instead of useDemoMode hook'
);

// Check import ordering in components
const componentsToCheck = [
  { 
    path: path.join(__dirname, 'src', 'components', 'admin', 'BulkAssignmentDialog.js'),
    regex: /import \{[^}]*\} from ['"]@mui\/icons-material['"];.*import makeStyles/s,
    message: 'BulkAssignmentDialog.js has correct import ordering'
  },
  { 
    path: path.join(__dirname, 'src', 'components', 'admin', 'CourseAllocationDashboard.js'),
    regex: /import \{[^}]*\} from ['"]@mui\/icons-material['"];.*import makeStyles/s,
    message: 'CourseAllocationDashboard.js has correct import ordering'
  },
  { 
    path: path.join(__dirname, 'src', 'components', 'faculty', 'FacultyFeedback.js'),
    regex: /import \{[^}]*\} from ['"]@mui\/icons-material['"];.*import makeStyles/s,
    message: 'FacultyFeedback.js has correct import ordering'
  },
  { 
    path: path.join(__dirname, 'src', 'components', 'student', 'Quizzes.js'),
    regex: /import \{[^}]*\} from ['"]@mui\/icons-material['"];.*import \{ InlineMath, BlockMath \}.*import makeStyles/s,
    message: 'Quizzes.js has correct import ordering'
  },
  { 
    path: path.join(__dirname, 'src', 'components', 'student', 'StudentAttendance.js'),
    regex: /import \{[^}]*\} from ['"]@mui\/icons-material['"];.*import makeStyles/s,
    message: 'StudentAttendance.js has correct import ordering'
  }
];

componentsToCheck.forEach(component => {
  checkFile(component.path, component.regex, component.message);
});

console.log('\nVerification complete!');
