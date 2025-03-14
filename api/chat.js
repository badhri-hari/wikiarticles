import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export default async function handler(req, res) {
  const allowedOrigin = "https://wikiarticles.vercel.app";

  const requestOrigin = req.headers.origin;
  if (requestOrigin !== allowedOrigin) {
    return res.status(403).json({ error: "Forbidden" });
  }

  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-api-key");
  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  if (req.headers["x-api-key"] !== process.env.GEMINI_API_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const { chatHistory } = req.body;
    if (
      !chatHistory ||
      !Array.isArray(chatHistory) ||
      chatHistory.length === 0
    ) {
      return res
        .status(400)
        .json({ error: "oi stop messing around with my site" });
    }

    const formattedChatHistory = chatHistory.map((message) => ({
      role: message.sender === "user" ? "user" : "assistant",
      parts: [{ text: message.text }],
    }));

    const responseStream = await ai.models.generateContentStream({
      model: "gemini-2.0-flash",
      contents: formattedChatHistory,
    });

    res.setHeader("Content-Type", "text/plain");

    for await (const chunk of responseStream) {
      res.write(chunk.candidates[0].content.parts[0].text);
    }
    return res.end();
  } catch (error) {
    console.error("Chatbot error:", error);
    return res
      .status(500)
      .json({ error: error.message || "Internal Server Error" });
  }
}
