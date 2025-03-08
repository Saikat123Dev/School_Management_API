require('dotenv').config();

const environment = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000'),
  database: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME || 'school_management',
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10')
  }
};

module.exports = environment;
