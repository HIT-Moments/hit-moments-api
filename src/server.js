const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const express = require('express');
const mongoose = require('mongoose');
const httpStatus = require('http-status');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');

const apiRoute = require('./routes/api');
const { env, i18n } = require('./config');
const { initAdmin, scheduleTasks } = require('./utils');
const { xss, rateLimit, errorConverter, errorHandler, loggingBot } = require('./middlewares');

const app = express();
app.set('trust proxy', 1);
app.use(rateLimit());
app.use(express.json());
app.use(loggingBot);
app.use(cors());
app.use(xss);
app.use(helmet());
app.use(mongoSanitize());
app.use(compression());

const isProduction = env.nodeEnv === 'production';
const isDevelopment = env.nodeEnv === 'development';

if (isDevelopment) {
  app.use(morgan('dev'));
  mongoose.set('debug', true);
}

app.use((req, res, next) => {
  next(i18n.setLocale(req));
});

const apiBasePath = isProduction ? '/v1' : '/api/v1';
app.use(apiBasePath, apiRoute);

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
  .then(async () => {
    await initAdmin();
    console.log('Connected to MongoDB successfully!');
    console.log('Initializing admin user successfully!');
  })
  .then(() => {
    app.listen(env.port, () => {
      scheduleTasks();
      console.log(`Server is running on port ${env.port}!`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
