@echo off
REM Script to set the database type in .env file
REM Usage: set-db-type.bat [mongodb|sqlite]

echo Database Type Switcher
echo =====================

IF "%1"=="" (
  echo Error: Please specify a database type: mongodb or sqlite
  echo Usage: set-db-type.bat [mongodb^|sqlite]
  exit /b 1
)

IF NOT "%1"=="mongodb" IF NOT "%1"=="sqlite" (
  echo Error: Invalid database type. Choose either mongodb or sqlite
  echo Usage: set-db-type.bat [mongodb^|sqlite]
  exit /b 1
)

echo Setting database type to: %1

REM Check if .env file exists, create if not
IF NOT EXIST ".env" (
  copy .env.example .env > nul
  echo Created new .env file from .env.example
)

REM Create a temporary file
type .env | findstr /v "DB_TYPE" > .env.tmp

REM Add DB_TYPE entry to the temporary file
echo DB_TYPE=%1>> .env.tmp

REM Replace the original .env file with the temporary file
move /y .env.tmp .env > nul

echo Database type updated successfully!

IF "%1"=="mongodb" (
  echo.
  echo Note: Make sure MongoDB is installed and running.
  echo You can run 'npm run test:mongodb' to verify your MongoDB connection.
  echo Run 'npm run migrate:to-mongodb' to migrate data from SQLite to MongoDB.
) ELSE (
  echo.
  echo Using SQLite for development.
)

echo.
