import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { Search, Filter, ArrowUpDown, Calendar, CheckCircle, Loader2 } from 'lucide-react';
import { useLanguage } from '@/src/context/LanguageContext';
import { useAuth } from '@/src/context/AuthContext';
import { useToast } from '@/src/context/ToastContext';
import { supabase, Application } from '@/src/lib/supabase';
import { StatusBadge } from '@/src/components/ui/StatusBadge';
import { formatCurrency } from '@/src/lib/currency';
import { DocumentRenderer, DocumentPreview } from '@/src/components/DocumentRenderer';

interface ApplicationsProps {
  applications: Application[];
  onPay: (app: Application) => void;
  onRefresh?: () => void;
}

export function Applications({ applications, onPay, onRefresh }: ApplicationsProps) {
  const { lang, t, currency } = useLanguage();
  const { showToast } = useToast();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [previewApp, setPreviewApp] = useState<Application | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleAccept = async (app: Application) => {
    if (!user) return;
    setProcessingId(app.id);
    try {
      const isBuyer = (app as any).services?.name.includes('Mauziano') && app.form_data.buyer_nida === user.nida_number;
      const isTenant = (app as any).services?.name.includes('PANGISHA') && app.form_data.tenant_nida === user.nida_number;

      const updateData: any = {};
      if (isBuyer) updateData.buyer_accepted = true;
      if (isTenant) updateData.tenant_accepted = true;

      const { error } = await supabase
        .from('applications')
        .update(updateData)
        .eq('id', app.id);

      if (error) throw error;
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error accepting agreement:', error);
      showToast(lang === 'sw' ? 'Imeshindwa kukubali mkataba. Tafadhali jaribu tena.' : 'Failed to accept agreement. Please try again.', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredAndSortedApplications = useMemo(() => {
    return applications
      .filter(app => {
        const serviceName = lang === 'sw' 
          ? (app as any).services?.name 
          : (app as any).services?.name_en || (app as any).services?.name;
        
        const matchesSearch = 
          serviceName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.application_number.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
        
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      });
  }, [applications, searchTerm, statusFilter, sortOrder, lang]);

  const statuses = [
    { value: 'all', label: lang === 'sw' ? 'Zote' : 'All' },
    { value: 'submitted', label: lang === 'sw' ? 'Imetunwa' : 'Submitted' },
    { value: 'paid', label: lang === 'sw' ? 'Imelipiwa' : 'Paid' },
    { value: 'processing', label: lang === 'sw' ? 'Inashughulikiwa' : 'Processing' },
    { value: 'issued', label: lang === 'sw' ? 'Imetolewa' : 'Issued' },
    { value: 'rejected', label: lang === 'sw' ? 'Imekataliwa' : 'Rejected' },
    { value: 'refunded', label: lang === 'sw' ? 'Imerejeshwa' : 'Refunded' }
  ];

  return (
    <motion.div 
      key="applications"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-stone-800">{t.myApplications}</h2>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input 
              type="text"
              placeholder={lang === 'sw' ? 'Tafuta...' : 'Search...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 h-11 bg-white border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 transition-all w-full md:w-64"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 h-11 bg-white border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 transition-all appearance-none"
            >
              {statuses.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          {/* Date Sort */}
          <button 
            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            className="flex items-center gap-2 px-4 h-11 bg-white border border-stone-200 rounded-xl text-sm font-bold text-stone-600 hover:bg-stone-50 transition-all"
          >
            <Calendar size={18} />
            {lang === 'sw' ? 'Tarehe' : 'Date'}
            <ArrowUpDown size={14} className={sortOrder === 'desc' ? 'rotate-180 transition-transform' : 'transition-transform'} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-stone-50 border-b border-stone-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">{t.services}</th>
                <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">{lang === 'sw' ? 'Namba ya Maombi' : 'App Number'}</th>
                <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">{t.date}</th>
                <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">{t.status}</th>
                <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider text-right">{t.action}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredAndSortedApplications.map(app => (
                <tr key={app.id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-stone-800">{lang === 'sw' ? (app as any).services?.name : (app as any).services?.name_en || (app as any).services?.name}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-stone-500 font-mono">{app.application_number}</td>
                  <td className="px-6 py-4 text-sm text-stone-500">{new Date(app.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <StatusBadge status={app.status} lang={lang} />
                      {app.status === 'returned' && app.feedback && (
                        <div className="bg-amber-50 p-2 rounded-lg border border-amber-100 max-w-[200px]">
                          <p className="text-[10px] font-bold text-amber-800 uppercase mb-1">
                            {lang === 'sw' ? 'Marekebisho:' : 'Changes Needed:'}
                          </p>
                          <p className="text-[10px] text-amber-700 italic leading-tight">"{app.feedback}"</p>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {/* Acceptance Logic for Buyer/Tenant */}
                    {user && (
                      (() => {
                        const isBuyer = (app as any).services?.name.includes('Mauziano') && app.form_data.buyer_nida === user.nida_number;
                        const isTenant = (app as any).services?.name.includes('PANGISHA') && app.form_data.tenant_nida === user.nida_number;
                        const alreadyAccepted = isBuyer ? app.buyer_accepted : isTenant ? app.tenant_accepted : false;

                        if ((isBuyer || isTenant) && !alreadyAccepted && app.status !== 'rejected') {
                          return (
                            <button 
                              onClick={() => handleAccept(app)}
                              disabled={processingId === app.id}
                              className="bg-purple-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-purple-700 transition-all shadow-md shadow-purple-200 flex items-center gap-2 ml-auto mb-2"
                            >
                              {processingId === app.id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                              {lang === 'sw' ? 'Kubali Mkataba' : 'Accept Agreement'}
                            </button>
                          );
                        }
                        return null;
                      })()
                    )}

                    {app.status === 'submitted' && (app as any).services?.fee > 0 ? (
                      <button 
                        onClick={() => onPay(app)}
                        className="bg-emerald-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-700 transition-all shadow-md shadow-emerald-200"
                      >
                        {t.payNow} ({formatCurrency((app as any).services?.fee, currency)})
                      </button>
                    ) : app.status === 'issued' ? (
                      <div className="flex items-center justify-end gap-3">
                        <button 
                          onClick={() => setPreviewApp(app)}
                          className="text-stone-600 text-sm font-bold hover:underline"
                        >
                          {lang === 'sw' ? 'Hakiki' : 'Preview'}
                        </button>
                        <PDFDownloadLink 
                          document={<DocumentRenderer application={app} service={(app as any).services} />} 
                          fileName={`Certificate_${app.application_number}.pdf`}
                          className="text-emerald-600 text-sm font-bold hover:underline"
                        >
                          {({ loading }) => loading ? 'Loading...' : (lang === 'sw' ? 'Pakua' : 'Download')}
                        </PDFDownloadLink>
                      </div>
                    ) : (
                      <button className="text-stone-400 text-sm font-bold cursor-not-allowed">
                        {app.status === 'rejected' ? (lang === 'sw' ? 'Imekataliwa' : 'Rejected') : 
                         app.status === 'refunded' ? (lang === 'sw' ? 'Imerejeshwa' : 'Refunded') :
                         (lang === 'sw' ? 'Inashughulikiwa' : 'In Progress')}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-stone-100">
          {filteredAndSortedApplications.map(app => (
            <div key={app.id} className="p-4 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-stone-900">{lang === 'sw' ? (app as any).services?.name : (app as any).services?.name_en || (app as any).services?.name}</p>
                  <p className="text-xs text-stone-500 font-mono mt-1">{app.application_number}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <StatusBadge status={app.status} lang={lang} />
                  {app.status === 'returned' && app.feedback && (
                    <div className="bg-amber-50 p-2 rounded-lg border border-amber-100 text-right max-w-[180px]">
                      <p className="text-[9px] font-bold text-amber-800 uppercase">
                        {lang === 'sw' ? 'Marekebisho:' : 'Changes Needed:'}
                      </p>
                      <p className="text-[9px] text-amber-700 italic">"{app.feedback}"</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between text-xs text-stone-500">
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  {new Date(app.created_at).toLocaleDateString()}
                </div>
              </div>

              <div className="pt-2 border-t border-stone-50 flex flex-wrap gap-2 justify-end">
                {user && (
                  (() => {
                    const isBuyer = (app as any).services?.name.includes('Mauziano') && app.form_data.buyer_nida === user.nida_number;
                    const isTenant = (app as any).services?.name.includes('PANGISHA') && app.form_data.tenant_nida === user.nida_number;
                    const alreadyAccepted = isBuyer ? app.buyer_accepted : isTenant ? app.tenant_accepted : false;

                    if ((isBuyer || isTenant) && !alreadyAccepted && app.status !== 'rejected') {
                      return (
                        <button 
                          onClick={() => handleAccept(app)}
                          disabled={processingId === app.id}
                          className="w-full bg-purple-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-purple-700 transition-all flex items-center justify-center gap-2"
                        >
                          {processingId === app.id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                          {lang === 'sw' ? 'Kubali Mkataba' : 'Accept Agreement'}
                        </button>
                      );
                    }
                    return null;
                  })()
                )}

                {app.status === 'submitted' && (app as any).services?.fee > 0 ? (
                  <button 
                    onClick={() => onPay(app)}
                    className="w-full bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all"
                  >
                    {t.payNow} ({formatCurrency((app as any).services?.fee, currency)})
                  </button>
                ) : app.status === 'issued' ? (
                  <div className="flex items-center gap-4 w-full justify-between">
                    <button 
                      onClick={() => setPreviewApp(app)}
                      className="flex-1 h-10 bg-stone-100 text-stone-600 rounded-xl text-xs font-bold"
                    >
                      {lang === 'sw' ? 'Hakiki' : 'Preview'}
                    </button>
                    <PDFDownloadLink 
                      document={<DocumentRenderer application={app} service={(app as any).services} />} 
                      fileName={`Certificate_${app.application_number}.pdf`}
                      className="flex-1 h-10 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold flex items-center justify-center"
                    >
                      {({ loading }) => loading ? '...' : (lang === 'sw' ? 'Pakua' : 'Download')}
                    </PDFDownloadLink>
                  </div>
                ) : (
                  <div className="text-stone-400 text-xs font-bold py-2">
                    {app.status === 'rejected' ? (lang === 'sw' ? 'Imekataliwa' : 'Rejected') : 
                     app.status === 'refunded' ? (lang === 'sw' ? 'Imerejeshwa' : 'Refunded') :
                     (lang === 'sw' ? 'Inashughulikiwa' : 'In Progress')}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredAndSortedApplications.length === 0 && (
          <div className="px-6 py-12 text-center text-stone-400">
            <div className="flex flex-col items-center gap-2">
              <Search size={32} className="opacity-20" />
              <p>{lang === 'sw' ? 'Hakuna maombi yaliyopatikana.' : 'No applications found.'}</p>
            </div>
          </div>
        )}
      </div>

      {previewApp && (
        <DocumentPreview 
          application={previewApp} 
          service={(previewApp as any).services} 
          onClose={() => setPreviewApp(null)} 
        />
      )}
    </motion.div>
  );
}
