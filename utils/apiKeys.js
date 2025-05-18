const apiKey = process.env.API_KEY;
//const AppError = require('./appError');

module.exports = (req, res, next) => {
  const userKey = req.headers['x-api-key'];

  if (!userKey || userKey !== apiKey) {
    return res.status(401).json({
      status: 'fail',
      message:
        'API key required to access this endpoint. Please contact the backend team to obtain a valid API key.',
    });
  }
  next();
};
