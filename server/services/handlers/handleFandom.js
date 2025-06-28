import axios from "axios";
import { load } from "cheerio";

export async function handleFandom({ baseUrl }) {
  try {
    const response = await axios.get(`${baseUrl}/Special:random`);
    const pageUrl =
      response.request?.res?.responseUrl || `${baseUrl}/Special:random`;
    const $ = load(response.data);

    const titleText =
      $('meta[property="og:title"]').attr("content")?.trim() || "";

    const aboutExtract =
      $('meta[property="og:description"]').attr("content")?.trim() || "";

    let imageUrl =
      $('meta[property="og:image"]').attr("content")?.trim() || null;
    if (imageUrl?.includes("Site-logo.png")) {
      imageUrl = null;
    }

    let timestamp = null;
    try {
      const historyResponse = await axios.get(`${pageUrl}?action=history`);
      const history$ = load(historyResponse.data);
      const firstDateHeader = history$(".mw-index-pager-list-header")
        .first()
        .text()
        .trim();
      const date = new Date(firstDateHeader);
      if (!isNaN(date)) {
        timestamp = date.toISOString().split("T")[0];
      }
    } catch (err) {
      console.error("Error fetching history:", err);
    }

    const toc = [];
    $("#toc li").each((_, el) => {
      const $li = $(el);
      const $a = $li.find("> a").first();
      const href = $a.attr("href");
      const anchorText = $a.find(".toctext").text().trim();

      const toclevelMatch = $li.attr("class")?.match(/toclevel-(\d+)/);
      const toclevel = toclevelMatch ? parseInt(toclevelMatch[1], 10) : 1;

      if (anchorText && href) {
        toc.push({
          line: anchorText,
          anchor: href.replace(/^#/, ""),
          toclevel: toclevel,
        });
      }
    });

    return {
      title: titleText,
      extract: aboutExtract,
      extractDataType: "text",
      thumbnail: imageUrl ? { source: imageUrl } : null,
      viewCount: 0,
      pageViewsLink: null,
      pageUrl,
      toc,
      timestamp,
    };
  } catch (err) {
    console.error("[handleFandom] Error:", err.message);
    return null;
  }
}
