import React from 'react';
import { motion } from 'framer-motion';

interface SegmentOption {
  value: string;
  label: string;
  count?: number;
}

interface SegmentedControlProps {
  options: SegmentOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  options,
  value,
  onChange,
  className = '',
}) => {
  return (
    <div
      className={`inline-flex items-center bg-[#F7F8FC] rounded-xl p-1 border border-[#E9EAF1] ${className}`}
    >
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className="relative px-4 py-1.5 text-sm font-medium rounded-lg transition-colors duration-150"
          >
            {isActive && (
              <motion.div
                className="absolute inset-0 bg-white rounded-lg shadow-sm"
                layoutId="segmented-indicator"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span
              className={`relative z-10 flex items-center gap-1.5 ${
                isActive ? 'text-[#20243A]' : 'text-[#777D91]'
              }`}
            >
              {option.label}
              {option.count !== undefined && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-[#6558E8]/10 text-[#6558E8]'
                      : 'bg-[#E9EAF1] text-[#777D91]'
                  }`}
                >
                  {option.count}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
};
