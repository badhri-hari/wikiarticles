import { Redis } from "@upstash/redis";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

const REQUEST_LIMIT = 1;
const TIME_WINDOW = 10;

export default async function handler(req, res) {
  if (req.headers.origin !== "https://wikiarticles.vercel.app") {
    return res
      .status(403)
      .json({ error: "oi stop messing around with my site" });
  }

  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-api-key");
  res.setHeader(
    "Access-Control-Allow-Origin",
    "https://wikiarticles.vercel.app"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ error: "oi stop messing around with my site" });
  }

  const ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "")
    .split(",")[0]
    .trim();
  const key = `rate-limit-${ip}`;

  try {
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, TIME_WINDOW);
    }
    if (count > REQUEST_LIMIT) {
      return res.status(429).send("Too many questions, slow down!");
    }
  } catch (error) {
    console.error("Rate limiting error:", error);
    return res
      .status(500)
      .send(
        "Sorry, looks like there's a problem right now. Please try again later."
      );
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

    const messages = chatHistory.map((message) => ({
      role: message.sender === "user" ? "user" : "assistant",
      content: message.text,
    }));

    const openRouterResponse = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "deepseek/deepseek-r1-distill-qwen-32b:free",
        messages: messages,
      },
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

    const responseText = openRouterResponse.data.choices[0].message.content;
    res.send(responseText);
  } catch (error) {
    console.error("Chatbot error:", error);
    res.setHeader("Content-Type", "text/plain");
    return res.status(500).send("Chatbot error:", error);
  }
}
