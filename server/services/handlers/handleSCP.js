import axios from "axios";
import { load } from "cheerio";

import { extractParagraphs } from "../../parsers/parseHtml.js";
import { getTitleFromHtml } from "../../parsers/cheerioUtils.js";

export async function handleSCP({ title, baseUrl, apiPath, source }) {
  let html;
  let pageUrl;
  let scpNumber;

  try {
    const randomResponse = await axios.get(`${baseUrl}${apiPath}`);
    const $random = load(randomResponse.data);
    const scpLink = $random('div.list-pages-item a[href^="/scp-"]').first();
    scpNumber = scpLink.text().trim();
    const scpPath = scpLink.attr("href");
    if (!scpNumber || !scpPath) {
      throw new Error("Could not extract SCP number or path");
    }
    pageUrl = `${baseUrl}${scpPath}`;
    const scpResponse = await axios.get(pageUrl);
    html = scpResponse.data;
  } catch (err) {
    console.error(`[handleSCP] Failed to fetch SCP:`, err.message);
    return null;
  }

  const $ = load(html);

  $("#top-bar").remove();
  $(".mobile-top-bar").remove();
  $(".backlinks-module-box").remove();

  const footnotes = {};
  $("div.footnote-footer").each((_, el) => {
    const id = $(el).attr("id");
    const num = id?.split("-")[1];
    const text = $(el)
      .text()
      .replace(/^\d+\.\s*/, "")
      .trim();
    if (num) footnotes[num] = text;
  });

  $("sup.footnoteref").each((_, el) => {
    const $el = $(el);
    const link = $el.find("a");
    const refNum = link.text().trim();
    const tooltip = footnotes[refNum];
    if (tooltip) {
      $el.replaceWith(
        `<sup title="${tooltip}" style="cursor: pointer">[${refNum}]</sup>`
      );
    }
  });

  let titleExtracted = getTitleFromHtml($)
    .replace(/\s*-\s*SCP Foundation$/i, "")
    .trim();

  const thumbnailEl = $("div.scp-image-block img").first();
  const thumbnailSrc = thumbnailEl.attr("src") || null;

  let paragraphs = extractParagraphs($);

  paragraphs = paragraphs.map((paragraphHtml) => {
    const $$ = load(paragraphHtml);
    $$("a").each((_, el) => {
      const href = $$(el).attr("href");
      if (href && !href.startsWith("http")) {
        $$(el).attr("href", baseUrl + href);
      }
    });
    return $$.html();
  });

  paragraphs = paragraphs.slice(8);

  const cutoffIndex = paragraphs.findIndex((p) => {
    const $$ = load(p);
    const text = $$.text().trim();
    return text.startsWith("« SCP-");
  });

  if (cutoffIndex !== -1) {
    paragraphs = paragraphs.slice(0, cutoffIndex);
  }

  const badPatterns = [
    /\{\$.*?\}/i,
    /▸ More by this Author ◂/i,
    /^Author:\s*/i,
    /^Translator:\s*/i,
    /^Image Credit:\s*/i,
    /^Image:\s*/i,
    /^F\.A\.Q\./i,
    /^\[\s*\]/,
    /[\uF129]/,
    /^Article:\s*SCP-/i,
    /^Original:\s*h/i,
  ];

  paragraphs = paragraphs.filter(
    (p) => !badPatterns.some((pattern) => pattern.test(p.trim()))
  );

  if (paragraphs.length > 0) {
    paragraphs = paragraphs.slice(1);
  }

  let viewCount = null;
  const ratingEl = $("span.rate-points .number").first();
  if (ratingEl.length) {
    const raw = ratingEl.text().trim();
    viewCount = raw.startsWith("+") || raw.startsWith("-") ? raw : `+${raw}`;
  }

  let rawTimestamp = $("div#page-info .odate").first().text().trim();
  let timestamp = null;
  if (rawTimestamp) {
    const parsedDate = new Date(rawTimestamp);
    if (!isNaN(parsedDate)) {
      timestamp = parsedDate.toISOString().split("T")[0];
    }
  }

  return {
    title: titleExtracted,
    extract: paragraphs,
    extractDataType: "array",
    thumbnail: {
      source: thumbnailSrc,
    },
    viewCount,
    pageViewsLink: null,
    pageUrl,
    toc: [],
    timestamp,
  };
}
