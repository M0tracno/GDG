@echo off
echo.
echo ====================================================
echo    🚀 GDC PRODUCTION BUILD AND TEST
echo ====================================================
echo.
echo This script will:
echo ✅ Build your app for production
echo ✅ Start production server
echo ✅ Test Firebase authentication
echo.

echo 📦 Building production version...
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Build failed! Check the errors above.
    pause
    exit /b 1
)

echo ✅ Build successful!
echo.
echo 🌐 Starting production server...
echo.
echo 📋 Testing Instructions:
echo 1. App will open at http://localhost:3000
echo 2. Try registering a new user
echo 3. Check your email for verification
echo 4. Login with verified account
echo 5. Test all features without demo mode
echo.
echo Press any key to start the server...
pause > nul

echo Starting server...
call npm start
