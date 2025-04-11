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
  }

  if (source === "illogic") {
    $('span.quoteline[style*="background-color"]').each((_, el) => {
      const style = $(el).attr("style");
      const cleanedStyle = style
        .split(";")
        .filter((s) => !s.trim().startsWith("background-color"))
        .join(";");
      $(el).attr("style", cleanedStyle);
    });
  }

  if (source === "xxx") {
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
  }

  if (source === "rational") {
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
  let paragraphs = extractParagraphs($);

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
    polandball: ["•", "←", "↓", "→", "File:", "This article is a "],
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

  let thumbnailUrl;
  if (source === "polandball" || source === "polcompball") {
    thumbnailUrl = $("img.pi-image-thumbnail").first().attr("src") || null;
  } else if (source === "edramatica") {
    thumbnailUrl =
      $('figure[typeof="mw:File/Thumb"] img').first().attr("src") || null;
  } else if (source === "xxx") {
    thumbnailUrl = $(".mw-file-element").first().attr("src") || null;
  } else if (source === "rational" || source === "uncyclo") {
    thumbnailUrl = $(".thumbimage").first().attr("src") || null;
  } else {
    thumbnailUrl = $("img").first().attr("src") || null;
  }

  if (
    thumbnailUrl &&
    !thumbnailUrl.startsWith("http") &&
    source !== "uncyclo" &&
    source !== "polandball" &&
    source !== "polcompball" &&
    source !== "illogic"
  ) {
    thumbnailUrl = baseUrl + thumbnailUrl;
  }

  if (thumbnailUrl) {
    const badThumbnails = [
      "/images/thumb/f/fe/Stub.png/",
      "/resources/assets/poweredby_mediawiki",
      "/images/Creative_Commons_footer.png",
      "/images/Weird_Gloop_footer_hosted",
      "/w/uncyclomedia_icon.svg",
      "/w/Powered_by_MediaWiki_blob.svg",
      "Bouncywikilogo",
      "/w/uncyclomedia_icon.svg",
      "/resources/assets/poweredby_mediawiki",
      "Photo_needed",
      "/Mon_Logo.png",
      "/PayPal_Logo",
    ];

    if (badThumbnails.some((bad) => thumbnailUrl.includes(bad))) {
      thumbnailUrl = null;
    }
  }

  const toc = extractTOC(html, source);
  const timestamp = await fetchLastEditedDate(titleExtracted, baseUrl, source);

  return {
    title: titleExtracted,
    extract: paragraphs,
    extractDataType: "array",
    thumbnail: {
      source: thumbnailUrl,
    },
    viewCount: 0,
    pageViewsLink: null,
    pageUrl,
    toc,
    timestamp,
  };
}
