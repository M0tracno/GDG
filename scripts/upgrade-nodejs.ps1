# Node.js Upgrade Script for Windows
# Run this script as Administrator

Write-Host "🚀 Node.js Upgrade Script" -ForegroundColor Green
Write-Host "=========================" -ForegroundColor Green

# Check current version
$currentVersion = node --version 2>$null
if ($currentVersion) {
    Write-Host "Current Node.js version: $currentVersion" -ForegroundColor Yellow
} else {
    Write-Host "Node.js not found or not in PATH" -ForegroundColor Red
}

# Check if winget is available
try {
    winget --version | Out-Null
    $wingetAvailable = $true
    Write-Host "✅ Windows Package Manager (winget) is available" -ForegroundColor Green
} catch {
    $wingetAvailable = $false
    Write-Host "❌ Windows Package Manager (winget) not available" -ForegroundColor Red
}

Write-Host ""
Write-Host "Choose upgrade method:" -ForegroundColor Cyan
Write-Host "1. Download from nodejs.org (Manual)" -ForegroundColor White
Write-Host "2. Use winget (Automatic)" -ForegroundColor White
Write-Host "3. Use Chocolatey (Automatic)" -ForegroundColor White
Write-Host "4. Exit" -ForegroundColor White

$choice = Read-Host "Enter your choice (1-4)"

switch ($choice) {
    "1" {
        Write-Host "Opening Node.js download page..." -ForegroundColor Yellow
        Start-Process "https://nodejs.org/en/download/"
        Write-Host "Please download and install Node.js 18 LTS, then restart this terminal" -ForegroundColor Yellow
    }
    "2" {
        if ($wingetAvailable) {
            Write-Host "Installing Node.js 18 LTS via winget..." -ForegroundColor Yellow
            winget install OpenJS.NodeJS.LTS
            Write-Host "✅ Installation complete! Please restart your terminal." -ForegroundColor Green
        } else {
            Write-Host "❌ winget not available. Please use option 1 or 3." -ForegroundColor Red
        }
    }
    "3" {
        Write-Host "Installing Chocolatey and Node.js..." -ForegroundColor Yellow
        
        # Install Chocolatey
        Set-ExecutionPolicy Bypass -Scope Process -Force
        [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
        iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
        
        # Refresh environment
        $env:ChocolateyInstall = Convert-Path "$((Get-Command choco).Path)\..\.."
        Import-Module "$env:ChocolateyInstall\helpers\chocolateyProfile.psm1"
        
        # Install Node.js
        choco install nodejs-lts -y
        
        Write-Host "✅ Installation complete! Please restart your terminal." -ForegroundColor Green
    }
    "4" {
        Write-Host "Exiting..." -ForegroundColor Yellow
        exit
    }
    default {
        Write-Host "Invalid choice. Exiting..." -ForegroundColor Red
        exit
    }
}

Write-Host ""
Write-Host "After restarting your terminal, run these commands to verify:" -ForegroundColor Cyan
Write-Host "node --version" -ForegroundColor White
Write-Host "npm --version" -ForegroundColor White
Write-Host "firebase --version" -ForegroundColor White
