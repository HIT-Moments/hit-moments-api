module.exports = {
  ...require('./auth.middleware'),
  ...require('./error.middleware'),
  validate: require('./validate.middleware'),
};
