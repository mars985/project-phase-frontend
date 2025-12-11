const axios = require("axios");
const Prompt = require("../models/promptmodel");
const Conversation = require("../models/conversationmodel");

// ===============================
// FLASK IMAGE GENERATION
// ===============================
const axiosInstance = axios.create({
  timeout: 0, // disable axios timeout
  httpAgent: new (require("http").Agent)({ keepAlive: true, timeout: 0 }),
  httpsAgent: new (require("https").Agent)({ keepAlive: true, timeout: 0 }),
});
async function generateImage(prompt, steps = 15, cfg = 6) {
  try {
    const res = await axiosInstance.post("http://localhost:5000/generate", {
      prompt,
      steps,
      cfg,
    });

    const base64 = res.data.image_base64;
    const buffer = Buffer.from(base64, "base64");

    return {
      prompt, // safer than res.data.prompt
      buffer,
    };
  } catch (error) {
    console.error("Generation failed:", error.message);
    throw error;
  }
}

// ===============================
// PROMPT
// ===============================
async function newPrompt(req, res) {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt required" });
    }

    const result = await generateImage(prompt);

    const savedPrompt = await Prompt.create({
      prompt: result.prompt,
      image: {
        data: result.buffer,
        contentType: "image/png",
      },
    });

    res.json({
      message: "Saved successfully",
      prompt: {
        prompt: savedPrompt.prompt,
        id: savedPrompt._id,
        image: {
          data: savedPrompt.image.data.toString("base64"),
          contentType: "image/png",
        },
      },
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Image generation failed" });
  }
}

async function createPromptAndAddToConversation({ conversationId, prompt }) {
  try {
    if (!conversationId || !prompt) {
      throw new Error("conversationId and prompt required");
    }

    const result = await generateImage(prompt);

    const savedPrompt = await Prompt.create({
      prompt: result.prompt,
      image: {
        data: result.buffer,
        contentType: "image/png",
      },
    });

    const updatedConversation = await Conversation.findByIdAndUpdate(
      conversationId,
      { $push: { prompts: savedPrompt._id } },
      { new: true }
    ).populate({
      path: "prompts",
      select: "prompt",
    });

    return {
      message: "Prompt created & added",
      prompt: savedPrompt,
      conversation: updatedConversation,
    };
  } catch (err) {
    console.error("Error:", err);
    throw err;
  }
}

// ===============================
// CONVERSATIONS
// ===============================

async function createConversations() {
  return await Conversation.create({ prompts: [] });
}

async function getConversations() {
  const conversations = await Conversation.find({})
    .sort({ _id: -1 })
    .populate({
      path: "prompts",
      select: "prompt",
      options: { limit: 1 },
    })
    .lean();

  return conversations.map((c) => ({
    _id: c._id,
    prompt: c.prompts[0]?.prompt || null,
  }));
}

async function getConversationById({ conversationId }) {
  const conversation = await Conversation.findById(conversationId)
    .populate({
      path: "prompts",
      select: "prompt image",
    })
    .lean();

  return conversation || null;
}

module.exports = {
  createConversations,
  getConversations,
  getConversationById,
  createPromptAndAddToConversation,
};
