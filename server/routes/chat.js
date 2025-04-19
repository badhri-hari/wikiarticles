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
    let model = "google/gemini-2.5-pro-exp-03-25:free";
    let payload = { model, messages };
    if (req.body.imageBase64) {
      model = "google/gemini-2.5-pro-exp-03-25:free";
      payload = {
        model,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: messages[messages.length - 1].content },
              { type: "image_url", image_url: { url: base64 } },
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
        validateStatus: () => true,
        decompress: false,
      }
    );

    if (r.status >= 400) {
      console.error("OpenRouter error:", r.status, r.data);
      return res
        .status(r.status)
        .json(
          typeof r.data === "string"
            ? { error: r.data }
            : r.data?.error || { error: "Upstream error" }
        );
    }

    const content = r.data?.choices?.[0]?.message?.content;
    if (!content) {
      return res.status(502).json({ error: "Empty response from model." });
    }

    res.type("text/plain").send(content);
  } catch (e) {
    console.error("Chatbot error:", {
      status: err.response?.status,
      message: err.response?.data?.error?.message ?? err.message,
    });

    res.setHeader("Content-Type", "text/plain");
    return res.status(500).send("Chatbot error: " + e.message);
  }
});

export default chatRouter;
