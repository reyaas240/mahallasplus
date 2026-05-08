import { head } from "@vercel/blob";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const { searchParams } = new URL(request.url);
  const fileUrl = searchParams.get("url");

  if (!fileUrl) {
    return new NextResponse("Missing file URL", { status: 400 });
  }

  // 1. Security Check
  // Allow certain paths to be public (logos, committee images)
  const isPublicPath = fileUrl.includes("/committees/") || fileUrl.includes("/logo/");
  
  if (!isPublicPath) {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
  }
  try {
    // Fetch the file from Vercel Blob using the secret token
    const response = await fetch(fileUrl, {
      headers: {
        Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
      },
    });
    
    if (!response.ok) {
      console.error("Blob fetch failed:", response.status, response.statusText);
      return new NextResponse(`Failed to fetch file: ${response.statusText}`, { status: response.status });
    }

    const blob = await response.blob();
    const headers = new Headers();
    headers.set("Content-Type", blob.type);
    headers.set("Cache-Control", "public, max-age=3600"); // Cache for 1 hour

    return new NextResponse(blob, {
      status: 200,
      statusText: "OK",
      headers,
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
