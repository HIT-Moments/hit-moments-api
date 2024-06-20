const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const feedbackSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      trim: true,
      required: true,
    },
    image: {
      type: String,
      require: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      require: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('Feedback', feedbackSchema);