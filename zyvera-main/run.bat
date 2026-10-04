@echo off
title Zyvera Cyber Academy Local Host Launcher
echo ===================================================
echo   Starting Zyvera Cyber Academy Web Portal...
echo ===================================================
echo.

:: Check virtual environment
if not exist ".venv\" (
    echo [ERROR] Virtual environment .venv not found.
    echo Please ensure the setup is correct.
    pause
    exit /b 1
)

:: Open the browser asynchronously
echo [INFO] Launching portal in default browser...
start "" "http://127.0.0.1:8080"

:: Start Uvicorn Server
echo [INFO] Running FastAPI backend...
.venv\Scripts\uvicorn.exe main:app --host 0.0.0.0 --port 8080

pause
