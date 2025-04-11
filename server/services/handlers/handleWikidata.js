import axios from "axios";

function toTitleCase(label) {
  const lowerWords = new Set([
    "of",
    "in",
    "on",
    "for",
    "at",
    "to",
    "by",
    "with",
    "a",
    "an",
    "the",
    "and",
    "from",
    "or",
    "nor",
    "but",
  ]);
  return label
    .split(" ")
    .map((word, idx) => {
      const lower = word.toLowerCase();
      if (idx > 0 && lowerWords.has(lower)) {
        return lower;
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

export async function handleWikidata({ title }) {
  try {
    const entityRes = await axios.get("https://www.wikidata.org/w/api.php", {
      params: {
        action: "wbgetentities",
        ids: title,
        format: "json",
        props: "labels|descriptions|claims|sitelinks",
      },
    });

    const entity = entityRes.data.entities?.[title];
    if (!entity) return null;

    const imageProps = ["P18", "P154", "P94", "P41", "P242", "P109", "P117"];
    let mediaFilename = null;

    for (const prop of imageProps) {
      const val = entity.claims?.[prop]?.[0]?.mainsnak?.datavalue?.value;
      if (typeof val === "string") {
        mediaFilename = val;
        break;
      }
    }

    if (!mediaFilename) {
      const videoVal = entity.claims?.P10?.[0]?.mainsnak?.datavalue?.value;
      if (typeof videoVal === "string") {
        mediaFilename = videoVal;
      }
    }

    const thumbnailUrl = mediaFilename
      ? `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(
          mediaFilename
        )}`
      : null;

    const extractDate = (props) => {
      for (const prop of props) {
        const raw =
          entity.claims?.[prop]?.[0]?.mainsnak?.datavalue?.value?.time;
        if (raw) {
          const parsed = raw.replace("+", "").split("T")[0];
          const date = new Date(parsed);
          if (!isNaN(date)) return parsed;
        }
      }
      return null;
    };

    const publicationDate = extractDate(["P577", "P585", "P580", "P571"]);

    const claims = entity.claims || {};
    const allPropIds = Object.keys(claims);
    const linkedEntityIds = new Set();

    let propLabels = {};
    let entityLabels = {};

    for (const pid of allPropIds) {
      const statements = claims[pid];
      for (const stmt of statements) {
        const datavalue = stmt?.mainsnak?.datavalue?.value;
        if (datavalue?.["entity-type"] === "item") {
          linkedEntityIds.add(datavalue.id);
        }
      }
    }

    if (allPropIds.length) {
      const propLabelRes = await axios.get(
        "https://www.wikidata.org/w/api.php",
        {
          params: {
            action: "wbgetentities",
            ids: allPropIds.join("|"),
            props: "labels",
            format: "json",
            languages: "en",
            origin: "*",
          },
        }
      );
      const entities = propLabelRes.data.entities;
      for (const pid in entities) {
        propLabels[pid] = entities[pid].labels?.en?.value || pid;
      }
    }

    const entityIdsArray = Array.from(linkedEntityIds);
    if (entityIdsArray.length) {
      const chunked = [];
      while (entityIdsArray.length) {
        chunked.push(entityIdsArray.splice(0, 50));
      }
      for (const chunk of chunked) {
        const entLabelRes = await axios.get(
          "https://www.wikidata.org/w/api.php",
          {
            params: {
              action: "wbgetentities",
              ids: chunk.join("|"),
              props: "labels",
              format: "json",
              languages: "en",
              origin: "*",
            },
          }
        );
        const entities = entLabelRes.data.entities;
        for (const eid in entities) {
          entityLabels[eid] = entities[eid].labels?.en?.value || eid;
        }
      }
    }

    const toc = [];
    for (const pid of allPropIds) {
      const rawLabel = propLabels[pid] || pid;
      const label = toTitleCase(rawLabel);
      const val = claims[pid]?.[0]?.mainsnak?.datavalue?.value;
      let valueText = "";

      if (typeof val === "string") {
        valueText = val;
      } else if (typeof val === "object") {
        if (val.amount) {
          valueText = val.amount;
        } else if (val.time) {
          valueText = val.time.replace("+", "").split("T")[0];
        } else if (val["entity-type"] === "item") {
          valueText = entityLabels[val.id] || val.id;
        } else if (val.text) {
          valueText = val.text;
        }
      }

      toc.push({
        toclevel: 2,
        line: `${label}: ${valueText}`,
        anchor: label,
      });
    }

    return {
      title: entity.labels?.en?.value || title,
      extract: entity.descriptions?.en?.value || "",
      extractDataType: "text",
      thumbnail: thumbnailUrl ? { source: thumbnailUrl } : null,
      viewCount: 0,
      pageViewsLink: `https://www.wikidata.org/wiki/${title}`,
      pageUrl: `https://www.wikidata.org/wiki/${title}`,
      toc,
      timestamp: publicationDate,
    };
  } catch (err) {
    console.error("Error in Wikidata handler:", err.message);
    return null;
  }
}
