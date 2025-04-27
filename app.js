const express = require('express');
const recipeRoute = require('./routes/recipeRoutes');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cors());

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use(express.static(`${__dirname}/public`));

app.use('/api/v1/recipes', recipeRoute);

module.exports = app;
