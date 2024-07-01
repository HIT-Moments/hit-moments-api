const cloudinary = require('cloudinary').v2;

const env = require('./env.config');

cloudinary.config({
  cloud_name: env.cloudName,
  api_key: env.apiKey,
  api_secret: env.apiSecret,
});
