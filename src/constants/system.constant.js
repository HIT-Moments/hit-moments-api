const { apiUrl } = require('../config/env.config');

const LOCALES = ['en', 'vi'];

const LANGUAGE_DEFAULT = 'vi';

const HEADER_NAME = 'accept-language';

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const TYPES_IMAGE_ALLOWED = ['image/png', 'image/jpg', 'image/jpeg'];

const TYPES_AUDIO_ALLOWED = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/midi'];

const SAMPLE_IMAGE = `${apiUrl}/images/sample.png`;

module.exports = {
  LOCALES,
  HEADER_NAME,
  LANGUAGE_DEFAULT,
  MAX_FILE_SIZE,
  TYPES_IMAGE_ALLOWED,
  TYPES_AUDIO_ALLOWED,
  SAMPLE_IMAGE,
};
