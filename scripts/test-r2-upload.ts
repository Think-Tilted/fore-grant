/**
 * Standalone R2 upload test — runs outside Astro with plain Node + tsx.
 * Tests the full Cloudflare R2 upload flow using a simple SVG.
 *
 * Usage:
 *   npx tsx scripts/test-r2-upload.ts
 *
 * Reads credentials from .env in the project root.
 */

import * as dotenv from "dotenv";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const TEST_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100" viewBox="0 0 200 100">
  <rect width="200" height="100" fill="#31532D" rx="8"/>
  <text x="100" y="45" text-anchor="middle" fill="#E4E1C5"
    font-family="Georgia, serif" font-size="18" font-weight="bold">Teeing Off</text>
  <text x="100" y="70" text-anchor="middle" fill="#F05323"
    font-family="Georgia, serif" font-size="14">R2 upload test</text>
</svg>`;

async function run() {
  console.log("\n=== Cloudflare R2 Upload Test ===\n");

  const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
  const accessKey = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
  const secretKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
  const bucket    = process.env.CLOUDFLARE_R2_BUCKET_NAME;
  const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL;

  // Step 0 — confirm env vars
  console.log("[0] env check:");
  console.log("    CLOUDFLARE_R2_ACCOUNT_ID:              ", accountId  ?? "MISSING");
  console.log("    CLOUDFLARE_R2_BUCKET_NAME:             ", bucket     ?? "MISSING");
  console.log("    CLOUDFLARE_R2_PUBLIC_URL:              ", publicUrl  ?? "MISSING");
  console.log("    CLOUDFLARE_R2_ACCESS_KEY_ID:           ", accessKey  ?? "MISSING");
  console.log("    CLOUDFLARE_R2_SECRET_ACCESS_KEY present:", !!secretKey);

  if (!accountId || !accessKey || !secretKey || !bucket || !publicUrl) {
    console.error("\nAborting — one or more required env vars are missing.");
    process.exit(1);
  }

  // Step 1 — create S3 client pointed at R2
  console.log("\n[1] creating S3 client for R2...");
  const client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
    },
  });
  console.log("    client created");

  // Step 2 — upload test SVG
  const key = `test/ForeGrant_TEST_${Date.now()}.svg`;
  console.log("\n[2] uploading to bucket:", bucket);
  console.log("    key:", key);

  const buffer = Buffer.from(TEST_SVG, "utf-8");
  console.log("    buffer size:", buffer.length, "bytes");

  await client.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: "image/svg+xml",
  }));

  console.log("    upload complete");

  // Step 3 — construct public URL
  const fileUrl = `${publicUrl}/${key}`;
  console.log("\n[3] public URL:", fileUrl);

  console.log("\n=== SUCCESS ===");
  console.log("Open this URL in a browser to confirm the file is accessible:");
  console.log(fileUrl);
}

run().catch((err) => {
  console.error("\n=== FAILED ===");
  console.error("message:", err.message);
  if (err.$metadata) {
    console.error("HTTP status:", err.$metadata.httpStatusCode);
  }
  console.error(err);
  process.exit(1);
});
