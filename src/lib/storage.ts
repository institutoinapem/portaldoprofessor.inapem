import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { promises as fs } from "node:fs";
import path from "node:path";

export type StorageProvider = "local" | "s3";

function getProvider(): StorageProvider {
  return (process.env.STORAGE_PROVIDER as StorageProvider | undefined) === "s3" ? "s3" : "local";
}

function getS3Client() {
  return new S3Client({
    region: process.env.S3_REGION || "auto",
    endpoint: process.env.S3_ENDPOINT,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
    },
    forcePathStyle: true,
  });
}

function resolvePublicBaseUrl() {
  return process.env.PUBLIC_BASE_URL || process.env.VITE_SITE_URL || "http://localhost:3000";
}

export async function uploadFileToStorage(fileBuffer: Buffer, fileName: string, baseDir = process.cwd()) {
  const provider = getProvider();

  if (provider === "s3") {
    const client = getS3Client();
    const key = `uploads/${Date.now()}-${fileName.replace(/\s+/g, "-")}`;
    await client.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME || "",
        Key: key,
        Body: fileBuffer,
        ContentType: "application/octet-stream",
      }),
    );

    return {
      url: `${resolvePublicBaseUrl()}/${key}`,
      key,
      provider,
    };
  }

  const uploadsDir = path.resolve(baseDir, "public", "uploads");
  await fs.mkdir(uploadsDir, { recursive: true });

  const safeName = `${Date.now()}-${fileName.replace(/\s+/g, "-")}`;
  const destination = path.join(uploadsDir, safeName);
  await fs.writeFile(destination, fileBuffer);

  return {
    url: `/uploads/${safeName}`,
    key: safeName,
    provider,
  };
}

export async function readFileFromStorage(key: string, baseDir = process.cwd()) {
  const provider = getProvider();

  if (provider === "s3") {
    const client = getS3Client();
    const response = await client.send(
      new GetObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME || "",
        Key: key,
      }),
    );
    return response.Body as Uint8Array;
  }

  const filePath = path.resolve(baseDir, "public", "uploads", key);
  return fs.readFile(filePath);
}
