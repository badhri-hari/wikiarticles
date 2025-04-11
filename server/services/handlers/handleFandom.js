import axios from "axios";
import { load } from "cheerio";

export async function handleFandom({ baseUrl }) {
  try {
    const response = await axios.get(`${baseUrl}/Special:random`);
    const pageUrl =
      response.request?.res?.responseUrl || `${baseUrl}/Special:random`;
    const $ = load(response.data);

    let jsonLd = $("script[type='application/ld+json']").html();
    let parsedData = {};

    try {
      parsedData = JSON.parse(jsonLd);
    } catch (e) {
      console.error("[handleFandom] Failed to parse JSON-LD:", e.message);
    }

    const titleText =
      parsedData.headline ||
      parsedData.name ||
      $("title").text().replace(" | Fandom", "").trim();
    const aboutExtract = parsedData.abstract || parsedData.description || "";

    const imageEl = $("img.pi-image-thumbnail").first();
    const memeImage = imageEl.length ? imageEl.attr("src") : null;

    if (memeImage && !memeImage.startsWith("http")) {
      memeImage = null;
    }

    let timestamp = null;
    try {
      const historyResponse = await axios.get(`${pageUrl}?action=history`);
      const history$ = load(historyResponse.data);

      const firstDateHeader = history$(".mw-index-pager-list-header")
        .first()
        .text()
        .trim();

      if (firstDateHeader) {
        const date = new Date(firstDateHeader);
        if (!isNaN(date)) {
          timestamp = date.toISOString().split("T")[0];
        }
      }
    } catch (err) {
      console.error("Error fetching history:", err);
    }

    const toc = [];
    $("#toc ul li").each((_, el) => {
      const $li = $(el);
      const anchorEl = $li.find("a").first();
      const anchorHref = anchorEl.attr("href") || "";
      let anchorText = anchorEl.find(".toctext").text().trim();

      anchorText = anchorText.replace(/\[\]$/, "").trim();

      const toclevelMatch = $li.attr("class")?.match(/toclevel-(\d)/);
      const toclevel = toclevelMatch ? parseInt(toclevelMatch[1], 10) : 1;
      const anchor = anchorHref.startsWith("#")
        ? anchorHref.slice(1)
        : anchorText.replace(/\s+/g, "_");

      if (anchorText && anchor) {
        toc.push({
          line: anchorText,
          anchor: anchor,
          toclevel: toclevel,
        });
      }
    });

    return {
      title: titleText.trim(),
      extract: aboutExtract.trim(),
      extractDataType: "text",
      thumbnail: memeImage ? { source: memeImage } : null,
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
