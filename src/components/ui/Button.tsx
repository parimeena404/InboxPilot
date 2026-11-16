import React from 'react';

const variantStyles = {
  primary:
    'bg-[#6558E8] text-white hover:bg-[#5548D5] focus:ring-[#6558E8]/40 shadow-sm',
  secondary:
    'bg-white text-[#20243A] border border-[#E9EAF1] hover:bg-[#F7F8FC] focus:ring-[#6558E8]/20',
  ghost:
    'bg-transparent text-[#777D91] hover:bg-[#F7F8FC] hover:text-[#20243A] focus:ring-[#6558E8]/20',
  danger:
    'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500/40 shadow-sm',
} as const;

const sizeStyles = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-6 py-2.5 text-base gap-2',
} as const;

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}) => {
  return (
    <button
      className={`inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
