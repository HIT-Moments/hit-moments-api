const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const conversationSchema = new mongoose.Schema(
  {
    participant1: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    participant2: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('Conversation', conversationSchema);
