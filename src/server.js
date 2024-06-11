const express = require('express');

const { env } = require('./config');

const app = express();

app.get('/', (req, res) => {
  res.send('The server backend API for HIT Moments is running 🌱');
});

app.listen(env.port, () => {
  console.log(`Server listening on port ${env.port}`);
});
