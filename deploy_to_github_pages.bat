@echo off
echo 🦖 T-ReXpress GitHub Pages Deployment
echo =====================================
echo.

REM Check if repository exists
if not exist ".git" (
    echo ❌ No Git repository found. Run upload_to_github.bat first!
    pause
    exit /b 1
)

echo 📡 Enabling GitHub Pages...
echo.
echo Manual steps to enable GitHub Pages:
echo 1. Go to https://github.com/devinedevil999/t-rexpress/settings/pages
echo 2. Under "Source", select "Deploy from a branch"
echo 3. Select "main" branch and "/ (root)" folder
echo 4. Click "Save"
echo.
echo After enabling, your T-ReXpress will be live at:
echo 🌐 https://devinedevil999.github.io/t-rexpress/
echo.
echo 🦖 T-ReXpress will be hunting patterns on the web!
pause