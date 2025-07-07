const dotenv = require('dotenv');
const envConfig = dotenv.config({ path: '/root/wms/wms-backend/.env.production' }).parsed;

module.exports = {
  apps: [{
    name: 'wms-backend',
    script: './dist/main.js',
    cwd: '/root/wms/wms-backend',
    env_production: {
      NODE_ENV: 'production',
      ...envConfig  // Spread operator para incluir todas variáveis
    }
  }]
};
