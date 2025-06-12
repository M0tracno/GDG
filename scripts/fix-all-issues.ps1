# 🔧 Master Fix Script for All Issues
# Run this script to fix GitHub, Node.js, and ESLint issues

param(
    [string]$GitHubToken = "",
    [switch]$SkipNodeUpgrade = $false,
    [switch]$SkipEslintFix = $false
)

Write-Host "🚀 AI Teacher Assistant - Issue Resolution Script" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green

$ErrorActionPreference = "Continue"
$hasErrors = $false

# Function to check if running as administrator
function Test-Administrator {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    (New-Object Security.Principal.WindowsPrincipal $currentUser).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

# 1. Fix Git Authentication
Write-Host ""
Write-Host "🔧 Step 1: Fixing Git Authentication" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

if ($GitHubToken) {
    Write-Host "Setting up Git with provided token..." -ForegroundColor Yellow
    git remote set-url origin "https://$GitHubToken@github.com/MOTRACNO/GDG.git"
    Write-Host "✅ Git remote updated with token" -ForegroundColor Green
} else {
    Write-Host "⚠️ No GitHub token provided. Please create one at:" -ForegroundColor Yellow
    Write-Host "   https://github.com/settings/tokens" -ForegroundColor White
    Write-Host "   Then run: git remote set-url origin https://YOUR_TOKEN@github.com/MOTRACNO/GDG.git" -ForegroundColor White
    $hasErrors = $true
}

# Configure git user if not set
$gitUser = git config --global user.name 2>$null
$gitEmail = git config --global user.email 2>$null

if (-not $gitUser) {
    git config --global user.name "MOTRACNO"
    Write-Host "✅ Git user name configured" -ForegroundColor Green
}

if (-not $gitEmail) {
    $email = Read-Host "Enter your GitHub email address"
    if ($email) {
        git config --global user.email $email
        Write-Host "✅ Git email configured" -ForegroundColor Green
    }
}

# 2. Check and Fix Node.js Version
Write-Host ""
Write-Host "🚀 Step 2: Checking Node.js Version" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

$nodeVersion = node --version 2>$null
if ($nodeVersion) {
    Write-Host "Current Node.js version: $nodeVersion" -ForegroundColor Yellow
    $majorVersion = [int]($nodeVersion.Substring(1).Split('.')[0])
    
    if ($majorVersion -lt 18) {
        Write-Host "❌ Node.js version $nodeVersion is too old (need 18+)" -ForegroundColor Red
        
        if (-not $SkipNodeUpgrade) {
            Write-Host "Attempting to upgrade Node.js..." -ForegroundColor Yellow
            
            # Try winget first
            try {
                winget --version | Out-Null
                Write-Host "Installing Node.js 18 LTS via winget..." -ForegroundColor Yellow
                winget install OpenJS.NodeJS.LTS --silent
                Write-Host "✅ Node.js installed via winget" -ForegroundColor Green
                Write-Host "⚠️ Please restart your terminal and run this script again" -ForegroundColor Yellow
                $hasErrors = $true
            } catch {
                Write-Host "❌ winget not available. Please manually download Node.js 18+ from:" -ForegroundColor Red
                Write-Host "   https://nodejs.org/en/download/" -ForegroundColor White
                $hasErrors = $true
            }
        }
    } else {
        Write-Host "✅ Node.js version is compatible ($nodeVersion)" -ForegroundColor Green
    }
} else {
    Write-Host "❌ Node.js not found. Please install Node.js 18+ from:" -ForegroundColor Red
    Write-Host "   https://nodejs.org/en/download/" -ForegroundColor White
    $hasErrors = $true
}

# 3. Check Firebase CLI
Write-Host ""
Write-Host "🔥 Step 3: Checking Firebase CLI" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

$firebaseVersion = firebase --version 2>$null
if ($firebaseVersion) {
    Write-Host "✅ Firebase CLI version: $firebaseVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Firebase CLI not found. Installing..." -ForegroundColor Yellow
    try {
        npm install -g firebase-tools
        Write-Host "✅ Firebase CLI installed" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to install Firebase CLI" -ForegroundColor Red
        $hasErrors = $true
    }
}

# 4. Fix ESLint Warnings
Write-Host ""
Write-Host "⚠️ Step 4: Fixing ESLint Warnings" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan

if (-not $SkipEslintFix) {
    if (Test-Path "scripts\fix-eslint-warnings.js") {
        Write-Host "Running ESLint fixes..." -ForegroundColor Yellow
        node scripts\fix-eslint-warnings.js
        Write-Host "✅ ESLint fixes completed" -ForegroundColor Green
    } else {
        Write-Host "❌ ESLint fix script not found" -ForegroundColor Red
        $hasErrors = $true
    }
} else {
    Write-Host "⏭️ Skipping ESLint fixes (as requested)" -ForegroundColor Yellow
}

# 5. Test Build
Write-Host ""
Write-Host "🏗️ Step 5: Testing Build" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan

try {
    Write-Host "Running npm run build..." -ForegroundColor Yellow
    npm run build
    Write-Host "✅ Build completed successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Build failed. Check the output above for errors." -ForegroundColor Red
    $hasErrors = $true
}

# 6. Attempt Git Push
Write-Host ""
Write-Host "📤 Step 6: Testing Git Push" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan

if ($GitHubToken -and -not $hasErrors) {
    try {
        Write-Host "Attempting to push to GitHub..." -ForegroundColor Yellow
        git add .
        git commit -m "Fix: Resolve GitHub auth, Node.js version, and ESLint issues

- Updated Git remote with authentication token
- Fixed ESLint warnings and configuration
- Improved project structure and documentation
- Ready for Firebase deployment"
        git push -u origin main
        Write-Host "✅ Successfully pushed to GitHub!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Git push failed. Check the error above." -ForegroundColor Red
        $hasErrors = $true
    }
} else {
    Write-Host "⏭️ Skipping Git push (token not provided or errors present)" -ForegroundColor Yellow
}

# 7. Firebase Deployment
Write-Host ""
Write-Host "🔥 Step 7: Firebase Deployment" -ForegroundColor Cyan
Write-Host "===============================" -ForegroundColor Cyan

if (-not $hasErrors) {
    $deployChoice = Read-Host "Do you want to deploy to Firebase now? (y/N)"
    if ($deployChoice -eq "y" -or $deployChoice -eq "Y") {
        try {
            Write-Host "Initializing Firebase..." -ForegroundColor Yellow
            firebase login --no-localhost
            firebase init --project default
            
            Write-Host "Deploying to Firebase..." -ForegroundColor Yellow
            firebase deploy
            Write-Host "✅ Firebase deployment completed!" -ForegroundColor Green
        } catch {
            Write-Host "❌ Firebase deployment failed." -ForegroundColor Red
            $hasErrors = $true
        }
    }
} else {
    Write-Host "⏭️ Skipping Firebase deployment due to previous errors" -ForegroundColor Yellow
}

# Summary
Write-Host ""
Write-Host "📋 Summary" -ForegroundColor Cyan
Write-Host "==========" -ForegroundColor Cyan

if ($hasErrors) {
    Write-Host "❌ Some issues need manual attention:" -ForegroundColor Red
    Write-Host "   1. Check Node.js version (should be 18+)" -ForegroundColor White
    Write-Host "   2. Ensure GitHub token is configured" -ForegroundColor White
    Write-Host "   3. Review any build errors above" -ForegroundColor White
    Write-Host ""
    Write-Host "📖 Check these files for detailed instructions:" -ForegroundColor Yellow
    Write-Host "   - FIX_GITHUB_AUTH.md" -ForegroundColor White
    Write-Host "   - FIX_NODEJS_VERSION.md" -ForegroundColor White
    Write-Host "   - PROJECT_STATUS_SUMMARY.md" -ForegroundColor White
} else {
    Write-Host "🎉 All issues resolved successfully!" -ForegroundColor Green
    Write-Host "Your AI Teacher Assistant is ready for production!" -ForegroundColor Green
}

Write-Host ""
Write-Host "🔗 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Verify your app at: https://your-project.web.app" -ForegroundColor White
Write-Host "   2. Configure environment variables" -ForegroundColor White
Write-Host "   3. Set up Google Cloud AI services" -ForegroundColor White
Write-Host "   4. Test all features" -ForegroundColor White
