import React from 'react';
import { LogOut, Menu } from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';
import { useLanguage } from '@/src/context/LanguageContext';
import { TANZANIA_LOGO_URL } from '@/src/constants/services';
import { cn } from '@/src/lib/utils';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, signOut } = useAuth();
  const { lang, setLang, t } = useLanguage();

  return (
    <header className="bg-white border-b border-stone-200 px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-2 sm:gap-4">
        <button 
          onClick={onMenuClick}
          className="p-2 -ml-2 hover:bg-stone-100 rounded-lg lg:hidden text-stone-500"
        >
          <Menu size={24} />
        </button>
        <div className="flex items-center gap-2 sm:gap-3">
          <img 
            src={TANZANIA_LOGO_URL} 
            alt="Coat of Arms" 
            className="w-8 h-8 sm:w-12 sm:h-12 object-contain"
            referrerPolicy="no-referrer"
          />
          <div className="h-8 sm:h-10 w-px bg-stone-200 hidden xs:block"></div>
          <div className="flex flex-col">
            <span className="text-lg sm:text-xl font-black tracking-tighter text-stone-900 flex items-center gap-1">
              E-MTAA
              <span className="text-[8px] sm:text-[10px] bg-emerald-600 text-white px-1 sm:px-1.5 py-0.5 rounded font-bold tracking-normal align-middle">PORTAL</span>
            </span>
            <span className="text-[8px] sm:text-[10px] font-bold text-stone-500 uppercase tracking-widest leading-none hidden xs:block">
              Digital Local Government
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <div className="flex items-center gap-1 sm:gap-2 bg-stone-100 rounded-full p-1 mr-1 sm:mr-2">
          <button 
            onClick={() => setLang('sw')}
            className={cn("px-2 sm:px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-bold transition-all", lang === 'sw' ? "bg-white shadow-sm text-primary" : "text-stone-500")}
          >
            SW
          </button>
          <button 
            onClick={() => setLang('en')}
            className={cn("px-2 sm:px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-bold transition-all", lang === 'en' ? "bg-white shadow-sm text-primary" : "text-stone-500")}
          >
            EN
          </button>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-sm font-bold text-stone-800">{user?.first_name} {user?.last_name}</p>
          <p className="text-xs text-stone-500 capitalize">{user?.role} {user?.is_diaspora && `(${t.diaspora})`}</p>
        </div>
        <button 
          onClick={signOut}
          className="p-2 text-stone-400 hover:text-red-500 transition-colors hidden sm:block"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
}
