import express from "express";
import axios from "axios";

const fandomRouter = express.Router();

fandomRouter.get("/", async (req, res) => {
  const query = req.query.q;

  if (!query || query.trim().length < 3) {
    return res
      .status(400)
      .json({ error: "Query must be at least 3 characters." });
  }

  const fandomSlug = query.trim().toLowerCase().replace(/\s+/g, "-");
  const initialUrl = `https://${fandomSlug}.fandom.com`;

  try {
    const response = await axios.get(initialUrl, {
      maxRedirects: 2,
    });

    const finalUrl = response.request?.res?.responseUrl || initialUrl;

    return res.json({
      title: query.trim(),
      url: finalUrl,
    });
  } catch (err) {
    console.error("Fandom redirect check error:", err.message);
    return res.status(404).json({ error: "No valid fandom wiki found." });
  }
});

export default fandomRouter;
