import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, 
  Plus, 
  Search, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Trash2,
  Edit2,
  FileText,
  DollarSign
} from 'lucide-react';
import { supabase, Service } from '@/src/lib/supabase';
import { useLanguage } from '@/src/context/LanguageContext';
import { useToast } from '@/src/context/ToastContext';
import { cn } from '@/src/lib/utils';
import { formatCurrency } from '@/src/lib/currency';

export function ServiceManagement() {
  const { lang, currency } = useLanguage();
  const { showToast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [processing, setProcessing] = useState(false);

  const [editingService, setEditingService] = useState<Service | null>(null);
  const [newService, setNewService] = useState<Partial<Service>>({
    name: '',
    name_en: '',
    description: '',
    description_en: '',
    fee: 0,
    active: true,
    form_schema: [],
    document_template: {}
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('name', { ascending: true });

    if (!error && data) {
      setServices(data);
    }
    setLoading(false);
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    
    if (editingService) {
      const { error } = await supabase
        .from('services')
        .update({
          name: newService.name,
          name_en: newService.name_en,
          description: newService.description,
          description_en: newService.description_en,
          fee: newService.fee,
          active: newService.active,
          form_schema: newService.form_schema || [],
          document_template: newService.document_template || {}
        })
        .eq('id', editingService.id);

      if (error) {
        showToast(error.message, 'error');
      } else {
        setShowAddModal(false);
        setEditingService(null);
        setNewService({ name: '', name_en: '', description: '', description_en: '', fee: 0, active: true });
        fetchServices();
      }
    } else {
      const { error } = await supabase.from('services').insert({
        name: newService.name,
        name_en: newService.name_en,
        description: newService.description,
        description_en: newService.description_en,
        fee: newService.fee,
        active: newService.active,
        form_schema: newService.form_schema || [],
        document_template: newService.document_template || {}
      });

      if (error) {
        showToast(error.message, 'error');
      } else {
        setShowAddModal(false);
        setNewService({ name: '', name_en: '', description: '', description_en: '', fee: 0, active: true });
        fetchServices();
      }
    }
    setProcessing(false);
  };

  const handleEditClick = (service: Service) => {
    setEditingService(service);
    setNewService({
      name: service.name,
      name_en: service.name_en,
      description: service.description,
      description_en: service.description_en,
      fee: service.fee,
      active: service.active,
      form_schema: service.form_schema,
      document_template: service.document_template
    });
    setShowAddModal(true);
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm(lang === 'sw' ? 'Je, una uhakika unataka kufuta huduma hii?' : 'Are you sure you want to delete this service?')) return;
    const { error } = await supabase.from('services').delete().eq('id', id);
    if (error) showToast(error.message, 'error');
    else fetchServices();
  };

  const toggleServiceStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('services')
      .update({ active: !currentStatus })
      .eq('id', id);
    
    if (error) showToast(error.message, 'error');
    else fetchServices();
  };

  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.name_en || '').toLowerCase().includes(searchTerm.toLowerCase())
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
            {lang === 'sw' ? 'Usimamizi wa Huduma' : 'Service Management'}
          </h1>
          <p className="text-stone-500 font-medium">
            {lang === 'sw' ? 'Simamia huduma na gharama za maombi' : 'Manage services and application fees'}
          </p>
        </div>
        <button 
          onClick={() => {
            setEditingService(null);
            setNewService({ name: '', name_en: '', description: '', description_en: '', fee: 0, active: true, form_schema: [], document_template: {} });
            setShowAddModal(true);
          }}
          className="h-14 px-8 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          {lang === 'sw' ? 'Ongeza Huduma Mpya' : 'Add New Service'}
        </button>
      </div>

      <div className="bg-white rounded-[32px] border border-stone-100 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-stone-100 bg-stone-50/50 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
            <input 
              type="text"
              placeholder={lang === 'sw' ? 'Tafuta huduma...' : 'Search services...'}
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
                <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-widest">{lang === 'sw' ? 'Huduma' : 'Service'}</th>
                <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-widest">{lang === 'sw' ? 'Gharama' : 'Fee'}</th>
                <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-widest">{lang === 'sw' ? 'Hali' : 'Status'}</th>
                <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-widest text-right">{lang === 'sw' ? 'Vitendo' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <Loader2 className="animate-spin mx-auto text-emerald-600 mb-2" />
                    <p className="text-stone-400 font-bold">{lang === 'sw' ? 'Inapakia...' : 'Loading...'}</p>
                  </td>
                </tr>
              ) : filteredServices.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-stone-400 font-bold">
                    {lang === 'sw' ? 'Hakuna huduma zilizopatikana.' : 'No services found.'}
                  </td>
                </tr>
              ) : filteredServices.map((service) => (
                <tr key={service.id} className="hover:bg-stone-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-500 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                        <FileText size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-stone-900">{lang === 'sw' ? service.name : (service.name_en || service.name)}</p>
                        <p className="text-xs text-stone-400 line-clamp-1">{lang === 'sw' ? service.description : (service.description_en || service.description)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-stone-900">
                    {formatCurrency(service.fee, currency)}
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => toggleServiceStatus(service.id, service.active)}
                      className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all",
                        service.active ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-red-50 text-red-600 border-red-100"
                      )}
                    >
                      {service.active ? (lang === 'sw' ? 'Inatumika' : 'Active') : (lang === 'sw' ? 'Haiko' : 'Inactive')}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleEditClick(service)}
                        className="p-2 hover:bg-stone-100 rounded-lg text-stone-400 hover:text-stone-900 transition-all"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeleteService(service.id)}
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
          ) : filteredServices.length === 0 ? (
            <div className="p-12 text-center text-stone-400 font-bold">
              {lang === 'sw' ? 'Hakuna huduma zilizopatikana.' : 'No services found.'}
            </div>
          ) : filteredServices.map((service) => (
            <div key={service.id} className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-500">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900">{lang === 'sw' ? service.name : (service.name_en || service.name)}</h3>
                    <p className="text-[10px] text-stone-400">{lang === 'sw' ? service.description : (service.description_en || service.description)}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button 
                    onClick={() => handleEditClick(service)}
                    className="p-2 hover:bg-stone-100 rounded-lg text-stone-400"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={() => handleDeleteService(service.id)}
                    className="p-2 hover:bg-red-50 rounded-lg text-stone-400"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between bg-stone-50 p-3 rounded-xl border border-stone-100">
                <div>
                  <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">{lang === 'sw' ? 'Gharama' : 'Fee'}</p>
                  <p className="font-bold text-stone-900">{formatCurrency(service.fee, currency)}</p>
                </div>
                <button 
                  onClick={() => toggleServiceStatus(service.id, service.active)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all shadow-sm",
                    service.active ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-white text-red-600 border-red-100"
                  )}
                >
                  {service.active ? (lang === 'sw' ? 'Inatumika' : 'Active') : (lang === 'sw' ? 'Haiko' : 'Inactive')}
                </button>
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
              className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="px-8 py-6 border-b border-stone-100 flex items-center justify-between">
                <h2 className="text-xl font-black text-stone-900 tracking-tight">
                  {editingService 
                    ? (lang === 'sw' ? 'Hariri Huduma' : 'Edit Service')
                    : (lang === 'sw' ? 'Ongeza Huduma Mpya' : 'Add New Service')}
                </h2>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-400">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddService} className="p-8 space-y-6 overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">{lang === 'sw' ? 'Jina (Kiswahili)' : 'Name (Swahili)'}</label>
                    <input 
                      type="text"
                      required
                      value={newService.name}
                      onChange={(e) => setNewService({...newService, name: e.target.value})}
                      className="w-full h-14 px-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">{lang === 'sw' ? 'Jina (English)' : 'Name (English)'}</label>
                    <input 
                      type="text"
                      required
                      value={newService.name_en}
                      onChange={(e) => setNewService({...newService, name_en: e.target.value})}
                      className="w-full h-14 px-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">{lang === 'sw' ? 'Maelezo (Kiswahili)' : 'Description (Swahili)'}</label>
                  <textarea 
                    required
                    value={newService.description}
                    onChange={(e) => setNewService({...newService, description: e.target.value})}
                    className="w-full h-32 p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all font-medium resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">{lang === 'sw' ? 'Gharama (TZS)' : 'Fee (TZS)'}</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
                    <input 
                      type="number"
                      required
                      value={newService.fee}
                      onChange={(e) => setNewService({...newService, fee: Number(e.target.value)})}
                      className="w-full h-14 pl-12 pr-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                    />
                  </div>
                </div>

                <button 
                  disabled={processing}
                  className="w-full h-16 bg-stone-900 text-white rounded-2xl font-bold text-lg hover:bg-stone-800 transition-all flex items-center justify-center gap-2 shadow-xl shadow-stone-200 disabled:opacity-50"
                  type="submit"
                >
                  {processing ? <Loader2 className="animate-spin" /> : (
                    editingService 
                      ? (lang === 'sw' ? 'Hifadhi Mabadiliko' : 'Save Changes')
                      : (lang === 'sw' ? 'Ongeza Huduma' : 'Add Service')
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
