// app.js
const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();

app.use(cors());
app.use(express.json());

// Import conversation routes
const routes = require("./routes/routes");

// Mount routes
app.use("/", routes);

const connectDb = require("./config/db");
const startServer = async () => {
  try {
    await connectDb();
    app.listen(process.env.PORT, () =>
      console.log("Listening on port " + process.env.PORT)
    );
  } catch (error) {
    console.error(error);
  }
};
startServer();

module.exports = app;
