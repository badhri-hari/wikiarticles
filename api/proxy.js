export default async function handler(req, res) {
  try {
    const { method, headers } = req;

    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const rawBody = Buffer.concat(chunks);

    const response = await fetch(
      `https://wikiarticles.onrender.com${req.url}`,
      {
        method,
        headers: {
          ...headers,
          "X-APP-SECRET": process.env.APP_SECRET_HEADER,
          host: "wikiarticles.onrender.com",
        },
        body: ["GET", "HEAD"].includes(method) ? undefined : rawBody,
      }
    );

    const contentType = response.headers.get("content-type");
    res.setHeader("content-type", contentType || "application/json");

    res.writeHead(response.status, {
      ...Object.fromEntries(response.headers),
    });

    response.body.pipe(res);
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).json({ error: "Proxy failed" });
  }
}
