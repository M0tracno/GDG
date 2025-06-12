# AI Teacher Assistant - GitHub and Firebase Deployment Script
# Run this script to automatically set up GitHub and Firebase

Write-Host "AI Teacher Assistant - Deployment Setup" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green

# Check if git is initialized
if (-not (Test-Path ".git")) {
    Write-Host "Initializing Git repository..." -ForegroundColor Yellow
    git init
    Write-Host "Git repository initialized" -ForegroundColor Green
} else {
    Write-Host "Git repository already exists" -ForegroundColor Green
}

# Add files to git
Write-Host "Adding files to Git..." -ForegroundColor Yellow
git add .

# Check if there are changes to commit
$status = git status --porcelain
if ($status) {
    Write-Host "Creating initial commit..." -ForegroundColor Yellow
    git commit -m "Initial commit: AI Teacher Assistant platform with organized structure

Features:
- React-based AI Teacher Assistant platform
- Firebase integration for backend services
- Material-UI v7 components
- Organized project structure with docs and scripts
- Firebase hosting configuration
- Security rules for Firestore and Storage"

    Write-Host "Initial commit created" -ForegroundColor Green
} else {
    Write-Host "No changes to commit" -ForegroundColor Green
}

# Prompt for GitHub repository URL
Write-Host ""
Write-Host "GitHub Setup" -ForegroundColor Cyan
Write-Host "=================" -ForegroundColor Cyan
$repoUrl = Read-Host "Enter your GitHub repository URL (e.g., https://github.com/username/ai-teacher-assistant.git)"

if ($repoUrl) {
    Write-Host "Adding GitHub remote..." -ForegroundColor Yellow
    try {
        git remote add origin $repoUrl
        Write-Host "GitHub remote added" -ForegroundColor Green
    } catch {
        Write-Host "Remote might already exist, updating..." -ForegroundColor Yellow
        git remote set-url origin $repoUrl
    }

    Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
    git branch -M main
    git push -u origin main
    Write-Host "Code pushed to GitHub successfully!" -ForegroundColor Green
} else {
    Write-Host "Skipping GitHub setup" -ForegroundColor Yellow
}

# Firebase setup
Write-Host ""
Write-Host "Firebase Setup" -ForegroundColor Cyan
Write-Host "==================" -ForegroundColor Cyan

$setupFirebase = Read-Host "Do you want to set up Firebase now? (y/N)"
if ($setupFirebase -eq "y" -or $setupFirebase -eq "Y") {
    Write-Host "Logging into Firebase..." -ForegroundColor Yellow
    firebase login

    Write-Host "Initializing Firebase project..." -ForegroundColor Yellow
    Write-Host "Select the following options:" -ForegroundColor Yellow
    Write-Host "- Hosting: Configure files for Firebase Hosting" -ForegroundColor Yellow
    Write-Host "- Functions: Configure Firebase Functions" -ForegroundColor Yellow
    Write-Host "- Firestore: Configure rules and indexes" -ForegroundColor Yellow
    Write-Host "- Storage: Configure security rules" -ForegroundColor Yellow
    
    firebase init

    # Build and deploy
    $deploy = Read-Host "Do you want to build and deploy now? (y/N)"
    if ($deploy -eq "y" -or $deploy -eq "Y") {
        Write-Host "Building project..." -ForegroundColor Yellow
        npm run build

        Write-Host "Deploying to Firebase..." -ForegroundColor Yellow
        firebase deploy

        Write-Host "Deployment completed!" -ForegroundColor Green
        
        # Get project info
        Write-Host ""
        Write-Host "Your app is now live!" -ForegroundColor Green
        Write-Host "Check your Firebase console for the hosting URL" -ForegroundColor Yellow
    }
} else {
    Write-Host "Skipping Firebase setup" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "==================" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Configure your environment variables in .env.production" -ForegroundColor White
Write-Host "2. Set up your Firebase project configuration" -ForegroundColor White
Write-Host "3. Configure Google Cloud AI services" -ForegroundColor White
Write-Host "4. Test your deployment" -ForegroundColor White
Write-Host ""
Write-Host "Check DEPLOYMENT_GUIDE.md for detailed instructions" -ForegroundColor Cyan
