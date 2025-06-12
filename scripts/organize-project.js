const fs = require('fs');
const path = require('path');

// Create directory structure for organized project
function organizeProject() {
  console.log('🏗️ Organizing project structure...');
  
  // Create organization folders
  const folders = [
    'docs',
    'scripts/fixes',
    'scripts/deployment',
    'docs/implementation-guides',
    'docs/fixes-reports'
  ];
  
  folders.forEach(folder => {
    const fullPath = path.join(process.cwd(), folder);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`✅ Created folder: ${folder}`);
    }
  });
  
  // Files to move to docs/
  const docsFiles = [
    'ADD-USER-BUTTON-FIX.md',
    'ADMIN_DASHBOARD_MENU_OVERLAP_FIX.md',
    'ADMIN_DASHBOARD_NAVIGATION_FIXED.md',
    'ADMIN_DASHBOARD_REAL_TIME_COMPLETE.md',
    'ADMIN_LOGIN_EXTREME_VISIBILITY_TEST.md',
    'ADMIN_LOGIN_FIX.md',
    'ADMIN_LOGIN_VISIBILITY_FIX.md',
    'ADMIN_SYSTEM_FIXES_COMPLETE.md',
    'ATTENDANCE_MANAGEMENT_ENHANCEMENT.md',
    'CODEBASE_CLEANUP_COMPLETION_REPORT.md',
    'CODEBASE_ORGANIZATION.md',
    'CODE_FIXES_SUMMARY.md',
    'COMPILATION_ERRORS_FIXED_REPORT.md',
    'COMPREHENSIVE_ENHANCEMENT_PLAN.md',
    'COURSE_ALLOCATION_TESTING_GUIDE.md',
    'CURRENT_PROJECT_STATUS.md',
    'DEPLOYMENT.md',
    'EMAIL_FIX_GUIDE.md',
    'ENHANCED_COMMUNICATION_COMPLETE.md',
    'ENHANCED_UI_GUIDE.md',
    'FACULTY_DASHBOARD_DROPDOWN_ALIGNMENT_FIX.md',
    'FIREBASE_CONSOLE_SETUP_GUIDE.md',
    'FIREBASE_INTEGRATION_COMPLETE.md',
    'FIREBASE_INTEGRATION_GUIDE.md',
    'FIREBASE_PRODUCTION_SETUP.md',
    'FIREBASE_QUICK_SETUP_GUIDE.md',
    'FIREBASE_SETUP_GUIDE.md',
    'FRAMEWORK_DOCUMENTATION.md',
    'GOOGLE_CLOUD_INTEGRATION_COMPLETE.md',
    'GOOGLE_CLOUD_INTEGRATION_GUIDE.md',
    'GOOGLE_CLOUD_INTEGRATION_PLAN.md',
    'GOOGLE_CLOUD_REQUIRED_DETAILS.md',
    'GOOGLE_CLOUD_SETUP_GUIDE.md',
    'LANDING_PAGE_ENHANCEMENT_COMPLETE.md',
    'LOGIN_FORMS_ENHANCEMENT.md',
    'LOGIN_FORM_FIX_COMPLETE.md',
    'MONGODB_ATLAS_SETUP.md',
    'MONGODB_CHECKLIST.md',
    'MONGODB_MIGRATION.md',
    'MONGODB_MIGRATION_COMPLETE.md',
    'MSG91_INTEGRATION_COMPLETE.md',
    'MUI_V7_FIXES.md',
    'PARENT_LOGIN_ENHANCEMENT.md',
    'PARENT_LOGIN_SYSTEM_COMPLETE.md',
    'PHASE2_CONTEXT_ERROR_RESOLVED.md',
    'PHASE_1_COMPLETION_REPORT.md',
    'PHASE_1_IMPLEMENTATION_GUIDE.md',
    'PHASE_2_COMPLETE_SUCCESS.md',
    'PHASE_2_COMPLETION_REPORT.md',
    'PHASE_2_IMPLEMENTATION_GUIDE.md',
    'PHASE_2_OPTIMIZATION_COMPLETE.md',
    'PHASE_3A_IMPLEMENTATION_COMPLETE.md',
    'PHASE_3B_COMPLETION_REPORT.md',
    'PHASE_3C_IMPLEMENTATION_GUIDE.md',
    'PHASE_3_IMPLEMENTATION_GUIDE.md',
    'PHASE_4_IMPLEMENTATION_GUIDE.md',
    'PHASE_5_IMPLEMENTATION_GUIDE.md',
    'PHASE_5_SECURITY_IMPLEMENTATION_GUIDE.md',
    'PHASE_6_IMPLEMENTATION_GUIDE.md',
    'PHASE_7_IMPLEMENTATION_GUIDE.md',
    'PHASE_8_IMPLEMENTATION_GUIDE.md',
    'PRODUCTION_CHECKLIST.md',
    'PRODUCTION_DEPLOYMENT_CHECKLIST.md',
    'PRODUCTION_READY_SUMMARY.md',
    'RUNTIME_ERROR_FIX_COMPLETE.md',
    'SCROLLTOP_FIX_COMPLETE.md',
    'SECURITY_IMPROVEMENTS.md',
    'SECURITY_SERVICE_RUNTIME_ERROR_FIXED.md',
    'STARTUP_PERFORMANCE_OPTIMIZATION.md',
    'STARTUP_PERFORMANCE_SUCCESS.md',
    'TOKEN_VALIDATION_AND_LAYOUT_FIXES_COMPLETE.md',
    'UI_ENHANCEMENT_SUMMARY.md'
  ];
  
  // Fix scripts to move to scripts/fixes/
  const fixScripts = [
    'advanced-import-cleanup.js',
    'backup-security-dashboard.js',
    'check-firebase-config.js',
    'cleanup-unused-imports.js',
    'comprehensive-duplicate-import-fixer.js',
    'comprehensive-fix.mjs',
    'comprehensive-syntax-cleanup.js',
    'fix-additional-issues.js',
    'fix-all-files.js',
    'fix-all-mui-grid-issues.js',
    'fix-box-tags.js',
    'fix-broken-imports.js',
    'fix-critical-type-assertions.js',
    'fix-dashboard.js',
    'fix-double-as-statements.js',
    'fix-duplicate-imports.js',
    'fix-duplicate-imports.ps1',
    'fix-empty-components.js',
    'fix-grid-syntax.js',
    'fix-imports.js',
    'fix-incomplete-imports.js',
    'fix-makestyles-imports-improved.ps1',
    'fix-makestyles-imports.ps1',
    'fix-makestyles.js',
    'fix-malformed-imports.js',
    'fix-missing-icons.js',
    'fix-missing-imports.js',
    'fix-mui-box.js',
    'fix-mui-grid-issues.js',
    'fix-mui-imports.js',
    'fix-nonexistent-icons.js',
    'fix-orphaned-imports.js',
    'fix-remaining-syntax-errors.js',
    'fix-remaining-type-assertions.ps1',
    'fix-security-dashboard-comprehensive.js',
    'fix-security-dashboard.js',
    'fix-specific-issues.js',
    'fix-syntax-errors.js',
    'fix-theme-issues.js',
    'fixed-arvr-space.js',
    'mobile-optimization-fix.js',
    'optimize-mui-imports.js',
    'quick-import-dedup.js',
    'rewrite-mobile-optimization.js',
    'rewrite-security-dashboard.js',
    'rewrite-security-integration.js',
    'rewrite-security-settings.js',
    'security-dashboard-backup.js',
    'test-fixes.js',
    'update-alert-imports.js',
    'update-makestyles.js',
    'update-mui-imports.js',
    'verify-fixes.js'
  ];
  
  // Deployment scripts to move to scripts/deployment/
  const deploymentScripts = [
    'deploy-cloud-functions.ps1',
    'health-check.ps1',
    'setup-firebase.js',
    'setup-production-firebase.js',
    'simple-health-check.ps1',
    'start-dev.bat',
    'start-dev.ps1',
    'test-production.bat',
    'verify-firebase-production.js'
  ];
  
  // Move files to appropriate directories
  function moveFiles(files, targetDir) {
    files.forEach(file => {
      const sourcePath = path.join(process.cwd(), file);
      const targetPath = path.join(process.cwd(), targetDir, file);
      
      if (fs.existsSync(sourcePath)) {
        try {
          fs.renameSync(sourcePath, targetPath);
          console.log(`✅ Moved ${file} to ${targetDir}/`);
        } catch (error) {
          console.log(`⚠️ Could not move ${file}: ${error.message}`);
        }
      }
    });
  }
  
  moveFiles(docsFiles, 'docs');
  moveFiles(fixScripts, 'scripts/fixes');
  moveFiles(deploymentScripts, 'scripts/deployment');
  
  // Clean up remaining temporary files
  const tempFiles = [
    'ai-teacher-assistant.zip',
    'test-attachment.txt',
    'package.test.json'
  ];
  
  tempFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        console.log(`🗑️ Removed temporary file: ${file}`);
      } catch (error) {
        console.log(`⚠️ Could not remove ${file}: ${error.message}`);
      }
    }
  });
  
  console.log('\n🎉 Project organization completed!');
  console.log('📁 Files organized into:');
  console.log('   📋 docs/ - Documentation and guides');
  console.log('   🔧 scripts/fixes/ - Fix scripts');
  console.log('   🚀 scripts/deployment/ - Deployment scripts');
}

organizeProject();
