import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, AlertCircle, XCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[300] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              className="pointer-events-auto"
            >
              <div className={`
                flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border min-w-[300px] max-w-md
                ${toast.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' :
                  toast.type === 'error' ? 'bg-red-50 border-red-100 text-red-800' :
                  toast.type === 'warning' ? 'bg-amber-50 border-amber-100 text-amber-800' :
                  'bg-blue-50 border-blue-100 text-blue-800'}
              `}>
                <div className="shrink-0">
                  {toast.type === 'success' && <CheckCircle size={20} className="text-emerald-600" />}
                  {toast.type === 'error' && <XCircle size={20} className="text-red-600" />}
                  {toast.type === 'warning' && <AlertCircle size={20} className="text-amber-600" />}
                  {toast.type === 'info' && <Info size={20} className="text-blue-600" />}
                </div>
                <p className="text-sm font-bold flex-1">{toast.message}</p>
                <button 
                  onClick={() => removeToast(toast.id)}
                  className="shrink-0 p-1 hover:bg-black/5 rounded-full transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
