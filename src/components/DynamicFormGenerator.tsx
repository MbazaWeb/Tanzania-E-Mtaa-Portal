import React, { useState, useRef, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { cn } from '@/src/lib/utils';
import { Upload, X, FileText, Loader2, ArrowRight, User, Users, UserPlus, RefreshCw } from 'lucide-react';

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'date' | 'tel' | 'number' | 'file' | 'checkbox' | 'header' | 'time' | 'url' | 'datetime-local';
  placeholder?: string;
  options?: { label: string; value: string }[];
  required?: boolean;
  disabled?: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
  showIf?: {
    field: string;
    value: any;
  };
}

interface UserProfile {
  id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  email: string;
  phone: string;
  nida_number?: string;
  region?: string;
  district?: string;
  ward?: string;
  street?: string;
  [key: string]: any;
}

interface DynamicFormProps {
  schema: FormField[];
  onSubmit: (data: any, attachments: string[], applicantType: string, representativeName?: string) => void;
  initialData?: any;
  isLoading?: boolean;
  lang?: 'sw' | 'en';
  userProfile?: UserProfile | null;
}

type ApplicantType = 'self' | 'minor' | 'representative';

export const DynamicFormGenerator: React.FC<DynamicFormProps> = ({
  schema,
  onSubmit,
  initialData,
  isLoading,
  lang = 'sw',
  userProfile
}) => {
  const [attachments, setAttachments] = useState<string[]>([]);
  const [applicantType, setApplicantType] = useState<ApplicantType>('self');
  const [representativeName, setRepresentativeName] = useState('');
  const [useProfileData, setUseProfileData] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate Zod schema dynamically
  const shape: any = {};
  schema.forEach((field) => {
    if (field.type === 'header') return; // Skip headers in validation
    
    let validator: z.ZodTypeAny = z.any();
    if (field.type === 'text' || field.type === 'textarea' || field.type === 'tel') {
      let v = z.string();
      if (field.required) v = v.min(1, `${field.label} is required`);
      validator = v;
    } else if (field.type === 'number') {
      let v = z.number();
      if (field.required) v = v.min(0);
      validator = v;
    } else if (field.type === 'date') {
      validator = z.string().min(1, 'Date is required');
    }
    shape[field.name] = (field.required && !field.showIf) ? validator : validator.optional();
  });

  const formSchema = z.object(shape);
  
  // Prepare default values from profile if available and useProfileData is true
  const getDefaultValues = () => {
    if (useProfileData && userProfile) {
      // Map user profile fields to form fields
      const profileMapped: any = {};
      
      // Common field mappings
      if (userProfile.first_name) profileMapped.first_name = userProfile.first_name;
      if (userProfile.middle_name) profileMapped.middle_name = userProfile.middle_name;
      if (userProfile.last_name) profileMapped.last_name = userProfile.last_name;
      if (userProfile.email) profileMapped.email = userProfile.email;
      if (userProfile.phone) profileMapped.phone = userProfile.phone;
      if (userProfile.nida_number) profileMapped.nida_number = userProfile.nida_number;
      if (userProfile.region) profileMapped.region = userProfile.region;
      if (userProfile.district) profileMapped.district = userProfile.district;
      if (userProfile.ward) profileMapped.ward = userProfile.ward;
      if (userProfile.street) profileMapped.street = userProfile.street;
      
      return { ...initialData, ...profileMapped };
    }
    return initialData || {};
  };

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: getDefaultValues(),
  });

  // Auto-calculation for rent and sales fields
  const watchMonthlyRent = watch('monthly_rent');
  const watchPaymentPeriod = watch('payment_period');
  const watchSalePrice = watch('sale_price');
  const watchAssetType = watch('asset_type');

  useEffect(() => {
    // Rent calculations (PANGISHA)
    if (watchMonthlyRent && watchPaymentPeriod) {
      const monthly = Number(watchMonthlyRent);
      const period = Number(watchPaymentPeriod);
      if (!isNaN(monthly) && !isNaN(period)) {
        const base = monthly * period;
        const vat = Math.round(base * 0.18);
        const fee = Math.round(base * 0.03);
        const total = base + vat + fee;
        
        setValue('vat_amount', vat);
        setValue('service_fee', fee);
        setValue('total_rent', total);
      }
    }

    // Sales calculations (Mauziano)
    if (watchSalePrice) {
      const price = Number(watchSalePrice);
      if (!isNaN(price)) {
        const vat = Math.round(price * 0.18);
        const fee = Math.round(price * 0.05);
        const total = price + vat + fee;
        
        setValue('vat_amount', vat);
        setValue('service_fee', fee);
        setValue('total_amount', total);
      }
    }
  }, [watchMonthlyRent, watchPaymentPeriod, watchSalePrice, setValue]);

  // Reset form when useProfileData changes
  useEffect(() => {
    reset(getDefaultValues());
  }, [useProfileData, userProfile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const names = Array.from(files).map((f: any) => f.name);
      setAttachments((prev) => [...prev, ...names]);
    }
  };

  const removeAttachment = (name: string) => {
    setAttachments((prev) => prev.filter((a) => a !== name));
  };

  const onFormSubmit = (data: any) => {
    onSubmit(data, attachments, applicantType, applicantType !== 'self' ? representativeName : undefined);
  };

  const handleUseProfileToggle = () => {
    setUseProfileData(!useProfileData);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Applicant Type Selection */}
      <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200 space-y-4">
        <h3 className="text-sm font-bold text-stone-700 flex items-center gap-2">
          <Users className="h-4 w-4 text-emerald-600" />
          {lang === 'sw' ? 'Unatuma Maombi kwa ajili ya?' : 'You are applying for?'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setApplicantType('self')}
            className={cn(
              "flex items-center gap-3 p-4 rounded-xl border-2 transition-all",
              applicantType === 'self'
                ? "border-emerald-500 bg-emerald-50"
                : "border-stone-200 bg-white hover:border-stone-300"
            )}
          >
            <div className={cn(
              "h-10 w-10 rounded-full flex items-center justify-center",
              applicantType === 'self' ? "bg-emerald-500 text-white" : "bg-stone-100 text-stone-500"
            )}>
              <User className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className="font-bold text-stone-800">
                {lang === 'sw' ? 'Mimi mwenyewe' : 'Myself'}
              </p>
              <p className="text-xs text-stone-500">
                {lang === 'sw' ? 'Ninaomba kwa niaba yangu' : 'Applying for myself'}
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setApplicantType('minor')}
            className={cn(
              "flex items-center gap-3 p-4 rounded-xl border-2 transition-all",
              applicantType === 'minor'
                ? "border-emerald-500 bg-emerald-50"
                : "border-stone-200 bg-white hover:border-stone-300"
            )}
          >
            <div className={cn(
              "h-10 w-10 rounded-full flex items-center justify-center",
              applicantType === 'minor' ? "bg-emerald-500 text-white" : "bg-stone-100 text-stone-500"
            )}>
              <Users className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className="font-bold text-stone-800">
                {lang === 'sw' ? 'Mtoto mdogo' : 'Minor'}
              </p>
              <p className="text-xs text-stone-500">
                {lang === 'sw' ? 'Kwa ajili ya mtoto chini ya miaka 18' : 'For a child under 18 years'}
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setApplicantType('representative')}
            className={cn(
              "flex items-center gap-3 p-4 rounded-xl border-2 transition-all",
              applicantType === 'representative'
                ? "border-emerald-500 bg-emerald-50"
                : "border-stone-200 bg-white hover:border-stone-300"
            )}
          >
            <div className={cn(
              "h-10 w-10 rounded-full flex items-center justify-center",
              applicantType === 'representative' ? "bg-emerald-500 text-white" : "bg-stone-100 text-stone-500"
            )}>
              <UserPlus className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className="font-bold text-stone-800">
                {lang === 'sw' ? 'Mtu mwingine' : 'Someone else'}
              </p>
              <p className="text-xs text-stone-500">
                {lang === 'sw' ? 'Ninaomba kwa niaba ya mtu mwingine' : 'Applying on behalf of someone'}
              </p>
            </div>
          </button>
        </div>

        {/* Representative Name Input (for minor or representative) */}
        {applicantType !== 'self' && (
          <div className="mt-4 p-4 bg-white rounded-xl border border-stone-200">
            <label className="text-sm font-bold text-stone-700 mb-2 block">
              {lang === 'sw' 
                ? applicantType === 'minor' 
                  ? 'Jina la Mtoto / Mteja' 
                  : 'Jina la Mtu unayemwakilisha'
                : applicantType === 'minor'
                  ? 'Name of Child / Client'
                  : 'Name of person you represent'
              } <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
              <input
                type="text"
                value={representativeName}
                onChange={(e) => setRepresentativeName(e.target.value)}
                placeholder={lang === 'sw' ? 'Ingiza jina kamili' : 'Enter full name'}
                className="w-full h-12 pl-10 pr-4 rounded-xl border border-stone-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                required={applicantType !== 'self'}
              />
            </div>
            <p className="text-xs text-stone-500 mt-2">
              {lang === 'sw' 
                ? 'Tafadhali hakikisha una mamlaka ya kuwakilisha mtu huyu' 
                : 'Please ensure you have authority to represent this person'}
            </p>
          </div>
        )}
      </div>

      {/* Profile Data Toggle (only for self) */}
      {applicantType === 'self' && userProfile && (
        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-200">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
              <RefreshCw className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-blue-800">
                {lang === 'sw' ? 'Tumia taarifa za wasifu wako' : 'Use your profile information'}
              </p>
              <p className="text-xs text-blue-600">
                {lang === 'sw' 
                  ? 'Jaza fomu kiotomatiki kwa kutumia taarifa zako zilizohifadhiwa' 
                  : 'Auto-fill the form using your saved profile information'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleUseProfileToggle}
            className={cn(
              "relative w-14 h-7 rounded-full transition-all",
              useProfileData ? "bg-blue-600" : "bg-stone-300"
            )}
          >
            <span 
              className={cn(
                "absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow-md transition-all",
                useProfileData && "translate-x-7"
              )} 
            />
          </button>
        </div>
      )}

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {schema.map((field) => {
          // Conditional rendering
          if (field.showIf) {
            const watchedValue = watch(field.showIf.field);
            if (watchedValue !== field.showIf.value) return null;
          }

          if (field.type === 'header') {
            return (
              <div key={field.name} className="md:col-span-2 pt-6 pb-2 border-b border-stone-100">
                <h3 className="text-sm font-bold text-emerald-700 tracking-wider uppercase">{field.label}</h3>
              </div>
            );
          }

          return (
            <div key={field.name} className={cn("flex flex-col gap-2", field.type === 'textarea' && "md:col-span-2")}>
              <label className="text-sm font-semibold text-stone-700">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </label>
              
              <Controller
                name={field.name}
                control={control}
                render={({ field: { onChange, value } }) => {
                  switch (field.type) {
                    case 'textarea':
                      return (
                        <textarea
                          onChange={onChange}
                          value={value || ''}
                          placeholder={field.placeholder}
                          className="p-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none min-h-[100px] transition-all"
                        />
                      );
                    case 'select':
                      return (
                        <select
                          onChange={onChange}
                          value={value || ''}
                          className="p-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white transition-all"
                        >
                          <option value="">{lang === 'sw' ? 'Chagua...' : 'Select...'} {field.label}</option>
                          {field.options?.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      );
                    case 'checkbox':
                      return (
                        <input
                          type="checkbox"
                          checked={value || false}
                          onChange={(e) => onChange(e.target.checked)}
                          className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                        />
                      );
                    case 'time':
                      return (
                        <input
                          type="time"
                          onChange={onChange}
                          value={value || ''}
                          className="p-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                        />
                      );
                    case 'datetime-local':
                      return (
                        <input
                          type="datetime-local"
                          onChange={onChange}
                          value={value || ''}
                          className="p-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                        />
                      );
                    case 'url':
                      return (
                        <input
                          type="url"
                          onChange={onChange}
                          value={value || ''}
                          placeholder={field.placeholder || 'https://...'}
                          className="p-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                        />
                      );
                    case 'file':
                      return (
                        <div className="flex items-center gap-3 p-3 border border-stone-200 rounded-xl bg-stone-50">
                          <FileText className="h-5 w-5 text-stone-400" />
                          <span className="text-sm text-stone-500 italic">
                            {lang === 'sw' ? 'Tumia sehemu ya viambatisho chini' : 'Use attachments section below'}
                          </span>
                        </div>
                      );
                    default:
                      return (
                        <input
                          type={field.type}
                          onChange={(e) => onChange(field.type === 'number' ? Number(e.target.value) : e.target.value)}
                          value={value || ''}
                          placeholder={field.placeholder}
                          disabled={field.disabled}
                          className={cn(
                            "p-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all",
                            field.disabled && "bg-stone-100 text-stone-500 cursor-not-allowed"
                          )}
                        />
                      );
                  }
                }}
              />
              {errors[field.name] && (
                <span className="text-xs text-red-500">{(errors[field.name] as any).message}</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Attachments Section */}
      <div className="space-y-3 pt-4 border-t border-stone-100">
        <label className="text-sm font-bold text-stone-700 flex items-center gap-2">
          <FileText className="h-4 w-4 text-emerald-600" />
          {lang === 'sw' ? 'Viambatisho / Nyaraka' : 'Attachments / Documents'}
        </label>
        <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileChange} />
        <button 
          type="button" 
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-4 border-2 border-dashed border-stone-200 rounded-2xl text-stone-500 hover:border-emerald-500 hover:text-emerald-600 transition-all flex items-center justify-center gap-2 group"
        >
          <Upload className="h-5 w-5 group-hover:-translate-y-1 transition-transform" />
          <span className="font-semibold">{lang === 'sw' ? 'Ambatisha Nyaraka' : 'Attach Documents'}</span>
        </button>
        
        {attachments.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
            {attachments.map((a) => (
              <div key={a} className="flex items-center justify-between px-4 py-2 rounded-xl bg-stone-50 border border-stone-100 text-sm">
                <span className="truncate flex-1 font-medium text-stone-700">{a}</span>
                <button type="button" onClick={() => removeAttachment(a)} className="text-red-500 hover:bg-red-50 p-1 rounded-lg transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || (applicantType !== 'self' && !representativeName)}
        className="w-full h-16 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-all shadow-xl shadow-emerald-200 flex items-center justify-center gap-3 disabled:opacity-50 group mt-8"
      >
        {isLoading ? (
          <Loader2 className="h-6 w-6 animate-spin" />
        ) : (
          <>
            {lang === 'sw' ? 'Wasilisha Maombi' : 'Submit Application'}
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </>
        )}
      </button>

      {/* Representative Disclaimer */}
      {applicantType !== 'self' && (
        <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-sm text-amber-800">
          <p className="font-bold mb-1">
            {lang === 'sw' ? 'Ujumbe muhimu:' : 'Important message:'}
          </p>
          <p>
            {lang === 'sw' 
              ? 'Unawasilisha maombi kwa niaba ya mtu mwingine. Tafadhali hakikisha una hati ya idhini au mamlaka ya kufanya hivyo.' 
              : 'You are submitting an application on behalf of someone else. Please ensure you have a letter of authorization or authority to do so.'}
          </p>
        </div>
      )}
    </form>
  );
};