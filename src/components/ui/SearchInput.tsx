import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchInputProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  className?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  placeholder = 'Search...',
  value,
  onChange,
  onClear,
  className = '',
}) => {
  const handleClear = () => {
    onChange('');
    onClear?.();
  };

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#777D91]" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-9 py-2 rounded-xl border border-[#E9EAF1] bg-white text-sm text-[#20243A] placeholder-[#777D91] focus:outline-none focus:ring-2 focus:ring-[#6558E8]/30 focus:border-[#6558E8] transition-colors duration-150"
      />
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#777D91] hover:text-[#20243A] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
