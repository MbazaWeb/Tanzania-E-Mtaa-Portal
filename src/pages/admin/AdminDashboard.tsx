import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Building2, 
  MapPin, 
  Settings, 
  TrendingUp, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  Shield
} from 'lucide-react';
import { supabase } from '@/src/lib/supabase';
import { StatCard } from '@/src/components/ui/StatCard';
import { useLanguage } from '@/src/context/LanguageContext';

export function AdminDashboard() {
  const { lang } = useLanguage();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStaff: 0,
    totalServices: 0,
    totalApplications: 0,
    approvedApplications: 0,
    pendingApplications: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      // Demo Mode Fallback
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const isConfigured = supabaseUrl && !supabaseUrl.includes('YOUR_SUPABASE_URL') && !supabaseUrl.includes('bqxevbmjqvogebmlbidx');

      if (!isConfigured) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setStats({
          totalUsers: 1250,
          totalStaff: 45,
          totalServices: 12,
          totalApplications: 3420,
          approvedApplications: 2850,
          pendingApplications: 420,
          totalRevenue: 45600000
        });
        return;
      }

      const [usersCount, staffCount, servicesCount, appsCount, approvedCount, pendingCount, revenueData] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'citizen'),
        supabase.from('users').select('*', { count: 'exact', head: true }).neq('role', 'citizen'),
        supabase.from('services').select('*', { count: 'exact', head: true }),
        supabase.from('applications').select('*', { count: 'exact', head: true }),
        supabase.from('applications').select('*', { count: 'exact', head: true }).in('status', ['approved', 'issued']),
        supabase.from('applications').select('*', { count: 'exact', head: true }).eq('status', 'submitted'),
        supabase.from('payments').select('amount').in('status', ['completed', 'paid', 'success'])
      ]);

      const totalRevenue = revenueData.data?.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0) || 0;

      setStats({
        totalUsers: usersCount.count || 0,
        totalStaff: staffCount.count || 0,
        totalServices: servicesCount.count || 0,
        totalApplications: appsCount.count || 0,
        approvedApplications: approvedCount.count || 0,
        pendingApplications: pendingCount.count || 0,
        totalRevenue
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight">
            {lang === 'sw' ? 'Dashibodi ya Msimamizi' : 'Admin Dashboard'}
          </h1>
          <p className="text-stone-500 font-medium">
            {lang === 'sw' ? 'Muhtasari wa mfumo mzima wa E-Mtaa' : 'System-wide overview of E-Mtaa'}
          </p>
        </div>
        <button 
          onClick={fetchStats}
          className="p-3 bg-white border border-stone-200 rounded-2xl shadow-sm hover:bg-stone-50 transition-all"
        >
          <TrendingUp size={20} className="text-emerald-600" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <StatCard 
          icon={<Users className="text-blue-500" />} 
          label={lang === 'sw' ? "Wananchi" : "Citizens"} 
          value={stats.totalUsers} 
        />
        <StatCard 
          icon={<Shield className="text-purple-500" />} 
          label={lang === 'sw' ? "Watumishi" : "Staff"} 
          value={stats.totalStaff} 
        />
        <StatCard 
          icon={<Building2 className="text-amber-500" />} 
          label={lang === 'sw' ? "Huduma" : "Services"} 
          value={stats.totalServices} 
        />
        <StatCard 
          icon={<FileText className="text-blue-600" />} 
          label={lang === 'sw' ? "Maombi" : "Applications"} 
          value={stats.totalApplications} 
        />
        <StatCard 
          icon={<TrendingUp className="text-emerald-500" />} 
          label={lang === 'sw' ? "Mapato (TZS)" : "Revenue (TZS)"} 
          value={stats.totalRevenue.toLocaleString()} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-[32px] p-8 border border-stone-100 shadow-xl">
          <h3 className="text-xl font-bold text-stone-900 mb-6 flex items-center gap-2">
            <CheckCircle size={20} className="text-emerald-600" />
            {lang === 'sw' ? 'Hali ya Maombi' : 'Application Status'}
          </h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
              <span className="font-bold text-emerald-900">{lang === 'sw' ? 'Zilizoidhinishwa' : 'Approved'}</span>
              <span className="text-2xl font-black text-emerald-600">{stats.approvedApplications}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-amber-50 rounded-2xl border border-amber-100">
              <span className="font-bold text-amber-900">{lang === 'sw' ? 'Zinasubiri' : 'Pending'}</span>
              <span className="text-2xl font-black text-amber-600">{stats.pendingApplications}</span>
            </div>
          </div>
        </div>

        <div className="bg-stone-900 rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10 space-y-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Settings size={20} className="text-emerald-400" />
              {lang === 'sw' ? 'Mipangilio ya Haraka' : 'Quick Actions'}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <button className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 hover:bg-white/20 transition-all text-left">
                <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1">{lang === 'sw' ? 'Huduma' : 'Services'}</p>
                <p className="text-sm font-bold">{lang === 'sw' ? 'Ongeza Huduma' : 'Add Service'}</p>
              </button>
              <button className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 hover:bg-white/20 transition-all text-left">
                <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1">{lang === 'sw' ? 'Watumishi' : 'Staff'}</p>
                <p className="text-sm font-bold">{lang === 'sw' ? 'Sajili Mtumishi' : 'Register Staff'}</p>
              </button>
            </div>
          </div>
          <Building2 className="absolute right-[-40px] bottom-[-40px] h-64 w-64 text-white/5 rotate-12" />
        </div>
      </div>
    </motion.div>
  );
}
