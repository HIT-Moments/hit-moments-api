module.exports = {
  ...require('./auth.middleware'),
  ...require('./error.middleware'),
  xss: require('./xss.middleware'),
  validate: require('./validate.middleware'),
  upload: require('./multer.middleware'),
  rateLimit: require('./rate-limit.middleware'),
};
