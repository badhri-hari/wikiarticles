import axios from "axios";

export default async function fetchRandomTitles(baseUrl, apiPath, limit) {
  const url = `${baseUrl}${apiPath}`;
  const response = await axios.get(url, {
    params: {
      action: "query",
      format: "json",
      list: "random",
      rnnamespace: 0,
      rnlimit: limit,
    },
  });

  return response.data.query?.random.map((i) => i.title) || [];
}
