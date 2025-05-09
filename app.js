const express = require('express');
const recipeRoute = require('./routes/recipeRoutes');
const cors = require('cors');
const AppError = require('./utils/appError');
const errorController = require('./controllers/errorControllers');
const userRoute = require('./routes/userRoute');
const app = express();
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');
const { xss } = require('express-xss-sanitizer');
const reviewRoute = require('./routes/reviewRoute');
const favouriteRoute = require('./routes/favouriteRoute');

//Http loging
app.use(helmet());

//Body parser
app.use(express.json({ limit: '10kb' }));

//Sanitizer
app.use(mongoSanitize());

//Cleaner
app.use(xss());

app.use(hpp());

//Cross origin resource
app.use(cors());

//Request time login
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

//Static files handler
app.use(express.static(`${__dirname}/public`));

// Rate limit
const limit = rateLimit({
  max: 100,
  windowsMs: 60 * 60 * 1000,
  message: 'Too many request from this Ip. Try again letter',
});
app.use('/api', limit);

//Routers
app.use('/api/v1/recipes', recipeRoute);
app.use('/api/v1/users', userRoute);
app.use('/api/v1/review', reviewRoute);
app.use('/api/v1/favorite', favouriteRoute);
//Unhandled Url

app.all('*', (req, res, next) => {
  console.log('Unhadled Url', req.originalUrl);
  next(new AppError(`Cant find ${req.originalUrl} on this server`, 404));
});

//Global Error controller
app.use(errorController);
module.exports = app;
