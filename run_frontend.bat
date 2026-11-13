@echo off
chcp 65001 > nul
echo ========================================================
echo    AgroMax B2B - Frontend (Vite + React)
echo ========================================================
cd /d "%~dp0exact-screenshot"
echo Frontend ishga tushirilmoqda...
npm run dev
pause
