const dotenv = require('dotenv');
const envConfig = dotenv.config({
  path: '/root/wms/wms-backend/.env.production',
}).parsed;

module.exports = {
  apps: [
    {
      name: 'wms-backend',
      script: './dist/main.js',
      cwd: '/root/wms/wms-backend',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      cron_restart: '0 1 * * *',
      restart_delay: 5000,
      watch: false,
      max_memory_restart: '800M',
      wait_ready: true,
      listen_timeout: 10000,
      kill_timeout: 5000,
      env_production: {
        NODE_ENV: 'production',
        ...envConfig, // Spread operator para incluir todas variáveis
      },
      node_args: [
        '--optimize-for-size',
        '--enable-source-maps',
        '--max-old-space-size=1024',
      ],
    },
  ],
};
