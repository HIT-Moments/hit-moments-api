const morgan = require('morgan');
const express = require('express');
const mongoose = require('mongoose');
const httpStatus = require('http-status');

const { env, i18n } = require('./config');
const { userRoute } = require('./routes/');
const { errorConverter, errorHandler } = require('./middlewares');

const app = express();

app.use(express.json());

if (env.nodeEnv === 'development') {
  app.use(morgan('dev'));
  mongoose.set('debug', true);
}

app.use('/api/v1/users', userRoute);

app.use((req, res, next) => {
  next(i18n.setLocale(req));
});

app.get('/', (req, res) => {
  res.send('The server backend API for HIT Moments is running 🌱');
});

app.all('*', (req, res) => {
  res.status(httpStatus.NOT_FOUND).send({
    statusCode: httpStatus.NOT_FOUND,
    message: i18n.translate('system.resourceNotFound'),
  });
});

app.use(errorConverter);
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
