#!/usr/bin/env node

/**
 * Fix Non-existent MUI Icons Script
 * Replaces non-existent MUI icons with appropriate alternatives
 */

const fs = require('fs');
const path = require('path');

// Map of non-existent icons to their replacements
const ICON_REPLACEMENTS = {
  'Security as SecurityIcon': 'Shield as SecurityIcon',
  'Privacy as PrivacyIcon': 'PrivacyTip as PrivacyIcon',
  'AddIcon': 'Add as AddIcon',
  'FilterIcon': 'FilterList as FilterIcon',
  'QuestionIcon': 'HelpOutline as QuestionIcon',
  'QuizIcon': 'Quiz as QuizIcon',
  'SaveIcon': 'Save as SaveIcon',
  'StudentIcon': 'Person as StudentIcon',
  'ScheduleIcon': 'Schedule as ScheduleIcon'
};

/**
 * Find all JS/JSX files recursively
 */
function findJSFiles(dir = './src', files = []) {
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
  
  return files;
}

/**
 * Fix non-existent icons in content
 */
function fixNonExistentIcons(content) {
  let fixedContent = content;
  let changesCount = 0;
  
  for (const [wrongIcon, correctIcon] of Object.entries(ICON_REPLACEMENTS)) {
    if (fixedContent.includes(wrongIcon)) {
      fixedContent = fixedContent.replace(new RegExp(wrongIcon.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), correctIcon);
      changesCount++;
    }
  }
  
  return { content: fixedContent, changes: changesCount };
}

/**
 * Process a single file
 */
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const { content: fixedContent, changes } = fixNonExistentIcons(content);
    
    if (changes > 0) {
      fs.writeFileSync(filePath, fixedContent, 'utf8');
      console.log(`✅ Fixed ${changes} icon(s) in: ${path.relative(process.cwd(), filePath)}`);
      return changes;
    }
    
    return 0;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return 0;
  }
}

/**
 * Main execution
 */
function main() {
  console.log('🔧 Fixing non-existent MUI icons...\n');
  
  const files = findJSFiles();
  console.log(`Found ${files.length} JavaScript files to check\n`);
  
  let totalChanges = 0;
  let fixedFiles = 0;
  
  for (const file of files) {
    const changes = processFile(file);
    if (changes > 0) {
      totalChanges += changes;
      fixedFiles++;
    }
  }
  
  console.log(`\n🎉 Fixed ${totalChanges} non-existent icons in ${fixedFiles} files`);
  console.log('You can now run "npm run build" to check for remaining errors.');
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { processFile, fixNonExistentIcons };
