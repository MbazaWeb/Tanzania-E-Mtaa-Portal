import React, { useState, useEffect } from 'react';
import { supabase, Application, UserProfile } from '@/src/lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Clock, 
  Search, 
  Filter,
  Eye,
  MoreVertical,
  Shield,
  ArrowRight,
  Loader2,
  Building2,
  MapPin,
  Calendar,
  User,
  ChevronRight,
  RefreshCw,
  ClipboardList,
  Paperclip,
  ExternalLink,
  CreditCard,
  CheckCircle2
} from 'lucide-react';
import { ApplicationProgressBar } from './ui/ApplicationProgressBar';
import { cn } from '@/src/lib/utils';
import { useToast } from '@/src/context/ToastContext';
import { formatCurrency } from '@/src/lib/currency';
import { TANZANIA_ADDRESS_DATA } from '@/src/lib/addressData';
import { HARDCODED_SERVICES } from '@/src/constants/services';

// Helper to get service by ID from hardcoded services (flat array)
const getServiceById = (serviceId: string) => {
  return HARDCODED_SERVICES.find(s => s.id === serviceId) || null;
};
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import { DocumentPDF } from './DocumentPDF';

interface ApplicationReviewProps {
  lang: 'sw' | 'en';
  user: UserProfile | null;
}

export const ApplicationReview: React.FC<ApplicationReviewProps> = ({ lang, user }) => {
  const { showToast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'submitted' | 'pending_payment' | 'paid' | 'verified' | 'approved' | 'rejected' | 'pending_review' | 'issued'>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState('all');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [processing, setProcessing] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [showFeedbackInput, setShowFeedbackInput] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [showFullDetails, setShowFullDetails] = useState(false);
  const [previewFile, setPreviewFile] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<'rejected' | 'returned' | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchApplications();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const isConfigured = supabaseUrl && !supabaseUrl.includes('YOUR_SUPABASE_URL') && !supabaseUrl.includes('bqxevbmjqvogebmlbidx');

    if (!isConfigured || (user?.id && user.id.startsWith('demo-'))) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const demoApps = JSON.parse(localStorage.getItem('demo_applications') || '[]');
      
      // Filter by staff location if applicable
      let filtered = demoApps;
      if (['staff', 'admin'].includes(user?.role || '')) {
        if (user.assigned_district) {
          filtered = demoApps.filter((app: any) => app.district === user.assigned_district);
        } else if (user.assigned_region) {
          filtered = demoApps.filter((app: any) => app.region === user.assigned_region);
        }
      }
      
      setApplications(filtered.map((app: any) => {
        const fullService = getServiceById(app.service_id);
        return {
          ...app,
          services: fullService || { name: app.service_name || 'Service', fee: 0 },
          users: { first_name: 'Demo', last_name: 'User' }
        };
      }));
      setLoading(false);
      return;
    }

    console.log('ApplicationReview: fetching applications for user:', user?.id, 'role:', user?.role);
    
    let query = supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false });

    // Staff sees only applications in their location (if assigned)
    if (['staff', 'admin'].includes(user?.role || '')) {
      if (user.assigned_district) {
        console.log('Filtering by district:', user.assigned_district);
        query = query.eq('district', user.assigned_district);
      } else if (user.assigned_region) {
        console.log('Filtering by region:', user.assigned_region);
        query = query.eq('region', user.assigned_region);
      } else {
        console.log('Staff has no assigned location - showing all applications');
      }
    }

    const { data, error } = await query;

    console.log('ApplicationReview fetch result:', { data, error, count: data?.length });

    if (!error && data) {
      // Map applications to include full service data from HARDCODED_SERVICES
      setApplications(data.map((app: any) => {
        const fullService = getServiceById(app.service_id);
        return {
          ...app,
          services: fullService || { name: 'Unknown Service', fee: 0 }
        };
      }));
    } else if (error) {
      console.error('Error fetching applications:', error);
    }
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string, feedback?: string) => {
    setProcessing(true);
    
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const isConfigured = supabaseUrl && !supabaseUrl.includes('YOUR_SUPABASE_URL') && !supabaseUrl.includes('bqxevbmjqvogebmlbidx');

    const updateData: any = { 
      status,
      feedback: feedback || null,
      ...(status === 'approved' && { approved_by: user?.id, approved_at: new Date().toISOString() }),
      ...(status === 'pending_payment' && { approved_by: user?.id, approved_at: new Date().toISOString() }),
      ...(status === 'rejected' && { rejected_by: user?.id, rejected_at: new Date().toISOString() }),
      ...(status === 'returned' && { returned_by: user?.id, returned_at: new Date().toISOString() }),
      ...(status === 'issued' && { issued_by: user?.id, issued_at: new Date().toISOString() }),
    };

    if (!isConfigured || (user?.id && user.id.startsWith('demo-'))) {
      await new Promise(resolve => setTimeout(resolve, 800));
      const demoApps = JSON.parse(localStorage.getItem('demo_applications') || '[]');
      const updated = demoApps.map((app: any) => 
        app.id === id ? { ...app, ...updateData } : app
      );
      localStorage.setItem('demo_applications', JSON.stringify(updated));
      
      setApplications(prev => prev.map(app => app.id === id ? { ...app, ...updateData } : app));
      if (selectedApp?.id === id) {
        setSelectedApp(prev => prev ? { ...prev, ...updateData } : null);
      }
      if (status === 'pending_payment') {
        showToast(lang === 'sw' ? 'Maombi yameidhinishwa! Inasubiri malipo.' : 'Application approved! Awaiting payment.', 'success');
      }
      if (status === 'returned') {
        showToast(lang === 'sw' ? 'Maombi yamerudishwa kwa mabadiliko.' : 'Application returned for changes.', 'success');
      }
      setProcessing(false);
      return;
    }

    const { error } = await supabase
      .from('applications')
      .update(updateData)
      .eq('id', id);

    if (!error) {
      setApplications(prev => prev.map(app => app.id === id ? { ...app, ...updateData } : app));
      if (selectedApp?.id === id) {
        setSelectedApp(prev => prev ? { ...prev, ...updateData } : null);
      }
      if (status === 'pending_payment') {
        showToast(lang === 'sw' ? 'Maombi yameidhinishwa! Inasubiri malipo.' : 'Application approved! Awaiting payment.', 'success');
      }
      if (status === 'returned') {
        showToast(lang === 'sw' ? 'Maombi yamerudishwa kwa mabadiliko.' : 'Application returned for changes.', 'success');
      }
    }
    setProcessing(false);
  };

  const handleApprove = async () => {
    if (!selectedApp) {
      console.log('handleApprove: No selected app');
      return;
    }

    console.log('handleApprove: Processing app', selectedApp.id, 'status:', selectedApp.status);

    const serviceName = (selectedApp as any).services?.name || '';
    const buyerAccepted = (selectedApp as any).buyer_accepted;
    const tenantAccepted = (selectedApp as any).tenant_accepted;

    if (
      (serviceName.includes('Mauziano') && !buyerAccepted) ||
      (serviceName.includes('PANGISHA') && !tenantAccepted)
    ) {
      showToast(lang === 'sw' ? 'Inasubiri makubaliano ya upande wa pili kwanza.' : 'Awaiting second party acceptance first.', 'warning');
      return;
    }

    // Different next status based on current status
    let nextStatus = 'pending_payment';
    
    if (selectedApp.status === 'submitted' || selectedApp.status === 'pending_review') {
      // First approval - send to payment
      nextStatus = 'pending_payment';
    } else if (selectedApp.status === 'paid') {
      // Application is paid - verify and approve in one step
      nextStatus = 'approved';
    } else if (selectedApp.status === 'verified') {
      // Already verified - final approval
      nextStatus = 'approved';
    }

    console.log('handleApprove: Changing status to', nextStatus);
    await updateStatus(selectedApp.id, nextStatus);
    
    if (nextStatus === 'approved') {
      showToast(lang === 'sw' ? 'Maombi yameidhinishwa! Tayari kutoa hati.' : 'Application approved! Ready to issue document.', 'success');
    }
  };

  const handleReject = async () => {
    if (!selectedApp) return;
    setPendingAction('rejected');
    setShowFeedbackInput(true);
    setFeedbackText('');
  };

  const handleReturn = async () => {
    if (!selectedApp) return;
    setPendingAction('returned');
    setShowFeedbackInput(true);
    setFeedbackText('');
  };

  const handleFeedbackSubmit = async () => {
    if (!selectedApp || !feedbackText || !pendingAction) return;
    
    await updateStatus(selectedApp.id, pendingAction, feedbackText);
    setShowFeedbackInput(false);
    setFeedbackText('');
    setPendingAction(null);
  };

  const filteredApps = applications.filter(app => {
    const matchesStatus = filter === 'all' || app.status === filter;
    const matchesRegion = regionFilter === 'all' || app.region === regionFilter;
    const matchesDistrict = districtFilter === 'all' || app.district === districtFilter;
    const matchesService = serviceFilter === 'all' || app.service_id === serviceFilter;
    
    // Check payment status - paid statuses include: paid, verified, approved, issued
    const isPaid = ['paid', 'verified', 'approved', 'issued'].includes(app.status);
    const matchesPayment = paymentFilter === 'all' || 
      (paymentFilter === 'paid' && isPaid) ||
      (paymentFilter === 'unpaid' && !isPaid);
    
    const searchLower = search.toLowerCase();
    const matchesSearch = 
      app.application_number.toLowerCase().includes(searchLower) ||
      (app as any).users?.first_name?.toLowerCase().includes(searchLower) ||
      (app as any).users?.last_name?.toLowerCase().includes(searchLower) ||
      (app as any).services?.name?.toLowerCase().includes(searchLower);
      
    return matchesStatus && matchesRegion && matchesDistrict && matchesService && matchesSearch && matchesPayment;
  });

  const totalPages = Math.ceil(filteredApps.length / itemsPerPage);
  const paginatedApps = filteredApps.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getStatusStyle = (status: string) => {
    const styles: any = {
      submitted: "bg-blue-50 text-blue-600 border-blue-100",
      pending_payment: "bg-orange-50 text-orange-600 border-orange-100",
      paid: "bg-amber-50 text-amber-600 border-amber-100",
      verified: "bg-indigo-50 text-indigo-600 border-indigo-100",
      pending_review: "bg-purple-50 text-purple-600 border-purple-100",
      approved: "bg-emerald-50 text-emerald-600 border-emerald-100",
      issued: "bg-emerald-600 text-white border-emerald-600",
      rejected: "bg-red-50 text-red-600 border-red-100",
      returned: "bg-amber-50 text-amber-600 border-amber-100",
    };
    return styles[status] || "bg-stone-100 text-stone-600";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-2xl font-heading font-extrabold text-stone-900">
              {lang === 'sw' ? 'Uhakiki wa Maombi' : 'Application Review'}
            </h2>
            <p className="text-stone-500">
              {lang === 'sw' ? 'Simamia na uhakiki maombi yote ya wananchi.' : 'Manage and verify all citizen applications.'}
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing || loading}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-semibold text-sm hover:bg-emerald-100 transition-all disabled:opacity-50"
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
            {lang === 'sw' ? 'Onyesha Upya' : 'Refresh'}
          </button>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <input 
              type="text"
              placeholder={lang === 'sw' ? 'Tafuta...' : 'Search...'}
              className="pl-10 pr-4 h-11 rounded-xl border border-stone-200 focus:border-primary outline-none transition-all bg-white w-64"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <select 
              className="h-11 px-4 rounded-xl border border-stone-200 focus:border-primary outline-none transition-all bg-white font-semibold text-sm"
              value={filter}
              aria-label={lang === 'sw' ? 'Chuja kwa hali' : 'Filter by status'}
              onChange={(e) => {
                setFilter(e.target.value as any);
                setCurrentPage(1);
              }}
            >
              <option value="all">{lang === 'sw' ? 'Hali Yote' : 'All Status'}</option>
              <option value="submitted">{lang === 'sw' ? 'Yaliyotumwa' : 'Submitted'}</option>
              <option value="pending_payment">{lang === 'sw' ? 'Yanasubiri Malipo' : 'Pending Payment'}</option>
              <option value="paid">{lang === 'sw' ? 'Yaliyolipiwa' : 'Paid'}</option>
              <option value="verified">{lang === 'sw' ? 'Yaliyothibitishwa' : 'Verified'}</option>
              <option value="pending_review">{lang === 'sw' ? 'Yanasubiri Uhakiki' : 'Pending Review'}</option>
              <option value="approved">{lang === 'sw' ? 'Yaliyoidhinishwa' : 'Approved'}</option>
              <option value="issued">{lang === 'sw' ? 'Yaliyotolewa' : 'Issued'}</option>
              <option value="rejected">{lang === 'sw' ? 'Yaliyokataliwa' : 'Rejected'}</option>
            </select>

            {/* Payment Filter */}
            <select 
              className="h-11 px-4 rounded-xl border border-stone-200 focus:border-primary outline-none transition-all bg-white font-semibold text-sm"
              value={paymentFilter}
              aria-label={lang === 'sw' ? 'Chuja kwa malipo' : 'Filter by payment'}
              onChange={(e) => {
                setPaymentFilter(e.target.value as 'all' | 'paid' | 'unpaid');
                setCurrentPage(1);
              }}
            >
              <option value="all">{lang === 'sw' ? 'Malipo Yote' : 'All Payments'}</option>
              <option value="paid">{lang === 'sw' ? 'Yamelipiwa' : 'Paid'}</option>
              <option value="unpaid">{lang === 'sw' ? 'Hayajalipiwa' : 'Unpaid'}</option>
            </select>

            <select 
              className="h-11 px-4 rounded-xl border border-stone-200 focus:border-primary outline-none transition-all bg-white font-semibold text-sm"
              value={regionFilter}
              aria-label={lang === 'sw' ? 'Chuja kwa mkoa' : 'Filter by region'}
              onChange={(e) => {
                setRegionFilter(e.target.value);
                setDistrictFilter('all');
                setCurrentPage(1);
              }}
            >
              <option value="all">{lang === 'sw' ? 'Mikoa Yote' : 'All Regions'}</option>
              {TANZANIA_ADDRESS_DATA.map(r => (
                <option key={r.name} value={r.name}>{r.name}</option>
              ))}
            </select>

            {regionFilter !== 'all' && (
              <select 
                className="h-11 px-4 rounded-xl border border-stone-200 focus:border-primary outline-none transition-all bg-white font-semibold text-sm"
                value={districtFilter}
                aria-label={lang === 'sw' ? 'Chuja kwa wilaya' : 'Filter by district'}
                onChange={(e) => {
                  setDistrictFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">{lang === 'sw' ? 'Wilaya Zote' : 'All Districts'}</option>
                {TANZANIA_ADDRESS_DATA.find(r => r.name === regionFilter)?.districts.map(d => (
                  <option key={d.name} value={d.name}>{d.name}</option>
                ))}
              </select>
            )}

            <select 
              className="h-11 px-4 rounded-xl border border-stone-200 focus:border-primary outline-none transition-all bg-white font-semibold text-sm"
              value={serviceFilter}
              aria-label={lang === 'sw' ? 'Chuja kwa huduma' : 'Filter by service'}
              onChange={(e) => {
                setServiceFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">{lang === 'sw' ? 'Huduma Zote' : 'All Services'}</option>
              {Array.from(new Set(applications.map(app => (app as any).services?.id))).filter(Boolean).map(serviceId => {
                const serviceName = (applications.find(app => (app as any).services?.id === serviceId) as any)?.services?.name;
                return (
                  <option key={serviceId} value={serviceId}>{serviceName}</option>
                );
              })}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-stone-50 border-b border-stone-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">{lang === 'sw' ? 'Mwombaji' : 'Applicant'}</th>
                  <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">{lang === 'sw' ? 'Huduma' : 'Service'}</th>
                  <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">{lang === 'sw' ? 'Tarehe' : 'Date'}</th>
                  <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">{lang === 'sw' ? 'Malipo' : 'Payment'}</th>
                  <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">{lang === 'sw' ? 'Hali' : 'Status'}</th>
                  <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider text-center">{lang === 'sw' ? 'Hatua' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                    </td>
                  </tr>
                ) : filteredApps.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-stone-400">
                      {lang === 'sw' ? 'Hakuna maombi yaliyopatikana.' : 'No applications found.'}
                    </td>
                  </tr>
                ) : (
                  paginatedApps.map(app => (
                    <tr 
                      key={app.id} 
                      className={cn(
                        "hover:bg-stone-50 transition-colors cursor-pointer",
                        selectedApp?.id === app.id ? "bg-emerald-50/50" : ""
                      )}
                      onClick={() => setSelectedApp(app)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500">
                            <User size={16} />
                          </div>
                          <div>
                            <p className="font-bold text-stone-800">{(app as any).users?.first_name} {(app as any).users?.last_name}</p>
                            <p className="text-[10px] text-stone-400 font-mono">{app.application_number}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-stone-700">{(app as any).services?.name}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <p className="text-sm text-stone-600">{new Date(app.created_at).toLocaleDateString()}</p>
                          <p className="text-xs text-stone-400">{new Date(app.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {/* Payment Status */}
                        {['paid', 'verified', 'approved', 'issued'].includes(app.status) ? (
                          <div className="flex items-center gap-1.5 text-emerald-600">
                            <CheckCircle2 size={14} />
                            <span className="text-[10px] font-bold uppercase">{lang === 'sw' ? 'Imelipiwa' : 'Paid'}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-orange-600">
                            <CreditCard size={14} />
                            <span className="text-[10px] font-bold uppercase">{lang === 'sw' ? 'Haijalipwa' : 'Unpaid'}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider", getStatusStyle(app.status))}>
                          {app.status === 'pending_payment' ? (lang === 'sw' ? 'Malipo' : 'Payment') : app.status}
                        </span>
                      </td>
                      <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                        {['admin', 'staff'].includes(user?.role || '') && (
                          <div className="flex items-center justify-center gap-1">
                            {/* Quick Approve Button */}
                            {['submitted', 'pending_review'].includes(app.status) && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedApp(app);
                                  setTimeout(() => {
                                    updateStatus(app.id, 'pending_payment');
                                    showToast(lang === 'sw' ? 'Imeidhinishwa! Inasubiri malipo.' : 'Approved! Awaiting payment.', 'success');
                                  }, 100);
                                }}
                                title={lang === 'sw' ? 'Idhinisha' : 'Approve'}
                                className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 flex items-center justify-center transition-all"
                              >
                                <CheckCircle size={16} />
                              </button>
                            )}
                            {['paid', 'verified'].includes(app.status) && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedApp(app);
                                  setTimeout(() => {
                                    updateStatus(app.id, 'approved');
                                    showToast(lang === 'sw' ? 'Maombi yameidhinishwa!' : 'Application approved!', 'success');
                                  }, 100);
                                }}
                                title={lang === 'sw' ? 'Idhinisha Maombi' : 'Approve'}
                                className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 flex items-center justify-center transition-all"
                              >
                                <CheckCircle size={16} />
                              </button>
                            )}
                            {app.status === 'approved' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedApp(app);
                                  setTimeout(() => {
                                    updateStatus(app.id, 'issued');
                                    showToast(lang === 'sw' ? 'Hati imetolewa!' : 'Document issued!', 'success');
                                  }, 100);
                                }}
                                title={lang === 'sw' ? 'Toa Hati' : 'Issue'}
                                className="h-8 w-8 rounded-lg bg-stone-900 text-white hover:bg-black flex items-center justify-center transition-all"
                              >
                                <FileText size={14} />
                              </button>
                            )}
                            {/* View Details Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedApp(app);
                              }}
                              title={lang === 'sw' ? 'Ona Maelezo' : 'View Details'}
                              className="h-8 w-8 rounded-lg bg-stone-100 text-stone-600 hover:bg-stone-200 flex items-center justify-center transition-all"
                            >
                              <Eye size={16} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-stone-100 flex items-center justify-between bg-stone-50/30">
              <p className="text-xs font-bold text-stone-500">
                {lang === 'sw' 
                  ? `Inaonyesha ${(currentPage - 1) * itemsPerPage + 1} - ${Math.min(currentPage * itemsPerPage, filteredApps.length)} kati ya ${filteredApps.length}` 
                  : `Showing ${(currentPage - 1) * itemsPerPage + 1} - ${Math.min(currentPage * itemsPerPage, filteredApps.length)} of ${filteredApps.length}`}
              </p>
              <div className="flex items-center gap-2">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  aria-label={lang === 'sw' ? 'Ukurasa uliopita' : 'Previous page'}
                  className="h-8 w-8 rounded-lg border border-stone-200 flex items-center justify-center hover:bg-white disabled:opacity-50 transition-all"
                >
                  <ChevronRight className="h-4 w-4 rotate-180" />
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button 
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={cn(
                        "h-8 w-8 rounded-lg text-xs font-bold transition-all",
                        currentPage === page ? "bg-primary text-white" : "hover:bg-white border border-transparent hover:border-stone-200"
                      )}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  aria-label={lang === 'sw' ? 'Ukurasa unaofuata' : 'Next page'}
                  className="h-8 w-8 rounded-lg border border-stone-200 flex items-center justify-center hover:bg-white disabled:opacity-50 transition-all"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Details Panel */}
        <div className="lg:col-span-1">
          <AnimatePresence mode="wait">
            {selectedApp ? (
              <motion.div 
                key={selectedApp.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="bg-white rounded-2xl border border-stone-200 shadow-lg overflow-hidden sticky top-24"
              >
                <div className="p-6 border-b border-stone-100 bg-stone-50/50">
                  <div className="flex items-center justify-between mb-4">
                    <span className={cn("px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider", getStatusStyle(selectedApp.status))}>
                      {selectedApp.status}
                    </span>
                    <button 
                      onClick={() => setSelectedApp(null)}
                      aria-label={lang === 'sw' ? 'Funga' : 'Close'}
                      className="p-1 hover:bg-stone-200 rounded-full transition-colors"
                    >
                      <XCircle className="h-5 w-5 text-stone-400" />
                    </button>
                  </div>
                  <h3 className="text-xl font-heading font-extrabold text-stone-900">{(selectedApp as any).services?.name}</h3>
                  <p className="text-sm text-stone-500">{(selectedApp as any).users?.first_name} {(selectedApp as any).users?.last_name}</p>
                  
                  {/* Progress Bar */}
                  <div className="mt-4 p-4 bg-white rounded-xl border border-stone-200">
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3">
                      {lang === 'sw' ? 'Hatua za Maombi' : 'Application Progress'}
                    </p>
                    <ApplicationProgressBar status={selectedApp.status} lang={lang} />
                  </div>
                  
                  <button 
                    onClick={() => setShowFullDetails(true)}
                    className="mt-4 w-full h-10 bg-stone-100 text-stone-600 rounded-xl font-bold text-xs hover:bg-stone-200 transition-all flex items-center justify-center gap-2"
                  >
                    <Eye size={14} />
                    {lang === 'sw' ? 'Soma Maombi Kamili' : 'Read Full Application'}
                  </button>
                  
                  {/* Quick Action Buttons - Moved to header for visibility */}
                  {['admin', 'staff'].includes(user?.role || '') && !['issued', 'rejected'].includes(selectedApp.status) && (
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      {['submitted', 'pending_review'].includes(selectedApp.status) && (
                        <button 
                          disabled={processing}
                          onClick={handleApprove}
                          className="col-span-2 h-12 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-200"
                        >
                          {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                          {lang === 'sw' ? 'Idhinisha → Malipo' : 'Approve → Payment'}
                        </button>
                      )}
                      {selectedApp.status === 'pending_payment' && (
                        <div className="col-span-2 h-12 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                          <Clock className="h-4 w-4" />
                          {lang === 'sw' ? 'Inasubiri Malipo' : 'Awaiting Payment'}
                        </div>
                      )}
                      {['paid', 'verified'].includes(selectedApp.status) && (
                        <button 
                          disabled={processing}
                          onClick={handleApprove}
                          className="col-span-2 h-12 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-200"
                        >
                          {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                          {lang === 'sw' ? 'Idhinisha Maombi' : 'Approve Application'}
                        </button>
                      )}
                      {selectedApp.status === 'approved' && (
                        <button 
                          disabled={processing}
                          onClick={() => updateStatus(selectedApp.id, 'issued')}
                          className="col-span-2 h-12 bg-stone-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg"
                        >
                          {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                          {lang === 'sw' ? 'Toa Hati' : 'Issue Document'}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{lang === 'sw' ? 'Namba ya Maombi' : 'App Number'}</p>
                      <p className="text-sm font-mono font-bold text-stone-800">{selectedApp.application_number}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{lang === 'sw' ? 'Tarehe' : 'Date'}</p>
                      <p className="text-sm font-bold text-stone-800">{new Date(selectedApp.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{lang === 'sw' ? 'Mabadiliko ya Mwisho' : 'Last Updated'}</p>
                      <p className="text-sm font-bold text-stone-800">{new Date(selectedApp.updated_at).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* Administrative Details */}
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{lang === 'sw' ? 'Utawala' : 'Administrative'}</p>
                    <div className="bg-stone-50 rounded-xl p-4 space-y-3">
                      <div className="flex justify-between gap-4 border-b border-stone-200 pb-2">
                        <span className="text-xs font-bold text-stone-500">{lang === 'sw' ? 'Mkoa' : 'Region'}</span>
                        <span className="text-xs font-bold text-stone-800">{selectedApp.region || '-'}</span>
                      </div>
                      <div className="flex justify-between gap-4 border-b border-stone-200 pb-2">
                        <span className="text-xs font-bold text-stone-500">{lang === 'sw' ? 'Wilaya' : 'District'}</span>
                        <span className="text-xs font-bold text-stone-800">{selectedApp.district || '-'}</span>
                      </div>
                      <div className="flex justify-between gap-4 border-b border-stone-200 pb-2">
                        <span className="text-xs font-bold text-stone-500">{lang === 'sw' ? 'Kata' : 'Ward'}</span>
                        <span className="text-xs font-bold text-stone-800">{selectedApp.ward || '-'}</span>
                      </div>
                      <div className="flex justify-between gap-4 border-b border-stone-200 pb-2">
                        <span className="text-xs font-bold text-stone-500">{lang === 'sw' ? 'Mtaa' : 'Street'}</span>
                        <span className="text-xs font-bold text-stone-800">{selectedApp.street || '-'}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-xs font-bold text-stone-500">{lang === 'sw' ? 'Mtumishi' : 'Assigned Staff'}</span>
                        <span className="text-xs font-bold text-stone-800">{selectedApp.assigned_staff_id || (lang === 'sw' ? 'Hajapangiwa' : 'Unassigned')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{lang === 'sw' ? 'Taarifa za Maombi' : 'Application Data'}</p>
                    <div className="bg-stone-50 rounded-xl p-4 space-y-3">
                      {Object.entries(selectedApp.form_data || {}).map(([key, value]) => {
                        if (key === 'attachments' || key === 'applicant_type' || key === 'representative_name') return null;
                        return (
                          <div key={key} className="flex justify-between gap-4 border-b border-stone-200 pb-2 last:border-0 last:pb-0">
                            <span className="text-xs font-bold text-stone-500 capitalize">{key.replace(/_/g, ' ')}</span>
                            <span className="text-xs font-bold text-stone-800 text-right">{String(value)}</span>
                          </div>
                        );
                      })}
                      
                      {/* Attachments Display */}
                      {selectedApp.form_data?.attachments?.length > 0 && (
                        <div className="pt-2 border-t border-stone-200 mt-2">
                          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">{lang === 'sw' ? 'Viambatisho' : 'Attachments'}</p>
                          <div className="flex flex-wrap gap-2">
                            {selectedApp.form_data.attachments.map((file: string, idx: number) => (
                              <div key={idx} className="flex items-center gap-1 px-2 py-1 bg-white border border-stone-200 rounded text-[10px] font-bold text-stone-600">
                                <FileText size={10} />
                                {file}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {(selectedApp as any).buyer_accepted !== undefined && (selectedApp as any).services?.name?.includes('Mauziano') && (
                        <div className="flex justify-between gap-4 border-b border-stone-200 pb-2 last:border-0 last:pb-0 pt-2">
                          <span className="text-xs font-bold text-purple-600 uppercase tracking-tighter">{lang === 'sw' ? 'Mnunuzi Amekubali?' : 'Buyer Accepted?'}</span>
                          <span className={cn(
                            "text-xs font-bold px-2 py-0.5 rounded-full",
                            (selectedApp as any).buyer_accepted ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                          )}>
                            {(selectedApp as any).buyer_accepted ? (lang === 'sw' ? 'NDIYO' : 'YES') : (lang === 'sw' ? 'BADO' : 'NOT YET')}
                          </span>
                        </div>
                      )}
                      {(selectedApp as any).tenant_accepted !== undefined && (selectedApp as any).services?.name?.includes('PANGISHA') && (
                        <div className="flex justify-between gap-4 border-b border-stone-200 pb-2 last:border-0 last:pb-0 pt-2">
                          <span className="text-xs font-bold text-purple-600 uppercase tracking-tighter">{lang === 'sw' ? 'Mpangaji Amekubali?' : 'Tenant Accepted?'}</span>
                          <span className={cn(
                            "text-xs font-bold px-2 py-0.5 rounded-full",
                            (selectedApp as any).tenant_accepted ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                          )}>
                            {(selectedApp as any).tenant_accepted ? (lang === 'sw' ? 'NDIYO' : 'YES') : (lang === 'sw' ? 'BADO' : 'NOT YET')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  {['admin', 'staff'].includes(user?.role || '') && (
                    <div className="space-y-3 pt-4 border-t border-stone-100">
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{lang === 'sw' ? 'Hatua za Uhakiki' : 'Verification Actions'}</p>
                      
                      <div className="grid grid-cols-1 gap-2">
                        {/* Verify button - only for paid status */}
                        {selectedApp.status === 'paid' && (
                          <button 
                            disabled={processing}
                            onClick={() => updateStatus(selectedApp.id, 'verified')}
                            className="w-full h-12 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
                          >
                            {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Clock className="h-4 w-4" />}
                            {lang === 'sw' ? 'Thibitisha Malipo' : 'Verify Payment'}
                          </button>
                        )}

                        {/* Pending Payment Info */}
                        {selectedApp.status === 'pending_payment' && (
                          <div className="w-full h-12 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                            <Clock className="h-4 w-4" />
                            {lang === 'sw' ? 'Inasubiri Malipo ya Mwananchi' : 'Awaiting Citizen Payment'}
                          </div>
                        )}

                        {/* Approve to Payment - for submitted/pending_review */}
                        {['submitted', 'pending_review'].includes(selectedApp.status) && (
                          <button 
                            disabled={processing || 
                              ((selectedApp as any).services?.name?.includes('Mauziano') && !(selectedApp as any).buyer_accepted) ||
                              ((selectedApp as any).services?.name?.includes('PANGISHA') && !(selectedApp as any).tenant_accepted)
                            }
                            onClick={handleApprove}
                            className={cn(
                              "w-full h-12 text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg",
                              (((selectedApp as any).services?.name?.includes('Mauziano') && !(selectedApp as any).buyer_accepted) ||
                               ((selectedApp as any).services?.name?.includes('PANGISHA') && !(selectedApp as any).tenant_accepted))
                                ? "bg-stone-300 cursor-not-allowed shadow-none"
                                : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200"
                            )}
                          >
                            {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                            {lang === 'sw' ? 'Idhinisha → Malipo' : 'Approve → Payment'}
                          </button>
                        )}

                        {/* Final Approval - for paid/verified */}
                        {['paid', 'verified'].includes(selectedApp.status) && (
                          <button 
                            disabled={processing || 
                              ((selectedApp as any).services?.name?.includes('Mauziano') && !(selectedApp as any).buyer_accepted) ||
                              ((selectedApp as any).services?.name?.includes('PANGISHA') && !(selectedApp as any).tenant_accepted)
                            }
                            onClick={handleApprove}
                            className={cn(
                              "w-full h-12 text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg",
                              (((selectedApp as any).services?.name?.includes('Mauziano') && !(selectedApp as any).buyer_accepted) ||
                               ((selectedApp as any).services?.name?.includes('PANGISHA') && !(selectedApp as any).tenant_accepted))
                                ? "bg-stone-300 cursor-not-allowed shadow-none"
                                : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200"
                            )}
                          >
                            {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                            {lang === 'sw' ? 'Idhinisha Maombi' : 'Approve Application'}
                          </button>
                        )}

                        {/* Return/Reject buttons */}
                        {['submitted', 'paid', 'verified', 'pending_review', 'pending_payment'].includes(selectedApp.status) && (
                          <div className="space-y-2">
                            {showFeedbackInput ? (
                              <div className="space-y-2 animate-in slide-in-from-top-2">
                                <textarea 
                                  className="w-full p-3 rounded-xl border border-stone-200 text-sm outline-none focus:border-primary"
                                  placeholder={pendingAction === 'rejected' 
                                    ? (lang === 'sw' ? 'Andika sababu ya kukataa...' : 'Write reason for rejection...')
                                    : (lang === 'sw' ? 'Andika maelezo ya mabadiliko...' : 'Write feedback for changes...')
                                  }
                                  value={feedbackText}
                                  onChange={(e) => setFeedbackText(e.target.value)}
                                  rows={3}
                                />
                                <div className="flex gap-2">
                                  <button 
                                    onClick={() => {
                                      setShowFeedbackInput(false);
                                      setPendingAction(null);
                                    }}
                                    className="flex-1 h-10 bg-stone-100 text-stone-600 rounded-lg font-bold text-xs"
                                  >
                                    {lang === 'sw' ? 'Ghairi' : 'Cancel'}
                                  </button>
                                  <button 
                                    disabled={!feedbackText || processing}
                                    onClick={handleFeedbackSubmit}
                                    className={cn(
                                      "flex-1 h-10 text-white rounded-lg font-bold text-xs shadow-lg",
                                      pendingAction === 'rejected' ? "bg-red-600 shadow-red-100" : "bg-amber-500 shadow-amber-100"
                                    )}
                                  >
                                    {lang === 'sw' ? 'Tuma' : 'Submit'}
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="grid grid-cols-2 gap-2">
                                <button 
                                  disabled={processing}
                                  onClick={handleReturn}
                                  className="h-12 bg-amber-50 text-amber-600 border border-amber-200 rounded-xl font-bold text-sm hover:bg-amber-100 transition-all flex items-center justify-center gap-2"
                                >
                                  <RefreshCw size={16} />
                                  {lang === 'sw' ? 'Rudisha' : 'Return'}
                                </button>
                                <button 
                                  disabled={processing}
                                  onClick={handleReject}
                                  className="h-12 bg-red-50 text-red-600 border border-red-200 rounded-xl font-bold text-sm hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                                >
                                  <AlertCircle size={16} />
                                  {lang === 'sw' ? 'Kataa' : 'Reject'}
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                        
                        <button 
                          onClick={() => setShowPreview(true)}
                          className="w-full h-12 bg-white border border-stone-200 text-stone-600 rounded-xl font-bold text-sm hover:bg-stone-50 transition-all flex items-center justify-center gap-2"
                        >
                          <Eye size={16} />
                          {lang === 'sw' ? 'Hakiki Hati (Preview)' : 'Preview Document'}
                        </button>

                        <button 
                          onClick={() => setShowPDFPreview(true)}
                          className="w-full h-12 bg-white border border-stone-200 text-stone-600 rounded-xl font-bold text-sm hover:bg-stone-50 transition-all flex items-center justify-center gap-2"
                        >
                          <FileText size={16} />
                          {lang === 'sw' ? 'Hakiki PDF' : 'PDF Preview'}
                        </button>
                        
                        <PDFDownloadLink
                          document={<DocumentPDF application={selectedApp} lang={lang} />}
                          fileName={`E-MTAA-${selectedApp.application_number}.pdf`}
                          className="w-full h-12 bg-stone-100 text-stone-600 rounded-xl font-bold text-sm hover:bg-stone-200 transition-all flex items-center justify-center gap-2"
                        >
                          {({ loading }) => (
                            <>
                              <RefreshCw size={16} className={cn(loading && "animate-spin")} />
                              {loading ? (lang === 'sw' ? 'Inatengeneza...' : 'Generating...') : (lang === 'sw' ? 'Pakua PDF' : 'Download PDF')}
                            </>
                          )}
                        </PDFDownloadLink>
                        
                        {((selectedApp as any).services?.name?.includes('Mauziano') && !(selectedApp as any).buyer_accepted) && (
                          <p className="text-[10px] text-amber-600 font-bold text-center">
                            {lang === 'sw' ? 'Inasubiri mnunuzi akubali kwanza' : 'Awaiting buyer acceptance first'}
                          </p>
                        )}

                        {((selectedApp as any).services?.name?.includes('PANGISHA') && !(selectedApp as any).tenant_accepted) && (
                          <p className="text-[10px] text-amber-600 font-bold text-center">
                            {lang === 'sw' ? 'Inasubiri mpangaji akubali kwanza' : 'Awaiting tenant acceptance first'}
                          </p>
                        )}

                        {selectedApp.status === 'approved' && (
                          <button 
                            disabled={processing}
                            onClick={() => updateStatus(selectedApp.id, 'issued')}
                            className="w-full h-12 bg-stone-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-stone-200"
                          >
                            {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                            {lang === 'sw' ? 'Toa Hati (Issue)' : 'Issue Document'}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex items-center justify-center p-12 text-center border-2 border-dashed border-stone-200 rounded-3xl text-stone-400">
                <div className="space-y-4">
                  <div className="h-16 w-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto">
                    <Eye className="h-8 w-8" />
                  </div>
                  <p className="font-bold">{lang === 'sw' ? 'Chagua ombi ili kuona maelezo zaidi' : 'Select an application to view details'}</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && selectedApp && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-4xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-stone-900 tracking-tight">
                      {lang === 'sw' ? 'Hakiki ya Hati' : 'Document Preview'}
                    </h3>
                    <p className="text-xs text-stone-500 font-medium">
                      {lang === 'sw' ? 'Hivi ndivyo hati itakavyoonekana ikitolewa' : 'This is how the document will look when issued'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowPreview(false)}
                  aria-label={lang === 'sw' ? 'Funga upelelezi' : 'Close preview'}
                  className="h-10 w-10 rounded-full hover:bg-stone-200 flex items-center justify-center transition-colors"
                >
                  <XCircle size={24} className="text-stone-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 bg-stone-100/50">
                <div className="bg-white shadow-lg mx-auto max-w-[210mm] min-h-[297mm] p-[20mm] relative border border-stone-200">
                  {/* Watermark */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] -rotate-45">
                    <h1 className="text-[120px] font-black tracking-tighter">E-MTAA</h1>
                  </div>

                  {/* Header */}
                  <div className="text-center space-y-4 mb-12 relative">
                    <img 
                      src={(selectedApp as any).services?.document_template?.header?.logo_url || "https://images.seeklogo.com/logo-png/31/1/coat-of-arms-of-tanzania-logo-png_seeklogo-311608.png"} 
                      alt="Logo" 
                      className="h-24 mx-auto"
                      referrerPolicy="no-referrer"
                    />
                    <div className="space-y-1">
                      <h2 className="text-lg font-bold text-stone-900">{(selectedApp as any).services?.document_template?.header?.country || "JAMHURI YA MUUNGANO WA TANZANIA"}</h2>
                      <h3 className="text-md font-bold text-stone-700">{(selectedApp as any).services?.document_template?.header?.office || "OFISI YA RAIS - TAMISEMI"}</h3>
                      <div className="h-1 w-24 bg-stone-900 mx-auto mt-4" />
                    </div>
                  </div>

                  {/* Title */}
                  <div className="text-center mb-12">
                    <h1 className="text-2xl font-black text-stone-900 underline decoration-2 underline-offset-8 uppercase tracking-widest">
                      {(selectedApp as any).services?.document_template?.document_type}
                    </h1>
                  </div>

                  {/* Content */}
                  <div className="space-y-8 text-stone-800 leading-relaxed text-justify">
                    {/* Subject */}
                    {(selectedApp as any).services?.document_template?.subject && (
                      <p className="font-black text-stone-900">
                        {(selectedApp as any).services?.document_template?.subject.replace('[FULL_NAME]', `${(selectedApp as any).users?.first_name} ${(selectedApp as any).users?.last_name}`).replace('[HOUSE_NUMBER]', selectedApp.form_data?.house_number || '')}
                      </p>
                    )}

                    {/* Body */}
                    <p className="text-lg">
                      {(() => {
                        let body = (selectedApp as any).services?.document_template?.body_template || "";
                        const data = {
                          ...selectedApp.form_data,
                          FULL_NAME: `${(selectedApp as any).users?.first_name} ${(selectedApp as any).users?.last_name}`,
                          DATE: new Date().toLocaleDateString(),
                          APP_NUMBER: selectedApp.application_number
                        };
                        
                        Object.entries(data).forEach(([key, value]) => {
                          const placeholder = `[${key.toUpperCase()}]`;
                          body = body.replace(placeholder, String(value));
                        });
                        
                        return body || (lang === 'sw' ? 'Hati hii inathibitisha kuwa maombi yameidhinishwa.' : 'This document confirms that the application has been approved.');
                      })()}
                    </p>

                    {/* Signatures */}
                    <div className="pt-24 grid grid-cols-2 gap-12">
                      <div className="space-y-8">
                        <div className="border-b border-stone-400 w-48" />
                        <div>
                          <p className="font-bold text-stone-900 uppercase">{(selectedApp as any).users?.first_name} {(selectedApp as any).users?.last_name}</p>
                          <p className="text-xs text-stone-500 font-bold">{lang === 'sw' ? 'Sahihi ya Mwombaji' : 'Applicant Signature'}</p>
                        </div>
                      </div>
                      <div className="space-y-8 text-right flex flex-col items-end">
                        <div className="border-b border-stone-400 w-48" />
                        <div>
                          <p className="font-bold text-stone-900 uppercase">{lang === 'sw' ? 'AFISA MTENDAJI WA MTAA' : 'WARD EXECUTIVE OFFICER'}</p>
                          <p className="text-xs text-stone-500 font-bold">{lang === 'sw' ? 'Sahihi na Muhuri' : 'Signature & Stamp'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="absolute bottom-[20mm] left-[20mm] right-[20mm] pt-8 border-t border-stone-200 text-center">
                    <p className="text-[10px] text-stone-400 font-bold italic">
                      {(selectedApp as any).services?.document_template?.footer || "Hati hii ni rasmi na imetolewa kielektroniki kupitia mfumo wa E-Mtaa."}
                    </p>
                    <p className="text-[8px] text-stone-300 mt-2 font-mono">
                      VERIFICATION ID: {selectedApp.id.toUpperCase()} | GENERATED ON: {new Date().toISOString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-stone-100 bg-stone-50 flex justify-end gap-4">
                <button 
                  onClick={() => setShowPreview(false)}
                  className="px-8 py-3 bg-stone-200 text-stone-700 rounded-xl font-bold hover:bg-stone-300 transition-all"
                >
                  {lang === 'sw' ? 'Funga' : 'Close'}
                </button>
                {selectedApp.status === 'approved' && (
                  <button 
                    onClick={() => {
                      updateStatus(selectedApp.id, 'issued');
                      setShowPreview(false);
                    }}
                    className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
                  >
                    {lang === 'sw' ? 'Toa Hati Sasa' : 'Issue Document Now'}
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PDF Preview Modal */}
      <AnimatePresence>
        {showPDFPreview && selectedApp && (
          <div className="fixed inset-0 z-110 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-4xl w-full max-w-5xl h-[90vh] overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-stone-900 tracking-tight">
                      {lang === 'sw' ? 'Hakiki ya PDF' : 'PDF Preview'}
                    </h3>
                    <p className="text-xs text-stone-500 font-medium">
                      {lang === 'sw' ? 'Hati katika mfumo wa PDF' : 'Document in PDF format'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowPDFPreview(false)}
                  aria-label={lang === 'sw' ? 'Funga PDF' : 'Close PDF preview'}
                  className="h-10 w-10 rounded-full hover:bg-stone-200 flex items-center justify-center transition-colors"
                >
                  <XCircle size={24} className="text-stone-400" />
                </button>
              </div>

              <div className="flex-1 bg-stone-800">
                <PDFViewer width="100%" height="100%" showToolbar={true}>
                  <DocumentPDF application={selectedApp} lang={lang} />
                </PDFViewer>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Full Application Details Modal */}
      <AnimatePresence>
        {showFullDetails && selectedApp && (
          <div className="fixed inset-0 z-120 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white rounded-4xl w-full max-w-5xl h-[90vh] overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="p-8 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                    <FileText size={32} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-stone-900 tracking-tight">
                      {lang === 'sw' ? 'Maelezo Kamili ya Maombi' : 'Full Application Details'}
                    </h2>
                    <p className="text-sm text-stone-500 font-medium">
                      {selectedApp.application_number} • {new Date(selectedApp.created_at).toLocaleDateString()} {new Date(selectedApp.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowFullDetails(false)}
                  aria-label={lang === 'sw' ? 'Funga maelezo' : 'Close details'}
                  className="h-12 w-12 rounded-full hover:bg-stone-200 flex items-center justify-center transition-colors"
                >
                  <XCircle size={32} className="text-stone-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-12">
                {/* Section: Applicant Info */}
                <section className="space-y-6">
                  <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
                    <User className="text-primary h-6 w-6" />
                    <h3 className="text-lg font-black text-stone-900 uppercase tracking-wider">
                      {lang === 'sw' ? 'Taarifa za Mwombaji' : 'Applicant Information'}
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{lang === 'sw' ? 'Jina Kamili' : 'Full Name'}</p>
                      <p className="text-base font-bold text-stone-800">{(selectedApp as any).users?.first_name} {(selectedApp as any).users?.last_name}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{lang === 'sw' ? 'Namba ya Simu' : 'Phone Number'}</p>
                      <p className="text-base font-bold text-stone-800">{(selectedApp as any).users?.phone || '-'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{lang === 'sw' ? 'Namba ya NIDA' : 'NIDA Number'}</p>
                      <p className="text-base font-bold text-stone-800">{(selectedApp as any).users?.nida || '-'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{lang === 'sw' ? 'Barua Pepe' : 'Email Address'}</p>
                      <p className="text-base font-bold text-stone-800">{(selectedApp as any).users?.email || '-'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{lang === 'sw' ? 'Hali ya Usajili' : 'Verification Status'}</p>
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold",
                        (selectedApp as any).users?.is_verified ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                      )}>
                        {(selectedApp as any).users?.is_verified ? (lang === 'sw' ? 'Amedhibitishwa' : 'Verified') : (lang === 'sw' ? 'Hajadhibitishwa' : 'Unverified')}
                      </span>
                    </div>
                  </div>
                </section>

                {/* Section: Application Data */}
                <section className="space-y-6">
                  <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
                    <ClipboardList className="text-primary h-6 w-6" />
                    <h3 className="text-lg font-black text-stone-900 uppercase tracking-wider">
                      {lang === 'sw' ? 'Taarifa za Huduma' : 'Service Details'}
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                    {Object.entries(selectedApp.form_data || {}).map(([key, value]) => {
                      if (key === 'attachments' || key === 'applicant_type' || key === 'representative_name') return null;
                      return (
                        <div key={key} className="flex flex-col gap-1 border-b border-stone-50 pb-2">
                          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{key.replace(/_/g, ' ')}</span>
                          <span className="text-base font-bold text-stone-800">{String(value)}</span>
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* Section: Attachments */}
                {selectedApp.form_data?.attachments?.length > 0 && (
                  <section className="space-y-6">
                    <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
                      <Paperclip className="text-primary h-6 w-6" />
                      <h3 className="text-lg font-black text-stone-900 uppercase tracking-wider">
                        {lang === 'sw' ? 'Viambatisho' : 'Attachments'}
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {selectedApp.form_data.attachments.map((file: string, idx: number) => (
                        <div 
                          key={idx} 
                          onClick={() => setPreviewFile(file)}
                          className="group relative bg-stone-50 border border-stone-200 rounded-2xl p-4 hover:border-primary hover:bg-white transition-all cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-white border border-stone-100 flex items-center justify-center text-stone-400 group-hover:text-primary transition-colors">
                              <FileText size={20} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-stone-800 truncate">{file}</p>
                              <p className="text-[10px] text-stone-400 font-medium uppercase tracking-tighter">Document File</p>
                            </div>
                            <ExternalLink size={16} className="text-stone-300 group-hover:text-primary transition-colors" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Section: Location & Admin */}
                <section className="space-y-6">
                  <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
                    <MapPin className="text-primary h-6 w-6" />
                    <h3 className="text-lg font-black text-stone-900 uppercase tracking-wider">
                      {lang === 'sw' ? 'Mahali na Utawala' : 'Location & Administration'}
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{lang === 'sw' ? 'Mkoa' : 'Region'}</p>
                      <p className="text-base font-bold text-stone-800">{selectedApp.region || '-'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{lang === 'sw' ? 'Wilaya' : 'District'}</p>
                      <p className="text-base font-bold text-stone-800">{selectedApp.district || '-'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{lang === 'sw' ? 'Kata' : 'Ward'}</p>
                      <p className="text-base font-bold text-stone-800">{selectedApp.ward || '-'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{lang === 'sw' ? 'Mtaa' : 'Street'}</p>
                      <p className="text-base font-bold text-stone-800">{selectedApp.street || '-'}</p>
                    </div>
                  </div>
                </section>
              </div>

              <div className="p-8 border-t border-stone-100 bg-stone-50 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  {['admin', 'staff'].includes(user?.role || '') && ['submitted', 'paid', 'verified', 'pending_review'].includes(selectedApp.status) && (
                    <>
                      <button 
                        disabled={processing || 
                          ((selectedApp as any).services?.name?.includes('Mauziano') && !(selectedApp as any).buyer_accepted) ||
                          ((selectedApp as any).services?.name?.includes('PANGISHA') && !(selectedApp as any).tenant_accepted)
                        }
                        onClick={handleApprove}
                        className={cn(
                          "px-8 py-4 text-white rounded-2xl font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-xl",
                          (((selectedApp as any).services?.name?.includes('Mauziano') && !(selectedApp as any).buyer_accepted) ||
                           ((selectedApp as any).services?.name?.includes('PANGISHA') && !(selectedApp as any).tenant_accepted))
                            ? "bg-stone-300 cursor-not-allowed shadow-none"
                            : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200"
                        )}
                      >
                        {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle size={20} />}
                        {lang === 'sw' ? 'Idhinisha' : 'Approve'}
                      </button>
                      <button 
                        disabled={processing}
                        onClick={handleReturn}
                        className="px-8 py-4 bg-amber-50 text-amber-600 border border-amber-200 rounded-2xl font-black uppercase tracking-widest hover:bg-amber-100 transition-all flex items-center gap-2"
                      >
                        <RefreshCw size={20} />
                        {lang === 'sw' ? 'Rudisha' : 'Return'}
                      </button>
                      <button 
                        disabled={processing}
                        onClick={handleReject}
                        className="px-8 py-4 bg-red-50 text-red-600 border border-red-200 rounded-2xl font-black uppercase tracking-widest hover:bg-red-100 transition-all flex items-center gap-2"
                      >
                        <AlertCircle size={20} />
                        {lang === 'sw' ? 'Kataa' : 'Reject'}
                      </button>
                    </>
                  )}
                </div>
                <button 
                  onClick={() => setShowFullDetails(false)}
                  className="px-12 py-4 bg-stone-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-stone-800 transition-all shadow-xl shadow-stone-200"
                >
                  {lang === 'sw' ? 'Funga' : 'Close'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Attachment Preview Modal */}
      <AnimatePresence>
        {previewFile && (
          <div className="fixed inset-0 z-130 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-4xl w-full max-w-4xl h-[80vh] overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-stone-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="text-primary" size={24} />
                  <h3 className="text-lg font-bold text-stone-900">{previewFile}</h3>
                </div>
                <button 
                  onClick={() => setPreviewFile(null)}
                  aria-label={lang === 'sw' ? 'Funga faili' : 'Close file preview'}
                  className="h-10 w-10 rounded-full hover:bg-stone-100 flex items-center justify-center transition-colors"
                >
                  <XCircle size={24} className="text-stone-400" />
                </button>
              </div>
              <div className="flex-1 bg-stone-100 flex items-center justify-center p-12">
                <div className="text-center space-y-4">
                  <div className="h-24 w-24 bg-white rounded-3xl shadow-sm flex items-center justify-center mx-auto text-stone-300">
                    <FileText size={48} />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-stone-800">
                      {lang === 'sw' ? 'Hakiki ya Faili' : 'File Preview'}
                    </p>
                    <p className="text-sm text-stone-500 max-w-xs mx-auto">
                      {lang === 'sw' 
                        ? 'Katika toleo la majaribio, hakiki ya faili halisi imezimwa. Katika mfumo kamili, hapa utaona picha au PDF iliyopakiwa.' 
                        : 'In demo mode, actual file preview is simulated. In the full system, you would see the uploaded image or PDF here.'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-stone-100 flex justify-end">
                <button 
                  onClick={() => setPreviewFile(null)}
                  className="px-8 py-3 bg-stone-900 text-white rounded-xl font-bold transition-all"
                >
                  {lang === 'sw' ? 'Funga' : 'Close'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
