import axios from "axios";
import { load } from "cheerio";
import fetchPageViews from "../helpers/fetchPageViews.js";
import { extractParagraphs } from "../../parsers/parseHtml.js";
import fetchLastEditedDate from "../helpers/fetchLastEditedDate.js";

export async function handleWikisource({ title, baseUrl, metricsUrl, source }) {
  const { data } = await axios.get(`${baseUrl}/w/api.php`, {
    params: {
      action: "parse",
      page: title,
      prop: "text|sections",
      format: "json",
    },
  });

  const parseData = data.parse;
  if (!parseData) return null;

  const html = parseData.text["*"];
  const $ = load(html);
  const paragraphs = extractParagraphs($);
  const toc = parseData.sections || [];

  const { viewCount, pageViewsLink } = await fetchPageViews(
    title,
    metricsUrl,
    baseUrl
  );
  const timestamp = await fetchLastEditedDate(parseData.title, baseUrl, source);

  return {
    title: parseData.title,
    extract: paragraphs,
    extractDataType: "array",
    thumbnail: null,
    viewCount,
    pageViewsLink,
    pageUrl: `${baseUrl}/wiki/${encodeURIComponent(title)}`,
    toc,
    timestamp,
  };
}
