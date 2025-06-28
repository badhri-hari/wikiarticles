import axios from "axios";
import { load } from "cheerio";
import { extractTOC, extractParagraphs } from "../../parsers/parseHtml.js";
import { getTitleFromHtml } from "../../parsers/cheerioUtils.js";
import fetchLastEditedDate from "../helpers/fetchLastEditedDate.js";

export async function handleBasicHTML({ title, baseUrl, apiPath, source }) {
  let pageUrl;
  let html;

  try {
    let response;

    if (
      source === "edramatica" ||
      source === "everybodywiki" ||
      source === "hetero-balls"
    ) {
      response = await axios.get(`${baseUrl}/${encodeURIComponent(title)}`);
    } else if (source === "species") {
      response = await axios.get(
        `${baseUrl}/wiki/${encodeURIComponent(title)}`
      );
    } else {
      response = await axios.get(`${baseUrl}${apiPath}`);
    }

    pageUrl = response.request?.res?.responseUrl || `${baseUrl}${apiPath}`;
    html = response.data;
  } catch (err) {
    console.error(
      `[handleBasicHTML] Failed to fetch from ${pageUrl || "initial request"}:`,
      err.message
    );
    return null;
  }

  const $ = load(html);

  $("sup").remove();

  if (source === "edramatica") {
    $(".sitenotice").remove();
  } else if (source === "polandball") {
    const classesToRemove = [
      "wds-tabs",
      "wds-list",
      "cosmos-dropdown-list",
      "pi-data-label",
      "pi-font",
      "pi-secondary-font",
      "cosmos-toolbar-tools",
      "recentchanges-module",
    ];

    classesToRemove.forEach((className) => {
      $(`.${className}`).remove();
    });

    $("#Gallery").remove();

    $("footer").remove();
  } else if (source === "illogic") {
    $('span.quoteline[style*="background-color"]').each((_, el) => {
      const style = $(el).attr("style");
      const cleanedStyle = style
        .split(";")
        .filter((s) => !s.trim().startsWith("background-color"))
        .join(";");
      $(el).attr("style", cleanedStyle);
    });
  } else if (source === "xxx") {
    const classesToRemove = [
      "vector-menu-content-list",
      "vector-pinnable-header",
      "vector-toc-pinnable-header",
      "vector-pinnable-header-pinned",
      "vector-toc-contents",
      "vector-settings",
    ];

    classesToRemove.forEach((className) => {
      $(`.${className}`).remove();
    });

    $("footer").remove();
  } else if (source === "rational") {
    $("p span[style*='color']").each((_, el) => {
      const style = $(el).attr("style");
      const cleanedStyle = style
        .split(";")
        .filter((s) => !s.trim().startsWith("color"))
        .join(";")
        .trim();

      if (cleanedStyle) {
        $(el).attr("style", cleanedStyle);
      } else {
        $(el).removeAttr("style");
      }

      $(el).removeAttr("class");
    });
  }

  const titleExtracted = getTitleFromHtml($);
  let paragraphs = extractParagraphs($, source);

  if (source === "everybodywiki") {
    paragraphs = paragraphs.slice(3);
  }

  paragraphs = paragraphs.map((paragraphHtml) => {
    const $$ = load(paragraphHtml);
    $$("a").each((_, el) => {
      let href = $$(el).attr("href");
      if (href) {
        if (!href.startsWith("http")) {
          href = baseUrl + href;
          $$(el).attr("href", href);
        }

        $$(el).attr("target", "_blank");
        $$(el).attr("rel", "noreferrer");
        $$(el).attr("aria-label", `Click on this link to go to ${href}`);
      }
    });
    return $$.html();
  });

  const filterTexts = {
    rational: [
      "We are a small non-profit with no staff",
      "This article is a ",
      " might refer to:",
      "by pure word count, this article lacks depth of content.",
      "could use some help. Please research the article's assertions. Whatever is credible should be sourced, and what is not should be removed.",
    ],
    edramatica: [
      "Contact an admin on ",
      "This article is a ",
      "•",
      "Missing something? You can help by ",
    ],
    polandball: ["•", "←", "↓", "→", "This article is a "],
    incel: ["•"],
    xxx: ["You can help Pornopedia by "],
    everybodywiki: [
      "You can edit almost every page by ",
      "(adsbygoogle = window.adsbygoogle || []).push({});",
      "Script error:",
      `This article "`,
      "This article is a ",
      "The list of its authors can be seen in its historical and/or the page ",
      "he content of this page is too short. Please rewrite the article in a neutral tone with at least 300 words, and then remove this template so the page can be indexed by search engines. If this page was blanked, content will be put back soon and indexed again.",
    ],
  };

  if (filterTexts[source]) {
    paragraphs = paragraphs.filter(
      (paragraph) =>
        !filterTexts[source].some((text) => paragraph.includes(text))
    );
  }

  if (source === "edramatica") {
    paragraphs = paragraphs.filter((paragraph) => {
      const lines = paragraph
        .split(/\n|<br\s*\/?>/i)
        .map((line) => line.trim())
        .filter(Boolean);

      const isLikelyNameList =
        lines.length >= 5 &&
        lines.every((line) => line.length < 30 && !line.includes(" "));

      return !isLikelyNameList;
    });
  }

  if (paragraphs.length === 0) {
    return null;
  }

  const toc = extractTOC(html, source);
  const timestamp = await fetchLastEditedDate(titleExtracted, baseUrl, source);
  let thumbnailSource = $('meta[property="og:image"]').attr("content") || null;
  if (thumbnailSource) {
    if (
      source === "illogic" ||
      (source === "polandball" && thumbnailSource.includes("Wiki.png"))
    ) {
      thumbnailSource = null;
    } else if (source === "edramatica" && thumbnailSource.includes("ED_logo")) {
      thumbnailSource = null;
    } else if (
      source === "incel" &&
      thumbnailSource.includes("Incelwiki.png")
    ) {
      thumbnailSource = null;
    } else if (
      source === "polcompball" &&
      thumbnailSource.includes("Polcompballwikiimage")
    ) {
      thumbnailSource = null;
    }
  }

  return {
    title: titleExtracted,
    extract: paragraphs,
    extractDataType: "array",
    thumbnail: {
      source: thumbnailSource,
    },
    viewCount: 0,
    pageViewsLink: null,
    pageUrl,
    toc,
    timestamp,
  };
}
