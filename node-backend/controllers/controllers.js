// controllers/conversationController.js

const {
  getConversations,
  getConversationById,
  createPromptAndAddToConversation,
  createConversations,
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

    // Ensure image buffer is serialized as base64 for the frontend
    try {
      if (
        result &&
        result.prompt &&
        result.prompt.image &&
        result.prompt.image.data
      ) {
        const imgData = result.prompt.image.data;
        // Mongoose/Buffer may serialize as Buffer or { type: 'Buffer', data: [...] }
        let base64 = null;

        if (Buffer.isBuffer(imgData)) {
          base64 = imgData.toString("base64");
        } else if (imgData.data && Array.isArray(imgData.data)) {
          base64 = Buffer.from(imgData.data).toString("base64");
        } else if (typeof imgData === "string") {
          // already a base64 string
          base64 = imgData;
        }

        if (base64) {
          result.prompt.image.data = base64;
        }
      }
    } catch (err) {
      console.error("Error serializing image data:", err);
    }

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
