const mongoose = require("mongoose");

const promptSchema = new mongoose.Schema({
  prompt: String,
  image: {
    data: Buffer,
    contentType: String
  }
});

module.exports = mongoose.model("prompt", promptSchema);
