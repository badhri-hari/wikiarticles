import axios from "axios";
import { load } from "cheerio";
import fetchTOC from "./fetchTOC.js";
import fetchPageViews from "./fetchPageViews.js";
import { extractParagraphs } from "../../parsers/parseHtml.js";

export async function fetchSummary({
  title,
  baseUrl,
  metricsUrl,
  source,
  description = null,
}) {
  try {
    const summaryRes = await axios.get(
      `${baseUrl}/api/rest_v1/page/summary/${encodeURIComponent(title)}`
    );
    const summary = summaryRes.data;
    if (!summary || summary.type?.includes("not_found")) return null;

    let extract = description || summary.extract;
    let extractDataType = "text";
    const pageUrl = summary.content_urls?.desktop?.page;
    let thumbnailUrl =
      summary.originalimage?.source || summary.thumbnail?.source || null;

    if (thumbnailUrl) {
      const urlObj = new URL(thumbnailUrl);
      urlObj.searchParams.set("width", "1080");
      thumbnailUrl = urlObj.toString();
    } else if (source !== "books") {
      return null;
    }

    const toc = await fetchTOC(baseUrl, title);

    let publicationDate = null;
    if (source === "news") {
      try {
        const htmlRes = await axios.get(
          `${baseUrl}/api/rest_v1/page/html/${encodeURIComponent(title)}`
        );
        const $ = load(htmlRes.data);

        const publishText = $("#publishDate")
          .closest("strong.published")
          .text();
        if (publishText) {
          publicationDate = publishText.replace(/\s+/g, " ").trim();
        }

        const paragraphs = extractParagraphs($);
        const stopIndex = paragraphs.findIndex((t) =>
          /^Have an opinion|HAVE YOUR SAY|Share this:|This page is archived|Please note that due to our archival policy, we will not alter or update the content of articles that are archived, but will only accept requests to make grammatical and formatting corrections\.|Got a correction\? Add the template {{editprotected}} to the talk page along with your corrections, and it will be brought to the attention of the administrators\./.test(
            t
          )
        );
        if (stopIndex !== -1) {
          paragraphs.splice(stopIndex);
        }
        if (paragraphs.length) {
          extract = paragraphs;
          extractDataType = "array";
        }
      } catch (err) {
        console.warn("Failed to parse news publication date:", err.message);
      }
    }

    const { viewCount, pageViewsLink } = await fetchPageViews(
      title,
      metricsUrl,
      baseUrl
    );

    return {
      title: summary.title,
      extract,
      extractDataType,
      thumbnail: { source: thumbnailUrl },
      viewCount,
      pageViewsLink,
      pageUrl,
      toc,
      timestamp: publicationDate || summary.timestamp?.split("T")[0] || null,
    };
  } catch (err) {
    console.error("Error in fetchSummary:", err.message);
    return null;
  }
}
