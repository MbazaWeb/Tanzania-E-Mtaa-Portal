/**
 * Utambulisho wa Mkazi (Barua ya Utambulisho) Form
 * Residency Certificate / Identification Letter
 * 
 * Service: Utambulisho wa Mkazi
 * Fee: 5,000 TZS
 */
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
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

export const UtambulishoMkaziForm: React.FC<FormProps> = ({
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
  const sectionClass = "bg-gradient-to-r from-emerald-50 to-teal-50 p-3 rounded-xl border-l-4 border-emerald-500 mb-4";

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Section: Council Info */}
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

      {/* Section: Personal Info */}
      <div className={sectionClass}>
        <h3 className="font-bold text-emerald-800">
          {lang === 'sw' ? 'TAARIFA BINAFSI (Zilizohakikiwa na NIDA)' : 'PERSONAL INFO (Verified by NIDA)'}
        </h3>
      </div>

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

      {/* Section: Residence */}
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

      {/* Section: Purpose */}
      <div className={sectionClass}>
        <h3 className="font-bold text-emerald-800">
          {lang === 'sw' ? 'SABABU YA MAOMBI' : 'PURPOSE OF APPLICATION'}
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

      {/* Section: Intended Service */}
      <div className={sectionClass}>
        <h3 className="font-bold text-emerald-800">
          {lang === 'sw' ? 'ANWANI YA HUDUMA (INTENDED SERVICE ADDRESS)' : 'INTENDED SERVICE ADDRESS'}
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      {/* Submit Button */}
      <div className="pt-6">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
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

export default UtambulishoMkaziForm;
