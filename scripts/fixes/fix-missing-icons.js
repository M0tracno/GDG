const fs = require('fs');
const path = require('path');

// Files with missing icon imports
const FILES_WITH_MISSING_ICONS = [
  'src/components/faculty/CourseAttendance.js',
  'src/components/faculty/GradeAssignments.js',
  'src/components/faculty/QuizCreation.js',
  'src/components/faculty/QuizManagement.js',
  'src/components/immersive/VirtualClassroomInterface.js',
  'src/components/layout/UnifiedDashboardLayout.js',
  'src/components/notifications/SmartNotificationPanel.js',
  'src/components/parent/ChildProgress.js',
  'src/components/parent/ChildrenGrades.js',
  'src/components/parent/ParentMeetings.js',
  'src/components/security/SecuritySettings.js',
  'src/components/settings/SettingsPanel.js',
  'src/contexts/NotificationContext.js',
  'src/pages/AdminDashboard.js'
];

// All Material UI icons mentioned in the error list
const ALL_ICONS = [
  'AddIcon',
  'SaveIcon',
  'HistoryIcon',
  'Refresh',
  'SendIcon',
  'CheckIcon',
  'QuestionIcon',
  'StudentIcon',
  'People',
  'PanTool',
  'Chat',
  'CameraAlt',
  'VideocamOff',
  'Mic',
  'MicOff',
  'VolumeOff',
  'StopScreenShare',
  'ScreenShare',
  'Stop',
  'RecordVoiceOver',
  'ThreeDRotation',
  'FullscreenExit',
  'Fullscreen',
  'Settings',
  'AccountCircle',
  'Menu',
  'LogoutIcon',
  'Assignment',
  'Grade',
  'Announcement',
  'Schedule',
  'MarkEmailRead',
  'Delete',
  'ExpandMore',
  'NotificationsActive',
  'Email',
  'Phone',
  'Message',
  'Close',
  'TrendingDownIcon',
  'AssignmentIcon',
  'QuizIcon',
  'StarIcon',
  'CheckCircle',
  'Warning',
  'EventNoteIcon',
  'GradeIcon',
  'EditIcon',
  'CancelIcon',
  'DevicesIcon',
  'LaptopIcon',
  'PaletteIcon',
  'LightModeIcon',
  'DarkModeIcon',
  'NotificationsIcon',
  'LanguageIcon',
  'AccessibilityIcon',
  'SecurityIcon',
  'StorageIcon',
  'BackupIcon',
  'CloseIcon',
  'VpnKeyIcon',
  'DashboardIcon',
  'PeopleIcon',
  'SchoolIcon',
  'BookIcon',
  'ReportsIcon',
  'BarChartIcon',
  'SettingsIcon',
  'MenuIcon',
  'NoteAddIcon',
  'PersonIcon',
  'PersonAddIcon',
  'DeleteIcon',
  'DatabaseIcon',
  'BackupIcon',
  'TrendingUpIcon',
  'ImportExportIcon',
  'EventIcon',
  'RestoreIcon',
  'WarningIcon',
  'LineChartIcon'
];

function fixMissingIcons(filePath) {
  console.log(`Fixing missing icons in ${filePath}`);
  const fullPath = path.join(__dirname, filePath);
  
  try {
    if (!fs.existsSync(fullPath)) {
      console.log(`File not found: ${fullPath}`);
      return false;
    }
    
    const content = fs.readFileSync(fullPath, 'utf8');
    let usedIcons = new Set();
    
    // Check which icons are used in the file
    ALL_ICONS.forEach(icon => {
      const iconPattern = new RegExp(`<${icon}[\\s/>]|\\s${icon}\\s|\\(${icon}\\)|"${icon}"|'${icon}'`, 'g');
      if (iconPattern.test(content)) {
        usedIcons.add(icon);
      }
    });
    
    if (usedIcons.size === 0) {
      console.log(`  No icons found in ${filePath}`);
      return false;
    }
    
    // Check if there's already an import for @mui/icons-material
    const iconImportPattern = /import.*from ['"]@mui\/icons-material['"]/g;
    let updatedContent;
    
    if (iconImportPattern.test(content)) {
      // Update existing import
      updatedContent = content.replace(
        /import\s*{([^}]*)}\s*from\s*['"]@mui\/icons-material['"]/,
        (match, importedIcons) => {
          const existingIcons = importedIcons.split(',')
            .map(i => i.trim())
            .filter(i => i.length > 0);
          
          // Add the new icons that aren't already imported
          const existingIconsSet = new Set(existingIcons);
          const newIcons = Array.from(usedIcons).filter(icon => !existingIconsSet.has(icon));
          
          if (newIcons.length === 0) {
            return match; // No new icons to add
          }
          
          const allIcons = [...existingIcons, ...newIcons].sort();
          return `import { ${allIcons.join(', ')} } from '@mui/icons-material'`;
        }
      );
    } else {
      // Add new import
      const importLine = `import { ${Array.from(usedIcons).sort().join(', ')} } from '@mui/icons-material';`;
      
      // Find a good place to add the import
      const importRegex = /import .* from/;
      const lines = content.split('\n');
      const lastImportIndex = lines.findIndex((line, i, array) => 
        importRegex.test(line) && 
        (i === array.length - 1 || !importRegex.test(array[i + 1]))
      );
      
      if (lastImportIndex !== -1) {
        // Add import after the last import
        const updatedLines = [
          ...lines.slice(0, lastImportIndex + 1),
          importLine,
          ...lines.slice(lastImportIndex + 1)
        ];
        updatedContent = updatedLines.join('\n');
      } else {
        // Add import at the beginning
        updatedContent = `${importLine}\n${content}`;
      }
    }
    
    // Write the updated content back to the file
    fs.writeFileSync(fullPath, updatedContent);
    console.log(`  Added ${usedIcons.size} missing icons to ${filePath}`);
    return true;
  } catch (error) {
    console.error(`Error fixing missing icons in ${filePath}:`, error);
    return false;
  }
}

function main() {
  console.log('Fixing missing icon imports...');
  
  let fixedFiles = 0;
  
  // Check if files exist
  console.log('Checking for files:');
  FILES_WITH_MISSING_ICONS.forEach(file => {
    const fullPath = path.join(__dirname, file);
    console.log(`${file}: ${fs.existsSync(fullPath) ? 'Exists' : 'Not found'}`);
  });
  
  FILES_WITH_MISSING_ICONS.forEach(file => {
    if (fixMissingIcons(file)) {
      fixedFiles++;
    }
  });
  
  console.log(`\nFixed icon imports in ${fixedFiles} files.`);
}

main();
