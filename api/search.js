export default async function handler(req, res) {
  const { searchTerm } = req.query;
  if (!searchTerm) {
    return res.status(400).json({ error: "No searchTerm provided." });
  }

  try {
    const wikipediaUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&format=json&limit=5&profile=fuzzy&search=${encodeURIComponent(
      searchTerm
    )}&warningsaserror=true`;

    const response = await fetch(wikipediaUrl);
    const data = await response.json();

    return res.status(200).json(data);
  } catch (err) {
    console.error("Error fetching search results" + err);
    return res.status(500).json({ error: err.message });
  }
}
