const mongoose = require('mongoose');

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
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('TemporaryMoment', temporaryMoments);
