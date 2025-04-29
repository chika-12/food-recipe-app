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

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(new AppError('You are not logged in', 401));
  }

  const decoded = await new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRETS, (err, decoded) => {
      if (err) {
        const message =
          err.name === 'TokenExpiredError'
            ? 'Your token has expired please log in again'
            : 'Invalid token';
        return next(reject(new AppError(message, 401)));
      }
      resolve(decoded);
    });
  });

  const freshUser = await RecipeUser.findById(decoded.id);

  if (!freshUser) {
    return next(new AppError('User not found', 401));
  }
  //Password Change detector not done yet
  req.user = freshUser;
  next();
});
