import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

const DATA_FILE = path.join(process.cwd(), "data", "reviews.json");
const UPLOAD_DIR = path.join(process.cwd(), "public", "reviews");

interface ReviewRecord {
  id: string;
  imageUrl: string;
  isLocal: boolean;
  createdAt: string;
}

interface ReviewsStore {
  googleReviewUrl: string;
  reviews: ReviewRecord[];
}

function readStore(): ReviewsStore {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
      const initial: ReviewsStore = { googleReviewUrl: "", reviews: [] };
      fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2));
      return initial;
    }
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8")) as ReviewsStore;
  } catch {
    return { googleReviewUrl: "", reviews: [] };
  }
}

function writeStore(store: ReviewsStore): void {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2));
}

// GET /api/reviews
export async function GET() {
  const store = readStore();
  return NextResponse.json(store);
}

// POST /api/reviews — add a review (image URL or file upload)
export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("image") as File | null;
      if (!file) {
        return NextResponse.json({ error: "image file is required" }, { status: 400 });
      }
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
      const ext = file.name.split(".").pop() ?? "jpg";
      const fileName = `${randomUUID()}.${ext}`;
      const filePath = path.join(UPLOAD_DIR, fileName);
      const arrayBuffer = await file.arrayBuffer();
      fs.writeFileSync(filePath, Buffer.from(arrayBuffer));

      const store = readStore();
      const record: ReviewRecord = {
        id: randomUUID(),
        imageUrl: `/reviews/${fileName}`,
        isLocal: true,
        createdAt: new Date().toISOString(),
      };
      store.reviews.push(record);
      writeStore(store);
      return NextResponse.json({ review: record }, { status: 201 });
    }

    // URL-based
    const body = await request.json();
    if (!body.imageUrl) {
      return NextResponse.json({ error: "imageUrl is required" }, { status: 400 });
    }
    const store = readStore();
    const record: ReviewRecord = {
      id: randomUUID(),
      imageUrl: body.imageUrl,
      isLocal: false,
      createdAt: new Date().toISOString(),
    };
    store.reviews.push(record);
    writeStore(store);
    return NextResponse.json({ review: record }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PATCH /api/reviews — update Google Review URL
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    if (typeof body.googleReviewUrl !== "string") {
      return NextResponse.json({ error: "googleReviewUrl is required" }, { status: 400 });
    }
    const store = readStore();
    store.googleReviewUrl = body.googleReviewUrl;
    writeStore(store);
    return NextResponse.json({ googleReviewUrl: store.googleReviewUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
