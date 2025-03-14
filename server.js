// Used for development only
// Update API endpoint in src/components/Articles/Articles.jsx to http://localhost:5000/api/articles
// Update API endpiont in src/components/Chat/Chat.jsx to http://localhost:5000/api/chat
// Update API endpoint in src/components/Header/Header.jsx to http://localhost:5000/api/search
// Server automatically starts with the default `npm run dev` command

import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();

app.use(express.json());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

function getMonthlyEndDate() {
  const now = new Date();
  now.setMonth(now.getMonth() - 1);
  const year = now.getFullYear();
  let month = now.getMonth() + 1;
  month = month < 10 ? "0" + month : month;
  return `${year}${month}0100`;
}

function formatDate(timestamp) {
  const date = new Date(timestamp);
  const options = { month: "short", day: "numeric", year: "numeric" };
  return date.toLocaleDateString("en-US", options);
}

app.get("/api/articles", async (req, res) => {
  try {
    const numArticles = 20;
    const summaryRequests = [];
    for (let i = 0; i < numArticles; i++) {
      summaryRequests.push(
        axios.get("https://en.wikipedia.org/api/rest_v1/page/random/summary")
      );
    }
    const responses = await Promise.all(summaryRequests);

    const monthlyStart = "2015070100";
    const monthlyEnd = getMonthlyEndDate();

    const articles = await Promise.all(
      responses.map(async (response) => {
        const data = response.data;
        const titleForURL = data.title.replace(/ /g, "_");

        try {
          const pvResponse = await axios.get(
            `https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/all-agents/${encodeURIComponent(
              titleForURL
            )}/monthly/${monthlyStart}/${monthlyEnd}`
          );
          let totalViews = 0;
          if (pvResponse.data && pvResponse.data.items) {
            totalViews = pvResponse.data.items.reduce(
              (sum, item) => sum + item.views,
              0
            );
          }
          data.viewCount = totalViews;
        } catch (err) {
          console.error(
            `Error fetching pageviews for ${data.title}:`,
            err.message
          );
          data.viewCount = 0;
        }

        try {
          const tocResponse = await axios.get(
            `https://en.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(
              data.title
            )}&prop=sections&format=json`
          );
          data.toc =
            tocResponse.data.parse && tocResponse.data.parse.sections
              ? tocResponse.data.parse.sections
              : [];
        } catch (err) {
          console.error(`Error fetching TOC for ${data.title}:`, err.message);
          data.toc = [];
        }

        if (!data.timestamp) {
          data.timestamp = new Date().toISOString();
        }
        data.formattedTimestamp = formatDate(data.timestamp);

        return data;
      })
    );

    res.status(200).json({ articles });
  } catch (error) {
    console.error("Error fetching articles:", error);
    res.status(500).json({ error: "Error fetching articles" });
  }
});

app.get("/api/search", async (req, res) => {
  const { searchTerm } = req.query;

  if (!searchTerm) {
    return res.status(400).json({ error: "No searchTerm provided" });
  }

  try {
    const wikipediaUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&format=json&limit=5&profile=fuzzy&search=${encodeURIComponent(
      searchTerm
    )}&warningsaserror=true`;
    const response = await axios.get(wikipediaUrl);
    res.status(200).json(response.data);
  } catch (err) {
    console.error("Error fetching Wikipedia opensearch:", err.message);
    res.status(500).json({ error: "Error fetching search results" });
  }
});

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

app.options("/api/chat", (req, res) => {
  res.header("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.sendStatus(200);
});

app.post("/api/chat", async (req, res) => {
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
    res.end();
  } catch (error) {
    console.error("Chatbot error:", error);
    return res.status(500).json({ error: error });
  }
});

app.listen(5000, "0.0.0.0", () => {
  console.log(`Server running on port 5000`);
});
