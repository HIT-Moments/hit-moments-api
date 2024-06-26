const nodeMailer = require('nodemailer');

const { email } = require('../config');

const transporter = nodeMailer.createTransport(email.smtp);

transporter
  .verify()
  .then(() => {
    console.log('Connected to email server');
  })
  .catch(() => {
    console.log('Error connecting to email server');
  });

const sendEmail = async (to, subject, html) => {
  const options = {
    from: email.from,
    to,
    subject,
    html,
  };

  return transporter.sendMail(options);
};

module.exports = {
  sendEmail,
};
