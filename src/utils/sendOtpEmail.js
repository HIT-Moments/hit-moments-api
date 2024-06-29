const { sendEmail } = require('../services');

const generateOtp = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

const sendOtpEmail = async (user, otp) => {
  const subject = 'OTP Verification';
  const html = `<p>Hello ${user.fullname}</p><br><p>Your OTP is ${otp}</p>`;
  const to = user.email;

  return sendEmail(to, subject, html);
};

module.exports = {
  generateOtp,
  sendOtpEmail,
};
