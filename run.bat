@echo off
title Web Ban Hang

echo ===================================================
echo           Starting Web Ban Hang
echo ===================================================
echo.

set "PHP=C:\xampp\php\php.exe"

if not exist "%PHP%" (
    echo [ERROR] Khong tim thay PHP:
    echo %PHP%
    echo.
    pause
    exit /b
)

echo [1/2] Starting Backend...
start "Backend Server" /D "%~dp0backend" cmd /k ""%PHP%" -S localhost:8080"

echo [2/2] Starting Frontend...
start "Frontend Server" /D "%~dp0frontend" cmd /k ""%PHP%" -S 127.0.0.1:5500"

echo.
echo ===================================================
echo Backend : http://localhost:8080
echo Frontend: http://127.0.0.1:5500
echo ===================================================
echo.

pause