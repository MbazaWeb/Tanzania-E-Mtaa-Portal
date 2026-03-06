import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  Plus, 
  Search, 
  MapPin, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Trash2,
  Edit2
} from 'lucide-react';
import { supabase, VirtualOffice } from '@/src/lib/supabase';
import { useLanguage } from '@/src/context/LanguageContext';
import { useToast } from '@/src/context/ToastContext';
import { cn } from '@/src/lib/utils';

export function OfficeManagement() {
  const { lang } = useLanguage();
  const { showToast } = useToast();
  const [offices, setOffices] = useState<VirtualOffice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [processing, setProcessing] = useState(false);

  const [editingOffice, setEditingOffice] = useState<VirtualOffice | null>(null);
  const [newOffice, setNewOffice] = useState({
    name: '',
    level: 'region' as 'region' | 'district',
    region: '',
    district: ''
  });

  useEffect(() => {
    fetchOffices();
  }, []);

  const fetchOffices = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('offices')
      .select('*')
      .order('name', { ascending: true });

    if (!error && data) {
      setOffices(data);
    }
    setLoading(false);
  };

  const handleAddOffice = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    
    if (editingOffice) {
      const { error } = await supabase
        .from('offices')
        .update({
          name: newOffice.name,
          level: newOffice.level,
          region: newOffice.region,
          district: newOffice.level === 'district' ? newOffice.district : null
        })
        .eq('id', editingOffice.id);

      if (error) {
        showToast(error.message, 'error');
      } else {
        setShowAddModal(false);
        setEditingOffice(null);
        setNewOffice({ name: '', level: 'region', region: '', district: '' });
        fetchOffices();
      }
    } else {
      const { error } = await supabase.from('offices').insert({
        name: newOffice.name,
        level: newOffice.level,
        region: newOffice.region,
        district: newOffice.level === 'district' ? newOffice.district : null
      });

      if (error) {
        showToast(error.message, 'error');
      } else {
        setShowAddModal(false);
        setNewOffice({ name: '', level: 'region', region: '', district: '' });
        fetchOffices();
      }
    }
    setProcessing(false);
  };

  const handleEditClick = (office: VirtualOffice) => {
    setEditingOffice(office);
    setNewOffice({
      name: office.name,
      level: office.level,
      region: office.region,
      district: office.district || ''
    });
    setShowAddModal(true);
  };

  const handleDeleteOffice = async (id: string) => {
    if (!confirm(lang === 'sw' ? 'Je, una uhakika unataka kufuta ofisi hii?' : 'Are you sure you want to delete this office?')) return;
    
    const { error } = await supabase.from('offices').delete().eq('id', id);
    if (error) showToast(error.message, 'error');
    else fetchOffices();
  };

  const filteredOffices = offices.filter(o => 
    o.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.region.toLowerCase().includes(searchTerm.toLowerCase())
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
            {lang === 'sw' ? 'Usimamizi wa Ofisi' : 'Office Management'}
          </h1>
          <p className="text-stone-500 font-medium">
            {lang === 'sw' ? 'Simamia ofisi za mikoa na wilaya za E-Mtaa' : 'Manage E-Mtaa regional and district offices'}
          </p>
        </div>
        <button 
          onClick={() => {
            setEditingOffice(null);
            setNewOffice({ name: '', level: 'region', region: '', district: '' });
            setShowAddModal(true);
          }}
          className="h-14 px-8 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          {lang === 'sw' ? 'Sajili Ofisi Mpya' : 'Register New Office'}
        </button>
      </div>

      <div className="bg-white rounded-[32px] border border-stone-100 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-stone-100 bg-stone-50/50 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
            <input 
              type="text"
              placeholder={lang === 'sw' ? 'Tafuta ofisi...' : 'Search offices...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 pl-12 pr-4 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
            />
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50/50 border-b border-stone-100">
                <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-widest">{lang === 'sw' ? 'Jina la Ofisi' : 'Office Name'}</th>
                <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-widest">{lang === 'sw' ? 'Ngazi' : 'Level'}</th>
                <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-widest">{lang === 'sw' ? 'Mkoa' : 'Region'}</th>
                <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-widest">{lang === 'sw' ? 'Wilaya' : 'District'}</th>
                <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-widest text-right">{lang === 'sw' ? 'Vitendo' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Loader2 className="animate-spin mx-auto text-emerald-600 mb-2" />
                    <p className="text-stone-400 font-bold">{lang === 'sw' ? 'Inapakia...' : 'Loading...'}</p>
                  </td>
                </tr>
              ) : filteredOffices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-stone-400 font-bold">
                    {lang === 'sw' ? 'Hakuna ofisi zilizopatikana.' : 'No offices found.'}
                  </td>
                </tr>
              ) : filteredOffices.map((office) => (
                <tr key={office.id} className="hover:bg-stone-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-500 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                        <Building2 size={20} />
                      </div>
                      <span className="font-bold text-stone-900">{office.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                      office.level === 'region' ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-purple-50 text-purple-600 border-purple-100"
                    )}>
                      {office.level === 'region' ? (lang === 'sw' ? 'Mkoa' : 'Region') : (lang === 'sw' ? 'Wilaya' : 'District')}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-stone-600">{office.region}</td>
                  <td className="px-6 py-4 font-medium text-stone-600">{office.district || '-'}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleEditClick(office)}
                        className="p-2 hover:bg-stone-100 rounded-lg text-stone-400 hover:text-stone-900 transition-all"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeleteOffice(office.id)}
                        className="p-2 hover:bg-red-50 rounded-lg text-stone-400 hover:text-red-600 transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-stone-50">
          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="animate-spin mx-auto text-emerald-600 mb-2" />
              <p className="text-stone-400 font-bold">{lang === 'sw' ? 'Inapakia...' : 'Loading...'}</p>
            </div>
          ) : filteredOffices.length === 0 ? (
            <div className="p-12 text-center text-stone-400 font-bold">
              {lang === 'sw' ? 'Hakuna ofisi zilizopatikana.' : 'No offices found.'}
            </div>
          ) : filteredOffices.map((office) => (
            <div key={office.id} className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-500">
                    <Building2 size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900">{office.name}</h3>
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border",
                      office.level === 'region' ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-purple-50 text-purple-600 border-purple-100"
                    )}>
                      {office.level === 'region' ? (lang === 'sw' ? 'Mkoa' : 'Region') : (lang === 'sw' ? 'Wilaya' : 'District')}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button 
                    onClick={() => handleEditClick(office)}
                    className="p-2 hover:bg-stone-100 rounded-lg text-stone-400"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={() => handleDeleteOffice(office.id)}
                    className="p-2 hover:bg-red-50 rounded-lg text-stone-400"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-stone-50 p-2 rounded-lg">
                  <p className="text-stone-400 font-bold uppercase tracking-tighter mb-1">{lang === 'sw' ? 'Mkoa' : 'Region'}</p>
                  <p className="font-bold text-stone-700">{office.region}</p>
                </div>
                <div className="bg-stone-50 p-2 rounded-lg">
                  <p className="text-stone-400 font-bold uppercase tracking-tighter mb-1">{lang === 'sw' ? 'Wilaya' : 'District'}</p>
                  <p className="font-bold text-stone-700">{office.district || '-'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="px-8 py-6 border-b border-stone-100 flex items-center justify-between">
                <h2 className="text-xl font-black text-stone-900 tracking-tight">
                  {editingOffice 
                    ? (lang === 'sw' ? 'Hariri Ofisi' : 'Edit Office')
                    : (lang === 'sw' ? 'Sajili Ofisi Mpya' : 'Register New Office')}
                </h2>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-400">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddOffice} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">{lang === 'sw' ? 'Jina la Ofisi' : 'Office Name'}</label>
                  <input 
                    type="text"
                    required
                    value={newOffice.name}
                    onChange={(e) => setNewOffice({...newOffice, name: e.target.value})}
                    className="w-full h-14 px-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                    placeholder={lang === 'sw' ? 'Mf. Ofisi ya Mkoa wa Dar es Salaam' : 'e.g. Dar es Salaam Regional Office'}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">{lang === 'sw' ? 'Ngazi ya Ofisi' : 'Office Level'}</label>
                  <div className="flex gap-4">
                    {['region', 'district'].map((l) => (
                      <button
                        key={l}
                        type="button"
                        onClick={() => setNewOffice({...newOffice, level: l as any})}
                        className={cn(
                          "flex-1 h-14 rounded-2xl font-bold border-2 transition-all",
                          newOffice.level === l ? "bg-emerald-50 border-emerald-600 text-emerald-600" : "bg-white border-stone-100 text-stone-400"
                        )}
                      >
                        {l === 'region' ? (lang === 'sw' ? 'Mkoa' : 'Region') : (lang === 'sw' ? 'Wilaya' : 'District')}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">{lang === 'sw' ? 'Mkoa' : 'Region'}</label>
                    <input 
                      type="text"
                      required
                      value={newOffice.region}
                      onChange={(e) => setNewOffice({...newOffice, region: e.target.value})}
                      className="w-full h-14 px-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                    />
                  </div>
                  {newOffice.level === 'district' && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">{lang === 'sw' ? 'Wilaya' : 'District'}</label>
                      <input 
                        type="text"
                        required
                        value={newOffice.district}
                        onChange={(e) => setNewOffice({...newOffice, district: e.target.value})}
                        className="w-full h-14 px-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                      />
                    </div>
                  )}
                </div>

                <button 
                  disabled={processing}
                  className="w-full h-16 bg-stone-900 text-white rounded-2xl font-bold text-lg hover:bg-stone-800 transition-all flex items-center justify-center gap-2 shadow-xl shadow-stone-200 disabled:opacity-50"
                  type="submit"
                >
                  {processing ? <Loader2 className="animate-spin" /> : (
                    editingOffice 
                      ? (lang === 'sw' ? 'Hifadhi Mabadiliko' : 'Save Changes')
                      : (lang === 'sw' ? 'Sajili Ofisi' : 'Register Office')
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
