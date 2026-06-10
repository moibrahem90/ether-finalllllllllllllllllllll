"use client";

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useState } from 'react';
import {
  Search,
  Filter,
  User as UserIcon,
  Mail,
  Shield,
  Calendar,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Phone,
  Download,
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const res = await api.get('/user/all');
      return res.data.data;
    }
  });

  const filteredUsers = users
    ?.filter((user: any) => {
      const matchesSearch =
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      return matchesSearch && matchesRole;
    })
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleExportCSV = () => {
    if (!users || users.length === 0) return;
    const headers = ['Name', 'Email', 'Phone', 'Role', 'Joined Date'];
    const rows = users.map((user: any) => [
      user.name ?? '',
      user.email ?? '',
      user.phone ?? '',
      user.role ?? '',
      user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US') : '',
    ]);
    const csvContent = [
      headers.join(','),
      ...rows.map((row: string[]) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')),
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ether-users-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="font-serif text-4xl text-stone-800 mb-2">
            User <span className="gold-gradient-text">Management</span>
          </h1>
          <p className="text-stone-500 text-sm">View and manage all registered customers and administrators.</p>
        </div>
        <button
          onClick={handleExportCSV}
          disabled={!users || users.length === 0}
          className="bg-stone-900 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-stone-800 disabled:bg-stone-300 transition-colors shadow-lg shadow-stone-200 flex items-center gap-2"
        >
          <Download size={16} />
          Export as CSV
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-[2rem] border border-stone-100 shadow-sm p-6 flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-stone-50 border-transparent focus:bg-white focus:border-[#d4a84b] rounded-2xl py-3 pl-12 pr-4 text-sm transition-all outline-none"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-48">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full bg-stone-50 border-transparent focus:bg-white focus:border-[#d4a84b] rounded-2xl py-3 pl-12 pr-10 text-sm transition-all outline-none appearance-none"
            >
              <option value="all">All Roles</option>
              <option value="admin">Administrators</option>
              <option value="user">Customers</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
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
                  <th className="px-8 py-6 text-xs font-bold uppercase tracking-widest text-stone-400">User Details</th>
                  <th className="px-8 py-6 text-xs font-bold uppercase tracking-widest text-stone-400">Phone</th>
                  <th className="px-8 py-6 text-xs font-bold uppercase tracking-widest text-stone-400">Role</th>
                  <th className="px-8 py-6 text-xs font-bold uppercase tracking-widest text-stone-400">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {filteredUsers?.map((user: any) => (
                  <tr key={user._id} className="group hover:bg-stone-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#f5e6c0] to-[#d4a84b] p-0.5 shadow-sm flex-shrink-0">
                          <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-[#a07828] font-bold text-lg">
                            {user.name?.charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <div>
                          <p className="font-semibold text-stone-800">{user.name}</p>
                          <div className="flex items-center gap-2 text-stone-400 text-xs mt-0.5">
                            <Mail size={12} />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-stone-600 text-sm">
                        <Phone size={14} className="text-stone-300" />
                        {user.phone || <span className="text-stone-300 italic">—</span>}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                        user.role === 'admin' ? 'bg-[#f5e6c0] text-[#a07828]' : 'bg-stone-100 text-stone-500'
                      }`}>
                        {user.role === 'admin' ? <Shield size={12} /> : <UserIcon size={12} />}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-stone-600 text-sm">
                        <Calendar size={14} className="text-stone-300" />
                        {new Date(user.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(!filteredUsers || filteredUsers.length === 0) && (
              <div className="py-40 text-center">
                <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <UserIcon size={32} className="text-stone-200" />
                </div>
                <h3 className="font-serif text-xl text-stone-800 mb-2">No users found</h3>
                <p className="text-stone-400 text-sm">Try adjusting your search or filters.</p>
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        <div className="px-8 py-6 border-t border-stone-50 flex items-center justify-between">
          <p className="text-xs text-stone-400 font-medium uppercase tracking-widest">
            Showing <span className="text-stone-800 font-bold">{filteredUsers?.length ?? 0}</span> Users
          </p>
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 rounded-xl border border-stone-100 flex items-center justify-center text-stone-400 hover:bg-stone-50 transition-colors disabled:opacity-50" disabled>
              <ChevronLeft size={20} />
            </button>
            <button className="w-10 h-10 rounded-xl bg-stone-900 flex items-center justify-center text-white shadow-lg shadow-stone-200">
              1
            </button>
            <button className="w-10 h-10 rounded-xl border border-stone-100 flex items-center justify-center text-stone-400 hover:bg-stone-50 transition-colors disabled:opacity-50" disabled>
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
