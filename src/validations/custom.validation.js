const { i18n } = require('../config');

const objectId = (value, helpers) => {
  if (!value.match(/^[0-9a-fA-F]{24}$/)) {
    return helpers.message(i18n.translate('model.invalidObjectId'));
  }
};

const password = (value, helpers) => {
  if (value.length < 8) {
    return helpers.message(i18n.translate('user.passwordLength'));
  }
  if (!value.match(/\d/)) {
    return helpers.message(i18n.translate('user.passwordDigit'));
  }
  if (!value.match(/[a-zA-Z]/)) {
    return helpers.message(i18n.translate('user.passwordLetter'));
  }
};

module.exports = {
  objectId,
  password,
};
