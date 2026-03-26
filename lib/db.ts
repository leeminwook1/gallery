import fs from "fs";
import path from "path";
import { GalleryImage } from "@/types";

const DB_PATH = path.join(process.cwd(), "data", "gallery.json");
const DATA_DIR = path.join(process.cwd(), "data");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ images: [] }, null, 2));
  }
}

export function readDB(): { images: GalleryImage[] } {
  ensureDataDir();
  const raw = fs.readFileSync(DB_PATH, "utf-8");
  return JSON.parse(raw);
}

export function writeDB(data: { images: GalleryImage[] }) {
  ensureDataDir();
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

export function getAllImages(): GalleryImage[] {
  const db = readDB();
  return db.images.sort(
    (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  );
}

export function addImage(image: GalleryImage): void {
  const db = readDB();
  db.images.push(image);
  writeDB(db);
}

export function deleteImage(id: string): GalleryImage | null {
  const db = readDB();
  const idx = db.images.findIndex((img) => img.id === id);
  if (idx === -1) return null;
  const [removed] = db.images.splice(idx, 1);
  writeDB(db);
  return removed;
}

export function updateImage(
  id: string,
  fields: Partial<Pick<GalleryImage, "title" | "artist" | "year" | "description" | "category">>
): GalleryImage | null {
  const db = readDB();
  const img = db.images.find((i) => i.id === id);
  if (!img) return null;
  if (fields.title !== undefined) img.title = fields.title;
  if (fields.artist !== undefined) img.artist = fields.artist;
  if (fields.year !== undefined) img.year = fields.year;
  if (fields.description !== undefined) img.description = fields.description;
  if (fields.category !== undefined) img.category = fields.category;
  writeDB(db);
  return img;
}
