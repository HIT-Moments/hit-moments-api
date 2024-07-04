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
    momentId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Post',
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('React', reactSchema);
