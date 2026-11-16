import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
} as const;

const toastStyles = {
  success: 'border-green-200 bg-green-50 text-green-800',
  error: 'border-red-200 bg-red-50 text-red-800',
  info: 'border-blue-200 bg-blue-50 text-blue-800',
} as const;

const iconColors = {
  success: 'text-green-500',
  error: 'text-red-500',
  info: 'text-blue-500',
} as const;

export const Toast: React.FC = () => {
  const { showToast, toastMessage, toastType, hideToast } = useStore();

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        hideToast();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast, hideToast]);

  const type = toastType || 'info';
  const Icon = icons[type];

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      <AnimatePresence>
        {showToast && (
          <motion.div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg min-w-[280px] ${toastStyles[type]}`}
            initial={{ opacity: 0, x: 80, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, scale: 0.95 }}
            transition={{ duration: 0.25 }}
          >
            <Icon className={`w-5 h-5 flex-shrink-0 ${iconColors[type]}`} />
            <p className="text-sm font-medium flex-1">{toastMessage}</p>
            <button
              onClick={hideToast}
              className="p-0.5 rounded hover:bg-black/5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
