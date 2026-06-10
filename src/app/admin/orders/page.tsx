"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useState } from 'react';
import { 
  ShoppingCart, 
  Search, 
  Filter, 
  Eye, 
  Loader2, 
  Clock, 
  CheckCircle2, 
  Truck, 
  PackageCheck, 
  XCircle,
  ChevronLeft,
  ChevronRight,
  X,
  MapPin,
  Phone,
  AtSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const statusColors: any = {
  pending: "bg-amber-50 text-amber-600 border-amber-100",
  confirmed: "bg-blue-50 text-blue-600 border-blue-100",
  shipped: "bg-indigo-50 text-indigo-600 border-indigo-100",
  delivered: "bg-emerald-50 text-emerald-600 border-emerald-100",
  cancelled: "bg-red-50 text-red-600 border-red-100",
};

const statusIcons: any = {
  pending: <Clock size={14} />,
  confirmed: <CheckCircle2 size={14} />,
  shipped: <Truck size={14} />,
  delivered: <PackageCheck size={14} />,
  cancelled: <XCircle size={14} />,
};

export default function OrdersPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // Fetch Orders
  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const res = await api.get('/order');
      return res.data.data;
    }
  });

  // Update Status Mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: string }) => 
      api.patch(`/order/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    }
  });

  const filteredOrders = orders
    ?.filter((order: any) => {
      const matchesSearch =
        order.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order._id?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort(
      (a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="font-serif text-4xl text-stone-800 mb-2">Order <span className="gold-gradient-text">Fulfillment</span></h1>
          <p className="text-stone-500 text-sm">Monitor sales and manage order processing workflows.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => window.print()}
            className="bg-stone-50 text-stone-600 border border-stone-100 px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-stone-100 transition-colors"
          >
            Print Invoices
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-[2rem] border border-stone-100 shadow-sm p-6 flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by Customer or Order ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-stone-50 border-transparent focus:bg-white focus:border-[#d4a84b] rounded-2xl py-3 pl-12 pr-4 text-sm transition-all outline-none"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-48">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-stone-50 border-transparent focus:bg-white focus:border-[#d4a84b] rounded-2xl py-3 pl-12 pr-10 text-sm transition-all outline-none appearance-none"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
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
                  <th className="px-8 py-6 text-xs font-bold uppercase tracking-widest text-stone-400">Order & Date</th>
                  <th className="px-8 py-6 text-xs font-bold uppercase tracking-widest text-stone-400">Customer</th>
                  <th className="px-8 py-6 text-xs font-bold uppercase tracking-widest text-stone-400">Status</th>
                  <th className="px-8 py-6 text-xs font-bold uppercase tracking-widest text-stone-400">Total</th>
                  <th className="px-8 py-6 text-xs font-bold uppercase tracking-widest text-stone-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {filteredOrders?.map((order: any) => (
                  <tr key={order._id} className="group hover:bg-stone-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-stone-50 flex items-center justify-center text-[#a07828] border border-stone-100">
                          <ShoppingCart size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-stone-800 uppercase tracking-widest text-xs">#{order._id?.slice(-6).toUpperCase()}</p>
                          <p className="text-stone-400 text-[10px] font-medium mt-0.5">
                            {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div>
                        <p className="font-semibold text-stone-800">{order.fullName}</p>
                        <p className="text-stone-400 text-xs mt-0.5">{order.email || 'No email provided'}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="relative group/status">
                        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-all ${statusColors[order.status]}`}>
                          {statusIcons[order.status]}
                          {order.status}
                        </span>
                        
                        {/* Status Quick Switch */}
                        <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-2xl border border-stone-100 opacity-0 invisible group-hover/status:opacity-100 group-hover/status:visible transition-all duration-300 z-50 p-2 min-w-[140px]">
                          {['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((s) => (
                            <button
                              key={s}
                              onClick={() => updateStatusMutation.mutate({ id: order._id, status: s })}
                              className={`w-full text-left px-3 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-stone-50 transition-colors flex items-center gap-2 ${order.status === s ? 'text-[#a07828] bg-[#f5e6c0]/20' : 'text-stone-500'}`}
                            >
                              {statusIcons[s]}
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="font-serif text-stone-800">${order.totalPrice?.toFixed(2)}</p>
                      <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">{order.products?.length || 0} items</p>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 text-stone-400 hover:text-[#a07828] hover:bg-[#f5e6c0]/20 rounded-lg transition-all"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(!filteredOrders || filteredOrders.length === 0) && (
              <div className="py-40 text-center">
                <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShoppingCart size={32} className="text-stone-200" />
                </div>
                <h3 className="font-serif text-xl text-stone-800 mb-2">No orders found</h3>
                <p className="text-stone-400 text-sm">Waiting for your first customers!</p>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
          <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden">
            <div className="p-8 border-b border-stone-50 flex items-center justify-between">
              <div>
                <h2 className="font-serif text-2xl text-stone-800">Order Detail</h2>
                <p className="text-xs text-stone-400 uppercase tracking-widest font-bold mt-1">#{selectedOrder._id?.slice(-6).toUpperCase()}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center text-stone-400 hover:text-stone-800 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-8 space-y-5">
              <div className="flex items-center gap-3">
                <ShoppingCart size={18} className="text-stone-400" />
                <div>
                  <p className="text-xs text-stone-400 uppercase tracking-widest font-bold">Customer</p>
                  <p className="text-stone-800 font-semibold">{selectedOrder.fullName}</p>
                  <p className="text-stone-500 text-sm">{selectedOrder.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={18} className="text-stone-400" />
                <div>
                  <p className="text-xs text-stone-400 uppercase tracking-widest font-bold">Phone</p>
                  <p className="text-stone-800">{selectedOrder.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <AtSign size={18} className="text-stone-400" />
                <div>
                  <p className="text-xs text-stone-400 uppercase tracking-widest font-bold">Instagram</p>
                  <p className="text-stone-800">@{selectedOrder.instagramUsername}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin size={18} className="text-stone-400" />
                <div>
                  <p className="text-xs text-stone-400 uppercase tracking-widest font-bold">Delivery Address</p>
                  <p className="text-stone-800">{selectedOrder.address}</p>
                </div>
              </div>
              <div className="pt-4 border-t border-stone-50 flex items-center justify-between">
                <p className="text-xs text-stone-400 uppercase tracking-widest font-bold">Total</p>
                <p className="font-serif text-2xl text-stone-800">${selectedOrder.totalPrice?.toFixed(2)}</p>
              </div>
              <div className="pt-2">
                <p className="text-xs text-stone-400 uppercase tracking-widest font-bold mb-3">Update Status</p>
                <div className="flex flex-wrap gap-2">
                  {['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((s) => (
                    <button
                      key={s}
                      onClick={() => { updateStatusMutation.mutate({ id: selectedOrder._id, status: s }); setSelectedOrder({ ...selectedOrder, status: s }); }}
                      className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-lg border transition-colors ${
                        selectedOrder.status === s ? 'bg-[#f5e6c0] text-[#a07828] border-[#d4a84b]/30' : 'bg-stone-50 text-stone-500 border-stone-100 hover:bg-stone-100'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
