require('dotenv').config();

const env = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoURI: process.env.MONGO_URI || 'mongodb://localhost:27017/hit-moments',
  cloudName: process.env.CLOUD_NAME,
  apiKey: process.env.API_KEY,
  apiSecret: process.env.API_SECRET,
  adminFullname: process.env.ADMIN_FULLNAME || 'Admin',
  adminPassword: process.env.ADMIN_PASSWORD || 'admin',
  adminEmail: process.env.ADMIN_EMAIL || 'admin@hitmoments.com',
  jwtSecret: process.env.JWT_SECRET || 'hitmoments.com',
  jwtExpire: process.env.JWT_EXPIRE || '1d',
  apiUrl: process.env.API_URL || `http://localhost:${process.env.PORT || 3000}`,
  frontendUrl: process.env.FRONTEND_URL,
  jwtEmailSecret: process.env.JWT_EMAIL_SECRET,
  jwtEmailExpire: process.env.JWT_EMAIL_EXPIRE || '1h',
};

module.exports = env;
