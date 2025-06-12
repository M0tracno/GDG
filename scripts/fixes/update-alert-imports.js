// update-alert-imports.js
const fs = require('fs');
const path = require('path');

// File paths to update
const files = [
  'src/App.js',
  'src/components/admin/BulkAssignmentDialog.js',
  'src/components/admin/BulkStudentEnrollmentDialog.js',
  'src/components/admin/CourseAllocationDashboard.js',
  'src/components/faculty/CourseAttendance.js',
  'src/components/faculty/GradeAssignments.js',
  'src/components/faculty/QuestionBank.js',
  'src/components/faculty/QuizCreation.js',
  'src/components/student/Quizzes.js',
  'src/pages/AdminDashboard.js',
  'src/pages/AdminLogin.js',
  'src/pages/FacultyLogin.js',
  'src/pages/ParentLogin.js',
  'src/pages/SetupPassword.js',
  'src/pages/StudentLogin.js'
];

// Process files
files.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  
  try {
    if (fs.existsSync(fullPath)) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Replace the import statements
      content = content.replace(
        /import\s*{\s*([^}]*)Alert([^}]*)\s*}\s*from\s*['"]@mui\/lab['"]/g, 
        'import { $1Alert$2 } from \'@mui/material\''
      );
      
      // Write the file back
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`Updated Alert import in ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
});

console.log('Alert imports update completed.');
