/**
 * Simple pass-through utility. 
 * Resizing and HEIC conversion are now handled robustly on the server using Sharp.
 */
export async function resizeImage(file: File, maxSizeMB: number = 1): Promise<File> {
  return file;
}
