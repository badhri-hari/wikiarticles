import express from "express";
import dotenv from "dotenv";
import setupRoutes from "./routes/setup.js";
import { routeConfigs } from "./routes/routes.js";
import chatRouter from "./routes/chat.js";
import imageRouter from "./routes/image.js";
import fandomRouter from "./routes/fandomSearch.js";

dotenv.config();
const app = express();

app.use(express.json({ limit: "2mb" }));
app.use((req, res, next) => {
  const secret = req.get("X-APP-SECRET");

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-APP-SECRET");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  if (secret !== process.env.APP_SECRET_HEADER) {
    // Comment out for development
    return res.status(403).json({ error: "Unauthorized" });
  }

  next();
});

setupRoutes(app, routeConfigs);

app.use("/api/chat", chatRouter);
app.use("/api/image", imageRouter);
app.use("/api/fandom-search", fandomRouter);

app.listen(5000, "0.0.0.0", () => {
  console.log("Server running on port 5000");
});

export default app;
