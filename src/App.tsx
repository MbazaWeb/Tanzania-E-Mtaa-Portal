import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  AlertCircle, 
} from 'lucide-react';
import { supabase, Service, Application } from './lib/supabase';
import { useAuth } from './context/AuthContext';
import { useLanguage } from './context/LanguageContext';
import { useApplications } from './hooks/useApplications';
import { useToast } from './context/ToastContext';

// Components
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { PaymentGateway } from './components/PaymentGateway';
import { VerifyDocuments } from './components/VerifyDocuments';
import { StaffManagement } from './components/StaffManagement';
import { ApplicationReview } from './components/ApplicationReview';
import { ConfirmationModal } from './components/ui/ConfirmationModal';

// Pages
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { Services } from './pages/Services';
import { Apply } from './pages/Apply';
import { Applications } from './pages/Applications';
import { Profile } from './pages/Profile';
import { Auth } from './pages/Auth';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { OfficeManagement } from './pages/admin/OfficeManagement';
import { LocationManagement } from './pages/admin/LocationManagement';
import { ServiceManagement } from './pages/admin/ServiceManagement';
import { AdminLogs } from './pages/admin/AdminLogs';
import { CitizenManagement } from './pages/admin/CitizenManagement';

// Staff Pages
import { StaffDashboard } from './pages/staff/StaffDashboard';
import { CustomerSupport } from './pages/staff/CustomerSupport';
import { ManualVerification } from './pages/staff/ManualVerification';
import { StaffCitizenManagement } from './pages/staff/CitizenManagement';

// Agreement Verification
import { VerifyAgreement } from './pages/VerifyAgreement';

export default function App() {
  const { user, loading: authLoading } = useAuth();
  const { lang, t, currency } = useLanguage();
  const { showToast } = useToast();
  const { applications, fetchApplications } = useApplications(user);

  const [view, setView] = useState<'dashboard' | 'services' | 'apply' | 'applications' | 'staff_management' | 'application_review' | 'verify_purchase' | 'application_details' | 'profile' | 'verify_documents' | 'verify_agreement' | 'admin_dashboard' | 'office_management' | 'location_management' | 'service_management' | 'staff_dashboard' | 'customer_support' | 'manual_verification' | 'admin_logs' | 'citizen_management'>('dashboard');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [payingApplication, setPayingApplication] = useState<Application | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [showAuth, setShowAuth] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [showPublicVerify, setShowPublicVerify] = useState(false);

  const isSupabaseConfigured = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY;

  // Helper function to get the correct payment amount
  const getPaymentAmount = (app: Application): number => {
    const serviceFee = (app as any).services?.fee || 0;
    const formServiceFee = app.form_data?.service_fee;
    
    // If service has a fixed fee > 0, use it
    if (serviceFee > 0) return serviceFee;
    
    // For percentage-based services, use the calculated service_fee from form_data
    if (formServiceFee && typeof formServiceFee === 'number') return formServiceFee;
    if (formServiceFee && typeof formServiceFee === 'string') {
      const parsed = parseFloat(formServiceFee);
      if (!isNaN(parsed)) return parsed;
    }
    return 0;
  };

  // Redirect to appropriate dashboard based on user role
  useEffect(() => {
    if (user && user.role) {
      console.log('User role detected:', user.role, 'Current view:', view);
      if (user.role === 'admin' && view !== 'admin_dashboard') {
        console.log('Redirecting to admin_dashboard');
        setView('admin_dashboard');
      } else if (user.role === 'staff' && view !== 'staff_dashboard') {
        console.log('Redirecting to staff_dashboard');
        setView('staff_dashboard');
      } else if (user.role === 'citizen' && view === 'admin_dashboard') {
        console.log('Redirecting to citizen dashboard');
        setView('dashboard');
      }
    }
  }, [user?.role]);

  // Force update when user changes
  useEffect(() => {
    if (user?.role === 'admin' && view === 'dashboard') {
      console.log('Force: Admin user on default dashboard, switching to admin_dashboard');
      setView('admin_dashboard');
    } else if (user?.role === 'staff' && view === 'dashboard') {
      console.log('Force: Staff user on default dashboard, switching to staff_dashboard');
      setView('staff_dashboard');
    }
  }, [user?.id]);

  const submitApplication = async (formData: any) => {
    if (!user || !selectedService) {
      console.error('Missing user or selectedService', { user, selectedService });
      return;
    }

    console.log('Submitting application:', { 
      user_id: user.id, 
      service_id: selectedService.id,
      service_name: selectedService.name 
    });

    // Generate service code from service name
    const getServiceCode = (name: string): string => {
      const uppercaseName = name.toUpperCase();
      if (uppercaseName.includes('MKAZI')) return 'MKZ';
      if (uppercaseName.includes('UTAMBULISHO')) return 'UTB';
      if (uppercaseName.includes('TUKIO')) return 'KIB';
      if (uppercaseName.includes('MAZISHI')) return 'MAZ';
      if (uppercaseName.includes('MAUZIANO')) return 'MUZ';
      if (uppercaseName.includes('PANGISHA') || uppercaseName.includes('PANGO')) return 'PNG';
      // Fallback: first 3 characters
      return name.replace(/[^A-Z]/gi, '').substring(0, 3).toUpperCase() || 'APP';
    };

    // Generate application number in format TZ-SERVICE-YYYYMMDD-XXXX
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const serviceCode = getServiceCode(selectedService.name);
    const applicationNumber = `TZ-${serviceCode}-${dateStr}-${randomNum}`;

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const isConfigured = supabaseUrl && !supabaseUrl.includes('YOUR_SUPABASE_URL') && !supabaseUrl.includes('bqxevbmjqvogebmlbidx');
    console.log('Supabase URL check:', { supabaseUrl, isConfigured, isDemoUser: user.id.startsWith('demo-') });

    if (!isConfigured || user.id.startsWith('demo-')) {
      console.log('Using demo mode for application');
      const newApp = {
        id: 'demo-app-' + Math.random().toString(36).substring(7),
        user_id: user.id,
        service_id: selectedService.id,
        service_name: selectedService.name,
        application_number: applicationNumber,
        form_data: formData,
        status: 'submitted',
        region: user.region,
        district: user.district,
        ward: user.ward,
        street: user.street,
        created_at: new Date().toISOString()
      };

      const existing = JSON.parse(localStorage.getItem('demo_applications') || '[]');
      localStorage.setItem('demo_applications', JSON.stringify([newApp, ...existing]));
      
      showToast(lang === 'sw' ? 'Maombi yametumwa kikamilifu!' : 'Application submitted successfully!', 'success');
      setView('applications');
      fetchApplications();
      return;
    }

    console.log('Submitting to Supabase...', {
      user_id: user.id,
      service_id: selectedService.id,
      service_name: selectedService.name || selectedService.name_en,
      application_number: applicationNumber
    });

    // Extract approval workflow data if present (supports both old and new field names)
    const targetUserId = formData.target_user_id || formData.second_party_user_id || null;
    const targetUserNida = formData.target_user_nida || null;
    const targetCitizenId = formData.second_party_citizen_id || null;
    const targetName = formData.second_party_name || null;
    const submitterRole = formData.submitter_role || null;
    
    // Auto-detect agreement workflow: if second_party_user_id is set via citizen_id_lookup, enable approval
    const hasSecondParty = !!formData.second_party_user_id;
    const sendForApproval = formData.send_for_approval === 'YES' || hasSecondParty;
    
    // Determine target_user_role based on submitter_role or asset_type
    let targetUserRole = null;
    if (sendForApproval) {
      if (submitterRole) {
        if (submitterRole === 'LANDLORD') targetUserRole = 'TENANT';
        else if (submitterRole === 'TENANT') targetUserRole = 'LANDLORD';
        else if (submitterRole === 'SELLER') targetUserRole = 'BUYER';
        else if (submitterRole === 'BUYER') targetUserRole = 'SELLER';
      } else if (formData.asset_type) {
        // For Mauziano service, infer roles from asset_type
        if (formData.asset_type.includes('PANGO')) {
          targetUserRole = 'TENANT'; // Submitter is landlord
        } else {
          targetUserRole = 'BUYER'; // Submitter is seller
        }
      }
    }

    const { error, data: insertedApp } = await supabase.from('applications').insert({
      user_id: user.id,
      service_id: selectedService.id,
      service_name: selectedService.name || selectedService.name_en,
      application_number: applicationNumber,
      form_data: formData,
      status: 'submitted',
      region: user.region || null,
      district: user.district || null,
      ward: user.ward || null,
      street: user.street || null,
      // Approval workflow columns
      target_user_id: sendForApproval ? targetUserId : null,
      target_user_nida: sendForApproval ? targetUserNida : null,
      target_user_role: sendForApproval ? targetUserRole : null,
      agreement_status: sendForApproval && targetUserId ? 'pending' : null
    }).select().single();

    if (error) {
      console.error('Application submission error:', error);
      showToast(lang === 'sw' ? `Hitilafu: ${error.message}` : `Error: ${error.message}`, 'error');
      return;
    }

    // Send notification to target user if approval workflow is enabled
    if (sendForApproval && targetUserId && insertedApp) {
      try {
        // Determine agreement type for notification
        const assetType = formData.asset_type || '';
        const isRental = assetType.includes('PANGO');
        const agreementTypeSwahili = isRental ? 'Makubaliano ya Upangishaji' : 'Makubaliano ya Mauziano';
        const agreementTypeEnglish = isRental ? 'Rental Agreement' : 'Sales Agreement';
        const roleSwahili = isRental ? 'Mpangaji' : 'Mnunuzi';
        const roleEnglish = isRental ? 'Tenant' : 'Buyer';
        
        await supabase.from('notifications').insert({
          user_id: targetUserId,
          title: lang === 'sw' 
            ? `${agreementTypeSwahili} - Idhini Inahitajika` 
            : `${agreementTypeEnglish} - Approval Required`,
          message: lang === 'sw' 
            ? `Umechaguliwa kama ${roleSwahili} katika makubaliano (${applicationNumber}) na ${user.first_name || user.email || 'mtumiaji'}. Mali: ${formData.asset_description || assetType}. Tafadhali ingia kwenye mfumo ili kuidhinisha makubaliano haya. Makubaliano hayatakamilika mpaka PANDE ZOTE MBILI zikubali.`
            : `You have been selected as ${roleEnglish} in an agreement (${applicationNumber}) by ${user.first_name || user.email || 'a user'}. Asset: ${formData.asset_description || assetType}. Please log in to approve this agreement. The agreement will not be finalized until BOTH PARTIES accept.`,
          type: 'info'
        });
      } catch (notifError) {
        console.error('Failed to send notification:', notifError);
        // Don't fail the whole submission if notification fails
      }
    }

    showToast(lang === 'sw' ? 'Maombi yametumwa kikamilifu!' : 'Application submitted successfully!', 'success');
    setView('applications');
    fetchApplications();
  };

  const handlePaymentSuccess = async (paymentData: any) => {
    if (!payingApplication) return;
    
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const isConfigured = supabaseUrl && !supabaseUrl.includes('YOUR_SUPABASE_URL') && !supabaseUrl.includes('bqxevbmjqvogebmlbidx');

    // Payment data to store
    const paymentInfo = {
      transaction_id: paymentData?.transaction_id || `TXN-${Date.now()}`,
      amount: paymentData?.amount || 0,
      payment_method: paymentData?.payment_method || 'unknown',
      paid_at: paymentData?.paid_at || new Date().toISOString()
    };

    if (!isConfigured || user?.id.startsWith('demo-')) {
      const existing = JSON.parse(localStorage.getItem('demo_applications') || '[]');
      const updated = existing.map((app: any) => 
        app.id === payingApplication.id ? { 
          ...app, 
          status: 'paid', 
          paid_at: new Date().toISOString(),
          payment_data: paymentInfo
        } : app
      );
      localStorage.setItem('demo_applications', JSON.stringify(updated));
      
      setPayingApplication(null);
      fetchApplications();
      showToast(lang === 'sw' ? 'Malipo yamepokelewa! Inasubiri uthibitisho wa Mtumishi.' : 'Payment received! Awaiting staff verification.', 'success');
      return;
    }

    // Store payment data inside form_data to avoid needing new columns
    const updatedFormData = {
      ...(payingApplication.form_data || {}),
      payment_data: paymentInfo
    };

    const { error } = await supabase
      .from('applications')
      .update({ 
        status: 'paid',
        form_data: updatedFormData
      })
      .eq('id', payingApplication.id);
    
    if (error) {
      console.error('Payment update error:', error);
      showToast(lang === 'sw' ? 'Hitilafu imetokea wakati wa kusasisha malipo.' : 'An error occurred while updating payment.', 'error');
      return;
    }
    
    setPayingApplication(null);
    fetchApplications();
    showToast(lang === 'sw' ? 'Malipo yamepokelewa! Inasubiri uthibitisho wa Mtumishi.' : 'Payment received! Awaiting staff verification.', 'success');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-stone-500 font-bold animate-pulse">E-MTAA PORTAL...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Show public verify documents page if requested
    if (showPublicVerify) {
      return (
        <div className="min-h-screen bg-stone-50">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-8 px-4 max-w-5xl mx-auto"
          >
            <VerifyDocuments lang={lang} onBack={() => setShowPublicVerify(false)} userRole="citizen" />
          </motion.div>
        </div>
      );
    }

    return (
      <>
        <Landing onShowAuth={(mode) => { setAuthMode(mode); setShowAuth(true); }} onShowVerify={() => setShowPublicVerify(true)} />
        <AnimatePresence>
          {showAuth && (
            <Auth 
              mode={authMode} 
              onClose={() => setShowAuth(false)} 
              setMode={setAuthMode} 
            />
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {/* Supabase Configuration Warning */}
      {!isSupabaseConfigured && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 flex items-center justify-center gap-3 text-amber-800 text-sm font-medium animate-fade-in">
          <AlertCircle size={18} className="text-amber-600 shrink-0" />
          <p>
            {lang === 'sw' 
              ? 'Supabase haijasanidiwa. Tafadhali weka VITE_SUPABASE_URL na VITE_SUPABASE_ANON_KEY kwenye .env' 
              : 'Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env'}
          </p>
        </div>
      )}

      <Header onMenuClick={() => setIsMobileNavOpen(true)} />

      <MobileNav 
        isOpen={isMobileNavOpen} 
        onClose={() => setIsMobileNavOpen(false)} 
        currentView={view}
        setView={setView}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar currentView={view} setView={setView} />

        <main className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {view === 'dashboard' && (
              <Dashboard applications={applications} setView={setView} onRefresh={fetchApplications} />
            )}

            {view === 'admin_dashboard' && user?.role === 'admin' && (
              <AdminDashboard setView={setView} />
            )}

            {view === 'staff_dashboard' && user?.role === 'staff' && (
              <StaffDashboard setView={setView} />
            )}

            {view === 'office_management' && user?.role === 'admin' && (
              <OfficeManagement />
            )}

            {view === 'location_management' && user?.role === 'admin' && (
              <LocationManagement />
            )}

            {view === 'service_management' && user?.role === 'admin' && (
              <ServiceManagement />
            )}

            {view === 'customer_support' && user?.role === 'staff' && (
              <CustomerSupport />
            )}

            {view === 'manual_verification' && user?.role === 'staff' && (
              <ManualVerification />
            )}

            {view === 'admin_logs' && user?.role === 'admin' && (
              <AdminLogs />
            )}

            {view === 'citizen_management' && (
              user?.role === 'admin' ? <CitizenManagement /> : 
              user?.role === 'staff' ? <StaffCitizenManagement /> : null
            )}

            {view === 'services' && (
              <Services onSelectService={(service) => {
                setSelectedService(service);
                setView('apply');
              }} onRefresh={fetchApplications} />
            )}

            {view === 'apply' && selectedService && (
              <Apply 
                selectedService={selectedService} 
                onBack={() => setView('services')} 
                onSubmit={submitApplication} 
              />
            )}

            {view === 'verify_documents' && (
              <motion.div 
                key="verify_documents"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="py-12"
              >
                <VerifyDocuments lang={lang} onBack={() => setView('dashboard')} userRole={user?.role || 'citizen'} />
              </motion.div>
            )}

            {view === 'verify_agreement' && (
              <motion.div 
                key="verify_agreement"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <VerifyAgreement lang={lang} onBack={() => setView('dashboard')} />
              </motion.div>
            )}

            {view === 'applications' && (
              <Applications 
                applications={applications} 
                onPay={setPayingApplication} 
                onRefresh={fetchApplications}
              />
            )}

            {view === 'staff_management' && user?.role === 'admin' && (
              <motion.div 
                key="staff_management"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <StaffManagement lang={lang} />
              </motion.div>
            )}

            {view === 'application_review' && user?.role !== 'citizen' && (
              <motion.div 
                key="application_review"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <ApplicationReview lang={lang} user={user} />
              </motion.div>
            )}

            {view === 'profile' && (
              <Profile />
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Payment Gateway Modal */}
      <AnimatePresence>
        {payingApplication && (
          <PaymentGateway 
            applicationId={payingApplication.id}
            amount={getPaymentAmount(payingApplication)}
            onSuccess={handlePaymentSuccess}
            onCancel={() => setPayingApplication(null)}
            lang={lang}
            currency={currency}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
