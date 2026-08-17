@echo off
echo ==============================================
echo   Pushing TheDecorParty to GitHub...
echo ==============================================
echo.

echo [1/2] Pushing NLE-frontend to GitHub...
cd /d "%~dp0NLE-frontend"
git push origin main

echo.
echo [2/2] Pushing NLE-backend to GitHub...
cd /d "%~dp0NLE-backend"
git push origin main

echo.
echo ==============================================
echo   Push Complete!
echo   Deploy your frontend on: https://vercel.com
echo ==============================================
pause
