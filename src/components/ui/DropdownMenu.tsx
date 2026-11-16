import React, { useState, useRef, useEffect } from 'react';
import { LucideIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DropdownItem {
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  variant?: 'default' | 'danger';
}

interface DropdownMenuProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({ trigger, items }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-flex" ref={ref}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute right-0 top-full mt-1 min-w-[180px] bg-white rounded-xl border border-[#E9EAF1] shadow-lg py-1 z-50"
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.15 }}
          >
            {items.map((item, index) => {
              const Icon = item.icon;
              const isDanger = item.variant === 'danger';
              return (
                <button
                  key={index}
                  onClick={() => {
                    item.onClick();
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
                    isDanger
                      ? 'text-red-600 hover:bg-red-50'
                      : 'text-[#20243A] hover:bg-[#F7F8FC]'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
                  {item.label}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
