@echo off
title Lodgy - Arranque Limpio
cd /d "%~dp0"

echo Cerrando servidores anteriores...
taskkill /F /IM python.exe >nul 2>&1
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo Arrancando Backend...
start "LODGY-API" cmd /k "cd /d "%~dp0backend" && npm start"
timeout /t 6 /nobreak >nul

echo Arrancando Frontend desde carpeta frontend...
start "LODGY-WEB" cmd /k "cd /d "%~dp0frontend" && python -m http.server 5500"
timeout /t 3 /nobreak >nul

echo Abriendo navegador...
start "" http://127.0.0.1:5500/
start "" http://127.0.0.1:5500/dashboard.html

echo.
echo ===================================
echo              TODO LISTO
echo ===================================
echo.
echo Web publica: http://127.0.0.1:5500/
echo Panel admin:  http://127.0.0.1:5500/dashboard.html
echo.
echo Cierra las ventanas LODGY-API y LODGY-WEB para detenerlo
echo.
pause