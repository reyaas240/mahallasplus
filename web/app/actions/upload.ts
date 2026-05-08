"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import sharp from "sharp";
import { smartUpload } from "@/lib/upload";

export async function uploadInvestigationImages(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session) return { success: false, error: "Unauthorized" };

  const files = formData.getAll("images") as File[];
  const savedPaths: string[] = [];

  try {
    for (const file of files) {
      if (file.size === 0) continue;
      
      try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        // Clean filename (always convert to .jpg for web compatibility)
        const filename = `${Date.now()}-${file.name.replace(/\.[^/.]+$/, "").replace(/\s+/g, "-")}.jpg`;

        // Use SHARP to process image (Resize, Convert to JPEG, Compress)
        const processedBuffer = await sharp(buffer)
          .rotate() // Auto-rotate based on EXIF
          .resize(1600, 1600, { fit: "inside", withoutEnlargement: true })
          .jpeg({ quality: 80, progressive: true })
          .toBuffer();

        const savedPath = await smartUpload(processedBuffer, "investigations", filename);
        savedPaths.push(savedPath);
      } catch (sharpError: any) {
        console.error(`Sharp processing failed for ${file.name}:`, sharpError.message);
      }
    }

    return { success: true, paths: savedPaths };
  } catch (e: any) {
    console.error("Server-side Upload/Processing error:", e.message);
    return { success: false, error: "Failed to process and upload images" };
  }
}
export async function uploadFundRequestAttachments(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session) return { success: false, error: "Unauthorized" };

  const files = formData.getAll("files") as File[];
  const savedPaths: string[] = [];

  try {
    for (const file of files) {
      if (file.size === 0) continue;
      
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const isImg = file.type.startsWith("image/") || file.name.toLowerCase().endsWith(".heic");
      const filename = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
      let finalPath = "";
      if (isImg) {
        const finalFilename = filename.replace(/\.[^/.]+$/, ".jpg");
        const processedBuffer = await sharp(buffer)
          .rotate()
          .resize(1600, 1600, { fit: "inside", withoutEnlargement: true })
          .jpeg({ quality: 80 })
          .toBuffer();
        finalPath = await smartUpload(processedBuffer, "requests", finalFilename);
      } else {
        finalPath = await smartUpload(file, "requests", filename);
      }
      
      savedPaths.push(finalPath);
    }

    return { success: true, paths: savedPaths };
  } catch (e: any) {
    console.error("Upload error:", e.message);
    return { success: false, error: "Failed to upload attachments" };
  }
}
