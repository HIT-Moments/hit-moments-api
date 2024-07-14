const mongoose = require('mongoose');

const musicSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    link: {
      type: String,
      trim: true,
      required: true,
    },
    author: {
      type: String,
      trim: true,
      required: true,
    },
    isDelete: {
      type: Boolean,
      default: false,
    },
  }
);

module.exports = mongoose.model('Music', musicSchema);
