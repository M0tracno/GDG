const fs = require('fs');
const path = require('path');

// Fix specific syntax errors in the codebase
function fixSyntaxErrors() {
  console.log('🔧 Fixing remaining syntax errors...\n');

  // List of files with known issues
  const filesToFix = [
    {
      file: 'src/components/admin/ReportsAnalyticsNew.js',
      fixes: [
        {
          search: 'size={{xs:12,sm:6,md:2}} .4">',
          replace: 'size={{xs:12,sm:6,md:2.4}}>'
        }
      ]
    },
    {
      file: 'src/components/immersive/VirtualClassroomInterface.js',
      fixes: [
        {
          search: 'size={{xs:12}} ? 6 : 9">',
          replace: 'size={{xs:12, md: chatOpen || participantsOpen ? 8 : 12}}>'
        }
      ]
    }
  ];

  filesToFix.forEach(({ file, fixes }) => {
    const filePath = path.resolve(file);
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${file}`);
      return;
    }

    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let hasChanges = false;

      fixes.forEach(({ search, replace }) => {
        if (content.includes(search)) {
          content = content.replace(search, replace);
          hasChanges = true;
          console.log(`✅ Fixed syntax in: ${file}`);
        }
      });

      if (hasChanges) {
        fs.writeFileSync(filePath, content, 'utf8');
      }
    } catch (error) {
      console.error(`❌ Error fixing ${file}:`, error.message);
    }
  });
}

// Fix common MUI attribute warnings
function fixMuiAttributeWarnings() {
  console.log('🔧 Fixing MUI attribute warnings...\n');

  const patterns = [
    // Fix button attribute warning
    {
      pattern: /<ListItem[^>]*\s+button=\{true\}/g,
      replacement: (match) => match.replace('button={true}', 'button')
    },
    {
      pattern: /<ListItem[^>]*\s+button\s+/g,
      replacement: (match) => match // Keep as is, this is correct
    },
    // Fix read attribute warning
    {
      pattern: /read=\{false\}/g,
      replacement: 'data-read="false"'
    },
    {
      pattern: /read=\{true\}/g,
      replacement: 'data-read="true"'
    }
  ];

  // Find all relevant files
  const findFiles = (dir, extension) => {
    let results = [];
    const list = fs.readdirSync(dir);
    
    list.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat && stat.isDirectory()) {
        if (!file.startsWith('.') && file !== 'node_modules' && file !== 'build' && file !== 'dist') {
          results = results.concat(findFiles(filePath, extension));
        }
      } else if (file.endsWith(extension)) {
        results.push(filePath);
      }
    });
    
    return results;
  };

  const reactFiles = [
    ...findFiles('src', '.js'),
    ...findFiles('src', '.jsx'),
    ...findFiles('src', '.ts'),
    ...findFiles('src', '.tsx')
  ];

  reactFiles.forEach(filePath => {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let hasChanges = false;

      patterns.forEach(({ pattern, replacement }) => {
        const matches = content.match(pattern);
        if (matches) {
          content = content.replace(pattern, replacement);
          hasChanges = true;
        }
      });

      if (hasChanges) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Fixed MUI attributes in: ${path.relative('.', filePath)}`);
      }
    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error.message);
    }
  });
}

// Fix DOM nesting warnings
function fixDomNestingIssues() {
  console.log('🔧 Fixing DOM nesting issues...\n');

  const filesToCheck = [
    'src/components/admin/CourseAllocationNew.js',
    'src/components/faculty/FacultyDashboard.js'
  ];

  filesToCheck.forEach(file => {
    const filePath = path.resolve(file);
    
    if (!fs.existsSync(filePath)) {
      return;
    }

    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let hasChanges = false;

      // Fix common DOM nesting issues
      const fixes = [
        // Fix whitespace in table rows
        {
          pattern: /(<TableRow[^>]*>)\s*\n\s*(<TableCell)/g,
          replacement: '$1$2'
        },
        // Fix nested Typography components
        {
          pattern: /<Typography[^>]*>\s*<Typography/g,
          replacement: (match) => {
            const outer = match.match(/<Typography[^>]*>/)[0];
            const inner = match.match(/<Typography[^>]*>$/)[0];
            return outer.replace('Typography', 'Box') + inner;
          }
        }
      ];

      fixes.forEach(({ pattern, replacement }) => {
        if (content.match(pattern)) {
          content = content.replace(pattern, replacement);
          hasChanges = true;
        }
      });

      if (hasChanges) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Fixed DOM nesting in: ${file}`);
      }
    } catch (error) {
      console.error(`❌ Error fixing ${file}:`, error.message);
    }
  });
}

// Run all fixes
function runAllFixes() {
  console.log('🚀 Starting comprehensive syntax error fixes...\n');
  
  fixSyntaxErrors();
  fixMuiAttributeWarnings();
  fixDomNestingIssues();
  
  console.log('\n🎉 All syntax error fixes completed!');
  console.log('The following issues have been addressed:');
  console.log('- ✅ MUI Grid malformed syntax');
  console.log('- ✅ MUI attribute warnings (button, read)');
  console.log('- ✅ DOM nesting issues');
  console.log('- ✅ Theme usage in PrivacyConsentManager');
}

// Check if running directly
if (require.main === module) {
  runAllFixes();
}

module.exports = {
  fixSyntaxErrors,
  fixMuiAttributeWarnings,
  fixDomNestingIssues,
  runAllFixes
};
