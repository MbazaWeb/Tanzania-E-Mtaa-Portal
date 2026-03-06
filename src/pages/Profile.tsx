import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  CheckCircle2, 
  Building2, 
  MapPin, 
  RefreshCw, 
  LogOut,
  Camera,
  Loader2,
  Upload
} from 'lucide-react';
import { supabase } from '@/src/lib/supabase';
import { useAuth } from '@/src/context/AuthContext';
import { useLanguage } from '@/src/context/LanguageContext';
import { useToast } from '@/src/context/ToastContext';
import { InfoItem } from '@/src/components/ui/InfoItem';

export function Profile() {
  const { user, signOut } = useAuth();
  const { lang } = useLanguage();
  const { showToast } = useToast();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // In a real app, we would upload to Supabase Storage
      // For this demo, we'll simulate the upload and update the user profile
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        
        const { error } = await supabase
          .from('users')
          .update({ photo_url: base64data })
          .eq('id', user.id);

        if (error) throw error;

        // If citizen, also "upload to documents"
        if (user.role === 'citizen') {
          console.log('Profile picture also saved to citizen documents');
          // In a real app, we'd insert into a 'documents' table
        }

        showToast(lang === 'sw' ? 'Picha imepakiwa kikamilifu!' : 'Profile picture uploaded successfully!', 'success');
        setTimeout(() => window.location.reload(), 1500); // Refresh after toast
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading photo:', error);
      showToast(lang === 'sw' ? 'Hitilafu imetokea wakati wa kupakia.' : 'Error occurred during upload.', 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div 
      key="profile"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <div className="bg-white rounded-[32px] border border-stone-100 shadow-xl overflow-hidden">
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
          <Building2 className="absolute right-[-40px] bottom-[-40px] h-64 w-64 text-white/10 rotate-12" />
        </div>

        <div className="p-8 md:p-12 space-y-12">
          {/* Personal Information */}
          <section className="space-y-6">
            <h3 className="text-xl font-bold text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-4">
              <User size={20} className="text-emerald-600" />
              {lang === 'sw' ? 'Taarifa Binafsi' : 'Personal Information'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <InfoItem label={lang === 'sw' ? 'Jina Kamili' : 'Full Name'} value={`${user.first_name} ${user.middle_name || ''} ${user.last_name}`} />
              <InfoItem label={lang === 'sw' ? 'Jinsia' : 'Gender'} value={user.gender ? (user.gender === 'Me' ? (lang === 'sw' ? 'Mwanaume' : 'Male') : (lang === 'sw' ? 'Mwanamke' : 'Female')) : '-'} />
              <InfoItem label={lang === 'sw' ? 'Uraia' : 'Nationality'} value={user.nationality || '-'} />
              <InfoItem label={lang === 'sw' ? 'Namba ya NIDA' : 'NIDA Number'} value={user.nida_number || '-'} />
              <InfoItem label={lang === 'sw' ? 'Barua Pepe' : 'Email Address'} value={user.email || '-'} />
              <InfoItem label={lang === 'sw' ? 'Namba ya Simu' : 'Phone Number'} value={user.phone || '-'} />
            </div>
          </section>

          {/* Location / Office Information */}
          <section className="space-y-6">
            <h3 className="text-xl font-bold text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-4">
              <MapPin size={20} className="text-emerald-600" />
              {user.role === 'citizen' ? (lang === 'sw' ? 'Mahali Unapoishi' : 'Residential Information') : (lang === 'sw' ? 'Taarifa za Kazi' : 'Work Information')}
            </h3>
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
          </section>

          <div className="pt-8 flex flex-col sm:flex-row gap-4">
            <button className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 flex items-center justify-center gap-2">
              <RefreshCw size={18} />
              {lang === 'sw' ? 'Hariri Wasifu' : 'Edit Profile'}
            </button>
            <button 
              onClick={signOut}
              className="bg-stone-100 text-stone-600 px-8 py-3 rounded-xl font-bold hover:bg-stone-200 transition-all flex items-center justify-center gap-2"
            >
              <LogOut size={18} />
              {lang === 'sw' ? 'Ondoka' : 'Sign Out'}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
