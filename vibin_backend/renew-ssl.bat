@echo off
echo Starting SSL certificate renewal process...
echo Timestamp: %date% %time%

REM Stop Nginx service
echo Stopping Nginx service...
net stop nginx
if %errorlevel% neq 0 (
    echo Warning: Could not stop Nginx service. It might not be running.
)

REM Wait a moment for the service to stop
timeout /t 3 /nobreak > nul

REM Run certbot renewal
echo Running certbot renewal...
certbot renew --quiet --no-self-upgrade

REM Check if renewal was successful
if %errorlevel% equ 0 (
    echo SSL certificate renewal completed successfully.
) else (
    echo SSL certificate renewal failed with error code %errorlevel%.
    echo Check the certbot logs for more details.
)

REM Start Nginx service
echo Starting Nginx service...
net start nginx
if %errorlevel% equ 0 (
    echo Nginx service started successfully.
) else (
    echo Error: Could not start Nginx service.
    echo Please check Nginx configuration and start it manually.
)

REM Test Nginx configuration
echo Testing Nginx configuration...
cd /d C:\nginx
nginx -t
if %errorlevel% equ 0 (
    echo Nginx configuration test passed.
) else (
    echo Warning: Nginx configuration test failed.
)

echo SSL renewal process completed at %date% %time%
echo ---------------------------------------- 