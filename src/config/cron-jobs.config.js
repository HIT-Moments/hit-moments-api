const cron = require('node-cron');

const { TIMEZONE } = require('../constants/');

const scheduleTask = async (time, task) => {
  cron.schedule(
    time,
    async () => {
      await task();
    },
    {
      scheduled: true,
      timezone: TIMEZONE,
    },
  );
};

module.exports = {
  scheduleTask,
};
