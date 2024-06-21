const { i18n } = require('../config');

const objectId = (value, helpers) => {
  if (!value.match(/^[0-9a-fA-F]{24}$/)) {
    return helpers.message(i18n.translate('custom.regexObjectId'));
  }
  return value;
};

module.exports = { objectId };
