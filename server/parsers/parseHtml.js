import { load } from "cheerio";

export function extractParagraphs($, source = null) {
  const content = [];
  const seenTexts = new Set();

  $(
    "#toc, .infobox, .navbox, .metadata, #mw-page-header-links, .catlinks, .mw-references-wrap, .reflist, .vertical-navbox, .sidebar, .bg-global-nav, .mw-file-element, .cosmos-mobile-navigation, .cosmos-dropdown-list, .wds-dropdown__content, .cosmos-tools-list, .recentchanges-module, .wds-dropdown__toggle, .mw-portlet, #user-tools"
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
    $quoteDiv.find("span").each((_, span) => {
      const $span = $(span);
      const text = $span.text().trim();
      if (text === "“" || text === "”") {
        $span.remove();
      }
    });

    const quoteHtml = $quoteDiv.html()?.trim();

    const $cite = $table.find("cite").first();
    const sourceHtml = $cite.length
      ? `<div style="margin-top:1em;text-align:right;font-style:normal;">${$cite.html()}</div>`
      : "";

    if (quoteHtml) {
      const styledQuote = `
        <blockquote>
          ${quoteHtml}
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

  $("h1, h2, h3, h4, h5, h6, blockquote, p, ul, ol").each((_, el) => {
    const $el = $(el);
    const html = $el.html()?.trim();
    const text = $el.text().trim();

    const existingStyle = $el.attr("style") || "";
    const transparentStyle = existingStyle
      .replace(/background[^;]*;?/gi, "")
      .trim();
    $el.attr(
      "style",
      `${transparentStyle}; background: transparent; background-color: transparent;`.trim()
    );

    if (
      source === "polandball" ||
      source === "polcompball" ||
      source === "polcompballanarchy"
    ) {
      $el.find("a:has(img)").each((_, link) => {
        const $link = $(link);
        const $img = $link.find("img").first();

        $img.attr("style", "display:inline; width:17px; height:17px;");
        $link.replaceWith($img);
      });
    } else {
      $el.find("img").remove();
    }

    if (
      $el.parents("blockquote").length > 0 &&
      el.tagName.toLowerCase() === "p"
    )
      return;

    if (html && text && !seenTexts.has(text)) {
      content.push(`<${el.tagName}>${html}</${el.tagName}>`);
      seenTexts.add(text);
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
