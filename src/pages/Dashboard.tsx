import React from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  CheckCircle2, 
  AlertCircle, 
  Building2 
} from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';
import { useLanguage } from '@/src/context/LanguageContext';
import { StatCard } from '@/src/components/ui/StatCard';
import { StatusBadge } from '@/src/components/ui/StatusBadge';
import { Application } from '@/src/lib/supabase';

interface DashboardProps {
  applications: Application[];
  setView: (view: any) => void;
}

export function Dashboard({ applications, setView }: DashboardProps) {
  const { user } = useAuth();
  const { lang } = useLanguage();

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <StatCard 
          icon={<FileText className="text-blue-500" />} 
          label={lang === 'sw' ? "Jumla ya Maombi" : "Total Applications"} 
          value={applications.length} 
        />
        <StatCard 
          icon={<Clock className="text-amber-500" />} 
          label={lang === 'sw' ? "Yanasubiri Uhakiki" : "Pending Verification"} 
          value={applications.filter(a => a.status === 'submitted').length} 
        />
        <StatCard 
          icon={<CheckCircle className="text-emerald-500" />} 
          label={lang === 'sw' ? "Hati Zilizoidhinishwa" : "Approved Documents"} 
          value={applications.filter(a => a.status === 'approved' || a.status === 'issued').length} 
        />
      </div>

      {user && (
        <div className="bg-emerald-600 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl shadow-emerald-200">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl sm:text-3xl font-heading font-extrabold">
                  {lang === 'sw' ? `Karibu, ${user.first_name || 'Mtumiaji'}` : `Welcome, ${user.first_name || 'User'}`}
                </h2>
                {user.is_verified && (
                  <div className="bg-white/20 backdrop-blur-md p-1 rounded-full border border-white/30" title={lang === 'sw' ? 'Imethibitishwa' : 'Verified'}>
                    <CheckCircle2 size={18} className="text-emerald-300" />
                  </div>
                )}
              </div>
              <p className="text-emerald-50 opacity-90 font-medium text-sm sm:text-base">
                {lang === 'sw' 
                  ? `Umeingia kama ${user.role === 'citizen' ? 'Mwananchi' : user.role === 'admin' ? 'Msimamizi' : 'Mtumishi'}.`
                  : `Logged in as ${user.role}.`
                }
                <span className="block sm:inline sm:ml-2">
                  {lang === 'sw' ? 'Eneo lako:' : 'Your Location:'} {
                    user.role === 'citizen' 
                      ? `${user.region || '-'}${user.district ? ` / ${user.district}` : ''}`
                      : `${user.assigned_region || '-'}${user.assigned_district ? ` / ${user.assigned_district}` : ' (Ofisi ya Mkoa)'}`
                  }
                </span>
              </p>
            </div>
            
            {user.role === 'citizen' && !user.is_verified && (
              <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20 flex items-center gap-3 w-fit">
                <AlertCircle size={20} className="text-amber-300 shrink-0" />
                <div className="text-xs">
                  <p className="font-bold">{lang === 'sw' ? 'Akaunti Inasubiri Uhakiki' : 'Account Pending Verification'}</p>
                  <p className="opacity-80">{lang === 'sw' ? 'Tafadhali subiri uhakiki kutoka ofisi ya mtaa.' : 'Please wait for verification from the local government office.'}</p>
                </div>
              </div>
            )}
          </div>
          <Building2 className="absolute -right-5 -bottom-5 h-32 sm:h-48 w-32 sm:w-48 text-white/10 rotate-12" />
        </div>
      )}

      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between">
          <h2 className="font-bold text-stone-800">{lang === 'sw' ? 'Maombi ya Karibuni' : 'Recent Applications'}</h2>
          <button onClick={() => setView('applications')} className="text-sm text-emerald-600 font-semibold hover:underline">{lang === 'sw' ? 'Tazama Yote' : 'View All'}</button>
        </div>
        <div className="divide-y divide-stone-100">
          {applications.slice(0, 5).map(app => (
            <div key={app.id} className="px-6 py-4 flex items-center justify-between hover:bg-stone-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-500">
                  <FileText size={20} />
                </div>
                <div>
                  <p className="font-semibold text-stone-800">{(app as any).services?.name}</p>
                  <p className="text-xs text-stone-500">{app.application_number}</p>
                </div>
              </div>
              <StatusBadge status={app.status} lang={lang} />
            </div>
          ))}
          {applications.length === 0 && (
            <div className="px-6 py-12 text-center text-stone-400">
              {lang === 'sw' ? 'Hakuna maombi yaliyopatikana.' : 'No applications found.'}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
