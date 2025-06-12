@echo off
echo ======================================
echo MongoDB Local Setup for Teacher Assistant
echo ======================================

echo.
echo This script will help you set up MongoDB locally for development.
echo.
echo Prerequisites:
echo 1. MongoDB installed locally or accessible via connection string
echo 2. Node.js and npm installed
echo.

REM Check if MongoDB is installed
where mongod >nul 2>nul
if %errorlevel% neq 0 (
    echo WARNING: MongoDB does not seem to be installed or is not in your PATH.
    echo You can download it from https://www.mongodb.com/try/download/community
    echo.
    set /p continue=Do you want to continue anyway? [y/N]: 
    if /I NOT "%continue%"=="y" exit /b
)

echo.
echo Setting up environment...

REM Check if .env file exists
if exist .env (
    echo .env file already exists.
    set /p overwrite=Do you want to overwrite it? [y/N]: 
    if /I NOT "%overwrite%"=="y" goto :skip_env
)

echo Creating .env file...
echo # Server Configuration > .env
echo NODE_ENV=development >> .env
echo PORT=5000 >> .env
echo. >> .env
echo # JWT Settings >> .env
echo JWT_SECRET=dev_secret_please_change_in_production >> .env
echo JWT_EXPIRES_IN=7d >> .env
echo. >> .env
echo # Database Settings >> .env
echo MONGODB_URI=mongodb://localhost:27017/teacher-assistant >> .env

:skip_env
echo.
echo Installing dependencies...
call npm install

echo.
echo Setting up MongoDB collection...
echo. 

echo Starting MongoDB service (if not already running)...
net start MongoDB || (
    echo Failed to start MongoDB service.
    echo Please make sure MongoDB is installed and the service is set up.
    echo.
    echo You can manually start MongoDB with: "mongod" in a separate terminal.
    echo.
    pause
)

echo.
echo Your development environment is ready!
echo.
echo To start the server:
echo npm start
echo.
echo To run migrations from SQLite to MongoDB:
echo npm run migrate:mongodb
echo.
pause
