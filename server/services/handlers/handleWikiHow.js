import axios from "axios";
import { load } from "cheerio";
import { extractParagraphs } from "../../parsers/parseHtml.js";
import fetchPageViews from "../helpers/fetchPageViews.js";
import fetchLastEditedDate from "../helpers/fetchLastEditedDate.js";

export async function handleWikiHow({
  title,
  baseUrl,
  metricsUrl,
  lang,
  source,
}) {
  try {
    const { data } = await axios.get(`${baseUrl}/api.php`, {
      params: {
        action: "parse",
        page: title,
        prop: "text|sections",
        format: "json",
      },
    });

    const html = data.parse.text["*"];
    const $ = load(html);
    const paragraphs = extractParagraphs($);

    let thumbnailUrl = $("img").first().attr("src") || null;
    if (thumbnailUrl && !thumbnailUrl.startsWith("http")) {
      thumbnailUrl = baseUrl + thumbnailUrl;
    }

    const { viewCount, pageViewsLink } = await fetchPageViews(
      title,
      metricsUrl,
      baseUrl
    );
    const timestamp = await fetchLastEditedDate(
      data.parse.title,
      baseUrl,
      source
    );

    return {
      title: data.parse.title,
      extract: paragraphs,
      extractDataType: "array",
      thumbnail: { source: thumbnailUrl },
      viewCount,
      pageViewsLink,
      pageUrl: `${baseUrl}/${encodeURIComponent(title)}`,
      toc: data.parse.sections || [],
      timestamp,
    };
  } catch (err) {
    console.error("[handleWikiHow] Error:", err.message);
    return null;
  }
}
