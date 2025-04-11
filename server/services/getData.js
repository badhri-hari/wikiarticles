import { handleMedia } from "./handlers/handleMedia.js";
import { handleWikisource } from "./handlers/handleWikisource.js";
import { handleBasicHTML } from "./handlers/handleBasicHTML.js";
import { handleSCP } from "./handlers/handleSCP.js";
import { handleKnowYourMeme } from "./handlers/handleKnowYourMeme.js";
import { handleWikidata } from "./handlers/handleWikidata.js";
import { handleFandom } from "./handlers/handleFandom.js";
import { handleWikiHow } from "./handlers/handleWikiHow.js";
import { fetchSummary } from "./helpers/fetchSummary.js";

export default async function getData({
  title,
  baseUrl,
  metricsUrl,
  source,
  lang = "en",
  description = null,
  apiPath = null,
}) {
  const input = {
    title,
    baseUrl,
    metricsUrl,
    source,
    lang,
    description,
    apiPath,
  };

  try {
    if (source === "media") {
      return await handleMedia(input);
    }

    if (source === "wikisource") {
      return await handleWikisource(input);
    }

    if (
      [
        "meta",
        "micronations",
        "rational",
        "edramatica",
        "everybodywiki",
        "polandball",
        "polcompball",
        "hetero-balls",
        "incel",
        "illogic",
        "uncyclo",
        "unop",
        "xxx",
        "trump",
      ].includes(source)
    ) {
      return await handleBasicHTML(input, apiPath);
    }

    if (source === "fandom") {
      return await handleFandom(input);
    }

    if (source === "scp") {
      return await handleSCP(input);
    }

    if (source === "memez") {
      return await handleKnowYourMeme(input);
    }

    if (source === "data") {
      return await handleWikidata(input);
    }

    if (source === "how") {
      return await handleWikiHow(input);
    }

    return await fetchSummary(input);
  } catch (error) {
    console.error(
      `[getData] Error processing source=${source} title=${title}:`,
      error
    );
    return null;
  }
}
