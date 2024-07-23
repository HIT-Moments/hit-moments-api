const fs = require('fs');
const path = require('path');

const { cronJobs, env } = require('../config');
const { User, Moment, TemporaryMoment } = require('../models');
const { sendBirthdayEmail, uploadToTiktok } = require('../services');
const { client, discordChannelId } = require('../config').discordBot;
const {
  DELETED_MOMENT_EXPIRE_DATE,
  TEMPORARY_MOMENT_EXPRIRE_DATE,
  CRON_JOB_TIME,
  UPLOAD_LOCATION,
  SAMPLE_IMAGE,
  USER_AVATAR_DEFAULT,
} = require('../constants');

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
      time: CRON_JOB_TIME.DELETE_TEMPORARY_MOMENTS,
      task: deleteTemporaryMoments,
    },
    {
      time: CRON_JOB_TIME.CHANGE_MOMENT_UPLOAD_LOCATION,
      task: changeMomentsUploadLocation,
    },
    {
      time: CRON_JOB_TIME.CHANGE_AVATAR_UPLOAD_LOCATION,
      task: changeAvatarUploadLocation,
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

const deleteTemporaryMoments = async () => {
  const today = new Date();
  const deleteDate = today.setDate(today.getDate() - TEMPORARY_MOMENT_EXPRIRE_DATE);

  const temporaryMoments = await TemporaryMoment.find({ updatedAt: { $lt: deleteDate } });

  for (const moment of temporaryMoments) {
    await moment.deleteOne();
  }
};

const changeMomentsUploadLocation = async () => {
  if (!(await uploadToTiktok(SAMPLE_IMAGE, UPLOAD_LOCATION.LOCAL))) {
    return;
  }

  const moments = await Moment.find({ uploadLocation: { $ne: UPLOAD_LOCATION.TIKTOK } });

  const temporaryMoments = await TemporaryMoment.find({ uploadLocation: { $ne: UPLOAD_LOCATION.TIKTOK } });

  const allMoments = [...moments, ...temporaryMoments];

  for (const moment of allMoments) {
    moment.image = await uploadToTiktok(moment.image, moment.uploadLocation);
    moment.uploadLocation = UPLOAD_LOCATION.TIKTOK;
    await moment.save();
  }
};

const changeAvatarUploadLocation = async () => {
  if (!(await uploadToTiktok(SAMPLE_IMAGE, UPLOAD_LOCATION.LOCAL))) {
    return;
  }

  const users = await User.find({
    avatar: {
      $ne: USER_AVATAR_DEFAULT,
      $not: { $regex: env.tiktok.imageUrl },
    },
  });

  for (const user of users) {
    user.avatar = await uploadToTiktok(user.avatar, UPLOAD_LOCATION.CLOUDINARY);
    await user.save();
  }
};

const sendLogMessagesToDiscord = async () => {
  const logFilePath = path.join(__dirname, '..', '..', 'log', 'requests.log');
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
