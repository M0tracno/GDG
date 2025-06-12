const fs = require('fs');
const path = require('path');

// Fix duplicate methods in enhancedFacultyService.js
function fixDuplicateMethods() {
  console.log('🔧 Fixing duplicate methods in enhancedFacultyService.js...');
  
  const filePath = path.join(process.cwd(), 'src/services/enhancedFacultyService.js');
  
  if (!fs.existsSync(filePath)) {
    console.log('❌ enhancedFacultyService.js not found');
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Find and remove the duplicate getQuizAnalytics method (around line 1791)
  const duplicateQuizAnalyticsPattern = /\/\*\*\s*\*\s*Get quiz analytics data\s*\*\/\s*async getQuizAnalytics\(quizId\) \{[\s\S]*?^\s*\}/gm;
  
  const matches = content.match(duplicateQuizAnalyticsPattern);
  if (matches && matches.length > 1) {
    console.log(`Found ${matches.length} getQuizAnalytics methods, removing duplicates...`);
    
    // Keep only the first occurrence
    let firstOccurrence = true;
    content = content.replace(duplicateQuizAnalyticsPattern, (match) => {
      if (firstOccurrence) {
        firstOccurrence = false;
        return match;
      }
      return ''; // Remove duplicate
    });
  }
  
  // Find and remove the duplicate getCommunicationData method (around line 1673)
  const duplicateCommunicationPattern = /\/\*\*\s*\*\s*Get communication data for faculty communication center\s*\*\/\s*async getCommunicationData\(\) \{[\s\S]*?^\s*\}/gm;
  
  const commMatches = content.match(duplicateCommunicationPattern);
  if (commMatches && commMatches.length > 1) {
    console.log(`Found ${commMatches.length} getCommunicationData methods, removing duplicates...`);
    
    // Keep only the first occurrence
    let firstCommOccurrence = true;
    content = content.replace(duplicateCommunicationPattern, (match) => {
      if (firstCommOccurrence) {
        firstCommOccurrence = false;
        return match;
      }
      return ''; // Remove duplicate
    });
  }
  
  // Clean up any extra empty lines
  content = content.replace(/\n\n\n+/g, '\n\n');
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ Fixed duplicate methods in enhancedFacultyService.js');
}

// Fix duplicate keys in ReportsAnalyticsNew.js
function fixDuplicateKeys() {
  console.log('🔧 Fixing duplicate keys in ReportsAnalyticsNew.js...');
  
  const filePath = path.join(process.cwd(), 'src/components/admin/ReportsAnalyticsNew.js');
  
  if (!fs.existsSync(filePath)) {
    console.log('❌ ReportsAnalyticsNew.js not found');
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix duplicate md keys in Grid size objects
  content = content.replace(/size=\{\{([^}]*),md:\d+,md:[\d.]+\}\}/g, (match, beforeMd) => {
    // Extract the md value after the last comma
    const mdMatch = match.match(/,md:([\d.]+)\}\}$/);
    if (mdMatch) {
      return `size={{${beforeMd},md:${mdMatch[1]}}}`;
    }
    return match;
  });
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ Fixed duplicate keys in ReportsAnalyticsNew.js');
}

// Run all fixes
console.log('🚀 Starting critical ESLint error fixes...\n');
fixDuplicateKeys();
fixDuplicateMethods();
console.log('\n🎉 Critical ESLint error fixes completed!');
console.log('Run "npm run build" to verify the fixes.');
