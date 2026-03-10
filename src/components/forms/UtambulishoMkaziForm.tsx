/**
 * Utambulisho wa Mkazi (Barua ya Utambulisho) Form
 * Residency Certificate / Identification Letter
 * 
 * Service: Utambulisho wa Mkazi
 * Fee: 5,000 TZS
 * 
 * Features:
 * - Book-style layout with sections
 * - Progress tracking
 * - Review step before submission
 */
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2, CheckCircle, ArrowLeft, ArrowRight, Eye, FileCheck } from 'lucide-react';
import { FormProps, labels } from './types';

// Council options
const COUNCILS = [
  { label: 'HALMASHAURI YA MANISPAA YA ARUSHA', value: 'ARUSHA' },
  { label: 'HALMASHAURI YA MANISPAA YA KINONDONI', value: 'KINONDONI' },
  { label: 'HALMASHAURI YA MANISPAA YA DODOMA', value: 'DODOMA' },
  { label: 'HALMASHAURI YA MANISPAA YA MBEYA', value: 'MBEYA' },
  { label: 'HALMASHAURI YA MANISPAA YA MWANZA', value: 'MWANZA' },
];

// Marital status options
const MARITAL_STATUS = [
  { label: 'NDOA', value: 'NDOA' },
  { label: 'HAJAOLEWA', value: 'HAJAOLEWA' },
  { label: 'TALAKA', value: 'TALAKA' },
  { label: 'MJANE', value: 'MJANE' },
];

// Purpose options
const PURPOSE_OPTIONS = [
  { label: 'KUSOMA', value: 'KUSOMA' },
  { label: 'AJIRA', value: 'AJIRA' },
  { label: 'BIASHARA', value: 'BIASHARA' },
  { label: 'HUDUMA YA AFYA', value: 'HUDUMA_YA_AFYA' },
  { label: 'HATI YA KUSAFIRI', value: 'HATI_YA_KUSAFIRI' },
  { label: 'NYINGINEZO', value: 'NYINGINEZO' },
];

// Institution type options
const INSTITUTION_TYPES = [
  { label: 'OFISI YA SERIKALI', value: 'OFISI_YA_SERIKALI' },
  { label: 'HOSPITALI', value: 'HOSPITALI' },
  { label: 'BENKI', value: 'BENKI' },
  { label: 'SHULE/CHUO', value: 'SHULE_CHUO' },
];

interface FormData {
  council: string;
  marital_status: string;
  occupation: string;
  neighborhood: string;
  house_number: string;
  block_number: string;
  purpose: string;
  institution_name: string;
  institution_type: string;
}

type Step = 'council' | 'personal' | 'residence' | 'purpose' | 'review';

export const UtambulishoMkaziForm: React.FC<FormProps> = ({
  onSubmit,
  isLoading,
  lang = 'sw',
  userProfile
}) => {
  const t = labels[lang];
  const [currentStep, setCurrentStep] = useState<Step>('council');
  const [showReview, setShowReview] = useState(false);
  const [formData, setFormData] = useState<FormData | null>(null);
  
  const { register, handleSubmit, formState: { errors }, trigger, getValues } = useForm<FormData>();

  const steps: { key: Step; label: string; swLabel: string }[] = [
    { key: 'council', label: 'Council Info', swLabel: 'Halmashauri' },
    { key: 'personal', label: 'Personal Info', swLabel: 'Taarifa Binafsi' },
    { key: 'residence', label: 'Residence', swLabel: 'Makazi' },
    { key: 'purpose', label: 'Purpose', swLabel: 'Sababu' },
    { key: 'review', label: 'Review', swLabel: 'Hakiki' },
  ];

  const currentStepIndex = steps.findIndex(s => s.key === currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const validateCurrentStep = async (): Promise<boolean> => {
    let fieldsToValidate: (keyof FormData)[] = [];
    
    switch (currentStep) {
      case 'council':
        fieldsToValidate = ['council'];
        break;
      case 'personal':
        fieldsToValidate = ['marital_status', 'occupation'];
        break;
      case 'residence':
        fieldsToValidate = ['neighborhood'];
        break;
      case 'purpose':
        fieldsToValidate = ['purpose', 'institution_name'];
        break;
      default:
        return true;
    }
    
    const result = await trigger(fieldsToValidate);
    return result;
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (!isValid) return;

    if (currentStep === 'purpose') {
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
    if (formData) {
      onSubmit(formData, [], 'self');
    }
  };

  const inputClass = "w-full p-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white";
  const labelClass = "block text-sm font-semibold text-stone-700 mb-2";
  const sectionClass = "bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-xl border-l-4 border-emerald-500 mb-6 shadow-sm";

  // Progress Bar Component
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
                {lang === 'sw' ? 'Hakiki Maombi Yako' : 'Review Your Application'}
              </h3>
              <p className="text-sm text-amber-700">
                {lang === 'sw' 
                  ? 'Tafadhali hakiki taarifa zako kabla ya kuwasilisha. Baada ya kuwasilisha, hutoweza kurekebisha.'
                  : 'Please review your information before submitting. Once submitted, you cannot make changes.'}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Council Info */}
          <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
            <div className="bg-emerald-50 px-4 py-2 border-b border-emerald-100">
              <h4 className="font-bold text-emerald-800">{lang === 'sw' ? 'Halmashauri' : 'Council'}</h4>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-stone-500">{lang === 'sw' ? 'Halmashauri' : 'Council'}</span>
                  <p className="font-medium">{COUNCILS.find(c => c.value === data.council)?.label || data.council}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Personal Info */}
          <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
            <div className="bg-emerald-50 px-4 py-2 border-b border-emerald-100">
              <h4 className="font-bold text-emerald-800">{lang === 'sw' ? 'Taarifa Binafsi' : 'Personal Info'}</h4>
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
                  <span className="text-xs text-stone-500">NIDA</span>
                  <p className="font-medium">{userProfile?.nida_number || '-'}</p>
                </div>
                <div>
                  <span className="text-xs text-stone-500">{lang === 'sw' ? 'Hali ya Ndoa' : 'Marital Status'}</span>
                  <p className="font-medium">{MARITAL_STATUS.find(m => m.value === data.marital_status)?.label || data.marital_status}</p>
                </div>
                <div>
                  <span className="text-xs text-stone-500">{lang === 'sw' ? 'Kazi' : 'Occupation'}</span>
                  <p className="font-medium">{data.occupation}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Residence Info */}
          <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
            <div className="bg-emerald-50 px-4 py-2 border-b border-emerald-100">
              <h4 className="font-bold text-emerald-800">{lang === 'sw' ? 'Makazi' : 'Residence'}</h4>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <span className="text-xs text-stone-500">{lang === 'sw' ? 'Kitongoji' : 'Neighborhood'}</span>
                  <p className="font-medium">{data.neighborhood}</p>
                </div>
                <div>
                  <span className="text-xs text-stone-500">{lang === 'sw' ? 'Nyumba No.' : 'House No.'}</span>
                  <p className="font-medium">{data.house_number || '-'}</p>
                </div>
                <div>
                  <span className="text-xs text-stone-500">Block/Area</span>
                  <p className="font-medium">{data.block_number || '-'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Purpose Info */}
          <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
            <div className="bg-emerald-50 px-4 py-2 border-b border-emerald-100">
              <h4 className="font-bold text-emerald-800">{lang === 'sw' ? 'Sababu na Taasisi' : 'Purpose & Institution'}</h4>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-stone-500">{lang === 'sw' ? 'Sababu' : 'Purpose'}</span>
                  <p className="font-medium">{PURPOSE_OPTIONS.find(p => p.value === data.purpose)?.label || data.purpose}</p>
                </div>
                <div>
                  <span className="text-xs text-stone-500">{lang === 'sw' ? 'Taasisi' : 'Institution'}</span>
                  <p className="font-medium">{data.institution_name}</p>
                </div>
                <div>
                  <span className="text-xs text-stone-500">{lang === 'sw' ? 'Aina ya Taasisi' : 'Institution Type'}</span>
                  <p className="font-medium">{INSTITUTION_TYPES.find(i => i.value === data.institution_type)?.label || data.institution_type || '-'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Fee Summary */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-emerald-800">{lang === 'sw' ? 'Ada ya Maombi:' : 'Application Fee:'}</span>
              <span className="font-bold text-xl text-emerald-600">5,000 TZS</span>
            </div>
            <p className="text-xs text-emerald-600 mt-1">
              {lang === 'sw' 
                ? 'Utachagua njia ya malipo baada ya kuwasilisha'
                : 'You will select payment method after submission'}
            </p>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => setCurrentStep('purpose')}
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
                {lang === 'sw' ? 'Thibitisha na Wasilisha' : 'Confirm & Submit'}
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

      {/* Step 1: Council Info */}
      {currentStep === 'council' && (
        <div className="space-y-6">
          <div className={sectionClass}>
            <h3 className="font-bold text-emerald-800">
              {lang === 'sw' ? 'TAARIFA ZA HALMASHAURI' : 'COUNCIL INFORMATION'}
            </h3>
          </div>

          <div>
            <label className={labelClass}>
              {lang === 'sw' ? 'Halmashauri' : 'Council'} <span className="text-red-500">*</span>
            </label>
            <select 
              {...register('council', { required: true })} 
              className={inputClass}
            >
              <option value="">{t.selectOption}</option>
              {COUNCILS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {errors.council && <span className="text-red-500 text-sm">{t.required}</span>}
          </div>
        </div>
      )}

      {/* Step 2: Personal Info */}
      {currentStep === 'personal' && (
        <div className="space-y-6">
          <div className={sectionClass}>
            <h3 className="font-bold text-emerald-800">
              {lang === 'sw' ? 'TAARIFA BINAFSI (Zilizohakikiwa na NIDA)' : 'PERSONAL INFO (Verified by NIDA)'}
            </h3>
          </div>

          {/* Verified NIDA info display */}
          {userProfile && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <p className="text-sm text-emerald-700 font-medium mb-2">
                {lang === 'sw' ? 'Taarifa kutoka NIDA:' : 'Information from NIDA:'}
              </p>
              <p className="font-bold">{userProfile.first_name} {userProfile.middle_name} {userProfile.last_name}</p>
              <p className="text-sm text-stone-600">NIDA: {userProfile.nida_number}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                {lang === 'sw' ? 'Hali ya Ndoa' : 'Marital Status'} <span className="text-red-500">*</span>
              </label>
              <select 
                {...register('marital_status', { required: true })} 
                className={inputClass}
              >
                <option value="">{t.selectOption}</option>
                {MARITAL_STATUS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {errors.marital_status && <span className="text-red-500 text-sm">{t.required}</span>}
            </div>

            <div>
              <label className={labelClass}>
                {lang === 'sw' ? 'Kazi/Shughuli' : 'Occupation'} <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                {...register('occupation', { required: true })} 
                className={inputClass}
                placeholder={lang === 'sw' ? 'Mfano: Mwalimu, Mfanyabiashara' : 'E.g.: Teacher, Business'}
              />
              {errors.occupation && <span className="text-red-500 text-sm">{t.required}</span>}
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Residence Info */}
      {currentStep === 'residence' && (
        <div className="space-y-6">
          <div className={sectionClass}>
            <h3 className="font-bold text-emerald-800">
              {lang === 'sw' ? 'TAARIFA ZA MAKAZI' : 'RESIDENCE INFORMATION'}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>
                {lang === 'sw' ? 'Kitongoji' : 'Neighborhood'} <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                {...register('neighborhood', { required: true })} 
                className={inputClass}
              />
              {errors.neighborhood && <span className="text-red-500 text-sm">{t.required}</span>}
            </div>

            <div>
              <label className={labelClass}>
                {lang === 'sw' ? 'Nyumba No.' : 'House No.'}
              </label>
              <input 
                type="text" 
                {...register('house_number')} 
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>
                {lang === 'sw' ? 'Block/Area' : 'Block/Area'}
              </label>
              <input 
                type="text" 
                {...register('block_number')} 
                className={inputClass}
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Purpose */}
      {currentStep === 'purpose' && (
        <div className="space-y-6">
          <div className={sectionClass}>
            <h3 className="font-bold text-emerald-800">
              {lang === 'sw' ? 'SABABU YA MAOMBI NA TAASISI' : 'PURPOSE AND INSTITUTION'}
            </h3>
          </div>

          <div>
            <label className={labelClass}>
              {lang === 'sw' ? 'Sababu ya Maombi' : 'Purpose'} <span className="text-red-500">*</span>
            </label>
            <select 
              {...register('purpose', { required: true })} 
              className={inputClass}
            >
              <option value="">{t.selectOption}</option>
              {PURPOSE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {errors.purpose && <span className="text-red-500 text-sm">{t.required}</span>}
          </div>

          <div>
            <label className={labelClass}>
              {lang === 'sw' ? 'Jina la Taasisi' : 'Institution Name'} <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              {...register('institution_name', { required: true })} 
              className={inputClass}
              placeholder={lang === 'sw' ? 'Mfano: Chuo Kikuu cha Dar es Salaam' : 'E.g.: University of Dar es Salaam'}
            />
            {errors.institution_name && <span className="text-red-500 text-sm">{t.required}</span>}
          </div>

          <div>
            <label className={labelClass}>
              {lang === 'sw' ? 'Aina ya Taasisi' : 'Institution Type'}
            </label>
            <select 
              {...register('institution_type')} 
              className={inputClass}
            >
              <option value="">{t.selectOption}</option>
              {INSTITUTION_TYPES.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
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
            {currentStep === 'purpose' ? (
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

export default UtambulishoMkaziForm;