import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck,
  ShieldAlert,
  Loader2,
  Check,
  XCircle
} from 'lucide-react';
import { supabase, UserProfile } from '@/src/lib/supabase';
import { useLanguage } from '@/src/context/LanguageContext';
import { useToast } from '@/src/context/ToastContext';

export function CitizenManagement() {
  const { lang } = useLanguage();
  const { showToast } = useToast();
  const [citizens, setCitizens] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<'all' | 'verified' | 'unverified'>('all');

  useEffect(() => {
    fetchCitizens();
  }, []);

  const fetchCitizens = async () => {
    setLoading(true);
    try {
      // Demo Mode Fallback
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const isConfigured = supabaseUrl && !supabaseUrl.includes('YOUR_SUPABASE_URL') && !supabaseUrl.includes('bqxevbmjqvogebmlbidx');

      if (!isConfigured) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const demoCitizens = JSON.parse(localStorage.getItem('demo_citizens') || '[]');
        const baseCitizens: UserProfile[] = [
          {
            id: '1',
            first_name: 'Juma',
            middle_name: 'A',
            last_name: 'Msuya',
            email: 'juma@example.com',
            phone: '0712345678',
            role: 'citizen',
            is_verified: true,
            region: 'Dar es Salaam',
            district: 'Ilala',
            nida_number: '19900101-12345-00001-12'
          },
          {
            id: '2',
            first_name: 'Asha',
            middle_name: 'K',
            last_name: 'Bakari',
            email: 'asha@example.com',
            phone: '0787654321',
            role: 'citizen',
            is_verified: false,
            region: 'Arusha',
            district: 'Arusha MJ',
            nida_number: '19920515-54321-00002-23'
          }
        ];
        setCitizens([...baseCitizens, ...demoCitizens]);
        return;
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'citizen')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCitizens(data || []);
    } catch (error) {
      console.error('Error fetching citizens:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (citizenId: string) => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const isConfigured = supabaseUrl && !supabaseUrl.includes('YOUR_SUPABASE_URL') && !supabaseUrl.includes('bqxevbmjqvogebmlbidx');

      if (!isConfigured) {
        const demoCitizens = JSON.parse(localStorage.getItem('demo_citizens') || '[]');
        const updated = demoCitizens.map((c: any) => 
          c.id === citizenId ? { ...c, is_verified: true } : c
        );
        localStorage.setItem('demo_citizens', JSON.stringify(updated));
        setCitizens(prev => prev.map(c => c.id === citizenId ? { ...c, is_verified: true } : c));
        return;
      }

      const { error } = await supabase
        .from('users')
        .update({ is_verified: true })
        .eq('id', citizenId);

      if (error) throw error;
      setCitizens(prev => prev.map(c => c.id === citizenId ? { ...c, is_verified: true } : c));
      showToast(lang === 'sw' ? 'Mwananchi amethibitishwa.' : 'Citizen verified successfully.', 'success');
    } catch (error: any) {
      showToast(error.message, 'error');
    }
  };

  const handleDecline = async (citizenId: string) => {
    if (!confirm(lang === 'sw' ? 'Je, una uhakika unataka kukataa uhakiki huu?' : 'Are you sure you want to decline this verification?')) return;
    
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const isConfigured = supabaseUrl && !supabaseUrl.includes('YOUR_SUPABASE_URL') && !supabaseUrl.includes('bqxevbmjqvogebmlbidx');

      if (!isConfigured) {
        const demoCitizens = JSON.parse(localStorage.getItem('demo_citizens') || '[]');
        const updated = demoCitizens.filter((c: any) => c.id !== citizenId);
        localStorage.setItem('demo_citizens', JSON.stringify(updated));
        setCitizens(prev => prev.filter(c => c.id !== citizenId));
        return;
      }

      // For decline, we might just delete the unverified user or mark them as rejected
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', citizenId);

      if (error) throw error;
      setCitizens(prev => prev.filter(c => c.id !== citizenId));
      showToast(lang === 'sw' ? 'Uhakiki umekataliwa.' : 'Verification declined.', 'info');
    } catch (error: any) {
      showToast(error.message, 'error');
    }
  };

  const filteredCitizens = citizens.filter(c => {
    const matchesSearch = 
      c.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.nida_number?.includes(searchQuery);
    
    const matchesFilter = 
      filter === 'all' || 
      (filter === 'verified' && c.is_verified) || 
      (filter === 'unverified' && !c.is_verified);

    return matchesSearch && matchesFilter;
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight">
            {lang === 'sw' ? 'Usimamizi wa Wananchi' : 'Citizen Management'}
          </h1>
          <p className="text-stone-500 font-medium">
            {lang === 'sw' ? 'Tazama na dhibiti watumiaji wote waliosajiliwa' : 'View and manage all registered citizens'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input 
              type="text"
              placeholder={lang === 'sw' ? 'Tafuta...' : 'Search...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 h-12 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all w-full sm:w-64 font-medium"
            />
          </div>
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="h-12 px-4 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
          >
            <option value="all">{lang === 'sw' ? 'Wote' : 'All'}</option>
            <option value="verified">{lang === 'sw' ? 'Waliothibitishwa' : 'Verified'}</option>
            <option value="unverified">{lang === 'sw' ? 'Wasiohakikiwa' : 'Unverified'}</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-stone-100 shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-emerald-600" size={40} />
            <p className="text-stone-500 font-bold">{lang === 'sw' ? 'Inapakia...' : 'Loading citizens...'}</p>
          </div>
        ) : filteredCitizens.length === 0 ? (
          <div className="p-20 text-center">
            <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="text-stone-300" size={40} />
            </div>
            <h3 className="text-xl font-bold text-stone-900">{lang === 'sw' ? 'Hakuna Wananchi' : 'No Citizens Found'}</h3>
            <p className="text-stone-500 font-medium">{lang === 'sw' ? 'Jaribu kubadilisha vigezo vya utafutaji' : 'Try adjusting your search or filter'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-100">
                  <th className="px-6 py-4 text-[10px] font-black text-stone-400 uppercase tracking-widest">{lang === 'sw' ? 'Mwananchi' : 'Citizen'}</th>
                  <th className="px-6 py-4 text-[10px] font-black text-stone-400 uppercase tracking-widest">{lang === 'sw' ? 'Mawasiliano' : 'Contact'}</th>
                  <th className="px-6 py-4 text-[10px] font-black text-stone-400 uppercase tracking-widest">{lang === 'sw' ? 'Mahali' : 'Location'}</th>
                  <th className="px-6 py-4 text-[10px] font-black text-stone-400 uppercase tracking-widest">{lang === 'sw' ? 'Hali' : 'Status'}</th>
                  <th className="px-6 py-4 text-[10px] font-black text-stone-400 uppercase tracking-widest"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {filteredCitizens.map((citizen) => (
                  <tr key={citizen.id} className="hover:bg-stone-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 font-bold">
                          {citizen.first_name[0]}{citizen.last_name[0]}
                        </div>
                        <div>
                          <p className="font-bold text-stone-900">{citizen.first_name} {citizen.last_name}</p>
                          <p className="text-xs text-stone-500 font-medium">NIDA: {citizen.nida_number || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-stone-600 font-medium">
                          <Mail size={14} className="text-stone-400" />
                          {citizen.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-stone-600 font-medium">
                          <Phone size={14} className="text-stone-400" />
                          {citizen.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-stone-600 font-medium">
                        <MapPin size={14} className="text-stone-400" />
                        {citizen.region}, {citizen.district}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {citizen.is_verified ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold">
                          <ShieldCheck size={14} />
                          {lang === 'sw' ? 'Imehakikiwa' : 'Verified'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-xs font-bold">
                          <ShieldAlert size={14} />
                          {lang === 'sw' ? 'Inasubiri' : 'Pending'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {!citizen.is_verified && (
                          <>
                            <button 
                              onClick={() => handleVerify(citizen.id)}
                              className="p-2 hover:bg-emerald-50 rounded-lg transition-colors text-emerald-600"
                              title={lang === 'sw' ? 'Thibitisha' : 'Verify'}
                            >
                              <Check size={18} />
                            </button>
                            <button 
                              onClick={() => handleDecline(citizen.id)}
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600"
                              title={lang === 'sw' ? 'Kataa' : 'Decline'}
                            >
                              <XCircle size={18} />
                            </button>
                          </>
                        )}
                        <button className="p-2 hover:bg-stone-100 rounded-lg transition-colors text-stone-400">
                          <MoreVertical size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
}
