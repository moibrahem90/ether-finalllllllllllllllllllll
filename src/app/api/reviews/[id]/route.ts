import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

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
    if (!fs.existsSync(DATA_FILE)) return { googleReviewUrl: "", reviews: [] };
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8")) as ReviewsStore;
  } catch {
    return { googleReviewUrl: "", reviews: [] };
  }
}

function writeStore(store: ReviewsStore): void {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2));
}

// DELETE /api/reviews/[id]
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const store = readStore();
    const review = store.reviews.find((r) => r.id === id);
    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    // Remove local file if it was uploaded
    if (review.isLocal && review.imageUrl.startsWith("/reviews/")) {
      const filePath = path.join(UPLOAD_DIR, path.basename(review.imageUrl));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    store.reviews = store.reviews.filter((r) => r.id !== id);
    writeStore(store);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
