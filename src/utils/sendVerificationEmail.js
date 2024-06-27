const { sendEmail } = require('../services');

const { env } = require('../config');

const sendVerificationEmail = async (user, token) => {
  const subject = 'Email Verification';
  const html = `<p>Hello ${user.fullname}</p><br><p>Click <a href="${env.apiUrl}/auth/verify?token=${token}">here</a> to verify your email.</p>`;
  const to = user.email;

  return sendEmail(to, subject, html);
};

module.exports = sendVerificationEmail;
