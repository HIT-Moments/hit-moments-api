const { lookup } = require('geoip-lite');

const { catchAsync } = require('../utils');
const { client, discordChannelId } = require('../config').discordBot;

const loggingBot = catchAsync(async (req, res, next) => {
  const start = Date.now();
  res.on('finish', async () => {
    const duration = Date.now() - start;
    const geoIP = lookup(req.ip);
    const logMessage = `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms ${req.ip} ${geoIP?.city} ${geoIP?.country}`;

    try {
      const channel = await client.channels.fetch(discordChannelId);
      if (channel) {
        await channel.send(logMessage);
      }
    } catch (error) {
      console.error('Failed to send message to Discord:', error);
    }
  });

  next();
});

module.exports = loggingBot;
