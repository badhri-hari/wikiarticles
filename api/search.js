import axios from "axios";
import wtf from "wtf_wikipedia";

export default async function handler(req, res) {
  const { searchTerm } = req.query;
  if (!searchTerm) {
    return res.status(400).json({ error: "No searchTerm provided." });
  }

  try {
    const wikipediaUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&format=json&limit=5&profile=fuzzy&search=${encodeURIComponent(
      searchTerm
    )}&warningsaserror=true`;

    wtf.extend((await import("wtf-plugin-summary")).default);
    const opts = {
      article: true,
      template: true,
      sentence: false,
      category: false,
    };

    const response = await axios.get(wikipediaUrl);
    const articleTitles = response.data[1];

    const summaries = [];
    for (let i = 0; i < articleTitles.length; i++) {
      try {
        const doc = await wtf.fetch(articleTitles[i]);
        const summary = doc.summary(opts);
        summaries.push(summary);
      } catch (error) {
        console.error(`Error getting summary for ${articleTitles[i]}:`, error);
        summaries.push("");
      }
    }

    response.data[4] = summaries;
    return res.status(200).json(data);
  } catch (err) {
    console.error("Error fetching search results" + err);
    return res.status(500).json({ error: err.message });
  }
}
