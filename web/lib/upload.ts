import { put } from "@vercel/blob";
import fs from "fs";
import path from "path";

export async function smartUpload(fileOrBuffer: File | Buffer, folder: string, filenameOverride?: string): Promise<string> {
  const isBuffer = Buffer.isBuffer(fileOrBuffer);
  const filename = filenameOverride || `${Date.now()}-${isBuffer ? 'file.jpg' : (fileOrBuffer as File).name.replace(/\s+/g, '-')}`;

  // 1. If running on Vercel (Production)
  if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
    const blob = await put(`${folder}/${filename}`, fileOrBuffer, {
      access: 'private',
    });
    return blob.url;
  }

  // 2. Fallback for Localhost
  const buffer = isBuffer ? fileOrBuffer : Buffer.from(await (fileOrBuffer as File).arrayBuffer());
  const uploadDir = path.join(process.cwd(), "public", "uploads", folder);

  // Ensure directory exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const filePath = path.join(uploadDir, filename);
  fs.writeFileSync(filePath, buffer);

  return `/uploads/${folder}/${filename}`;
}
