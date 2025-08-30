@echo off
echo ========================================
echo StartVibin Backend - Windows Setup Script
echo ========================================
echo.

REM Check if running as administrator
net session >nul 2>&1
if %errorLevel% == 0 (
    echo Running as administrator - OK
) else (
    echo ERROR: This script must be run as administrator
    echo Please right-click and "Run as administrator"
    pause
    exit /b 1
)

echo.
echo Step 1: Creating necessary directories...
if not exist "C:\apps" mkdir C:\apps
if not exist "C:\apps\startvibin-be" mkdir C:\apps\startvibin-be
if not exist "C:\apps\startvibin-be\logs" mkdir C:\apps\startvibin-be\logs
if not exist "C:\scripts" mkdir C:\scripts

echo Step 2: Checking Node.js installation...
node --version >nul 2>&1
if %errorLevel% == 0 (
    echo Node.js is installed
) else (
    echo ERROR: Node.js is not installed
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Step 3: Checking Git installation...
git --version >nul 2>&1
if %errorLevel% == 0 (
    echo Git is installed
) else (
    echo ERROR: Git is not installed
    echo Please install Git from https://git-scm.com/
    pause
    exit /b 1
)

echo Step 4: Installing PM2 globally...
npm install -g pm2
if %errorLevel% == 0 (
    echo PM2 installed successfully
) else (
    echo Warning: Could not install PM2
)

echo Step 5: Copying SSL renewal script...
copy "renew-ssl.bat" "C:\scripts\renew-ssl.bat" >nul 2>&1
if %errorLevel% == 0 (
    echo SSL renewal script copied
) else (
    echo Warning: Could not copy SSL renewal script
)

echo.
echo ========================================
echo Setup completed!
echo ========================================
echo.
echo Next steps:
echo 1. Install Nginx from http://nginx.org/en/download.html
echo 2. Install Python and Certbot
echo 3. Configure your domain in Cloudflare
echo 4. Update the nginx.conf file with your domain
echo 5. Create .env file from env.production.template
echo 6. Run: npm install && npm run build
echo 7. Start the application with PM2
echo.
echo For detailed instructions, see DEPLOYMENT_GUIDE.md
echo.
pause 