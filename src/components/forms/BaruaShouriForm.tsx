/**
 * Barua ya Kufungua Shauri Form
 * Dispute Opening Letter
 * 
 * Service: Barua ya Kufungua Shauri
 * Fee: 10,000 TZS
 */
import React from 'react';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
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

export const BaruaShouriForm: React.FC<FormProps> = ({
  onSubmit,
  isLoading,
  lang = 'sw',
  userProfile
}) => {
  const t = labels[lang];
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  const onFormSubmit = (data: FormData) => {
    onSubmit(data, [], 'self');
  };

  const inputClass = "w-full p-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all";
  const labelClass = "block text-sm font-semibold text-stone-700 mb-2";
  const sectionClass = "bg-gradient-to-r from-red-50 to-orange-50 p-3 rounded-xl border-l-4 border-red-500 mb-4";

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Section: Dispute Type */}
      <div className={sectionClass}>
        <h3 className="font-bold text-red-800">
          {lang === 'sw' ? 'AINA YA SHAURI / DISPUTE TYPE' : 'DISPUTE TYPE'}
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

      {/* Section: Respondent Info */}
      <div className={sectionClass}>
        <h3 className="font-bold text-red-800">
          {lang === 'sw' ? 'TAARIFA ZA MLALAMIKIWA (RESPONDENT)' : 'RESPONDENT INFORMATION'}
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
          rows={3}
          placeholder={lang === 'sw' ? 'Weka anwani kamili ya mlalamikiwa' : 'Enter full address of respondent'}
        />
        {errors.respondent_address && <span className="text-red-500 text-sm">{t.required}</span>}
      </div>

      {/* Section: Case Details */}
      <div className={sectionClass}>
        <h3 className="font-bold text-red-800">
          {lang === 'sw' ? 'MAELEZO YA SHAURI' : 'CASE DETAILS'}
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
          rows={5}
          placeholder={lang === 'sw' ? 'Eleza kwa ufupi shauri lako...' : 'Briefly describe your case...'}
        />
        {errors.summary && <span className="text-red-500 text-sm">{t.required}</span>}
      </div>

      <div>
        <label className={labelClass}>
          {lang === 'sw' ? 'Ombi / Unachokitaka (Relief)' : 'Relief Sought'} <span className="text-red-500">*</span>
        </label>
        <textarea 
          {...register('relief_sought', { required: true })} 
          className={inputClass}
          rows={3}
          placeholder={lang === 'sw' ? 'Unataka msaada gani? (Mfano: Kulipwa pesa, Kupata mali, Amri ya kudumu, n.k.)' : 'What relief do you seek? (E.g.: Payment, Property, Injunction, etc.)'}
        />
        {errors.relief_sought && <span className="text-red-500 text-sm">{t.required}</span>}
      </div>

      {/* Submit Button */}
      <div className="pt-6">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              {t.submitting}
            </>
          ) : (
            t.submit
          )}
        </button>
      </div>
    </form>
  );
};

export default BaruaShouriForm;
