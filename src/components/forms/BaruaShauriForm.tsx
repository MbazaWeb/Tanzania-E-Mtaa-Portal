/**
 * Barua ya Kufungua Shauri Form
 * Dispute Opening Letter
 * 
 * Service: Barua ya Kufungua Shauri
 * Fee: 10,000 TZS
 * 
 * Features:
 * - Book-style layout with sections
 * - Progress tracking
 * - Review step before submission
 */
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2, CheckCircle, ArrowLeft, ArrowRight, Eye, FileCheck, AlertCircle } from 'lucide-react';
import { FormProps, labels } from './types';

// Dispute type options
const DISPUTE_TYPES = [
  { label: 'ARDHI / KIWANJA - Land Dispute', value: 'ARDHI' },
  { label: 'NDOA / FAMILIA - Marriage Dispute', value: 'NDOA' },
  { label: 'MADENI - Debt Dispute', value: 'MADENI' },
  { label: 'MAJIRANI - Neighbor Dispute', value: 'MAJIRANI' },
  { label: 'URITHI - Inheritance Dispute', value: 'URITHI' },
  { label: 'NYINGINEZO - Other', value: 'NYINGINEZO' },
];

// Priority options
const PRIORITY_OPTIONS = [
  { label: 'HARAKA - Emergency', value: 'HARAKA' },
  { label: 'KAWAIDA - Normal', value: 'KAWAIDA' },
];

interface FormData {
  // Dispute info
  dispute_type: string;
  priority: string;
  // Respondent info
  respondent_name: string;
  respondent_phone: string;
  respondent_address: string;
  // Case details
  incident_date: string;
  summary: string;
  relief_sought: string;
}

type Step = 'dispute' | 'respondent' | 'details' | 'review';

export const BaruaShauriForm: React.FC<FormProps> = ({
  onSubmit,
  isLoading,
  lang = 'sw',
  userProfile
}) => {
  const t = labels[lang];
  const [currentStep, setCurrentStep] = useState<Step>('dispute');
  const [showReview, setShowReview] = useState(false);
  const [formData, setFormData] = useState<FormData | null>(null);
  
  const { register, handleSubmit, formState: { errors }, trigger, getValues } = useForm<FormData>();

  const steps: { key: Step; label: string; swLabel: string }[] = [
    { key: 'dispute', label: 'Dispute Type', swLabel: 'Aina ya Shauri' },
    { key: 'respondent', label: 'Respondent', swLabel: 'Mlalamikiwa' },
    { key: 'details', label: 'Case Details', swLabel: 'Maelezo ya Shauri' },
    { key: 'review', label: 'Review', swLabel: 'Hakiki' },
  ];

  const currentStepIndex = steps.findIndex(s => s.key === currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const validateCurrentStep = async (): Promise<boolean> => {
    let fieldsToValidate: (keyof FormData)[] = [];
    
    switch (currentStep) {
      case 'dispute':
        fieldsToValidate = ['dispute_type', 'priority'];
        break;
      case 'respondent':
        fieldsToValidate = ['respondent_name', 'respondent_address'];
        break;
      case 'details':
        fieldsToValidate = ['incident_date', 'summary', 'relief_sought'];
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

    if (currentStep === 'details') {
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

  const inputClass = "w-full p-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all bg-white";
  const labelClass = "block text-sm font-semibold text-stone-700 mb-2";
  const sectionClass = "bg-gradient-to-r from-red-50 to-orange-50 p-4 rounded-xl border-l-4 border-red-500 mb-6 shadow-sm";

  // Progress Bar Component
  const ProgressBar = () => (
    <div className="mb-8">
      <div className="flex justify-between mb-2">
        {steps.map((step, index) => (
          <div 
            key={step.key}
            className={`flex flex-col items-center ${index <= currentStepIndex ? 'text-red-600' : 'text-stone-400'}`}
          >
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mb-1
              ${index < currentStepIndex 
                ? 'bg-red-600 text-white' 
                : index === currentStepIndex
                ? 'bg-red-100 text-red-600 border-2 border-red-600'
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
          className="bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex justify-between mt-2">
        <span className="text-xs text-stone-500">
          {lang === 'sw' ? 'Hatua' : 'Step'} {currentStepIndex + 1} {lang === 'sw' ? 'kati ya' : 'of'} {steps.length}
        </span>
        <span className="text-xs font-bold text-red-600">{Math.round(progress)}%</span>
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
                {lang === 'sw' ? 'Hakiki Shauri Lako' : 'Review Your Dispute Case'}
              </h3>
              <p className="text-sm text-amber-700">
                {lang === 'sw' 
                  ? 'Tafadhali hakiki taarifa zako za shauri kabla ya kuwasilisha. Taarifa hizi zitatumika katika kufungua shauri lako.'
                  : 'Please review your case information before submitting. This information will be used to open your dispute case.'}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Applicant Info (from profile) */}
          <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
            <div className="bg-red-50 px-4 py-2 border-b border-red-100">
              <h4 className="font-bold text-red-800">{lang === 'sw' ? 'Mwombaji' : 'Applicant'}</h4>
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
                  <span className="text-xs text-stone-500">{lang === 'sw' ? 'Simu' : 'Phone'}</span>
                  <p className="font-medium">{userProfile?.phone || '-'}</p>
                </div>
                <div>
                  <span className="text-xs text-stone-500">NIDA</span>
                  <p className="font-medium">{userProfile?.nida_number || '-'}</p>
                </div>
                <div>
                  <span className="text-xs text-stone-500">{lang === 'sw' ? 'Anwani' : 'Address'}</span>
                  <p className="font-medium">
                    {userProfile ? `${userProfile.region || ''} ${userProfile.district || ''}`.trim() : '-'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Dispute Type */}
          <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
            <div className="bg-red-50 px-4 py-2 border-b border-red-100">
              <h4 className="font-bold text-red-800">{lang === 'sw' ? 'Aina ya Shauri' : 'Dispute Type'}</h4>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-stone-500">{lang === 'sw' ? 'Aina' : 'Type'}</span>
                  <p className="font-medium">{DISPUTE_TYPES.find(d => d.value === data.dispute_type)?.label || data.dispute_type}</p>
                </div>
                <div>
                  <span className="text-xs text-stone-500">{lang === 'sw' ? 'Kiprioriti' : 'Priority'}</span>
                  <p className="font-medium">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${
                      data.priority === 'HARAKA' ? 'bg-red-100 text-red-700' : 'bg-stone-100 text-stone-700'
                    }`}>
                      {PRIORITY_OPTIONS.find(p => p.value === data.priority)?.label || data.priority}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Respondent Info */}
          <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
            <div className="bg-red-50 px-4 py-2 border-b border-red-100">
              <h4 className="font-bold text-red-800">{lang === 'sw' ? 'Mlalamikiwa' : 'Respondent'}</h4>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-stone-500">{lang === 'sw' ? 'Jina' : 'Name'}</span>
                  <p className="font-medium">{data.respondent_name}</p>
                </div>
                <div>
                  <span className="text-xs text-stone-500">{lang === 'sw' ? 'Simu' : 'Phone'}</span>
                  <p className="font-medium">{data.respondent_phone || '-'}</p>
                </div>
              </div>
              <div className="mt-3">
                <span className="text-xs text-stone-500">{lang === 'sw' ? 'Anwani' : 'Address'}</span>
                <p className="font-medium bg-stone-50 p-2 rounded-lg mt-1">{data.respondent_address}</p>
              </div>
            </div>
          </div>

          {/* Case Details */}
          <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
            <div className="bg-red-50 px-4 py-2 border-b border-red-100">
              <h4 className="font-bold text-red-800">{lang === 'sw' ? 'Maelezo ya Shauri' : 'Case Details'}</h4>
            </div>
            <div className="p-4">
              <div>
                <span className="text-xs text-stone-500">{lang === 'sw' ? 'Tarehe ya Tukio' : 'Incident Date'}</span>
                <p className="font-medium">{new Date(data.incident_date).toLocaleDateString(lang === 'sw' ? 'sw-TZ' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <div className="mt-3">
                <span className="text-xs text-stone-500">{lang === 'sw' ? 'Muhtasari' : 'Summary'}</span>
                <p className="font-medium bg-stone-50 p-3 rounded-lg mt-1 whitespace-pre-wrap">{data.summary}</p>
              </div>
              <div className="mt-3">
                <span className="text-xs text-stone-500">{lang === 'sw' ? 'Ombi / Unachokitaka' : 'Relief Sought'}</span>
                <p className="font-medium bg-amber-50 p-3 rounded-lg mt-1 border border-amber-200 whitespace-pre-wrap">{data.relief_sought}</p>
              </div>
            </div>
          </div>

          {/* Important Notice */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-red-800 mb-1">
                  {lang === 'sw' ? 'Taarifa Muhimu' : 'Important Information'}
                </h4>
                <p className="text-sm text-red-700">
                  {lang === 'sw' 
                    ? 'Kwa kufungua shauri, unakubali kuwa taarifa ulizotoa ni za kweli. Utoaji wa taarifa za uongo unaweza kusababisha hatua za kisheria.'
                    : 'By filing this dispute, you confirm that the information provided is true. Providing false information may result in legal action.'}
                </p>
              </div>
            </div>
          </div>

          {/* Fee Summary */}
          <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-red-800">{lang === 'sw' ? 'Ada ya Kufungua Shauri:' : 'Filing Fee:'}</span>
              <span className="font-bold text-xl text-red-600">10,000 TZS</span>
            </div>
            <p className="text-xs text-red-600 mt-1">
              {lang === 'sw' 
                ? 'Ada hii ni ya kufungua shauri. Malipo yatakamilishwa baada ya kuwasilisha.'
                : 'This is the case filing fee. Payment will be completed after submission.'}
            </p>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => setCurrentStep('details')}
            className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-5 w-5" />
            {lang === 'sw' ? 'Rudi' : 'Back'}
          </button>
          <button
            type="button"
            onClick={confirmSubmit}
            disabled={isLoading}
            className="flex-1 py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <FileCheck className="h-5 w-5" />
                {lang === 'sw' ? 'Fungua Shauri' : 'File Dispute'}
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

      {/* Step 1: Dispute Type */}
      {currentStep === 'dispute' && (
        <div className="space-y-6">
          <div className={sectionClass}>
            <h3 className="font-bold text-red-800">
              {lang === 'sw' ? 'AINA YA SHAURI NA KIPRIORITI' : 'DISPUTE TYPE & PRIORITY'}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                {lang === 'sw' ? 'Aina ya Shauri' : 'Dispute Type'} <span className="text-red-500">*</span>
              </label>
              <select 
                {...register('dispute_type', { required: true })} 
                className={inputClass}
              >
                <option value="">{t.selectOption}</option>
                {DISPUTE_TYPES.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {errors.dispute_type && <span className="text-red-500 text-sm">{t.required}</span>}
            </div>

            <div>
              <label className={labelClass}>
                {lang === 'sw' ? 'Kiprioriti' : 'Priority'} <span className="text-red-500">*</span>
              </label>
              <select 
                {...register('priority', { required: true })} 
                className={inputClass}
              >
                <option value="">{t.selectOption}</option>
                {PRIORITY_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {errors.priority && <span className="text-red-500 text-sm">{t.required}</span>}
            </div>
          </div>

          {/* Info box */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-700">
              {lang === 'sw' 
                ? 'Chagua kwa usahihi aina ya shauri lako. Hii itasaidia kupeleka shauri lako kwa kitengo sahihi.'
                : 'Select your dispute type correctly. This will help route your case to the appropriate department.'}
            </p>
          </div>
        </div>
      )}

      {/* Step 2: Respondent Info */}
      {currentStep === 'respondent' && (
        <div className="space-y-6">
          <div className={sectionClass}>
            <h3 className="font-bold text-red-800">
              {lang === 'sw' ? 'TAARIFA ZA MLALAMIKIWA' : 'RESPONDENT INFORMATION'}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                {lang === 'sw' ? 'Jina la Mlalamikiwa' : 'Respondent Name'} <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                {...register('respondent_name', { required: true })} 
                className={inputClass}
                placeholder={lang === 'sw' ? 'Ingiza jina kamili' : 'Enter full name'}
              />
              {errors.respondent_name && <span className="text-red-500 text-sm">{t.required}</span>}
            </div>

            <div>
              <label className={labelClass}>
                {lang === 'sw' ? 'Simu ya Mlalamikiwa' : 'Respondent Phone'}
              </label>
              <input 
                type="tel" 
                {...register('respondent_phone')} 
                className={inputClass}
                placeholder="+255 7XX XXX XXX"
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>
              {lang === 'sw' ? 'Anwani ya Mlalamikiwa' : 'Respondent Address'} <span className="text-red-500">*</span>
            </label>
            <textarea 
              {...register('respondent_address', { required: true })} 
              className={inputClass}
              rows={4}
              placeholder={lang === 'sw' ? 'Weka anwani kamili ya mlalamikiwa pamoja na maelezo ya eneo, mtaa, na alama za jirani' : 'Enter full address of respondent including area, street, and landmarks'}
            />
            {errors.respondent_address && <span className="text-red-500 text-sm">{t.required}</span>}
          </div>
        </div>
      )}

      {/* Step 3: Case Details */}
      {currentStep === 'details' && (
        <div className="space-y-6">
          <div className={sectionClass}>
            <h3 className="font-bold text-red-800">
              {lang === 'sw' ? 'MAELEZO KAMILI YA SHAURI' : 'COMPLETE CASE DETAILS'}
            </h3>
          </div>

          <div>
            <label className={labelClass}>
              {lang === 'sw' ? 'Tarehe ya Tukio' : 'Incident Date'} <span className="text-red-500">*</span>
            </label>
            <input 
              type="date" 
              {...register('incident_date', { required: true })} 
              className={inputClass}
              max={new Date().toISOString().split('T')[0]}
            />
            {errors.incident_date && <span className="text-red-500 text-sm">{t.required}</span>}
          </div>

          <div>
            <label className={labelClass}>
              {lang === 'sw' ? 'Muhtasari wa Shauri' : 'Case Summary'} <span className="text-red-500">*</span>
            </label>
            <textarea 
              {...register('summary', { required: true })} 
              className={inputClass}
              rows={6}
              placeholder={lang === 'sw' 
                ? 'Eleza kwa undani shauri lako: Kilichotokea, lini, wapi, na nani alihusika. Toa maelezo yote muhimu yatakayosaidia kuelewa shauri lako.' 
                : 'Describe your case in detail: What happened, when, where, and who was involved. Provide all relevant information to help understand your case.'}
            />
            {errors.summary && <span className="text-red-500 text-sm">{t.required}</span>}
          </div>

          <div>
            <label className={labelClass}>
              {lang === 'sw' ? 'Ombi / Unachokitaka (Relief Sought)' : 'Relief Sought'} <span className="text-red-500">*</span>
            </label>
            <textarea 
              {...register('relief_sought', { required: true })} 
              className={inputClass}
              rows={4}
              placeholder={lang === 'sw' 
                ? 'Unataka nini kutoka kwa shauri hili? Mfano: Kulipwa pesa, Kupata mali, Amri ya kudumu, Fidia, n.k. Eleza kwa usahihi unachokitaka.' 
                : 'What do you want from this case? E.g.: Payment, Property, Injunction, Compensation, etc. Be specific about what you seek.'}
            />
            {errors.relief_sought && <span className="text-red-500 text-sm">{t.required}</span>}
          </div>

          {/* Tips for writing case summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h4 className="font-bold text-blue-800 mb-2">
              {lang === 'sw' ? 'Vidokezo vya Kuandika Shauri' : 'Tips for Writing Your Case'}
            </h4>
            <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
              <li>{lang === 'sw' ? 'Anza na mwanzo wa shauri hadi mwisho' : 'Start from the beginning to the end'}</li>
              <li>{lang === 'sw' ? 'Taja tarehe na nyakati muhimu' : 'Mention important dates and times'}</li>
              <li>{lang === 'sw' ? 'Eleza ushahidi ulio nao (barua, picha, n.k.)' : 'Describe evidence you have (letters, photos, etc.)'}</li>
              <li>{lang === 'sw' ? 'Taja mashahidi kama wapo' : 'Mention witnesses if any'}</li>
              <li>{lang === 'sw' ? 'Kuwa wazi na sahihi' : 'Be clear and accurate'}</li>
            </ul>
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
            className={`flex-1 py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 ${
              currentStepIndex === 0 ? 'w-full' : ''
            }`}
          >
            {currentStep === 'details' ? (
              <>
                {lang === 'sw' ? 'Hakiki Shauri' : 'Review Case'}
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

export default BaruaShauriForm;