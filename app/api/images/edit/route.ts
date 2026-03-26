import { NextRequest, NextResponse } from "next/server";
import { updateImage } from "@/lib/db";

export async function PUT(request: NextRequest) {
  try {
    const { id, title, artist, year, description, category } = await request.json();
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const updated = updateImage(id, { title, artist, year, description, category });
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ success: true, image: updated });
  } catch {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
