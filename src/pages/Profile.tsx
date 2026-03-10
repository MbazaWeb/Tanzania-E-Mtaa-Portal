import React, { useState, useRef, useEffect } from 'react';
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
  Shield
} from 'lucide-react';
import { supabase } from '@/src/lib/supabase';
import { useAuth } from '@/src/context/AuthContext';
import { useLanguage } from '@/src/context/LanguageContext';
import { useToast } from '@/src/context/ToastContext';
import { InfoItem } from '@/src/components/ui/InfoItem';
import { TANZANIA_ADDRESS_DATA } from '@/src/lib/addressData';

// Sensitive fields that require approval
const SENSITIVE_FIELDS = ['first_name', 'middle_name', 'last_name', 'nida_number', 'nationality', 'gender'];

interface PendingChange {
  id: string;
  field_name: string;
  old_value: string;
  new_value: string;
  status: string;
  created_at: string;
}

export function Profile() {
  const { user, signOut, refreshProfile } = useAuth();
  const { lang } = useLanguage();
  const { showToast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<PendingChange[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshProfile();
    setTimeout(() => setIsRefreshing(false), 500);
  };
  
  // Form state for editing
  const [formData, setFormData] = useState({
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

  const fetchPendingChanges = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profile_change_requests')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    
    if (data) setPendingChanges(data);
  };

  if (!user) return null;

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        
        const { error } = await supabase
          .from('users')
          .update({ photo_url: base64data })
          .eq('id', user.id);

        if (error) throw error;

        showToast(lang === 'sw' ? 'Picha imepakiwa kikamilifu!' : 'Profile picture uploaded successfully!', 'success');
        setTimeout(() => window.location.reload(), 1500);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading photo:', error);
      showToast(lang === 'sw' ? 'Hitilafu imetokea wakati wa kupakia.' : 'Error occurred during upload.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      // Separate sensitive and non-sensitive fields
      const sensitiveUpdates: { field: string; oldValue: string; newValue: string }[] = [];
      const directUpdates: Record<string, string> = {};

      // Check which fields changed
      const fieldMappings: Record<string, string> = {
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

      for (const [field, newValue] of Object.entries(formData)) {
        const oldValue = fieldMappings[field];
        if (newValue !== oldValue) {
          if (SENSITIVE_FIELDS.includes(field)) {
            sensitiveUpdates.push({ field, oldValue, newValue });
          } else {
            directUpdates[field] = newValue;
          }
        }
      }

      // Direct updates for non-sensitive fields
      if (Object.keys(directUpdates).length > 0) {
        const { error } = await supabase
          .from('users')
          .update(directUpdates)
          .eq('id', user.id);

        if (error) throw error;
      }

      // Create change requests for sensitive fields
      if (sensitiveUpdates.length > 0) {
        const changeRequests = sensitiveUpdates.map(({ field, oldValue, newValue }) => ({
          user_id: user.id,
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
      fetchPendingChanges();
      if (refreshProfile) refreshProfile();
    } catch (error: any) {
      console.error('Error saving profile:', error);
      showToast(error.message || 'Error saving profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const getFieldLabel = (field: string) => {
    const labels: Record<string, { en: string; sw: string }> = {
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
    return labels[field]?.[lang] || field;
  };

  const regions = TANZANIA_ADDRESS_DATA.map(r => r.name);
  const districts = formData.region 
    ? TANZANIA_ADDRESS_DATA.find(r => r.name === formData.region)?.districts.map(d => d.name) || [] 
    : [];
  const wards = formData.region && formData.district 
    ? TANZANIA_ADDRESS_DATA.find(r => r.name === formData.region)?.districts.find(d => d.name === formData.district)?.wards || [] 
    : [];

  return (
    <motion.div 
      key="profile"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-900">{lang === 'sw' ? 'Wasifu Wangu' : 'My Profile'}</h1>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-semibold text-sm hover:bg-emerald-100 transition-all disabled:opacity-50"
        >
          <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
          {lang === 'sw' ? 'Onyesha Upya' : 'Refresh'}
        </button>
      </div>
      <div className="bg-white rounded-4xl border border-stone-100 shadow-xl overflow-hidden">
        <div className="bg-emerald-600 p-8 md:p-12 text-white relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-md border-4 border-white/30 flex items-center justify-center text-4xl font-black overflow-hidden">
                {user.photo_url ? (
                  <img src={user.photo_url} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <span>{(user.first_name?.[0] || '').toUpperCase()}{(user.last_name?.[0] || '').toUpperCase()}</span>
                )}
              </div>
              <button 
                onClick={handleUploadClick}
                disabled={uploading}
                className="absolute bottom-0 right-0 p-2 bg-white text-emerald-600 rounded-full shadow-lg hover:scale-110 transition-transform disabled:opacity-50"
              >
                {uploading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden"
                aria-label="Upload profile picture"
              />
            </div>
            <div className="text-center md:text-left space-y-2">
              <h2 className="text-3xl md:text-4xl font-black tracking-tight">
                {user.first_name} {user.middle_name || ''} {user.last_name}
              </h2>
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <span className="bg-white/20 backdrop-blur-md px-4 py-1 rounded-full text-sm font-bold border border-white/30">
                  {user.role === 'citizen' ? (lang === 'sw' ? 'Mwananchi' : 'Citizen') : 
                   user.role === 'admin' ? (lang === 'sw' ? 'Msimamizi' : 'Administrator') : 
                   (lang === 'sw' ? 'Mtumishi' : 'Staff')}
                </span>
                {user.is_verified && (
                  <span className="bg-emerald-400/20 backdrop-blur-md px-4 py-1 rounded-full text-sm font-bold border border-emerald-400/30 flex items-center gap-2">
                    <CheckCircle2 size={14} />
                    {lang === 'sw' ? 'Akaunti Imethibitishwa' : 'Verified Account'}
                  </span>
                )}
              </div>
              {user.role === 'citizen' && (
                <p className="text-white/60 text-xs font-bold uppercase tracking-widest flex items-center gap-1 justify-center md:justify-start">
                  <Upload size={12} />
                  {lang === 'sw' ? 'Picha ya wasifu inahifadhiwa kwenye nyaraka' : 'Profile picture is saved to documents'}
                </p>
              )}
            </div>
          </div>
          <Building2 className="absolute -right-10 -bottom-10 h-64 w-64 text-white/10 rotate-12" />
        </div>

        <div className="p-8 md:p-12 space-y-12">
          {/* Pending Changes Alert */}
          {pendingChanges.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Clock className="text-amber-600 shrink-0 mt-0.5" size={20} />
                <div>
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
                </div>
              </div>
            </div>
          )}

          {/* Personal Information */}
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <h3 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                <User size={20} className="text-emerald-600" />
                {lang === 'sw' ? 'Taarifa Binafsi' : 'Personal Information'}
              </h3>
              {SENSITIVE_FIELDS.length > 0 && (
                <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full flex items-center gap-1">
                  <Shield size={12} />
                  {lang === 'sw' ? 'Mabadiliko yanahitaji idhini' : 'Changes require approval'}
                </span>
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
                    className="w-full h-12 px-4 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="middle_name" className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1">
                    {lang === 'sw' ? 'Jina la Kati' : 'Middle Name'}
                    <Shield size={10} className="text-amber-500" />
                  </label>
                  <input 
                    id="middle_name"
                    type="text"
                    value={formData.middle_name}
                    onChange={(e) => setFormData({...formData, middle_name: e.target.value})}
                    className="w-full h-12 px-4 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="last_name" className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1">
                    {lang === 'sw' ? 'Jina la Mwisho' : 'Last Name'}
                    <Shield size={10} className="text-amber-500" />
                  </label>
                  <input 
                    id="last_name"
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                    className="w-full h-12 px-4 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="gender" className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1">
                    {lang === 'sw' ? 'Jinsia' : 'Gender'}
                    <Shield size={10} className="text-amber-500" />
                  </label>
                  <select 
                    id="gender"
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    className="w-full h-12 px-4 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                  >
                    <option value="">{lang === 'sw' ? 'Chagua' : 'Select'}</option>
                    <option value="Me">{lang === 'sw' ? 'Mwanaume' : 'Male'}</option>
                    <option value="Ke">{lang === 'sw' ? 'Mwanamke' : 'Female'}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="nationality" className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1">
                    {lang === 'sw' ? 'Uraia' : 'Nationality'}
                    <Shield size={10} className="text-amber-500" />
                  </label>
                  <input 
                    id="nationality"
                    type="text"
                    value={formData.nationality}
                    onChange={(e) => setFormData({...formData, nationality: e.target.value})}
                    className="w-full h-12 px-4 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                    {lang === 'sw' ? 'Namba ya Simu' : 'Phone Number'}
                  </label>
                  <input 
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full h-12 px-4 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="nida_number" className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1">
                    {lang === 'sw' ? 'Namba ya NIDA' : 'NIDA Number'}
                    <Shield size={10} className="text-amber-500" />
                  </label>
                  <input 
                    id="nida_number"
                    type="text"
                    value={formData.nida_number}
                    onChange={(e) => setFormData({...formData, nida_number: e.target.value})}
                    placeholder="XXXX-XXXX-XXXX-XXXX-XXXX"
                    className="w-full h-12 px-4 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all font-medium font-mono"
                  />
                  <p className="text-xs text-stone-400">
                    {lang === 'sw' ? 'Mabadiliko ya NIDA yanahitaji idhini ya mtumishi' : 'NIDA changes require staff approval'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <InfoItem label={lang === 'sw' ? 'Jina Kamili' : 'Full Name'} value={`${user.first_name} ${user.middle_name || ''} ${user.last_name}`} />
                <InfoItem label={lang === 'sw' ? 'Jinsia' : 'Gender'} value={user.gender ? (user.gender === 'Me' ? (lang === 'sw' ? 'Mwanaume' : 'Male') : (lang === 'sw' ? 'Mwanamke' : 'Female')) : '-'} />
                <InfoItem label={lang === 'sw' ? 'Uraia' : 'Nationality'} value={user.nationality || '-'} />
                {/* Show NIDA or Alternative ID */}
                {user.nida_number ? (
                  <div className="space-y-1 col-span-1 md:col-span-2 lg:col-span-1">
                    <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">{lang === 'sw' ? 'Namba ya NIDA' : 'NIDA Number'}</p>
                    <p className="text-stone-800 font-bold text-lg font-mono bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200">
                      {/* Format NIDA with dashes for display: XXXX-XXXX-XXXX-XXXX-XXXX */}
                      {user.nida_number.replace(/-/g, '').match(/.{1,4}/g)?.join('-') || user.nida_number}
                    </p>
                  </div>
                ) : user.id_type && user.id_number ? (
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
                  <InfoItem label={lang === 'sw' ? 'Namba ya NIDA' : 'NIDA Number'} value="-" />
                )}
                <InfoItem label={lang === 'sw' ? 'Barua Pepe' : 'Email Address'} value={user.email || '-'} />
                <InfoItem label={lang === 'sw' ? 'Namba ya Simu' : 'Phone Number'} value={user.phone || '-'} />
              </div>
            )}
          </section>

          {/* Location / Office Information */}
          <section className="space-y-6">
            <h3 className="text-xl font-bold text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-4">
              <MapPin size={20} className="text-emerald-600" />
              {user.role === 'citizen' ? (lang === 'sw' ? 'Mahali Unapoishi' : 'Residential Information') : (lang === 'sw' ? 'Taarifa za Kazi' : 'Work Information')}
            </h3>
            
            {isEditing && user.role === 'citizen' ? (
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
                    className="w-full h-12 px-4 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all font-medium disabled:opacity-50"
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
                    className="w-full h-12 px-4 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all font-medium disabled:opacity-50"
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
                {user.role === 'citizen' ? (
                  <>
                    <InfoItem label={lang === 'sw' ? 'Mkoa' : 'Region'} value={user.region || '-'} />
                    <InfoItem label={lang === 'sw' ? 'Wilaya' : 'District'} value={user.district || '-'} />
                    <InfoItem label={lang === 'sw' ? 'Kata' : 'Ward'} value={user.ward || '-'} />
                    <InfoItem label={lang === 'sw' ? 'Mtaa' : 'Street'} value={user.street || '-'} />
                    {user.is_diaspora && (
                      <>
                        <InfoItem label={lang === 'sw' ? 'Nchi Unapoishi' : 'Country of Residence'} value={user.country_of_residence || '-'} />
                        <InfoItem label={lang === 'sw' ? 'Namba ya Pasipoti' : 'Passport Number'} value={user.passport_number || '-'} />
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <InfoItem label={lang === 'sw' ? 'Mkoa wa Kazi' : 'Assigned Region'} value={user.assigned_region || '-'} />
                    <InfoItem label={lang === 'sw' ? 'Wilaya ya Kazi' : 'Assigned District'} value={user.assigned_district || '-'} />
                    <InfoItem label={lang === 'sw' ? 'ID ya Ofisi' : 'Office ID'} value={user.office_id || '-'} />
                  </>
                )}
              </div>
            )}
          </section>

          <div className="pt-8 flex flex-col sm:flex-row gap-4">
            {isEditing ? (
              <>
                <button 
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  {lang === 'sw' ? 'Hifadhi Mabadiliko' : 'Save Changes'}
                </button>
                <button 
                  onClick={() => {
                    setIsEditing(false);
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
                  }}
                  className="bg-stone-100 text-stone-600 px-8 py-3 rounded-xl font-bold hover:bg-stone-200 transition-all flex items-center justify-center gap-2"
                >
                  <X size={18} />
                  {lang === 'sw' ? 'Ghairi' : 'Cancel'}
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => setIsEditing(true)}
                  className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 flex items-center justify-center gap-2"
                >
                  <Edit2 size={18} />
                  {lang === 'sw' ? 'Hariri Wasifu' : 'Edit Profile'}
                </button>
                <button 
                  onClick={signOut}
                  className="bg-stone-100 text-stone-600 px-8 py-3 rounded-xl font-bold hover:bg-stone-200 transition-all flex items-center justify-center gap-2"
                >
                  <LogOut size={18} />
                  {lang === 'sw' ? 'Ondoka' : 'Sign Out'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
