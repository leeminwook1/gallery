import { NextRequest, NextResponse } from "next/server";
import { deleteImage } from "@/lib/db";
import fs from "fs";
import path from "path";

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const removed = deleteImage(id);
    if (!removed) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    // Delete the file from disk
    const filePath = path.join(process.cwd(), "public", "uploads", removed.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return NextResponse.json({ success: true, id });
  } catch {
    return NextResponse.json({ error: "Failed to delete image" }, { status: 500 });
  }
}
