"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useRef } from 'react';
import {
  Video,
  Plus,
  Search,
  Trash2,
  X,
  Loader2,
  Film,
  Upload,
  Link as LinkIcon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// ── Types ────────────────────────────────────────────────────────────────────

interface VideoItem {
  id: string;
  title: string;
  url: string;
  description?: string;
  thumbnail?: string;
  createdAt: string;
}

// ── Zod Schema ────────────────────────────────────────────────────────────────

const videoSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  url: z.string().optional().default(''),
  description: z.string().optional().default(''),
  thumbnail: z.string().url('Must be a valid URL').or(z.literal('')).optional().default(''),
});

type VideoForm = z.infer<typeof videoSchema>;

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function VideosPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadMode, setUploadMode] = useState<'url' | 'file'>('url');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const { data: videos, isLoading: videosLoading } = useQuery<VideoItem[]>({
    queryKey: ['admin-videos'],
    queryFn: async () => {
      const res = await fetch('/api/videos');
      if (!res.ok) throw new Error('Failed to fetch videos');
      const json = await res.json();
      return json.videos ?? [];
    },
  });

  // ── Add Mutation ───────────────────────────────────────────────────────────

  const addMutation = useMutation({
    mutationFn: async (data: VideoForm) => {
      // If a local file is selected, upload via FormData (multipart)
      if (uploadMode === 'file' && selectedFile) {
        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('description', data.description ?? '');
        formData.append('thumbnail', data.thumbnail ?? '');
        formData.append('video', selectedFile);
        const res = await fetch('/api/videos', { method: 'POST', body: formData });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error ?? 'Failed to upload video');
        }
        return res.json();
      }

      // Otherwise use JSON with URL
      if (!data.url) throw new Error('Video URL is required');
      const res = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? 'Failed to add video');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-videos'] });
      closeModal();
    },
  });

  // ── Delete Mutation ────────────────────────────────────────────────────────

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/videos/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete video');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-videos'] });
    },
  });

  // ── Form ───────────────────────────────────────────────────────────────────

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(videoSchema),
    defaultValues: { title: '', url: '', description: '', thumbnail: '' },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      alert('Please select a valid video file (mp4, webm, mov, etc.)');
      return;
    }
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setFilePreviewUrl(objectUrl);
  };

  const removeFile = () => {
    if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
    setSelectedFile(null);
    setFilePreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const onSubmit = (data: any) => {
    if (uploadMode === 'file' && !selectedFile) {
      alert('Please select a video file to upload.');
      return;
    }
    if (uploadMode === 'url' && !data.url) {
      alert('Please enter a video URL.');
      return;
    }
    addMutation.mutate(data);
  };

  const openModal = () => setIsModalOpen(true);

  const closeModal = () => {
    setIsModalOpen(false);
    reset();
    addMutation.reset();
    setUploadMode('url');
    removeFile();
  };

  // ── Filter ─────────────────────────────────────────────────────────────────

  const filteredVideos = videos?.filter((v) =>
    v.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="font-serif text-4xl text-stone-800 mb-2">
            Video <span className="gold-gradient-text">Gallery</span>
          </h1>
          <p className="text-stone-500 text-sm">
            Manage the videos displayed in the homepage slider.
          </p>
        </div>
        <button
          onClick={openModal}
          className="bg-stone-900 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-stone-800 transition-all shadow-lg shadow-stone-200 flex items-center gap-2"
        >
          <Plus size={18} />
          Add New Video
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-[2rem] border border-stone-100 shadow-sm p-6 flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
          <input
            type="text"
            placeholder="Search videos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-stone-50 border-transparent focus:bg-white focus:border-[#d4a84b] rounded-2xl py-3 pl-12 pr-4 text-sm transition-all outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[2.5rem] border border-white shadow-[0_20px_60px_rgba(0,0,0,0.02)] overflow-hidden">
        {videosLoading ? (
          <div className="flex items-center justify-center py-40">
            <Loader2 className="animate-spin text-[#d4a84b]" size={40} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-stone-50">
                  <th className="px-8 py-6 text-xs font-bold uppercase tracking-widest text-stone-400">Video</th>
                  <th className="px-8 py-6 text-xs font-bold uppercase tracking-widest text-stone-400">Title</th>
                  <th className="px-8 py-6 text-xs font-bold uppercase tracking-widest text-stone-400">Description</th>
                  <th className="px-8 py-6 text-xs font-bold uppercase tracking-widest text-stone-400">Added</th>
                  <th className="px-8 py-6 text-xs font-bold uppercase tracking-widest text-stone-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {filteredVideos?.map((video) => (
                  <tr key={video.id} className="group hover:bg-stone-50/50 transition-colors">

                    {/* Thumbnail */}
                    <td className="px-8 py-6">
                      <div className="w-24 h-14 rounded-xl bg-stone-50 overflow-hidden border border-stone-100 flex-shrink-0 flex items-center justify-center">
                        {video.thumbnail ? (
                          <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                        ) : (
                          <video src={video.url} className="w-full h-full object-cover" muted preload="metadata" />
                        )}
                      </div>
                    </td>

                    {/* Title + ID */}
                    <td className="px-8 py-6">
                      <p className="font-semibold text-stone-800">{video.title}</p>
                      <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold mt-0.5">
                        ID: {video.id.slice(-6).toUpperCase()}
                      </p>
                    </td>

                    {/* Description */}
                    <td className="px-8 py-6 text-sm text-stone-500 max-w-xs">
                      <span className="line-clamp-2">
                        {video.description || <span className="italic text-stone-300">No description</span>}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-8 py-6 text-sm text-stone-500">
                      {formatDate(video.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="px-8 py-6 text-right">
                      <button
                        onClick={() => { if (confirm('Delete this video?')) deleteMutation.mutate(video.id); }}
                        disabled={deleteMutation.isPending}
                        className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        {deleteMutation.isPending ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <Trash2 size={18} />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Empty State */}
            {(!filteredVideos || filteredVideos.length === 0) && (
              <div className="py-40 text-center">
                <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Film size={32} className="text-stone-200" />
                </div>
                <h3 className="font-serif text-xl text-stone-800 mb-2">No videos found</h3>
                <p className="text-stone-400 text-sm">
                  {searchTerm ? 'Try a different search term.' : 'Add your first video using the button above.'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Add Video Modal ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-8 border-b border-stone-50 flex items-center justify-between flex-shrink-0">
                <div>
                  <h2 className="font-serif text-2xl text-stone-800">Add New Video</h2>
                  <p className="text-xs text-stone-400 uppercase tracking-widest font-bold mt-1">
                    Video Gallery Management
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center text-stone-400 hover:text-stone-800 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <form id="video-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                  {/* Title */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">
                      Title <span className="text-red-400">*</span>
                    </label>
                    <input
                      {...register('title')}
                      className="w-full bg-stone-50 border border-stone-100 rounded-2xl py-3 px-4 text-sm focus:bg-white focus:border-[#d4a84b] outline-none transition-all"
                      placeholder="e.g. Lavender Ritual"
                    />
                    {errors.title && (
                      <p className="text-red-500 text-xs mt-1">{String(errors.title.message)}</p>
                    )}
                  </div>

                  {/* Upload Mode Toggle */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-3">
                      Video Source <span className="text-red-400">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3 p-1 bg-stone-50 rounded-2xl">
                      <button
                        type="button"
                        onClick={() => { setUploadMode('url'); removeFile(); }}
                        className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${
                          uploadMode === 'url'
                            ? 'bg-white text-stone-800 shadow-sm'
                            : 'text-stone-400 hover:text-stone-600'
                        }`}
                      >
                        <LinkIcon size={16} />
                        Video URL
                      </button>
                      <button
                        type="button"
                        onClick={() => setUploadMode('file')}
                        className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${
                          uploadMode === 'file'
                            ? 'bg-white text-stone-800 shadow-sm'
                            : 'text-stone-400 hover:text-stone-600'
                        }`}
                      >
                        <Upload size={16} />
                        Upload File
                      </button>
                    </div>
                  </div>

                  {/* URL Input */}
                  <AnimatePresence mode="wait">
                    {uploadMode === 'url' ? (
                      <motion.div
                        key="url"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.15 }}
                      >
                        <div className="relative">
                          <Video className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={16} />
                          <input
                            {...register('url')}
                            type="url"
                            className="w-full bg-stone-50 border border-stone-100 rounded-2xl py-3 pl-10 pr-4 text-sm focus:bg-white focus:border-[#d4a84b] outline-none transition-all"
                            placeholder="https://example.com/video.mp4"
                          />
                        </div>
                        <p className="text-[11px] text-stone-400 mt-1.5 ml-1">
                          Direct link to an mp4 or webm file
                        </p>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="file"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.15 }}
                      >
                        {!selectedFile ? (
                          <div
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full aspect-video bg-stone-50 border-2 border-dashed border-stone-100 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:bg-stone-100/50 hover:border-[#d4a84b]/40 transition-all group"
                          >
                            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-stone-300 shadow-sm mb-4 group-hover:scale-110 group-hover:text-[#d4a84b] transition-all">
                              <Upload size={24} />
                            </div>
                            <p className="text-sm font-semibold text-stone-600">Click to select a video</p>
                            <p className="text-xs text-stone-400 mt-1">MP4, WebM, MOV — max 500 MB</p>
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="video/*"
                              className="hidden"
                              onChange={handleFileChange}
                            />
                          </div>
                        ) : (
                          <div className="relative rounded-[2rem] overflow-hidden border border-stone-100 bg-stone-900">
                            <video
                              src={filePreviewUrl ?? undefined}
                              controls
                              className="w-full aspect-video object-contain"
                            />
                            <div className="absolute top-3 right-3">
                              <button
                                type="button"
                                onClick={removeFile}
                                className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                              >
                                <X size={16} />
                              </button>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                              <p className="text-white text-xs font-semibold truncate">{selectedFile.name}</p>
                              <p className="text-white/60 text-[10px] uppercase tracking-widest mt-0.5">
                                {formatFileSize(selectedFile.size)}
                              </p>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Thumbnail URL */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">
                      Thumbnail URL <span className="text-stone-300 font-normal">(optional)</span>
                    </label>
                    <input
                      {...register('thumbnail')}
                      type="url"
                      className="w-full bg-stone-50 border border-stone-100 rounded-2xl py-3 px-4 text-sm focus:bg-white focus:border-[#d4a84b] outline-none transition-all"
                      placeholder="https://example.com/poster.jpg"
                    />
                    {errors.thumbnail && (
                      <p className="text-red-500 text-xs mt-1">{String(errors.thumbnail.message)}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">
                      Description <span className="text-stone-300 font-normal">(optional)</span>
                    </label>
                    <textarea
                      {...register('description')}
                      rows={3}
                      className="w-full bg-stone-50 border border-stone-100 rounded-2xl py-3 px-4 text-sm focus:bg-white focus:border-[#d4a84b] outline-none transition-all resize-none"
                      placeholder="Short caption shown on the video slide..."
                    />
                  </div>

                  {/* Error banner */}
                  {addMutation.isError && (
                    <div className="text-red-500 text-sm font-medium bg-red-50 p-4 rounded-xl border border-red-100">
                      {(addMutation.error as Error).message || 'An error occurred. Please try again.'}
                    </div>
                  )}
                </form>
              </div>

              {/* Modal Footer */}
              <div className="p-8 border-t border-stone-50 bg-stone-50/50 flex items-center justify-end gap-4 flex-shrink-0">
                <button
                  onClick={closeModal}
                  className="px-6 py-3 text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="video-form"
                  disabled={addMutation.isPending}
                  className="bg-stone-900 text-white px-10 py-3 rounded-xl text-sm font-semibold hover:bg-stone-800 disabled:bg-stone-300 transition-all shadow-xl shadow-stone-200 flex items-center gap-2"
                >
                  {addMutation.isPending ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      {uploadMode === 'file' ? 'Uploading…' : 'Adding…'}
                    </>
                  ) : (
                    uploadMode === 'file' ? 'Upload Video' : 'Add Video'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}