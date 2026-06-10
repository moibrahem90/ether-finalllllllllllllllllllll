"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useState } from 'react';
import { 
  Ticket, 
  Plus, 
  Trash2, 
  Loader2, 
  Calendar, 
  CheckCircle2, 
  XCircle,
  Clock,
  Zap,
  MoreVertical,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const promoSchema = z.object({
  code: z.string().min(3, 'Code must be at least 3 characters').toUpperCase(),
  discount: z.string().transform((val) => Number(val)),
  expirationDate: z.string().min(1, 'Expiration date is required'),
  usageLimit: z.string().optional().transform((val) => val ? Number(val) : null),
});

type PromoForm = z.infer<typeof promoSchema>;

export default function PromoCodesPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch Coupons
  const { data: coupons, isLoading } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: async () => {
      const res = await api.get('/coupon');
      return res.data.data;
    }
  });

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/coupon', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      setIsModalOpen(false);
      reset();
    }
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/coupon/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
    }
  });

  // Toggle Mutation
  const toggleMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/coupon/${id}/toggle`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
    }
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<any>({
    resolver: zodResolver(promoSchema)
  });

  const onSubmit = (data: any) => {
    createMutation.mutate(data);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="font-serif text-4xl text-stone-800 mb-2">Promo <span className="gold-gradient-text">Engine</span></h1>
          <p className="text-stone-500 text-sm">Create and manage discounts to drive store growth and loyalty.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-stone-900 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-stone-800 transition-all shadow-lg shadow-stone-200 flex items-center gap-2"
        >
          <Plus size={18} />
          Create Promo Code
        </button>
      </div>

      {/* Stats Cards for Promos */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-[2rem] p-6 border border-stone-100 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Active Codes</p>
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-3xl text-stone-800">{coupons?.filter((c: any) => c.isActive).length || 0}</h3>
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
              <CheckCircle2 size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-[2rem] p-6 border border-stone-100 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Total Savings</p>
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-3xl text-stone-800">$1,240</h3>
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
              <Zap size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-[2rem] p-6 border border-stone-100 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Expiring Soon</p>
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-3xl text-stone-800">2</h3>
            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
              <Clock size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Promo Table */}
      <div className="bg-white rounded-[2.5rem] border border-white shadow-[0_20px_60px_rgba(0,0,0,0.02)] overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-40">
            <Loader2 className="animate-spin text-[#d4a84b]" size={40} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-stone-50">
                  <th className="px-8 py-6 text-xs font-bold uppercase tracking-widest text-stone-400">Coupon Code</th>
                  <th className="px-8 py-6 text-xs font-bold uppercase tracking-widest text-stone-400">Discount</th>
                  <th className="px-8 py-6 text-xs font-bold uppercase tracking-widest text-stone-400">Usage</th>
                  <th className="px-8 py-6 text-xs font-bold uppercase tracking-widest text-stone-400">Expiration</th>
                  <th className="px-8 py-6 text-xs font-bold uppercase tracking-widest text-stone-400">Status</th>
                  <th className="px-8 py-6 text-xs font-bold uppercase tracking-widest text-stone-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {coupons?.map((coupon: any) => (
                  <tr key={coupon._id} className="group hover:bg-stone-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#f5e6c0]/40 flex items-center justify-center text-[#a07828]">
                          <Ticket size={18} />
                        </div>
                        <span className="font-mono font-bold text-stone-800 tracking-wider bg-stone-50 px-3 py-1.5 rounded-lg border border-stone-100">
                          {coupon.code}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="font-serif text-lg text-emerald-600">-{coupon.discount}%</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-stone-600">{coupon.usageCount} / {coupon.usageLimit || '∞'}</p>
                        <div className="w-24 h-1 bg-stone-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[#d4a84b]" 
                            style={{ width: coupon.usageLimit ? `${(coupon.usageCount / coupon.usageLimit) * 100}%` : '10%' }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-stone-600 text-sm">
                        <Calendar size={14} className="text-stone-300" />
                        {new Date(coupon.expirationDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <button 
                        onClick={() => toggleMutation.mutate(coupon._id)}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all ${
                          coupon.isActive 
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100' 
                            : 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100'
                        }`}
                      >
                        {coupon.isActive ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                        {coupon.isActive ? 'Active' : 'Paused'}
                      </button>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => { if(confirm('Delete promo code?')) deleteMutation.mutate(coupon._id) }}
                          className="p-2 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(!coupons || coupons.length === 0) && (
              <div className="py-40 text-center">
                <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Ticket size={32} className="text-stone-200" />
                </div>
                <h3 className="font-serif text-xl text-stone-800 mb-2">No promo codes</h3>
                <p className="text-stone-400 text-sm">Start your first campaign to boost sales.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl p-10 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h2 className="font-serif text-2xl text-stone-800">New Promotion</h2>
                  <p className="text-xs text-stone-400 uppercase tracking-widest font-bold mt-1">Campaign Configuration</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center text-stone-400 hover:text-stone-800 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2 ml-1">Promo Code</label>
                  <input 
                    {...register('code')}
                    placeholder="ETHER20"
                    className="w-full bg-stone-50 border-stone-100 rounded-2xl py-3.5 px-4 text-sm font-mono tracking-widest focus:bg-white focus:border-[#d4a84b] outline-none transition-all uppercase"
                  />
                  {errors.code && <p className="text-red-500 text-xs mt-1">{String(errors.code.message)}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2 ml-1">Discount (%)</label>
                    <input 
                      {...register('discount')}
                      type="number"
                      placeholder="20"
                      className="w-full bg-stone-50 border-stone-100 rounded-2xl py-3.5 px-4 text-sm focus:bg-white focus:border-[#d4a84b] outline-none transition-all"
                    />
                    {errors.discount && <p className="text-red-500 text-xs mt-1">{String(errors.discount.message)}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2 ml-1">Usage Limit</label>
                    <input 
                      {...register('usageLimit')}
                      type="number"
                      placeholder="Optional"
                      className="w-full bg-stone-50 border-stone-100 rounded-2xl py-3.5 px-4 text-sm focus:bg-white focus:border-[#d4a84b] outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2 ml-1">Expiration Date</label>
                  <input 
                    {...register('expirationDate')}
                    type="date"
                    className="w-full bg-stone-50 border-stone-100 rounded-2xl py-3.5 px-4 text-sm focus:bg-white focus:border-[#d4a84b] outline-none transition-all"
                  />
                  {errors.expirationDate && <p className="text-red-500 text-xs mt-1">{String(errors.expirationDate.message)}</p>}
                </div>

                <button 
                  type="submit"
                  disabled={createMutation.isPending}
                  className="w-full bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 text-white rounded-2xl py-4 font-semibold text-sm transition-all shadow-xl shadow-stone-200 flex items-center justify-center gap-2 mt-4"
                >
                  {createMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : (
                    <>
                      <Zap size={18} />
                      Launch Campaign
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
