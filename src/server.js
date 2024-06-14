const morgan = require('morgan');
const express = require('express');
const mongoose = require('mongoose');
const httpStatus = require('http-status');

const { env } = require('./config');
const { errorHandler } = require('./middlewares');

const app = express();

if (env.nodeEnv === 'development') {
  app.use(morgan('dev'));
  mongoose.set('debug', true);
}

app.get('/', (req, res) => {
  res.send('The server backend API for HIT Moments is running 🌱');
});

app.all('*', (req, res) => {
  res.status(httpStatus.NOT_FOUND).send({
    statusCode: httpStatus.NOT_FOUND,
    message: 'Resource not found',
  });
});

app.use(errorHandler);

mongoose
  .connect(env.mongoURI)
  .then(() => {
    console.log('Connected to MongoDB successfully!');
  })
  .then(() => {
    app.listen(env.port, () => {
      console.log(`Server is running on port ${env.port}!`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
