const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const friendSchema = new mongoose.Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    friendList: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    friendRequest: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    blockList: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('Friend', friendSchema);
