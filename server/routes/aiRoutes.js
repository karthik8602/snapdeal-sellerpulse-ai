import express from "express";
import { generateAIResponse } from "../services/aiService.js";
import { runVirtualKAM } from "../agents/virtualKamAgent.js";

const router = express.Router();

// Basic LLM test
router.post("/test", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid message.",
      });
    }

    const response = await generateAIResponse(message);

    res.json({
      success: true,
      model: "openai/gpt-oss-120b",
      response,
    });
  } catch (error) {
    console.error("Groq API Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to generate AI response.",
    });
  }
});

// Virtual KAM agent
router.post("/consult/:sellerId", async (req, res) => {
  try {
    const { sellerId } = req.params;
    const { message } = req.body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid message.",
      });
    }

    const response = await runVirtualKAM(sellerId, message.trim());

    res.json({
      success: true,
      sellerId,
      response,
    });
  } catch (error) {
    console.error("Virtual KAM Error:", error);

    res.status(500).json({
      success: false,
      message: "Virtual KAM could not process the request.",
    });
  }
});

export default router;
