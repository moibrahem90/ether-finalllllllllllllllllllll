"use client";

import { useState, useEffect } from "react";
import type { Video, VideoFormData } from "@/types/video";

interface UseVideosReturn {
  videos: Video[];
  loading: boolean;
  error: string | null;
  addVideo: (data: VideoFormData) => Promise<void>;
  deleteVideo: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export default function useVideos(): UseVideosReturn {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVideos = async (): Promise<void> => {
    try {
      setLoading(true);
      const res = await fetch("/api/videos");
      if (!res.ok) throw new Error("Failed to fetch videos");
      const data = await res.json();
      setVideos(data.videos ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const addVideo = async (videoData: VideoFormData): Promise<void> => {
    const res = await fetch("/api/videos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(videoData),
    });
    if (!res.ok) throw new Error("Failed to add video");
    await fetchVideos();
  };

  const deleteVideo = async (id: string): Promise<void> => {
    const res = await fetch(`/api/videos/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete video");
    await fetchVideos();
  };

  return { videos, loading, error, addVideo, deleteVideo, refetch: fetchVideos };
}