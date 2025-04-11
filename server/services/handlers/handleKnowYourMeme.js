import axios from "axios";
import { load } from "cheerio";

export async function handleKnowYourMeme({ baseUrl }) {
  try {
    const response = await axios.get(`${baseUrl}/random`);
    const pageUrl = response.request?.res?.responseUrl || `${baseUrl}/random`;
    const $ = load(response.data);

    let titleText = $("title").text().trim();
    if (titleText.includes(" | Know Your Meme")) {
      titleText = titleText.replace(" | Know Your Meme", "").trim();
    }

    let aboutExtract = $("#about").next("p").text().trim();
    const len = aboutExtract.length;
    if (len % 2 === 0) {
      const half = len / 2;
      if (
        aboutExtract.substring(0, half).trim() ===
        aboutExtract.substring(half).trim()
      ) {
        aboutExtract = aboutExtract.substring(0, half).trim();
      }
    }

    let memeImage = $("div.edge-to-edge img").first().attr("src") || null;
    if (memeImage && !memeImage.startsWith("http")) {
      memeImage = baseUrl + memeImage;
    }

    let timestamp = null;
    const timestampTitle = $(".entry-header-timestamp.tip").attr("title");
    if (timestampTitle) {
      const datePart = timestampTitle.split(" at ")[0];
      const parsedDate = new Date(datePart);

      if (!isNaN(parsedDate)) {
        timestamp = parsedDate.toISOString().split("T")[0];
      }
    }

    return {
      title: titleText,
      extract: aboutExtract,
      extractDataType: "text",
      thumbnail: { source: memeImage },
      viewCount: 0,
      pageViewsLink: null,
      pageUrl,
      toc: [],
      timestamp,
    };
  } catch (err) {
    console.error("[handleKnowYourMeme] Error:", err.message);
    return null;
  }
}
