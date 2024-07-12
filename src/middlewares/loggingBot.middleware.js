const fs = require('fs');
const path = require('path');
const { lookup } = require('geoip-lite');

const { catchAsync } = require('../utils');

const writeToLogFile = (logMessage) => {
  const logFilePath = path.join(__dirname, '..', 'log', 'requests.log');
  console.log(logFilePath);
  fs.appendFile(logFilePath, logMessage + '\n', (err) => {
    if (err) {
      console.error('Failed to write log message to file:', err);
    }
  });
};

const loggingBot = catchAsync(async (req, res, next) => {
  const start = Date.now();
  res.on('finish', async () => {
    const duration = Date.now() - start;
    const geoIP = lookup(req.ip);
    const logMessage = `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms ${req.ip} ${geoIP?.city} ${geoIP?.country}`;

    writeToLogFile(logMessage);
  });

  next();
});

module.exports = loggingBot;
