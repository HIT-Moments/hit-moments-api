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

const sendVerificationEmail = async (user, token) => {
  const subject = 'Email Verification';
  const html = `<p>Hello ${user.fullname}</p><br><p>Click <a href="${env.apiUrl}/auth/verify?token=${token}">here</a> to verify your email.</p>`;
  const to = user.email;

  return sendEmail(to, subject, html);
};

const sendOtpEmail = async (user, otp) => {
  const subject = 'OTP Verification';
  const html = `<p>Hello ${user.fullname}</p><br><p>Your OTP is ${otp}</p>`;
  const to = user.email;

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
