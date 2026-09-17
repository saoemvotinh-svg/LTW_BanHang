
@echo off
setlocal
title Web Ban Hang

echo ===================================================
echo           Starting Web Ban Hang
echo ===================================================
echo.

REM ==========================================
REM 1. Tim XAMPP tren tat ca cac o dia
REM ==========================================

set "PHP="

echo [INFO] Dang tim XAMPP...

for %%D in (C D E F G H I J K L M N O P Q R S T U V W X Y Z) do (
    if exist "%%D:\xampp\php\php.exe" (
        set "PHP=%%D:\xampp\php\php.exe"
        goto FOUND_PHP
    )
)

:FOUND_PHP

REM ==========================================
REM 2. Kiem tra PHP
REM ==========================================

if not defined PHP (
    echo [ERROR] Khong tim thay XAMPP tren cac o dia!
    pause
    exit /b 1
)

echo [SUCCESS] Tim thay PHP:
echo "%PHP%"
echo.

REM ==========================================
REM 3. Kiem tra thu muc du an
REM ==========================================

if not exist "%~dp0backend\" (
    echo [ERROR] Khong tim thay thu muc backend!
    pause
    exit /b 1
)

if not exist "%~dp0frontend\" (
    echo [ERROR] Khong tim thay thu muc frontend!
    pause
    exit /b 1
)

REM ==========================================
REM 4. Khoi dong Backend
REM ==========================================

echo [1/2] Starting Backend...

start "Backend Server" /D "%~dp0backend" cmd /k ""%PHP%" -S localhost:8080"

REM ==========================================
REM 5. Khoi dong Frontend
REM ==========================================

echo [2/2] Starting Frontend...

start "Frontend Server" /D "%~dp0frontend" cmd /k ""%PHP%" -S 127.0.0.1:5500"

REM ==========================================
REM 6. Hien thi thong tin
REM ==========================================

echo.
echo ===================================================
echo Backend : http://localhost:8080
echo Frontend: http://127.0.0.1:5500
echo ===================================================
echo.

pause
endlocal