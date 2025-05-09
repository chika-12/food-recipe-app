const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const RecipeUser = require('../models/userModels');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/emailServices');
const crypto = require('crypto');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRETS, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};

const filteredObject = (obj, ...allowedFields) => {
  const filltered = {};
  Object.keys(obj).forEach((key) => {
    if (allowedFields.includes(key)) filltered[key] = obj[key];
  });
  return filltered;
};

const statusResponseHandler = (user, statusCode, res) => {
  const token = generateToken(user.id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);
  user.password = undefined;
  res.status(200).json({
    Status: 'Success',
    data: {
      user,
    },
    token,
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  const user = await RecipeUser.create(req.body);
  if (!user) {
    return next(new AppError('No user created', 400));
  }

  statusResponseHandler(user, 200, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Wrong Email or Password', 401));
  }
  const user = await RecipeUser.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password))) {
    return next(new AppError('Wrong Email or Password', 401));
  }
  statusResponseHandler(user, 200, res);
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
  if (freshUser.passwordChanged(decoded.iat)) {
    return next(new AppError('Password Change detected. Log in again', 401));
  }
  req.user = freshUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.roles)) {
      return next(new AppError('Unathorised Action', 403));
    }
    next();
  };
};

exports.getUserProfile = catchAsync(async (req, res, next) => {
  const profile = await RecipeUser.findById(req.user.id)
    .populate({
      path: 'favorite', // first populate the virtual on User
      populate: {
        path: 'favoriteRecipe', // then populate the recipe field on FavoriteRecipe
        model: 'Recipe', // make sure this matches your Recipe model name
        select: 'title ingredients instructions imageUrl', // pick whatever fields you need
      },
    })
    .exec();
  if (!profile) {
    return next(new AppError('This user does not exist', 404));
  }

  res.status(200).json({
    Status: 'Success',
    profile,
  });
});

exports.updateProfile = catchAsync(async (req, res, next) => {
  const filtered = filteredObject(req.body, 'name', 'bio');
  const user = await RecipeUser.findByIdAndUpdate(req.user.id, filtered, {
    new: true,
    runValidators: true,
  });
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  statusResponseHandler(user, 200, res);
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await RecipeUser.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError('User not found', 401));
  }

  const resetToken = await user.createPasswordToken();
  user.save({ validateBeforeSave: false });

  const requestUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetpassword/${resetToken}`;

  const message = `For password reset click link below ${requestUrl}`;
  try {
    sendEmail({
      email: user.email,
      subject: 'Your password expires in 10 minutes',
      message,
    });
    res.status(200).json({
      status: 'Success',
      message: 'Token sent to email',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    user.save({ validateBeforeSave: false });

    return next(new AppError('Error Sending Email', 500));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const resetToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await RecipeUser.findOne({
    passwordResetToken: resetToken,
    passwordResetTokenExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Invalid token or token has expired'));
  }
  (user.password = req.body.password),
    (user.confirmPassword = req.body.confirmPassword);
  (user.passwordResetToken = undefined),
    (user.passwordResetTokenExpires = undefined);
  await user.save();

  statusResponseHandler(user, 200, res);
});
