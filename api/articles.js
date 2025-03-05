import axios from "axios";

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

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  res.setHeader("Access-Control-Allow-Origin", "*");

  try {
    const numArticles = 100;
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
}
