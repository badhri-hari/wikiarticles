import { load } from "cheerio";

export function extractParagraphs($) {
  const content = [];

  $(
    "#toc, .infobox, .navbox, .metadata, .catlinks, .mw-references-wrap, .reflist, .vertical-navbox, .sidebar"
  ).remove();

  const removeFromHeading = (selector) => {
    const stopWords = [
      "see also",
      "external links",
      "references",
      "notes",
      "navigation menu",
      "further reading",
    ];

    $(selector).each((_, el) => {
      const $el = $(el);
      const text = $el.text().toLowerCase().trim();
      if (stopWords.some((stop) => text.includes(stop))) {
        let current = $el;
        while (current.length) {
          const next = current.next();
          current.remove();
          current = next;
        }
      }
    });
  };
  removeFromHeading("h2, h3, h4, h5, h6");

  $("#firstHeading.firstHeading").remove();

  for (let i = 6; i >= 1; i--) {
    $(`h${i}`).each((_, el) => {
      const $el = $(el);
      $el.find(".mw-editsection").remove();
      const newTag = `h${Math.min(i + 2, 6)}`;
      const newEl = $(`<${newTag}>`).html($el.text().trim());
      $el.replaceWith(newEl);
    });
  }

  $("table.cquote").each((_, el) => {
    const $table = $(el);
    const $quoteDiv = $table.find("td > div").first();
    const quoteHtml = $quoteDiv.html()?.trim();

    const $cite = $table.find("cite").first();
    const sourceHtml = $cite.length
      ? `<div style="margin-top:1em;text-align:right;font-style:normal;">${$cite.html()}</div>`
      : "";

    if (quoteHtml) {
      const styledQuote = `
        <blockquote style="padding:4px 50px;position:relative;">
          <span style="position:absolute;left:10px;top:-6px;z-index:1;font-family:'Times New Roman',serif;font-weight:bold;color:#B2B7F2;font-size:36px">“</span>
          ${quoteHtml}
          <span style="position:absolute;right:10px;bottom:-20px;z-index:1;font-family:'Times New Roman',serif;font-weight:bold;color:#B2B7F2;font-size:36px">”</span>
          ${sourceHtml}
        </blockquote>
      `;
      $table.replaceWith(styledQuote);
    } else {
      $table.remove();
    }
  });

  $("li").each((_, el) => {
    const $el = $(el);
    const text = $el.text().trim().toLowerCase();
    if (
      text.startsWith("this page was last edited on") ||
      text === "privacy policy" ||
      text === "disclaimers" ||
      text === "about rationalwiki"
    ) {
      let current = $el;
      while (current.length) {
        const next = current.next();
        current.remove();
        current = next;
      }
    } else if (text === "") {
      $el.remove();
    }
  });

  $("h1, h2, h3, h4, h5, h6, p, ul, ol").each((_, el) => {
    const $el = $(el);
    $el.find("img").remove();
    const html = $el.html()?.trim();
    if (html) {
      content.push(`<${el.tagName}>${html}</${el.tagName}>`);
    }
  });

  return content;
}

export function extractTOC(html, source) {
  const $ = load(html);
  const toc = [];

  if (source === "xxx") {
    $(".vector-toc-contents li").each((_, el) => {
      const $el = $(el);
      const $a = $el.find("a").first();

      let anchor = $a.attr("href") || "";
      if (anchor.startsWith("#")) anchor = anchor.slice(1);

      let line = $a
        .text()
        .trim()
        .replace(/^\d+(\.\d+)*\s*/, "");
      let toclevel = 1;
      const match = ($el.attr("class") || "").match(/vector-toc-level-(\d+)/);
      if (match) toclevel = parseInt(match[1], 10);

      toc.push({ line, anchor, toclevel });
    });
  } else {
    $("#toc li").each((_, el) => {
      const $el = $(el);
      const $a = $el.find("a").first();

      let anchor = $a.attr("href") || "";
      if (anchor.startsWith("#")) anchor = anchor.slice(1);

      let line = $a
        .text()
        .trim()
        .replace(/^\d+(\.\d+)*\s*/, "");
      let toclevel = 1;
      const match = ($el.attr("class") || "").match(/toclevel-(\d+)/);
      if (match) toclevel = parseInt(match[1], 10);

      toc.push({ line, anchor, toclevel });
    });
  }

  return toc;
}

export function extractMetadataTable($) {
  const toc = [];
  const metadataTable = $("#mw_metadata");
  if (metadataTable.length) {
    const rows = metadataTable.find("tr").not(".mw-metadata-collapsible");
    rows.each((_, row) => {
      const name = $(row).find("th").text().trim();
      const value = $(row).find("td").text().trim();
      if (name && value) {
        toc.push({
          toclevel: 2,
          line: `${name}: ${value}`,
          anchor: name,
        });
      }
    });
  }
  return toc;
}
