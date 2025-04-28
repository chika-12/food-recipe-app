const express = require('express');
const recipeRoute = require('./routes/recipeRoutes');
const cors = require('cors');
const AppError = require('./utils/appError');
const errorController = require('./controllers/errorControllers');
const userRoute = require('./routes/userRoute');

const app = express();

app.use(express.json());
app.use(cors());

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use(express.static(`${__dirname}/public`));

app.use('/api/v1/recipes', recipeRoute);
app.use('api/v1/users', userRoute);

app.all('/{*any}', (req, res, next) => {
  console.log('Unhadled Url', req.originalUrl);
  next(new AppError(`Cant find ${req.originalUrl} on this server`, 404));
});
app.use(errorController);
module.exports = app;
