# 🚀 Node.js Upgrade Guide

## Current Version: 16.20.2
## Required Version: 18.0.0+

## Option 1: Direct Download (Recommended)

1. **Download Node.js 18 LTS:**
   - Go to: https://nodejs.org/en/download/
   - Download "18.x.x LTS" for Windows
   - Run the installer
   - Restart your terminal/PowerShell

2. **Verify Installation:**
   ```powershell
   node --version  # Should show v18.x.x
   npm --version   # Should show 9.x.x or higher
   ```

## Option 2: Using winget (Windows Package Manager)

```powershell
# Install Node.js 18 via winget
winget install OpenJS.NodeJS.LTS

# Restart terminal and verify
node --version
```

## Option 3: Using Chocolatey

```powershell
# Install Chocolatey if not installed
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install Node.js 18
choco install nodejs-lts

# Restart terminal and verify
node --version
```

## Option 4: Using NVM for Windows (Version Manager)

1. **Download NVM for Windows:**
   - Go to: https://github.com/coreybutler/nvm-windows/releases
   - Download nvm-setup.zip
   - Run the installer

2. **Install and Use Node.js 18:**
   ```powershell
   nvm install 18.19.0
   nvm use 18.19.0
   nvm list
   ```

## After Upgrade

1. **Clear npm cache:**
   ```powershell
   npm cache clean --force
   ```

2. **Reinstall Firebase CLI:**
   ```powershell
   npm install -g firebase-tools
   firebase --version
   ```

3. **Test Firebase Login:**
   ```powershell
   firebase login
   ```

## Troubleshooting

If you encounter permission issues:
```powershell
# Run PowerShell as Administrator
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

If npm global packages don't work:
```powershell
# Check global npm path
npm config get prefix
# If needed, add to PATH environment variable
```
