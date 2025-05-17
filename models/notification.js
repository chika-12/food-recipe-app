const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.ObjectId,
      ref: 'RecipeUser',
      require: true,
    },
    sender: {
      type: mongoose.Schema.ObjectId,
      ref: 'RecipeUser',
    },
    type: {
      type: String,
      enum: ['follow', 'comment', 'unfollowed', 'share', 'rating'],
      required: true,
    },
    message: String,
    link: String,
    read: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },
  { timestamps: true }
);
const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
