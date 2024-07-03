const cron = require('node-cron');

const { User, Moment } = require('../models');
const { sendBirthdayEmail } = require('../services/email.service');

cron.schedule(
  '0 7 * * *',
  async () => {
    console.log('Running cron job...');
    await sendBirthdayEmails();
    await deleteExpiredMoments();
  },
  {
    scheduled: true,
    timezone: 'Asia/Ho_Chi_Minh',
  },
);

const sendBirthdayEmails = async () => {
  const today = new Date();
  const month = today.getMonth() + 1;
  const day = today.getDate();

  const users = await User.find({
    $expr: {
      $and: [{ $eq: [{ $month: '$dob' }, month] }, { $eq: [{ $dayOfMonth: '$dob' }, day] }],
    },
  });

  users.forEach(async (user) => {
    await sendBirthdayEmail({ user });
  });
};

const deleteExpiredMoments = async () => {
  const today = new Date();
  const deleteDate = today.setDate(today.getDate() - 30);

  const moments = await Moment.find({ isDeleted: true, deletedAt: { $lt: deleteDate } });

  moments.forEach(async (moment) => {
    await moment.deleteOne();
  });
};

module.exports = cron;
