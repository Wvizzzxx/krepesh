@echo off
chcp 65001 >nul
echo.
echo ================================================
echo   🔩 КРЕПЁЖ — Запуск всех сервисов
echo ================================================
echo.
echo   Сайт:       http://localhost:3000
echo   Админка:    http://localhost:3002
echo   API:        http://localhost:3001
echo.
echo ================================================
echo.

:: Проверка MongoDB
echo Проверка MongoDB...
net start | findstr /i "MongoDB" >nul
if errorlevel 1 (
    echo ⚠️  MongoDB не запущен. Попытка запуска...
    net start MongoDB >nul 2>&1
    if errorlevel 1 (
        echo.
        echo ❌ Не удалось запустить MongoDB.
        echo Запустите его вручную или через\Services (Win+R → services.msc)
        echo.
    ) else (
        echo ✅ MongoDB запущен
    )
) else (
    echo ✅ MongoDB уже запущен
)
echo.

:: Запуск API
echo Запуск API сервера (порт 3001)...
start "KREPEJ API" cmd /k "cd /d "%~dp0apps\api" && npx tsx src\index.ts"
timeout /t 3 /nobreak >nul

:: Запуск Web
echo Запуск сайта (порт 3000)...
start "KREPEJ Web" cmd /k "cd /d "%~dp0" && pnpm dev:web"
timeout /t 2 /nobreak >nul

:: Запуск Admin
echo Запуск админки (порт 3002)...
start "KREPEJ Admin" cmd /k "cd /d "%~dp0" && pnpm dev:admin"

echo.
echo ================================================
echo   Все сервисы запускаются в отдельных окнах!
echo ================================================
echo.
echo   Подождите несколько секунд пока всё запустится.
echo   Затем откройте в браузере:
echo.
echo   🌐 Сайт:      http://localhost:3000
echo   ⚙️  Админка:   http://localhost:3002
echo.
echo   Для остановки закройте окна или нажмите Ctrl+C
echo.
pause