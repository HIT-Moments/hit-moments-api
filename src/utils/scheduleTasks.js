const fs = require('fs');
const path = require('path');

const { cronJobs } = require('../config');
const { User, Moment } = require('../models');
const { sendBirthdayEmail, uploadToTiktok } = require('../services');
const { client, discordChannelId } = require('../config').discordBot;
const { DELETED_MOMENT_EXPIRE_DATE, CRON_JOB_TIME, UPLOAD_LOCATION, SAMPLE_IMAGE } = require('../constants');

const scheduleTasks = () => {
  const scheduledTasks = [
    {
      time: CRON_JOB_TIME.SEND_BIRTHDAY_EMAIL,
      task: sendBirthdayEmails,
    },
    {
      time: CRON_JOB_TIME.DELETE_EXPIRED_MOMENTS,
      task: deleteExpiredMoments,
    },
    {
      time: CRON_JOB_TIME.CHANGE_UPLOAD_LOCATION,
      task: changeUploadLocation,
    },
    {
      time: CRON_JOB_TIME.SEND_LOG_MESSAGES_TO_DISCORD,
      task: sendLogMessagesToDiscord,
    },
  ];

  for (const { time, task } of scheduledTasks) {
    cronJobs.scheduleTask(time, task);
  }
};

const sendBirthdayEmails = async () => {
  const today = new Date();
  const month = today.getMonth() + 1;
  const day = today.getDate();

  const users = await User.find({
    $expr: {
      $and: [{ $eq: [{ $month: '$dob' }, month] }, { $eq: [{ $dayOfMonth: '$dob' }, day] }],
    },
  });

  for (const user of users) {
    await sendBirthdayEmail({ user });
  }
};

const deleteExpiredMoments = async () => {
  const today = new Date();
  const deleteDate = today.setDate(today.getDate() - DELETED_MOMENT_EXPIRE_DATE);

  const moments = await Moment.find({ isDeleted: true, deletedAt: { $lt: deleteDate } });

  for (const moment of moments) {
    await moment.deleteOne();
  }
};

const changeUploadLocation = async () => {
  if (!(await uploadToTiktok(SAMPLE_IMAGE, UPLOAD_LOCATION.LOCAL))) {
    return;
  }

  const moments = await Moment.find({ uploadLocation: { $ne: UPLOAD_LOCATION.TIKTOK } });

  for (const moment of moments) {
    moment.image = await uploadToTiktok(moment.image, moment.uploadLocation);
    moment.uploadLocation = UPLOAD_LOCATION.TIKTOK;
    await moment.save();
  }
};

const sendLogMessagesToDiscord = async () => {
  const logFilePath = path.join(__dirname, '..', 'log', 'requests.log');
  const logMessages = fs.readFileSync(logFilePath, 'utf8');
  if (!logMessages) {
    return;
  }

  try {
    const channel = await client.channels.fetch(discordChannelId);
    if (channel) {
      await channel.send(logMessages);
    }
  } catch (error) {
    console.error('Failed to send message to Discord:', error);
  }

  fs.truncate(logFilePath, 0, () => {});
};

module.exports = scheduleTasks;
