import React from 'react';
import { 
  LayoutDashboard, 
  Plus, 
  FileText, 
  Search, 
  Eye, 
  Shield, 
  Users,
  User,
  Building2,
  MapPin,
  Settings,
  HelpCircle,
  UserCheck,
  Activity
} from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';
import { useLanguage } from '@/src/context/LanguageContext';
import { SidebarItem } from '@/src/components/ui/SidebarItem';

interface SidebarProps {
  currentView: string;
  setView: (view: any) => void;
}

export function Sidebar({ currentView, setView }: SidebarProps) {
  const { user } = useAuth();
  const { lang, t } = useLanguage();

  return (
    <aside className="w-64 bg-white border-r border-stone-200 hidden lg:flex flex-col p-4 gap-2">
      <SidebarItem 
        icon={<LayoutDashboard size={20} />} 
        label={t.dashboard} 
        active={currentView === 'dashboard' || currentView === 'admin_dashboard' || currentView === 'staff_dashboard'} 
        onClick={() => {
          if (user?.role === 'admin') setView('admin_dashboard');
          else if (user?.role === 'staff') setView('staff_dashboard');
          else setView('dashboard');
        }} 
      />

      {user?.role === 'citizen' && (
        <>
          <SidebarItem 
            icon={<Plus size={20} />} 
            label={t.apply} 
            active={currentView === 'services' || currentView === 'apply'} 
            onClick={() => setView('services')} 
          />
          <SidebarItem 
            icon={<FileText size={20} />} 
            label={t.myApplications} 
            active={currentView === 'applications'} 
            onClick={() => setView('applications')} 
          />
        </>
      )}

      {user?.role === 'admin' && (
        <>
          <SidebarItem 
            icon={<Shield size={20} />} 
            label={lang === 'sw' ? 'Usimamizi wa Watumishi' : 'Staff Management'} 
            active={currentView === 'staff_management'} 
            onClick={() => setView('staff_management')} 
          />
          <SidebarItem 
            icon={<Users size={20} />} 
            label={lang === 'sw' ? 'Usimamizi wa Wananchi' : 'Citizen Management'} 
            active={currentView === 'citizen_management'} 
            onClick={() => setView('citizen_management')} 
          />
          <SidebarItem 
            icon={<Building2 size={20} />} 
            label={lang === 'sw' ? 'Usimamizi wa Ofisi' : 'Office Management'} 
            active={currentView === 'office_management'} 
            onClick={() => setView('office_management')} 
          />
          <SidebarItem 
            icon={<MapPin size={20} />} 
            label={lang === 'sw' ? 'Usimamizi wa Maeneo' : 'Location Management'} 
            active={currentView === 'location_management'} 
            onClick={() => setView('location_management')} 
          />
          <SidebarItem 
            icon={<Settings size={20} />} 
            label={lang === 'sw' ? 'Usimamizi wa Huduma' : 'Service Management'} 
            active={currentView === 'service_management'} 
            onClick={() => setView('service_management')} 
          />
          <SidebarItem 
            icon={<Activity size={20} />} 
            label={lang === 'sw' ? 'Kumbukumbu' : 'Activity Logs'} 
            active={currentView === 'admin_logs'} 
            onClick={() => setView('admin_logs')} 
          />
        </>
      )}

      {user?.role === 'staff' && (
        <>
          <SidebarItem 
            icon={<Users size={20} />} 
            label={lang === 'sw' ? 'Usimamizi wa Wananchi' : 'Citizen Management'} 
            active={currentView === 'citizen_management'} 
            onClick={() => setView('citizen_management')} 
          />
          <SidebarItem 
            icon={<Eye size={20} />} 
            label={lang === 'sw' ? 'Uhakiki wa Maombi' : 'Application Review'} 
            active={currentView === 'application_review'} 
            onClick={() => setView('application_review')} 
          />
          <SidebarItem 
            icon={<HelpCircle size={20} />} 
            label={lang === 'sw' ? 'Huduma kwa Wateja' : 'Customer Support'} 
            active={currentView === 'customer_support'} 
            onClick={() => setView('customer_support')} 
          />
          <SidebarItem 
            icon={<UserCheck size={20} />} 
            label={lang === 'sw' ? 'Uhakiki wa Mwongozo' : 'Manual Verification'} 
            active={currentView === 'manual_verification'} 
            onClick={() => setView('manual_verification')} 
          />
        </>
      )}

      <SidebarItem 
        icon={<Search size={20} />} 
        label={lang === 'sw' ? 'Hakiki Hati' : 'Verify Document'} 
        active={currentView === 'verify_documents'} 
        onClick={() => setView('verify_documents')} 
      />
      <SidebarItem 
        icon={<User size={20} />} 
        label={lang === 'sw' ? 'Wasifu' : 'Profile'} 
        active={currentView === 'profile'} 
        onClick={() => setView('profile')} 
      />
    </aside>
  );
}
