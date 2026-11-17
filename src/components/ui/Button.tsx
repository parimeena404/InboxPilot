import React from 'react';

const variantStyles = {
  primary:
    'bg-accent text-white hover:bg-accent-hover focus:ring-accent/40 shadow-sm hover:shadow-accent',
  secondary:
    'bg-white text-txt-primary border border-border hover:bg-canvas focus:ring-accent/20',
  ghost:
    'bg-transparent text-txt-secondary hover:bg-canvas hover:text-txt-primary focus:ring-accent/20',
  danger:
    'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500/40 shadow-sm',
} as const;

const sizeStyles = {
  sm: 'px-3 py-1.5 text-xs gap-1.5 rounded-lg',
  md: 'px-4 py-2 text-sm gap-2 rounded-xl',
  lg: 'px-6 py-2.5 text-base gap-2 rounded-xl',
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
      className={`inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
