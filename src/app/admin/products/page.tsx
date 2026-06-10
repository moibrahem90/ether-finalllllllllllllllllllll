"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useState, useRef } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  Image as ImageIcon, 
  X, 
  Loader2,
  MoreVertical,
  Check,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const productSchema = z.object({
  name: z.string().min(2, 'Name is too short'),
  description: z.string().min(10, 'Description is too short'),
  price: z.string().transform((val) => Number(val)),
  category: z.string().min(1, 'Category is required'),
  stock: z.string().transform((val) => Number(val)),
discount: z.string().transform((val) => Number(val)).optional().default(0),
});

type ProductForm = z.input<typeof productSchema>;

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch Products
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const res = await api.get('/product');
      return res.data.data.products;
    }
  });

  // Fetch Categories
  const { data: categories } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const res = await api.get('/category');
      return res.data.data;
    }
  });

  // Create/Update Mutation
  const mutation = useMutation({
    mutationFn: async (formData: FormData) => {
      if (editingProduct) {
        return api.patch(`/product/${editingProduct._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      return api.post('/product', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      closeModal();
    },
    onError: (err: any) => {
      console.error(err);
    }
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/product/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    }
  });

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<any>({
    resolver: zodResolver(productSchema)
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 5) {
      alert("Maximum 5 images allowed");
      return;
    }
    
    setSelectedFiles(files);
    
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews(newPreviews);
  };

  const removeImage = (index: number) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);

    const newPreviews = [...previews];
    newPreviews.splice(index, 1);
    setPreviews(newPreviews);
  };

  const onSubmit = (data: any) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      formData.append(key, data[key]);
    });
    
    selectedFiles.forEach(file => {
      formData.append('images', file);
    });

    mutation.mutate(formData);
  };

  const openModal = (product: any = null) => {
    if (product) {
      setEditingProduct(product);
      setValue('name', product.name);
      setValue('description', product.description);
      setValue('price', product.price.toString() as any);
      setValue('category', product.category?._id || product.category);
      setValue('stock', product.stock.toString() as any);
      setValue('discount', (product.discount || 0).toString() as any);
      setPreviews(product.images || []);
    } else {
      setEditingProduct(null);
      reset();
      setPreviews([]);
      setSelectedFiles([]);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    reset();
    setPreviews([]);
    setSelectedFiles([]);
  };

  const filteredProducts = products?.filter((p: any) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.category?._id === categoryFilter || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="font-serif text-4xl text-stone-800 mb-2">Product <span className="gold-gradient-text">Catalogue</span></h1>
          <p className="text-stone-500 text-sm">Manage your artisanal collection, stock levels, and pricing.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-stone-900 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-stone-800 transition-all shadow-lg shadow-stone-200 flex items-center gap-2"
        >
          <Plus size={18} />
          Add New Product
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-[2rem] border border-stone-100 shadow-sm p-6 flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
          <input 
            type="text" 
            placeholder="Search products..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-stone-50 border-transparent focus:bg-white focus:border-[#d4a84b] rounded-2xl py-3 pl-12 pr-4 text-sm transition-all outline-none"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-48">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-stone-50 border-transparent focus:bg-white focus:border-[#d4a84b] rounded-2xl py-3 pl-12 pr-10 text-sm transition-all outline-none appearance-none"
            >
              <option value="all">All Categories</option>
              {categories?.map((cat: any) => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid/Table */}
      <div className="bg-white rounded-[2.5rem] border border-white shadow-[0_20px_60px_rgba(0,0,0,0.02)] overflow-hidden">
        {productsLoading ? (
          <div className="flex items-center justify-center py-40">
            <Loader2 className="animate-spin text-[#d4a84b]" size={40} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-stone-50">
                  <th className="px-8 py-6 text-xs font-bold uppercase tracking-widest text-stone-400">Product</th>
                  <th className="px-8 py-6 text-xs font-bold uppercase tracking-widest text-stone-400">Category</th>
                  <th className="px-8 py-6 text-xs font-bold uppercase tracking-widest text-stone-400">Stock</th>
                  <th className="px-8 py-6 text-xs font-bold uppercase tracking-widest text-stone-400">Price</th>
                  <th className="px-8 py-6 text-xs font-bold uppercase tracking-widest text-stone-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {filteredProducts?.map((product: any) => (
                  <tr key={product._id} className="group hover:bg-stone-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-stone-50 overflow-hidden border border-stone-100 flex-shrink-0">
                          {product.images?.[0] ? (
                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-stone-300">
                              <ImageIcon size={20} />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-stone-800">{product.name}</p>
                          <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">ID: {product._id.slice(-6).toUpperCase()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-sm text-stone-600">
                      <span className="px-3 py-1 rounded-full bg-stone-100 text-stone-500 text-[10px] font-bold uppercase tracking-widest">
                        {product.category?.name || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${product.stock > 10 ? 'bg-emerald-500' : product.stock > 0 ? 'bg-amber-500' : 'bg-red-500'}`} />
                        <span className="text-sm font-medium text-stone-600">{product.stock} in stock</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="font-serif text-stone-800">${product.price.toFixed(2)}</span>
                        {product.discount > 0 && (
                          <span className="text-[10px] text-emerald-600 font-bold">-{product.discount}% OFF</span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openModal(product)}
                          className="p-2 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-all"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => { if(confirm('Are you sure?')) deleteMutation.mutate(product._id) }}
                          className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(!filteredProducts || filteredProducts.length === 0) && (
              <div className="py-40 text-center">
                <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Package size={32} className="text-stone-200" />
                </div>
                <h3 className="font-serif text-xl text-stone-800 mb-2">No products found</h3>
                <p className="text-stone-400 text-sm">Try adding a new product or adjusting filters.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Product Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
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
              className="relative w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-8 border-b border-stone-50 flex items-center justify-between flex-shrink-0">
                <div>
                  <h2 className="font-serif text-2xl text-stone-800">{editingProduct ? 'Edit' : 'Create'} Product</h2>
                  <p className="text-xs text-stone-400 uppercase tracking-widest font-bold mt-1">Collection Management</p>
                </div>
                <button onClick={closeModal} className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center text-stone-400 hover:text-stone-800 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <form id="product-form" onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {/* Left Column: Info */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Product Name</label>
                      <input 
                        {...register('name')}
                        className="w-full bg-stone-50 border-stone-100 rounded-2xl py-3 px-4 text-sm focus:bg-white focus:border-[#d4a84b] outline-none transition-all"
                        placeholder="e.g. Lavender & Oakmoss Candle"
                      />
                      {errors.name && <p className="text-red-500 text-xs mt-1">{String(errors.name.message)}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Description</label>
                      <textarea 
                        {...register('description')}
                        rows={4}
                        className="w-full bg-stone-50 border-stone-100 rounded-2xl py-3 px-4 text-sm focus:bg-white focus:border-[#d4a84b] outline-none transition-all resize-none"
                        placeholder="Describe the scent profile, ingredients, and story..."
                      />
                      {errors.description && <p className="text-red-500 text-xs mt-1">{String(errors.description.message)}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Price ($)</label>
                        <input 
                          {...register('price')}
                          type="number"
                          step="0.01"
                          className="w-full bg-stone-50 border-stone-100 rounded-2xl py-3 px-4 text-sm focus:bg-white focus:border-[#d4a84b] outline-none transition-all"
                          placeholder="24.00"
                        />
                        {errors.price && <p className="text-red-500 text-xs mt-1">{String(errors.price.message)}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Discount (%)</label>
                        <input 
                          {...register('discount')}
                          type="number"
                          className="w-full bg-stone-50 border-stone-100 rounded-2xl py-3 px-4 text-sm focus:bg-white focus:border-[#d4a84b] outline-none transition-all"
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Stock Level</label>
                        <input 
                          {...register('stock')}
                          type="number"
                          className="w-full bg-stone-50 border-stone-100 rounded-2xl py-3 px-4 text-sm focus:bg-white focus:border-[#d4a84b] outline-none transition-all"
                          placeholder="50"
                        />
                        {errors.stock && <p className="text-red-500 text-xs mt-1">{String(errors.stock.message)}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Category</label>
                        <select 
                          {...register('category')}
                          className="w-full bg-stone-50 border-stone-100 rounded-2xl py-3 px-4 text-sm focus:bg-white focus:border-[#d4a84b] outline-none transition-all appearance-none"
                        >
                          <option value="">Select Category</option>
                          {categories?.map((cat: any) => (
                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                          ))}
                        </select>
                        {errors.category && <p className="text-red-500 text-xs mt-1">{String(errors.category.message)}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Images */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Product Images (Max 5)</label>
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full aspect-[4/3] bg-stone-50 border-2 border-dashed border-stone-100 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:bg-stone-100/50 hover:border-[#d4a84b]/30 transition-all group p-4"
                      >
                        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-stone-300 shadow-sm mb-4 group-hover:scale-110 group-hover:text-[#d4a84b] transition-all">
                          <Upload size={24} />
                        </div>
                        <p className="text-sm font-medium text-stone-600">Click or drag images to upload</p>
                        <p className="text-xs text-stone-400 mt-1">SVG, PNG, JPG or WEBP</p>
                        <input 
                          type="file" 
                          multiple 
                          accept="image/*" 
                          className="hidden" 
                          ref={fileInputRef}
                          onChange={handleFileChange}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-5 gap-3">
                      {previews.map((preview, idx) => (
                        <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group border border-stone-100">
                          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                          <button 
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                      {previews.length === 0 && (
                        <div className="col-span-5 py-4 text-center text-stone-400 text-xs italic">
                          No images selected
                        </div>
                      )}
                    </div>
                  </div>
                  {mutation.isError && (
                    <div className="col-span-1 md:col-span-2 text-red-500 text-sm font-medium bg-red-50 p-4 rounded-xl border border-red-100">
                      {(mutation.error as any).response?.data?.message || (mutation.error as any).message || 'An error occurred'}
                    </div>
                  )}
                </form>
              </div>

              <div className="p-8 border-t border-stone-50 bg-stone-50/50 flex items-center justify-end gap-4 flex-shrink-0">
                <button 
                  onClick={closeModal}
                  className="px-6 py-3 text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  form="product-form"
                  disabled={mutation.isPending}
                  className="bg-stone-900 text-white px-10 py-3 rounded-xl text-sm font-semibold hover:bg-stone-800 disabled:bg-stone-300 transition-all shadow-xl shadow-stone-200 flex items-center gap-2"
                >
                  {mutation.isPending ? <Loader2 className="animate-spin" size={18} /> : (editingProduct ? 'Save Changes' : 'Create Product')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
