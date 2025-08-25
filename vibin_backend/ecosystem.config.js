module.exports = {
  apps: [
    {
      name: 'startvibin-be',
      script: 'npm',
      args: 'run dev',
      instances: 1, // Use single instance for development
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      // Logging
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Process management
      max_memory_restart: '1G',
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000,
      
      // Watch mode (disable in production)
      watch: false,
      ignore_watch: ['node_modules', 'logs', 'dist'],
      
      // Health check
      health_check_grace_period: 3000,
      
      // Kill timeout
      kill_timeout: 5000,
      
      // Environment variables
      env_file: '.env'
    }
  ],

  deploy: {
    production: {
      user: 'Administrator',
      host: 'your-vps-ip',
      ref: 'origin/main',
      repo: 'your-git-repository-url',
      path: 'C:/apps/startvibin-be',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
}; 