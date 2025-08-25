# Quick Reference - Deployment Commands

## Initial Setup
```cmd
# Run as administrator
setup-windows.bat

# Install dependencies
npm install

# Build application
npm run build

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Nginx Commands
```cmd
# Test configuration
cd C:\nginx
nginx -t

# Start/Stop/Reload
net start nginx
net stop nginx
nginx -s reload

# Check status
net start nginx
```

## PM2 Commands
```cmd
# Check status
pm2 status
pm2 monit

# View logs
pm2 logs
pm2 logs startvibin-be

# Restart application
pm2 restart startvibin-be
pm2 restart all

# Stop application
pm2 stop startvibin-be
pm2 delete startvibin-be
```

## SSL Certificate Management
```cmd
# Check certificates
certbot certificates

# Renew certificates
certbot renew

# Manual renewal (stop nginx first)
net stop nginx
certbot certonly --standalone -d your-domain.com
net start nginx
```

## Application Management
```cmd
# Update application
git pull
npm install
npm run build
pm2 restart startvibin-be

# Check application health
curl https://your-domain.com/health

# View application logs
pm2 logs startvibin-be --lines 100
```

## Troubleshooting
```cmd
# Check if ports are in use
netstat -ano | findstr :80
netstat -ano | findstr :443
netstat -ano | findstr :5000

# Check Windows services
sc query nginx
sc query "PM2"

# Check firewall
netsh advfirewall firewall show rule name=all | findstr "80\|443"

# Test SSL certificate
openssl s_client -connect your-domain.com:443 -servername your-domain.com
```

## Log Locations
- **Nginx logs**: `C:\nginx\logs\`
- **PM2 logs**: `C:\apps\startvibin-be\logs\`
- **Application logs**: `C:\apps\startvibin-be\logs\`

## Environment Variables
Make sure your `.env` file contains:
- `NODE_ENV=production`
- `PORT=5000`
- `MONGODB_URI=your_mongodb_connection`
- `FRONTEND_URL=https://your-frontend-domain.com`
- `ALLOWED_ORIGINS=https://your-frontend-domain.com`

## Security Checklist
- [ ] Windows Firewall configured
- [ ] VPS firewall configured
- [ ] Strong passwords set
- [ ] SSL certificate installed
- [ ] Auto-renewal configured
- [ ] Regular backups scheduled
- [ ] Monitoring enabled

## Performance Monitoring
```cmd
# Monitor system resources
pm2 monit

# Check memory usage
pm2 show startvibin-be

# Monitor Nginx
tail -f C:\nginx\logs\access.log
tail -f C:\nginx\logs\error.log
``` 