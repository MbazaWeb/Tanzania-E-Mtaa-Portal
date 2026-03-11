import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2,
  Store,
  Home,
  Users,
  FileText,
  Upload,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  X,
  Camera,
  Plus,
  Edit2,
  ChevronDown,
  Shield,
  Award,
  MapPin,
  Phone,
  Mail,
  Briefcase,
  Calendar,
  IdCard,
  Eye,
  XCircle,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/src/lib/supabase';
import { useAuth } from '@/src/context/AuthContext';
import { useLanguage } from '@/src/context/LanguageContext';
import { useToast } from '@/src/context/ToastContext';
import { TANZANIA_ADDRESS_DATA } from '@/src/lib/addressData';

// Business type definitions
type BusinessType = 'seller' | 'landlord' | 'broker';
type RegistrationStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

interface BusinessRegistration {
  id: string;
  user_id: string;
  business_type: BusinessType;
  business_id: string | null;
  business_name: string;
  description: string;
  experience_years: number;
  specialization: string;
  region: string;
  district: string;
  ward: string;
  street: string;
  phone: string;
  alt_phone: string | null;
  email: string;
  id_document_url: string | null;
  proof_document_url: string | null;
  photo_url: string | null;
  status: RegistrationStatus;
  rejection_reason: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

const BUSINESS_TYPES: { value: BusinessType; labelSw: string; labelEn: string; icon: React.ElementType; color: string; description: { sw: string; en: string } }[] = [
  { 
    value: 'seller', 
    labelSw: 'Muuzaji', 
    labelEn: 'Seller',
    icon: Store,
    color: 'from-blue-500 to-blue-600',
    description: {
      sw: 'Jiandikishe kama muuzaji wa mali, magari, au bidhaa nyingine',
      en: 'Register as a seller of property, vehicles, or other goods'
    }
  },
  { 
    value: 'landlord', 
    labelSw: 'Mpangishaji', 
    labelEn: 'Landlord',
    icon: Home,
    color: 'from-emerald-500 to-emerald-600',
    description: {
      sw: 'Jiandikishe kama mpangishaji wa nyumba, vyumba, au mali nyingine',
      en: 'Register as a landlord for houses, rooms, or other properties'
    }
  },
  { 
    value: 'broker', 
    labelSw: 'Dalali', 
    labelEn: 'Broker',
    icon: Users,
    color: 'from-purple-500 to-purple-600',
    description: {
      sw: 'Jiandikishe kama dalali wa mali isiyohamishika',
      en: 'Register as a real estate broker'
    }
  }
];

const SPECIALIZATIONS: { [key in BusinessType]: { value: string; labelSw: string; labelEn: string }[] } = {
  seller: [
    { value: 'property', labelSw: 'Mali Isiyohamishika', labelEn: 'Real Estate' },
    { value: 'vehicles', labelSw: 'Magari', labelEn: 'Vehicles' },
    { value: 'land', labelSw: 'Ardhi/Viwanja', labelEn: 'Land/Plots' },
    { value: 'general', labelSw: 'Bidhaa Mchanganyiko', labelEn: 'General Goods' }
  ],
  landlord: [
    { value: 'residential', labelSw: 'Nyumba za Kuishi', labelEn: 'Residential Houses' },
    { value: 'rooms', labelSw: 'Vyumba', labelEn: 'Rooms' },
    { value: 'commercial', labelSw: 'Maduka/Ofisi', labelEn: 'Shops/Offices' },
    { value: 'warehouse', labelSw: 'Maghala', labelEn: 'Warehouses' },
    { value: 'land_rent', labelSw: 'Ardhi ya Kukodisha', labelEn: 'Land for Rent' }
  ],
  broker: [
    { value: 'property_broker', labelSw: 'Mali Isiyohamishika', labelEn: 'Real Estate' },
    { value: 'vehicle_broker', labelSw: 'Magari', labelEn: 'Vehicles' },
    { value: 'land_broker', labelSw: 'Ardhi', labelEn: 'Land' },
    { value: 'general_broker', labelSw: 'Dalali wa Jumla', labelEn: 'General Broker' }
  ]
};

export const BusinessRegistration: React.FC = () => {
  const { user, userProfile } = useAuth();
  const { lang } = useLanguage();
  const { showToast } = useToast();

  const [registrations, setRegistrations] = useState<BusinessRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedType, setSelectedType] = useState<BusinessType | null>(null);
  const [viewingRegistration, setViewingRegistration] = useState<BusinessRegistration | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    business_name: '',
    description: '',
    experience_years: 0,
    specialization: '',
    region: userProfile?.region || '',
    district: userProfile?.district || '',
    ward: userProfile?.ward || '',
    street: userProfile?.street || '',
    phone: userProfile?.phone || '',
    alt_phone: '',
    email: userProfile?.email || ''
  });

  // File uploads
  const [idDocument, setIdDocument] = useState<File | null>(null);
  const [proofDocument, setProofDocument] = useState<File | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  const idDocRef = useRef<HTMLInputElement>(null);
  const proofDocRef = useRef<HTMLInputElement>(null);
  const photoRef = useRef<HTMLInputElement>(null);

  // Fetch existing registrations
  useEffect(() => {
    fetchRegistrations();
  }, [user]);

  const fetchRegistrations = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('business_registrations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRegistrations(data || []);
    } catch (error) {
      console.error('Error fetching registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get districts for selected region
  const getDistricts = () => {
    if (!formData.region) return [];
    const regionData = TANZANIA_ADDRESS_DATA.find(r => r.name === formData.region);
    return regionData?.districts.map(d => d.name) || [];
  };

  // Get wards for selected district
  const getWards = () => {
    if (!formData.region || !formData.district) return [];
    const regionData = TANZANIA_ADDRESS_DATA.find(r => r.name === formData.region);
    const districtData = regionData?.districts.find(d => d.name === formData.district);
    return districtData?.wards || [];
  };

  // Handle file upload to Supabase storage
  const uploadFile = async (file: File, folder: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${folder}/${user?.id}_${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('business-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('business-documents')
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      return null;
    }
  };

  // Submit registration
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !selectedType) return;

    // Validation
    if (!formData.business_name.trim()) {
      showToast(lang === 'sw' ? 'Tafadhali ingiza jina la biashara' : 'Please enter business name', 'error');
      return;
    }

    if (!formData.specialization) {
      showToast(lang === 'sw' ? 'Tafadhali chagua utaalamu' : 'Please select specialization', 'error');
      return;
    }

    if (!idDocument) {
      showToast(lang === 'sw' ? 'Tafadhali pakia kitambulisho' : 'Please upload ID document', 'error');
      return;
    }

    setSubmitting(true);
    setUploadingFiles(true);

    try {
      // Upload files
      let idDocUrl = null;
      let proofDocUrl = null;
      let photoUrl = null;

      if (idDocument) {
        idDocUrl = await uploadFile(idDocument, 'id-documents');
      }
      if (proofDocument) {
        proofDocUrl = await uploadFile(proofDocument, 'proof-documents');
      }
      if (photo) {
        photoUrl = await uploadFile(photo, 'photos');
      }

      setUploadingFiles(false);

      // Create registration
      const { error } = await supabase
        .from('business_registrations')
        .insert({
          user_id: user.id,
          business_type: selectedType,
          business_name: formData.business_name,
          description: formData.description,
          experience_years: formData.experience_years,
          specialization: formData.specialization,
          region: formData.region,
          district: formData.district,
          ward: formData.ward,
          street: formData.street,
          phone: formData.phone,
          alt_phone: formData.alt_phone || null,
          email: formData.email,
          id_document_url: idDocUrl,
          proof_document_url: proofDocUrl,
          photo_url: photoUrl,
          status: 'pending'
        });

      if (error) throw error;

      showToast(
        lang === 'sw' 
          ? 'Usajili umefanikiwa! Subiri uthibitisho wa afisa.' 
          : 'Registration successful! Wait for officer verification.',
        'success'
      );

      // Reset form
      setShowForm(false);
      setSelectedType(null);
      setFormData({
        business_name: '',
        description: '',
        experience_years: 0,
        specialization: '',
        region: userProfile?.region || '',
        district: userProfile?.district || '',
        ward: userProfile?.ward || '',
        street: userProfile?.street || '',
        phone: userProfile?.phone || '',
        alt_phone: '',
        email: userProfile?.email || ''
      });
      setIdDocument(null);
      setProofDocument(null);
      setPhoto(null);

      // Refresh registrations
      fetchRegistrations();

    } catch (error) {
      console.error('Registration error:', error);
      showToast(
        lang === 'sw' ? 'Hitilafu imetokea. Jaribu tena.' : 'An error occurred. Please try again.',
        'error'
      );
    } finally {
      setSubmitting(false);
      setUploadingFiles(false);
    }
  };

  // Get status badge
  const getStatusBadge = (status: RegistrationStatus) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      suspended: 'bg-gray-100 text-gray-800 border-gray-200'
    };

    const icons = {
      pending: <Clock className="w-4 h-4" />,
      approved: <CheckCircle2 className="w-4 h-4" />,
      rejected: <XCircle className="w-4 h-4" />,
      suspended: <AlertCircle className="w-4 h-4" />
    };

    const labels = {
      pending: { sw: 'Inasubiri', en: 'Pending' },
      approved: { sw: 'Imeidhinishwa', en: 'Approved' },
      rejected: { sw: 'Imekataliwa', en: 'Rejected' },
      suspended: { sw: 'Imesimamishwa', en: 'Suspended' }
    };

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${styles[status]}`}>
        {icons[status]}
        {labels[status][lang === 'sw' ? 'sw' : 'en']}
      </span>
    );
  };

  // Check if user already has a registration of this type
  const hasRegistration = (type: BusinessType) => {
    return registrations.some(r => r.business_type === type && r.status !== 'rejected');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {lang === 'sw' ? 'Usajili wa Biashara' : 'Business Registration'}
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {lang === 'sw' 
              ? 'Jiandikishe kama Muuzaji, Mpangishaji, au Dalali ili kupata kitambulisho rasmi cha biashara'
              : 'Register as a Seller, Landlord, or Broker to get an official business ID'}
          </p>
        </motion.div>

        {/* Existing Registrations */}
        {registrations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              {lang === 'sw' ? 'Usajili Wako' : 'Your Registrations'}
            </h2>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {registrations.map((reg) => {
                const typeInfo = BUSINESS_TYPES.find(t => t.value === reg.business_type);
                const TypeIcon = typeInfo?.icon || Building2;
                
                return (
                  <motion.div
                    key={reg.id}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden cursor-pointer"
                    onClick={() => setViewingRegistration(reg)}
                  >
                    <div className={`h-2 bg-gradient-to-r ${typeInfo?.color || 'from-gray-500 to-gray-600'}`} />
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-gradient-to-br ${typeInfo?.color || 'from-gray-500 to-gray-600'}`}>
                            <TypeIcon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {lang === 'sw' ? typeInfo?.labelSw : typeInfo?.labelEn}
                            </h3>
                            <p className="text-sm text-gray-500">{reg.business_name}</p>
                          </div>
                        </div>
                        {getStatusBadge(reg.status)}
                      </div>
                      
                      {reg.business_id && (
                        <div className="mt-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                          <p className="text-xs text-emerald-600 font-medium mb-1">
                            {lang === 'sw' ? 'Namba ya Biashara' : 'Business ID'}
                          </p>
                          <p className="text-lg font-bold text-emerald-700 font-mono">
                            {reg.business_id}
                          </p>
                        </div>
                      )}
                      
                      {reg.status === 'rejected' && reg.rejection_reason && (
                        <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                          <p className="text-xs text-red-600 font-medium mb-1">
                            {lang === 'sw' ? 'Sababu ya Kukataliwa' : 'Rejection Reason'}
                          </p>
                          <p className="text-sm text-red-700">{reg.rejection_reason}</p>
                        </div>
                      )}
                      
                      <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        {new Date(reg.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* New Registration Section */}
        {!showForm ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-600" />
              {lang === 'sw' ? 'Usajili Mpya' : 'New Registration'}
            </h2>
            
            <div className="grid gap-6 md:grid-cols-3">
              {BUSINESS_TYPES.map((type) => {
                const Icon = type.icon;
                const alreadyRegistered = hasRegistration(type.value);
                
                return (
                  <motion.button
                    key={type.value}
                    whileHover={{ scale: alreadyRegistered ? 1 : 1.03 }}
                    whileTap={{ scale: alreadyRegistered ? 1 : 0.98 }}
                    disabled={alreadyRegistered}
                    onClick={() => {
                      setSelectedType(type.value);
                      setShowForm(true);
                    }}
                    className={`relative p-6 rounded-2xl text-left transition-all ${
                      alreadyRegistered 
                        ? 'bg-gray-100 cursor-not-allowed opacity-60'
                        : 'bg-white hover:shadow-lg border border-gray-200 hover:border-transparent'
                    }`}
                  >
                    {alreadyRegistered && (
                      <div className="absolute top-3 right-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      </div>
                    )}
                    
                    <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${type.color} mb-4`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {lang === 'sw' ? type.labelSw : type.labelEn}
                    </h3>
                    
                    <p className="text-sm text-gray-600">
                      {type.description[lang === 'sw' ? 'sw' : 'en']}
                    </p>
                    
                    {alreadyRegistered && (
                      <p className="mt-3 text-xs text-green-600 font-medium">
                        {lang === 'sw' ? 'Tayari umesajiliwa' : 'Already registered'}
                      </p>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        ) : (
          /* Registration Form */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
          >
            {/* Form Header */}
            <div className={`p-6 bg-gradient-to-r ${BUSINESS_TYPES.find(t => t.value === selectedType)?.color || 'from-gray-500 to-gray-600'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {(() => {
                    const TypeIcon = BUSINESS_TYPES.find(t => t.value === selectedType)?.icon || Building2;
                    return <TypeIcon className="w-8 h-8 text-white" />;
                  })()}
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {lang === 'sw' ? 'Usajili wa ' : 'Register as '}
                      {lang === 'sw' 
                        ? BUSINESS_TYPES.find(t => t.value === selectedType)?.labelSw 
                        : BUSINESS_TYPES.find(t => t.value === selectedType)?.labelEn}
                    </h2>
                    <p className="text-white/80 text-sm">
                      {lang === 'sw' ? 'Jaza fomu ifuatayo' : 'Fill in the form below'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setSelectedType(null);
                  }}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Business Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-emerald-600" />
                  {lang === 'sw' ? 'Taarifa za Biashara' : 'Business Information'}
                </h3>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {lang === 'sw' ? 'Jina la Biashara' : 'Business Name'} *
                    </label>
                    <input
                      type="text"
                      value={formData.business_name}
                      onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder={lang === 'sw' ? 'Mfano: Juma Properties' : 'E.g., Juma Properties'}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {lang === 'sw' ? 'Utaalamu' : 'Specialization'} *
                    </label>
                    <select
                      value={formData.specialization}
                      onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      required
                    >
                      <option value="">{lang === 'sw' ? '-- Chagua --' : '-- Select --'}</option>
                      {selectedType && SPECIALIZATIONS[selectedType].map((spec) => (
                        <option key={spec.value} value={spec.value}>
                          {lang === 'sw' ? spec.labelSw : spec.labelEn}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {lang === 'sw' ? 'Miaka ya Uzoefu' : 'Years of Experience'}
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={formData.experience_years}
                      onChange={(e) => setFormData({ ...formData, experience_years: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {lang === 'sw' ? 'Maelezo ya Biashara' : 'Business Description'}
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                    placeholder={lang === 'sw' 
                      ? 'Elezea biashara yako kwa ufupi...' 
                      : 'Briefly describe your business...'}
                  />
                </div>
              </div>

              {/* Location Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-emerald-600" />
                  {lang === 'sw' ? 'Mahali pa Biashara' : 'Business Location'}
                </h3>
                
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {lang === 'sw' ? 'Mkoa' : 'Region'} *
                    </label>
                    <select
                      value={formData.region}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        region: e.target.value,
                        district: '',
                        ward: ''
                      })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      required
                    >
                      <option value="">{lang === 'sw' ? '-- Chagua --' : '-- Select --'}</option>
                      {TANZANIA_ADDRESS_DATA.map((region) => (
                        <option key={region.name} value={region.name}>
                          {region.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {lang === 'sw' ? 'Wilaya' : 'District'} *
                    </label>
                    <select
                      value={formData.district}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        district: e.target.value,
                        ward: ''
                      })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      required
                      disabled={!formData.region}
                    >
                      <option value="">{lang === 'sw' ? '-- Chagua --' : '-- Select --'}</option>
                      {getDistricts().map((district) => (
                        <option key={district} value={district}>
                          {district}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {lang === 'sw' ? 'Kata' : 'Ward'} *
                    </label>
                    <select
                      value={formData.ward}
                      onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      required
                      disabled={!formData.district}
                    >
                      <option value="">{lang === 'sw' ? '-- Chagua --' : '-- Select --'}</option>
                      {getWards().map((ward) => (
                        <option key={ward} value={ward}>
                          {ward}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {lang === 'sw' ? 'Mtaa' : 'Street'}
                    </label>
                    <input
                      type="text"
                      value={formData.street}
                      onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-emerald-600" />
                  {lang === 'sw' ? 'Mawasiliano' : 'Contact Information'}
                </h3>
                
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {lang === 'sw' ? 'Simu' : 'Phone'} *
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="0712345678"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {lang === 'sw' ? 'Simu Mbadala' : 'Alternative Phone'}
                    </label>
                    <input
                      type="tel"
                      value={formData.alt_phone}
                      onChange={(e) => setFormData({ ...formData, alt_phone: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {lang === 'sw' ? 'Barua pepe' : 'Email'} *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Document Uploads */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-600" />
                  {lang === 'sw' ? 'Nyaraka' : 'Documents'}
                </h3>
                
                <div className="grid gap-4 md:grid-cols-3">
                  {/* ID Document */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {lang === 'sw' ? 'Kitambulisho (NIDA/Passport)' : 'ID Document (NIDA/Passport)'} *
                    </label>
                    <input
                      ref={idDocRef}
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => setIdDocument(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => idDocRef.current?.click()}
                      className={`w-full p-4 border-2 border-dashed rounded-xl transition-colors ${
                        idDocument 
                          ? 'border-emerald-400 bg-emerald-50' 
                          : 'border-gray-300 hover:border-emerald-400'
                      }`}
                    >
                      {idDocument ? (
                        <div className="flex items-center gap-2 text-emerald-700">
                          <CheckCircle2 className="w-5 h-5" />
                          <span className="text-sm truncate">{idDocument.name}</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-gray-500">
                          <Upload className="w-6 h-6" />
                          <span className="text-sm">{lang === 'sw' ? 'Pakia Faili' : 'Upload File'}</span>
                        </div>
                      )}
                    </button>
                  </div>

                  {/* Proof Document */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {lang === 'sw' ? 'Leseni ya Biashara/TIN' : 'Business License/TIN'}
                    </label>
                    <input
                      ref={proofDocRef}
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => setProofDocument(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => proofDocRef.current?.click()}
                      className={`w-full p-4 border-2 border-dashed rounded-xl transition-colors ${
                        proofDocument 
                          ? 'border-emerald-400 bg-emerald-50' 
                          : 'border-gray-300 hover:border-emerald-400'
                      }`}
                    >
                      {proofDocument ? (
                        <div className="flex items-center gap-2 text-emerald-700">
                          <CheckCircle2 className="w-5 h-5" />
                          <span className="text-sm truncate">{proofDocument.name}</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-gray-500">
                          <Upload className="w-6 h-6" />
                          <span className="text-sm">{lang === 'sw' ? 'Pakia Faili' : 'Upload File'}</span>
                        </div>
                      )}
                    </button>
                  </div>

                  {/* Photo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {lang === 'sw' ? 'Picha ya Uso' : 'Profile Photo'}
                    </label>
                    <input
                      ref={photoRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => photoRef.current?.click()}
                      className={`w-full p-4 border-2 border-dashed rounded-xl transition-colors ${
                        photo 
                          ? 'border-emerald-400 bg-emerald-50' 
                          : 'border-gray-300 hover:border-emerald-400'
                      }`}
                    >
                      {photo ? (
                        <div className="flex items-center gap-2 text-emerald-700">
                          <CheckCircle2 className="w-5 h-5" />
                          <span className="text-sm truncate">{photo.name}</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-gray-500">
                          <Camera className="w-6 h-6" />
                          <span className="text-sm">{lang === 'sw' ? 'Pakia Picha' : 'Upload Photo'}</span>
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-end gap-4 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setSelectedType(null);
                  }}
                  className="px-6 py-2.5 text-gray-700 hover:text-gray-900 font-medium"
                  disabled={submitting}
                >
                  {lang === 'sw' ? 'Ghairi' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {uploadingFiles 
                        ? (lang === 'sw' ? 'Inapakia nyaraka...' : 'Uploading documents...') 
                        : (lang === 'sw' ? 'Inatuma...' : 'Submitting...')}
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5" />
                      {lang === 'sw' ? 'Tuma Usajili' : 'Submit Registration'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* View Registration Modal */}
        <AnimatePresence>
          {viewingRegistration && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
              onClick={() => setViewingRegistration(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {(() => {
                  const typeInfo = BUSINESS_TYPES.find(t => t.value === viewingRegistration.business_type);
                  const TypeIcon = typeInfo?.icon || Building2;
                  
                  return (
                    <>
                      <div className={`p-6 bg-gradient-to-r ${typeInfo?.color || 'from-gray-500 to-gray-600'}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <TypeIcon className="w-8 h-8 text-white" />
                            <div>
                              <h2 className="text-xl font-bold text-white">
                                {viewingRegistration.business_name}
                              </h2>
                              <p className="text-white/80 text-sm">
                                {lang === 'sw' ? typeInfo?.labelSw : typeInfo?.labelEn}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => setViewingRegistration(null)}
                            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                          >
                            <X className="w-6 h-6 text-white" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="p-6 space-y-6">
                        {/* Business ID */}
                        {viewingRegistration.business_id && (
                          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
                            <p className="text-sm text-emerald-600 font-medium mb-1">
                              {lang === 'sw' ? 'Namba ya Biashara' : 'Business ID'}
                            </p>
                            <p className="text-2xl font-bold text-emerald-700 font-mono">
                              {viewingRegistration.business_id}
                            </p>
                          </div>
                        )}
                        
                        {/* Status */}
                        <div className="flex items-center justify-center">
                          {getStatusBadge(viewingRegistration.status)}
                        </div>
                        
                        {/* Details Grid */}
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <p className="text-sm text-gray-500">{lang === 'sw' ? 'Utaalamu' : 'Specialization'}</p>
                            <p className="font-medium text-gray-900">{viewingRegistration.specialization}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">{lang === 'sw' ? 'Miaka ya Uzoefu' : 'Experience'}</p>
                            <p className="font-medium text-gray-900">{viewingRegistration.experience_years} {lang === 'sw' ? 'miaka' : 'years'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">{lang === 'sw' ? 'Eneo' : 'Location'}</p>
                            <p className="font-medium text-gray-900">
                              {viewingRegistration.ward}, {viewingRegistration.district}, {viewingRegistration.region}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">{lang === 'sw' ? 'Simu' : 'Phone'}</p>
                            <p className="font-medium text-gray-900">{viewingRegistration.phone}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">{lang === 'sw' ? 'Barua pepe' : 'Email'}</p>
                            <p className="font-medium text-gray-900">{viewingRegistration.email}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">{lang === 'sw' ? 'Tarehe ya Usajili' : 'Registration Date'}</p>
                            <p className="font-medium text-gray-900">
                              {new Date(viewingRegistration.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        {viewingRegistration.description && (
                          <div>
                            <p className="text-sm text-gray-500 mb-1">{lang === 'sw' ? 'Maelezo' : 'Description'}</p>
                            <p className="text-gray-700">{viewingRegistration.description}</p>
                          </div>
                        )}
                        
                        {viewingRegistration.status === 'rejected' && viewingRegistration.rejection_reason && (
                          <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                            <p className="text-sm text-red-600 font-medium mb-1">
                              {lang === 'sw' ? 'Sababu ya Kukataliwa' : 'Rejection Reason'}
                            </p>
                            <p className="text-red-700">{viewingRegistration.rejection_reason}</p>
                          </div>
                        )}
                      </div>
                    </>
                  );
                })()}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default BusinessRegistration;
