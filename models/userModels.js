const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Input your name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email Required'],
    trim: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  avataUrl: {
    type: String,
  },
  bio: String,
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
