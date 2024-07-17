const { env } = require('../config');

const SALT_WORK_FACTOR = 8;

const USER_AVATAR_DEFAULT = `${env.frontendUrl}/images/user-avatar.jpg`;

const USER_ROLE = {
  ADMIN: 'admin',
  USER: 'user',
};

const DEFAULT_BIRTHDAY = '01/01/2000';

module.exports = {
  USER_ROLE,
  DEFAULT_BIRTHDAY,
  SALT_WORK_FACTOR,
  USER_AVATAR_DEFAULT,
};
