module.exports = {
  ...require('./auth.middleware'),
  ...require('./error.middleware'),
  validate: require('./validate.middleware'),
  upload: require('./multer.middleware'),
};
