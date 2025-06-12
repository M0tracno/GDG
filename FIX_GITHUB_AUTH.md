# 🔧 Fix GitHub Authentication Issue

## Problem
403 Permission denied error when pushing to GitHub

## Solution Options

### Option 1: Use Personal Access Token (Recommended)

1. **Create Personal Access Token:**
   - Go to GitHub.com → Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Click "Generate new token (classic)"
   - Select scopes: `repo`, `workflow`, `write:packages`
   - Copy the token (save it securely!)

2. **Update Git Remote with Token:**
   ```powershell
   git remote set-url origin https://YOUR_TOKEN@github.com/MOTRACNO/GDG.git
   ```

3. **Configure Git User:**
   ```powershell
   git config --global user.name "MOTRACNO"
   git config --global user.email "your-email@example.com"
   ```

### Option 2: Use SSH (Alternative)

1. **Generate SSH Key:**
   ```powershell
   ssh-keygen -t ed25519 -C "your-email@example.com"
   ```

2. **Add SSH Key to GitHub:**
   - Copy public key: `type ~/.ssh/id_ed25519.pub`
   - Add to GitHub → Settings → SSH and GPG keys

3. **Update Remote to SSH:**
   ```powershell
   git remote set-url origin git@github.com:MOTRACNO/GDG.git
   ```

### Option 3: GitHub CLI (Easiest)

1. **Install GitHub CLI:**
   ```powershell
   winget install GitHub.cli
   ```

2. **Authenticate:**
   ```powershell
   gh auth login
   ```

3. **Push with GitHub CLI:**
   ```powershell
   gh repo sync
   ```

## Quick Fix Command
Replace `YOUR_TOKEN` with your actual token:
```powershell
git remote set-url origin https://YOUR_TOKEN@github.com/MOTRACNO/GDG.git
git push -u origin main
```
