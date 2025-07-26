@echo off
echo 🦖 T-ReXpress GitHub Upload Script
echo ====================================
echo.

REM Check if git is installed
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Git is not installed or not in PATH
    echo Please install Git from: https://git-scm.com/download/windows
    pause
    exit /b 1
)

echo ✅ Git is installed
echo.

REM Initialize git repository if not already done
if not exist ".git" (
    echo 📁 Initializing Git repository...
    git init
    echo.
)

REM Configure git user (replace with your details)
echo 👤 Configuring Git user...
git config user.email "devinedevil999@gmail.com"
git config user.name "devinedevil999"
echo.

REM Add all files
echo 📦 Adding files to Git...
git add .
echo.

REM Create initial commit
echo 💾 Creating commit...
git commit -m "🦖 Initial commit: T-ReXpress - The Regex T-Rex

- English to Regex converter with AI
- T-Rex themed interface with Kiro theme default
- History management with delete functionality
- Explanation section with expand/collapse
- Keyboard shortcuts (Ctrl+G, Ctrl+T, Ctrl+R, Ctrl+D)
- Theme switching (Light, Dark, Kiro)
- Puter AI integration with fallbacks
- Activity logging and download
- Responsive design"
echo.

REM Create repository on GitHub (you'll need to do this manually)
echo 🌐 Next steps:
echo 1. Go to https://github.com/new
echo 2. Repository name: t-rexpress
echo 3. Description: 🦖 T-ReXpress - The mighty T-Rex that devours text patterns and spits out perfect regex expressions!
echo 4. Make it Public
echo 5. Don't initialize with README (we already have one)
echo 6. Click "Create repository"
echo.
echo Press any key when you've created the repository on GitHub...
pause

REM Add remote origin
echo 🔗 Adding remote repository...
git remote add origin https://github.com/devinedevil999/t-rexpress.git
echo.

REM Push to GitHub
echo 🚀 Pushing to GitHub...
git branch -M main
git push -u origin main
echo.

echo ✅ T-ReXpress has been uploaded to GitHub!
echo 🌐 Repository URL: https://github.com/devinedevil999/t-rexpress
echo.
echo 🦖 Your T-Rex is now roaming the GitHub wilderness!
pause