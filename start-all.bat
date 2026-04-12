@echo off
echo ===================================
echo KREPEJ - Запуск всех сервисов
echo ===================================
echo.
echo API Server:    http://localhost:3001
echo Web Site:      http://localhost:3000
echo Admin Panel:   http://localhost:3002
echo.
echo Запуск в отдельных окнах...
echo.

start "KREPEJ API" cmd /k "cd /d C:\Users\User\Desktop\KREPEJ\apps\api && npx tsx src\index.ts"
timeout /t 3 /nobreak >nul

start "KREPEJ Web" cmd /k "cd /d C:\Users\User\Desktop\KREPEJ && pnpm dev:web"
timeout /t 2 /nobreak >nul

start "KREPEJ Admin" cmd /k "cd /d C:\Users\User\Desktop\KREPEJ && pnpm dev:admin"

echo.
echo ===================================
echo Все сервисы запускаются...
echo ===================================
echo.
echo Дождитесь сообщений о успешном запуске в каждом окне.
echo.
pause
