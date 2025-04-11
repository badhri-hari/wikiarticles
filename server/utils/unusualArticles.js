import axios from "axios";
import { load } from "cheerio";
import getData from "../services/getData.js";
import { shuffleAndLimit } from "../parsers/cheerioUtils.js";

export default async function fetchUnusualWikiArticles(
  url,
  numRequests,
  baseUrl,
  metricsUrl
) {
  try {
    const { data: html } = await axios.get(url);
    const $ = load(html);
    const result = [];

    $("table").each((_, table) => {
      $(table)
        .find("tr")
        .each((_, row) => {
          const cells = $(row).find("td");
          if (cells.length === 2) {
            const titleCell = $(cells[0]);
            const link = titleCell.find("a").attr("href");
            const description = $(cells[1]).text().trim().replace(/\n/g, " ");
            if (link && link.startsWith("/wiki/")) {
              const titleFromUrl = decodeURIComponent(
                link.replace("/wiki/", "").replace(/_/g, " ")
              );
              result.push({ title: titleFromUrl, description, url: link });
            }
          }
        });
    });

    const selected = shuffleAndLimit(result, numRequests);

    return await Promise.all(
      selected.map((item) =>
        getData({
          title: item.title,
          lang: "en",
          source: "articles",
          baseUrl,
          metricsUrl,
          description: item.description,
        })
      )
    );
  } catch (error) {
    console.error("Error scraping wiki:", error.message);
    return [];
  }
}
