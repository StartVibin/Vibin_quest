# Deployment Guide: Windows VPS with Nginx and Certbot

This guide will help you deploy your Node.js backend application on a Windows VPS using Nginx as a reverse proxy and Certbot for SSL certificates.

## Prerequisites

- Windows VPS with administrator access
- Domain/subdomain from Cloudflare
- Node.js installed on the VPS
- Git installed on the VPS

## Step 1: Prepare Your Application

### 1.1 Build the Application
```bash
npm install
npm run build
```

### 1.2 Create Production Environment File
Create a `.env` file in your project root:
```env
NODE_ENV=production
PORT=5000
HOST=localhost
FRONTEND_URL=https://your-frontend-domain.com
ALLOWED_ORIGINS=https://your-frontend-domain.com
MONGODB_URI=your_mongodb_connection_string
MONGODB_DB_NAME=beatwise
WALLET_CONNECT_PROJECT_ID=your_wallet_connect_project_id
THIRD_PARTY_API_KEY=your_third_party_api_key
```

## Step 2: Install Nginx on Windows

### 2.1 Download Nginx for Windows
1. Go to http://nginx.org/en/download.html
2. Download the latest stable version for Windows
3. Extract to `C:\nginx`

### 2.2 Install Nginx as a Windows Service
```cmd
cd C:\nginx
nginx -s install
```

### 2.3 Start Nginx Service
```cmd
net start nginx
```

## Step 3: Configure Nginx

### 3.1 Create Nginx Configuration
Replace the content of `C:\nginx\conf\nginx.conf` with the configuration provided in `nginx.conf` file.

### 3.2 Test and Reload Nginx
```cmd
cd C:\nginx
nginx -t
nginx -s reload
```

## Step 4: Install Certbot on Windows

### 4.1 Install Python and pip
1. Download Python from https://www.python.org/downloads/
2. Install with "Add Python to PATH" option

### 4.2 Install Certbot
```cmd
pip install certbot
```

### 4.3 Alternative: Use Certbot Standalone
Download the standalone version from https://certbot.eff.org/

## Step 5: Configure Cloudflare

### 5.1 DNS Configuration
1. Log into your Cloudflare account
2. Add your domain/subdomain
3. Set DNS records:
   - Type: A
   - Name: your-subdomain
   - Content: Your VPS IP address
   - Proxy status: DNS only (gray cloud)

### 5.2 SSL/TLS Settings
1. Go to SSL/TLS settings
2. Set encryption mode to "Full (strict)"
3. Enable "Always Use HTTPS"

## Step 6: Obtain SSL Certificate

### 6.1 Stop Nginx Temporarily
```cmd
net stop nginx
```

### 6.2 Run Certbot
```cmd
certbot certonly --standalone -d your-subdomain.your-domain.com
```

### 6.3 Start Nginx Again
```cmd
net start nginx
```

## Step 7: Deploy Your Application

### 7.1 Create Application Directory
```cmd
mkdir C:\apps\startvibin-be
cd C:\apps\startvibin-be
```

### 7.2 Clone/Upload Your Code
```cmd
git clone your-repository-url .
```

### 7.3 Install Dependencies and Build
```cmd
npm install
npm run build
```

### 7.4 Create PM2 Configuration
Use the `ecosystem.config.js` file provided.

### 7.5 Install and Start PM2
```cmd
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Step 8: Set Up Auto-Renewal for SSL

### 8.1 Create Renewal Script
Create `C:\scripts\renew-ssl.bat`:
```batch
@echo off
cd C:\nginx
net stop nginx
certbot renew
net start nginx
```

### 8.2 Set Up Windows Task Scheduler
1. Open Task Scheduler
2. Create Basic Task
3. Name: "SSL Certificate Renewal"
4. Trigger: Daily at 2:00 AM
5. Action: Start a program
6. Program: `C:\scripts\renew-ssl.bat`

## Step 9: Firewall Configuration

### 9.1 Windows Firewall
Allow these ports:
- Port 80 (HTTP)
- Port 443 (HTTPS)
- Port 5000 (Your Node.js app - optional, only if direct access needed)

### 9.2 VPS Firewall (if applicable)
Configure your VPS provider's firewall to allow ports 80 and 443.

## Step 10: Monitoring and Maintenance

### 10.1 PM2 Monitoring
```cmd
pm2 monit
pm2 logs
```

### 10.2 Nginx Logs
Check logs at:
- `C:\nginx\logs\access.log`
- `C:\nginx\logs\error.log`

### 10.3 Application Logs
Check PM2 logs for application errors.

## Troubleshooting

### Common Issues:

1. **Nginx won't start**: Check if port 80/443 is already in use
2. **SSL certificate issues**: Ensure DNS is properly configured
3. **Application not accessible**: Check PM2 status and logs
4. **CORS errors**: Verify ALLOWED_ORIGINS in .env file

### Useful Commands:
```cmd
# Check Nginx status
net start nginx
nginx -t

# Check PM2 status
pm2 status
pm2 logs

# Check SSL certificate
certbot certificates

# Restart services
net stop nginx && net start nginx
pm2 restart all
```

## Security Considerations

1. Keep Windows updated
2. Use strong passwords
3. Consider using a firewall
4. Regularly update Node.js and npm packages
5. Monitor logs for suspicious activity
6. Use environment variables for sensitive data

## Backup Strategy

1. Regular backups of your application code
2. Database backups (if using local database)
3. SSL certificate backups
4. Nginx configuration backups

## Performance Optimization

1. Enable Nginx gzip compression
2. Use PM2 cluster mode for multiple processes
3. Consider using a CDN for static assets
4. Monitor memory and CPU usage
5. Optimize database queries

---

**Note**: This guide assumes you have administrator access to your Windows VPS. Adjust paths and commands according to your specific setup. 