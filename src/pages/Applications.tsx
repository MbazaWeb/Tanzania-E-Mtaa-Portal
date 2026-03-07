import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { Search, Filter, ArrowUpDown, Calendar, CheckCircle, Loader2, X, Eye, FileText, User, MapPin, Phone, Mail, Clock, CreditCard, RefreshCw, Receipt } from 'lucide-react';
import { useLanguage } from '@/src/context/LanguageContext';
import { useAuth } from '@/src/context/AuthContext';
import { useToast } from '@/src/context/ToastContext';
import { supabase, Application } from '@/src/lib/supabase';
import { StatusBadge } from '@/src/components/ui/StatusBadge';
import { formatCurrency } from '@/src/lib/currency';
import { DocumentRenderer, DocumentPreview } from '@/src/components/DocumentRenderer';
import { ReceiptPDF } from '@/src/components/ReceiptPDF';

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
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Helper function to get the correct payment amount
  // For percentage-based services (Mauziano, PANGISHA), use form_data.service_fee
  // For fixed fee services, use services.fee
  const getPaymentAmount = (app: Application): number => {
    const serviceFee = (app as any).services?.fee || 0;
    const formServiceFee = app.form_data?.service_fee;
    
    // If service has a fixed fee > 0, use it
    if (serviceFee > 0) {
      return serviceFee;
    }
    
    // For percentage-based services (Mauziano, PANGISHA), use the calculated service_fee from form_data
    if (formServiceFee && typeof formServiceFee === 'number') {
      return formServiceFee;
    }
    
    // Try to parse if it's a string
    if (formServiceFee && typeof formServiceFee === 'string') {
      const parsed = parseFloat(formServiceFee);
      if (!isNaN(parsed)) {
        return parsed;
      }
    }
    
    return 0;
  };

  // Add effect to check and update approved applications to pending_payment
  useEffect(() => {
    const updateApprovedToPendingPayment = async () => {
      const approvedApps = applications.filter(app => 
        app.status === 'approved'
      );

      for (const app of approvedApps) {
        try {
          const { error } = await supabase
            .from('applications')
            .update({ status: 'pending_payment' })
            .eq('id', app.id)
            .eq('status', 'approved'); // Ensure we only update if still approved

          if (error) throw error;
          
          // Trigger refresh to get updated data
          if (onRefresh) {
            await onRefresh();
          }
        } catch (error) {
          console.error('Error updating approved application to pending payment:', error);
        }
      }
    };

    updateApprovedToPendingPayment();
  }, [applications, onRefresh]);

  // Alternative: Function to manually check and update status
  const checkAndUpdateApprovedStatus = async (app: Application) => {
    if (app.status === 'approved') {
      try {
        const { error } = await supabase
          .from('applications')
          .update({ status: 'pending_payment' })
          .eq('id', app.id)
          .eq('status', 'approved');

        if (error) throw error;
        
        if (onRefresh) {
          await onRefresh();
        }
        
        return true;
      } catch (error) {
        console.error('Error updating approved application:', error);
        return false;
      }
    }
    return false;
  };

  const handleRefresh = async () => {
    if (!onRefresh) return;
    setIsRefreshing(true);
    await onRefresh();
    setTimeout(() => setIsRefreshing(false), 500);
  };

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
      
      // After acceptance, check if we need to move to pending_payment
      await checkAndUpdateApprovedStatus(app);
      
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
    { value: 'submitted', label: lang === 'sw' ? 'Imetumwa' : 'Submitted' },
    { value: 'approved', label: lang === 'sw' ? 'Imeidhinishwa' : 'Approved' },
    { value: 'pending_payment', label: lang === 'sw' ? 'Inasubiri Malipo' : 'Pending Payment' },
    { value: 'paid', label: lang === 'sw' ? 'Imelipiwa' : 'Paid' },
    { value: 'processing', label: lang === 'sw' ? 'Inashughulikiwa' : 'Processing' },
    { value: 'issued', label: lang === 'sw' ? 'Imetolewa' : 'Issued' },
    { value: 'rejected', label: lang === 'sw' ? 'Imekataliwa' : 'Rejected' },
    { value: 'refunded', label: lang === 'sw' ? 'Imerejeshwa' : 'Refunded' }
  ];

  // Transform applications to ensure approved ones show as pending_payment in UI
  const displayApplications = useMemo(() => {
    return filteredAndSortedApplications.map(app => {
      // If status is approved, show as pending_payment for UI (all services now require payment step)
      if (app.status === 'approved') {
        return {
          ...app,
          status: 'pending_payment' as const
        };
      }
      return app;
    });
  }, [filteredAndSortedApplications]);

  return (
    <motion.div 
      key="applications"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-stone-800">{t.myApplications}</h2>
          {onRefresh && (
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-semibold text-sm hover:bg-emerald-100 transition-all disabled:opacity-50"
            >
              <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
              {lang === 'sw' ? 'Onyesha Upya' : 'Refresh'}
            </button>
          )}
        </div>
        
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
              aria-label={lang === 'sw' ? 'Chuja kwa hali' : 'Filter by status'}
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
              {displayApplications.map(app => (
                <tr 
                  key={app.id} 
                  className="hover:bg-stone-50 transition-colors cursor-pointer"
                  onClick={() => setSelectedApp(app)}
                >
                  <td className="px-6 py-4">
                    <p className="font-semibold text-stone-800">{lang === 'sw' ? (app as any).services?.name : (app as any).services?.name_en || (app as any).services?.name}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-stone-500 font-mono">{app.application_number}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <p className="text-sm text-stone-600">{new Date(app.created_at).toLocaleDateString()}</p>
                      <p className="text-xs text-stone-400">{new Date(app.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <StatusBadge status={app.status} lang={lang} />
                      {app.status === 'returned' && app.feedback && (
                        <div className="bg-amber-50 p-2 rounded-lg border border-amber-100 max-w-50">
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

                    {(app.status === 'submitted' || app.status === 'pending_payment') && getPaymentAmount(app) > 0 ? (
                      <button 
                        onClick={() => onPay(app)}
                        className="bg-emerald-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-700 transition-all shadow-md shadow-emerald-200"
                      >
                        {t.payNow} ({formatCurrency(getPaymentAmount(app), currency)})
                      </button>
                    ) : app.status === 'issued' ? (
                      <div className="flex items-center justify-end gap-3">
                        <PDFDownloadLink 
                          document={
                            <ReceiptPDF 
                              application={app} 
                              paymentData={{
                                transaction_id: app.form_data?.payment_data?.transaction_id || `TXN-${app.id.slice(0, 8).toUpperCase()}`,
                                amount: getPaymentAmount(app),
                                payment_method: app.form_data?.payment_data?.payment_method || 'M-Pesa',
                                paid_at: app.form_data?.payment_data?.paid_at || new Date().toISOString()
                              }}
                              lang={lang}
                            />
                          } 
                          fileName={`Receipt_${app.application_number}.pdf`}
                          className="text-amber-600 text-sm font-bold hover:underline"
                        >
                          {({ loading }) => loading ? '...' : (lang === 'sw' ? 'Risiti' : 'Receipt')}
                        </PDFDownloadLink>
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
                          {({ loading }) => loading ? '...' : (lang === 'sw' ? 'Pakua' : 'Download')}
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
          {displayApplications.map(app => (
            <div 
              key={app.id} 
              className="p-4 space-y-4 cursor-pointer hover:bg-stone-50 transition-colors"
              onClick={() => setSelectedApp(app)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-stone-900">{lang === 'sw' ? (app as any).services?.name : (app as any).services?.name_en || (app as any).services?.name}</p>
                  <p className="text-xs text-stone-500 font-mono mt-1">{app.application_number}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <StatusBadge status={app.status} lang={lang} />
                  {app.status === 'returned' && app.feedback && (
                    <div className="bg-amber-50 p-2 rounded-lg border border-amber-100 text-right max-w-45">
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

                {(app.status === 'submitted' || app.status === 'pending_payment') && getPaymentAmount(app) > 0 ? (
                  <button 
                    onClick={() => onPay(app)}
                    className="w-full bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all"
                  >
                    {t.payNow} ({formatCurrency(getPaymentAmount(app), currency)})
                  </button>
                ) : app.status === 'issued' ? (
                  <div className="space-y-2">
                    {/* Receipt Download */}
                    <PDFDownloadLink 
                      document={
                        <ReceiptPDF 
                          application={app} 
                          paymentData={{
                            transaction_id: app.form_data?.payment_data?.transaction_id || `TXN-${app.id.slice(0, 8).toUpperCase()}`,
                            amount: getPaymentAmount(app),
                            payment_method: app.form_data?.payment_data?.payment_method || 'M-Pesa',
                            paid_at: app.form_data?.payment_data?.paid_at || new Date().toISOString()
                          }}
                          lang={lang}
                        />
                      } 
                      fileName={`Receipt_${app.application_number}.pdf`}
                      className="w-full h-10 bg-amber-50 text-amber-600 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
                    >
                      {({ loading }) => (
                        <>
                          <Receipt size={14} />
                          {loading ? '...' : (lang === 'sw' ? 'Pakua Risiti' : 'Download Receipt')}
                        </>
                      )}
                    </PDFDownloadLink>
                    {/* Document Preview & Download */}
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
                        {({ loading }) => loading ? '...' : (lang === 'sw' ? 'Pakua Hati' : 'Download')}
                      </PDFDownloadLink>
                    </div>
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

        {displayApplications.length === 0 && (
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

      {/* Application Details Modal */}
      <AnimatePresence>
        {selectedApp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedApp(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-linear-to-r from-emerald-600 to-emerald-700 text-white p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold">
                      {lang === 'sw' ? (selectedApp as any).services?.name : (selectedApp as any).services?.name_en || (selectedApp as any).services?.name}
                    </h2>
                    <p className="text-emerald-100 font-mono mt-1 text-sm">{selectedApp.application_number}</p>
                  </div>
                  <button 
                    onClick={() => setSelectedApp(null)}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    aria-label={lang === 'sw' ? 'Funga' : 'Close'}
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="mt-4">
                  <StatusBadge status={selectedApp.status} lang={lang} />
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                {/* Application Info */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-stone-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-stone-500 text-xs mb-1">
                      <Calendar size={14} />
                      {lang === 'sw' ? 'Tarehe ya Kuwasilisha' : 'Submission Date'}
                    </div>
                    <p className="font-semibold text-stone-800">{new Date(selectedApp.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="bg-stone-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-stone-500 text-xs mb-1">
                      <CreditCard size={14} />
                      {lang === 'sw' ? 'Ada ya Huduma' : 'Service Fee'}
                    </div>
                    <p className="font-semibold text-stone-800">
                      {formatCurrency(getPaymentAmount(selectedApp), currency)}
                    </p>
                  </div>
                </div>

                {/* Feedback for returned applications */}
                {selectedApp.status === 'returned' && selectedApp.feedback && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                    <p className="text-sm font-bold text-amber-800 mb-1">
                      {lang === 'sw' ? 'Marekebisho Yanayohitajika:' : 'Changes Required:'}
                    </p>
                    <p className="text-amber-700">{selectedApp.feedback}</p>
                  </div>
                )}

                {/* Form Data Details */}
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-stone-700 mb-3 flex items-center gap-2">
                    <FileText size={16} className="text-emerald-600" />
                    {lang === 'sw' ? 'Taarifa za Maombi' : 'Application Details'}
                  </h3>
                  <div className="bg-stone-50 rounded-xl p-4 space-y-3">
                    {Object.entries(selectedApp.form_data || {}).map(([key, value]) => {
                      // Skip internal/technical fields
                      if (key.startsWith('_') || key === 'timestamp') return null;
                      
                      // Format key for display
                      const displayKey = key
                        .replace(/_/g, ' ')
                        .replace(/([A-Z])/g, ' $1')
                        .replace(/^./, str => str.toUpperCase());
                      
                      return (
                        <div key={key} className="flex justify-between items-start py-2 border-b border-stone-100 last:border-0">
                          <span className="text-sm text-stone-500 capitalize">{displayKey}</span>
                          <span className="text-sm font-medium text-stone-800 text-right max-w-xs truncate">
                            {typeof value === 'object' ? JSON.stringify(value) : String(value || '-')}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Timestamps */}
                {(selectedApp.approved_at || selectedApp.paid_at || selectedApp.issued_at) && (
                  <div className="mb-6">
                    <h3 className="text-sm font-bold text-stone-700 mb-3 flex items-center gap-2">
                      <Clock size={16} className="text-emerald-600" />
                      {lang === 'sw' ? 'Hatua za Maendeleo' : 'Progress Timeline'}
                    </h3>
                    <div className="bg-stone-50 rounded-xl p-4 space-y-2">
                      {selectedApp.approved_at && (
                        <div className="flex justify-between text-sm">
                          <span className="text-stone-500">{lang === 'sw' ? 'Imeidhinishwa:' : 'Approved:'}</span>
                          <span className="font-medium text-stone-800">{new Date(selectedApp.approved_at).toLocaleString()}</span>
                        </div>
                      )}
                      {selectedApp.paid_at && (
                        <div className="flex justify-between text-sm">
                          <span className="text-stone-500">{lang === 'sw' ? 'Imelipwa:' : 'Paid:'}</span>
                          <span className="font-medium text-stone-800">{new Date(selectedApp.paid_at).toLocaleString()}</span>
                        </div>
                      )}
                      {selectedApp.issued_at && (
                        <div className="flex justify-between text-sm">
                          <span className="text-stone-500">{lang === 'sw' ? 'Imetolewa:' : 'Issued:'}</span>
                          <span className="font-medium text-stone-800">{new Date(selectedApp.issued_at).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer / Actions */}
              <div className="border-t border-stone-100 p-4 bg-stone-50">
                {/* Accept Button for Buyer/Tenant */}
                {user && (() => {
                  const isBuyer = (selectedApp as any).services?.name.includes('Mauziano') && selectedApp.form_data.buyer_nida === user.nida_number;
                  const isTenant = (selectedApp as any).services?.name.includes('PANGISHA') && selectedApp.form_data.tenant_nida === user.nida_number;
                  const alreadyAccepted = isBuyer ? selectedApp.buyer_accepted : isTenant ? selectedApp.tenant_accepted : false;

                  if ((isBuyer || isTenant) && !alreadyAccepted && selectedApp.status !== 'rejected') {
                    return (
                      <button 
                        onClick={() => { handleAccept(selectedApp); setSelectedApp(null); }}
                        disabled={processingId === selectedApp.id}
                        className="w-full bg-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-200 flex items-center justify-center gap-2 mb-3"
                      >
                        {processingId === selectedApp.id ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                        {lang === 'sw' ? 'Kubali Mkataba' : 'Accept Agreement'}
                      </button>
                    );
                  }
                  return null;
                })()}

                {/* Payment Button - show for submitted or pending_payment status */}
                {(selectedApp.status === 'submitted' || selectedApp.status === 'pending_payment') && getPaymentAmount(selectedApp) > 0 && (
                  <button 
                    onClick={() => { onPay(selectedApp); setSelectedApp(null); }}
                    className="w-full bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2"
                  >
                    <CreditCard size={18} />
                    {t.payNow} ({formatCurrency(getPaymentAmount(selectedApp), currency)})
                  </button>
                )}

                {/* Preview & Download for Issued */}
                {selectedApp.status === 'issued' && (
                  <div className="space-y-3">
                    {/* Receipt Download */}
                    <PDFDownloadLink 
                      document={
                        <ReceiptPDF 
                          application={selectedApp} 
                          paymentData={{
                            transaction_id: selectedApp.form_data?.payment_data?.transaction_id || `TXN-${selectedApp.id.slice(0, 8).toUpperCase()}`,
                            amount: getPaymentAmount(selectedApp),
                            payment_method: selectedApp.form_data?.payment_data?.payment_method || 'M-Pesa',
                            paid_at: selectedApp.form_data?.payment_data?.paid_at || new Date().toISOString()
                          }}
                          lang={lang}
                        />
                      } 
                      fileName={`Receipt_${selectedApp.application_number}.pdf`}
                      className="w-full bg-amber-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-amber-600 transition-all flex items-center justify-center gap-2"
                    >
                      {({ loading }) => (
                        <>
                          <Receipt size={18} />
                          {loading ? '...' : (lang === 'sw' ? 'Pakua Risiti' : 'Download Receipt')}
                        </>
                      )}
                    </PDFDownloadLink>

                    {/* Document Preview & Download */}
                    <div className="flex gap-3">
                      <button 
                        onClick={() => { setPreviewApp(selectedApp); setSelectedApp(null); }}
                        className="flex-1 bg-stone-200 text-stone-700 px-6 py-3 rounded-xl font-bold hover:bg-stone-300 transition-all flex items-center justify-center gap-2"
                      >
                        <Eye size={18} />
                        {lang === 'sw' ? 'Hakiki Hati' : 'Preview Document'}
                      </button>
                      <PDFDownloadLink 
                        document={<DocumentRenderer application={selectedApp} service={(selectedApp as any).services} />} 
                        fileName={`Certificate_${selectedApp.application_number}.pdf`}
                        className="flex-1 bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                      >
                        {({ loading }) => (
                          <>
                            <FileText size={18} />
                            {loading ? '...' : (lang === 'sw' ? 'Pakua Hati' : 'Download Document')}
                          </>
                        )}
                      </PDFDownloadLink>
                    </div>
                  </div>
                )}

                {/* Close button for other statuses (not when showing payment or issued buttons) */}
                {!(selectedApp.status === 'pending_payment' || 
                   selectedApp.status === 'issued' || 
                   (selectedApp.status === 'submitted' && getPaymentAmount(selectedApp) > 0)) && (
                  <button 
                    onClick={() => setSelectedApp(null)}
                    className="w-full bg-stone-200 text-stone-700 px-6 py-3 rounded-xl font-bold hover:bg-stone-300 transition-all"
                  >
                    {lang === 'sw' ? 'Funga' : 'Close'}
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}