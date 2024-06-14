const express = require('express');
const mongoose = require('mongoose');

const { env } = require('./config');

const app = express();

app.get('/', (req, res) => {
  res.send('The server backend API for HIT Moments is running 🌱');
});

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
