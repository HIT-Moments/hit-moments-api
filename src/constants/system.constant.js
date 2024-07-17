const { env } = require('../config');

const LOCALES = ['en', 'vi'];

const LANGUAGE_DEFAULT = 'vi';

const HEADER_NAME = 'accept-language';

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const TYPES_IMAGE_ALLOWED = ['image/png', 'image/jpg', 'image/jpeg'];

const TYPES_AUDIO_ALLOWED = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/midi'];

const SAMPLE_IMAGE = `${env.frontendUrl}/images/sample.png`;

const MIME_TYPES = {
  png: 'image/png',
  jpg: 'image/jpg',
  jpeg: 'image/jpeg',
};

module.exports = {
  LOCALES,
  HEADER_NAME,
  LANGUAGE_DEFAULT,
  MAX_FILE_SIZE,
  TYPES_IMAGE_ALLOWED,
  TYPES_AUDIO_ALLOWED,
  SAMPLE_IMAGE,
  MIME_TYPES,
};
