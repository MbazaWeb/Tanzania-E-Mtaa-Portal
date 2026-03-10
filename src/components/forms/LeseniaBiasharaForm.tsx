/**
 * Leseni ya Biashara Ndogondogo Form
 * Petty Trader License
 * 
 * Service: Leseni ya Biashara Ndogondogo
 * Fee: 10,000 TZS
 * 
 * Features:
 * - Book-style layout with sections
 * - Progress tracking
 * - File upload for ID
 * - Review step before submission
 * - Business information collection
 */
import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2, CheckCircle, ArrowLeft, ArrowRight, Eye, FileCheck, Upload, X, FileText, AlertCircle, Store, MapPin, Briefcase, CreditCard, User, Phone } from 'lucide-react';
import { FormProps, labels } from './types';
import { supabase } from '@/src/lib/supabase';

// Business type options
const BUSINESS_TYPES = [
  { label: 'CHAKULA (MAMA LISHE, VITENDAJI, MIKAJE)', value: 'CHAKULA' },
  { label: 'BIDHAA NDOGONDOGO (DUKA, MAGENGE, MATAWI)', value: 'BIDHAA' },
  { label: 'HUDUMA (KEREKERE, USAUZI, FUNDI)', value: 'HUDUMA' },
  { label: 'KILIMO (MBOGAMBOGA, MATUNDA, MIFUGO)', value: 'KILIMO' },
  { label: 'MABOOKA (MAGAZETI, VITABU)', value: 'MABOOKA' },
  { label: 'USAFAJI (NYUMBA, MAENEZO)', value: 'USAFAJI' },
  { label: 'USAFIRISHAJI (BODABODA, BAJAJI)', value: 'USAFIRISHAJI' },
  { label: 'NYINGINEZO', value: 'NYINGINEZO' },
];

// Business locations
const BUSINESS_LOCATIONS = [
  { label: 'SOKO LA MANISPAA', value: 'SOKO' },
  { label: 'MTAANI (JIJINI)', value: 'MJINI' },
  { label: 'KANDO YA BARABARA', value: 'BARABARA' },
  { label: 'MAKAZI (NYUMBANI)', value: 'NYUMBANI' },
  { label: 'ENEO LA BIASHARA', value: 'ENEO_BIASHARA' },
  { label: 'NYINGINEZO', value: 'NYINGINEZO' },
];

// Business sizes
const BUSINESS_SIZES = [
  { label: 'NDOGO (Chini ya TZS 500,000/mwezi)', value: 'SMALL' },
  { label: 'KATI (TZS 500,000 - 2,000,000/mwezi)', value: 'MEDIUM' },
  { label: 'KUBWA (Zaidi ya TZS 2,000,000/mwezi)', value: 'LARGE' },
];

interface FormData {
  business_name: string;
  business_type: string;
  business_location_type: string;
  business_size: string;
  location: string;
  tin_number: string;
  years_in_operation: number;
  employees_count: number;
  // ID will be handled separately
}

type Step = 'business' | 'location' | 'documents' | 'review';

export const LeseniaBiasharaForm: React.FC<FormProps> = ({
  onSubmit,
  isLoading,
  lang = 'sw',
  userProfile
}) => {
  const t = labels[lang];
  const [currentStep, setCurrentStep] = useState<Step>('business');
  const [showReview, setShowReview] = useState(false);
  const [formData, setFormData] = useState<FormData | null>(null);
  
  // File upload state
  const [idCopy, setIdCopy] = useState<File | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, formState: { errors }, trigger, getValues } = useForm<FormData>();

  const steps: { key: Step; label: string; swLabel: string }[] = [
    { key: 'business', label: 'Business Info', swLabel: 'Biashara' },
    { key: 'location', label: 'Location', swLabel: 'Eneo' },
    { key: 'documents', label: 'Documents', swLabel: 'Nyaraka' },
    { key: 'review', label: 'Review', swLabel: 'Hakiki' },
  ];

  const currentStepIndex = steps.findIndex(s => s.key === currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIdCopy(file);
    setUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `ids/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { error } = await supabase.storage
        .from('attachments')
        .upload(fileName, file);
      
      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage
        .from('attachments')
        .getPublicUrl(fileName);
      
      setUploadedUrl(publicUrl);
    } catch (err) {
      console.error('File upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const validateCurrentStep = async (): Promise<boolean> => {
    let fieldsToValidate: (keyof FormData)[] = [];
    
    switch (currentStep) {
      case 'business':
        fieldsToValidate = ['business_type'];
        break;
      case 'location':
        fieldsToValidate = ['location'];
        break;
      case 'documents':
        // Documents step validation is handled separately (file upload)
        return uploadedUrl ? true : false;
      default:
        return true;
    }
    
    const result = await trigger(fieldsToValidate);
    return result;
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (!isValid) return;

    if (currentStep === 'documents') {
      setCurrentStep('review');
    } else {
      const nextStep = steps[currentStepIndex + 1].key;
      setCurrentStep(nextStep);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1].key);
    }
  };

  const onFormSubmit = (data: FormData) => {
    setFormData(data);
    setShowReview(true);
  };

  const confirmSubmit = () => {
    if (formData && uploadedUrl) {
      const completeData = {
        ...formData,
        id_copy: uploadedUrl,
      };
      onSubmit(completeData, [uploadedUrl], 'self');
    }
  };

  const inputClass = "w-full p-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all bg-white";
  const labelClass = "block text-sm font-semibold text-stone-700 mb-2";
  const sectionClass = "bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border-l-4 border-purple-500 mb-6 shadow-sm";

  // Progress Bar Component
  const ProgressBar = () => (
    <div className="mb-8">
      <div className="flex justify-between mb-2">
        {steps.map((step, index) => (
          <div 
            key={step.key}
            className={`flex flex-col items-center ${index <= currentStepIndex ? 'text-purple-600' : 'text-stone-400'}`}
          >
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mb-1
              ${index < currentStepIndex 
                ? 'bg-purple-600 text-white' 
                : index === currentStepIndex
                ? 'bg-purple-100 text-purple-600 border-2 border-purple-600'
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
          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex justify-between mt-2">
        <span className="text-xs text-stone-500">
          {lang === 'sw' ? 'Hatua' : 'Step'} {currentStepIndex + 1} {lang === 'sw' ? 'kati ya' : 'of'} {steps.length}
        </span>
        <span className="text-xs font-bold text-purple-600">{Math.round(progress)}%</span>
      </div>
    </div>
  );

  // Review Component
  const ReviewSection = () => {
    const data = getValues();
    
    return (
      <div className="space-y-6">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <Eye className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-amber-800">
                {lang === 'sw' ? 'Hakiki Maombi ya Leseni ya Biashara' : 'Review Business License Application'}
              </h3>
              <p className="text-sm text-amber-700">
                {lang === 'sw' 
                  ? 'Tafadhali hakiki taarifa za biashara yako kabla ya kuwasilisha. Hakikisha nyaraka zote zimepakiwa kwa usahihi.'
                  : 'Please review your business information before submitting. Ensure all documents are uploaded correctly.'}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Applicant Information */}
          <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
            <div className="bg-purple-50 px-4 py-2 border-b border-purple-100">
              <h4 className="font-bold text-purple-800 flex items-center gap-2">
                <User className="h-4 w-4" />
                {lang === 'sw' ? 'Mwombaji / Mmiliki' : 'Applicant / Owner'}
              </h4>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-stone-500">{lang === 'sw' ? 'Jina Kamili' : 'Full Name'}</span>
                  <p className="font-medium">
                    {userProfile ? `${userProfile.first_name} ${userProfile.middle_name || ''} ${userProfile.last_name}`.replace(/\s+/g, ' ') : '-'}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-stone-500">{lang === 'sw' ? 'Namba ya NIDA' : 'NIDA Number'}</span>
                  <p className="font-medium">{userProfile?.nida_number || '-'}</p>
                </div>
                <div>
                  <span className="text-xs text-stone-500">{lang === 'sw' ? 'Simu' : 'Phone'}</span>
                  <p className="font-medium">{userProfile?.phone || '-'}</p>
                </div>
                <div>
                  <span className="text-xs text-stone-500">Email</span>
                  <p className="font-medium">{userProfile?.email || '-'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Business Information */}
          <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
            <div className="bg-purple-50 px-4 py-2 border-b border-purple-100">
              <h4 className="font-bold text-purple-800 flex items-center gap-2">
                <Store className="h-4 w-4" />
                {lang === 'sw' ? 'Taarifa za Biashara' : 'Business Information'}
              </h4>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-stone-500">{lang === 'sw' ? 'Jina la Biashara' : 'Business Name'}</span>
                  <p className="font-medium">{data.business_name || '-'}</p>
                </div>
                <div>
                  <span className="text-xs text-stone-500">{lang === 'sw' ? 'Aina ya Biashara' : 'Business Type'}</span>
                  <p className="font-medium">{BUSINESS_TYPES.find(b => b.value === data.business_type)?.label || data.business_type}</p>
                </div>
                <div>
                  <span className="text-xs text-stone-500">{lang === 'sw' ? 'Ukubwa wa Biashara' : 'Business Size'}</span>
                  <p className="font-medium">{BUSINESS_SIZES.find(b => b.value === data.business_size)?.label || data.business_size || '-'}</p>
                </div>
                <div>
                  <span className="text-xs text-stone-500">{lang === 'sw' ? 'Muda wa Biashara' : 'Years in Operation'}</span>
                  <p className="font-medium">{data.years_in_operation ? `${data.years_in_operation} ${lang === 'sw' ? 'miaka' : 'years'}` : '-'}</p>
                </div>
                <div>
                  <span className="text-xs text-stone-500">{lang === 'sw' ? 'Wafanyakazi' : 'Employees'}</span>
                  <p className="font-medium">{data.employees_count || '0'}</p>
                </div>
                <div>
                  <span className="text-xs text-stone-500">TIN Number</span>
                  <p className="font-medium">{data.tin_number || '-'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
            <div className="bg-purple-50 px-4 py-2 border-b border-purple-100">
              <h4 className="font-bold text-purple-800 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {lang === 'sw' ? 'Eneo la Biashara' : 'Business Location'}
              </h4>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-stone-500">{lang === 'sw' ? 'Aina ya Eneo' : 'Location Type'}</span>
                  <p className="font-medium">{BUSINESS_LOCATIONS.find(l => l.value === data.business_location_type)?.label || data.business_location_type || '-'}</p>
                </div>
                <div className="md:col-span-2">
                  <span className="text-xs text-stone-500">{lang === 'sw' ? 'Anwani Kamili' : 'Full Address'}</span>
                  <p className="font-medium bg-stone-50 p-2 rounded-lg mt-1">{data.location}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
            <div className="bg-purple-50 px-4 py-2 border-b border-purple-100">
              <h4 className="font-bold text-purple-800">{lang === 'sw' ? 'Nyaraka' : 'Documents'}</h4>
            </div>
            <div className="p-4">
              {idCopy ? (
                <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <FileText className="h-8 w-8 text-emerald-600" />
                  <div className="flex-1">
                    <p className="font-medium text-emerald-800">{idCopy.name}</p>
                    <p className="text-xs text-emerald-600">{(idCopy.size / 1024).toFixed(1)} KB</p>
                  </div>
                  {uploadedUrl && (
                    <a 
                      href={uploadedUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline"
                    >
                      {lang === 'sw' ? 'Angalia' : 'View'}
                    </a>
                  )}
                </div>
              ) : (
                <p className="text-stone-500 italic">{lang === 'sw' ? 'Hakuna kitambulisho kilichopakiwa' : 'No ID uploaded'}</p>
              )}
            </div>
          </div>

          {/* Important Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-amber-800 mb-1">
                  {lang === 'sw' ? 'Masharti ya Biashara' : 'Business Terms'}
                </h4>
                <p className="text-sm text-amber-700">
                  {lang === 'sw' 
                    ? 'Kwa kutuma ombi hili, unakubali kufuata sheria na kanuni za biashara za halmashauri yako. Leseni yako itakaguliwa na idara ya mapato na biashara.'
                    : 'By submitting this application, you agree to comply with all business laws and regulations of your council. Your license will be reviewed by the revenue and trade department.'}
                </p>
              </div>
            </div>
          </div>

          {/* Fee Summary */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-purple-800">{lang === 'sw' ? 'Ada ya Leseni:' : 'License Fee:'}</span>
              <span className="font-bold text-xl text-purple-600">10,000 TZS</span>
            </div>
            <p className="text-xs text-purple-600 mt-1">
              {lang === 'sw' 
                ? 'Ada hii ni kwa ajili ya leseni ya biashara ndogondogo. Malipo yatakamilishwa baada ya kuwasilisha.'
                : 'This is the petty trader license fee. Payment will be completed after submission.'}
            </p>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => setCurrentStep('documents')}
            className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-5 w-5" />
            {lang === 'sw' ? 'Rudi' : 'Back'}
          </button>
          <button
            type="button"
            onClick={confirmSubmit}
            disabled={isLoading || !uploadedUrl}
            className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <FileCheck className="h-5 w-5" />
                {lang === 'sw' ? 'Wasilisha Leseni' : 'Submit License'}
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

      {/* Step 1: Business Information */}
      {currentStep === 'business' && (
        <div className="space-y-6">
          <div className={sectionClass}>
            <h3 className="font-bold text-purple-800 flex items-center gap-2">
              <Store className="h-5 w-5" />
              {lang === 'sw' ? 'TAARIFA ZA BIASHARA' : 'BUSINESS INFORMATION'}
            </h3>
          </div>

          <div>
            <label className={labelClass}>
              {lang === 'sw' ? 'Jina la Biashara' : 'Business Name'}
            </label>
            <div className="relative">
              <Store className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-stone-400" />
              <input 
                type="text" 
                {...register('business_name')} 
                className={`${inputClass} pl-10`}
                placeholder={lang === 'sw' ? 'Mfano: Mama Jeni Chips, Duka la Juma' : 'E.g.: Mama Jeni Chips, Juma\'s Shop'}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>
              {lang === 'sw' ? 'Aina ya Biashara' : 'Business Type'} <span className="text-red-500">*</span>
            </label>
            <select 
              {...register('business_type', { required: true })} 
              className={inputClass}
            >
              <option value="">{t.selectOption}</option>
              {BUSINESS_TYPES.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {errors.business_type && <span className="text-red-500 text-sm">{t.required}</span>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                {lang === 'sw' ? 'Ukubwa wa Biashara' : 'Business Size'}
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-stone-400" />
                <select 
                  {...register('business_size')} 
                  className={`${inputClass} pl-10`}
                >
                  <option value="">{lang === 'sw' ? 'Chagua...' : 'Select...'}</option>
                  {BUSINESS_SIZES.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass}>
                {lang === 'sw' ? 'Muda wa Biashara (Miaka)' : 'Years in Operation'}
              </label>
              <input 
                type="number" 
                {...register('years_in_operation', { min: 0, max: 100 })} 
                className={inputClass}
                placeholder="0"
                min="0"
                max="100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                {lang === 'sw' ? 'Idadi ya Wafanyakazi' : 'Number of Employees'}
              </label>
              <input 
                type="number" 
                {...register('employees_count', { min: 0 })} 
                className={inputClass}
                placeholder="0"
                min="0"
              />
            </div>

            <div>
              <label className={labelClass}>
                {lang === 'sw' ? 'Namba ya TIN (Kama unayo)' : 'TIN Number (If available)'}
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-stone-400" />
                <input 
                  type="text" 
                  {...register('tin_number')} 
                  className={`${inputClass} pl-10`}
                  placeholder="123-456-789"
                />
              </div>
            </div>
          </div>

          {/* Business registration info */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-700">
              {lang === 'sw' 
                ? 'Ikiwa una TIN, ingiza namba yake. Hii itasaidia katika utambuzi wa biashara yako kwa TRA.'
                : 'If you have a TIN, please enter it. This helps in identifying your business with TRA.'}
            </p>
          </div>
        </div>
      )}

      {/* Step 2: Location Information */}
      {currentStep === 'location' && (
        <div className="space-y-6">
          <div className={sectionClass}>
            <h3 className="font-bold text-purple-800 flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {lang === 'sw' ? 'ENEO LA BIASHARA' : 'BUSINESS LOCATION'}
            </h3>
          </div>

          <div>
            <label className={labelClass}>
              {lang === 'sw' ? 'Aina ya Eneo la Biashara' : 'Business Location Type'}
            </label>
            <select 
              {...register('business_location_type')} 
              className={inputClass}
            >
              <option value="">{lang === 'sw' ? 'Chagua...' : 'Select...'}</option>
              {BUSINESS_LOCATIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>
              {lang === 'sw' ? 'Eneo la Biashara (Mtaa/Soko)' : 'Business Location'} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-stone-400" />
              <input 
                type="text" 
                {...register('location', { required: true })} 
                className={`${inputClass} pl-10`}
                placeholder={lang === 'sw' ? 'Mfano: Soko la Kariakoo, Mtaa wa Uhuru, eneo la mnada' : 'E.g.: Kariakoo Market, Uhuru Street, auction area'}
              />
            </div>
            {errors.location && <span className="text-red-500 text-sm">{t.required}</span>}
          </div>

          <div>
            <label className={labelClass}>
              {lang === 'sw' ? 'Maelezo ya Ziada ya Eneo' : 'Additional Location Details'}
            </label>
            <textarea 
              className={inputClass}
              rows={3}
              placeholder={lang === 'sw' 
                ? 'Eleza kwa undani eneo la biashara yako (jina la soko, namba ya duka, alama za jirani, wilaya, mkoa)' 
                : 'Describe your business location in detail (market name, shop number, nearby landmarks, district, region)'}
              {...register('location_detail')}
            />
          </div>

          {/* Location guidelines */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <h4 className="font-bold text-amber-800 mb-2">
              {lang === 'sw' ? 'Miongozo ya Eneo la Biashara' : 'Business Location Guidelines'}
            </h4>
            <ul className="text-sm text-amber-700 space-y-1 list-disc list-inside">
              <li>{lang === 'sw' ? 'Hakikisha eneo lako linakubalika kwa biashara uliyochagua' : 'Ensure your location is zoned for your business type'}</li>
              <li>{lang === 'sw' ? 'Wachuuzi wa mitaani wanatakiwa kuwa na vibali vya eneo' : 'Street vendors must have area permits'}</li>
              <li>{lang === 'sw' ? 'Biashara za makazini zinahitaji kibali cha jirani' : 'Home-based businesses need neighbor consent'}</li>
            </ul>
          </div>
        </div>
      )}

      {/* Step 3: Documents */}
      {currentStep === 'documents' && (
        <div className="space-y-6">
          <div className={sectionClass}>
            <h3 className="font-bold text-purple-800 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {lang === 'sw' ? 'NYARAKA NA KITAMBULISHO' : 'DOCUMENTS AND IDENTIFICATION'}
            </h3>
          </div>

          <div>
            <label className={labelClass}>
              {lang === 'sw' ? 'Nakala ya Kitambulisho (NIDA/Mpiga Kura)' : 'ID Copy (NIDA/Voter ID)'} <span className="text-red-500">*</span>
            </label>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              aria-label="Upload ID copy"
            />
            
            {!idCopy ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                aria-label="Upload ID copy"
                className="w-full p-8 border-2 border-dashed border-stone-300 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all flex flex-col items-center gap-3"
              >
                {uploading ? (
                  <Loader2 className="h-10 w-10 text-purple-500 animate-spin" />
                ) : (
                  <>
                    <Upload className="h-10 w-10 text-stone-400" />
                    <div className="text-center">
                      <span className="text-stone-600 font-medium block">
                        {lang === 'sw' ? 'Bofya kupakia kitambulisho' : 'Click to upload ID'}
                      </span>
                      <span className="text-xs text-stone-400 mt-1 block">
                        PDF, JPG, PNG (Max 5MB)
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
                    <p className="font-medium text-emerald-800">{idCopy.name}</p>
                    <p className="text-xs text-emerald-600">{(idCopy.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="Remove uploaded file"
                  onClick={() => {
                    setIdCopy(null);
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

          {/* Document requirements */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <h4 className="font-bold text-amber-800 mb-2">
              {lang === 'sw' ? 'Mahitaji ya Kitambulisho' : 'ID Requirements'}
            </h4>
            <ul className="text-sm text-amber-700 space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{lang === 'sw' ? 'Kitambulisho cha NIDA au Mpiga Kura kinakubalika' : 'NIDA ID or Voter ID is acceptable'}</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{lang === 'sw' ? 'Jina kwenye kitambulisho lazima lilingane na jina la mwombaji' : 'Name on ID must match applicant name'}</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{lang === 'sw' ? 'Kitambulisho lazima kiwe wazi na kisomeke vizuri' : 'ID must be clear and legible'}</span>
              </li>
            </ul>
          </div>

          {/* Upload status */}
          {uploadedUrl && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                <span className="text-emerald-700 font-medium">
                  {lang === 'sw' ? 'Kitambulisho kimepakiwa kikamilifu!' : 'ID uploaded successfully!'}
                </span>
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
            className={`flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 ${
              currentStepIndex === 0 ? 'w-full' : ''
            }`}
          >
            {currentStep === 'documents' ? (
              <>
                {lang === 'sw' ? 'Hakiki Maombi' : 'Review Application'}
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

export default LeseniaBiasharaForm;