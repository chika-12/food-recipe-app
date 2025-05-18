const apiKey = process.env.API_KEY;
//const AppError = require('./appError');

module.exports = (req, res, next) => {
  const userKey = req.headers['x-api-key'];

  if (!userKey || userKey !== apiKey) {
    res.status(405).json({
      message: 'Forbiden. Invalid API key',
    });
  }
  next();
};
