module.exports = {
  ...require('./error.middleware'),
  validate: require('./validate.middleware'),
  upload: require('./multer.middleware'),
};
