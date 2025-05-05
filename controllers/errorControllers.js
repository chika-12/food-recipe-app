const { default: mongoose } = require('mongoose');
const AppError = require('../utils/appError');

const castErrorHandler = (err) => {
  const message = `Invalid ${err.path}:${err.value}`;
  return new AppError(message, 400);
};
const validationErrorHandler = (err) => {
  const message = err.message;

  return new AppError(message, 401);
};
const mongoServerError = (err) => {
  let message = 'Error from data base';
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    message = `The ${field} '${value}' is already in use. Please use a different one.`;
  }
  return new AppError(message, 401);
};
const productionError = (error, res) => {
  if (error.isOperational) {
    res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
    });
  } else {
    res.status(error.statusCode).json({
      status: error.status,
      message: 'Something Went wrong',
    });
  }
};

const developmentError = (error, res) => {
  res.status(error.statusCode).json({
    status: error.status,
    error,
    message: error.message,
    stack: error.stack || error,
  });
};

const errorController = (err, req, res, next) => {
  console.log(`🔥 ERROR:`, err.stack || err);
  err.status = err.status || 'Error';
  err.statusCode = err.statusCode || 500;

  let error = { ...err };
  error.message = err.message;
  error.stack = err.stack;

  if (err.name === 'CastError') {
    error = castErrorHandler(error);
  }
  if (err.name == 'ValidationError') {
    error = validationErrorHandler(error);
  }
  if (err.name === 'MongoServerError') {
    error = mongoServerError(error);
  }
  if (process.env.NODE_ENV === 'production') {
    productionError(error, res);
  } else if (process.env.NODE_ENV === 'development') {
    developmentError(error, res);
  }
};

module.exports = errorController;
