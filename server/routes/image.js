import express from "express";
import axios from "axios";
import sharp from "sharp";
import { PassThrough } from "stream";

const imageRouter = express.Router();

const supportedInputFormats = ["jpeg", "png", "webp", "tiff", "avif"];

imageRouter.get("/", async (req, res) => {
  const imageUrl = String(req.query.url).startsWith("//")
    ? `https:${req.query.url}`
    : req.query.url;

  if (!imageUrl) {
    return res.status(400).json({ error: "Image URL is required." });
  }

  try {
    const response = await axios.get(imageUrl, {
      responseType: "arraybuffer",
    });

    const contentType = response.headers["content-type"];
    const format = contentType?.split("/")[1]?.toLowerCase();
    const isSharpSupported = format && supportedInputFormats.includes(format);

    if (isSharpSupported) {
      const inputBuffer = Buffer.from(response.data);
      const outputBuffer = await sharp(inputBuffer)
        .blur(1)
        .webp({ quality: 90 })
        .toBuffer();

      res.setHeader("Content-Type", "image/webp");
      res.setHeader("Content-Length", outputBuffer.length.toString());

      const stream = new PassThrough();
      stream.end(outputBuffer);
      stream.pipe(res);
    } else {
      res.setHeader("Content-Type", contentType || "application/octet-stream");
      const stream = new PassThrough();
      stream.end(Buffer.from(response.data));
      stream.pipe(res);
    }
  } catch (error) {
    console.error("Image stream error:", error.message);
    res.status(500).json({ error: "Could not stream image." });
  }
});

export default imageRouter;
