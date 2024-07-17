const xss = require('xss');

const sanitizeValue = (value) => {
  if (typeof value === 'string') {
    return xss(value);
  } else if (typeof value === 'object' && value !== null) {
    return value;
  }
  return value;
};

const xssMiddleware = (req, res, next) => {
  ['body', 'query', 'params'].forEach((prop) => {
    if (req[prop]) {
      for (let key in req[prop]) {
        req[prop][key] = sanitizeValue(req[prop][key]);
      }
    }
  });
  next();
};

module.exports = xssMiddleware;
