import axios from "axios";

export default async function fetchTOC(baseUrl, title) {
  try {
    const { data } = await axios.get(`${baseUrl}/w/api.php`, {
      params: {
        action: "parse",
        page: title,
        prop: "sections",
        format: "json",
      },
    });
    return data?.parse?.sections || [];
  } catch {
    return [];
  }
}
