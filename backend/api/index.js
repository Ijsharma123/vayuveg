const express = require('express');
const app = express();
app.use(express.json());

// your routes
app.get("/", (req, res) => {
  res.send("API Running");
});

// export as serverless
module.exports = app;