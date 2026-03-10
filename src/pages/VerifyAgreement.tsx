import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Home, 
  Car, 
  Building2,
  MapPin,
  User,
  Phone,
  CreditCard,
  Calendar,
  Shield,
  ArrowRight,
  XCircle
} from 'lucide-react';
import { supabase, Application } from '@/src/lib/supabase';
import { useToast } from '@/src/context/ToastContext';
import { formatCurrency } from '@/src/lib/currency';
import { HARDCODED_SERVICES } from '@/src/constants/services';

interface VerifyAgreementProps {
  lang: 'sw' | 'en';
  onBack?: () => void;
}

type AgreementType = 'PANGISHA' | 'MAUZIANO';
type VerificationStatus = 'idle' | 'searching' | 'found' | 'not_found' | 'confirming' | 'confirmed' | 'error';

export const VerifyAgreement: React.FC<VerifyAgreementProps> = ({ lang, onBack }) => {
  const { showToast } = useToast();
  const [applicationNumber, setApplicationNumber] = useState('');
  const [agreementType, setAgreementType] = useState<AgreementType>('PANGISHA');
  const [status, setStatus] = useState<VerificationStatus>('idle');
  const [application, setApplication] = useState<Application | null>(null);
  const [error, setError] = useState('');
  
  // Confirmation form fields
  const [confirmantName, setConfirmantName] = useState('');
  const [confirmantNida, setConfirmantNida] = useState('');
  const [confirmantPhone, setConfirmantPhone] = useState('');
  const [confirmantRole, setConfirmantRole] = useState<'tenant' | 'landlord' | 'buyer' | 'seller'>('tenant');
  const [confirmationChecked, setConfirmationChecked] = useState(false);

  const getServiceById = (serviceId: string) => {
    return HARDCODED_SERVICES.find(s => s.id === serviceId) || null;
  };

  const handleSearch = async () => {
    if (!applicationNumber.trim()) {
      showToast(lang === 'sw' ? 'Tafadhali ingiza namba ya ombi' : 'Please enter application number', 'error');
      return;
    }

    setStatus('searching');
    setError('');
    setApplication(null);

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const isConfigured = supabaseUrl && !supabaseUrl.includes('YOUR_SUPABASE_URL') && !supabaseUrl.includes('bqxevbmjqvogebmlbidx');

    if (!isConfigured) {
      // Demo mode
      await new Promise(resolve => setTimeout(resolve, 1000));
      const demoApps = JSON.parse(localStorage.getItem('demo_applications') || '[]');
      const found = demoApps.find((app: any) => 
        app.application_number?.toLowerCase() === applicationNumber.toLowerCase()
      );

      if (found) {
        const service = getServiceById(found.service_id);
        // Check if it's the right type of agreement
        const serviceName = service?.name?.toUpperCase() || '';
        const isValidType = (agreementType === 'PANGISHA' && serviceName.includes('PANGISHA')) ||
                          (agreementType === 'MAUZIANO' && serviceName.includes('MAUZIANO'));
        
        if (!isValidType) {
          setStatus('not_found');
          setError(lang === 'sw' 
            ? `Ombi hili si la ${agreementType === 'PANGISHA' ? 'Pango' : 'Mauziano'}` 
            : `This application is not for ${agreementType === 'PANGISHA' ? 'Rent Agreement' : 'Sales Agreement'}`);
          return;
        }

        setApplication({ ...found, services: service });
        setStatus('found');
      } else {
        setStatus('not_found');
        setError(lang === 'sw' ? 'Ombi halijapatikana' : 'Application not found');
      }
      return;
    }

    // Real database search
    try {
      const { data, error: fetchError } = await supabase
        .from('applications')
        .select('*')
        .eq('application_number', applicationNumber.toUpperCase())
        .single();

      if (fetchError || !data) {
        setStatus('not_found');
        setError(lang === 'sw' ? 'Ombi halijapatikana' : 'Application not found');
        return;
      }

      const service = getServiceById(data.service_id);
      const serviceName = service?.name?.toUpperCase() || data.service_name?.toUpperCase() || '';
      
      const isValidType = (agreementType === 'PANGISHA' && serviceName.includes('PANGISHA')) ||
                        (agreementType === 'MAUZIANO' && serviceName.includes('MAUZIANO'));
      
      if (!isValidType) {
        setStatus('not_found');
        setError(lang === 'sw' 
          ? `Ombi hili si la ${agreementType === 'PANGISHA' ? 'Pango' : 'Mauziano'}` 
          : `This application is not for ${agreementType === 'PANGISHA' ? 'Rent Agreement' : 'Sales Agreement'}`);
        return;
      }

      setApplication({ ...data, services: service });
      setStatus('found');
    } catch (err) {
      console.error('Search error:', err);
      setStatus('error');
      setError(lang === 'sw' ? 'Hitilafu katika kutafuta' : 'Error searching');
    }
  };

  const handleConfirm = async () => {
    if (!confirmantName || !confirmantNida || !confirmantPhone) {
      showToast(lang === 'sw' ? 'Tafadhali jaza taarifa zote' : 'Please fill all fields', 'error');
      return;
    }

    if (!confirmationChecked) {
      showToast(lang === 'sw' ? 'Tafadhali kubali masharti' : 'Please accept the terms', 'error');
      return;
    }

    setStatus('confirming');

    const confirmationData = {
      confirmant_name: confirmantName,
      confirmant_nida: confirmantNida,
      confirmant_phone: confirmantPhone,
      confirmant_role: confirmantRole,
      confirmed_at: new Date().toISOString()
    };

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const isConfigured = supabaseUrl && !supabaseUrl.includes('YOUR_SUPABASE_URL') && !supabaseUrl.includes('bqxevbmjqvogebmlbidx');

    if (!isConfigured) {
      // Demo mode
      await new Promise(resolve => setTimeout(resolve, 1500));
      const demoApps = JSON.parse(localStorage.getItem('demo_applications') || '[]');
      const updated = demoApps.map((app: any) => 
        app.id === application?.id 
          ? { 
              ...app, 
              confirmation_data: confirmationData,
              is_confirmed: true
            } 
          : app
      );
      localStorage.setItem('demo_applications', JSON.stringify(updated));
      setStatus('confirmed');
      showToast(lang === 'sw' ? 'Uthibitisho umekamilika!' : 'Confirmation completed!', 'success');
      return;
    }

    try {
      const { error: updateError } = await supabase
        .from('applications')
        .update({
          confirmation_data: confirmationData,
          is_confirmed: true
        })
        .eq('id', application?.id);

      if (updateError) {
        throw updateError;
      }

      setStatus('confirmed');
      showToast(lang === 'sw' ? 'Uthibitisho umekamilika!' : 'Confirmation completed!', 'success');
    } catch (err) {
      console.error('Confirmation error:', err);
      setStatus('error');
      setError(lang === 'sw' ? 'Hitilafu katika kuthibitisha' : 'Error confirming');
      showToast(lang === 'sw' ? 'Hitilafu katika kuthibitisha' : 'Error confirming', 'error');
    }
  };

  const resetForm = () => {
    setApplicationNumber('');
    setStatus('idle');
    setApplication(null);
    setError('');
    setConfirmantName('');
    setConfirmantNida('');
    setConfirmantPhone('');
    setConfirmationChecked(false);
  };

  const formData = application?.form_data || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-emerald-50/30 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-2xl mb-4">
            <Shield className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-heading font-extrabold text-stone-900 mb-2">
            {lang === 'sw' ? 'Thibitisha Makubaliano' : 'Verify Agreement'}
          </h1>
          <p className="text-stone-500 max-w-lg mx-auto">
            {lang === 'sw' 
              ? 'Thibitisha ombi la pango au mauziano kwa kutumia namba ya ombi la awali'
              : 'Verify a rent or sales agreement using the original application number'}
          </p>
        </motion.div>

        {/* Agreement Type Selection */}
        {status === 'idle' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-stone-200 shadow-xl p-8 mb-6"
          >
            <h2 className="text-lg font-bold text-stone-800 mb-4">
              {lang === 'sw' ? 'Chagua Aina ya Makubaliano' : 'Select Agreement Type'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <button
                onClick={() => setAgreementType('PANGISHA')}
                className={`p-6 rounded-2xl border-2 transition-all flex items-center gap-4 ${
                  agreementType === 'PANGISHA'
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                  agreementType === 'PANGISHA' ? 'bg-emerald-500 text-white' : 'bg-stone-100 text-stone-500'
                }`}>
                  <Home className="w-7 h-7" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-stone-800">PANGISHA</p>
                  <p className="text-sm text-stone-500">
                    {lang === 'sw' ? 'Makubaliano ya Pango' : 'Rent Agreement'}
                  </p>
                </div>
              </button>

              <button
                onClick={() => setAgreementType('MAUZIANO')}
                className={`p-6 rounded-2xl border-2 transition-all flex items-center gap-4 ${
                  agreementType === 'MAUZIANO'
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                  agreementType === 'MAUZIANO' ? 'bg-emerald-500 text-white' : 'bg-stone-100 text-stone-500'
                }`}>
                  <CreditCard className="w-7 h-7" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-stone-800">MAUZIANO</p>
                  <p className="text-sm text-stone-500">
                    {lang === 'sw' ? 'Makubaliano ya Mauziano' : 'Sales Agreement'}
                  </p>
                </div>
              </button>
            </div>

            {/* Search Input */}
            <div className="space-y-4">
              <label className="block text-sm font-bold text-stone-700">
                {lang === 'sw' ? 'Namba ya Ombi' : 'Application Number'}
              </label>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                  <input
                    type="text"
                    value={applicationNumber}
                    onChange={(e) => setApplicationNumber(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="TZ-PNG-20260310-1234"
                    className="w-full pl-12 pr-4 h-14 rounded-xl border border-stone-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-lg font-mono"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  disabled={status === 'searching'}
                  className="h-14 px-8 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {status === 'searching' ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      {lang === 'sw' ? 'Tafuta' : 'Search'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Not Found / Error */}
        {(status === 'not_found' || status === 'error') && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl border border-red-200 shadow-xl p-8 text-center"
          >
            <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-stone-800 mb-2">
              {lang === 'sw' ? 'Ombi Halijapatikana' : 'Application Not Found'}
            </h3>
            <p className="text-stone-500 mb-6">{error}</p>
            <button
              onClick={resetForm}
              className="px-6 py-3 bg-stone-100 text-stone-700 rounded-xl font-semibold hover:bg-stone-200 transition-all"
            >
              {lang === 'sw' ? 'Jaribu Tena' : 'Try Again'}
            </button>
          </motion.div>
        )}

        {/* Application Found - Show Details & Confirmation Form */}
        {status === 'found' && application && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Application Details Card */}
            <div className="bg-white rounded-3xl border border-stone-200 shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-white" />
                    <div>
                      <p className="text-white/80 text-sm">
                        {lang === 'sw' ? 'Namba ya Ombi' : 'Application Number'}
                      </p>
                      <p className="text-white font-bold font-mono">{application.application_number}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-white/20 text-white rounded-full text-sm font-semibold">
                    {agreementType === 'PANGISHA' ? 'PANGO' : 'MAUZIANO'}
                  </span>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Property/Asset Details */}
                <div>
                  <h3 className="text-sm font-bold text-stone-500 uppercase tracking-wider mb-3">
                    {agreementType === 'PANGISHA' 
                      ? (lang === 'sw' ? 'Taarifa za Nyumba' : 'Property Details')
                      : (lang === 'sw' ? 'Taarifa za Mali' : 'Asset Details')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {agreementType === 'PANGISHA' ? (
                      <>
                        <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl">
                          <Home className="w-5 h-5 text-emerald-600" />
                          <div>
                            <p className="text-xs text-stone-500">{lang === 'sw' ? 'Aina ya Nyumba' : 'Property Type'}</p>
                            <p className="font-semibold text-stone-800">{formData.property_type || formData.house_type || '-'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl">
                          <Building2 className="w-5 h-5 text-emerald-600" />
                          <div>
                            <p className="text-xs text-stone-500">{lang === 'sw' ? 'Namba ya Nyumba' : 'House Number'}</p>
                            <p className="font-semibold text-stone-800">{formData.house_number || '-'}</p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl">
                          {formData.asset_type === 'GARI' ? <Car className="w-5 h-5 text-emerald-600" /> : <Home className="w-5 h-5 text-emerald-600" />}
                          <div>
                            <p className="text-xs text-stone-500">{lang === 'sw' ? 'Aina ya Mali' : 'Asset Type'}</p>
                            <p className="font-semibold text-stone-800">{formData.asset_type || '-'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl">
                          <CreditCard className="w-5 h-5 text-emerald-600" />
                          <div>
                            <p className="text-xs text-stone-500">{lang === 'sw' ? 'Bei ya Mauziano' : 'Sale Price'}</p>
                            <p className="font-semibold text-stone-800">{formatCurrency(formData.sale_price || 0, 'TZS')}</p>
                          </div>
                        </div>
                      </>
                    )}
                    <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl md:col-span-2">
                      <MapPin className="w-5 h-5 text-emerald-600" />
                      <div>
                        <p className="text-xs text-stone-500">{lang === 'sw' ? 'Mahali' : 'Location'}</p>
                        <p className="font-semibold text-stone-800">
                          {[formData.street, formData.ward, formData.district, formData.region].filter(Boolean).join(', ') || '-'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Parties Information */}
                <div>
                  <h3 className="text-sm font-bold text-stone-500 uppercase tracking-wider mb-3">
                    {lang === 'sw' ? 'Wahusika' : 'Parties Involved'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {agreementType === 'PANGISHA' ? (
                      <>
                        <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                          <p className="text-xs text-blue-600 font-semibold mb-1">
                            {lang === 'sw' ? 'MWENYE NYUMBA' : 'LANDLORD'}
                          </p>
                          <p className="font-bold text-stone-800">{formData.landlord_name || '-'}</p>
                          <p className="text-sm text-stone-500">NIDA: {formData.landlord_nida || '-'}</p>
                        </div>
                        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                          <p className="text-xs text-emerald-600 font-semibold mb-1">
                            {lang === 'sw' ? 'MPANGAJI' : 'TENANT'}
                          </p>
                          <p className="font-bold text-stone-800">{formData.tenant_name || '-'}</p>
                          <p className="text-sm text-stone-500">NIDA: {formData.tenant_nida || '-'}</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                          <p className="text-xs text-blue-600 font-semibold mb-1">
                            {lang === 'sw' ? 'MUUZAJI' : 'SELLER'}
                          </p>
                          <p className="font-bold text-stone-800">{formData.seller_name || '-'}</p>
                          <p className="text-sm text-stone-500">TIN: {formData.seller_tin || '-'}</p>
                        </div>
                        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                          <p className="text-xs text-emerald-600 font-semibold mb-1">
                            {lang === 'sw' ? 'MNUNUZI' : 'BUYER'}
                          </p>
                          <p className="font-bold text-stone-800">{formData.buyer_name || '-'}</p>
                          <p className="text-sm text-stone-500">NIDA: {formData.buyer_nida || '-'}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Financial Details */}
                <div>
                  <h3 className="text-sm font-bold text-stone-500 uppercase tracking-wider mb-3">
                    {lang === 'sw' ? 'Taarifa za Malipo' : 'Payment Details'}
                  </h3>
                  <div className="bg-stone-50 rounded-xl p-4">
                    {agreementType === 'PANGISHA' ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div>
                          <p className="text-xs text-stone-500">{lang === 'sw' ? 'Kodi/Mwezi' : 'Monthly Rent'}</p>
                          <p className="font-bold text-stone-800">{formatCurrency(formData.monthly_rent || 0, 'TZS')}</p>
                        </div>
                        <div>
                          <p className="text-xs text-stone-500">{lang === 'sw' ? 'Miezi' : 'Months'}</p>
                          <p className="font-bold text-stone-800">{formData.payment_period || '-'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-stone-500">VAT (18%)</p>
                          <p className="font-bold text-stone-800">{formatCurrency(formData.vat_amount || 0, 'TZS')}</p>
                        </div>
                        <div>
                          <p className="text-xs text-stone-500">{lang === 'sw' ? 'Jumla' : 'Total'}</p>
                          <p className="font-bold text-emerald-600">{formatCurrency(formData.total_rent || 0, 'TZS')}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div>
                          <p className="text-xs text-stone-500">{lang === 'sw' ? 'Bei' : 'Price'}</p>
                          <p className="font-bold text-stone-800">{formatCurrency(formData.sale_price || 0, 'TZS')}</p>
                        </div>
                        <div>
                          <p className="text-xs text-stone-500">VAT (18%)</p>
                          <p className="font-bold text-stone-800">{formatCurrency(formData.vat_amount || 0, 'TZS')}</p>
                        </div>
                        <div>
                          <p className="text-xs text-stone-500">{lang === 'sw' ? 'Ada (5%)' : 'Fee (5%)'}</p>
                          <p className="font-bold text-stone-800">{formatCurrency(formData.service_fee || 0, 'TZS')}</p>
                        </div>
                        <div>
                          <p className="text-xs text-stone-500">{lang === 'sw' ? 'Jumla' : 'Total'}</p>
                          <p className="font-bold text-emerald-600">{formatCurrency(formData.total_amount || 0, 'TZS')}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Confirmation Form */}
            <div className="bg-white rounded-3xl border border-stone-200 shadow-xl p-6">
              <h3 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                {lang === 'sw' ? 'Thibitisha Ushiriki Wako' : 'Confirm Your Participation'}
              </h3>

              <div className="space-y-4">
                {/* Role Selection */}
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">
                    {lang === 'sw' ? 'Wewe ni nani katika makubaliano haya?' : 'What is your role in this agreement?'}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {agreementType === 'PANGISHA' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setConfirmantRole('tenant')}
                          className={`p-3 rounded-xl border-2 transition-all ${
                            confirmantRole === 'tenant' 
                              ? 'border-emerald-500 bg-emerald-50' 
                              : 'border-stone-200 hover:border-stone-300'
                          }`}
                        >
                          <p className="font-semibold text-stone-800">{lang === 'sw' ? 'Mpangaji' : 'Tenant'}</p>
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmantRole('landlord')}
                          className={`p-3 rounded-xl border-2 transition-all ${
                            confirmantRole === 'landlord' 
                              ? 'border-emerald-500 bg-emerald-50' 
                              : 'border-stone-200 hover:border-stone-300'
                          }`}
                        >
                          <p className="font-semibold text-stone-800">{lang === 'sw' ? 'Mwenye Nyumba' : 'Landlord'}</p>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => setConfirmantRole('buyer')}
                          className={`p-3 rounded-xl border-2 transition-all ${
                            confirmantRole === 'buyer' 
                              ? 'border-emerald-500 bg-emerald-50' 
                              : 'border-stone-200 hover:border-stone-300'
                          }`}
                        >
                          <p className="font-semibold text-stone-800">{lang === 'sw' ? 'Mnunuzi' : 'Buyer'}</p>
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmantRole('seller')}
                          className={`p-3 rounded-xl border-2 transition-all ${
                            confirmantRole === 'seller' 
                              ? 'border-emerald-500 bg-emerald-50' 
                              : 'border-stone-200 hover:border-stone-300'
                          }`}
                        >
                          <p className="font-semibold text-stone-800">{lang === 'sw' ? 'Muuzaji' : 'Seller'}</p>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Personal Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-2">
                      <User className="w-4 h-4 inline mr-1" />
                      {lang === 'sw' ? 'Jina Kamili' : 'Full Name'}
                    </label>
                    <input
                      type="text"
                      value={confirmantName}
                      onChange={(e) => setConfirmantName(e.target.value)}
                      placeholder={lang === 'sw' ? 'Ingiza jina lako kamili' : 'Enter your full name'}
                      className="w-full p-3 border border-stone-200 rounded-xl focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-2">
                      <CreditCard className="w-4 h-4 inline mr-1" />
                      {lang === 'sw' ? 'Namba ya NIDA' : 'NIDA Number'}
                    </label>
                    <input
                      type="text"
                      value={confirmantNida}
                      onChange={(e) => setConfirmantNida(e.target.value)}
                      placeholder="19XXXXXXXXXX"
                      className="w-full p-3 border border-stone-200 rounded-xl focus:border-emerald-500 outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">
                    <Phone className="w-4 h-4 inline mr-1" />
                    {lang === 'sw' ? 'Namba ya Simu' : 'Phone Number'}
                  </label>
                  <input
                    type="tel"
                    value={confirmantPhone}
                    onChange={(e) => setConfirmantPhone(e.target.value)}
                    placeholder="+255 7XX XXX XXX"
                    className="w-full p-3 border border-stone-200 rounded-xl focus:border-emerald-500 outline-none"
                  />
                </div>

                {/* Terms Checkbox */}
                <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <input
                    type="checkbox"
                    id="confirm-terms"
                    checked={confirmationChecked}
                    onChange={(e) => setConfirmationChecked(e.target.checked)}
                    className="mt-1 w-5 h-5 text-emerald-600 rounded"
                  />
                  <label htmlFor="confirm-terms" className="text-sm text-stone-700">
                    {lang === 'sw' 
                      ? 'Ninathibitisha kuwa taarifa zilizo hapo juu ni sahihi na ninakubali kushiriki katika makubaliano haya. Naelewa kuwa taarifa za uongo zinaweza kusababisha hatua za kisheria.'
                      : 'I confirm that the information above is accurate and I agree to participate in this agreement. I understand that false information may result in legal action.'}
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={resetForm}
                    className="flex-1 py-4 bg-stone-100 text-stone-700 rounded-xl font-semibold hover:bg-stone-200 transition-all"
                  >
                    {lang === 'sw' ? 'Ghairi' : 'Cancel'}
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={status === 'confirming' || !confirmationChecked}
                    className="flex-1 py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {status === 'confirming' ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        {lang === 'sw' ? 'Thibitisha Makubaliano' : 'Confirm Agreement'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Confirmation Success */}
        {status === 'confirmed' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl border border-emerald-200 shadow-xl p-8 text-center"
          >
            <div className="w-20 h-20 mx-auto bg-emerald-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-10 h-10 text-emerald-500" />
            </div>
            <h3 className="text-2xl font-bold text-stone-800 mb-2">
              {lang === 'sw' ? 'Uthibitisho Umekamilika!' : 'Confirmation Complete!'}
            </h3>
            <p className="text-stone-500 mb-6 max-w-md mx-auto">
              {lang === 'sw' 
                ? 'Umefanikiwa kuthibitisha ushiriki wako katika makubaliano haya. Utapokea ujumbe wa uthibitisho.'
                : 'You have successfully confirmed your participation in this agreement. You will receive a confirmation message.'}
            </p>
            <div className="bg-stone-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-stone-500">{lang === 'sw' ? 'Namba ya Ombi' : 'Application Number'}</p>
              <p className="text-xl font-mono font-bold text-stone-800">{application?.application_number}</p>
            </div>
            <button
              onClick={resetForm}
              className="px-8 py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all inline-flex items-center gap-2"
            >
              {lang === 'sw' ? 'Thibitisha Ombi Jingine' : 'Verify Another Agreement'}
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}

        {/* Back Button */}
        {onBack && (
          <div className="text-center mt-8">
            <button
              onClick={onBack}
              className="text-stone-500 hover:text-stone-700 font-semibold"
            >
              ← {lang === 'sw' ? 'Rudi Nyuma' : 'Go Back'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyAgreement;
