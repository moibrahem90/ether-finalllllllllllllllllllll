// app/api/videos/[id]/route.ts

import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import type { Video } from "@/types/video";

const DATA_FILE = path.join(process.cwd(), "data", "videos.json");

function readVideos(): Video[] {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    return (JSON.parse(raw) as { videos: Video[] }).videos ?? [];
  } catch {
    return [];
  }
}

function writeVideos(videos: Video[]): void {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify({ videos }, null, 2));
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const videos = readVideos();
  const filtered = videos.filter((v) => v.id !== id);

  if (filtered.length === videos.length) {
    return NextResponse.json({ error: "Video not found" }, { status: 404 });
  }

  writeVideos(filtered);
  return NextResponse.json({ success: true });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json() as Partial<Video>;
    const videos = readVideos();
    const idx = videos.findIndex((v) => v.id === id);

    if (idx === -1) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    videos[idx] = { ...videos[idx], ...body, id };
    writeVideos(videos);

    return NextResponse.json({ video: videos[idx] });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}