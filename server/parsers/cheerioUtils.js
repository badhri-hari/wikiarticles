export function getFirstImageSrc($, baseUrl = "") {
  let src = $("img").first().attr("src") || null;
  if (src && !src.startsWith("http")) {
    src = baseUrl + src;
  }
  return src;
}

export function getTitleFromHtml($) {
  return $("h1#firstHeading").text().trim() || $("title").text().trim();
}

export function getCleanedDescription(rawHtml) {
  return rawHtml.replace(/<[^>]*>/g, "").trim();
}

export function shuffleAndLimit(array, limit) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array.slice(0, limit);
}
