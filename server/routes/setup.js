import axios from "axios";
import getData from "../services/getData.js";
import { processSSE } from "../utils/sseHelpers.js";

export default function setupRoutes(app, configs) {
  configs.forEach(
    ({
      path,
      total,
      source,
      baseUrl,
      apiPath,
      metricsUrl,
      langOptional = true,
      customFetchFn,
      noDataError,
      mapFn,
    }) => {
      app.get(path, async (req, res) => {
        const lang = langOptional ? req.query.lang || "en" : req.query.lang;

        return processSSE(
          req,
          res,
          total,
          async () => {
            if (customFetchFn) {
              return await customFetchFn(req, res);
            }

            const resolvedBaseUrl =
              typeof baseUrl === "function" ? baseUrl(lang) : baseUrl;
            const resolvedMetricsUrl =
              typeof metricsUrl === "function" ? metricsUrl(lang) : metricsUrl;
            const url = `${resolvedBaseUrl}${apiPath}`;

            const response = await axios.get(url, {
              params: {
                action: "query",
                format: "json",
                list: "random",
                rnnamespace: 0,
                rnlimit: total,
              },
            });

            const titles =
              response.data.query?.random.map((i) => i.title) || [];

            return await Promise.all(
              titles.map((title) =>
                getData({
                  title,
                  lang,
                  baseUrl: resolvedBaseUrl,
                  metricsUrl: resolvedMetricsUrl,
                  source,
                })
              )
            );
          },
          noDataError || `No valid ${source} articles found`,
          mapFn
        );
      });
    }
  );
}
