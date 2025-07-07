/* eslint-disable */
// ecosystem.config.js
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({
  path: path.resolve(__dirname, '../.env.production'),
});

module.exports = {
  apps: [
    {
      name: 'wms-backend',
      script: 'dist/main.js', // Certifique-se de que este arquivo existe!
      env: {
        NODE_ENV: 'production', // Corrigi um typo (NODE_ENV, não NODE_ENV)
      },
    },
  ],
};
