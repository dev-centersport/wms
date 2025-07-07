import path from 'path';
import dotenv from 'dotenv';

dotenv.config({
  path: path.resolve(__dirname, '../.env.production'),
}); // Carrega manualmente

module.exports = {
  apps: [
    {
      name: 'wms-backend',
      script: 'dist/main.js',
      env: {
        NODE_ENV: 'producton',
      },
    },
  ],
};
