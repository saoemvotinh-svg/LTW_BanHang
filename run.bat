
@echo off
setlocal
title Web Ban Hang

echo ===================================================
echo           Starting Web Ban Hang
echo ===================================================
echo.

REM ==========================================
REM 1. Tim PHP trong cac vi tri pho bien
REM ==========================================

set "PHP="

if exist "C:\xampp\php\php.exe" (
    set "PHP=C:\xampp\php\php.exe"
)

if not defined PHP if exist "D:\xampp\php\php.exe" (
    set "PHP=D:\xampp\php\php.exe"
)

REM ==========================================
REM 2. Neu khong tim thay, cho nhap duong dan
REM ==========================================

if not defined PHP (
    echo [WARNING] Khong tim thay PHP trong C:\xampp hoac D:\xampp
    echo.
    set /p "PHP=Nhap duong dan den php.exe: "
)

REM ==========================================
REM 3. Kiem tra PHP
REM ==========================================

if not exist "%PHP%" (
    echo.
    echo [ERROR] Khong tim thay PHP:
    echo "%PHP%"
    echo.
    pause
    exit /b 1
)

REM ==========================================
REM 4. Kiem tra thu muc du an
REM ==========================================

if not exist "%~dp0backend\" (
    echo [ERROR] Khong tim thay thu muc backend
    echo "%~dp0backend"
    pause
    exit /b 1
)

if not exist "%~dp0frontend\" (
    echo [ERROR] Khong tim thay thu muc frontend
    echo "%~dp0frontend"
    pause
    exit /b 1
)

echo [INFO] PHP: %PHP%
echo.

REM ==========================================
REM 5. Khoi dong Backend
REM ==========================================

echo [1/2] Starting Backend...

start "Backend Server" /D "%~dp0backend" cmd /k ""%PHP%" -S localhost:8080"

REM ==========================================
REM 6. Khoi dong Frontend
REM ==========================================

echo [2/2] Starting Frontend...

start "Frontend Server" /D "%~dp0frontend" cmd /k ""%PHP%" -S 127.0.0.1:5500"

REM ==========================================
REM 7. Hien thi thong tin
REM ==========================================

echo.
echo ===================================================
echo Backend : http://localhost:8080
echo Frontend: http://127.0.0.1:5500
echo ===================================================
echo.

pause
endlocal