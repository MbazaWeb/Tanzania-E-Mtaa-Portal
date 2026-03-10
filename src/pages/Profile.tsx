import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  CheckCircle2, 
  Building2, 
  MapPin, 
  RefreshCw, 
  LogOut,
  Camera,
  Loader2,
  Upload,
  Edit2,
  X,
  Save,
  AlertCircle,
  Clock,
  Shield,
  ChevronDown,
  Eye,
  EyeOff,
  Mail,
  Phone,
  Fingerprint,
  Globe,
  Home,
  Briefcase
} from 'lucide-react';
import { supabase } from '@/src/lib/supabase';
import { useAuth } from '@/src/context/AuthContext';
import { useLanguage } from '@/src/context/LanguageContext';
import { useToast } from '@/src/context/ToastContext';
import { InfoItem } from '@/src/components/ui/InfoItem';
import { TANZANIA_ADDRESS_DATA } from '@/src/lib/addressData';
import { debounce } from 'lodash';

// Types
interface PendingChange {
  id: string;
  field_name: string;
  old_value: string;
  new_value: string;
  status: string;
  created_at: string;
}

interface FormData {
  first_name: string;
  middle_name: string;
  last_name: string;
  gender: string;
  nationality: string;
  nida_number: string;
  phone: string;
  region: string;
  district: string;
  ward: string;
  street: string;
}

interface FieldValidation {
  isValid: boolean;
  message: string;
}

// Constants
const SENSITIVE_FIELDS = ['first_name', 'middle_name', 'last_name', 'nida_number', 'nationality', 'gender'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const FIELD_LABELS: Record<string, { en: string; sw: string }> = {
  first_name: { en: 'First Name', sw: 'Jina la Kwanza' },
  middle_name: { en: 'Middle Name', sw: 'Jina la Kati' },
  last_name: { en: 'Last Name', sw: 'Jina la Mwisho' },
  gender: { en: 'Gender', sw: 'Jinsia' },
  nationality: { en: 'Nationality', sw: 'Uraia' },
  nida_number: { en: 'NIDA Number', sw: 'Namba ya NIDA' },
  phone: { en: 'Phone', sw: 'Simu' },
  region: { en: 'Region', sw: 'Mkoa' },
  district: { en: 'District', sw: 'Wilaya' },
  ward: { en: 'Ward', sw: 'Kata' },
  street: { en: 'Street', sw: 'Mtaa' }
};

export function Profile() {
  const { user, signOut, refreshProfile } = useAuth();
  const { lang } = useLanguage();
  const { showToast } = useToast();
  
  // State
  const [uploading, setUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<PendingChange[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showNidaFormat, setShowNidaFormat] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form state
  const [formData, setFormData] = useState<FormData>({
    first_name: '',
    middle_name: '',
    last_name: '',
    gender: '',
    nationality: '',
    nida_number: '',
    phone: '',
    region: '',
    district: '',
    ward: '',
    street: ''
  });

  // Derived data
  const regions = useMemo(() => TANZANIA_ADDRESS_DATA.map(r => r.name), []);
  
  const districts = useMemo(() => {
    if (!formData.region) return [];
    return TANZANIA_ADDRESS_DATA.find(r => r.name === formData.region)?.districts.map(d => d.name) || [];
  }, [formData.region]);
  
  const wards = useMemo(() => {
    if (!formData.region || !formData.district) return [];
    return TANZANIA_ADDRESS_DATA
      .find(r => r.name === formData.region)
      ?.districts.find(d => d.name === formData.district)?.wards || [];
  }, [formData.region, formData.district]);

  // Validation functions
  const validateNidaNumber = (nida: string): FieldValidation => {
    if (!nida) return { isValid: true, message: '' };
    
    // Remove any existing dashes for validation
    const cleanNida = nida.replace(/-/g, '');
    
    if (cleanNida.length !== 20) {
      return { 
        isValid: false, 
        message: lang === 'sw' ? 'Namba ya NIDA lazima iwe na tarakimu 20' : 'NIDA number must be 20 digits'
      };
    }
    
    if (!/^\d+$/.test(cleanNida)) {
      return { 
        isValid: false, 
        message: lang === 'sw' ? 'Namba ya NIDA lazima iwe na tarakimu pekee' : 'NIDA number must contain only digits'
      };
    }
    
    return { isValid: true, message: '' };
  };

  const validatePhoneNumber = (phone: string): FieldValidation => {
    if (!phone) return { isValid: true, message: '' };
    
    const tzPhoneRegex = /^(?:(?:\+255|0)[67]\d{8})$/;
    if (!tzPhoneRegex.test(phone)) {
      return {
        isValid: false,
        message: lang === 'sw' ? 'Namba ya simu sio sahihi. Tumia +255XXXXXXXXX au 0XXXXXXXXX' : 'Invalid phone number. Use +255XXXXXXXXX or 0XXXXXXXXX'
      };
    }
    
    return { isValid: true, message: '' };
  };

  // Effects
  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        middle_name: user.middle_name || '',
        last_name: user.last_name || '',
        gender: user.gender || '',
        nationality: user.nationality || '',
        nida_number: user.nida_number || '',
        phone: user.phone || '',
        region: user.region || '',
        district: user.district || '',
        ward: user.ward || '',
        street: user.street || ''
      });
      fetchPendingChanges();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      const initialData = {
        first_name: user.first_name || '',
        middle_name: user.middle_name || '',
        last_name: user.last_name || '',
        gender: user.gender || '',
        nationality: user.nationality || '',
        nida_number: user.nida_number || '',
        phone: user.phone || '',
        region: user.region || '',
        district: user.district || '',
        ward: user.ward || '',
        street: user.street || ''
      };
      
      const hasChanges = Object.keys(formData).some(
        key => formData[key as keyof FormData] !== initialData[key as keyof FormData]
      );
      setIsDirty(hasChanges);
    }
  }, [formData, user]);

  // API Calls
  const fetchPendingChanges = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profile_change_requests')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      if (data) setPendingChanges(data);
    } catch (error) {
      console.error('Error fetching pending changes:', error);
      showToast(
        lang === 'sw' ? 'Hitilafu kupata mabadiliko yanayosubiri' : 'Error fetching pending changes',
        'error'
      );
    }
  };

  // Handlers
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refreshProfile();
      await fetchPendingChanges();
      showToast(
        lang === 'sw' ? 'Wasifu umeonyeshwa upya' : 'Profile refreshed',
        'success'
      );
    } catch (error) {
      showToast(
        lang === 'sw' ? 'Hitilafu kuonyesha upya wasifu' : 'Error refreshing profile',
        'error'
      );
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  }, [refreshProfile, lang, showToast]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      showToast(
        lang === 'sw' ? 'Aina ya faili haikubaliki. Tumia JPG, PNG, WEBP, au GIF' : 'File type not allowed. Use JPG, PNG, WEBP, or GIF',
        'error'
      );
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      showToast(
        lang === 'sw' ? 'Faili ni kubwa sana. Maximum 5MB' : 'File too large. Maximum 5MB',
        'error'
      );
      return;
    }

    setUploading(true);
    try {
      const reader = new FileReader();
      
      const base64data = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const { error } = await supabase
        .from('users')
        .update({ photo_url: base64data })
        .eq('id', user?.id);

      if (error) throw error;

      showToast(
        lang === 'sw' ? 'Picha imepakiwa kikamilifu!' : 'Profile picture uploaded successfully!',
        'success'
      );
      
      // Refresh user data
      await refreshProfile();
    } catch (error) {
      console.error('Error uploading photo:', error);
      showToast(
        lang === 'sw' ? 'Hitilafu imetokea wakati wa kupakia.' : 'Error occurred during upload.',
        'error'
      );
    } finally {
      setUploading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    // Validate NIDA if present
    if (formData.nida_number) {
      const nidaValidation = validateNidaNumber(formData.nida_number);
      if (!nidaValidation.isValid) {
        errors.nida_number = nidaValidation.message;
      }
    }
    
    // Validate phone if present
    if (formData.phone) {
      const phoneValidation = validatePhoneNumber(formData.phone);
      if (!phoneValidation.isValid) {
        errors.phone = phoneValidation.message;
      }
    }
    
    // Validate required fields
    if (!formData.first_name) {
      errors.first_name = lang === 'sw' ? 'Jina la kwanza linahitajika' : 'First name is required';
    }
    
    if (!formData.last_name) {
      errors.last_name = lang === 'sw' ? 'Jina la mwisho linahitajika' : 'Last name is required';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!validateForm()) {
      showToast(
        lang === 'sw' ? 'Tafadhali sahihisha makosa kabla ya kuendelea' : 'Please fix errors before proceeding',
        'error'
      );
      return;
    }

    setSaving(true);
    try {
      // Format NIDA number by removing dashes for storage
      const formattedNida = formData.nida_number.replace(/-/g, '');
      
      const sensitiveUpdates: { field: string; oldValue: string; newValue: string }[] = [];
      const directUpdates: Record<string, string> = {};

      // Check which fields changed
      const fieldMappings: Record<string, string> = {
        first_name: user?.first_name || '',
        middle_name: user?.middle_name || '',
        last_name: user?.last_name || '',
        gender: user?.gender || '',
        nationality: user?.nationality || '',
        nida_number: user?.nida_number || '',
        phone: user?.phone || '',
        region: user?.region || '',
        district: user?.district || '',
        ward: user?.ward || '',
        street: user?.street || ''
      };

      for (const [field, newValue] of Object.entries(formData)) {
        // Use formatted NIDA for comparison
        const compareValue = field === 'nida_number' ? formattedNida : newValue;
        const oldValue = fieldMappings[field];
        
        if (compareValue !== oldValue) {
          if (SENSITIVE_FIELDS.includes(field)) {
            sensitiveUpdates.push({ field, oldValue, newValue: compareValue });
          } else {
            directUpdates[field] = compareValue;
          }
        }
      }

      // Direct updates for non-sensitive fields
      if (Object.keys(directUpdates).length > 0) {
        const { error } = await supabase
          .from('users')
          .update(directUpdates)
          .eq('id', user?.id);

        if (error) throw error;
      }

      // Create change requests for sensitive fields
      if (sensitiveUpdates.length > 0) {
        const changeRequests = sensitiveUpdates.map(({ field, oldValue, newValue }) => ({
          user_id: user?.id,
          field_name: field,
          old_value: oldValue,
          new_value: newValue,
          status: 'pending'
        }));

        const { error } = await supabase
          .from('profile_change_requests')
          .insert(changeRequests);

        if (error) throw error;

        showToast(
          lang === 'sw' 
            ? `Mabadiliko ${sensitiveUpdates.length} ya taarifa nyeti yamewasilishwa kwa idhini.` 
            : `${sensitiveUpdates.length} sensitive field change(s) submitted for approval.`, 
          'info'
        );
      }

      if (Object.keys(directUpdates).length > 0) {
        showToast(
          lang === 'sw' ? 'Wasifu umesasishwa!' : 'Profile updated!', 
          'success'
        );
      }

      setIsEditing(false);
      setIsDirty(false);
      await fetchPendingChanges();
      await refreshProfile();
    } catch (error: any) {
      console.error('Error saving profile:', error);
      showToast(
        error.message || (lang === 'sw' ? 'Hitilafu kuhifadhi wasifu' : 'Error saving profile'),
        'error'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        middle_name: user.middle_name || '',
        last_name: user.last_name || '',
        gender: user.gender || '',
        nationality: user.nationality || '',
        nida_number: user.nida_number || '',
        phone: user.phone || '',
        region: user.region || '',
        district: user.district || '',
        ward: user.ward || '',
        street: user.street || ''
      });
    }
    setValidationErrors({});
    setIsEditing(false);
    setIsDirty(false);
  };

  const formatNidaForDisplay = (nida: string) => {
    if (!nida) return '';
    const clean = nida.replace(/-/g, '');
    return clean.match(/.{1,4}/g)?.join('-') || clean;
  };

  const handleNidaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^\d-]/g, '');
    
    if (showNidaFormat) {
      // Auto-format with dashes
      const digits = rawValue.replace(/-/g, '');
      if (digits.length <= 20) {
        const formatted = digits.match(/.{1,4}/g)?.join('-') || digits;
        setFormData({...formData, nida_number: formatted});
      }
    } else {
      // Allow free input
      setFormData({...formData, nida_number: rawValue});
    }
  };

  // Render methods for better organization
  const renderPendingChangesAlert = () => {
    if (pendingChanges.length === 0) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-amber-50 border border-amber-200 rounded-xl p-4"
      >
        <div className="flex items-start gap-3">
          <Clock className="text-amber-600 shrink-0 mt-0.5" size={20} />
          <div className="flex-1">
            <h4 className="font-bold text-amber-800">
              {lang === 'sw' ? 'Mabadiliko Yanasubiri Idhini' : 'Pending Changes Awaiting Approval'}
            </h4>
            <ul className="mt-2 space-y-1">
              {pendingChanges.map(change => (
                <li key={change.id} className="text-sm text-amber-700">
                  <span className="font-medium">{getFieldLabel(change.field_name)}:</span>{' '}
                  <span className="line-through text-amber-500">{change.old_value || '-'}</span>{' '}
                  → <span className="font-medium">{change.new_value}</span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-amber-600 mt-2">
              {lang === 'sw' 
                ? 'Mabadiliko haya yataonekana baada ya kuidhinishwa na mtumishi' 
                : 'These changes will appear after staff approval'}
            </p>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderProfileHeader = () => (
    <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 p-8 md:p-12 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-black/10" />
      <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
        <div className="relative group">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-md border-4 border-white/30 flex items-center justify-center text-4xl font-black overflow-hidden shadow-2xl"
          >
            {user?.photo_url ? (
              <img 
                src={user.photo_url} 
                alt="Profile" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  // Fallback if image fails to load
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <span>{(user?.first_name?.[0] || '').toUpperCase()}{(user?.last_name?.[0] || '').toUpperCase()}</span>
            )}
          </motion.div>
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="absolute bottom-0 right-0 p-2 bg-white text-emerald-600 rounded-full shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            title={lang === 'sw' ? 'Badilisha picha' : 'Change photo'}
          >
            {uploading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
          </motion.button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept={ALLOWED_IMAGE_TYPES.join(',')} 
            className="hidden"
            aria-label="Upload profile picture"
          />
        </div>
        <div className="text-center md:text-left space-y-2 flex-1">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight">
            {user?.first_name} {user?.middle_name || ''} {user?.last_name}
          </h2>
          <div className="flex flex-wrap justify-center md:justify-start gap-3">
            <motion.span 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/20 backdrop-blur-md px-4 py-1 rounded-full text-sm font-bold border border-white/30"
            >
              {user?.role === 'citizen' ? (lang === 'sw' ? 'Mwananchi' : 'Citizen') : 
               user?.role === 'admin' ? (lang === 'sw' ? 'Msimamizi' : 'Administrator') : 
               (lang === 'sw' ? 'Mtumishi' : 'Staff')}
            </motion.span>
            {user?.is_verified && (
              <motion.span 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-emerald-400/20 backdrop-blur-md px-4 py-1 rounded-full text-sm font-bold border border-emerald-400/30 flex items-center gap-2"
              >
                <CheckCircle2 size={14} />
                {lang === 'sw' ? 'Akaunti Imethibitishwa' : 'Verified Account'}
              </motion.span>
            )}
          </div>
          {user?.role === 'citizen' && (
            <p className="text-white/60 text-xs font-bold uppercase tracking-widest flex items-center gap-1 justify-center md:justify-start">
              <Upload size={12} />
              {lang === 'sw' ? 'Picha ya wasifu inahifadhiwa kwenye nyaraka' : 'Profile picture is saved to documents'}
            </p>
          )}
        </div>
      </div>
      <Building2 className="absolute -right-10 -bottom-10 h-64 w-64 text-white/10 rotate-12" />
    </div>
  );

  const renderPersonalInfo = () => (
    <section className="space-y-6">
      <div className="flex items-center justify-between border-b border-stone-100 pb-4">
        <h3 className="text-xl font-bold text-stone-900 flex items-center gap-2">
          <User size={20} className="text-emerald-600" />
          {lang === 'sw' ? 'Taarifa Binafsi' : 'Personal Information'}
        </h3>
        {SENSITIVE_FIELDS.length > 0 && (
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full flex items-center gap-1"
          >
            <Shield size={12} />
            {lang === 'sw' ? 'Mabadiliko yanahitaji idhini' : 'Changes require approval'}
          </motion.span>
        )}
      </div>
      
      {isEditing ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label htmlFor="first_name" className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1">
              {lang === 'sw' ? 'Jina la Kwanza' : 'First Name'}
              <Shield size={10} className="text-amber-500" />
            </label>
            <input 
              id="first_name"
              type="text"
              value={formData.first_name}
              onChange={(e) => setFormData({...formData, first_name: e.target.value})}
              className={`w-full h-12 px-4 bg-stone-50 border rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all font-medium ${
                validationErrors.first_name ? 'border-red-300 bg-red-50' : 'border-stone-200'
              }`}
              aria-invalid={validationErrors.first_name ? "true" : undefined}
            />
            {validationErrors.first_name && (
              <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle size={12} />
                {validationErrors.first_name}
              </p>
            )}
          </div>
          {/* ... similar pattern for other fields ... */}
          <div className="space-y-2">
            <label htmlFor="nida_number" className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1">
              {lang === 'sw' ? 'Namba ya NIDA' : 'NIDA Number'}
              <Shield size={10} className="text-amber-500" />
            </label>
            <div className="relative">
              <input 
                id="nida_number"
                type="text"
                value={formData.nida_number}
                onChange={handleNidaChange}
                placeholder={showNidaFormat ? "XXXX-XXXX-XXXX-XXXX-XXXX" : "20 digit number"}
                className={`w-full h-12 px-4 bg-stone-50 border rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all font-mono ${
                  validationErrors.nida_number ? 'border-red-300 bg-red-50' : 'border-stone-200'
                }`}
                maxLength={showNidaFormat ? 24 : 20}
              />
              <button
                type="button"
                onClick={() => setShowNidaFormat(!showNidaFormat)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                title={showNidaFormat ? (lang === 'sw' ? 'Badilisha kwa ingizo la kawaida' : 'Switch to raw input') : (lang === 'sw' ? 'Badilisha kwa umbizo la kuweka vistari' : 'Switch to formatted input')}
              >
                {showNidaFormat ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
            {validationErrors.nida_number && (
              <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle size={12} />
                {validationErrors.nida_number}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <InfoItem 
            icon={<User size={16} />}
            label={lang === 'sw' ? 'Jina Kamili' : 'Full Name'} 
            value={`${user?.first_name} ${user?.middle_name || ''} ${user?.last_name}`} 
          />
          <InfoItem 
            icon={<User size={16} />}
            label={lang === 'sw' ? 'Jinsia' : 'Gender'} 
            value={user?.gender ? (user.gender === 'Me' ? (lang === 'sw' ? 'Mwanaume' : 'Male') : (lang === 'sw' ? 'Mwanamke' : 'Female')) : '-'} 
          />
          <InfoItem 
            icon={<Globe size={16} />}
            label={lang === 'sw' ? 'Uraia' : 'Nationality'} 
            value={user?.nationality || '-'} 
          />
          {user?.nida_number ? (
            <div className="space-y-1 col-span-1 md:col-span-2 lg:col-span-1">
              <p className="text-xs font-bold text-stone-400 uppercase tracking-widest flex items-center gap-1">
                <Fingerprint size={12} />
                {lang === 'sw' ? 'Namba ya NIDA' : 'NIDA Number'}
              </p>
              <p className="text-stone-800 font-bold text-lg font-mono bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200">
                {formatNidaForDisplay(user.nida_number)}
              </p>
            </div>
          ) : user?.id_type && user?.id_number ? (
            <div className="space-y-1">
              <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">
                {user.id_type === 'birth_certificate' ? (lang === 'sw' ? 'Cheti cha Kuzaliwa' : 'Birth Certificate') :
                 user.id_type === 'voter_id' ? (lang === 'sw' ? 'Kadi ya Mpiga Kura' : 'Voter ID') :
                 user.id_type === 'driving_license' ? (lang === 'sw' ? 'Leseni ya Udereva' : 'Driving License') :
                 user.id_type === 'zanzibar_id' ? (lang === 'sw' ? 'Kitambulisho cha Zanzibar' : 'Zanzibar ID') :
                 user.id_type === 'student_id' ? (lang === 'sw' ? 'Kitambulisho cha Mwanafunzi' : 'Student ID') :
                 user.id_type === 'employer_id' ? (lang === 'sw' ? 'Kitambulisho cha Mwajiri' : 'Employer ID') :
                 user.id_type}
              </p>
              <p className="text-stone-800 font-bold text-lg font-mono bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">{user.id_number}</p>
            </div>
          ) : (
            <InfoItem 
              icon={<Fingerprint size={16} />}
              label={lang === 'sw' ? 'Namba ya NIDA' : 'NIDA Number'} 
              value="-" 
            />
          )}
          <InfoItem 
            icon={<Mail size={16} />}
            label={lang === 'sw' ? 'Barua Pepe' : 'Email Address'} 
            value={user?.email || '-'} 
          />
          <InfoItem 
            icon={<Phone size={16} />}
            label={lang === 'sw' ? 'Namba ya Simu' : 'Phone Number'} 
            value={user?.phone || '-'} 
          />
        </div>
      )}
    </section>
  );

  const renderLocationInfo = () => (
    <section className="space-y-6">
      <h3 className="text-xl font-bold text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-4">
        <MapPin size={20} className="text-emerald-600" />
        {user?.role === 'citizen' ? (lang === 'sw' ? 'Mahali Unapoishi' : 'Residential Information') : (lang === 'sw' ? 'Taarifa za Kazi' : 'Work Information')}
      </h3>
      
      {isEditing && user?.role === 'citizen' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <label htmlFor="region" className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              {lang === 'sw' ? 'Mkoa' : 'Region'}
            </label>
            <select 
              id="region"
              value={formData.region}
              onChange={(e) => setFormData({...formData, region: e.target.value, district: '', ward: '', street: ''})}
              className="w-full h-12 px-4 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
            >
              <option value="">{lang === 'sw' ? 'Chagua Mkoa' : 'Select Region'}</option>
              {regions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="district" className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              {lang === 'sw' ? 'Wilaya' : 'District'}
            </label>
            <select 
              id="district"
              value={formData.district}
              onChange={(e) => setFormData({...formData, district: e.target.value, ward: '', street: ''})}
              disabled={!formData.region}
              className="w-full h-12 px-4 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all font-medium disabled:opacity-50 disabled:bg-stone-100"
            >
              <option value="">{lang === 'sw' ? 'Chagua Wilaya' : 'Select District'}</option>
              {districts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="ward" className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              {lang === 'sw' ? 'Kata' : 'Ward'}
            </label>
            <select 
              id="ward"
              value={formData.ward}
              onChange={(e) => setFormData({...formData, ward: e.target.value, street: ''})}
              disabled={!formData.district}
              className="w-full h-12 px-4 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all font-medium disabled:opacity-50 disabled:bg-stone-100"
            >
              <option value="">{lang === 'sw' ? 'Chagua Kata' : 'Select Ward'}</option>
              {wards.map(w => <option key={w} value={w}>{w}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="street" className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              {lang === 'sw' ? 'Mtaa' : 'Street'}
            </label>
            <input 
              id="street"
              type="text"
              value={formData.street}
              onChange={(e) => setFormData({...formData, street: e.target.value})}
              placeholder={lang === 'sw' ? 'Andika jina la mtaa' : 'Enter street name'}
              className="w-full h-12 px-4 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {user?.role === 'citizen' ? (
            <>
              <InfoItem 
                icon={<MapPin size={16} />}
                label={lang === 'sw' ? 'Mkoa' : 'Region'} 
                value={user?.region || '-'} 
              />
              <InfoItem 
                icon={<MapPin size={16} />}
                label={lang === 'sw' ? 'Wilaya' : 'District'} 
                value={user?.district || '-'} 
              />
              <InfoItem 
                icon={<MapPin size={16} />}
                label={lang === 'sw' ? 'Kata' : 'Ward'} 
                value={user?.ward || '-'} 
              />
              <InfoItem 
                icon={<Home size={16} />}
                label={lang === 'sw' ? 'Mtaa' : 'Street'} 
                value={user?.street || '-'} 
              />
              {user?.is_diaspora && (
                <>
                  <InfoItem 
                    icon={<Globe size={16} />}
                    label={lang === 'sw' ? 'Nchi Unapoishi' : 'Country of Residence'} 
                    value={user?.country_of_residence || '-'} 
                  />
                  <InfoItem 
                    icon={<Fingerprint size={16} />}
                    label={lang === 'sw' ? 'Namba ya Pasipoti' : 'Passport Number'} 
                    value={user?.passport_number || '-'} 
                  />
                </>
              )}
            </>
          ) : (
            <>
              <InfoItem 
                icon={<Briefcase size={16} />}
                label={lang === 'sw' ? 'Mkoa wa Kazi' : 'Assigned Region'} 
                value={user?.assigned_region || '-'} 
              />
              <InfoItem 
                icon={<Briefcase size={16} />}
                label={lang === 'sw' ? 'Wilaya ya Kazi' : 'Assigned District'} 
                value={user?.assigned_district || '-'} 
              />
              <InfoItem 
                icon={<Building2 size={16} />}
                label={lang === 'sw' ? 'ID ya Ofisi' : 'Office ID'} 
                value={user?.office_id || '-'} 
              />
            </>
          )}
        </div>
      )}
    </section>
  );

  const renderActionButtons = () => (
    <motion.div 
      className="pt-8 flex flex-col sm:flex-row gap-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      {isEditing ? (
        <>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSaveProfile}
            disabled={saving || !isDirty}
            className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {lang === 'sw' ? 'Hifadhi Mabadiliko' : 'Save Changes'}
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCancel}
            className="bg-stone-100 text-stone-600 px-8 py-3 rounded-xl font-bold hover:bg-stone-200 transition-all flex items-center justify-center gap-2"
          >
            <X size={18} />
            {lang === 'sw' ? 'Ghairi' : 'Cancel'}
          </motion.button>
        </>
      ) : (
        <>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsEditing(true)}
            className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 flex items-center justify-center gap-2"
          >
            <Edit2 size={18} />
            {lang === 'sw' ? 'Hariri Wasifu' : 'Edit Profile'}
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={signOut}
            className="bg-stone-100 text-stone-600 px-8 py-3 rounded-xl font-bold hover:bg-stone-200 transition-all flex items-center justify-center gap-2"
          >
            <LogOut size={18} />
            {lang === 'sw' ? 'Ondoka' : 'Sign Out'}
          </motion.button>
        </>
      )}
    </motion.div>
  );

  // Main render
  if (!user) return null;

  const getFieldLabel = (field: string) => {
    return FIELD_LABELS[field]?.[lang] || field;
  };

  return (
    <motion.div 
      key="profile"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-900">
          {lang === 'sw' ? 'Wasifu Wangu' : 'My Profile'}
        </h1>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-semibold text-sm hover:bg-emerald-100 transition-all disabled:opacity-50"
        >
          <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
          {lang === 'sw' ? 'Onyesha Upya' : 'Refresh'}
        </motion.button>
      </div>

      <div className="bg-white rounded-4xl border border-stone-100 shadow-xl overflow-hidden">
        {renderProfileHeader()}

        <div className="p-8 md:p-12 space-y-12">
          <AnimatePresence mode="wait">
            {renderPendingChangesAlert()}
          </AnimatePresence>

          {renderPersonalInfo()}
          {renderLocationInfo()}
          {renderActionButtons()}
        </div>
      </div>

      {/* Unsaved changes warning */}
      <AnimatePresence>
        {isDirty && isEditing && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 bg-amber-50 border border-amber-200 rounded-lg p-4 shadow-lg max-w-sm"
          >
            <div className="flex items-start gap-2">
              <AlertCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-800">
                  {lang === 'sw' ? 'Mabadiliko ambayo hayajahifadhiwa' : 'Unsaved changes'}
                </p>
                <p className="text-sm text-amber-700 mt-1">
                  {lang === 'sw' 
                    ? 'Una mabadiliko ambayo hayajahifadhiwa. Tafadhali hifadhi au ghairi.' 
                    : 'You have unsaved changes. Please save or cancel.'}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}