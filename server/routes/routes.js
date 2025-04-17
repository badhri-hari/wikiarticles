import axios from "axios";
import fetchUnusualWikiArticles from "../utils/unusualArticles.js";
import getData from "../services/getData.js";

export const routeConfigs = [
  {
    path: "/api/species",
    total: 10,
    source: "species",
    baseUrl: "https://species.wikimedia.org",
    apiPath: "/w/api.php",
    metricsUrl:
      "https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/species.wikimedia/all-access/all-agents",
  },
  {
    path: "/api/voyage",
    total: 15,
    source: "voyage",
    baseUrl: (lang) => `https://${lang}.wikivoyage.org`,
    apiPath: "/w/api.php",
    metricsUrl: (lang) =>
      `https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/${lang}.wikivoyage.org/all-access/all-agents`,
  },
  {
    path: "/api/news",
    total: 5,
    source: "news",
    baseUrl: (lang) => `https://${lang}.wikinews.org`,
    apiPath: "/w/api.php",
    metricsUrl: (lang) =>
      `https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/${lang}.wikinews/all-access/all-agents`,
  },
  {
    path: "/api/source",
    total: 20,
    source: "wikisource",
    baseUrl: (lang) => `https://${lang}.wikisource.org`,
    apiPath: "/w/api.php",
    metricsUrl: (lang) =>
      `https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/${lang}.wikisource/all-access/all-agents`,
  },
  {
    path: "/api/how",
    total: 20,
    source: "how",
    baseUrl: (lang) => `https://${lang}.wikihow.com`,
    apiPath: "/api.php",
    metricsUrl: "",
  },
  {
    path: "/api/data",
    total: 10,
    source: "data",
    baseUrl: "https://wikidata.org",
    apiPath: "/w/api.php",
    metricsUrl:
      "https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/wikidata/all-access/all-agents",
  },
  {
    path: "/api/edramatica",
    total: 5,
    source: "edramatica",
    customFetchFn: async () => {
      return await Promise.all(
        Array.from({ length: 5 }).map(() =>
          getData({
            title: "Special:Random",
            baseUrl: "https://edramatica.com",
            metricsUrl: "",
            source: "edramatica",
          })
        )
      );
    },
    noDataError: "No valid ED articles found",
  },
  {
    path: "/api/books",
    total: 20,
    source: "books",
    customFetchFn: async (req) => {
      const lang = req.query.lang || "en";
      const response = await axios.get(
        `https://${lang}.wikibooks.org/w/api.php`,
        {
          params: {
            action: "query",
            format: "json",
            list: "random",
            rnnamespace: 0,
            rnlimit: 20,
          },
        }
      );

      const titles =
        response.data.query?.random
          .map((i) => i.title.split("/")[0].trim())
          .filter((t) => !t.startsWith("Subject:")) || [];

      return await Promise.all(
        titles.map((title) =>
          getData({
            title,
            lang,
            baseUrl: `https://${lang}.wikibooks.org`,
            metricsUrl: `https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/${lang}.wikibooks/all-access/all-agents`,
            source: "books",
          })
        )
      );
    },
    noDataError: "No valid books found",
  },
  {
    path: "/api/media",
    total: 20,
    source: "media",
    customFetchFn: async (req) => {
      const lang = req.query.lang || "en";
      const videoRes = await axios.get(
        "https://commons.wikimedia.org/w/api.php",
        {
          params: {
            action: "query",
            format: "json",
            generator: "categorymembers",
            gcmtitle: "Category:Video_files",
            gcmlimit: 1,
          },
        }
      );

      const videoTitle = Object.values(videoRes.data.query?.pages || {})[0]
        ?.title;

      const videoData = videoTitle
        ? await getData({
            title: videoTitle,
            lang,
            baseUrl: "https://commons.wikimedia.org",
            metricsUrl:
              "https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/commons.wikimedia/all-access/all-agents",
            source: "media",
          })
        : null;

      const imageRes = await axios.get(
        "https://commons.wikimedia.org/w/api.php",
        {
          params: {
            action: "query",
            format: "json",
            list: "random",
            rnnamespace: 6,
            rnlimit: 19,
          },
        }
      );

      const imgs = imageRes.data.query.random
        .map((i) => i.title)
        .filter((t) => t !== videoTitle);

      const mediaItems = await Promise.all(
        imgs.map((t) =>
          getData({
            title: t,
            lang,
            baseUrl: "https://commons.wikimedia.org",
            metricsUrl:
              "https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/commons.wikimedia/all-access/all-agents",
            source: "media",
          })
        )
      );

      const filtered = mediaItems.filter((i) => i !== null);
      if (videoData) {
        const index = Math.floor(Math.random() * (filtered.length + 1));
        filtered.splice(index, 0, videoData);
      }

      return filtered;
    },
    noDataError: "No valid media found",
  },
  {
    path: "/api/memez",
    total: 5,
    source: "memez",
    customFetchFn: async (req) => {
      const lang = req.query.lang || "en";
      return await Promise.all(
        Array.from({ length: 5 }).map(() =>
          getData({
            source: "memez",
            baseUrl: "https://knowyourmeme.com",
            lang,
            metricsUrl: "",
          })
        )
      );
    },
    noDataError: "No valid memes found",
  },
  {
    path: "/api/rational",
    total: 5,
    source: "rational",
    customFetchFn: async (req) => {
      return await Promise.all(
        Array.from({ length: 5 }).map(() =>
          getData({
            source: "rational",
            baseUrl: "https://rationalwiki.org",
            apiPath: "/wiki/Special:Random",
            metricsUrl: "https://rationalwiki.org",
          })
        )
      );
    },
    noDataError: "No valid RationalWiki articles found",
  },
  {
    path: "/api/sigma",
    total: 5,
    source: "meta",
    customFetchFn: async (req) => {
      const allowedLangs = [
        "cs",
        "da",
        "de",
        "el",
        "en",
        "es",
        "et",
        "fr",
        "hr",
        "is",
        "mk",
        "nl",
        "no",
        "pt",
        "ro",
        "sk",
        "sv",
      ];
      const lang = allowedLangs.includes(req.query.lang)
        ? req.query.lang
        : undefined;

      return await Promise.all(
        Array.from({ length: 5 }).map(() =>
          getData({
            source: "meta",
            baseUrl: `https://${lang}.metapedia.org`,
            apiPath: "/wiki/Special:Random",
            lang: lang,
            metricsUrl: "",
          })
        )
      );
    },
    noDataError: "No valid metapedia articles found",
  },
  {
    path: "/api/micronations",
    total: 5,
    customFetchFn: async (req) => {
      const lang = req.query.lang || "en";
      return await Promise.all(
        Array.from({ length: 5 }).map(() =>
          getData({
            source: "micronations",
            baseUrl: "https://micronations.wiki",
            lang,
            metricsUrl: "",
            apiPath: "/wiki/Special:Random",
          })
        )
      );
    },
    noDataError: "No valid micronations articles found",
  },
  {
    path: "/api/everybodywiki",
    total: 10,
    source: "everybodywiki",
    baseUrl: "https://en.everybodywiki.com",
    apiPath: "/api.php",
    metricsUrl: "",
    noDataError: "No valid everybodywiki articles found",
  },
  {
    path: "/api/illogic",
    total: 10,
    customFetchFn: async (req) => {
      const lang = req.query.lang || "en";
      return await Promise.all(
        Array.from({ length: 10 }).map(() =>
          getData({
            source: "illogic",
            baseUrl: `https://${lang}.illogicopedia.org`,
            lang: lang,
            metricsUrl: "",
            apiPath: "/wiki/Special:Random",
          })
        )
      );
    },
    noDataError: "No valid Illogicopedia articles found",
  },
  {
    path: "/api/uncyclo",
    total: 10,
    customFetchFn: async (req) => {
      const lang = req.query.lang || "en";
      return await Promise.all(
        Array.from({ length: 10 }).map(() =>
          getData({
            source: "uncyclo",
            baseUrl: `https://${lang}.uncyclopedia.co`,
            lang: lang,
            metricsUrl: "",
            apiPath: "/wiki/Special:RandomRootpage/Main",
          })
        )
      );
    },
    noDataError: "No valid Uncyclopedia articles found",
  },
  {
    path: "/api/unop",
    total: 10,
    customFetchFn: async (req) => {
      return await Promise.all(
        Array.from({ length: 10 }).map(() =>
          getData({
            source: "unop",
            baseUrl: `https://www.unop-chronicles.com`,
            metricsUrl: "",
            apiPath: "/Special:Random",
          })
        )
      );
    },
    noDataError: "No valid UNOP articles found",
  },
  {
    path: "/api/trump",
    total: 10,
    customFetchFn: async (req) => {
      return await Promise.all(
        Array.from({ length: 10 }).map(() =>
          getData({
            source: "trump",
            baseUrl: `https://www.conservapedia.com`,
            metricsUrl: "",
            apiPath: "/Special:Random/#/random",
          })
        )
      );
    },
    noDataError: "No valid UNOP articles found",
  },
  {
    path: "/api/xxx",
    total: 10,
    customFetchFn: async (req) => {
      return await Promise.all(
        Array.from({ length: 10 }).map(() =>
          getData({
            source: "xxx",
            baseUrl: `https://en.pornopedia.com`,
            metricsUrl: "",
            apiPath: "/wiki/Special:Random",
          })
        )
      );
    },
    noDataError: "No valid Pornopedia articles found",
  },
  {
    path: "/api/scp",
    total: 10,
    customFetchFn: async (req) => {
      const allowedLangs = [
        "zh",
        "cs",
        "de",
        "es",
        "fr",
        "it",
        "ja",
        "ko",
        "pl",
        "pt",
        "ru",
        "th",
        "uk",
        "vi",
      ];
      const lang = allowedLangs.includes(req.query.lang)
        ? req.query.lang
        : undefined;

      return await Promise.all(
        Array.from({ length: 10 }).map(() =>
          getData({
            source: "scp",
            baseUrl: `https://scp-wiki${lang ? `-${lang}` : ""}.wikidot.com`,
            lang: lang,
            metricsUrl: "",
            apiPath: "/random:random-scp",
          })
        )
      );
    },
    noDataError: "No valid SCP Foundation articles found",
  },
  {
    path: "/api/incel",
    total: 10,
    customFetchFn: async (req) => {
      return await Promise.all(
        Array.from({ length: 10 }).map(() =>
          getData({
            source: "incel",
            baseUrl: "https://incels.wiki",
            metricsUrl: "",
            apiPath: "/w/Special:Random",
          })
        )
      );
    },
    noDataError: "No valid incel articles found",
  },
  {
    path: "/api/polandball",
    total: 10,
    source: "polandball",
    customFetchFn: async (req) => {
      return await Promise.all(
        Array.from({ length: 10 }).map(() =>
          getData({
            source: "polandball",
            baseUrl: "https://www.polandballwiki.com",
            metricsUrl: "",
            apiPath: "/wiki/Special:Random",
          })
        )
      );
    },
    noDataError: "No polandballs :(",
  },
  {
    path: "/api/polcompball",
    total: 10,
    source: "polcompball",
    customFetchFn: async (req) => {
      return await Promise.all(
        Array.from({ length: 10 }).map(() =>
          getData({
            source: "polcompball",
            baseUrl: "https://polcompball.wikitide.org",
            metricsUrl: "",
            apiPath: "/wiki/Special:Random",
          })
        )
      );
    },
    noDataError: "No polcompass balls :(",
  },
  {
    path: "/api/balls",
    total: 10,
    source: "hetero-balls",
    customFetchFn: async (req) => {
      return await Promise.all(
        Array.from({ length: 10 }).map(() =>
          getData({
            source: "micronations",
            baseUrl: "https://heterodontosaurus-balls.com",
            metricsUrl: "",
            apiPath: "/index.php/Special:Random",
          })
        )
      );
    },
    noDataError: "No dino balls :(",
  },
  {
    path: "/api/fandom",
    total: 10,
    source: "fandom",
    customFetchFn: async (req) => {
      const userFandom = req.query.fandom;

      return await Promise.all(
        Array.from({ length: 10 }).map(() =>
          getData({
            source: "fandom",
            baseUrl: `https:/${userFandom}.fandom.com`,
            metricsUrl: "",
            apiPath: "/wiki/Special:Random",
          })
        )
      );
    },
    noDataError: "No valid Fandom articles found",
  },
  {
    path: "/api/articles",
    total: 10,
    customFetchFn: async (req) => {
      let lang = "en";
      if (req.query.lang) {
        const langQuery = req.query.lang;
        let langs = [];

        if (typeof langQuery === "string") {
          langs = langQuery.split(",");
        } else if (Array.isArray(langQuery)) {
          langs = langQuery;
        }

        if (langs.includes("simple")) {
          lang = "simple";
        } else {
          lang = langs[0];
        }
      }

      const response = await axios.get(
        `https://${lang}.wikipedia.org/w/api.php`,
        {
          params: {
            action: "query",
            format: "json",
            list: "random",
            rnnamespace: 0,
            rnlimit: 10,
          },
        }
      );

      const titles = response.data.query?.random.map((i) => i.title) || [];

      return await Promise.all(
        titles.map((title) =>
          getData({
            title,
            lang,
            baseUrl: `https://${lang}.wikipedia.org`,
            metricsUrl: `https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/${lang}.wikipedia/all-access/all-agents`,
            source: "articles",
          })
        )
      );
    },
    noDataError: "No valid Wikipedia articles found",
  },
  {
    path: "/api/wikipedia_unusual",
    total: 10,
    customFetchFn: async (req) => {
      const lang = req.query.lang === "simple" ? "simple" : "en";
      return await fetchUnusualWikiArticles(
        `https://${lang}.wikipedia.org/wiki/Wikipedia:Unusual_articles`,
        10,
        `https://${lang}.wikipedia.org`,
        `https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/${lang}.wikipedia/all-access/all-agents`
      );
    },
    noDataError: "No unusual Wikipedia articles found",
  },
  {
    path: "/api/wikipedia_unusual_places",
    total: 10,
    customFetchFn: async (req) => {
      const lang = req.query.lang === "simple" ? "simple" : "en";
      return await fetchUnusualWikiArticles(
        `https://${lang}.wikipedia.org/wiki/Wikipedia:Unusual_place_names`,
        10,
        `https://${lang}.wikipedia.org`,
        `https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/${lang}.wikipedia/all-access/all-agents`
      );
    },
    noDataError: "No unusual place names found",
  },
];
