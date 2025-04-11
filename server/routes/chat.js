import axios from "axios";
import express from "express";

const chatRouter = express.Router();

chatRouter.post("/", async (req, res) => {
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-api-key");
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "sneaky" });
  try {
    if (
      !req.body.chatHistory ||
      !Array.isArray(req.body.chatHistory) ||
      !req.body.chatHistory.length
    )
      return res.status(400).json({ error: "no chatHistory" });
    const messages = req.body.chatHistory.map((m) => ({
      role: m.sender === "user" ? "user" : "assistant",
      content: m.text,
    }));
    let model = "google/gemini-2.0-flash-exp:free";
    let payload = { model, messages };
    if (req.body.imageBase64) {
      model = "google/gemini-2.0-flash-exp:free";
      payload = {
        model,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: messages[messages.length - 1].content },
              {
                type: "image",
                image_url: {
                  url: `${req.body.imageBase64}`,
                },
              },
            ],
          },
        ],
      };
    }
    const r = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      payload,
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "HTTP-Referer": "https://wikiarticles.vercel.app",
          "X-Title": "wikiarticles",
          "Content-Type": "application/json",
        },
      }
    );
    res.setHeader("Content-Type", "text/plain");
    if (r.data?.choices?.[0]?.message?.content) {
      res.status(200).send(r.data?.choices?.[0]?.message?.content);
    } else {
      return res.status(500).send("Chatbot response is invalid or empty.");
    }
  } catch (e) {
    console.error("Chatbot error:", e);
    res.setHeader("Content-Type", "text/plain");
    return res.status(500).send("Chatbot error: " + e.message);
  }
});

export default chatRouter;
