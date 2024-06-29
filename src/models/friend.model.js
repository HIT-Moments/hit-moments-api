const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const friendSchema = new mongoose.Schema(
  {
    friendsList: {
      type: Schema.Types.ObjectId,
    },
    friendsRequet: [
      {
        type: Schema.Types.ObjectId,
      },
    ],
    blockList: {
      type: Schema.Types.ObjectId,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('Friend', friendSchema);
