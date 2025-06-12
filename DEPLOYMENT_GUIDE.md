# AI Teacher Assistant - Deployment Guide

## 🚀 GitHub Setup and Firebase Deployment

This guide will help you push your project to GitHub and deploy it using Firebase Hosting.

### Step 1: Initialize Git Repository

```powershell
# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: AI Teacher Assistant platform"
```

### Step 2: Create GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository
2. Name it `ai-teacher-assistant` 
3. Don't initialize with README (we already have one)
4. Copy the repository URL

### Step 3: Connect to GitHub

```powershell
# Add remote origin (replace with your repository URL)
git remote add origin https://github.com/your-username/ai-teacher-assistant.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 4: Firebase Setup

```powershell
# Install Firebase CLI globally (if not already installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase project
firebase init
```

When prompted, select:
- ✅ Hosting: Configure files for Firebase Hosting
- ✅ Functions: Configure Firebase Functions
- ✅ Firestore: Configure rules and indexes
- ✅ Storage: Configure security rules

### Step 5: Firebase Configuration

1. Select existing project or create new one
2. Set `build` as your public directory
3. Configure as single-page app: **Yes**
4. Set up automatic builds and deploys with GitHub: **No** (for now)

### Step 6: Build and Deploy

```powershell
# Build the project
npm run build

# Deploy to Firebase
firebase deploy
```

### Step 7: Set Up Environment Variables

1. Copy `.env.example` to `.env.production`
2. Fill in your Firebase configuration
3. Add environment variables to Firebase:

```powershell
firebase functions:config:set gemini.api_key="your_key"
firebase functions:config:set mongodb.uri="your_uri"
```

### Step 8: GitHub Actions (Optional)

Create `.github/workflows/deploy.yml` for automatic deployment:

```yaml
name: Deploy to Firebase
on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          projectId: your-project-id
```

## 🔧 Post-Deployment Checklist

- [ ] Firebase project created and configured
- [ ] Environment variables set
- [ ] Firestore security rules deployed
- [ ] Storage security rules deployed
- [ ] Cloud Functions deployed
- [ ] Domain configured (if custom domain)
- [ ] SSL certificate active
- [ ] Analytics configured
- [ ] Monitoring set up

## 🆘 Troubleshooting

### Common Issues

1. **Build fails**: Check `package.json` dependencies
2. **Firebase deploy fails**: Verify permissions and project ID
3. **Functions not working**: Check Cloud Functions logs
4. **Database permission denied**: Review Firestore rules

### Support Commands

```powershell
# Check Firebase projects
firebase projects:list

# View deployment history
firebase hosting:releases

# Check function logs
firebase functions:log

# Test locally
firebase serve
```

## 📞 Support

If you encounter issues:
1. Check the logs: `firebase functions:log`
2. Verify environment variables
3. Test locally: `npm start`
4. Check Firebase console for errors
