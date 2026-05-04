"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import sharp from "sharp";

export async function uploadInvestigationImages(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session) return { success: false, error: "Unauthorized" };

  const files = formData.getAll("images") as File[];
  const savedPaths: string[] = [];

  try {
    const uploadDir = path.join(process.cwd(), "public", "uploads", "investigations");
    await mkdir(uploadDir, { recursive: true });

    for (const file of files) {
      if (file.size === 0) continue;
      console.log(`Processing file: ${file.name}, type: ${file.type}, size: ${file.size}`);
      
      try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        // Clean filename (always convert to .jpg for web compatibility)
        const filename = `${Date.now()}-${file.name.replace(/\.[^/.]+$/, "").replace(/\s+/g, "-")}.jpg`;
        const relativePath = `/uploads/investigations/${filename}`;
        const absolutePath = path.join(process.cwd(), "public", relativePath);

        // Use SHARP to process image (Resize, Convert to JPEG, Compress)
        await sharp(buffer)
          .rotate() // Auto-rotate based on EXIF
          .resize(1600, 1600, { fit: "inside", withoutEnlargement: true })
          .jpeg({ quality: 80, progressive: true })
          .toFile(absolutePath);

        console.log(`Successfully processed and saved: ${relativePath}`);
        savedPaths.push(relativePath);
      } catch (sharpError: any) {
        console.error(`Sharp processing failed for ${file.name}:`, sharpError.message);
        // If sharp fails, we skip this file but continue with others
      }
    }

    return { success: true, paths: savedPaths };
  } catch (e: any) {
    console.error("Server-side Upload/Processing error:", e.message);
    return { success: false, error: "Failed to process and upload images" };
  }
}
