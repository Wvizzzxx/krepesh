@echo off
chcp 65001 >nul
echo.
echo ================================================
echo   КРЕПЁЖ — Первая настройка проекта
echo ================================================
echo.

:: Проверка Node.js
echo [1/5] Проверка Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js не найден!
    echo.
    echo Скачайте и установите Node.js с:
    echo https://nodejs.org/
    echo.
    echo Выберите версию LTS (рекомендуется)
    echo При установке поставьте галочку "Automatically install the necessary tools"
    echo.
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do echo ✅ Node.js %%i

:: Проверка pnpm
echo.
echo [2/5] Проверка pnpm...
pnpm --version >nul 2>&1
if errorlevel 1 (
    echo Установка pnpm...
    call npm install -g pnpm
)
for /f "tokens=*" %%i in ('pnpm --version') do echo ✅ pnpm %%i

:: Проверка MongoDB
echo.
echo [3/5] Проверка MongoDB...
mongosh --version >nul 2>&1
if errorlevel 1 (
    mongod --version >nul 2>&1
    if errorlevel 1 (
        echo ⚠️  MongoDB не найден в PATH
        echo.
        echo Если MongoDB установлен как служба — всё в порядке.
        echo Если нет, скачайте с:
        echo https://www.mongodb.com/try/download/community
        echo.
        echo Установите с настройками по умолчанию (Install as Service)
    ) else (
        echo ✅ MongoDB найден
    )
) else (
    echo ✅ MongoDB найден
)

:: Установка зависимостей
echo.
echo [4/5] Установка зависимостей (pnpm install)...
call pnpm install
if errorlevel 1 (
    echo ❌ Ошибка установки зависимостей
    pause
    exit /b 1
)
echo ✅ Зависимости установлены

:: Заполнение базы данных
echo.
echo [5/5] Заполнение базы данных тестовыми данными...
call pnpm seed
if errorlevel 1 (
    echo ❌ Ошибка заполнения базы данных
    echo Убедитесь, что MongoDB запущен (служба)
    pause
    exit /b 1
)
echo ✅ База данных заполнена

echo.
echo ================================================
echo   ✅ Настройка завершена!
echo ================================================
echo.
echo Теперь запустите проект файлом start-all.bat
echo.
pause