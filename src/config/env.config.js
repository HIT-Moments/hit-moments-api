require('dotenv').config();

const env = {
  port: process.env.PORT || 3000,
  mongoURI: process.env.MONGO_URI || 'mongodb://localhost:27017/hit-moments',
};

module.exports = env;
