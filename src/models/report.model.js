const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const reportSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      trim: true,
      required: true,
    },
    momentId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Moment',
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('Report', reportSchema);
