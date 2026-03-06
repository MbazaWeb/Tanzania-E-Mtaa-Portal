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
  FileText
} from "lucide-react";
import { Language } from "@/src/lib/i18n";
import { useTranslation } from "@/src/lib/i18n";
import { supabase } from "@/src/lib/supabase";
import { cn } from "@/src/lib/utils";

interface VerifyDocumentsProps {
  lang: Language;
  onBack: () => void;
}

export function VerifyDocuments({
  lang,
  onBack,
}: VerifyDocumentsProps) {
  const t = useTranslation(lang);
  const [qrInput, setQrInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<
    "pending" | "verified" | "invalid" | null
  >(null);
  const [verifiedDocument, setVerifiedDocument] = useState<any>(null);

  const handleVerify = async () => {
    if (!qrInput.trim()) return;
    
    setLoading(true);
    setVerificationStatus("pending");

    try {
      // Search for application by number (which acts as the verification code/QR data)
      const { data, error } = await supabase
        .from('applications')
        .select('*, services(*), users(*)')
        .eq('application_number', qrInput.trim().toUpperCase())
        .single();

      if (error || !data) {
        setVerificationStatus("invalid");
        setVerifiedDocument(null);
      } else {
        setVerificationStatus("verified");
        setVerifiedDocument({
          id: data.id,
          type: data.services?.name_en || data.services?.name,
          name: data.services?.name,
          issueDate: new Date(data.updated_at || data.created_at).toLocaleDateString(),
          verificationCode: data.application_number,
          status: data.status,
          applicant: `${data.users?.first_name} ${data.users?.last_name}`
        });
      }
    } catch (err) {
      setVerificationStatus("invalid");
    } finally {
      setLoading(false);
    }
  };

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
            
            <div className="space-y-4">
              <input
                type="text"
                placeholder={
                  lang === "sw" ? "Mfano: TZ-20240115-XXXX" : "Example: TZ-20240115-XXXX"
                }
                value={qrInput}
                onChange={(e) => setQrInput(e.target.value)}
                className="w-full h-14 px-6 rounded-2xl border border-stone-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-mono text-lg uppercase tracking-wider"
              />
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

              <div className="space-y-4 bg-stone-50 rounded-2xl p-6">
                <div className="flex justify-between items-center border-b border-stone-200 pb-3">
                  <span className="text-sm font-bold text-stone-500 uppercase tracking-wider">
                    {lang === "sw" ? "Aina ya Hati:" : "Document Type:"}
                  </span>
                  <span className="font-bold text-stone-900">
                    {verifiedDocument.name}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-stone-200 pb-3">
                  <span className="text-sm font-bold text-stone-500 uppercase tracking-wider">
                    {lang === "sw" ? "Miliki ya:" : "Issued To:"}
                  </span>
                  <span className="font-bold text-stone-900">
                    {verifiedDocument.applicant}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-stone-200 pb-3">
                  <span className="text-sm font-bold text-stone-500 uppercase tracking-wider">
                    {lang === "sw" ? "Tarehe ya Kutolewa:" : "Issue Date:"}
                  </span>
                  <span className="font-bold text-stone-900">
                    {verifiedDocument.issueDate}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-stone-500 uppercase tracking-wider">
                    {lang === "sw" ? "Namba ya Uhakiki:" : "Verification Code:"}
                  </span>
                  <span className="font-mono text-sm font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">
                    {verifiedDocument.verificationCode}
                  </span>
                </div>
              </div>

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
