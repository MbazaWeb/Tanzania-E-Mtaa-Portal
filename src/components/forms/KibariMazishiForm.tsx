/**
 * Kibari cha Mazishi Form
 * Funeral Announcement / Permit
 * 
 * Service: Kibari cha Mazishi
 * Fee: Free (0 TZS)
 */
import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2, Upload, X, FileText } from 'lucide-react';
import { FormProps, labels } from './types';

interface FormData {
  // Deceased info
  deceased_full_name: string;
  fathers_name: string;
  mothers_name: string;
  date_of_birth: string;
  date_of_death: string;
  place_of_death: string;
  age_at_death: number;
  surviving_spouse: string;
  // Funeral schedule
  body_location: string;
  service_date: string;
  service_time: string;
  service_location: string;
  burial_location: string;
  // Family contact
  family_representative: string;
  representative_phone: string;
  children_names: string;
}

export const KibariMazishiForm: React.FC<FormProps> = ({
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
  const sectionClass = "bg-gradient-to-r from-stone-100 to-stone-50 p-3 rounded-xl border-l-4 border-stone-500 mb-4";

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Section: Deceased Info */}
      <div className={sectionClass}>
        <h3 className="font-bold text-stone-800">
          {lang === 'sw' ? 'TAARIFA ZA MAREHEMU' : 'DECEASED INFORMATION'}
        </h3>
      </div>

      <div>
        <label className={labelClass}>
          {lang === 'sw' ? 'Jina Kamili la Marehemu' : 'Full Name of Deceased'} <span className="text-red-500">*</span>
        </label>
        <input 
          type="text" 
          {...register('deceased_full_name', { required: true })} 
          className={inputClass}
        />
        {errors.deceased_full_name && <span className="text-red-500 text-sm">{t.required}</span>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>
            {lang === 'sw' ? 'Jina la Baba' : "Father's Name"}
          </label>
          <input 
            type="text" 
            {...register('fathers_name')} 
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>
            {lang === 'sw' ? 'Jina la Mama' : "Mother's Name"}
          </label>
          <input 
            type="text" 
            {...register('mothers_name')} 
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>
            {lang === 'sw' ? 'Tarehe ya Kuzaliwa' : 'Date of Birth'}
          </label>
          <input 
            type="date" 
            {...register('date_of_birth')} 
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>
            {lang === 'sw' ? 'Tarehe ya Kufariki' : 'Date of Death'} <span className="text-red-500">*</span>
          </label>
          <input 
            type="date" 
            {...register('date_of_death', { required: true })} 
            className={inputClass}
          />
          {errors.date_of_death && <span className="text-red-500 text-sm">{t.required}</span>}
        </div>

        <div>
          <label className={labelClass}>
            {lang === 'sw' ? 'Umri wa Kufariki' : 'Age at Death'}
          </label>
          <input 
            type="number" 
            {...register('age_at_death')} 
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>
            {lang === 'sw' ? 'Mahala pa Kufariki' : 'Place of Death'}
          </label>
          <input 
            type="text" 
            {...register('place_of_death')} 
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>
            {lang === 'sw' ? 'Jina la Mume/Mke' : 'Surviving Spouse'}
          </label>
          <input 
            type="text" 
            {...register('surviving_spouse')} 
            className={inputClass}
          />
        </div>
      </div>

      {/* Section: Funeral Schedule */}
      <div className={sectionClass}>
        <h3 className="font-bold text-stone-800">
          {lang === 'sw' ? 'RATIBA YA MAZISHI' : 'FUNERAL SCHEDULE'}
        </h3>
      </div>

      <div>
        <label className={labelClass}>
          {lang === 'sw' ? 'Mahala ilipo Maiti' : 'Body Location'} <span className="text-red-500">*</span>
        </label>
        <input 
          type="text" 
          {...register('body_location', { required: true })} 
          className={inputClass}
          placeholder={lang === 'sw' ? 'Mfano: Hospitali ya Muhimbili' : 'E.g.: Muhimbili Hospital'}
        />
        {errors.body_location && <span className="text-red-500 text-sm">{t.required}</span>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>
            {lang === 'sw' ? 'Tarehe ya Mazishi' : 'Funeral Date'} <span className="text-red-500">*</span>
          </label>
          <input 
            type="date" 
            {...register('service_date', { required: true })} 
            className={inputClass}
          />
          {errors.service_date && <span className="text-red-500 text-sm">{t.required}</span>}
        </div>

        <div>
          <label className={labelClass}>
            {lang === 'sw' ? 'Muda wa Mazishi' : 'Funeral Time'} <span className="text-red-500">*</span>
          </label>
          <input 
            type="time" 
            {...register('service_time', { required: true })} 
            className={inputClass}
          />
          {errors.service_time && <span className="text-red-500 text-sm">{t.required}</span>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>
            {lang === 'sw' ? 'Mahala pa Huduma (Msikiti/Kanisa)' : 'Service Location (Mosque/Church)'}
          </label>
          <input 
            type="text" 
            {...register('service_location')} 
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>
            {lang === 'sw' ? 'Mahala pa Kuzika (Makaburini)' : 'Burial Location (Cemetery)'} <span className="text-red-500">*</span>
          </label>
          <input 
            type="text" 
            {...register('burial_location', { required: true })} 
            className={inputClass}
          />
          {errors.burial_location && <span className="text-red-500 text-sm">{t.required}</span>}
        </div>
      </div>

      {/* Section: Family Contact */}
      <div className={sectionClass}>
        <h3 className="font-bold text-stone-800">
          {lang === 'sw' ? 'MWASILIANO YA FAMILIA' : 'FAMILY CONTACT'}
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>
            {lang === 'sw' ? 'Mwakilishi wa Familia' : 'Family Representative'} <span className="text-red-500">*</span>
          </label>
          <input 
            type="text" 
            {...register('family_representative', { required: true })} 
            className={inputClass}
          />
          {errors.family_representative && <span className="text-red-500 text-sm">{t.required}</span>}
        </div>

        <div>
          <label className={labelClass}>
            {lang === 'sw' ? 'Simu ya Mwakilishi' : 'Representative Phone'} <span className="text-red-500">*</span>
          </label>
          <input 
            type="tel" 
            {...register('representative_phone', { required: true })} 
            className={inputClass}
            placeholder="+255 7XX XXX XXX"
          />
          {errors.representative_phone && <span className="text-red-500 text-sm">{t.required}</span>}
        </div>
      </div>

      <div>
        <label className={labelClass}>
          {lang === 'sw' ? 'Majina ya Watoto (Wachache)' : 'Children Names (Few)'}
        </label>
        <textarea 
          {...register('children_names')} 
          className={inputClass}
          rows={3}
          placeholder={lang === 'sw' ? 'Weka majina, moja kwa mstari' : 'Enter names, one per line'}
        />
      </div>

      {/* Submit Button */}
      <div className="pt-6">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 bg-gradient-to-r from-stone-600 to-stone-700 hover:from-stone-700 hover:to-stone-800 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
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

export default KibariMazishiForm;
