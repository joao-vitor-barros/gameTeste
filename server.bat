@echo off
title Servidor Local do Jogo
color 0A

echo ========================================
echo    SERVIDOR LOCAL DO JOGO
echo ========================================
echo.

REM Obter o IP local
set IP=
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    set IP=%%a
    goto :found
)
:found
if "%IP%"=="" (
    set IP=localhost
) else (
    set IP=%IP:~1%
)

echo Pasta do jogo: %CD%
echo.
echo Tentando iniciar servidor...
echo.

REM Tentar Python primeiro
where python >nul 2>&1
if %errorlevel% == 0 (
    echo [OK] Python encontrado!
    echo.
    echo ========================================
    echo   SERVIDOR INICIADO COM SUCESSO!
    echo ========================================
    echo.
    echo Acesse no celular (mesma rede WiFi):
    echo.
    echo   http://%IP%:8000
    echo.
    echo OU no computador:
    echo.
    echo   http://localhost:8000
    echo.
    echo Pressione CTRL+C para parar o servidor
    echo ========================================
    echo.
    python -m http.server 8000
    echo.
    echo Servidor encerrado.
    pause
    exit
)

REM Tentar Node.js
where node >nul 2>&1
if %errorlevel% == 0 (
    echo [OK] Node.js encontrado!
    echo.
    echo ========================================
    echo   SERVIDOR INICIADO COM SUCESSO!
    echo ========================================
    echo.
    echo Acesse no celular (mesma rede WiFi):
    echo.
    echo   http://%IP%:8000
    echo.
    echo OU no computador:
    echo.
    echo   http://localhost:8000
    echo.
    echo Pressione CTRL+C para parar o servidor
    echo ========================================
    echo.
    npx http-server -p 8000 -c-1
    echo.
    echo Servidor encerrado.
    pause
    exit
)

REM Tentar PHP
where php >nul 2>&1
if %errorlevel% == 0 (
    echo [OK] PHP encontrado!
    echo.
    echo ========================================
    echo   SERVIDOR INICIADO COM SUCESSO!
    echo ========================================
    echo.
    echo Acesse no celular (mesma rede WiFi):
    echo.
    echo   http://%IP%:8000
    echo.
    echo OU no computador:
    echo.
    echo   http://localhost:8000
    echo.
    echo Pressione CTRL+C para parar o servidor
    echo ========================================
    echo.
    php -S 0.0.0.0:8000
    echo.
    echo Servidor encerrado.
    pause
    exit
)

REM Se nenhum foi encontrado
echo [ERRO] Nenhum servidor encontrado!
echo.
echo Instale um dos seguintes:
echo   - Python: https://www.python.org/downloads/
echo   - Node.js: https://nodejs.org/
echo   - PHP: https://www.php.net/downloads.php
echo.
echo.
pause
exit
