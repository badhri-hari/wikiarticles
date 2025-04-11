import axios from "axios";

export default async function fetchPageViews(title, metricsUrl, baseUrl = "") {
  const now = new Date();
  now.setMonth(now.getMonth() - 1);
  const year = now.getFullYear();
  let month = now.getMonth() + 1;
  if (month < 10) month = "0" + month;

  const monthlyEnd = `${year}${month}0100`;

  let viewCount = null;
  try {
    const response = await axios.get(
      `${metricsUrl}/${encodeURIComponent(
        title
      )}/monthly/2015070100/${monthlyEnd}`
    );
    viewCount = response.data.items.reduce((sum, item) => sum + item.views, 0);
  } catch (err) {
    console.error("Error fetching pageviews for", title, err.message);
  }

  let pageViewsLink = null;
  try {
    const base = new URL(baseUrl);
    const projectDomain = base.hostname;
    pageViewsLink = `https://pageviews.wmcloud.org/?project=${projectDomain}&platform=all-access&agent=user&redirects=1&start=earliest&end=latest&pages=${encodeURIComponent(
      title
    )}`;
  } catch (err) {
    console.error("Error constructing pageViewsLink:", err.message);
  }

  return { viewCount, pageViewsLink };
}
