// app/api/videos/route.ts

import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import type { Video } from "@/types/video";

const DATA_FILE = path.join(process.cwd(), "data", "videos.json");

function readVideos(): Video[] {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
      fs.writeFileSync(DATA_FILE, JSON.stringify({ videos: [] }));
    }
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

export async function GET() {
  const videos = readVideos();
  return NextResponse.json({ videos });
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as Partial<Video>;
    const { title, url, description = "", thumbnail = "" } = body;

    if (!title || !url) {
      return NextResponse.json(
        { error: "title and url are required" },
        { status: 400 }
      );
    }

    const videos = readVideos();
    const newVideo: Video = {
      id: randomUUID(),
      title,
      url,
      description,
      thumbnail,
      createdAt: new Date().toISOString(),
    };

    videos.push(newVideo);
    writeVideos(videos);

    return NextResponse.json({ video: newVideo }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}