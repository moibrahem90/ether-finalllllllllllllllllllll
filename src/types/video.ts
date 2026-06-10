export interface Video {
  id: string;
  title: string;
  url: string;
  description?: string;
  thumbnail?: string;
  createdAt: string;
}

export interface VideosResponse {
  videos: Video[];
}

export interface VideoFormData {
  title: string;
  url: string;
  description: string;
  thumbnail: string;
}