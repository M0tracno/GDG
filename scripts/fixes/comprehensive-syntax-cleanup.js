#!/usr/bin/env node

/**
 * Comprehensive Syntax and Import Cleanup Script
 * Fixes common syntax errors and import issues
 */

const fs = require('fs');
const path = require('path');

let totalFixedFiles = 0;
let totalFixesMade = 0;

/**
 * Find all JS/JSX files recursively
 */
function findJSFiles(dir = './src', files = []) {
  try {
    const dirItems = fs.readdirSync(dir);
    
    for (const item of dirItems) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        findJSFiles(fullPath, files);
      } else if (item.endsWith('.js') || item.endsWith('.jsx')) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error.message);
  }
  
  return files;
}

/**
 * Fix common syntax and import issues
 */
function fixCommonIssues(content, filePath) {
  let fixedContent = content;
  let fixes = [];

  // 1. Fix misplaced const theme = useTheme() inside makeStyles
  const badThemePattern = /makeStyles\(\(theme\)\s*=>\s*\(\{\s*const\s+theme\s*=\s*useTheme\(\);/g;
  if (badThemePattern.test(fixedContent)) {
    fixedContent = fixedContent.replace(badThemePattern, 'makeStyles((theme) => ({');
    fixes.push('Removed misplaced useTheme() inside makeStyles');
  }

  // 2. Fix duplicate imports of the same component with different aliases
  const duplicateImportPattern = /(\w+)\s+as\s+(\w+),\s*[^}]*\1\s+as\s+(\w+)/g;
  if (duplicateImportPattern.test(fixedContent)) {
    // This is complex to fix automatically, so we'll log it
    fixes.push('Found duplicate import aliases (manual fix needed)');
  }

  // 3. Fix incorrect double as statements that weren't caught before
  const doubleAsPattern = /(\w+)\s+as\s+\1\s+as\s+(\w+)/g;
  if (doubleAsPattern.test(fixedContent)) {
    fixedContent = fixedContent.replace(doubleAsPattern, '$1 as $2');
    fixes.push('Fixed double as statements');
  }

  // 4. Fix imports with non-existent icon names
  const iconReplacements = {
    'BackupIcon': 'Backup as BackupIcon',
    'BarChartIcon': 'BarChart as BarChartIcon',
    'BookIcon': 'Book as BookIcon',
    'CloudUploadIcon': 'CloudUpload as CloudUploadIcon',
    'DashboardIcon': 'Dashboard as DashboardIcon',
    'DatabaseIcon': 'Storage as DatabaseIcon',
    'EventIcon': 'Event as EventIcon',
    'FilterIcon': 'FilterList as FilterIcon',
    'ImportExportIcon': 'ImportExport as ImportExportIcon',
    'LineChartIcon': 'ShowChart as LineChartIcon',
    'LogoutIcon': 'Logout as LogoutIcon',
    'MenuIcon': 'Menu as MenuIcon',
    'NotificationsIcon': 'Notifications as NotificationsIcon',
    'PeopleIcon': 'People as PeopleIcon',
    'PersonIcon': 'Person as PersonIcon',
    'ReportsIcon': 'Assessment as ReportsIcon',
    'RestoreIcon': 'Restore as RestoreIcon',
    'SchoolIcon': 'School as SchoolIcon',
    'SettingsIcon': 'Settings as SettingsIcon',
    'StorageIcon': 'Storage as StorageIcon',
    'TrendingUpIcon': 'TrendingUp as TrendingUpIcon',
    'VpnKeyIcon': 'VpnKey as VpnKeyIcon',
    'AssignmentIcon': 'Assignment as AssignmentIcon',
    'QuestionIcon': 'HelpOutline as QuestionIcon',
    'QuizIcon': 'Quiz as QuizIcon',
    'SaveIcon': 'Save as SaveIcon',
    'StudentIcon': 'Person as StudentIcon',
    'ScheduleIcon': 'Schedule as ScheduleIcon'
  };

  for (const [wrong, correct] of Object.entries(iconReplacements)) {
    const wrongPattern = new RegExp(`\\b${wrong}\\b`, 'g');
    if (wrongPattern.test(fixedContent) && !fixedContent.includes(correct)) {
      fixedContent = fixedContent.replace(wrongPattern, correct);
      fixes.push(`Replaced ${wrong} with ${correct}`);
    }
  }

  // 5. Remove duplicate empty lines and trailing spaces
  fixedContent = fixedContent.replace(/\n\s*\n\s*\n/g, '\n\n');
  fixedContent = fixedContent.replace(/[ \t]+$/gm, '');

  return { content: fixedContent, fixes };
}

/**
 * Process a single file
 */
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const { content: fixedContent, fixes } = fixCommonIssues(content, filePath);
    
    if (fixes.length > 0) {
      fs.writeFileSync(filePath, fixedContent, 'utf8');
      console.log(`✅ Fixed ${fixes.length} issue(s) in: ${path.relative(process.cwd(), filePath)}`);
      fixes.forEach(fix => console.log(`   - ${fix}`));
      totalFixedFiles++;
      totalFixesMade += fixes.length;
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Main execution
 */
function main() {
  console.log('🔧 Running comprehensive syntax and import cleanup...\n');
  
  const files = findJSFiles();
  console.log(`Found ${files.length} JavaScript files to check\n`);
  
  for (const file of files) {
    processFile(file);
  }
  
  console.log(`\n🎉 Cleanup complete!`);
  console.log(`Fixed ${totalFixesMade} issues in ${totalFixedFiles} files`);
  console.log('Run "npm run build" to check for remaining errors.');
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { processFile, fixCommonIssues };
