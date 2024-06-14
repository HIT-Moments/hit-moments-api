const i18n = require('i18n');
const path = require('path');

const { HEADER_NAME, LANGUAGE_DEFAULT, LOCALES } = require('../constants');

class I18nService {
  constructor() {
    i18n.configure({
      locales: LOCALES,
      directory: path.join(__dirname, '../i18n'),
      defaultLocale: LANGUAGE_DEFAULT,
    });
  }

  isValidLanguage(lang) {
    return LOCALES.includes(lang);
  }

  setLocale(req) {
    const lang = this.isValidLanguage(req.query?.lang)
      ? req.query.lang
      : this.isValidLanguage(req.headers[HEADER_NAME])
        ? req.headers[HEADER_NAME]
        : LANGUAGE_DEFAULT;

    if (req.query.lang) delete req.query.lang;
    i18n.setLocale(lang);
  }

  translate(messageKey) {
    const [model, key] = messageKey.split('.');
    return i18n.__(model)[key];
  }
}

module.exports = new I18nService();
