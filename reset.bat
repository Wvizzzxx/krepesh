@echo off
chcp 65001 >nul
echo.
echo ================================================
echo   🔩 КРЕПЁЖ — Сброс базы данных
echo ================================================
echo.
echo   Это удалит ВСЕ данные и создаст заново:
echo   - Пользователей
echo   - Товары и категории
echo   - Иконки и изображения
echo.
echo   Пароли: admin123, user123
echo.
set /p confirm="Продолжить? (Y/N): "
if /i not "%confirm%"=="Y" (
    echo Отмена.
    pause
    exit /b
)
echo.
echo Пересоздание базы данных...
call pnpm seed
echo.
if errorlevel 1 (
    echo ❌ Ошибка. Убедитесь, что MongoDB запущен.
) else (
    echo ✅ База данных пересоздана!
)
echo.
pause