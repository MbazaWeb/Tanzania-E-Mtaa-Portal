/**
 * Kibali cha Ujenzi (Maboresho) Form
 * Building Permit (Renovations)
 * 
 * Service: Kibali cha Ujenzi (Maboresho)
 * Fee: 50,000 TZS
 * 
 * Features:
 * - Book-style layout with sections
 * - Progress tracking
 * - File upload with preview
 * - Review step before submission
 */
import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2, CheckCircle, ArrowLeft, ArrowRight, Eye, FileCheck, Upload, X, FileText, AlertCircle, Home, Calendar, DollarSign } from 'lucide-react';
import { FormProps, labels } from './types';
import { supabase } from '@/src/lib/supabase';

// Work type options
const WORK_TYPES = [
  { label: 'UKUTA / FENSI', value: 'FENSI' },
  { label: 'MABORESHO YA NDANI', value: 'MABORESHO_NDANI' },
  { label: 'PAZE / CHOO', value: 'CHOO_PAZE' },
  { label: 'NYINGINEZO', value: 'NYINGINEZO' },
];

interface FormData {
  // Property info
  plot_number: string;
  block_number: string;
  location_desc: string;
  // Work details
  work_type: string;
  estimated_cost: number;
  duration: number;
  // File will be handled separately
}

type Step = 'property' | 'work' | 'documents' | 'review';

export const KibaliUjenziForm: React.FC<FormProps> = ({
  onSubmit,
  isLoading,
  lang = 'sw',
  userProfile
}) => {
  const t = labels[lang];
  const [currentStep, setCurrentStep] = useState<Step>('property');
  const [showReview, setShowReview] = useState(false);
  const [formData, setFormData] = useState<FormData | null>(null);
  
  // File upload state
  const [ownershipDoc, setOwnershipDoc] = useState<File | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, formState: { errors }, trigger, getValues, setValue } = useForm<FormData>();

  const steps: { key: Step; label: string; swLabel: string }[] = [
    { key: 'property', label: 'Property', swLabel: 'Mali' },
    { key: 'work', label: 'Work Details', swLabel: 'Maelezo ya Kazi' },
    { key: 'documents', label: 'Documents', swLabel: 'Nyaraka' },
    { key: 'review', label: 'Review', swLabel: 'Hakiki' },
  ];

  const currentStepIndex = steps.findIndex(s => s.key === currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setOwnershipDoc(file);
    setUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `ownership/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
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
      case 'property':
        fieldsToValidate = ['plot_number', 'location_desc'];
        break;
      case 'work':
        fieldsToValidate = ['work_type', 'duration'];
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
        ownership_doc: uploadedUrl,
      };
      onSubmit(completeData, [uploadedUrl], 'self');
    }
  };

  const inputClass = "w-full p-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white";
  const labelClass = "block text-sm font-semibold text-stone-700 mb-2";
  const sectionClass = "bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border-l-4 border-blue-500 mb-6 shadow-sm";

  // Progress Bar Component
  const ProgressBar = () => (
    <div className="mb-8">
      <div className="flex justify-between mb-2">
        {steps.map((step, index) => (
          <div 
            key={step.key}
            className={`flex flex-col items-center ${index <= currentStepIndex ? 'text-blue-600' : 'text-stone-400'}`}
          >
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mb-1
              ${index < currentStepIndex 
                ? 'bg-blue-600 text-white' 
                : index === currentStepIndex
                ? 'bg-blue-100 text-blue-600 border-2 border-blue-600'
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
          className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex justify-between mt-2">
        <span className="text-xs text-stone-500">
          {lang === 'sw' ? 'Hatua' : 'Step'} {currentStepIndex + 1} {lang === 'sw' ? 'kati ya' : 'of'} {steps.length}
        </span>
        <span className="text-xs font-bold text-blue-600">{Math.round(progress)}%</span>
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
                {lang === 'sw' ? 'Hakiki Maombi ya Kibali cha Ujenzi' : 'Review Building Permit Application'}
              </h3>
              <p className="text-sm text-amber-700">
                {lang === 'sw' 
                  ? 'Tafadhali hakiki taarifa zako za ujenzi kabla ya kuwasilisha. Hakikisha nyaraka zote zimepakiwa kwa usahihi.'
                  : 'Please review your building information before submitting. Ensure all documents are uploaded correctly.'}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Applicant Info */}
          <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
            <div className="bg-blue-50 px-4 py-2 border-b border-blue-100">
              <h4 className="font-bold text-blue-800">{lang === 'sw' ? 'Mwombaji' : 'Applicant'}</h4>
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

          {/* Property Info */}
          <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
            <div className="bg-blue-50 px-4 py-2 border-b border-blue-100">
              <h4 className="font-bold text-blue-800">{lang === 'sw' ? 'Taarifa za Mali' : 'Property Information'}</h4>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-stone-500">{lang === 'sw' ? 'Namba ya Kiwanja' : 'Plot Number'}</span>
                  <p className="font-medium">{data.plot_number}</p>
                </div>
                <div>
                  <span className="text-xs text-stone-500">{lang === 'sw' ? 'Block' : 'Block'}</span>
                  <p className="font-medium">{data.block_number || '-'}</p>
                </div>
              </div>
              <div className="mt-3">
                <span className="text-xs text-stone-500">{lang === 'sw' ? 'Maelezo ya Eneo' : 'Location Description'}</span>
                <p className="font-medium bg-stone-50 p-2 rounded-lg mt-1">{data.location_desc}</p>
              </div>
            </div>
          </div>

          {/* Work Details */}
          <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
            <div className="bg-blue-50 px-4 py-2 border-b border-blue-100">
              <h4 className="font-bold text-blue-800">{lang === 'sw' ? 'Maelezo ya Kazi' : 'Work Details'}</h4>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <span className="text-xs text-stone-500">{lang === 'sw' ? 'Aina ya Kazi' : 'Work Type'}</span>
                  <p className="font-medium">{WORK_TYPES.find(w => w.value === data.work_type)?.label || data.work_type}</p>
                </div>
                <div>
                  <span className="text-xs text-stone-500">{lang === 'sw' ? 'Gharama (TZS)' : 'Cost (TZS)'}</span>
                  <p className="font-medium">{data.estimated_cost ? data.estimated_cost.toLocaleString() : '-'}</p>
                </div>
                <div>
                  <span className="text-xs text-stone-500">{lang === 'sw' ? 'Muda (Siku)' : 'Duration (Days)'}</span>
                  <p className="font-medium">{data.duration} {lang === 'sw' ? 'siku' : 'days'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
            <div className="bg-blue-50 px-4 py-2 border-b border-blue-100">
              <h4 className="font-bold text-blue-800">{lang === 'sw' ? 'Nyaraka' : 'Documents'}</h4>
            </div>
            <div className="p-4">
              {ownershipDoc ? (
                <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <FileText className="h-8 w-8 text-emerald-600" />
                  <div className="flex-1">
                    <p className="font-medium text-emerald-800">{ownershipDoc.name}</p>
                    <p className="text-xs text-emerald-600">{(ownershipDoc.size / 1024).toFixed(1)} KB</p>
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
                <p className="text-stone-500 italic">{lang === 'sw' ? 'Hakuna hati iliyopakiwa' : 'No document uploaded'}</p>
              )}
            </div>
          </div>

          {/* Important Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-amber-800 mb-1">
                  {lang === 'sw' ? 'Masharti na Kanuni za Ujenzi' : 'Building Regulations'}
                </h4>
                <p className="text-sm text-amber-700">
                  {lang === 'sw' 
                    ? 'Kwa kutuma ombi hili, unakubali kufuata kanuni zote za ujenzi za halmashauri yako. Ukiukaji wa kanuni unaweza kusababisha kulipa faini au kubomolewa kwa jengo.'
                    : 'By submitting this application, you agree to comply with all building regulations of your council. Violation of regulations may result in fines or demolition.'}
                </p>
              </div>
            </div>
          </div>

          {/* Fee Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-blue-800">{lang === 'sw' ? 'Ada ya Kibali cha Ujenzi:' : 'Building Permit Fee:'}</span>
              <span className="font-bold text-xl text-blue-600">50,000 TZS</span>
            </div>
            <p className="text-xs text-blue-600 mt-1">
              {lang === 'sw' 
                ? 'Ada hii ni kwa ajili ya kibali cha ujenzi. Malipo yatakamilishwa baada ya kuwasilisha.'
                : 'This is the building permit fee. Payment will be completed after submission.'}
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
            className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <FileCheck className="h-5 w-5" />
                {lang === 'sw' ? 'Wasilisha Ombi' : 'Submit Application'}
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

      {/* Step 1: Property Info */}
      {currentStep === 'property' && (
        <div className="space-y-6">
          <div className={sectionClass}>
            <h3 className="font-bold text-blue-800">
              {lang === 'sw' ? 'TAARIFA ZA KIWANJA / NYUMBA' : 'PROPERTY INFORMATION'}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                {lang === 'sw' ? 'Namba ya Kiwanja' : 'Plot Number'} <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                {...register('plot_number', { required: true })} 
                className={inputClass}
                placeholder={lang === 'sw' ? 'Mfano: PLOT NO. 123' : 'E.g.: PLOT NO. 123'}
              />
              {errors.plot_number && <span className="text-red-500 text-sm">{t.required}</span>}
            </div>

            <div>
              <label className={labelClass}>
                {lang === 'sw' ? 'Block' : 'Block'}
              </label>
              <input 
                type="text" 
                {...register('block_number')} 
                className={inputClass}
                placeholder="BLOCK A"
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>
              {lang === 'sw' ? 'Maelezo ya Eneo' : 'Location Description'} <span className="text-red-500">*</span>
            </label>
            <textarea 
              {...register('location_desc', { required: true })} 
              className={inputClass}
              rows={4}
              placeholder={lang === 'sw' 
                ? 'Eleza eneo la kiwanja (mtaa, jirani na nini, alama za eneo, wilaya, mkoa)' 
                : 'Describe the property location (street, nearby landmarks, district, region)'}
            />
            {errors.location_desc && <span className="text-red-500 text-sm">{t.required}</span>}
          </div>

          {/* Info box */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-2">
              <Home className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <p className="text-sm text-blue-700">
                {lang === 'sw' 
                  ? 'Hakikisha namba ya kiwanja na maelezo ya eneo ni sahihi. Taarifa hizi zitatumika kuthibitisha umiliki wako.'
                  : 'Ensure the plot number and location description are correct. This information will be used to verify your ownership.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Work Details */}
      {currentStep === 'work' && (
        <div className="space-y-6">
          <div className={sectionClass}>
            <h3 className="font-bold text-blue-800">
              {lang === 'sw' ? 'MAELEZO YA KAZI YA UJENZI' : 'CONSTRUCTION WORK DETAILS'}
            </h3>
          </div>

          <div>
            <label className={labelClass}>
              {lang === 'sw' ? 'Aina ya Kazi' : 'Type of Work'} <span className="text-red-500">*</span>
            </label>
            <select 
              {...register('work_type', { required: true })} 
              className={inputClass}
            >
              <option value="">{t.selectOption}</option>
              {WORK_TYPES.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {errors.work_type && <span className="text-red-500 text-sm">{t.required}</span>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                {lang === 'sw' ? 'Gharama ya Ujenzi (TZS)' : 'Estimated Cost (TZS)'}
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-stone-400" />
                <input 
                  type="number" 
                  {...register('estimated_cost')} 
                  className={`${inputClass} pl-10`}
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>
                {lang === 'sw' ? 'Muda wa Kazi (Siku)' : 'Duration (Days)'} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-stone-400" />
                <input 
                  type="number" 
                  {...register('duration', { required: true, min: 1 })} 
                  className={`${inputClass} pl-10`}
                  placeholder="30"
                />
              </div>
              {errors.duration && <span className="text-red-500 text-sm">{t.required}</span>}
            </div>
          </div>

          {/* Cost guidelines */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <h4 className="font-bold text-emerald-800 mb-2">
              {lang === 'sw' ? 'Makadirio ya Gharama' : 'Cost Estimates'}
            </h4>
            <p className="text-sm text-emerald-700">
              {lang === 'sw' 
                ? 'Kadirio la gharama linapaswa kuwa karibu na gharama halisi. Halmashauri inaweza kutumia makadirio haya kukokotoa ada za leseni.'
                : 'The cost estimate should be close to the actual cost. The council may use this estimate to calculate license fees.'}
            </p>
          </div>
        </div>
      )}

      {/* Step 3: Documents */}
      {currentStep === 'documents' && (
        <div className="space-y-6">
          <div className={sectionClass}>
            <h3 className="font-bold text-blue-800">
              {lang === 'sw' ? 'HATI NA NYARAKA' : 'DOCUMENTS'}
            </h3>
          </div>

          <div>
            <label className={labelClass}>
              {lang === 'sw' ? 'Hati ya Umiliki' : 'Ownership Document'} <span className="text-red-500">*</span>
            </label>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              className="hidden"
              aria-label="Upload ownership document"
            />
            
            {!ownershipDoc ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                aria-label="Upload ownership document"
                className="w-full p-8 border-2 border-dashed border-stone-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all flex flex-col items-center gap-3"
              >
                {uploading ? (
                  <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
                ) : (
                  <>
                    <Upload className="h-10 w-10 text-stone-400" />
                    <div className="text-center">
                      <span className="text-stone-600 font-medium block">
                        {lang === 'sw' ? 'Bofya kupakia hati ya umiliki' : 'Click to upload ownership document'}
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
                    <p className="font-medium text-emerald-800">{ownershipDoc.name}</p>
                    <p className="text-xs text-emerald-600">{(ownershipDoc.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="Remove uploaded file"
                  onClick={() => {
                    setOwnershipDoc(null);
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
              {lang === 'sw' ? 'Mahitaji ya Hati ya Umiliki' : 'Ownership Document Requirements'}
            </h4>
            <ul className="text-sm text-amber-700 space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{lang === 'sw' ? 'Hati inayokubalika: Hati ya Ardhi, Hati ya Mmiliki, au Risiti ya Umalizaji' : 'Acceptable documents: Title Deed, Certificate of Occupancy, or Purchase Receipt'}</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{lang === 'sw' ? 'Hati lazima iwe na jina la mwombaji linalolingana na kitambulisho' : 'Document must have applicant name matching ID'}</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{lang === 'sw' ? 'Hati lazima iwe wazi na isomeke vizuri' : 'Document must be clear and legible'}</span>
              </li>
            </ul>
          </div>

          {/* File upload status */}
          {uploadedUrl && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                <span className="text-emerald-700 font-medium">
                  {lang === 'sw' ? 'Hati imepakiwa kikamilifu!' : 'Document uploaded successfully!'}
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
            className={`flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 ${
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

export default KibaliUjenziForm;