import axios from "axios";
import { load } from "cheerio";
import fetchPageViews from "../helpers/fetchPageViews.js";
import { extractMetadataTable } from "../../parsers/parseHtml.js";

export async function handleMedia({ title, baseUrl, metricsUrl }) {
  const allowedExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".webp",
    ".svg",
    ".mp4",
    ".webm",
  ];
  const fileExtension = title.substring(title.lastIndexOf(".")).toLowerCase();
  if (!allowedExtensions.includes(fileExtension)) return null;

  const { data } = await axios.get(`${baseUrl}/w/api.php`, {
    params: {
      action: "query",
      format: "json",
      titles: title,
      prop: "imageinfo",
      iiprop: "url|extmetadata",
    },
  });

  const page = Object.values(data.query.pages)[0];
  const fileData = page.imageinfo?.[0];
  if (!fileData) return null;

  const extract =
    fileData.extmetadata?.ImageDescription?.value?.replace(/<[^>]*>/g, "") ||
    "";
  const titleText =
    fileData.extmetadata?.ObjectName?.value?.replace(/<[^>]*>/g, "") || title;
  const pageUrl = fileData.descriptionurl;
  const thumbnailUrl = fileData.url;

  let toc = [];
  try {
    const htmlRes = await axios.get(`${baseUrl}/wiki/${title}`);
    const $ = load(htmlRes.data);
    toc = extractMetadataTable($);
  } catch (err) {
    console.error("Error fetching TOC for media:", err.message);
  }

  const { viewCount, pageViewsLink } = await fetchPageViews(
    title,
    metricsUrl,
    baseUrl
  );

  return {
    title: titleText,
    extract,
    extractDataType: "text",
    thumbnail: { source: thumbnailUrl },
    viewCount,
    pageViewsLink,
    pageUrl,
    toc,
    timestamp: fileData.extmetadata?.DateTime?.value || null,
  };
}
