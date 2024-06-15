const joi = require('joi');
const httpStatus = require('http-status');

const { ApiError } = require('../utils/');

const validate = (schema) => (req, res, next) => {
  for (const key in schema) {
    const value = req[key];
    const { error } = schema[key].validate(value, { abortEarly: false });

    if (error) {
      const { details } = error;
      const messages = details
        .map((i) => i.message)
        .join(', ')
        .replace(/['"]+/g, '');

      return next(new ApiError(httpStatus.BAD_REQUEST, messages));
    }

    return next();
  }
};

module.exports = validate;
