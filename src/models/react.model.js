const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const reactSchema = new mongoose.Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    react: [
      {
        type: String,
        required: true,
      },
    ],
    postId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('React', reactSchema);
