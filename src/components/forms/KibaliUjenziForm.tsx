/**
 * Kibali cha Ujenzi (Maboresho) Form
 * Building Permit (Renovations)
 * 
 * Service: Kibali cha Ujenzi (Maboresho)
 * Fee: 50,000 TZS
 */
import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2, Upload, X, FileText } from 'lucide-react';
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
}

export const KibaliUjenziForm: React.FC<FormProps> = ({
  onSubmit,
  isLoading,
  lang = 'sw',
  userProfile
}) => {
  const t = labels[lang];
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
  
  // File upload state
  const [ownershipDoc, setOwnershipDoc] = useState<File | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setOwnershipDoc(file);
    setUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `ownership/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
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
      ownership_doc: uploadedUrl,
    };
    onSubmit(formData, uploadedUrl ? [uploadedUrl] : [], 'self');
  };

  const inputClass = "w-full p-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all";
  const labelClass = "block text-sm font-semibold text-stone-700 mb-2";
  const sectionClass = "bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-xl border-l-4 border-blue-500 mb-4";

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Section: Property Info */}
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
          rows={3}
          placeholder={lang === 'sw' ? 'Eleza eneo la kiwanja (mtaa, jirani na nini, alama za eneo)' : 'Describe the property location'}
        />
        {errors.location_desc && <span className="text-red-500 text-sm">{t.required}</span>}
      </div>

      {/* Section: Work Details */}
      <div className={sectionClass}>
        <h3 className="font-bold text-blue-800">
          {lang === 'sw' ? 'MAELEZO YA KAZI' : 'WORK DETAILS'}
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
          <input 
            type="number" 
            {...register('estimated_cost')} 
            className={inputClass}
            placeholder="0"
          />
        </div>

        <div>
          <label className={labelClass}>
            {lang === 'sw' ? 'Muda wa Kazi (Siku)' : 'Duration (Days)'} <span className="text-red-500">*</span>
          </label>
          <input 
            type="number" 
            {...register('duration', { required: true, min: 1 })} 
            className={inputClass}
          />
          {errors.duration && <span className="text-red-500 text-sm">{t.required}</span>}
        </div>
      </div>

      {/* Section: Documents */}
      <div className={sectionClass}>
        <h3 className="font-bold text-blue-800">
          {lang === 'sw' ? 'HATI NA RAMANI' : 'DOCUMENTS'}
        </h3>
      </div>

      <div>
        <label className={labelClass}>
          {lang === 'sw' ? 'Hati ya Umiliki (Attached)' : 'Ownership Document'} <span className="text-red-500">*</span>
        </label>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          className="hidden"
        />
        
        {!ownershipDoc ? (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full p-6 border-2 border-dashed border-stone-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all flex flex-col items-center gap-2"
          >
            {uploading ? (
              <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            ) : (
              <Upload className="h-8 w-8 text-stone-400" />
            )}
            <span className="text-stone-600 font-medium">
              {lang === 'sw' ? 'Bofya kupakia hati ya umiliki' : 'Click to upload ownership document'}
            </span>
            <span className="text-xs text-stone-400">PDF, DOC, JPG, PNG</span>
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
              onClick={() => {
                setOwnershipDoc(null);
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
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
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

export default KibaliUjenziForm;
