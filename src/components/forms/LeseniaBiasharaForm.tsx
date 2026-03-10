/**
 * Leseni ya Biashara Ndogondogo Form
 * Petty Trader License
 * 
 * Service: Leseni ya Biashara Ndogondogo
 * Fee: 10,000 TZS
 */
import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2, Upload, X, FileText } from 'lucide-react';
import { FormProps, labels } from './types';
import { supabase } from '@/src/lib/supabase';

// Business type options
const BUSINESS_TYPES = [
  { label: 'CHAKULA (MAMA LISHE)', value: 'CHAKULA' },
  { label: 'BIDHAA NDOGONDOGO', value: 'BIDHAA' },
  { label: 'HUDUMA (KEREKERE, n.k.)', value: 'HUDUMA' },
  { label: 'NYINGINEZO', value: 'NYINGINEZO' },
];

interface FormData {
  business_name: string;
  business_type: string;
  location: string;
  tin_number: string;
}

export const LeseniaBiasharaForm: React.FC<FormProps> = ({
  onSubmit,
  isLoading,
  lang = 'sw',
  userProfile
}) => {
  const t = labels[lang];
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
  
  // File upload state
  const [idCopy, setIdCopy] = useState<File | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIdCopy(file);
    setUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `ids/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { data, error } = await supabase.storage
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

  const onFormSubmit = (data: FormData) => {
    const formData = {
      ...data,
      id_copy: uploadedUrl,
    };
    onSubmit(formData, uploadedUrl ? [uploadedUrl] : [], 'self');
  };

  const inputClass = "w-full p-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all";
  const labelClass = "block text-sm font-semibold text-stone-700 mb-2";
  const sectionClass = "bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-xl border-l-4 border-purple-500 mb-4";

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Section: Business Info */}
      <div className={sectionClass}>
        <h3 className="font-bold text-purple-800">
          {lang === 'sw' ? 'TAARIFA ZA BIASHARA' : 'BUSINESS INFORMATION'}
        </h3>
      </div>

      <div>
        <label className={labelClass}>
          {lang === 'sw' ? 'Jina la Biashara' : 'Business Name'}
        </label>
        <input 
          type="text" 
          {...register('business_name')} 
          className={inputClass}
          placeholder={lang === 'sw' ? 'Mfano: Mama Jeni Chips' : 'E.g.: Mama Jeni Chips'}
        />
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

      <div>
        <label className={labelClass}>
          {lang === 'sw' ? 'Eneo la Biashara (Mtaa/Soko)' : 'Business Location'} <span className="text-red-500">*</span>
        </label>
        <input 
          type="text" 
          {...register('location', { required: true })} 
          className={inputClass}
          placeholder={lang === 'sw' ? 'Mfano: Soko la Kariakoo, Mtaa wa Uhuru' : 'E.g.: Kariakoo Market, Uhuru Street'}
        />
        {errors.location && <span className="text-red-500 text-sm">{t.required}</span>}
      </div>

      {/* Section: Owner Info */}
      <div className={sectionClass}>
        <h3 className="font-bold text-purple-800">
          {lang === 'sw' ? 'TAARIFA ZA MMILIKI' : 'OWNER INFORMATION'}
        </h3>
      </div>

      <div>
        <label className={labelClass}>
          {lang === 'sw' ? 'Namba ya TIN (Kama unayo)' : 'TIN Number (If available)'}
        </label>
        <input 
          type="text" 
          {...register('tin_number')} 
          className={inputClass}
        />
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
        />
        
        {!idCopy ? (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full p-6 border-2 border-dashed border-stone-300 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all flex flex-col items-center gap-2"
          >
            {uploading ? (
              <Loader2 className="h-8 w-8 text-purple-500 animate-spin" />
            ) : (
              <Upload className="h-8 w-8 text-stone-400" />
            )}
            <span className="text-stone-600 font-medium">
              {lang === 'sw' ? 'Bofya kupakia kitambulisho' : 'Click to upload ID'}
            </span>
            <span className="text-xs text-stone-400">PDF, JPG, PNG</span>
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
              onClick={() => {
                setIdCopy(null);
                setUploadedUrl('');
              }}
              className="p-2 hover:bg-red-100 rounded-full transition-all"
            >
              <X className="h-5 w-5 text-red-500" />
            </button>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="pt-6">
        <button
          type="submit"
          disabled={isLoading || !uploadedUrl}
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
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

export default LeseniaBiasharaForm;
