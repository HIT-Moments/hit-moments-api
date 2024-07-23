const mongoose = require('mongoose');

const { UPLOAD_LOCATION } = require('../constants');

const temporaryMoments = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    image: {
      type: String,
      trim: true,
      required: true,
    },
    content: {
      type: String,
      trim: true,
    },
    uploadLocation: {
      type: String,
      default: UPLOAD_LOCATION.CLOUDINARY,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('TemporaryMoment', temporaryMoments);
