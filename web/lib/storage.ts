import { smartUpload } from "./upload";

export async function saveFile(file: File, folder: string) {
  if (!file || file.size === 0) return null;
  return await smartUpload(file, folder);
}
