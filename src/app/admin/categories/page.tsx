"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useState, useRef } from "react";
import {
  Tag,
  Plus,
  Trash2,
  Loader2,
  AlertCircle,
  Pencil,
  X,
  Upload,
  Link as LinkIcon,
  ImageIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CategoryMeta {
  id: string;
  subtitle: string;
  imageUrl: string;
  isLocal: boolean;
}

interface Category {
  _id: string;
  name: string;
  meta?: CategoryMeta;
}

type ModalMode = "add" | "edit";

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("add");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [formName, setFormName] = useState("");
  const [formSubtitle, setFormSubtitle] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formImageMode, setFormImageMode] = useState<"url" | "file">("url");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch categories from Railway API
  const { data: rawCategories, isLoading: catLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const res = await api.get("/category");
      return res.data.data as any[];
    },
  });

  // Fetch local metadata
  const { data: metaData } = useQuery({
    queryKey: ["categories-meta"],
    queryFn: async () => {
      const res = await fetch("/api/categories-meta");
      const json = await res.json();
      return (json.categories ?? []) as CategoryMeta[];
    },
  });

  // Merge categories with metadata
  const categories: Category[] = (rawCategories ?? []).map((cat: any) => ({
    _id: cat._id,
    name: cat.name,
    meta: (metaData ?? []).find((m) => m.id === cat._id),
  }));

  // Create category on Railway
  const createMutation = useMutation({
    mutationFn: (name: string) => api.post("/category", { name }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-categories"] }),
  });

  // Delete Railway + local meta
  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await api.delete(`/category/${id}`);
      await fetch(`/api/categories-meta/${id}`, { method: "DELETE" });
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories-meta"] });
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  const resetForm = () => {
    setFormName("");
    setFormSubtitle("");
    setFormImageUrl("");
    setFormImageMode("url");
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setFormError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const openAdd = () => {
    resetForm();
    setModalMode("add");
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const openEdit = (cat: Category) => {
    resetForm();
    setModalMode("edit");
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormSubtitle(cat.meta?.subtitle ?? "");
    setFormImageUrl(cat.meta?.imageUrl ?? "");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
    setEditingCategory(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const saveMeta = async (categoryId: string) => {
    const fd = new FormData();
    fd.append("id", categoryId);
    fd.append("subtitle", formSubtitle);
    if (formImageMode === "file" && selectedFile) {
      fd.append("image", selectedFile);
    } else if (formImageMode === "url" && formImageUrl) {
      fd.append("imageUrl", formImageUrl);
    }
    await fetch("/api/categories-meta", { method: "POST", body: fd });
    queryClient.invalidateQueries({ queryKey: ["categories-meta"] });
  };

  const handleSave = async () => {
    if (!formName.trim()) { setFormError("Category name is required."); return; }
    setSaving(true);
    setFormError(null);
    try {
      if (modalMode === "add") {
        const res = await api.post("/category", { name: formName.trim() });
        const newId = res.data?.data?._id ?? res.data?._id;
        if (newId) await saveMeta(newId);
        queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      } else if (editingCategory) {
        await saveMeta(editingCategory._id);
      }
      closeModal();
    } catch (err: any) {
      setFormError(err.response?.data?.message || "Failed to save category.");
    } finally {
      setSaving(false);
    }
  };

  const imageToShow = previewUrl || (formImageMode === "url" ? formImageUrl : "");

  return (
    <div className="space-y-10 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="font-serif text-4xl text-stone-800 mb-2">
            Category <span className="gold-gradient-text">Architecture</span>
          </h1>
          <p className="text-stone-500 text-sm">
            Organize your collection into logical groups with images and subtitles.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="bg-stone-900 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-stone-800 transition-all shadow-lg shadow-stone-200 flex items-center gap-2"
        >
          <Plus size={18} /> Add Category
        </button>
      </div>

      {/* Categories Grid */}
      <div className="bg-white rounded-[2.5rem] border border-white shadow-[0_20px_60px_rgba(0,0,0,0.02)] p-8">
        {catLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="animate-spin text-[#d4a84b]" size={32} />
          </div>
        ) : categories.length === 0 ? (
          <div className="py-24 text-center">
            <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Tag size={24} className="text-stone-200" />
            </div>
            <p className="text-stone-400 text-sm italic">No categories yet. Add your first one.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {categories.map((cat, i) => (
                <motion.div
                  key={cat._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                  className="group relative rounded-3xl overflow-hidden border border-stone-100 shadow-sm hover:shadow-lg hover:shadow-yellow-500/5 transition-all duration-500 bg-white"
                >
                  {/* Image */}
                  <div className="aspect-[4/3] bg-gradient-to-br from-[#f5e6c0]/30 to-stone-100 relative overflow-hidden">
                    {cat.meta?.imageUrl ? (
                      <img
                        src={cat.meta.imageUrl}
                        alt={cat.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon size={40} className="text-stone-200" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

                    {/* Action buttons */}
                    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={() => openEdit(cat)}
                        className="w-8 h-8 rounded-full bg-white/90 backdrop-blur text-stone-600 hover:text-[#a07828] flex items-center justify-center shadow-md transition-colors"
                        aria-label="Edit category"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(cat._id)}
                        className="w-8 h-8 rounded-full bg-white/90 backdrop-blur text-stone-600 hover:text-red-600 flex items-center justify-center shadow-md transition-colors"
                        aria-label="Delete category"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-5">
                    <h3 className="font-serif text-lg text-stone-800 font-bold mb-1">{cat.name}</h3>
                    <p className="text-stone-400 text-sm">
                      {cat.meta?.subtitle || <span className="italic">No subtitle</span>}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Warning note */}
      <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-[#f5e6c0]/20 to-transparent rounded-[2rem] border border-dashed border-[#d4a84b]/20">
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#a07828] shadow-sm flex-shrink-0">
          <AlertCircle size={18} />
        </div>
        <p className="text-sm text-stone-600 leading-relaxed">
          Deleting a category unassigns it from all products. This action cannot be undone.
        </p>
      </div>

      {/* ── Add/Edit Modal ─────────────────────────────────────────────────── */}
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
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-8 border-b border-stone-50 flex items-center justify-between flex-shrink-0">
                <h2 className="font-serif text-2xl text-stone-800">
                  {modalMode === "add" ? "New Category" : "Edit Category"}
                </h2>
                <button onClick={closeModal} className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center text-stone-400 hover:text-stone-800 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">
                    Category Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    disabled={modalMode === "edit"}
                    placeholder="e.g. Soy Candles"
                    className="w-full bg-stone-50 border border-stone-100 rounded-2xl py-3 px-4 text-sm focus:bg-white focus:border-[#d4a84b] outline-none transition-all disabled:opacity-60"
                  />
                  {modalMode === "edit" && (
                    <p className="text-[11px] text-stone-400 mt-1">Category name cannot be changed after creation.</p>
                  )}
                </div>

                {/* Subtitle */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">
                    Subtitle <span className="text-stone-300 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={formSubtitle}
                    onChange={(e) => setFormSubtitle(e.target.value)}
                    placeholder="e.g. Hand-poured with natural wax"
                    className="w-full bg-stone-50 border border-stone-100 rounded-2xl py-3 px-4 text-sm focus:bg-white focus:border-[#d4a84b] outline-none transition-all"
                  />
                </div>

                {/* Image */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-3">
                    Category Image <span className="text-stone-300 font-normal">(optional)</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-stone-50 rounded-2xl mb-4">
                    <button
                      type="button"
                      onClick={() => setFormImageMode("url")}
                      className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${formImageMode === "url" ? "bg-white text-stone-800 shadow-sm" : "text-stone-400"}`}
                    >
                      <LinkIcon size={15} /> Image URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormImageMode("file")}
                      className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${formImageMode === "file" ? "bg-white text-stone-800 shadow-sm" : "text-stone-400"}`}
                    >
                      <Upload size={15} /> Upload
                    </button>
                  </div>

                  {formImageMode === "url" ? (
                    <input
                      type="url"
                      value={formImageUrl}
                      onChange={(e) => setFormImageUrl(e.target.value)}
                      placeholder="https://example.com/category.jpg"
                      className="w-full bg-stone-50 border border-stone-100 rounded-2xl py-3 px-4 text-sm focus:bg-white focus:border-[#d4a84b] outline-none transition-all"
                    />
                  ) : (
                    <div>
                      {!selectedFile ? (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full aspect-video bg-stone-50 border-2 border-dashed border-stone-100 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-[#d4a84b]/40 transition-all group"
                        >
                          <Upload size={20} className="text-stone-300 group-hover:text-[#d4a84b] mb-2 transition-colors" />
                          <p className="text-sm text-stone-500">Click to upload</p>
                          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                        </div>
                      ) : (
                        <div className="relative rounded-2xl overflow-hidden border border-stone-100 aspect-video">
                          <img src={previewUrl ?? ""} alt="Preview" className="w-full h-full object-cover" />
                          <button onClick={() => { setSelectedFile(null); if (previewUrl) URL.revokeObjectURL(previewUrl); setPreviewUrl(null); if (fileInputRef.current) fileInputRef.current.value = ""; }} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center">
                            <X size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Preview existing image */}
                  {imageToShow && !selectedFile && formImageMode === "url" && (
                    <div className="mt-3 rounded-xl overflow-hidden border border-stone-100 aspect-video">
                      <img src={imageToShow} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                {formError && (
                  <p className="text-red-500 text-sm bg-red-50 p-3 rounded-xl border border-red-100 flex items-center gap-2">
                    <AlertCircle size={14} /> {formError}
                  </p>
                )}
              </div>

              <div className="p-8 border-t border-stone-50 bg-stone-50/50 flex items-center justify-end gap-4 flex-shrink-0">
                <button onClick={closeModal} className="px-6 py-3 text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors">
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-stone-900 text-white px-8 py-3 rounded-xl text-sm font-semibold hover:bg-stone-800 disabled:bg-stone-300 transition-all flex items-center gap-2 shadow-lg shadow-stone-200"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                  {saving ? "Saving..." : modalMode === "add" ? "Add Category" : "Save Changes"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Confirm Delete Modal ───────────────────────────────────────────── */}
      <AnimatePresence>
        {confirmDeleteId && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setConfirmDeleteId(null)} className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-sm bg-white rounded-[2rem] shadow-2xl p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
                <Trash2 size={24} className="text-red-500" />
              </div>
              <h3 className="font-serif text-2xl text-stone-800 mb-2">Delete Category?</h3>
              <p className="text-stone-500 text-sm mb-8 leading-relaxed">
                This will permanently remove the category and unassign it from all products. Local metadata and images will also be deleted.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDeleteId(null)} className="flex-1 py-3 rounded-2xl border border-stone-200 text-stone-600 text-sm font-medium hover:bg-stone-50 transition-colors">
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(confirmDeleteId)}
                  disabled={!!deletingId}
                  className="flex-1 py-3 rounded-2xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:bg-red-300 transition-colors flex items-center justify-center gap-2"
                >
                  {deletingId ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
