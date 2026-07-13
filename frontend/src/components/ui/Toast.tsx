import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'warning' | 'error' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
}

interface ToastContextType {
  toast: (type: ToastType, message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((type: ToastType, message: string, title?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    
    // Auto dismiss after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 w-full max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => {
            let Icon = Info;
            let iconColor = 'text-blue-550 dark:text-blue-400';
            let progressBg = 'bg-blue-500';
            let bgClass = 'bg-white/80 dark:bg-zinc-900/80 border-blue-500/20 shadow-blue-500/5';

            switch (t.type) {
              case 'success':
                Icon = CheckCircle2;
                iconColor = 'text-emerald-600 dark:text-emerald-450';
                progressBg = 'bg-emerald-500';
                bgClass = 'bg-white/90 dark:bg-zinc-900/90 border-emerald-500/20 shadow-emerald-500/5';
                break;
              case 'warning':
                Icon = AlertTriangle;
                iconColor = 'text-amber-550 dark:text-amber-400';
                progressBg = 'bg-amber-500';
                bgClass = 'bg-white/90 dark:bg-zinc-900/90 border-amber-500/20 shadow-amber-500/5';
                break;
              case 'error':
                Icon = XCircle;
                iconColor = 'text-rose-600 dark:text-rose-450';
                progressBg = 'bg-rose-500';
                bgClass = 'bg-white/90 dark:bg-zinc-900/90 border-rose-500/20 shadow-rose-500/5';
                break;
            }

            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, x: 80, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 30, scale: 0.9 }}
                transition={{ type: 'spring', damping: 20, stiffness: 220 }}
                className={`flex gap-3 p-4 border rounded-2xl backdrop-blur-md shadow-2xl pointer-events-auto ${bgClass} overflow-hidden relative`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  <Icon className={`h-5 w-5 ${iconColor}`} />
                </div>
                <div className="flex-1 pr-2">
                  {t.title && (
                    <h4 className="text-xs font-black text-zinc-900 dark:text-zinc-50 leading-none mb-1 uppercase tracking-wider">
                      {t.title}
                    </h4>
                  )}
                  <p className="text-xs font-semibold text-zinc-650 dark:text-zinc-350 leading-normal">
                    {t.message}
                  </p>
                </div>
                <button
                  onClick={() => removeToast(t.id)}
                  className="flex-shrink-0 self-start p-1 text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-200 transition-colors rounded-lg hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50"
                  aria-label="Dismiss toast"
                >
                  <X className="h-3.5 w-3.5" />
                </button>

                {/* Auto-dismiss animated indicator progress line */}
                <motion.div
                  initial={{ width: '100%' }}
                  animate={{ width: 0 }}
                  transition={{ duration: 4, ease: 'linear' }}
                  className={`absolute bottom-0 left-0 h-[3px] ${progressBg}`}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
