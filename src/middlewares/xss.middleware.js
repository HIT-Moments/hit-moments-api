const xss = require('xss');

const xssMiddleware = (req, res, next) => {
  if (req.body) {
    for (let key in req.body) {
      req.body[key] = xss(req.body[key]);
    }
  }
  if (req.query) {
    for (let key in req.query) {
      req.query[key] = xss(req.query[key]);
    }
  }
  if (req.params) {
    for (let key in req.params) {
      req.params[key] = xss(req.params[key]);
    }
  }
  next();
};

module.exports = xssMiddleware;
