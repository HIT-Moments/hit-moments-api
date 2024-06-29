require('dotenv').config();

module.exports = {
  smtp: {
    service: process.env.EMAIL_SMTP_SERVICE || 'gmail',
    host: process.env.EMAIL_SMTP_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_SMTP_PORT || 587,
    secure: process.env.EMAIL_SMTP_SECURE || false,
    auth: {
      user: process.env.EMAIL_SMTP_AUTH_USER,
      pass: process.env.EMAIL_SMTP_AUTH_PASS,
    },
  },
  from: process.env.EMAIL_SMTP_AUTH_USER,
};
