const TIMEZONE = 'Asia/Ho_Chi_Minh';

const CRON_JOB_TIME = {
  SEND_BIRTHDAY_EMAIL: '0 7 * * *',
  DELETE_EXPIRED_MOMENTS: '0 0 * * *',
  SEND_LOG_MESSAGES_TO_DISCORD: '*/5 * * * *',
  CHANGE_UPLOAD_LOCATION: '0 */2 * * *',
};

module.exports = {
  TIMEZONE,
  CRON_JOB_TIME,
};
