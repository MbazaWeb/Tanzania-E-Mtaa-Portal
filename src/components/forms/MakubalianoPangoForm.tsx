/**
 * Makubaliano ya Pango Form (PANGISHA)
 * Rent Agreement Form
 * 
 * Service: PANGISHA - Makubaliano ya Pango
 * Fee: 3% of total rent + VAT
 */
import React, { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { 
  Loader2, CheckCircle, ArrowLeft, ArrowRight, Eye, FileCheck, 
  Home, User, Users, Search, MapPin, DollarSign, Calendar, 
  Phone, Mail, Bell, Shield, Info, Calculator, Building, Key
} from 'lucide-react';
import { FormProps, labels } from './types';
import { supabase } from '../../lib/supabase';

// Fee constants
const VAT_RATE = 0.18;
const SERVICE_FEE_RATE = 0.03;

// Property type options
const PROPERTY_TYPES = [
  { label: 'Nyumba ya Kuishi / Residential', value: 'LIVING' },
  { label: 'Fremu ya Biashara / Commercial', value: 'BUSINESS' },
  { label: 'Kiwanja / Shamba / Land', value: 'LAND' },
];

// Living space types
const LIVING_SPACE_TYPES = [
  { label: 'Nyumba Nzima / Full House', value: 'FULL_HOUSE' },
  { label: 'Chumba / Vyumba / Rooms', value: 'ROOM' },
];

// House types
const HOUSE_TYPES = [
  { label: 'Nyumba ya Kawaida (Bungalow)', value: 'BUNGALOW' },
  { label: 'Ghorofa (Storey Building)', value: 'STOREY' },
  { label: 'Apartment', value: 'APARTMENT' },
  { label: 'Nyumba ya Kupanga (Tenement)', value: 'TENEMENT' },
  { label: 'Nyinginezo (Other)', value: 'OTHER' },
];

// Landlord role options
const LANDLORD_ROLES = [
  { label: 'Mwenye Nyumba (Owner)', value: 'OWNER' },
  { label: 'Msimamizi (Manager)', value: 'MANAGER' },
];

// Marital status options
const MARITAL_STATUS = [
  { label: 'Ameoa / Ameolewa', value: 'MARRIED' },
  { label: 'Hajaoa / Hajaolewa', value: 'SINGLE' },
  { label: 'Talaka', value: 'DIVORCED' },
  { label: 'Mjane', value: 'WIDOWED' },
];

// Occupation options
const OCCUPATION_TYPES = [
  { label: 'Mwajiriwa / Employed', value: 'EMPLOYED' },
  { label: 'Mwajiriwa Binafsi / Self-Employed', value: 'SELF_EMPLOYED' },
  { label: 'Mwanafunzi / Student', value: 'STUDENT' },
  { label: 'Mkulima / Farmer', value: 'FARMER' },
  { label: 'Nyinginezo / Other', value: 'OTHER' },
];

// Living arrangement options
const LIVING_ARRANGEMENTS = [
  { label: 'Peke Yangu / Alone', value: 'ALONE' },
  { label: 'Na Familia / With Family', value: 'FAMILY' },
];

// Submitter role options
const SUBMITTER_ROLES = [
  { label: 'Mimi ni Mwenye Nyumba / Msimamizi (Landlord)', value: 'LANDLORD' },
  { label: 'Mimi ni Mpangaji (Tenant)', value: 'TENANT' },
];

interface FormData {
  property_type: string;
  living_space_type: string;
  house_type: string;
  room_count: number;
  region: string;
  district: string;
  ward: string;
  street: string;
  gps_coordinates: string;
  house_number: string;
  house_description: string;
  monthly_rent: number;
  payment_period: number;
  landlord_role: string;
  landlord_name: string;
  landlord_nida: string;
  landlord_phone: string;
  tenant_is_self: string;
  tenant_name: string;
  tenant_nida: string;
  tenant_marital_status: string;
  tenant_occupation: string;
  tenant_living_arrangement: string;
  family_member_count: number;
  agreement_terms: string;
  submitter_role: string;
  send_for_approval: string;
  target_user_nida: string;
  approval_note: string;
  agreement_accepted: boolean;
}

interface LookupResult {
  id: string;
  citizen_id: string;
  full_name: string;
  phone?: string;
  email?: string;
}

type Step = 'property' | 'location' | 'rent' | 'landlord' | 'tenant' | 'terms' | 'review';

export const MakubalianoPangoForm: React.FC<FormProps> = ({
  onSubmit,
  isLoading,
  lang = 'sw',
  userProfile
}) => {
  const t = labels[lang];
  const [currentStep, setCurrentStep] = useState<Step>('property');
  const [showReview, setShowReview] = useState(false);
  
  // Lookup states
  const [targetCitizenId, setTargetCitizenId] = useState('');
  const [lookupResult, setLookupResult] = useState<LookupResult | null>(null);
  const [searching, setSearching] = useState(false);
  const [lookupError, setLookupError] = useState('');
  
  const { register, handleSubmit, formState: { errors }, trigger, getValues, watch, setValue } = useForm<FormData>({
    defaultValues: {
      payment_period: 12,
      monthly_rent: 0,
    }
  });

  const steps: { key: Step; label: string; swLabel: string }[] = [
    { key: 'property', label: 'Property Type', swLabel: 'Aina ya Nyumba' },
    { key: 'location', label: 'Location', swLabel: 'Mahali' },
    { key: 'rent', label: 'Rent Calculation', swLabel: 'Hesabu za Kodi' },
    { key: 'landlord', label: 'Landlord', swLabel: 'Mwenye Nyumba' },
    { key: 'tenant', label: 'Tenant', swLabel: 'Mpangaji' },
    { key: 'terms', label: 'Terms', swLabel: 'Masharti' },
    { key: 'review', label: 'Review', swLabel: 'Hakiki' },
  ];

  const currentStepIndex = steps.findIndex(s => s.key === currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  // Watch fields for calculations
  const monthlyRent = watch('monthly_rent') || 0;
  const paymentPeriod = watch('payment_period') || 1;
  const propertyType = watch('property_type');
  const livingSpaceType = watch('living_space_type');
  const tenantIsSelf = watch('tenant_is_self');
  const tenantLivingArrangement = watch('tenant_living_arrangement');
  const sendForApproval = watch('send_for_approval');

  // Calculate fees
  const feeBreakdown = useMemo(() => {
    const totalRent = monthlyRent * paymentPeriod;
    const vatAmount = Math.round(totalRent * VAT_RATE);
    const serviceFee = Math.round(totalRent * SERVICE_FEE_RATE);
    const grandTotal = totalRent + vatAmount + serviceFee;
    
    return {
      monthlyRent,
      paymentPeriod,
      totalRent,
      vatAmount,
      serviceFee,
      grandTotal
    };
  }, [monthlyRent, paymentPeriod]);

  // Citizen lookup handler
  const handleCitizenLookup = async () => {
    if (!targetCitizenId.trim()) {
      setLookupError(lang === 'sw' ? 'Tafadhali ingiza Namba ya NIDA' : 'Please enter NIDA number');
      return;
    }

    setSearching(true);
    setLookupError('');
    setLookupResult(null);

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, citizen_id, first_name, middle_name, last_name, phone, email')
        .eq('nida_number', targetCitizenId.trim())
        .single();

      if (error || !data) {
        setLookupError(lang === 'sw' 
          ? 'Mtumiaji hajapatikana. Hakikisha namba ya NIDA ni sahihi.' 
          : 'User not found. Please verify the NIDA number.');
        return;
      }

      setLookupResult({
        id: data.id,
        citizen_id: data.citizen_id,
        full_name: `${data.first_name} ${data.middle_name || ''} ${data.last_name}`.trim(),
        phone: data.phone,
        email: data.email
      });
    } catch {
      setLookupError(lang === 'sw' ? 'Hitilafu ya mtandao' : 'Network error');
    } finally {
      setSearching(false);
    }
  };

  // Step validation
  const validateCurrentStep = async (): Promise<boolean> => {
    let fieldsToValidate: (keyof FormData)[] = [];
    
    switch (currentStep) {
      case 'property':
        fieldsToValidate = ['property_type'];
        break;
      case 'location':
        fieldsToValidate = ['region', 'district', 'ward', 'street', 'house_number'];
        break;
      case 'rent':
        fieldsToValidate = ['monthly_rent', 'payment_period'];
        break;
      case 'landlord':
        fieldsToValidate = ['landlord_role', 'landlord_name', 'landlord_nida', 'landlord_phone'];
        break;
      case 'tenant':
        fieldsToValidate = ['tenant_name', 'tenant_nida', 'tenant_marital_status', 'tenant_occupation', 'tenant_living_arrangement'];
        break;
      case 'terms':
        fieldsToValidate = ['agreement_terms', 'submitter_role', 'agreement_accepted'];
        break;
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
    const submitData = {
      ...data,
      vat_amount: feeBreakdown.vatAmount,
      service_fee: feeBreakdown.serviceFee,
      total_rent: feeBreakdown.grandTotal,
      target_user_id: lookupResult?.id || null,
      target_user_name: lookupResult?.full_name || null,
    };

    onSubmit(submitData);
  };

  const confirmSubmit = () => {
    handleSubmit(onFormSubmit)();
  };

  // Styling classes
  const inputClass = "w-full p-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white";
  const labelClass = "block text-sm font-semibold text-stone-700 mb-2";
  const sectionClass = "bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-xl border-l-4 border-emerald-500 mb-6 shadow-sm";

  // Progress bar component
  const ProgressBar = () => (
    <div className="mb-8">
      <div className="flex justify-between mb-2">
        {steps.map((step, index) => (
          <div 
            key={step.key}
            className={`flex flex-col items-center ${index <= currentStepIndex ? 'text-emerald-600' : 'text-stone-400'}`}
          >
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mb-1
              ${index < currentStepIndex 
                ? 'bg-emerald-600 text-white' 
                : index === currentStepIndex
                ? 'bg-emerald-100 text-emerald-600 border-2 border-emerald-600'
                : 'bg-stone-100 text-stone-400'
              }
            `}>
              {index < currentStepIndex ? <CheckCircle className="h-4 w-4" /> : index + 1}
            </div>
            <span className="text-xs font-medium hidden sm:block">
              {lang === 'sw' ? step.swLabel : step.label}
            </span>
          </div>
        ))}
      </div>
      <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
        <div 
          className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex justify-between mt-2">
        <span className="text-xs text-stone-500">
          {lang === 'sw' ? 'Hatua' : 'Step'} {currentStepIndex + 1} {lang === 'sw' ? 'kati ya' : 'of'} {steps.length}
        </span>
        <span className="text-xs font-bold text-emerald-600">{Math.round(progress)}%</span>
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
            {lang === 'sw' ? 'HAKIKI MAKUBALIANO YA PANGO' : 'REVIEW RENT AGREEMENT'}
          </h3>
        </div>

        {/* Property Summary */}
        <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-3">
          <h4 className="font-bold text-stone-800 flex items-center gap-2">
            <Building className="h-4 w-4" />
            {lang === 'sw' ? 'Taarifa za Nyumba' : 'Property Details'}
          </h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-stone-500">{lang === 'sw' ? 'Aina:' : 'Type:'}</span>
              <p className="font-medium">{PROPERTY_TYPES.find(p => p.value === data.property_type)?.label}</p>
            </div>
            <div>
              <span className="text-stone-500">{lang === 'sw' ? 'Namba:' : 'Number:'}</span>
              <p className="font-medium">{data.house_number}</p>
            </div>
            <div className="col-span-2">
              <span className="text-stone-500">{lang === 'sw' ? 'Mahali:' : 'Location:'}</span>
              <p className="font-medium">{data.street}, {data.ward}, {data.district}, {data.region}</p>
            </div>
          </div>
        </div>

        {/* Rent Summary */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4">
          <h4 className="font-bold text-emerald-800 mb-3 flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            {lang === 'sw' ? 'Muhtasari wa Malipo' : 'Payment Summary'}
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-stone-600">{lang === 'sw' ? 'Kodi ya Mwezi:' : 'Monthly Rent:'}</span>
              <span className="font-medium">{feeBreakdown.monthlyRent.toLocaleString()} TZS</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-stone-600">{lang === 'sw' ? 'Muda (Miezi):' : 'Period (Months):'}</span>
              <span className="font-medium">{feeBreakdown.paymentPeriod}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-stone-600">{lang === 'sw' ? 'Jumla ya Kodi:' : 'Total Rent:'}</span>
              <span className="font-medium">{feeBreakdown.totalRent.toLocaleString()} TZS</span>
            </div>
            <div className="border-t border-emerald-200 my-2"></div>
            <div className="flex justify-between text-sm">
              <span className="text-stone-600">VAT (18%):</span>
              <span className="font-medium">{feeBreakdown.vatAmount.toLocaleString()} TZS</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-stone-600">{lang === 'sw' ? 'Ada ya Huduma (3%):' : 'Service Fee (3%):'}</span>
              <span className="font-medium">{feeBreakdown.serviceFee.toLocaleString()} TZS</span>
            </div>
            <div className="border-t border-emerald-200 my-2"></div>
            <div className="flex justify-between font-bold text-lg">
              <span className="text-emerald-800">{lang === 'sw' ? 'JUMLA:' : 'TOTAL:'}</span>
              <span className="text-emerald-600">{feeBreakdown.grandTotal.toLocaleString()} TZS</span>
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
              <span className="text-xs text-emerald-600 font-medium">{lang === 'sw' ? 'MWENYE NYUMBA' : 'LANDLORD'}</span>
              <p className="font-bold text-emerald-800">{data.landlord_name}</p>
              <p className="text-sm text-emerald-600">{data.landlord_nida}</p>
            </div>
            <div className="bg-teal-50 p-3 rounded-lg">
              <span className="text-xs text-teal-600 font-medium">{lang === 'sw' ? 'MPANGAJI' : 'TENANT'}</span>
              <p className="font-bold text-teal-800">{data.tenant_name}</p>
              <p className="text-sm text-teal-600">{data.tenant_nida}</p>
            </div>
          </div>
        </div>

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
                    ? 'Baada ya kuwasilisha, upande mwingine utapokea arifa ya kukagua na kuidhinisha makubaliano haya.'
                    : 'After submission, the other party will receive a notification to review and approve this agreement.'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-emerald-800 mb-1">
                  {lang === 'sw' ? 'Uhalali wa Mkataba' : 'Agreement Validity'}
                </h4>
                <p className="text-sm text-emerald-700">
                  {lang === 'sw' 
                    ? 'Mkataba huu utakuwa na nguvu ya kisheria baada ya pande zote mbili kukubali na malipo kukamilika.'
                    : 'This agreement will be legally binding after both parties accept and payment is completed.'}
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
            disabled={isLoading}
            className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <FileCheck className="h-5 w-5" />
                {lang === 'sw' ? 'Wasilisha Mkataba' : 'Submit Agreement'}
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

      {/* Step 1: Property Type */}
      {currentStep === 'property' && (
        <div className="space-y-6">
          <div className={sectionClass}>
            <h3 className="font-bold text-emerald-800 flex items-center gap-2">
              <Building className="h-5 w-5" />
              {lang === 'sw' ? 'TAARIFA ZA NYUMBA' : 'PROPERTY DETAILS'}
            </h3>
          </div>

          <div>
            <label className={labelClass}>
              {lang === 'sw' ? 'Aina ya Nyumba/Pango' : 'Property Type'} <span className="text-red-500">*</span>
            </label>
            <select {...register('property_type', { required: true })} className={inputClass}>
              <option value="">{t.selectOption}</option>
              {PROPERTY_TYPES.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {errors.property_type && <span className="text-red-500 text-sm">{t.required}</span>}
          </div>

          {propertyType === 'LIVING' && (
            <>
              <div>
                <label className={labelClass}>
                  {lang === 'sw' ? 'Je ni nyumba nzima au chumba?' : 'Full house or rooms?'}
                </label>
                <select {...register('living_space_type')} className={inputClass}>
                  <option value="">{t.selectOption}</option>
                  {LIVING_SPACE_TYPES.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>
                  {lang === 'sw' ? 'Aina ya Nyumba' : 'House Type'}
                </label>
                <select {...register('house_type')} className={inputClass}>
                  <option value="">{t.selectOption}</option>
                  {HOUSE_TYPES.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {livingSpaceType === 'ROOM' && (
                <div>
                  <label className={labelClass}>
                    {lang === 'sw' ? 'Idadi ya Vyumba' : 'Number of Rooms'}
                  </label>
                  <input 
                    type="number" 
                    {...register('room_count', { min: 1 })} 
                    className={inputClass}
                    min="1"
                  />
                </div>
              )}
            </>
          )}

          <div>
            <label className={labelClass}>
              {lang === 'sw' ? 'Maelezo ya Nyumba' : 'Property Description'}
            </label>
            <textarea 
              {...register('house_description')} 
              className={inputClass}
              rows={3}
              placeholder={lang === 'sw' ? 'Mfano: Vyumba 3, Sebule, Jiko, Bafu...' : 'e.g., 3 bedrooms, living room, kitchen, bathroom...'}
            />
          </div>
        </div>
      )}

      {/* Step 2: Location */}
      {currentStep === 'location' && (
        <div className="space-y-6">
          <div className={sectionClass}>
            <h3 className="font-bold text-emerald-800 flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {lang === 'sw' ? 'MAHALI HALISI ILIPO NYUMBA' : 'EXACT LOCATION'}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                {lang === 'sw' ? 'Mkoa' : 'Region'} <span className="text-red-500">*</span>
              </label>
              <input {...register('region', { required: true })} className={inputClass} />
              {errors.region && <span className="text-red-500 text-sm">{t.required}</span>}
            </div>

            <div>
              <label className={labelClass}>
                {lang === 'sw' ? 'Wilaya' : 'District'} <span className="text-red-500">*</span>
              </label>
              <input {...register('district', { required: true })} className={inputClass} />
              {errors.district && <span className="text-red-500 text-sm">{t.required}</span>}
            </div>

            <div>
              <label className={labelClass}>
                {lang === 'sw' ? 'Kata' : 'Ward'} <span className="text-red-500">*</span>
              </label>
              <input {...register('ward', { required: true })} className={inputClass} />
              {errors.ward && <span className="text-red-500 text-sm">{t.required}</span>}
            </div>

            <div>
              <label className={labelClass}>
                {lang === 'sw' ? 'Mtaa / Kitongoji' : 'Street'} <span className="text-red-500">*</span>
              </label>
              <input {...register('street', { required: true })} className={inputClass} />
              {errors.street && <span className="text-red-500 text-sm">{t.required}</span>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                {lang === 'sw' ? 'Namba ya Nyumba / Plot' : 'House/Plot Number'} <span className="text-red-500">*</span>
              </label>
              <input {...register('house_number', { required: true })} className={inputClass} />
              {errors.house_number && <span className="text-red-500 text-sm">{t.required}</span>}
            </div>

            <div>
              <label className={labelClass}>
                {lang === 'sw' ? 'GPS Coordinates (Hiari)' : 'GPS Coordinates (Optional)'}
              </label>
              <input 
                {...register('gps_coordinates')} 
                className={inputClass}
                placeholder="-6.7924, 39.2083"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Rent Calculation */}
      {currentStep === 'rent' && (
        <div className="space-y-6">
          <div className={sectionClass}>
            <h3 className="font-bold text-emerald-800 flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              {lang === 'sw' ? 'HESABU ZA KODI' : 'RENT CALCULATIONS'}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                {lang === 'sw' ? 'Kodi ya Mwezi (TZS)' : 'Monthly Rent (TZS)'} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-stone-400" />
                <input 
                  type="number" 
                  {...register('monthly_rent', { required: true, min: 0 })} 
                  className={`${inputClass} pl-10`}
                  placeholder="0"
                />
              </div>
              {errors.monthly_rent && <span className="text-red-500 text-sm">{t.required}</span>}
            </div>

            <div>
              <label className={labelClass}>
                {lang === 'sw' ? 'Muda wa Malipo (Miezi)' : 'Payment Period (Months)'} <span className="text-red-500">*</span>
              </label>
              <input 
                type="number" 
                {...register('payment_period', { required: true, min: 1 })} 
                className={inputClass}
                min="1"
              />
              {errors.payment_period && <span className="text-red-500 text-sm">{t.required}</span>}
            </div>
          </div>

          {/* Live Fee Calculation */}
          {monthlyRent > 0 && (
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4">
              <h4 className="font-bold text-emerald-800 mb-3 flex items-center gap-2">
                <Info className="h-4 w-4" />
                {lang === 'sw' ? 'Muhtasari wa Malipo' : 'Payment Summary'}
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-stone-600">{lang === 'sw' ? 'Kodi ya Mwezi:' : 'Monthly Rent:'}</span>
                  <span className="font-medium">{feeBreakdown.monthlyRent.toLocaleString()} TZS</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-stone-600">{lang === 'sw' ? 'Miezi:' : 'Months:'}</span>
                  <span className="font-medium">{feeBreakdown.paymentPeriod}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-stone-600">{lang === 'sw' ? 'Jumla ya Kodi:' : 'Total Rent:'}</span>
                  <span className="font-medium">{feeBreakdown.totalRent.toLocaleString()} TZS</span>
                </div>
                <div className="border-t border-emerald-200 my-2"></div>
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-600">VAT (18%):</span>
                  <span className="font-medium text-emerald-600">{feeBreakdown.vatAmount.toLocaleString()} TZS</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-600">{lang === 'sw' ? 'Ada ya Huduma (3%):' : 'Service Fee (3%):'}</span>
                  <span className="font-medium text-emerald-600">{feeBreakdown.serviceFee.toLocaleString()} TZS</span>
                </div>
                <div className="border-t border-emerald-200 my-2"></div>
                <div className="flex justify-between font-bold text-lg">
                  <span className="text-emerald-800">{lang === 'sw' ? 'JUMLA KUU:' : 'GRAND TOTAL:'}</span>
                  <span className="text-emerald-600">{feeBreakdown.grandTotal.toLocaleString()} TZS</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 4: Landlord Information */}
      {currentStep === 'landlord' && (
        <div className="space-y-6">
          <div className={sectionClass}>
            <h3 className="font-bold text-emerald-800 flex items-center gap-2">
              <Key className="h-5 w-5" />
              {lang === 'sw' ? 'TAARIFA ZA MWENYE NYUMBA' : 'LANDLORD INFORMATION'}
            </h3>
          </div>

          <div>
            <label className={labelClass}>
              {lang === 'sw' ? 'Mwenye nyumba ni Owner au Msimamizi?' : 'Owner or Manager?'} <span className="text-red-500">*</span>
            </label>
            <select {...register('landlord_role', { required: true })} className={inputClass}>
              <option value="">{t.selectOption}</option>
              {LANDLORD_ROLES.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {errors.landlord_role && <span className="text-red-500 text-sm">{t.required}</span>}
          </div>

          <div>
            <label className={labelClass}>
              {lang === 'sw' ? 'Jina Kamili' : 'Full Name'} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-stone-400" />
              <input 
                {...register('landlord_name', { required: true })} 
                className={`${inputClass} pl-10`}
              />
            </div>
            {errors.landlord_name && <span className="text-red-500 text-sm">{t.required}</span>}
          </div>

          <div>
            <label className={labelClass}>
              {lang === 'sw' ? 'Namba ya NIDA' : 'NIDA Number'} <span className="text-red-500">*</span>
            </label>
            <input 
              {...register('landlord_nida', { required: true })} 
              className={inputClass}
              placeholder="XXXXXXXXXXXXXXXXXX"
            />
            {errors.landlord_nida && <span className="text-red-500 text-sm">{t.required}</span>}
          </div>

          <div>
            <label className={labelClass}>
              {lang === 'sw' ? 'Namba ya Simu' : 'Phone Number'} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-stone-400" />
              <input 
                type="tel"
                {...register('landlord_phone', { required: true })} 
                className={`${inputClass} pl-10`}
                placeholder="+255 7XX XXX XXX"
              />
            </div>
            {errors.landlord_phone && <span className="text-red-500 text-sm">{t.required}</span>}
          </div>
        </div>
      )}

      {/* Step 5: Tenant Information */}
      {currentStep === 'tenant' && (
        <div className="space-y-6">
          <div className={sectionClass}>
            <h3 className="font-bold text-emerald-800 flex items-center gap-2">
              <Users className="h-5 w-5" />
              {lang === 'sw' ? 'TAARIFA ZA MPANGAJI' : 'TENANT INFORMATION'}
            </h3>
          </div>

          <div>
            <label className={labelClass}>
              {lang === 'sw' ? 'Je, mpangaji ni wewe mwenyewe?' : 'Are you the tenant?'}
            </label>
            <select {...register('tenant_is_self')} className={inputClass}>
              <option value="SELF">{lang === 'sw' ? 'Ndiyo - Mimi ndiye mpangaji' : 'Yes - I am the tenant'}</option>
              <option value="OTHER">{lang === 'sw' ? 'Hapana - Mpangaji ni mtu mwingine' : 'No - Another person is the tenant'}</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>
              {lang === 'sw' ? 'Jina Kamili la Mpangaji' : 'Tenant Full Name'} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-stone-400" />
              <input 
                {...register('tenant_name', { required: true })} 
                className={`${inputClass} pl-10`}
                defaultValue={tenantIsSelf === 'SELF' && userProfile ? `${userProfile.first_name} ${userProfile.middle_name || ''} ${userProfile.last_name}`.trim() : ''}
              />
            </div>
            {errors.tenant_name && <span className="text-red-500 text-sm">{t.required}</span>}
          </div>

          <div>
            <label className={labelClass}>
              {lang === 'sw' ? 'Namba ya NIDA ya Mpangaji' : 'Tenant NIDA Number'} <span className="text-red-500">*</span>
            </label>
            <input 
              {...register('tenant_nida', { required: true })} 
              className={inputClass}
              placeholder="XXXXXXXXXXXXXXXXXX"
              defaultValue={tenantIsSelf === 'SELF' && userProfile ? userProfile.nida_number || '' : ''}
            />
            {errors.tenant_nida && <span className="text-red-500 text-sm">{t.required}</span>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                {lang === 'sw' ? 'Hali ya Ndoa' : 'Marital Status'} <span className="text-red-500">*</span>
              </label>
              <select {...register('tenant_marital_status', { required: true })} className={inputClass}>
                <option value="">{t.selectOption}</option>
                {MARITAL_STATUS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {errors.tenant_marital_status && <span className="text-red-500 text-sm">{t.required}</span>}
            </div>

            <div>
              <label className={labelClass}>
                {lang === 'sw' ? 'Aina ya Kazi' : 'Occupation'} <span className="text-red-500">*</span>
              </label>
              <select {...register('tenant_occupation', { required: true })} className={inputClass}>
                <option value="">{t.selectOption}</option>
                {OCCUPATION_TYPES.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {errors.tenant_occupation && <span className="text-red-500 text-sm">{t.required}</span>}
            </div>
          </div>

          <div>
            <label className={labelClass}>
              {lang === 'sw' ? 'Mpangaji anaishi peke yake au na familia?' : 'Living alone or with family?'} <span className="text-red-500">*</span>
            </label>
            <select {...register('tenant_living_arrangement', { required: true })} className={inputClass}>
              <option value="">{t.selectOption}</option>
              {LIVING_ARRANGEMENTS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {errors.tenant_living_arrangement && <span className="text-red-500 text-sm">{t.required}</span>}
          </div>

          {tenantLivingArrangement === 'FAMILY' && (
            <div>
              <label className={labelClass}>
                {lang === 'sw' ? 'Idadi ya wanafamilia watakaoishi hapa' : 'Number of family members'}
              </label>
              <input 
                type="number" 
                {...register('family_member_count', { min: 1 })} 
                className={inputClass}
                min="1"
              />
            </div>
          )}
        </div>
      )}

      {/* Step 6: Terms & Approval */}
      {currentStep === 'terms' && (
        <div className="space-y-6">
          <div className={sectionClass}>
            <h3 className="font-bold text-emerald-800 flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {lang === 'sw' ? 'MAKUBALIANO NA SERA' : 'TERMS AND CONDITIONS'}
            </h3>
          </div>

          <div>
            <label className={labelClass}>
              {lang === 'sw' ? 'Vigezo na Masharti' : 'Terms and Conditions'} <span className="text-red-500">*</span>
            </label>
            <textarea 
              {...register('agreement_terms', { required: true })} 
              className={inputClass}
              rows={5}
              placeholder={lang === 'sw' 
                ? 'Andika masharti ya pango (muda wa kutoa taarifa, upangaji wa matengenezo, n.k.)' 
                : 'Write rent terms (notice period, maintenance arrangements, etc.)'}
            />
            {errors.agreement_terms && <span className="text-red-500 text-sm">{t.required}</span>}
          </div>

          <div>
            <label className={labelClass}>
              {lang === 'sw' ? 'Wewe ni nani katika mkataba huu?' : 'Who are you in this agreement?'} <span className="text-red-500">*</span>
            </label>
            <select {...register('submitter_role', { required: true })} className={inputClass}>
              <option value="">{t.selectOption}</option>
              {SUBMITTER_ROLES.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {errors.submitter_role && <span className="text-red-500 text-sm">{t.required}</span>}
          </div>

          <div>
            <label className={labelClass}>
              {lang === 'sw' ? 'Tuma kwa upande mwingine kuidhinisha?' : 'Send for approval?'}
            </label>
            <select {...register('send_for_approval')} className={inputClass}>
              <option value="YES">{lang === 'sw' ? 'Ndiyo - Tuma kwa idhini' : 'Yes - Send for approval'}</option>
              <option value="NO">{lang === 'sw' ? 'Hapana - Usitume' : 'No - Do not send'}</option>
            </select>
          </div>

          {sendForApproval === 'YES' && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-stone-400" />
                  <input
                    type="text"
                    value={targetCitizenId}
                    onChange={(e) => setTargetCitizenId(e.target.value)}
                    placeholder={lang === 'sw' ? 'NIDA ya upande mwingine' : 'Other party NIDA'}
                    className={`${inputClass} pl-10`}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleCitizenLookup}
                  disabled={searching}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-xl font-semibold flex items-center gap-2 transition-all"
                >
                  {searching ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
                </button>
              </div>

              {lookupResult && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                    <span className="font-bold text-emerald-700">{lang === 'sw' ? 'Mtumiaji Amepatikana!' : 'User Found!'}</span>
                  </div>
                  <p className="font-medium text-stone-800">{lookupResult.full_name}</p>
                  {lookupResult.phone && <p className="text-sm text-stone-600">{lookupResult.phone}</p>}
                </div>
              )}

              {lookupError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-700">{lookupError}</p>
                </div>
              )}

              <div>
                <label className={labelClass}>
                  {lang === 'sw' ? 'Ujumbe kwa anayethibitisha (hiari)' : 'Message to approver (optional)'}
                </label>
                <textarea 
                  {...register('approval_note')} 
                  className={inputClass}
                  rows={2}
                />
              </div>
            </div>
          )}

          {/* Terms Acceptance */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                {...register('agreement_accepted', { required: true })} 
                className="w-5 h-5 mt-0.5 text-emerald-600 rounded focus:ring-emerald-500"
              />
              <div>
                <span className="font-medium text-emerald-800">
                  {lang === 'sw' 
                    ? 'Nimekubali vigezo na masharti ya pango' 
                    : 'I accept the terms and conditions of this rent agreement'}
                </span>
                <p className="text-xs text-emerald-600 mt-1">
                  {lang === 'sw' 
                    ? 'Kwa kukubali, unathibitisha kuwa taarifa ulizotoa ni sahihi na unaelewa kuwa makubaliano haya yatakuwa na nguvu ya kisheria.'
                    : 'By accepting, you confirm that the information provided is correct and that this agreement will be legally binding.'}
                </p>
              </div>
            </label>
            {errors.agreement_accepted && (
              <span className="text-red-500 text-sm block mt-2">
                {lang === 'sw' ? 'Lazima ukubali masharti ili kuendelea' : 'You must accept the terms to continue'}
              </span>
            )}
          </div>
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
                {lang === 'sw' ? 'Hakiki Mkataba' : 'Review Agreement'}
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
    </form>
  );
};

export default MakubalianoPangoForm;
