import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

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
    if (!fs.existsSync(DATA_FILE)) {
      fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
      fs.writeFileSync(DATA_FILE, JSON.stringify({ categories: [] }, null, 2));
      return [];
    }
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

// GET /api/categories-meta
export async function GET() {
  const categories = readMeta();
  return NextResponse.json({ categories });
}

// POST /api/categories-meta — upsert metadata for a category
export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";
    let categoryId: string;
    let subtitle: string = "";
    let imageUrl: string = "";
    let isLocal = false;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      categoryId = formData.get("id") as string;
      subtitle = (formData.get("subtitle") as string) ?? "";
      const file = formData.get("image") as File | null;
      const urlInput = (formData.get("imageUrl") as string) ?? "";

      if (!categoryId) {
        return NextResponse.json({ error: "id is required" }, { status: 400 });
      }

      if (file) {
        fs.mkdirSync(UPLOAD_DIR, { recursive: true });
        const ext = file.name.split(".").pop() ?? "jpg";
        const fileName = `${randomUUID()}.${ext}`;
        const filePath = path.join(UPLOAD_DIR, fileName);
        const buf = await file.arrayBuffer();
        fs.writeFileSync(filePath, Buffer.from(buf));
        imageUrl = `/categories/${fileName}`;
        isLocal = true;
      } else if (urlInput) {
        imageUrl = urlInput;
        isLocal = false;
      }
    } else {
      const body = await request.json();
      categoryId = body.id;
      subtitle = body.subtitle ?? "";
      imageUrl = body.imageUrl ?? "";
      isLocal = false;
      if (!categoryId) {
        return NextResponse.json({ error: "id is required" }, { status: 400 });
      }
    }

    const categories = readMeta();
    const existing = categories.find((c) => c.id === categoryId);

    if (existing) {
      existing.subtitle = subtitle;
      if (imageUrl) existing.imageUrl = imageUrl;
      existing.isLocal = isLocal;
      existing.updatedAt = new Date().toISOString();
    } else {
      categories.push({
        id: categoryId,
        subtitle,
        imageUrl,
        isLocal,
        updatedAt: new Date().toISOString(),
      });
    }

    writeMeta(categories);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
