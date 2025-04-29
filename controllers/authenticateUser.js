const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const RecipeUser = require('../models/userModels');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRETS, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  const user = await RecipeUser.create(req.body);
  if (!user) {
    return next(new AppError('No user created', 400));
  }

  const token = generateToken(user._id);

  res.status(200).json({
    Status: 'Success',
    user,
    token,
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Wrong Email or Password', 401));
  }
  const user = await RecipeUser.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password))) {
    return next(new AppError('Wrong Email or Passwor', 401));
  }
  const token = generateToken(user._id);

  res.status(200).json({
    status: 'Success',
    token,
  });
});
