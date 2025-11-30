@echo off
cd /d "E:\Online Learning Platform\backend"
pm2 start pm2.json --env development
echo.
echo Showing live logs...
pm2 logs
pause
