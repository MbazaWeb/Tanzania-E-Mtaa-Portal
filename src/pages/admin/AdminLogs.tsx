import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Search, 
  Filter, 
  Download, 
  Clock, 
  User, 
  Shield, 
  AlertCircle,
  TrendingUp,
  BarChart3,
  Users,
  FileText
} from 'lucide-react';
import { supabase } from '@/src/lib/supabase';
import { useLanguage } from '@/src/context/LanguageContext';
import { cn } from '@/src/lib/utils';
import { StatCard } from '@/src/components/ui/StatCard';

interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  details: string;
  ip_address?: string;
  created_at: string;
  users?: {
    first_name: string;
    last_name: string;
    role: string;
  };
}

export function AdminLogs() {
  const { lang } = useLanguage();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({
    activeUsers: 0,
    todayTransactions: 0,
    performance: 99.9
  });

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [activeUsersCount, todayAppsCount] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('applications').select('*', { count: 'exact', head: true }).gte('created_at', today.toISOString())
      ]);

      setStats({
        activeUsers: activeUsersCount.count || 0,
        todayTransactions: todayAppsCount.count || 0,
        performance: 99.9
      });
    } catch (error) {
      console.error('Error fetching log stats:', error);
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*, users(first_name, last_name, role)')
        .order('created_at', { ascending: false })
        .limit(100);

      if (!error && data) {
        setLogs(data as any);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => 
    (log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${log.users?.first_name} ${log.users?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filter === 'all' || log.users?.role === filter)
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight">
            {lang === 'sw' ? 'Kumbukumbu za Mfumo' : 'System Activity Logs'}
          </h1>
          <p className="text-stone-500 font-medium">
            {lang === 'sw' ? 'Fuatilia shughuli zote zinazofanyika kwenye mfumo' : 'Monitor all activities happening within the system'}
          </p>
        </div>
        <div className="flex gap-3">
          <button className="h-12 px-6 bg-white border border-stone-200 rounded-xl font-bold text-stone-600 hover:bg-stone-50 transition-all flex items-center gap-2">
            <Download size={18} />
            {lang === 'sw' ? 'Pakua Ripoti' : 'Export Logs'}
          </button>
        </div>
      </div>

      {/* Performance Trends */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <TrendingUp size={24} />
            </div>
            <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">Stable</span>
          </div>
          <p className="text-stone-500 text-sm font-bold uppercase tracking-widest">{lang === 'sw' ? 'Ufanisi wa Mfumo' : 'System Performance'}</p>
          <p className="text-3xl font-black text-stone-900 mt-1">{stats.performance}%</p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
              <Users size={24} />
            </div>
            <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">Live</span>
          </div>
          <p className="text-stone-500 text-sm font-bold uppercase tracking-widest">{lang === 'sw' ? 'Watumiaji Amilifu' : 'Active Users'}</p>
          <p className="text-3xl font-black text-stone-900 mt-1">{stats.activeUsers.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <FileText size={24} />
            </div>
            <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">Today</span>
          </div>
          <p className="text-stone-500 text-sm font-bold uppercase tracking-widest">{lang === 'sw' ? 'Miamala ya Leo' : 'Today\'s Transactions'}</p>
          <p className="text-3xl font-black text-stone-900 mt-1">{stats.todayTransactions.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-stone-100 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-stone-100 bg-stone-50/50 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
            <input 
              type="text"
              placeholder={lang === 'sw' ? 'Tafuta kumbukumbu...' : 'Search logs...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 pl-12 pr-4 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-900 transition-all font-medium"
            />
          </div>
          <div className="flex gap-2">
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="h-12 px-4 bg-white border border-stone-200 rounded-xl font-bold text-stone-600 focus:ring-2 focus:ring-stone-900 transition-all"
            >
              <option value="all">{lang === 'sw' ? 'Wote' : 'All Roles'}</option>
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
              <option value="citizen">Citizen</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50/50 border-b border-stone-100">
                <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-widest">{lang === 'sw' ? 'Muda' : 'Timestamp'}</th>
                <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-widest">{lang === 'sw' ? 'Mtumiaji' : 'User'}</th>
                <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-widest">{lang === 'sw' ? 'Kitendo' : 'Action'}</th>
                <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-widest">{lang === 'sw' ? 'Maelezo' : 'Details'}</th>
                <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-widest">{lang === 'sw' ? 'IP Address' : 'IP Address'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="animate-spin h-8 w-8 border-4 border-stone-900 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-stone-400 font-bold">{lang === 'sw' ? 'Inapakia...' : 'Loading logs...'}</p>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-stone-400 font-bold">
                    {lang === 'sw' ? 'Hakuna kumbukumbu zilizopatikana.' : 'No logs found.'}
                  </td>
                </tr>
              ) : filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-stone-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-stone-500 font-medium text-sm">
                      <Clock size={14} />
                      {new Date(log.created_at).toLocaleString(lang === 'sw' ? 'sw-TZ' : 'en-US')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black",
                        log.users?.role === 'admin' ? "bg-red-50 text-red-600" : 
                        log.users?.role === 'staff' ? "bg-blue-50 text-blue-600" : "bg-stone-100 text-stone-600"
                      )}>
                        {log.users?.role === 'admin' ? 'AD' : log.users?.role === 'staff' ? 'ST' : 'CZ'}
                      </div>
                      <div>
                        <p className="font-bold text-stone-900">{log.users?.first_name} {log.users?.last_name}</p>
                        <p className="text-[10px] uppercase font-black tracking-widest text-stone-400">{log.users?.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border",
                      log.action.includes('LOGIN') ? "bg-blue-50 text-blue-600 border-blue-100" :
                      log.action.includes('APPROVED') ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                      log.action.includes('REJECTED') ? "bg-red-50 text-red-600 border-red-100" : "bg-stone-50 text-stone-500 border-stone-100"
                    )}>
                      {log.action.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-stone-600 line-clamp-1">{log.details}</p>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-xs font-mono text-stone-400">{log.ip_address || 'N/A'}</code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
