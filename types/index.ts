export interface GalleryImage {
  id: string;
  filename: string;
  originalName: string;
  title: string;
  description: string;
  artist: string;
  year: string;
  category: string;
  uploadedAt: string;
  width?: number;
  height?: number;
  size: number;
}

export type Category = "전체" | "풍경" | "인물" | "추상" | "건축" | "자연" | "도시" | "기타";

export const CATEGORIES: Category[] = ["전체", "풍경", "인물", "추상", "건축", "자연", "도시", "기타"];
