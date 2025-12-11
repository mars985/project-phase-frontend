// controllers/conversationController.js

const {
  getConversations,
  getConversationById,
  createPromptAndAddToConversation,
  createConversations
} = require("../services/services");

// ===============================
// CREATE NEW PROMPT IN CONVERSATION
// ===============================

exports.createConversation = async (req, res) => {
  try {
    const conversation = await createConversations();
    res.status(201).json(conversation);
  } catch (err) {
    console.error("Error creating conversation:", err);
    res.status(500).json({ error: "Failed to create conversation" });
  }
};

exports.addPrompt = async (req, res) => {
  try {
    const { conversationid } = req.params;
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const result = await createPromptAndAddToConversation({
      conversationId: conversationid,
      prompt,
    });

    res.json(result);
  } catch (err) {
    console.error("Error adding prompt:", err);
    res.status(500).json({ error: "Failed to add prompt" });
  }
};

// ===============================
// GET ALL CONVERSATIONS
// ===============================
exports.getAllConversations = async (req, res) => {
  try {
    const conversations = await getConversations();
    res.json(conversations);
  } catch (err) {
    console.error("Error fetching conversations:", err);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
};

// ===============================
// GET SINGLE CONVERSATION BY ID
// ===============================
exports.getSingleConversation = async (req, res) => {
  try {
    const conversation = await getConversationById({
      conversationId: req.params.id,
    });

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    res.json(conversation);
  } catch (err) {
    console.error("Error fetching conversation:", err);
    res.status(500).json({ error: "Failed to fetch conversation" });
  }
};