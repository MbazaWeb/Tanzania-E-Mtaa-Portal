/**
 * Makubaliano ya Mauziano Form
 * Sales Agreement / Rental Agreement
 * 
 * Service: Makubaliano ya Mauziano
 * Fee: 15,000 TZS
 * 
 * Features:
 * - Citizen ID lookup for buyer/tenant
 * - File upload for agreement document
 * - Second party notification on submission
 */
import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2, Upload, X, FileText, Search, CheckCircle, AlertCircle } from 'lucide-react';
import { FormProps, labels } from './types';
import { supabase } from '@/src/lib/supabase';

// Asset type options
const ASSET_TYPES = [
  { label: 'ARDHI / KIWANJA', value: 'ARDHI' },
  { label: 'GARI / CHOMBO CHA MOTO', value: 'GARI' },
  { label: 'NYUMBA', value: 'NYUMBA' },
  { label: 'KODI YA PANGO - MAKAZI', value: 'KODI_PANGO_MAKAZI' },
  { label: 'KODI YA PANGO - BIASHARA', value: 'KODI_PANGO_BIASHARA' },
  { label: 'NYINGINEZO', value: 'NYINGINEZO' },
];

interface CitizenLookupResult {
  id: string;
  full_name: string;
  citizen_id: string;
  phone?: string;
}

interface FormData {
  // Asset info
  asset_type: string;
  asset_description: string;
  sale_price: number;
  // Seller info
  seller_tin: string;
  // Buyer info (from citizen lookup)
  second_party_citizen_id: string;
  second_party_user_id?: string;
  second_party_name?: string;
}

export const MakubalianoMauzianoForm: React.FC<FormProps> = ({
  onSubmit,
  isLoading,
  lang = 'sw',
  userProfile
}) => {
  const t = labels[lang];
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>();
  
  // File upload state
  const [agreementFile, setAgreementFile] = useState<File | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Citizen lookup state
  const [citizenId, setCitizenId] = useState('');
  const [searching, setSearching] = useState(false);
  const [lookupResult, setLookupResult] = useState<CitizenLookupResult | null>(null);
  const [lookupError, setLookupError] = useState<string>('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setAgreementFile(file);
    setUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `agreements/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
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

  const handleCitizenLookup = async () => {
    if (!citizenId || citizenId.length < 5) {
      setLookupError(lang === 'sw' ? 'Ingiza namba kamili ya raia' : 'Enter complete citizen ID');
      return;
    }

    setSearching(true);
    setLookupError('');
    setLookupResult(null);

    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, first_name, middle_name, last_name, citizen_id, phone')
        .eq('citizen_id', citizenId.toUpperCase())
        .single();

      if (error || !data) {
        setLookupError(
          lang === 'sw' 
            ? 'Mtumiaji hajapatikana. Hakikisha namba ni sahihi na mtumiaji amesajiliwa.' 
            : 'User not found. Ensure the ID is correct and user is registered.'
        );
        return;
      }

      const fullName = `${data.first_name} ${data.middle_name || ''} ${data.last_name}`.replace(/\s+/g, ' ').trim();
      
      setLookupResult({
        id: data.id,
        full_name: fullName,
        citizen_id: data.citizen_id,
        phone: data.phone
      });

      // Set form values for submission
      setValue('second_party_user_id', data.id);
      setValue('second_party_citizen_id', data.citizen_id);
      setValue('second_party_name', fullName);
    } catch (err) {
      setLookupError(lang === 'sw' ? 'Hitilafu imetokea' : 'An error occurred');
    } finally {
      setSearching(false);
    }
  };

  const onFormSubmit = (data: FormData) => {
    if (!lookupResult) {
      setLookupError(lang === 'sw' ? 'Tafadhali tafuta mnunuzi/mpangaji kwanza' : 'Please search for buyer/tenant first');
      return;
    }

    // Include file URL and lookup result in form data
    const formData = {
      ...data,
      agreement_file: uploadedUrl,
      second_party_user_id: lookupResult.id,
      second_party_citizen_id: lookupResult.citizen_id,
      second_party_name: lookupResult.full_name,
    };

    onSubmit(formData, uploadedUrl ? [uploadedUrl] : [], 'self');
  };

  const inputClass = "w-full p-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all";
  const labelClass = "block text-sm font-semibold text-stone-700 mb-2";
  const sectionClass = "bg-gradient-to-r from-amber-50 to-orange-50 p-3 rounded-xl border-l-4 border-amber-500 mb-4";

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Section: Asset Details */}
      <div className={sectionClass}>
        <h3 className="font-bold text-amber-800">
          {lang === 'sw' ? 'TAARIFA ZA MALI (ASSET DETAILS)' : 'ASSET DETAILS'}
        </h3>
      </div>

      <div>
        <label className={labelClass}>
          {lang === 'sw' ? 'Aina ya Mali' : 'Asset Type'} <span className="text-red-500">*</span>
        </label>
        <select 
          {...register('asset_type', { required: true })} 
          className={inputClass}
        >
          <option value="">{t.selectOption}</option>
          {ASSET_TYPES.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {errors.asset_type && <span className="text-red-500 text-sm">{t.required}</span>}
      </div>

      <div>
        <label className={labelClass}>
          {lang === 'sw' ? 'Maelezo ya Mali' : 'Asset Description'} <span className="text-red-500">*</span>
        </label>
        <textarea 
          {...register('asset_description', { required: true })} 
          className={inputClass}
          rows={4}
          placeholder={lang === 'sw' ? 'Eleza mali kikamilifu (eneo, ukubwa, hali, n.k.)' : 'Describe the asset fully (location, size, condition, etc.)'}
        />
        {errors.asset_description && <span className="text-red-500 text-sm">{t.required}</span>}
      </div>

      <div>
        <label className={labelClass}>
          {lang === 'sw' ? 'Bei ya Mauziano / Kodi kwa Mwezi (TZS)' : 'Sale Price / Monthly Rent (TZS)'} <span className="text-red-500">*</span>
        </label>
        <input 
          type="number" 
          {...register('sale_price', { required: true, min: 1 })} 
          className={inputClass}
          placeholder="0"
        />
        {errors.sale_price && <span className="text-red-500 text-sm">{t.required}</span>}
      </div>

      {/* Section: Seller/Landlord Info */}
      <div className={sectionClass}>
        <h3 className="font-bold text-amber-800">
          {lang === 'sw' ? 'TAARIFA ZA MUUZAJI / MPANGISHAJI (SELLER / LANDLORD)' : 'SELLER / LANDLORD INFORMATION'}
        </h3>
      </div>

      <div>
        <label className={labelClass}>
          {lang === 'sw' ? 'Namba ya TIN (TRA)' : 'TIN Number (TRA)'}
        </label>
        <input 
          type="text" 
          {...register('seller_tin')} 
          className={inputClass}
          placeholder={lang === 'sw' ? 'Kama unaayo' : 'If available'}
        />
      </div>

      {/* Agreement File Upload */}
      <div>
        <label className={labelClass}>
          {lang === 'sw' ? 'Pakia Mkataba wa Makubaliano (Signed Agreement)' : 'Upload Signed Agreement'} <span className="text-red-500">*</span>
        </label>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          className="hidden"
        />
        
        {!agreementFile ? (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full p-6 border-2 border-dashed border-stone-300 rounded-xl hover:border-amber-500 hover:bg-amber-50 transition-all flex flex-col items-center gap-2"
          >
            {uploading ? (
              <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
            ) : (
              <Upload className="h-8 w-8 text-stone-400" />
            )}
            <span className="text-stone-600 font-medium">
              {lang === 'sw' ? 'Bofya kupakia mkataba' : 'Click to upload agreement'}
            </span>
            <span className="text-xs text-stone-400">PDF, DOC, DOCX, JPG, PNG</span>
          </button>
        ) : (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-emerald-600" />
              <div>
                <p className="font-medium text-emerald-800">{agreementFile.name}</p>
                <p className="text-xs text-emerald-600">{(agreementFile.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setAgreementFile(null);
                setUploadedUrl('');
              }}
              className="p-2 hover:bg-red-100 rounded-full transition-all"
            >
              <X className="h-5 w-5 text-red-500" />
            </button>
          </div>
        )}
      </div>

      {/* Section: Buyer/Tenant Info with Citizen ID Lookup */}
      <div className={sectionClass}>
        <h3 className="font-bold text-amber-800">
          {lang === 'sw' ? 'TAARIFA ZA MNUNUZI / MPANGAJI (BUYER / TENANT)' : 'BUYER / TENANT INFORMATION'}
        </h3>
      </div>

      {/* Info banner */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
        <p className="text-sm text-blue-700 font-medium">
          🆔 {lang === 'sw' 
            ? 'Ingiza Namba ya Raia (Citizen ID) ya mtu unayetaka kuingia naye makubaliano. Namba hii inapatikana kwenye wasifu wa mtumiaji.'
            : 'Enter the Citizen ID of the person you want to enter into agreement with. This number is found on the user\'s profile.'}
        </p>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={citizenId}
          onChange={(e) => setCitizenId(e.target.value.toUpperCase())}
          placeholder="CT2026A12345"
          className="flex-1 p-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-mono uppercase tracking-wider"
        />
        <button
          type="button"
          onClick={handleCitizenLookup}
          disabled={searching}
          className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-xl font-semibold flex items-center gap-2 transition-all"
        >
          {searching ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Search className="h-5 w-5" />
          )}
          <span className="hidden sm:inline">
            {lang === 'sw' ? 'Tafuta' : 'Search'}
          </span>
        </button>
      </div>

      {/* User found result */}
      {lookupResult && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="h-6 w-6 text-emerald-600" />
            <span className="font-bold text-emerald-700 text-lg">
              {lang === 'sw' ? 'Mtumiaji Amepatikana!' : 'User Found!'}
            </span>
          </div>
          <div className="bg-white rounded-lg p-3 space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-stone-600 w-20">{lang === 'sw' ? 'Jina:' : 'Name:'}</span>
              <span className="font-bold text-stone-900">{lookupResult.full_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-stone-600 w-20">{lang === 'sw' ? 'Namba:' : 'ID:'}</span>
              <span className="font-mono text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">{lookupResult.citizen_id}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-stone-600 w-20">{lang === 'sw' ? 'Simu:' : 'Phone:'}</span>
              <span className="text-stone-700">{lookupResult.phone || 'N/A'}</span>
            </div>
          </div>
          <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs text-amber-700 font-medium">
              ⚠️ {lang === 'sw' 
                ? 'Baada ya kutuma ombi, mtumiaji huyu atapokea arifa ya KUIDHINISHA makubaliano haya. Makubaliano hayatakamilika mpaka pande zote mbili zikubali.'
                : 'After submission, this user will receive a notification to APPROVE this agreement. The agreement will not be finalized until both parties accept.'}
            </p>
          </div>
        </div>
      )}

      {/* Error message */}
      {lookupError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <span className="text-sm text-red-700 font-medium">{lookupError}</span>
              <p className="text-xs text-red-500 mt-1">
                {lang === 'sw' 
                  ? 'Hakikisha mtumiaji amesajiliwa kwenye E-Serikali Mtaa na umeingiza namba sahihi.'
                  : 'Ensure the user is registered on E-Serikali Mtaa and you entered the correct number.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="pt-6">
        <button
          type="submit"
          disabled={isLoading || !lookupResult || !uploadedUrl}
          className="w-full py-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
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
        
        {(!lookupResult || !uploadedUrl) && (
          <p className="text-center text-sm text-stone-500 mt-2">
            {lang === 'sw' 
              ? '⚠️ Tafadhali tafuta mnunuzi/mpangaji na pakia mkataba kwanza'
              : '⚠️ Please search buyer/tenant and upload agreement first'}
          </p>
        )}
      </div>
    </form>
  );
};

export default MakubalianoMauzianoForm;
