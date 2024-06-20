const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const { SALT_WORK_FACTOR, USER_AVATAR_DEFAULT } = require('../constants');

const userSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      trim: true,
      required: true,
    },
    email: {
      type: String,
      trim: true,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      select: false,
      required: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
      default: USER_AVATAR_DEFAULT,
    },
    dob: {
      type: Date,
      default: 01 / 01 / 2000,
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre('save', async function (next) {
  const user = this;

  if (!user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, SALT_WORK_FACTOR);
  }

  next();
});

module.exports = mongoose.model('User', userSchema);
