const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const friendSchema = new mongoose.Schema(
  {
    userId : {
      type: Schema.Types.ObjectId,
    },
    friendList: [
      {
        type: Schema.Types.ObjectId,
      },
    ],
    friendRequest: [
      {
        type: Schema.Types.ObjectId,
      },
    ],
    blockList: [
      {
        type: Schema.Types.ObjectId,
      },
    ],
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('Friend', friendSchema);
