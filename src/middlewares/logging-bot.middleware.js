const fs = require('fs');
const path = require('path');

const { catchAsync, getClientIP } = require('../utils');

const writeToLogFile = (logMessage) => {
  const logFilePath = path.join(__dirname, '..', '..', 'log', 'requests.log');
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
    const date = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
    const clientIp = getClientIP(req);

    const logMessage = `${date} \t ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms \t ${req?.user?.email || 'Anonymous'} \t ${clientIp}`;

    writeToLogFile(logMessage);
  });

  next();
});

module.exports = loggingBot;
