import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function saveFile(file: File, folder: string) {
  if (!file || file.size === 0) return null;
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const filename = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
  const relativePath = `/uploads/${folder}/${filename}`;
  const absolutePath = path.join(process.cwd(), "public", relativePath);
  
  // Ensure directory exists
  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, buffer);
  return relativePath;
}
