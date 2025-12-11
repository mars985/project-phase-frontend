// routes/conversationRoutes.js
const express = require("express");
const router = express.Router();

const {
  addPrompt,
  getAllConversations,
  getSingleConversation,
  createConversation
} = require("../controllers/controllers");

router.post("/prompt/:conversationid", addPrompt);
router.get("/allConversations", getAllConversations);
router.get("/conversation/:id", getSingleConversation);
router.post("/createConversation", createConversation);

module.exports = router;
