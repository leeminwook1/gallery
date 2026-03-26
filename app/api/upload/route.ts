import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { addImage } from "@/lib/db";
import { GalleryImage } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "JPG, PNG, GIF, WEBP 형식만 지원합니다" },
        { status: 400 }
      );
    }

    // Validate file size (20MB)
    const MAX_SIZE = 20 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "파일 크기는 20MB 이하여야 합니다" }, { status: 400 });
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const id = uuidv4();
    const filename = `${id}.${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(path.join(uploadDir, filename), buffer);

    const title = (formData.get("title") as string) || file.name.replace(/\.[^/.]+$/, "");
    const description = (formData.get("description") as string) || "";
    const artist = (formData.get("artist") as string) || "작가 미상";
    const year = (formData.get("year") as string) || new Date().getFullYear().toString();
    const category = (formData.get("category") as string) || "기타";

    const image: GalleryImage = {
      id,
      filename,
      originalName: file.name,
      title,
      description,
      artist,
      year,
      category,
      uploadedAt: new Date().toISOString(),
      size: file.size,
    };

    addImage(image);

    return NextResponse.json({ success: true, image });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
