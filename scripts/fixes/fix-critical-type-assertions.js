const fs = require('fs');
const path = require('path');

// Critical file paths that need type assertion fixes
const CRITICAL_FILES = [
  'src/pages/AdminDashboard.js',
  'src/pages/Login.js', 
  'src/pages/FacultyDashboard.js',
  'src/pages/UnifiedRegistration.js',
  'src/components/faculty/StudentList.js'
];

// Type assertion patterns to fix
const TYPE_ASSERTION_FIXES = [
  // Basic icon fixes
  { pattern: /<Menu as MenuIcon \/>/g, replacement: '<MenuIcon />' },
  { pattern: /<Menu as MenuIcon>/g, replacement: '<MenuIcon>' },
  { pattern: /<Notifications as NotificationsIcon \/>/g, replacement: '<NotificationsIcon />' },
  { pattern: /<Settings as SettingsIcon/g, replacement: '<SettingsIcon' },
  { pattern: /<Logout as LogoutIcon/g, replacement: '<LogoutIcon' },
  { pattern: /<People as PeopleIcon/g, replacement: '<PeopleIcon' },
  { pattern: /<School as SchoolIcon/g, replacement: '<SchoolIcon' },
  { pattern: /<Person as PersonIcon/g, replacement: '<PersonIcon' },
  { pattern: /<Book as BookIcon/g, replacement: '<BookIcon' },
  { pattern: /<Storage as StorageIcon/g, replacement: '<StorageIcon' },
  { pattern: /<Assessment as ReportsIcon/g, replacement: '<ReportsIcon' },
  { pattern: /<BarChart as BarChartIcon/g, replacement: '<BarChartIcon' },
  { pattern: /<VpnKey as VpnKeyIcon/g, replacement: '<VpnKeyIcon' },
  { pattern: /<Dashboard as DashboardIcon/g, replacement: '<DashboardIcon' },
  { pattern: /<Delete as DeleteIcon/g, replacement: '<DeleteIcon' },
  { pattern: /<Edit as EditIcon/g, replacement: '<EditIcon' },
  { pattern: /<NoteAdd as AddIcon/g, replacement: '<AddIcon' },
  { pattern: /<Backup as BackupIcon/g, replacement: '<BackupIcon' },
  { pattern: /<TrendingUp as TrendingUpIcon/g, replacement: '<TrendingUpIcon' },
  { pattern: /<Storage as DatabaseIcon/g, replacement: '<DatabaseIcon' },
  { pattern: /<CloudUpload as CloudUploadIcon/g, replacement: '<CloudUploadIcon' },
  { pattern: /<ImportExport as ImportExportIcon/g, replacement: '<ImportExportIcon' },
  { pattern: /<Restore as RestoreIcon/g, replacement: '<RestoreIcon' },
  { pattern: /<Event as EventIcon/g, replacement: '<EventIcon' },
  { pattern: /<ShowChart as LineChartIcon/g, replacement: '<LineChartIcon' },
  { pattern: /<FilterList as FilterIcon/g, replacement: '<FilterIcon' },
  { pattern: /<Quiz as QuizIcon/g, replacement: '<QuizIcon' },
  { pattern: /<PersonAdd as AddIcon/g, replacement: '<AddIcon' },

  // Login.js specific fixes
  { pattern: /<School as SchoolIcon fontSize="inherit" \/>/g, replacement: '<SchoolIcon fontSize="inherit" />' },
  { pattern: /<Person as PersonIcon fontSize="inherit" \/>/g, replacement: '<PersonIcon fontSize="inherit" />' },
  { pattern: /<People as PeopleIcon fontSize="inherit" \/>/g, replacement: '<PeopleIcon fontSize="inherit" />' },

  // Component-specific fixes
  { pattern: /icon: People as PeopleIcon/g, replacement: 'icon: PeopleIcon' },
  { pattern: /People as PeopleIcon,/g, replacement: 'PeopleIcon,' },
  { pattern: /School as SchoolIcon,/g, replacement: 'SchoolIcon,' },
];

function fixTypeAssertions() {
  console.log('🔧 Starting critical type assertion fixes...\n');
  
  let totalFilesFixed = 0;
  let totalChanges = 0;

  CRITICAL_FILES.forEach(filePath => {
    const fullPath = path.resolve(process.cwd(), filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return;
    }

    console.log(`📝 Processing: ${filePath}`);
    
    let content = fs.readFileSync(fullPath, 'utf-8');
    let originalContent = content;
    let fileChanges = 0;

    // Apply all type assertion fixes
    TYPE_ASSERTION_FIXES.forEach(fix => {
      const matches = content.match(fix.pattern);
      if (matches) {
        content = content.replace(fix.pattern, fix.replacement);
        fileChanges += matches.length;
        console.log(`   ✅ Fixed ${matches.length} occurrence(s) of pattern: ${fix.pattern.source}`);
      }
    });

    // Write back if changes were made
    if (content !== originalContent) {
      fs.writeFileSync(fullPath, content, 'utf-8');
      totalFilesFixed++;
      totalChanges += fileChanges;
      console.log(`   ✨ Fixed ${fileChanges} type assertions in ${filePath}\n`);
    } else {
      console.log(`   ✅ No type assertions found in ${filePath}\n`);
    }
  });

  console.log(`\n🎉 Type assertion fix complete!`);
  console.log(`📊 Summary:`);
  console.log(`   - Files processed: ${CRITICAL_FILES.length}`);
  console.log(`   - Files modified: ${totalFilesFixed}`);
  console.log(`   - Total fixes applied: ${totalChanges}`);
  
  if (totalChanges > 0) {
    console.log(`\n⚠️  Please check the modified files and test compilation!`);
  }
}

// Run the fixes
fixTypeAssertions();
