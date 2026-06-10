"use client";

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useState, useMemo } from 'react';
import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Clock,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from 'recharts';

// ── Helpers ────────────────────────────────────────────────────────────────

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

function buildMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function formatMonthKey(key: string) {
  const [year, month] = key.split('-');
  return `${MONTH_NAMES[parseInt(month) - 1]} ${year}`;
}

/** Returns last N month keys (newest last) */
function lastNMonths(n: number): string[] {
  const result: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    result.push(buildMonthKey(d));
  }
  return result;
}

export default function AdminDashboard() {
  const monthKeys = useMemo(() => lastNMonths(12), []);
  const [selectedMonth, setSelectedMonth] = useState<string>(monthKeys[monthKeys.length - 1]);

  // ── Data fetching ──────────────────────────────────────────────────────
  const { data: allUsers, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users-count'],
    queryFn: async () => {
      const res = await api.get('/user/all');
      return res.data.data;
    }
  });

  const { data: allOrders, isLoading: ordersLoading } = useQuery({
    queryKey: ['admin-recent-orders'],
    queryFn: async () => {
      const res = await api.get('/order');
      return res.data.data as any[];
    }
  });

  // ── Analytics computation ──────────────────────────────────────────────
  /** Non-cancelled orders only */
  const validOrders: any[] = useMemo(
    () => (allOrders ?? []).filter((o: any) => o.status?.toLowerCase() !== 'cancelled'),
    [allOrders]
  );

  /** Build per-month aggregates for the last 12 months */
  const monthlyData = useMemo(() => {
    return monthKeys.map((key) => {
      const ordersInMonth = validOrders.filter((o) => {
        if (!o.createdAt) return false;
        return buildMonthKey(new Date(o.createdAt)) === key;
      });
      const revenue = ordersInMonth.reduce((sum, o) => sum + (o.totalPrice ?? 0), 0);
      return {
        key,
        label: MONTH_NAMES[parseInt(key.split('-')[1]) - 1],
        revenue,
        orders: ordersInMonth.length,
        isSelected: key === selectedMonth,
      };
    });
  }, [validOrders, monthKeys, selectedMonth]);

  /** Selected-month aggregates */
  const selectedData = useMemo(
    () => monthlyData.find((m) => m.key === selectedMonth) ?? { revenue: 0, orders: 0 },
    [monthlyData, selectedMonth]
  );

  const pendingOrdersCount = (allOrders ?? []).filter(
    (o: any) => o.status?.toLowerCase() === 'pending'
  ).length;

  const stats = [
    {
      name: "Monthly Revenue",
      value: `$${selectedData.revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      note: "Excl. cancelled",
    },
    {
      name: "Monthly Orders",
      value: selectedData.orders,
      icon: ShoppingCart,
      color: "text-blue-600",
      bg: "bg-blue-50",
      note: "Excl. cancelled",
    },
    {
      name: "Total Customers",
      value: allUsers?.length ?? 0,
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-50",
      note: "All time",
    },
    {
      name: "Pending Orders",
      value: pendingOrdersCount,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
      note: "Action needed",
    },
  ];

  const selectedIdx = monthKeys.indexOf(selectedMonth);

  if (usersLoading || ordersLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-[#d4a84b]" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <span className="text-xs uppercase tracking-[0.4em] text-[#a07828] mb-3 block font-semibold">
            Store Performance
          </span>
          <h1 className="font-serif text-4xl md:text-5xl text-stone-800">
            Dashboard <span className="gold-gradient-text">Overview</span>
          </h1>
        </motion.div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-[2rem] border border-white shadow-[0_20px_60px_rgba(0,0,0,0.02)] p-7 group hover:shadow-xl hover:shadow-yellow-500/5 transition-all duration-500"
            >
              <div className="flex items-center justify-between mb-6">
                <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform duration-500 shadow-sm`}>
                  <Icon size={24} strokeWidth={2} />
                </div>
                <span className="text-[10px] font-bold px-3 py-1.5 rounded-full bg-stone-50 text-stone-400 border border-stone-100">
                  {stat.note}
                </span>
              </div>
              <h3 className="text-stone-400 text-sm font-medium mb-1 uppercase tracking-wider">{stat.name}</h3>
              <p className="text-3xl font-serif text-stone-800">{stat.value}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Monthly Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-white rounded-[2.5rem] border border-white shadow-[0_20px_60px_rgba(0,0,0,0.02)] p-8"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-serif text-2xl text-stone-800 mb-1">Revenue by Month</h2>
              <p className="text-sm text-stone-400">Cancelled orders excluded from all figures</p>
            </div>
            {/* Month navigator */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedMonth(monthKeys[Math.max(0, selectedIdx - 1)])}
                disabled={selectedIdx === 0}
                className="w-9 h-9 rounded-xl border border-stone-100 flex items-center justify-center text-stone-400 hover:bg-stone-50 disabled:opacity-30 transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-white border border-stone-200 rounded-xl px-3 py-2 text-sm font-medium outline-none focus:border-[#d4a84b] cursor-pointer"
              >
                {monthKeys.map((key) => (
                  <option key={key} value={key}>
                    {formatMonthKey(key)}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setSelectedMonth(monthKeys[Math.min(monthKeys.length - 1, selectedIdx + 1)])}
                disabled={selectedIdx === monthKeys.length - 1}
                className="w-9 h-9 rounded-xl border border-stone-100 flex items-center justify-center text-stone-400 hover:bg-stone-50 disabled:opacity-30 transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#a8a29e', fontSize: 11 }}
                  dy={8}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#a8a29e', fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '16px',
                    border: 'none',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                    padding: '10px 16px',
                    fontSize: 13,
                  }}
                  formatter={(value: any, name: any) =>
                    name === 'revenue' ? [`$${Number(value).toFixed(2)}`, 'Revenue'] : [value, 'Orders']
                  }
                />
                <Bar
                  dataKey="revenue"
                  radius={[6, 6, 0, 0]}
                  fill="#d4a84b"
                  opacity={0.85}
                  // Highlight selected month
                  label={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Selected month summary */}
          <div className="mt-6 pt-6 border-t border-stone-50 grid grid-cols-2 gap-4">
            <div className="bg-stone-50 rounded-2xl p-4">
              <p className="text-xs text-stone-400 uppercase tracking-widest font-bold mb-1">
                {formatMonthKey(selectedMonth)} Revenue
              </p>
              <p className="font-serif text-2xl text-stone-800">
                ${selectedData.revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-stone-50 rounded-2xl p-4">
              <p className="text-xs text-stone-400 uppercase tracking-widest font-bold mb-1">
                {formatMonthKey(selectedMonth)} Orders
              </p>
              <p className="font-serif text-2xl text-stone-800">{selectedData.orders}</p>
            </div>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-[2.5rem] border border-white shadow-[0_20px_60px_rgba(0,0,0,0.02)] p-8 relative overflow-hidden"
        >
          <div className="absolute top-[-10%] right-[-10%] w-32 h-32 bg-[#d4a84b]/5 rounded-full blur-[20px]" />
          <div className="flex items-center justify-between mb-8 relative z-10">
            <h2 className="font-serif text-2xl text-stone-800">Recent Activity</h2>
          </div>

          <div className="space-y-5 relative z-10">
            {(allOrders ?? [])
              .slice()
              .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .slice(0, 5)
              .map((order: any, idx: number) => (
                <motion.div
                  key={order._id || idx}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + idx * 0.08 }}
                  className="flex items-center justify-between group cursor-pointer p-2 -mx-2 rounded-2xl hover:bg-stone-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-stone-50 flex items-center justify-center text-stone-400 group-hover:bg-gradient-to-br group-hover:from-[#f5e6c0] group-hover:to-[#d4a84b] group-hover:text-white transition-all duration-300 shadow-inner group-hover:shadow-md flex-shrink-0">
                      {order.status?.toLowerCase() === 'delivered' ? <Check size={18} /> : <Clock size={18} />}
                    </div>
                    <div>
                      <p className="font-semibold text-stone-800 text-sm group-hover:text-[#a07828] transition-colors">
                        {order.fullName}
                      </p>
                      <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold mt-0.5">
                        #{order._id?.slice(-6).toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-serif text-stone-800 text-sm">${order.totalPrice?.toFixed(2)}</p>
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md mt-1 inline-block ${
                      order.status?.toLowerCase() === 'delivered' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                      order.status?.toLowerCase() === 'pending' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                      order.status?.toLowerCase() === 'cancelled' ? 'bg-red-50 text-red-600 border border-red-100' :
                      'bg-blue-50 text-blue-600 border border-blue-100'
                    }`}>
                      {order.status || 'Pending'}
                    </span>
                  </div>
                </motion.div>
              ))}
            {(!allOrders || allOrders.length === 0) && (
              <div className="text-center py-10">
                <Clock className="mx-auto text-stone-200 mb-3" size={32} />
                <p className="text-stone-400 text-sm italic">No recent activity found</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
       

        <div className="bg-white rounded-[2.5rem] border border-white shadow-[0_20px_60px_rgba(0,0,0,0.02)] p-8 flex flex-col justify-center items-center text-center">
          <div className="w-16 h-16 rounded-full bg-stone-50 flex items-center justify-center text-stone-300 mb-6 border border-stone-100">
            <Package size={28} />
          </div>
          <h3 className="font-serif text-xl text-stone-800 mb-2">Inventory Alert</h3>
          <p className="text-stone-400 text-sm">Review products regularly to keep stock updated.</p>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-white shadow-[0_20px_60px_rgba(0,0,0,0.02)] p-8 flex flex-col justify-center items-center text-center">
          <div className="w-16 h-16 rounded-full bg-stone-50 flex items-center justify-center text-stone-300 mb-6 border border-stone-100">
            <TrendingUp size={28} />
          </div>
          <h3 className="font-serif text-xl text-stone-800 mb-2">Customer Growth</h3>
          <p className="text-stone-400 text-sm">
            {allUsers?.length ?? 0} registered customers total.
          </p>
        </div>
      </div>
    </div>
  );
}
