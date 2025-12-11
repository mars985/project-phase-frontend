const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema({
  prompts: [{ type: mongoose.Schema.Types.ObjectId, ref: "prompt" }],
});

module.exports = mongoose.model("conversation", conversationSchema);
