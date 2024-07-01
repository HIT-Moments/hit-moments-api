const ejs = require('ejs');
const path = require('path');
const nodeMailer = require('nodemailer');

const { env, email } = require('../config');

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

const sendVerificationEmail = async (data) => {
  data.link = `${env.apiUrl}/auth/verify?token=${data.token}`;
  const to = data?.user.email;
  const subject = 'Xác minh email';
  const html = await ejs.renderFile(path.join(__dirname, '../templates/email-verification.ejs'), { data });

  return sendEmail(to, subject, html);
};

const sendOtpEmail = async (data) => {
  const to = data?.user.email;
  const subject = 'Mã xác minh';
  const html = await ejs.renderFile(path.join(__dirname, '../templates/otp.ejs'), { data });

  return sendEmail(to, subject, html);
};

const generateOtp = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

module.exports = {
  sendEmail,
  generateOtp,
  sendOtpEmail,
  sendVerificationEmail,
};
