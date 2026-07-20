@echo off
title Jolshaa - Starting Servers
echo ========================================
echo   Jolshaa Server Starter
echo ========================================
echo.

:: Kill existing node processes on ports 5173 and 5000
echo Closing existing servers...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173 ^| findstr LISTENING') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000 ^| findstr LISTENING') do taskkill /F /PID %%a >nul 2>&1
timeout /t 1 >nul
echo Done!
echo.

:: Start Backend
echo Starting Backend (port 5000)...
start "Jolshaa Backend" cmd /k "cd /d "%~dp0backend" && npm run dev"

:: Start Frontend
echo Starting Frontend (port 5173)...
start "Jolshaa Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo ========================================
echo   Both servers started!
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:5000
echo ========================================
echo.
timeout /t 3 >nul
