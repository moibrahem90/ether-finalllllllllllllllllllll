import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "data", "categories-meta.json");
const UPLOAD_DIR = path.join(process.cwd(), "public", "categories");

interface CategoryMeta {
  id: string;
  subtitle: string;
  imageUrl: string;
  isLocal: boolean;
  updatedAt: string;
}

function readMeta(): CategoryMeta[] {
  try {
    if (!fs.existsSync(DATA_FILE)) return [];
    const raw = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
    return (raw.categories ?? []) as CategoryMeta[];
  } catch {
    return [];
  }
}

function writeMeta(categories: CategoryMeta[]): void {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify({ categories }, null, 2));
}

// DELETE /api/categories-meta/[id]
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const categories = readMeta();
    const entry = categories.find((c) => c.id === id);

    if (entry?.isLocal && entry.imageUrl.startsWith("/categories/")) {
      const filePath = path.join(UPLOAD_DIR, path.basename(entry.imageUrl));
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    writeMeta(categories.filter((c) => c.id !== id));
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
