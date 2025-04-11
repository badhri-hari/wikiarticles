import axios from "axios";
import { load } from "cheerio";

export default async function fetchLastEditedDate(title, baseUrl, source) {
  if (source === "memez") return null;

  const tryApiPath = async (path) => {
    try {
      const res = await axios.get(`${baseUrl}${path}`, {
        params: {
          action: "query",
          prop: "revisions",
          titles: title,
          rvprop: "timestamp",
          format: "json",
        },
      });

      const pages = res.data?.query?.pages;
      const page = pages ? Object.values(pages)[0] : null;
      const rawTimestamp = page?.revisions?.[0]?.timestamp;
      return rawTimestamp ? rawTimestamp.split("T")[0] : null;
    } catch (err) {
      return null;
    }
  };

  const fromWApi = await tryApiPath("/w/api.php");
  if (fromWApi) return fromWApi;

  const fromRootApi = await tryApiPath("/api.php");
  if (fromRootApi) return fromRootApi;

  if (source === "meta") {
    try {
      const historyUrl = `${baseUrl}/m/index.php?title=${encodeURIComponent(
        title
      )}&action=history`;

      const { data: html } = await axios.get(historyUrl);
      const $ = load(html);
      const firstTimestamp = $("#pagehistory li a.mw-changeslist-date")
        .first()
        .text()
        .trim();
      if (firstTimestamp) {
        const parts = firstTimestamp.split(",")[1]?.trim().split(" ") || [];
        const [day, monthName, year] = parts;
        const monthIndex = [
          "",
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ].indexOf(monthName);
        if (monthIndex > 0) {
          const paddedMonth = monthIndex.toString().padStart(2, "0");
          const paddedDay = day.padStart(2, "0");
          return `${year}-${paddedMonth}-${paddedDay}`;
        }
      }
    } catch (err) {
      console.warn(
        `[fetchLastEditedDate] Failed to scrape history for "${title}": ${err.message}`
      );
    }
  }

  console.warn(
    `[fetchLastEditedDate] Failed to get timestamp for "${title}" on ${baseUrl}`
  );
  return null;
}
