const { env } = require('../config/');
const { User } = require('../models/');
const { USER_ROLE } = require('../constants');

async function initAdmin() {
  const fullname = env.adminFullname;
  const email = env.adminEmail;
  const password = env.adminPassword;

  try {
    let admin = await User.findOne({ email });
    if (admin) {
      admin.fullname = fullname;
      admin.password = password;
      admin.role = USER_ROLE.ADMIN;
      admin.isVerified = true;
    } else {
      admin = new User({ fullname, email, password, role: USER_ROLE.ADMIN, isVerified: true });
    }
    await admin.save();
  } catch (err) {
    console.error(err);
  }
}

module.exports = initAdmin;
