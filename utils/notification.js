const Notification = require('../models/notification');
const AppError = require('./appError');
const catchAsync = require('./catchAsync');

class NotificationClass {
  constructor(recipient, sender, type, message, link) {
    this.recipient = recipient;
    this.sender = sender;
    this.type = type;
    this.message = message;
    this.link = link;
  }

  async send() {
    if (this.recipient.toString() === this.sender.toString()) {
      return new AppError('Unauthorised action', 403);
    }
    try {
      await Notification.create({
        recipient: this.recipient,
        sender: this.sender,
        type: this.type,
        message: this.message,
        link: this.link,
      });
    } catch (error) {
      console.log(error);
    }
  }
}
module.exports = NotificationClass;
