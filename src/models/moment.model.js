const mongoose = require('mongoose');

const momentSchema = new mongoose.Schema(
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
    isDeleted: {
      type: Boolean,
      default: false,
    },
    content: {
      type: String,
      trim: true,
    },
    music: {
      type: mongoose.Schema.Types.ObjectId,
    },
    location: {
      type: String,
      trim: true,
    },
    weather: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('Moment', momentSchema);
