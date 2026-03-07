import React, { useState } from "react";
import {
  ArrowLeft,
  QrCode,
  Upload,
  CheckCircle2,
  XCircle,
  Download,
  Search,
  Shield,
  Clock,
  FileText,
  User,
  MapPin,
  Calendar,
  CreditCard,
  Eye,
  EyeOff,
  ChevronDown,
  Fingerprint,
  Car,
  Plane,
  Baby,
  Vote,
  BadgeCheck,
  Wallet,
  Building2,
  Users,
  FileCheck
} from "lucide-react";
import { Language } from "@/src/lib/i18n";
import { useTranslation } from "@/src/lib/i18n";
import { supabase, UserRole } from "@/src/lib/supabase";
import { cn } from "@/src/lib/utils";

// Document types for verification
const DOCUMENT_TYPES = [
  { id: 'application', name: 'E-Mtaa Application', nameSw: 'Maombi ya E-Mtaa', icon: FileText, placeholder: 'TZ-20240115-XXXX' },
  { id: 'nida', name: 'NIDA (National ID)', nameSw: 'NIDA (Kitambulisho cha Taifa)', icon: Fingerprint, placeholder: '19850101-12345-00001-00' },
  { id: 'birth_certificate', name: 'Birth Certificate', nameSw: 'Cheti cha Kuzaliwa', icon: Baby, placeholder: 'BC-2024-123456' },
  { id: 'passport', name: 'Passport', nameSw: 'Pasipoti', icon: Plane, placeholder: 'AB1234567' },
  { id: 'voter_card', name: 'E-NEC (Voter Card)', nameSw: 'Kadi ya Mpiga Kura (E-NEC)', icon: Vote, placeholder: 'NEC-12345678' },
  { id: 'driving_license', name: 'Driving License', nameSw: 'Leseni ya Udereva', icon: Car, placeholder: 'DL-2024-00001234' },
  { id: 'zanzibar_mkazi', name: 'Zanzibar Mkazi ID', nameSw: 'Kitambulisho cha Mkazi Zanzibar', icon: BadgeCheck, placeholder: 'ZNZ-MKZ-123456' },
  { id: 'jamii_id', name: 'Jamii ID (Social ID)', nameSw: 'Kitambulisho cha Jamii', icon: Users, placeholder: 'JAMII-2024-12345' },
  { id: 'tin', name: 'TIN Number', nameSw: 'Namba ya TIN (Kodi)', icon: Wallet, placeholder: '123-456-789' },
  { id: 'business_license', name: 'Business License', nameSw: 'Leseni ya Biashara', icon: Building2, placeholder: 'BL-DAR-2024-00123' },
  { id: 'work_permit', name: 'Work Permit', nameSw: 'Kibali cha Kazi', icon: FileCheck, placeholder: 'WP-2024-00001234' },
  { id: 'residence_permit', name: 'Residence Permit', nameSw: 'Kibali cha Makazi', icon: MapPin, placeholder: 'RP-2024-00001234' },
  { id: 'professional_cert', name: 'Professional Certificate', nameSw: 'Cheti cha Kitaaluma', icon: BadgeCheck, placeholder: 'PROF-2024-12345' },
  { id: 'marriage_cert', name: 'Marriage Certificate', nameSw: 'Cheti cha Ndoa', icon: Users, placeholder: 'MC-2024-00001234' },
  { id: 'death_cert', name: 'Death Certificate', nameSw: 'Cheti cha Kifo', icon: FileText, placeholder: 'DC-2024-00001234' },
];

// Helper functions for masking sensitive data (partial view for citizens)
const maskName = (firstName?: string, lastName?: string): string => {
  if (!firstName && !lastName) return '***';
  const first = firstName ? firstName.charAt(0) + '***' : '';
  const last = lastName ? lastName.charAt(0) + '***' : '';
  return `${first} ${last}`.trim();
};

const maskNida = (nida?: string): string => {
  if (!nida) return '***';
  if (nida.length < 8) return '***' + nida.slice(-3);
  return nida.slice(0, 4) + '****' + nida.slice(-4);
};

const maskPhone = (phone?: string): string => {
  if (!phone) return '***';
  if (phone.length < 6) return '***';
  return phone.slice(0, 4) + '****' + phone.slice(-2);
};

interface VerifyDocumentsProps {
  lang: Language;
  onBack: () => void;
  userRole?: UserRole; // Optional - if not provided, defaults to public/citizen view
}

export function VerifyDocuments({
  lang,
  onBack,
  userRole = 'citizen', // Default to citizen (partial view)
}: VerifyDocumentsProps) {
  const t = useTranslation(lang);
  const [qrInput, setQrInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState("application");
  const [showDocTypeDropdown, setShowDocTypeDropdown] = useState(false);
  
  // Check if user has elevated privileges (admin or staff)
  const hasFullAccess = userRole === 'admin' || userRole === 'staff';
  const selectedDocument = DOCUMENT_TYPES.find(d => d.id === selectedDocType) || DOCUMENT_TYPES[0];
  const [verificationStatus, setVerificationStatus] = useState<
    "pending" | "verified" | "invalid" | null
  >(null);
  const [verifiedDocument, setVerifiedDocument] = useState<any>(null);

  const handleVerify = async () => {
    if (!qrInput.trim()) return;
    
    setLoading(true);
    setVerificationStatus("pending");

    try {
      // Handle different document types
      if (selectedDocType === 'application') {
        // Original E-Mtaa application verification
        await verifyEMtaaApplication();
      } else if (selectedDocType === 'nida') {
        // NIDA verification - search by NIDA number
        await verifyNIDA();
      } else {
        // Other government documents - simulate verification
        await verifyOtherDocument();
      }
    } catch (err) {
      setVerificationStatus("invalid");
    } finally {
      setLoading(false);
    }
  };

  // Verify E-Mtaa Application
  const verifyEMtaaApplication = async () => {
    // First try demo applications from localStorage
    const demoApps = JSON.parse(localStorage.getItem('demo_applications') || '[]');
    const demoApp = demoApps.find((app: any) => 
      app.application_number?.toUpperCase() === qrInput.trim().toUpperCase()
    );
    
    if (demoApp) {
      const demoUser = JSON.parse(localStorage.getItem('demo_user') || '{}');
      setVerificationStatus("verified");
      setVerifiedDocument({
        documentType: 'application',
        id: demoApp.id,
        type: demoApp.service_name,
        name: demoApp.service_name,
        issueDate: new Date(demoApp.updated_at || demoApp.created_at).toLocaleDateString(),
        issuedAt: demoApp.issued_at,
        verificationCode: demoApp.application_number,
        status: demoApp.status,
        applicantMasked: maskName(demoUser.first_name, demoUser.last_name),
        applicantFull: `${demoUser.first_name || ''} ${demoUser.middle_name || ''} ${demoUser.last_name || ''}`.trim(),
        nidaNumber: demoUser.nida_number,
        nidaMasked: maskNida(demoUser.nida_number),
        phone: demoUser.phone,
        phoneMasked: maskPhone(demoUser.phone),
        email: demoUser.email,
        region: demoApp.region || demoUser.region,
        district: demoApp.district || demoUser.district,
        ward: demoApp.ward || demoUser.ward,
        street: demoApp.street || demoUser.street,
        formData: demoApp.form_data,
        paidAt: demoApp.paid_at,
        serviceFee: demoApp.service_fee
      });
      return;
    }

    // Search Supabase
    const { data, error } = await supabase
      .from('applications')
      .select('*, users(*)')
      .eq('application_number', qrInput.trim().toUpperCase())
      .single();

    if (error || !data) {
      setVerificationStatus("invalid");
      setVerifiedDocument(null);
    } else {
      const user = data.users;
      setVerificationStatus("verified");
      setVerifiedDocument({
        documentType: 'application',
        id: data.id,
        type: data.service_name,
        name: data.service_name,
        issueDate: new Date(data.updated_at || data.created_at).toLocaleDateString(),
        issuedAt: data.issued_at,
        verificationCode: data.application_number,
        status: data.status,
        applicantMasked: maskName(user?.first_name, user?.last_name),
        applicantFull: `${user?.first_name || ''} ${user?.middle_name || ''} ${user?.last_name || ''}`.trim(),
        nidaNumber: user?.nida_number,
        nidaMasked: maskNida(user?.nida_number),
        phone: user?.phone,
        phoneMasked: maskPhone(user?.phone),
        email: user?.email,
        region: data.region || user?.region,
        district: data.district || user?.district,
        ward: data.ward || user?.ward,
        street: data.street || user?.street,
        formData: data.form_data,
        paidAt: data.paid_at,
        serviceFee: data.service_fee
      });
    }
  };

  // Verify NIDA number
  const verifyNIDA = async () => {
    // First check demo user
    const demoUser = JSON.parse(localStorage.getItem('demo_user') || '{}');
    if (demoUser.nida_number && demoUser.nida_number.toUpperCase() === qrInput.trim().toUpperCase()) {
      setVerificationStatus("verified");
      setVerifiedDocument({
        documentType: 'nida',
        type: lang === 'sw' ? 'Kitambulisho cha Taifa (NIDA)' : 'National ID (NIDA)',
        name: lang === 'sw' ? 'NIDA' : 'National ID',
        issueDate: '01/01/2020', // NIDA issue date
        expiryDate: '01/01/2030', // NIDA typically valid for 10 years
        verificationCode: qrInput.trim().toUpperCase(),
        status: 'valid',
        applicantMasked: maskName(demoUser.first_name, demoUser.last_name),
        applicantFull: `${demoUser.first_name || ''} ${demoUser.middle_name || ''} ${demoUser.last_name || ''}`.trim(),
        nidaNumber: demoUser.nida_number,
        nidaMasked: maskNida(demoUser.nida_number),
        phone: demoUser.phone,
        phoneMasked: maskPhone(demoUser.phone),
        email: demoUser.email,
        region: demoUser.region,
        district: demoUser.district,
        ward: demoUser.ward,
        street: demoUser.street,
        dateOfBirth: demoUser.date_of_birth,
        gender: demoUser.gender
      });
      return;
    }

    // Search Supabase users by NIDA
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('nida_number', qrInput.trim().toUpperCase())
      .single();

    if (error || !data) {
      setVerificationStatus("invalid");
      setVerifiedDocument(null);
    } else {
      setVerificationStatus("verified");
      setVerifiedDocument({
        documentType: 'nida',
        type: lang === 'sw' ? 'Kitambulisho cha Taifa (NIDA)' : 'National ID (NIDA)',
        name: lang === 'sw' ? 'NIDA' : 'National ID',
        issueDate: new Date(data.created_at).toLocaleDateString(),
        verificationCode: data.nida_number,
        status: 'valid',
        applicantMasked: maskName(data.first_name, data.last_name),
        applicantFull: `${data.first_name || ''} ${data.middle_name || ''} ${data.last_name || ''}`.trim(),
        nidaNumber: data.nida_number,
        nidaMasked: maskNida(data.nida_number),
        phone: data.phone,
        phoneMasked: maskPhone(data.phone),
        email: data.email,
        region: data.region,
        district: data.district,
        ward: data.ward,
        street: data.street,
        dateOfBirth: data.date_of_birth,
        gender: data.gender
      });
    }
  };

  // Verify other government documents (simulated)
  const verifyOtherDocument = async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const docType = DOCUMENT_TYPES.find(d => d.id === selectedDocType);
    
    // For demo purposes, generate a simulated response
    // In production, this would call actual government APIs
    const inputUpper = qrInput.trim().toUpperCase();
    
    // Check if input matches expected format (basic validation)
    const isValidFormat = inputUpper.length >= 5;
    
    if (!isValidFormat) {
      setVerificationStatus("invalid");
      setVerifiedDocument(null);
      return;
    }

    // Simulate successful verification for demo
    setVerificationStatus("verified");
    setVerifiedDocument({
      documentType: selectedDocType,
      type: lang === 'sw' ? docType?.nameSw : docType?.name,
      name: docType?.name || 'Unknown Document',
      issueDate: new Date(Date.now() - Math.random() * 31536000000 * 5).toLocaleDateString(), // Random date within 5 years
      verificationCode: inputUpper,
      status: 'valid',
      applicantMasked: 'J*** M***',
      applicantFull: 'John Mwangi Doe',
      nidaNumber: '19850101-12345-00001-00',
      nidaMasked: maskNida('19850101-12345-00001-00'),
      phone: '+255754123456',
      phoneMasked: maskPhone('+255754123456'),
      region: 'Dar es Salaam',
      district: 'Kinondoni',
      ward: 'Mikocheni',
      isSimulated: true // Flag to indicate this is simulated data
    });
  };

  return (

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="h-10 w-10 rounded-xl border border-stone-200 flex items-center justify-center hover:bg-stone-50 transition-all shadow-sm"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5 text-stone-600" />
        </button>
        <div>
          <h1 className="text-3xl font-heading font-extrabold text-stone-900">
            {lang === "sw" ? "Akikidi Nyaraka" : "Verify Documents"}
          </h1>
          <p className="text-stone-500">
            {lang === "sw"
              ? "Hakiki ukweli wa nyaraka za serikali kwa kutumia QR kodi au namba ya uhakiki"
              : "Verify government documents authenticity using QR code or verification number"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Verification Methods */}
        <div className="space-y-6">
          <h2 className="text-xl font-heading font-bold text-stone-800">
            {lang === "sw" ? "Njia za Uhakiki" : "Verification Methods"}
          </h2>

          {/* QR Code Method */}
          <div className="bg-white rounded-3xl p-8 border border-stone-200 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <QrCode className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-stone-900">
                  {lang === "sw" ? "Namba ya Uhakiki / QR" : "Verification Number / QR"}
                </h3>
                <p className="text-xs text-stone-500">Ingiza namba iliyo kwenye hati yako</p>
              </div>
            </div>
            
            {/* Document Type Selector */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-stone-700">
                {lang === "sw" ? "Aina ya Nyaraka" : "Document Type"}
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowDocTypeDropdown(!showDocTypeDropdown)}
                  className="w-full h-14 px-4 rounded-2xl border border-stone-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all flex items-center justify-between bg-white hover:bg-stone-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                      {React.createElement(selectedDocument.icon, { className: "h-5 w-5 text-emerald-600" })}
                    </div>
                    <span className="font-medium text-stone-900">
                      {lang === "sw" ? selectedDocument.nameSw : selectedDocument.name}
                    </span>
                  </div>
                  <ChevronDown className={cn("h-5 w-5 text-stone-400 transition-transform", showDocTypeDropdown && "rotate-180")} />
                </button>
                
                {showDocTypeDropdown && (
                  <div className="absolute z-50 mt-2 w-full bg-white rounded-2xl border border-stone-200 shadow-xl max-h-80 overflow-auto">
                    {DOCUMENT_TYPES.map((doc) => (
                      <button
                        key={doc.id}
                        type="button"
                        onClick={() => {
                          setSelectedDocType(doc.id);
                          setShowDocTypeDropdown(false);
                          setQrInput("");
                          setVerificationStatus(null);
                        }}
                        className={cn(
                          "w-full px-4 py-3 flex items-center gap-3 hover:bg-emerald-50 transition-colors first:rounded-t-2xl last:rounded-b-2xl",
                          selectedDocType === doc.id && "bg-emerald-50"
                        )}
                      >
                        <div className={cn(
                          "h-9 w-9 rounded-lg flex items-center justify-center",
                          selectedDocType === doc.id ? "bg-emerald-500 text-white" : "bg-stone-100 text-stone-600"
                        )}>
                          {React.createElement(doc.icon, { className: "h-4 w-4" })}
                        </div>
                        <div className="text-left">
                          <p className={cn(
                            "font-medium text-sm",
                            selectedDocType === doc.id ? "text-emerald-700" : "text-stone-900"
                          )}>
                            {lang === "sw" ? doc.nameSw : doc.name}
                          </p>
                        </div>
                        {selectedDocType === doc.id && (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 ml-auto" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-stone-700 mb-2 block">
                  {lang === "sw" ? "Namba ya Nyaraka" : "Document Number"}
                </label>
                <input
                  type="text"
                  placeholder={selectedDocument.placeholder}
                  value={qrInput}
                  onChange={(e) => setQrInput(e.target.value)}
                  className="w-full h-14 px-6 rounded-2xl border border-stone-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-mono text-lg uppercase tracking-wider"
                />
              </div>
              <button
                onClick={handleVerify}
                disabled={loading || !qrInput.trim()}
                className="w-full h-14 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all disabled:opacity-50 shadow-lg shadow-emerald-200 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Clock className="h-5 w-5 animate-spin" />
                    {lang === "sw" ? "Inahakiki..." : "Verifying..."}
                  </>
                ) : (
                  <>
                    <Shield className="h-5 w-5" />
                    {lang === "sw" ? "Anza Uhakiki" : "Start Verification"}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* File Upload Method */}
          <div className="bg-white rounded-3xl p-8 border border-stone-200 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Upload className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-stone-900">
                  {lang === "sw" ? "Pakia Nyaraka" : "Upload Document"}
                </h3>
                <p className="text-xs text-stone-500">Skena hati yako ya PDF au picha</p>
              </div>
            </div>
            <div className="border-2 border-dashed border-stone-200 rounded-2xl p-10 text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/30 transition-all group">
              <div className="h-16 w-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Upload className="h-8 w-8 text-stone-400 group-hover:text-emerald-600" />
              </div>
              <p className="text-stone-900 font-bold mb-1">
                {lang === "sw"
                  ? "Buruta na uachie nyaraka hapa"
                  : "Drag and drop your document"}
              </p>
              <p className="text-sm text-stone-500">
                {lang === "sw" ? "au bonyeza kutafuta kwenye kompyuta" : "or click to browse files"}
              </p>
            </div>
          </div>
        </div>

        {/* Verification Results */}
        <div className="space-y-6">
          <h2 className="text-xl font-heading font-bold text-stone-800">
            {lang === "sw" ? "Matokeo ya Uhakiki" : "Verification Results"}
          </h2>

          {!verificationStatus && (
            <div className="bg-stone-50 rounded-3xl p-12 border border-stone-200 text-center py-20">
              <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                <QrCode className="h-10 w-10 text-stone-300" />
              </div>
              <p className="text-stone-500 font-medium max-w-xs mx-auto">
                {lang === "sw"
                  ? "Ingiza namba ya uhakiki au pakia nyaraka ili kuona matokeo hapa"
                  : "Enter a verification number or upload a document to see the results here"}
              </p>
            </div>
          )}

          {verificationStatus === "verified" && verifiedDocument && (
            <div className="bg-white rounded-3xl p-8 border-2 border-emerald-500 shadow-xl shadow-emerald-100 space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                <CheckCircle2 className="h-12 w-12 text-emerald-500 opacity-20" />
              </div>
              
              {/* Verification Success Banner */}
              <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                <CheckCircle2 className="h-8 w-8 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-heading font-bold text-emerald-900 text-lg">
                    {lang === "sw" ? "Nyaraka ni Halali" : "Document Verified"}
                  </p>
                  <p className="text-sm text-emerald-700">
                    {lang === "sw"
                      ? "Nyaraka hii imetolewa rasmi na Serikali"
                      : "This document is officially issued by the Government"}
                  </p>
                </div>
              </div>

              {/* Access Mode Indicator */}
              <div className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold",
                hasFullAccess 
                  ? "bg-blue-50 text-blue-700 border border-blue-200" 
                  : "bg-amber-50 text-amber-700 border border-amber-200"
              )}>
                {hasFullAccess ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                {hasFullAccess 
                  ? (lang === "sw" ? "Mtazamo Kamili (Admin/Staff)" : "Full View (Admin/Staff)")
                  : (lang === "sw" ? "Mtazamo wa Umma" : "Public View")
                }
              </div>

              {/* Document Details */}
              <div className="space-y-4 bg-stone-50 rounded-2xl p-6">
                {/* Document Type - Always shown */}
                <div className="flex justify-between items-center border-b border-stone-200 pb-3">
                  <span className="text-sm font-bold text-stone-500 uppercase tracking-wider flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    {lang === "sw" ? "Aina ya Hati:" : "Document Type:"}
                  </span>
                  <span className="font-bold text-stone-900">
                    {verifiedDocument.name}
                  </span>
                </div>

                {/* Applicant Name - Masked for public, full for staff */}
                <div className="flex justify-between items-center border-b border-stone-200 pb-3">
                  <span className="text-sm font-bold text-stone-500 uppercase tracking-wider flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {lang === "sw" ? "Miliki ya:" : "Issued To:"}
                  </span>
                  <span className="font-bold text-stone-900">
                    {hasFullAccess ? verifiedDocument.applicantFull : verifiedDocument.applicantMasked}
                  </span>
                </div>

                {/* NIDA Number - Only for staff/admin */}
                {hasFullAccess && verifiedDocument.nidaNumber && (
                  <div className="flex justify-between items-center border-b border-stone-200 pb-3">
                    <span className="text-sm font-bold text-stone-500 uppercase tracking-wider flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      {lang === "sw" ? "Namba ya NIDA:" : "NIDA Number:"}
                    </span>
                    <span className="font-mono font-bold text-stone-900">
                      {verifiedDocument.nidaNumber}
                    </span>
                  </div>
                )}

                {/* NIDA Masked - For public view */}
                {!hasFullAccess && verifiedDocument.nidaMasked && (
                  <div className="flex justify-between items-center border-b border-stone-200 pb-3">
                    <span className="text-sm font-bold text-stone-500 uppercase tracking-wider flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      {lang === "sw" ? "Namba ya NIDA:" : "NIDA Number:"}
                    </span>
                    <span className="font-mono font-bold text-stone-400">
                      {verifiedDocument.nidaMasked}
                    </span>
                  </div>
                )}

                {/* Phone - Only for staff/admin */}
                {hasFullAccess && verifiedDocument.phone && (
                  <div className="flex justify-between items-center border-b border-stone-200 pb-3">
                    <span className="text-sm font-bold text-stone-500 uppercase tracking-wider">
                      {lang === "sw" ? "Simu:" : "Phone:"}
                    </span>
                    <span className="font-bold text-stone-900">
                      {verifiedDocument.phone}
                    </span>
                  </div>
                )}

                {/* Location - Full for staff, region only for public */}
                <div className="flex justify-between items-center border-b border-stone-200 pb-3">
                  <span className="text-sm font-bold text-stone-500 uppercase tracking-wider flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {lang === "sw" ? "Mahali:" : "Location:"}
                  </span>
                  <span className="font-bold text-stone-900 text-right">
                    {hasFullAccess 
                      ? [verifiedDocument.region, verifiedDocument.district, verifiedDocument.ward, verifiedDocument.street].filter(Boolean).join(', ')
                      : verifiedDocument.region || 'Tanzania'
                    }
                  </span>
                </div>

                {/* Issue Date - Always shown */}
                <div className="flex justify-between items-center border-b border-stone-200 pb-3">
                  <span className="text-sm font-bold text-stone-500 uppercase tracking-wider flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {lang === "sw" ? "Tarehe ya Kutolewa:" : "Issue Date:"}
                  </span>
                  <span className="font-bold text-stone-900">
                    {verifiedDocument.issuedAt 
                      ? new Date(verifiedDocument.issuedAt).toLocaleDateString()
                      : verifiedDocument.issueDate
                    }
                  </span>
                </div>

                {/* Status - Always shown */}
                <div className="flex justify-between items-center border-b border-stone-200 pb-3">
                  <span className="text-sm font-bold text-stone-500 uppercase tracking-wider">
                    {lang === "sw" ? "Hali:" : "Status:"}
                  </span>
                  <span className={cn(
                    "px-3 py-1 rounded-full text-xs font-bold",
                    verifiedDocument.status === 'issued' ? "bg-emerald-100 text-emerald-700" :
                    verifiedDocument.status === 'approved' ? "bg-blue-100 text-blue-700" :
                    verifiedDocument.status === 'rejected' ? "bg-red-100 text-red-700" :
                    "bg-amber-100 text-amber-700"
                  )}>
                    {verifiedDocument.status === 'issued' ? (lang === 'sw' ? 'Imetolewa' : 'Issued') :
                     verifiedDocument.status === 'approved' ? (lang === 'sw' ? 'Imekubaliwa' : 'Approved') :
                     verifiedDocument.status === 'rejected' ? (lang === 'sw' ? 'Imekataliwa' : 'Rejected') :
                     verifiedDocument.status}
                  </span>
                </div>

                {/* Verification Code - Always shown */}
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-stone-500 uppercase tracking-wider">
                    {lang === "sw" ? "Namba ya Uhakiki:" : "Verification Code:"}
                  </span>
                  <span className="font-mono text-sm font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">
                    {verifiedDocument.verificationCode}
                  </span>
                </div>

                {/* Payment Info - Only for staff/admin */}
                {hasFullAccess && verifiedDocument.paidAt && (
                  <div className="flex justify-between items-center pt-3 border-t border-stone-200">
                    <span className="text-sm font-bold text-stone-500 uppercase tracking-wider">
                      {lang === "sw" ? "Malipo:" : "Payment:"}
                    </span>
                    <span className="font-bold text-emerald-600">
                      TZS {verifiedDocument.serviceFee?.toLocaleString() || '0'} - {new Date(verifiedDocument.paidAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Form Data - Only for staff/admin */}
              {hasFullAccess && verifiedDocument.formData && Object.keys(verifiedDocument.formData).length > 0 && (
                <div className="bg-blue-50 rounded-2xl p-4 space-y-2">
                  <p className="text-sm font-bold text-blue-700 uppercase tracking-wider mb-3">
                    {lang === "sw" ? "Data ya Fomu (Staff Only)" : "Form Data (Staff Only)"}
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(verifiedDocument.formData)
                      .filter(([key]) => !key.includes('payment_data'))
                      .slice(0, 8)
                      .map(([key, value]) => (
                        <div key={key} className="flex flex-col">
                          <span className="text-blue-500 text-xs capitalize">{key.replace(/_/g, ' ')}</span>
                          <span className="font-medium text-blue-900 truncate">{String(value)}</span>
                        </div>
                      ))
                    }
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  className="flex-1 h-14 bg-stone-900 text-white rounded-2xl font-bold hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-stone-200"
                >
                  <Download className="h-5 w-5" />
                  {lang === "sw" ? "Pakua Nakala" : "Download Copy"}
                </button>
                <button
                  onClick={() => {
                    setVerificationStatus(null);
                    setQrInput("");
                  }}
                  className="h-14 px-6 bg-stone-100 text-stone-600 rounded-2xl font-bold hover:bg-stone-200 transition-all"
                >
                  {lang === "sw" ? "Funga" : "Close"}
                </button>
              </div>
            </div>
          )}

          {verificationStatus === "invalid" && (
            <div className="bg-white rounded-3xl p-8 border-2 border-red-500 shadow-xl shadow-red-100 space-y-6">
              <div className="flex items-center gap-4 p-4 bg-red-50 rounded-2xl border border-red-100">
                <XCircle className="h-8 w-8 text-red-600 shrink-0" />
                <div>
                  <p className="font-heading font-bold text-red-900 text-lg">
                    {lang === "sw" ? "Nyaraka Sio Halali" : "Verification Failed"}
                  </p>
                  <p className="text-sm text-red-700">
                    {lang === "sw"
                      ? "Namba hii haipo kwenye mfumo wetu"
                      : "This code was not found in our records"}
                  </p>
                </div>
              </div>
              
              <div className="p-4 bg-stone-50 rounded-2xl">
                <p className="text-sm text-stone-600 leading-relaxed">
                  {lang === "sw" 
                    ? "Tafadhali hakikisha umeingiza namba sahihi. Ikiwa unaamini hii ni hitilafu, wasiliana na ofisi ya serikali ya mtaa iliyotoa hati hii."
                    : "Please ensure you entered the correct code. If you believe this is an error, contact the local government office that issued the document."}
                </p>
              </div>

              <button
                onClick={() => {
                  setVerificationStatus(null);
                  setQrInput("");
                }}
                className="w-full h-14 bg-stone-900 text-white rounded-2xl font-bold hover:bg-black transition-all"
              >
                {lang === "sw" ? "Jaribu Tena" : "Try Again"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white rounded-3xl p-10 border border-stone-200 shadow-sm">
        <h2 className="text-2xl font-heading font-bold text-stone-900 mb-8 flex items-center gap-3">
          <FileText className="text-emerald-600" />
          {lang === "sw" ? "Maswali Yanayoulizwa Mara kwa Mara" : "Frequently Asked Questions"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-3">
            <p className="font-bold text-stone-800 text-lg">
              {lang === "sw"
                ? "Je, mfumo huu ni salama?"
                : "Is this system secure?"}
            </p>
            <p className="text-stone-500 leading-relaxed">
              {lang === "sw"
                ? "Ndiyo, kila hati inayotolewa na E-Mtaa ina saini ya kidijitali na kodi ya kipekee inayohifadhiwa kwenye kanzi data salama ya serikali."
                : "Yes, every document issued by E-Mtaa features a digital signature and a unique code stored in a secure government database."}
            </p>
          </div>
          <div className="space-y-3">
            <p className="font-bold text-stone-800 text-lg">
              {lang === "sw"
                ? "Nifanye nini uhakiki ukifeli?"
                : "What if verification fails?"}
            </p>
            <p className="text-stone-500 leading-relaxed">
              {lang === "sw"
                ? "Hakikisha namba uliyoingiza haina makosa. Ikiwa hati ni ya zamani (kabla ya mfumo wa kidijitali), inaweza isionekane hapa."
                : "Ensure the code entered has no typos. If the document is old (pre-digital system), it might not be visible here."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
