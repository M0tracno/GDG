# Startup script for AI Teacher Assistant
# This script will start both the frontend and backend servers

# Clears the terminal screen
Clear-Host

Write-Host "Starting AI Teacher Assistant Development Environment..." -ForegroundColor Green

# Function to check if a port is in use
function Test-PortInUse {
    param (
        [int]$Port
    )
    
    try {
        $tcpConnection = New-Object System.Net.Sockets.TcpClient
        $portInUse = $tcpConnection.ConnectAsync("localhost", $Port).Wait(300)
        $tcpConnection.Close()
        return $portInUse
    } catch {
        return $false
    }
}

# Check if backend server is already running
$backendRunning = Test-PortInUse -Port 5000
if ($backendRunning) {
    Write-Host "Backend server is already running on port 5000" -ForegroundColor Yellow
} else {
    # Start backend server
    Write-Host "Starting backend server..." -ForegroundColor Cyan
    
    # Change to backend directory and start the server
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend' ; npm start"
    
    # Wait for backend to start
    Write-Host "Waiting for backend server to initialize..." -ForegroundColor Cyan
    Start-Sleep -Seconds 5
}

# Start frontend server
Write-Host "Starting frontend development server..." -ForegroundColor Cyan
npm start

Write-Host "Dev environment shutdown. Goodbye!" -ForegroundColor Green
