"use client";

import { useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Star,
  Plus,
  Trash2,
  Loader2,
  X,
  Link as LinkIcon,
  Upload,
  ExternalLink,
  Save,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ReviewRecord {
  id: string;
  imageUrl: string;
  isLocal: boolean;
  createdAt: string;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [googleReviewUrl, setGoogleReviewUrl] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingUrl, setSavingUrl] = useState(false);
  const [uploadMode, setUploadMode] = useState<"url" | "file">("url");
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch on mount
  useState(() => {
    fetch("/api/reviews")
      .then((r) => r.json())
      .then((data) => {
        setReviews(data.reviews ?? []);
        setGoogleReviewUrl(data.googleReviewUrl ?? "");
        setUrlInput(data.googleReviewUrl ?? "");
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  });

  const refetch = () =>
    fetch("/api/reviews")
      .then((r) => r.json())
      .then((data) => {
        setReviews(data.reviews ?? []);
        setGoogleReviewUrl(data.googleReviewUrl ?? "");
        setUrlInput(data.googleReviewUrl ?? "");
      });

  const saveGoogleUrl = async () => {
    setSavingUrl(true);
    try {
      await fetch("/api/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ googleReviewUrl: urlInput }),
      });
      setGoogleReviewUrl(urlInput);
    } finally {
      setSavingUrl(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setImageUrlInput("");
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setUploadMode("url");
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAdd = async () => {
    setAdding(true);
    setError(null);
    try {
      if (uploadMode === "file" && selectedFile) {
        const fd = new FormData();
        fd.append("image", selectedFile);
        const res = await fetch("/api/reviews", { method: "POST", body: fd });
        if (!res.ok) throw new Error("Upload failed");
      } else if (uploadMode === "url" && imageUrlInput) {
        const res = await fetch("/api/reviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl: imageUrlInput }),
        });
        if (!res.ok) throw new Error("Failed to add review");
      } else {
        setError("Please provide an image URL or upload a file.");
        setAdding(false);
        return;
      }
      await refetch();
      closeModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await fetch(`/api/reviews/${id}`, { method: "DELETE" });
      await refetch();
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-10 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="font-serif text-4xl text-stone-800 mb-2">
            Customer <span className="gold-gradient-text">Reviews</span>
          </h1>
          <p className="text-stone-500 text-sm">
            Manage review images and the Google Review link shown on the home page.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-stone-900 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-stone-800 transition-all shadow-lg shadow-stone-200 flex items-center gap-2"
        >
          <Plus size={18} />
          Add Review Image
        </button>
      </div>

      {/* Google Review URL Card */}
      <div className="bg-white rounded-[2rem] border border-stone-100 shadow-sm p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#f5e6c0]/40 flex items-center justify-center text-[#a07828]">
            <ExternalLink size={20} />
          </div>
          <div>
            <h2 className="font-serif text-xl text-stone-800">Google Review URL</h2>
            <p className="text-xs text-stone-400 mt-0.5">
              This link appears on the home page as "View Our Google Review" button.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://g.page/r/your-google-review-link"
            className="flex-1 bg-stone-50 border border-stone-100 rounded-2xl py-3 px-4 text-sm focus:bg-white focus:border-[#d4a84b] outline-none transition-all"
          />
          <button
            onClick={saveGoogleUrl}
            disabled={savingUrl || urlInput === googleReviewUrl}
            className="bg-stone-900 text-white px-6 py-3 rounded-2xl text-sm font-semibold hover:bg-stone-800 disabled:bg-stone-300 transition-all flex items-center gap-2"
          >
            {savingUrl ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Save
          </button>
        </div>
        {googleReviewUrl && (
          <a
            href={googleReviewUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-xs text-[#a07828] hover:underline mt-3"
          >
            <ExternalLink size={12} /> Preview link
          </a>
        )}
      </div>

      {/* Review Images Grid */}
      <div className="bg-white rounded-[2.5rem] border border-white shadow-[0_20px_60px_rgba(0,0,0,0.02)] p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-serif text-2xl text-stone-800">Review Images</h2>
          <span className="bg-stone-50 text-stone-400 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-stone-100">
            {reviews.length} Total
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="animate-spin text-[#d4a84b]" size={32} />
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-24 text-center">
            <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star size={24} className="text-stone-200" />
            </div>
            <p className="text-stone-400 text-sm italic">No review images yet. Add one above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {reviews.map((review, i) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                  className="group relative rounded-2xl overflow-hidden border border-stone-100 aspect-[4/3] bg-stone-50"
                >
                  <img
                    src={review.imageUrl}
                    alt={`Review ${i + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300" />
                  <button
                    onClick={() => handleDelete(review.id)}
                    disabled={deletingId === review.id}
                    className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur text-stone-600 hover:text-red-600 hover:bg-red-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md"
                    aria-label="Delete review"
                  >
                    {deletingId === review.id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                  {review.isLocal && (
                    <span className="absolute bottom-2 left-2 text-[10px] bg-black/50 text-white/80 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      Local
                    </span>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Add Review Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-stone-50 flex items-center justify-between">
                <h2 className="font-serif text-2xl text-stone-800">Add Review Image</h2>
                <button
                  onClick={closeModal}
                  className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center text-stone-400 hover:text-stone-800 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 space-y-6">
                {/* Mode toggle */}
                <div className="grid grid-cols-2 gap-3 p-1 bg-stone-50 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setUploadMode("url")}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${
                      uploadMode === "url" ? "bg-white text-stone-800 shadow-sm" : "text-stone-400 hover:text-stone-600"
                    }`}
                  >
                    <LinkIcon size={16} /> Image URL
                    <span className="text-[10px] text-emerald-600 font-bold ml-1">(Recommended)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadMode("file")}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${
                      uploadMode === "file" ? "bg-white text-stone-800 shadow-sm" : "text-stone-400 hover:text-stone-600"
                    }`}
                  >
                    <Upload size={16} /> Upload File
                    <span className="text-[10px] text-amber-600 font-bold ml-1">(Self-hosted)</span>
                  </button>
                </div>

                {uploadMode === "url" ? (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">
                      Image URL
                    </label>
                    <input
                      type="url"
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      placeholder="https://example.com/review.jpg"
                      className="w-full bg-stone-50 border border-stone-100 rounded-2xl py-3 px-4 text-sm focus:bg-white focus:border-[#d4a84b] outline-none transition-all"
                    />
                    <p className="text-[11px] text-stone-400 mt-2">Use an externally hosted image URL for production deployments.</p>
                  </div>
                ) : (
                  <div>
                    {!selectedFile ? (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full aspect-video bg-stone-50 border-2 border-dashed border-stone-100 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:bg-stone-100/50 hover:border-[#d4a84b]/40 transition-all group"
                      >
                        <Upload size={24} className="text-stone-300 group-hover:text-[#d4a84b] transition-colors mb-3" />
                        <p className="text-sm font-semibold text-stone-600">Click to select an image</p>
                        <p className="text-xs text-stone-400 mt-1">JPG, PNG, WEBP</p>
                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                      </div>
                    ) : (
                      <div className="relative rounded-2xl overflow-hidden border border-stone-100 aspect-[4/3]">
                        <img src={previewUrl ?? ""} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          onClick={() => { setSelectedFile(null); if (previewUrl) URL.revokeObjectURL(previewUrl); setPreviewUrl(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {error && (
                  <p className="text-red-500 text-sm bg-red-50 p-3 rounded-xl border border-red-100">
                    {error}
                  </p>
                )}
              </div>

              <div className="p-8 border-t border-stone-50 bg-stone-50/50 flex items-center justify-end gap-4">
                <button onClick={closeModal} className="px-6 py-3 text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors">
                  Cancel
                </button>
                <button
                  onClick={handleAdd}
                  disabled={adding}
                  className="bg-stone-900 text-white px-8 py-3 rounded-xl text-sm font-semibold hover:bg-stone-800 disabled:bg-stone-300 transition-all flex items-center gap-2 shadow-lg shadow-stone-200"
                >
                  {adding ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                  {adding ? "Adding..." : "Add Review"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
