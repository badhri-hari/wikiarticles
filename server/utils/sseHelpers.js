// If you do not have a locally running redis instance:
// Comment out imports and lines 34-47 in dev environments (and in line 49, replace 'uniqueItems' with 'items')

import Redis from "ioredis";
const redis = new Redis(process.env.REDIS_URL);

const sendSSEMessage = (res, msg) =>
  res.write(`data: ${JSON.stringify(msg)}\n\n`);

const finishSSE = (res, msg = { done: true }) => {
  sendSSEMessage(res, msg);
  res.end();
};

export async function processSSE(
  req,
  res,
  total,
  fetchFn,
  noDataError,
  mapFn = (item) => ({ article: item })
) {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  sendSSEMessage(res, { total });

  try {
    let items = (await fetchFn()).filter((i) => i !== null);
    const uniqueItems = [];

    for (const item of items) {
      const title = item?.title?.trim().toLowerCase();
      if (!title) continue;

      const redisKey = `seenTitle:${title}`;
      const alreadySeen = await redis.exists(redisKey);
      if (alreadySeen) continue;

      await redis.set(redisKey, 1, "EX", 60 * 60 * 48);
      uniqueItems.push(item);
    }

    if (!uniqueItems.length) {
      console.log("[sseHelpers]", noDataError);
      return finishSSE(res, { error: noDataError });
    }

    uniqueItems.forEach((item) => sendSSEMessage(res, mapFn(item)));
    finishSSE(res);
  } catch (e) {
    console.error("[sseHelpers] Error during fetchFn execution:", e.message);
    finishSSE(res, { error: noDataError });
  }
}
