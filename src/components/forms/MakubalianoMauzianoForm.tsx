/**
 * Makubaliano ya Mauziano Form
 * Sale/Lease Agreement Form
 * 
 * Service: Makubaliano ya Mauziano
 * Fee: 3% of transaction value (min 5,000 TZS, max 500,000 TZS)
 */
import React, { useState, useRef, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { 
  Loader2, CheckCircle, ArrowLeft, ArrowRight, Eye, FileCheck, 
  Home, User, Users, FileSignature, Search, Upload, FileText, X,
  MapPin, DollarSign, Calendar, CreditCard, Phone, Mail, Bell, 
  Shield, Info, TrendingUp, AlertCircle
} from 'lucide-react';
import { FormProps, labels } from './types';
import { supabase } from '../../lib/supabase';

// Fee constants
const MIN_FEE = 5000;
const MAX_FEE = 500000;
const FEE_PERCENTAGE = 0.03;

// Asset type options
const ASSET_TYPES = [
  { label: 'Nyumba / House', value: 'HOUSE' },
  { label: 'Gari / Vehicle', value: 'VEHICLE' },
  { label: 'Ardhi / Land', value: 'LAND' },
  { label: 'Biashara / Business', value: 'BUSINESS' },
  { label: 'Vifaa / Equipment', value: 'EQUIPMENT' },
  { label: 'Nyingine / Other', value: 'OTHER' },
];

// Currency options
const CURRENCY_OPTIONS = [
  { label: 'TZS - Shilingi ya Tanzania', value: 'TZS' },
  { label: 'USD - Dola ya Marekani', value: 'USD' },
  { label: 'EUR - Euro', value: 'EUR' },
];

// Payment terms
const PAYMENT_TERMS = [
  { label: 'Malipo Kamili / Full Payment', value: 'FULL' },
  { label: 'Awamu / Installments', value: 'INSTALLMENTS' },
  { label: 'Kodi ya Mwezi / Monthly Rent', value: 'MONTHLY_RENT' },
  { label: 'Kodi ya Mwaka / Annual Rent', value: 'ANNUAL_RENT' },
];

interface FormData {
  asset_type: string;
  asset_description: string;
  asset_location: string;
  currency: string;
  sale_price: number;
  payment_terms: string;
  effective_date: string;
  expiry_date: string;
  seller_tin: string;
  seller_additional_contact: string;
  special_conditions: string;
  witness_name: string;
  witness_phone: string;
  witness_address: string;
  terms_accepted: boolean;
}

interface LookupResult {
  id: string;
  citizen_id: string;
  full_name: string;
  phone?: string;
  email?: string;
  region?: string;
  district?: string;
}

type Step = 'asset' | 'seller' | 'buyer' | 'terms' | 'review';

export const MakubalianoMauzianoForm: React.FC<FormProps> = ({
  onSubmit,
  isLoading,
  lang = 'sw',
  userProfile
}) => {
  const t = labels[lang];
  const [currentStep, setCurrentStep] = useState<Step>('asset');
  const [showReview, setShowReview] = useState(false);
  
  // Citizen lookup state
  const [citizenId, setCitizenId] = useState('');
  const [lookupResult, setLookupResult] = useState<LookupResult | null>(null);
  const [searching, setSearching] = useState(false);
  const [lookupError, setLookupError] = useState('');
  
  // File upload state
  const [agreementFile, setAgreementFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { register, handleSubmit, formState: { errors }, trigger, getValues, watch } = useForm<FormData>();

  const steps: { key: Step; label: string; swLabel: string }[] = [
    { key: 'asset', label: 'Asset Details', swLabel: 'Taarifa za Mali' },
    { key: 'seller', label: 'Seller Info', swLabel: 'Muuzaji' },
    { key: 'buyer', label: 'Buyer Lookup', swLabel: 'Tafuta Mnunuji' },
    { key: 'terms', label: 'Terms', swLabel: 'Masharti' },
    { key: 'review', label: 'Review', swLabel: 'Hakiki' },
  ];

  const currentStepIndex = steps.findIndex(s => s.key === currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  // Watch sale price for fee calculation
  const salePrice = watch('sale_price') || 0;
  const currency = watch('currency');

  // Calculate fee based on transaction value
  const feeBreakdown = useMemo(() => {
    if (salePrice <= 0) return null;
    
    const calculated = Math.round(salePrice * FEE_PERCENTAGE);
    const finalFee = Math.max(MIN_FEE, Math.min(MAX_FEE, calculated));
    
    return {
      calculated,
      finalFee,
      minFee: MIN_FEE,
      maxFee: MAX_FEE,
      percentage: FEE_PERCENTAGE * 100
    };
  }, [salePrice]);

  // Citizen lookup handler
  const handleCitizenLookup = async () => {
    if (!citizenId.trim()) {
      setLookupError(lang === 'sw' ? 'Tafadhali ingiza Namba ya Raia' : 'Please enter Citizen ID');
      return;
    }

    setSearching(true);
    setLookupError('');
    setLookupResult(null);

    try {
      const searchTerm = citizenId.trim().toUpperCase();
      
      // Search by citizen_id (CT ID format: CT2026A00001)
      let { data, error } = await supabase
        .from('users')
        .select('id, citizen_id, first_name, middle_name, last_name, phone, email, region, district')
        .eq('citizen_id', searchTerm)
        .single();

      // If not found by exact match, try ilike for case-insensitive search
      if (!data && !error?.message?.includes('multiple')) {
        const result = await supabase
          .from('users')
          .select('id, citizen_id, first_name, middle_name, last_name, phone, email, region, district')
          .ilike('citizen_id', searchTerm)
          .single();
        data = result.data;
        error = result.error;
      }

      if (error || !data) {
        setLookupError(lang === 'sw' 
          ? 'Mtumiaji hajapatikana. Hakikisha namba ni sahihi.' 
          : 'User not found. Please verify the ID.');
        return;
      }

      // Prevent selecting self
      if (userProfile && data.id === userProfile.id) {
        setLookupError(lang === 'sw' 
          ? 'Huwezi kuchagua wewe mwenyewe kama mhusika wa pili.' 
          : 'You cannot select yourself as the second party.');
        return;
      }

      setLookupResult({
        id: data.id,
        citizen_id: data.citizen_id,
        full_name: `${data.first_name} ${data.middle_name || ''} ${data.last_name}`.trim(),
        phone: data.phone,
        email: data.email,
        region: data.region,
        district: data.district
      });
    } catch {
      setLookupError(lang === 'sw' ? 'Hitilafu ya mtandao' : 'Network error');
    } finally {
      setSearching(false);
    }
  };

  // File upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert(lang === 'sw' ? 'Faili kubwa sana. Upeo ni 10MB.' : 'File too large. Maximum is 10MB.');
      return;
    }

    setAgreementFile(file);
    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `agreements/${Date.now()}_${userProfile?.id || 'unknown'}.${fileExt}`;

      const { error } = await supabase.storage
        .from('documents')
        .upload(fileName, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);

      setUploadedUrl(urlData.publicUrl);
    } catch {
      alert(lang === 'sw' ? 'Imeshindikana kupakia faili' : 'Failed to upload file');
      setAgreementFile(null);
    } finally {
      setUploading(false);
    }
  };

  // Step validation
  const validateCurrentStep = async (): Promise<boolean> => {
    let fieldsToValidate: (keyof FormData)[] = [];
    
    switch (currentStep) {
      case 'asset':
        fieldsToValidate = ['asset_type', 'asset_description', 'sale_price', 'currency', 'effective_date'];
        break;
      case 'seller':
        return true; // Optional fields
      case 'buyer':
        return !!lookupResult;
      case 'terms':
        fieldsToValidate = ['terms_accepted'];
        return !!uploadedUrl && await trigger(fieldsToValidate);
    }
    
    return trigger(fieldsToValidate);
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (isValid) {
      const nextIndex = currentStepIndex + 1;
      if (nextIndex < steps.length) {
        setCurrentStep(steps[nextIndex].key);
      }
      if (currentStep === 'terms') {
        setShowReview(true);
      }
    }
  };

  const handlePrevious = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].key);
    }
  };

  const onFormSubmit = async (data: FormData) => {
    if (!lookupResult || !feeBreakdown) return;

    const submitData = {
      ...data,
      service_fee: feeBreakdown.finalFee,
      buyer_id: lookupResult.id,
      buyer_citizen_id: lookupResult.citizen_id,
      buyer_name: lookupResult.full_name,
      agreement_document_url: uploadedUrl,
      seller_name: userProfile ? `${userProfile.first_name} ${userProfile.middle_name || ''} ${userProfile.last_name}`.trim() : '',
      seller_citizen_id: userProfile?.citizen_id || '',
    };

    onSubmit(submitData);
  };

  const confirmSubmit = () => {
    handleSubmit(onFormSubmit)();
  };

  // Styling classes
  const inputClass = "w-full p-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all";
  const labelClass = "block text-sm font-semibold text-stone-700 mb-1";
  const sectionClass = "bg-gradient-to-r from-emerald-100 to-teal-50 p-4 rounded-xl border border-emerald-200";

  // Progress bar component
  const ProgressBar = () => (
    <div className="mb-6">
      <div className="flex justify-between mb-2">
        {steps.map((step, index) => (
          <div 
            key={step.key}
            className={`flex items-center gap-1 text-xs font-medium ${
              index <= currentStepIndex ? 'text-emerald-600' : 'text-stone-400'
            }`}
          >
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
              index < currentStepIndex 
                ? 'bg-emerald-600 text-white' 
                : index === currentStepIndex 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-stone-200 text-stone-500'
            }`}>
              {index < currentStepIndex ? <CheckCircle className="h-4 w-4" /> : index + 1}
            </span>
            <span className="hidden md:inline">{lang === 'sw' ? step.swLabel : step.label}</span>
          </div>
        ))}
      </div>
      <div className="bg-stone-200 h-2 rounded-full overflow-hidden">
        <div
          className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );

  // Review section component
  const ReviewSection = () => {
    const data = getValues();
    
    return (
      <div className="space-y-6">
        <div className={sectionClass}>
          <h3 className="font-bold text-emerald-800 flex items-center gap-2">
            <Eye className="h-5 w-5" />
            {lang === 'sw' ? 'HAKIKI MAKUBALIANO' : 'REVIEW AGREEMENT'}
          </h3>
        </div>

        {/* Asset Summary */}
        <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-3">
          <h4 className="font-bold text-stone-800 flex items-center gap-2">
            <Home className="h-4 w-4" />
            {lang === 'sw' ? 'Taarifa za Mali' : 'Asset Details'}
          </h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-stone-500">{lang === 'sw' ? 'Aina:' : 'Type:'}</span>
              <p className="font-medium">{ASSET_TYPES.find(a => a.value === data.asset_type)?.label || data.asset_type}</p>
            </div>
            <div>
              <span className="text-stone-500">{lang === 'sw' ? 'Bei:' : 'Price:'}</span>
              <p className="font-medium">{Number(data.sale_price).toLocaleString()} {data.currency}</p>
            </div>
            <div className="col-span-2">
              <span className="text-stone-500">{lang === 'sw' ? 'Maelezo:' : 'Description:'}</span>
              <p className="font-medium">{data.asset_description}</p>
            </div>
          </div>
        </div>

        {/* Parties Summary */}
        <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-3">
          <h4 className="font-bold text-stone-800 flex items-center gap-2">
            <Users className="h-4 w-4" />
            {lang === 'sw' ? 'Pande za Makubaliano' : 'Agreement Parties'}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-emerald-50 p-3 rounded-lg">
              <span className="text-xs text-emerald-600 font-medium">{lang === 'sw' ? 'MUUZAJI / MPANGISHAJI' : 'SELLER / LANDLORD'}</span>
              <p className="font-bold text-emerald-800">
                {userProfile ? `${userProfile.first_name} ${userProfile.last_name}` : '-'}
              </p>
              <p className="text-sm text-emerald-600">{userProfile?.citizen_id || ''}</p>
            </div>
            <div className="bg-emerald-50 p-3 rounded-lg">
              <span className="text-xs text-emerald-600 font-medium">{lang === 'sw' ? 'MNUNUZI / MPANGAJI' : 'BUYER / TENANT'}</span>
              <p className="font-bold text-emerald-800">{lookupResult?.full_name || '-'}</p>
              <p className="text-sm text-emerald-600">{lookupResult?.citizen_id || ''}</p>
            </div>
          </div>
        </div>

        {/* Fee Summary */}
        {feeBreakdown && (
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4">
            <h4 className="font-bold text-emerald-800 mb-3">{lang === 'sw' ? 'Muhtasari wa Ada' : 'Fee Summary'}</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-emerald-700">{lang === 'sw' ? 'Thamani ya Mauziano:' : 'Transaction Value:'}</span>
                <span className="font-medium">{Number(data.sale_price).toLocaleString()} {data.currency}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-emerald-700">{lang === 'sw' ? 'Ada (3%):' : 'Fee (3%):'}</span>
                <span className="font-medium">{feeBreakdown.calculated.toLocaleString()} TZS</span>
              </div>
              {feeBreakdown.calculated !== feeBreakdown.finalFee && (
                <>
                  <div className="border-t border-emerald-200 my-2"></div>
                  <div className="flex justify-between text-emerald-600">
                    <span>{lang === 'sw' ? 'Kiwango cha Chini:' : 'Minimum Fee:'}</span>
                    <span>{feeBreakdown.minFee.toLocaleString()} TZS</span>
                  </div>
                  <div className="flex justify-between text-emerald-600">
                    <span>{lang === 'sw' ? 'Kiwango cha Juu:' : 'Maximum Fee:'}</span>
                    <span>{feeBreakdown.maxFee.toLocaleString()} TZS</span>
                  </div>
                </>
              )}
              
              <div className="border-t border-emerald-200 my-2"></div>
              <div className="flex justify-between font-bold text-lg">
                <span className="text-emerald-800">{lang === 'sw' ? 'Ada ya Mwisho:' : 'Final Fee:'}</span>
                <span className="text-emerald-600">{feeBreakdown.finalFee.toLocaleString()} TZS</span>
              </div>
            </div>
            
            <p className="text-xs text-emerald-600 mt-3">
              {lang === 'sw' 
                ? 'Ada ni 3% ya thamani ya mauziano (kiwango cha chini 5,000 TZS, kiwango cha juu 500,000 TZS). Malipo yatakamilishwa baada ya kuwasilisha.'
                : 'Fee is 3% of the transaction value (minimum 5,000 TZS, maximum 500,000 TZS). Payment will be completed after submission.'}
            </p>
          </div>
        )}

        {/* Important Notices */}
        <div className="space-y-3">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Bell className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-blue-800 mb-1">
                  {lang === 'sw' ? 'Arifa kwa Mhusika' : 'Notification to Second Party'}
                </h4>
                <p className="text-sm text-blue-700">
                  {lang === 'sw' 
                    ? 'Baada ya kuwasilisha, mnunuzi/mpangaji atapokea arifa ya kukagua na kuidhinisha makubaliano haya. Makubaliano hayatakamilika mpaka wakubali.'
                    : 'After submission, the buyer/tenant will receive a notification to review and approve this agreement. The agreement will not be finalized until they accept.'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-emerald-800 mb-1">
                  {lang === 'sw' ? 'Uhalali wa Makubaliano' : 'Agreement Validity'}
                </h4>
                <p className="text-sm text-emerald-700">
                  {lang === 'sw' 
                    ? 'Makubaliano haya yatakuwa na nguvu ya kisheria baada ya pande zote mbili kukubali. Hakikisha umesoma na kuelewa masharti yote.'
                    : 'This agreement will be legally binding after both parties accept. Ensure you have read and understood all terms.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => setShowReview(false)}
            className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-5 w-5" />
            {lang === 'sw' ? 'Rudi' : 'Back'}
          </button>
          <button
            type="button"
            onClick={confirmSubmit}
            disabled={isLoading || !lookupResult || !uploadedUrl || !feeBreakdown}
            className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <FileCheck className="h-5 w-5" />
                {lang === 'sw' ? 'Wasilisha Makubaliano' : 'Submit Agreement'}
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  if (showReview) {
    return (
      <form className="space-y-6">
        <ReviewSection />
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <ProgressBar />

      {/* Step 1: Asset Details */}
      {currentStep === 'asset' && (
        <div className="space-y-6">
          <div className={sectionClass}>
            <h3 className="font-bold text-emerald-800 flex items-center gap-2">
              <Home className="h-5 w-5" />
              {lang === 'sw' ? 'TAARIFA ZA MALI' : 'ASSET DETAILS'}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                {lang === 'sw' ? 'Aina ya Mali' : 'Asset Type'} <span className="text-red-500">*</span>
              </label>
              <select 
                {...register('asset_type', { required: true })} 
                className={inputClass}
              >
                <option value="">{t.selectOption}</option>
                {ASSET_TYPES.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {errors.asset_type && <span className="text-red-500 text-sm">{t.required}</span>}
            </div>

            <div>
              <label className={labelClass}>
                {lang === 'sw' ? 'Sarafu' : 'Currency'} <span className="text-red-500">*</span>
              </label>
              <select 
                {...register('currency', { required: true })} 
                className={inputClass}
                defaultValue="TZS"
              >
                {CURRENCY_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {errors.currency && <span className="text-red-500 text-sm">{t.required}</span>}
            </div>
          </div>

          <div>
            <label className={labelClass}>
              {lang === 'sw' ? 'Maelezo ya Mali' : 'Asset Description'} <span className="text-red-500">*</span>
            </label>
            <textarea 
              {...register('asset_description', { required: true })} 
              className={inputClass}
              rows={4}
              placeholder={lang === 'sw' 
                ? 'Eleza mali kikamilifu (eneo, ukubwa, hali, rangi, namba za utambulisho, n.k.)' 
                : 'Describe the asset fully (location, size, condition, identification numbers, etc.)'}
            />
            {errors.asset_description && <span className="text-red-500 text-sm">{t.required}</span>}
          </div>

          <div>
            <label className={labelClass}>
              {lang === 'sw' ? 'Eneo la Mali (kama linatumika)' : 'Asset Location (if applicable)'}
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-stone-400" />
              <input 
                type="text" 
                {...register('asset_location')} 
                className={`${inputClass} pl-10`}
                placeholder={lang === 'sw' ? 'Mtaa, wilaya, mkoa, alama za jirani' : 'Street, district, region, landmarks'}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                {lang === 'sw' ? 'Bei ya Mauziano / Kodi' : 'Sale Price / Rent'} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-stone-400" />
                <input 
                  type="number" 
                  {...register('sale_price', { 
                    required: true, 
                    min: 1,
                    validate: value => value > 0 || 'Price must be greater than 0'
                  })} 
                  className={`${inputClass} pl-10`}
                  placeholder="0"
                />
              </div>
              {errors.sale_price && <span className="text-red-500 text-sm">{errors.sale_price.message || t.required}</span>}
            </div>

            <div>
              <label className={labelClass}>
                {lang === 'sw' ? 'Masharti ya Malipo' : 'Payment Terms'}
              </label>
              <select 
                {...register('payment_terms')} 
                className={inputClass}
              >
                <option value="">{lang === 'sw' ? 'Chagua...' : 'Select...'}</option>
                {PAYMENT_TERMS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                {lang === 'sw' ? 'Tarehe ya Kuanza' : 'Effective Date'} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-stone-400" />
                <input 
                  type="date" 
                  {...register('effective_date', { required: true })} 
                  className={`${inputClass} pl-10`}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              {errors.effective_date && <span className="text-red-500 text-sm">{t.required}</span>}
            </div>

            <div>
              <label className={labelClass}>
                {lang === 'sw' ? 'Tarehe ya Kuisha (kama ipo)' : 'Expiry Date (if applicable)'}
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-stone-400" />
                <input 
                  type="date" 
                  {...register('expiry_date', {
                    validate: (value, formValues) => {
                      if (!value) return true;
                      return new Date(value) > new Date(formValues.effective_date) || 
                        (lang === 'sw' ? 'Tarehe ya kuisha lazima iwe baada ya tarehe ya kuanza' : 'Expiry date must be after effective date');
                    }
                  })} 
                  className={`${inputClass} pl-10`}
                  min={watch('effective_date')}
                />
              </div>
              {errors.expiry_date && <span className="text-red-500 text-sm">{errors.expiry_date.message}</span>}
            </div>
          </div>

          {/* Live Fee Preview */}
          {salePrice > 0 && feeBreakdown && (
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-emerald-800 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  {lang === 'sw' ? 'Ada ya Makadirio:' : 'Estimated Fee:'}
                </span>
                <span className="font-bold text-lg text-emerald-600">{feeBreakdown.finalFee.toLocaleString()} TZS</span>
              </div>
              <div className="text-xs text-emerald-600 flex items-center gap-1">
                <Info className="h-3 w-3" />
                <span>
                  {lang === 'sw' 
                    ? `3% ya ${salePrice.toLocaleString()} ${currency || 'TZS'} = ${feeBreakdown.calculated.toLocaleString()} TZS` 
                    : `3% of ${salePrice.toLocaleString()} ${currency || 'TZS'} = ${feeBreakdown.calculated.toLocaleString()} TZS`}
                </span>
              </div>
              {(feeBreakdown.calculated < MIN_FEE || feeBreakdown.calculated > MAX_FEE) && (
                <div className="text-xs text-emerald-600 mt-1">
                  {feeBreakdown.calculated < MIN_FEE && (
                    <span>{lang === 'sw' ? `Ada ya chini ${MIN_FEE.toLocaleString()} TZS imetumika` : `Minimum fee of ${MIN_FEE.toLocaleString()} TZS applied`}</span>
                  )}
                  {feeBreakdown.calculated > MAX_FEE && (
                    <span>{lang === 'sw' ? `Ada ya juu ${MAX_FEE.toLocaleString()} TZS imetumika` : `Maximum fee of ${MAX_FEE.toLocaleString()} TZS applied`}</span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Step 2: Seller/Landlord Information */}
      {currentStep === 'seller' && (
        <div className="space-y-6">
          <div className={sectionClass}>
            <h3 className="font-bold text-emerald-800 flex items-center gap-2">
              <User className="h-5 w-5" />
              {lang === 'sw' ? 'TAARIFA ZA MUUZAJI / MPANGISHAJI' : 'SELLER / LANDLORD INFORMATION'}
            </h3>
          </div>

          {/* Verified profile info display */}
          {userProfile && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <h4 className="font-bold text-emerald-800 mb-3 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                {lang === 'sw' ? 'Taarifa Zako (Kutoka kwa Wasifu)' : 'Your Information (From Profile)'}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <span className="text-xs text-stone-500">{lang === 'sw' ? 'Jina Kamili' : 'Full Name'}</span>
                  <p className="font-medium">{userProfile.first_name} {userProfile.middle_name || ''} {userProfile.last_name}</p>
                </div>
                <div>
                  <span className="text-xs text-stone-500">{lang === 'sw' ? 'Namba ya NIDA' : 'NIDA Number'}</span>
                  <p className="font-medium">{userProfile.nida_number || '-'}</p>
                </div>
                <div>
                  <span className="text-xs text-stone-500">{lang === 'sw' ? 'Simu' : 'Phone'}</span>
                  <p className="font-medium">{userProfile.phone}</p>
                </div>
                <div>
                  <span className="text-xs text-stone-500">Email</span>
                  <p className="font-medium">{userProfile.email}</p>
                </div>
                <div>
                  <span className="text-xs text-stone-500">{lang === 'sw' ? 'Anwani' : 'Address'}</span>
                  <p className="font-medium">{userProfile.region || ''} {userProfile.district || ''} {userProfile.ward || ''}</p>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className={labelClass}>
              {lang === 'sw' ? 'Namba ya TIN (TRA) - Hiari' : 'TIN Number (TRA) - Optional'}
            </label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-stone-400" />
              <input 
                type="text" 
                {...register('seller_tin')} 
                className={`${inputClass} pl-10`}
                placeholder="123-456-789"
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>
              {lang === 'sw' ? 'Simu ya Ziada (Hiari)' : 'Additional Phone (Optional)'}
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-stone-400" />
              <input 
                type="tel" 
                {...register('seller_additional_contact')} 
                className={`${inputClass} pl-10`}
                placeholder="+255 7XX XXX XXX"
              />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-2">
              <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <p className="text-sm text-blue-700">
                {lang === 'sw' 
                  ? 'Taarifa zako za msingi zitatumika kutoka kwa wasifu wako. Unaweza kuongeza TIN na namba ya simu ya ziada kwa ajili ya mawasiliano.'
                  : 'Your basic information will be taken from your profile. You can add TIN and additional phone number for contact.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Buyer/Tenant Lookup */}
      {currentStep === 'buyer' && (
        <div className="space-y-6">
          <div className={sectionClass}>
            <h3 className="font-bold text-emerald-800 flex items-center gap-2">
              <Users className="h-5 w-5" />
              {lang === 'sw' ? 'TAFUTA MNUNUZI / MPANGAJI' : 'FIND BUYER / TENANT'}
            </h3>
          </div>

          {/* Info banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Search className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-blue-700 font-medium">
                  {lang === 'sw' 
                    ? 'Ingiza Namba ya Raia (Citizen ID) ya mtu unayetaka kuingia naye makubaliano. Namba hii inapatikana kwenye wasifu wa mtumiaji.'
                    : 'Enter the Citizen ID of the person you want to enter into agreement with. This number is found on the user\'s profile.'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-stone-400" />
              <input
                type="text"
                value={citizenId}
                onChange={(e) => setCitizenId(e.target.value.toUpperCase())}
                placeholder="CT2026A12345"
                className="w-full p-3 pl-10 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-mono uppercase tracking-wider"
              />
            </div>
            <button
              type="button"
              onClick={handleCitizenLookup}
              disabled={searching}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-amber-400 text-white rounded-xl font-semibold flex items-center gap-2 transition-all"
            >
              {searching ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Search className="h-5 w-5" />
              )}
              <span className="hidden sm:inline">
                {lang === 'sw' ? 'Tafuta' : 'Search'}
              </span>
            </button>
          </div>

          {/* User found result */}
          {lookupResult && (
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
                <span className="font-bold text-emerald-700 text-lg">
                  {lang === 'sw' ? 'Mtumiaji Amepatikana!' : 'User Found!'}
                </span>
              </div>
              
              <div className="bg-white rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-stone-400" />
                  <span className="font-semibold text-stone-600 w-24">{lang === 'sw' ? 'Jina:' : 'Name:'}</span>
                  <span className="font-bold text-stone-900">{lookupResult.full_name}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-stone-400" />
                  <span className="font-semibold text-stone-600 w-24">{lang === 'sw' ? 'Namba:' : 'ID:'}</span>
                  <span className="font-mono text-emerald-700 bg-emerald-50 px-2 py-1 rounded">{lookupResult.citizen_id}</span>
                </div>
                
                {lookupResult.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-stone-400" />
                    <span className="font-semibold text-stone-600 w-24">{lang === 'sw' ? 'Simu:' : 'Phone:'}</span>
                    <span className="text-stone-700">{lookupResult.phone}</span>
                  </div>
                )}
                
                {lookupResult.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-stone-400" />
                    <span className="font-semibold text-stone-600 w-24">Email:</span>
                    <span className="text-stone-700">{lookupResult.email}</span>
                  </div>
                )}
                
                {(lookupResult.region || lookupResult.district) && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-stone-400" />
                    <span className="font-semibold text-stone-600 w-24">{lang === 'sw' ? 'Anwani:' : 'Address:'}</span>
                    <span className="text-stone-700">{lookupResult.region || ''} {lookupResult.district || ''}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <p className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                  <Bell className="h-4 w-4" />
                  {lang === 'sw' 
                    ? 'Baada ya kutuma ombi, mtumiaji huyu atapokea arifa ya kuidhinisha makubaliano haya.'
                    : 'After submission, this user will receive a notification to approve this agreement.'}
                </p>
              </div>
            </div>
          )}

          {/* Error message */}
          {lookupError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-sm text-red-700 font-medium">{lookupError}</span>
                  <p className="text-xs text-red-500 mt-1">
                    {lang === 'sw' 
                      ? 'Hakikisha mtumiaji amesajiliwa kwenye E-Serikali Mtaa na umeingiza namba sahihi.'
                      : 'Ensure the user is registered on E-Serikali Mtaa and you entered the correct number.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tip for finding ID */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <h4 className="font-bold text-emerald-800 mb-2 flex items-center gap-2">
              <Info className="h-4 w-4" />
              {lang === 'sw' ? 'Jinsi ya Kupata Namba ya Raia' : 'How to Find Citizen ID'}
            </h4>
            <p className="text-sm text-emerald-700">
              {lang === 'sw' 
                ? 'Namba ya Raia inapatikana kwenye wasifu wa mtumiaji. Mfano: CT2026A12345. Hakikisha unaandika kwa usahihi.'
                : 'Citizen ID is found on the user\'s profile. Example: CT2026A12345. Make sure you type it correctly.'}
            </p>
          </div>
        </div>
      )}

      {/* Step 4: Terms and Documents */}
      {currentStep === 'terms' && (
        <div className="space-y-6">
          <div className={sectionClass}>
            <h3 className="font-bold text-emerald-800 flex items-center gap-2">
              <FileSignature className="h-5 w-5" />
              {lang === 'sw' ? 'MASHARTI NA NYARAKA' : 'TERMS AND DOCUMENTS'}
            </h3>
          </div>

          <div>
            <label className={labelClass}>
              {lang === 'sw' ? 'Masharti Maalum / Maelezo ya Ziada' : 'Special Conditions / Additional Notes'}
            </label>
            <textarea 
              {...register('special_conditions')} 
              className={inputClass}
              rows={4}
              placeholder={lang === 'sw' 
                ? 'Andika masharti yoyote maalum ya makubaliano haya (mfano: malipo ya awamu, masharti ya ukaguzi, n.k.)' 
                : 'Write any special conditions for this agreement (e.g., installment payments, inspection conditions, etc.)'}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                {lang === 'sw' ? 'Jina la Shahidi (Hiari)' : 'Witness Name (Optional)'}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-stone-400" />
                <input 
                  type="text" 
                  {...register('witness_name')} 
                  className={`${inputClass} pl-10`}
                  placeholder={lang === 'sw' ? 'Jina kamili la shahidi' : 'Full name of witness'}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>
                {lang === 'sw' ? 'Simu ya Shahidi (Hiari)' : 'Witness Phone (Optional)'}
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-stone-400" />
                <input 
                  type="tel" 
                  {...register('witness_phone')} 
                  className={`${inputClass} pl-10`}
                  placeholder="+255 7XX XXX XXX"
                />
              </div>
            </div>
          </div>

          <div>
            <label className={labelClass}>
              {lang === 'sw' ? 'Anwani ya Shahidi (Hiari)' : 'Witness Address (Optional)'}
            </label>
            <input 
              type="text" 
              {...register('witness_address')} 
              className={inputClass}
              placeholder={lang === 'sw' ? 'Anwani kamili ya shahidi' : 'Full address of witness'}
            />
          </div>

          <div>
            <label className={labelClass}>
              {lang === 'sw' ? 'Pakia Mkataba wa Makubaliano (Signed Agreement)' : 'Upload Signed Agreement'} <span className="text-red-500">*</span>
            </label>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              className="hidden"
              aria-label="Upload signed agreement document"
            />
            
            {!agreementFile ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                aria-label="Upload agreement document"
                className="w-full p-8 border-2 border-dashed border-stone-300 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-all flex flex-col items-center gap-3"
              >
                {uploading ? (
                  <Loader2 className="h-10 w-10 text-emerald-500 animate-spin" />
                ) : (
                  <>
                    <Upload className="h-10 w-10 text-stone-400" />
                    <div className="text-center">
                      <span className="text-stone-600 font-medium block">
                        {lang === 'sw' ? 'Bofya kupakia mkataba' : 'Click to upload agreement'}
                      </span>
                      <span className="text-xs text-stone-400 mt-1 block">
                        PDF, DOC, DOCX, JPG, PNG (Max 10MB)
                      </span>
                    </div>
                  </>
                )}
              </button>
            ) : (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-emerald-600" />
                  <div>
                    <p className="font-medium text-emerald-800">{agreementFile.name}</p>
                    <p className="text-xs text-emerald-600">{(agreementFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="Remove uploaded file"
                  onClick={() => {
                    setAgreementFile(null);
                    setUploadedUrl('');
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  className="p-2 hover:bg-red-100 rounded-full transition-all"
                >
                  <X className="h-5 w-5 text-red-500" />
                </button>
              </div>
            )}
          </div>

          {/* Upload status */}
          {uploadedUrl && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                <span className="text-emerald-700 font-medium">
                  {lang === 'sw' ? 'Mkataba umepakiwa kikamilifu!' : 'Agreement uploaded successfully!'}
                </span>
              </div>
            </div>
          )}

          {/* Terms Acceptance Checkbox */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                {...register('terms_accepted', { required: true })} 
                className="w-5 h-5 mt-0.5 text-emerald-600 rounded focus:ring-emerald-500"
              />
              <div>
                <span className="font-medium text-emerald-800">
                  {lang === 'sw' 
                    ? 'Nakubali masharti na kanuni za makubaliano' 
                    : 'I accept the terms and conditions of this agreement'}
                </span>
                <p className="text-xs text-emerald-600 mt-1">
                  {lang === 'sw' 
                    ? 'Kwa kukubali, unathibitisha kuwa taarifa ulizotoa ni sahihi na unaelewa kuwa makubaliano haya yatakuwa na nguvu ya kisheria baada ya pande zote mbili kukubali.'
                    : 'By accepting, you confirm that the information provided is correct and you understand that this agreement will be legally binding after both parties accept.'}
                </p>
              </div>
            </label>
            {errors.terms_accepted && (
              <span className="text-red-500 text-sm block mt-2">
                {lang === 'sw' ? 'Lazima ukubali masharti ili kuendelea' : 'You must accept the terms to continue'}
              </span>
            )}
          </div>

          {/* Document requirements */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {lang === 'sw' ? 'Mahitaji ya Mkataba' : 'Agreement Requirements'}
            </h4>
            <ul className="text-sm text-blue-700 space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                <span>{lang === 'sw' ? 'Mkataba uwe umesainiwa na pande zote mbili' : 'Agreement must be signed by both parties'}</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                <span>{lang === 'sw' ? 'Mkataba uwe unaonesha wazi bei, masharti, na tarehe' : 'Agreement must clearly show price, terms, and dates'}</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                <span>{lang === 'sw' ? 'Faili liwe wazi na lisomeke vizuri' : 'File must be clear and legible'}</span>
              </li>
            </ul>
          </div>

          {/* Fee Summary in Terms Step */}
          {feeBreakdown && (
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4">
              <h4 className="font-bold text-emerald-800 mb-2">{lang === 'sw' ? 'Ada ya Usindikaji' : 'Processing Fee'}</h4>
              <div className="flex justify-between items-center">
                <span className="text-emerald-700">{lang === 'sw' ? 'Jumla ya Ada:' : 'Total Fee:'}</span>
                <span className="font-bold text-xl text-emerald-600">{feeBreakdown.finalFee.toLocaleString()} TZS</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex gap-3 pt-6 border-t border-stone-200">
        {currentStepIndex > 0 && (
          <button
            type="button"
            onClick={handlePrevious}
            className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-5 w-5" />
            {lang === 'sw' ? 'Nyuma' : 'Previous'}
          </button>
        )}
        
        {currentStep !== 'review' && (
          <button
            type="button"
            onClick={handleNext}
            className={`flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 ${
              currentStepIndex === 0 ? 'w-full' : ''
            }`}
          >
            {currentStep === 'terms' ? (
              <>
                {lang === 'sw' ? 'Hakiki Makubaliano' : 'Review Agreement'}
                <Eye className="h-5 w-5" />
              </>
            ) : (
              <>
                {lang === 'sw' ? 'Endelea' : 'Continue'}
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>
        )}
      </div>

      {/* Hidden submit for form completion */}
      {currentStep === 'review' && (
        <button type="submit" className="hidden" aria-label="Submit form" />
      )}
    </form>
  );
};

export default MakubalianoMauzianoForm;
