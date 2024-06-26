require('dotenv').config();

const env = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoURI: process.env.MONGO_URI || 'mongodb://localhost:27017/hit-moments',
  adminFullname: process.env.ADMIN_FULLNAME || 'Admin',
  adminPassword: process.env.ADMIN_PASSWORD || 'admin',
  adminEmail: process.env.ADMIN_EMAIL || 'admin@hitmoments.com',
  jwtSecret: process.env.JWT_SECRET || 'hitmoments.com',
  jwtExpire: process.env.JWT_EXPIRE || '1d',
  apiUrl: process.env.API_URL || `http://localhost:${process.env.PORT || 3000}`,
};

module.exports = env;
