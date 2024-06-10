const express = require("express");

const app = express();

app.get("/", (req, res) => {
  res.send("The server backend API for HIT Moments is running 🌱");
});

app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
