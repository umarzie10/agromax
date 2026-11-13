@echo off
chcp 65001 > nul
echo ========================================================
echo    AgroMax B2B - Python FastAPI Backend Server
echo ========================================================
cd /d "%~dp0backend"
echo [1/2] Server ishga tushirilmoqda (http://localhost:8000)...
echo [2/2] API Hujjatlari (Swagger): http://localhost:8000/docs
echo.
python main.py
pause
