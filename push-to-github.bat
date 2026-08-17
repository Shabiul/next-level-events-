@echo off
echo ===================================================
echo   Pushing All Changes to GitHub (next-level-events-)
echo   https://github.com/tasmia2506/next-level-events-
echo ===================================================
echo.

cd /d "%~dp0"
git add .
git commit -m "feat: complete platform update with luxury UI, rolling counters & admin portal" --allow-empty
git branch -M main
git push -u origin main

echo.
echo ===================================================
echo   Push Completed!
echo   Vercel Deployment: https://vercel.com
echo ===================================================
pause
