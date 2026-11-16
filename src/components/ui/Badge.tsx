import React from 'react';

const variantStyles = {
  assistant: 'bg-[#E9F1FF] text-blue-700',
  client: 'bg-[#FFF3DE] text-amber-700',
  noreply: 'bg-[#E8F7EE] text-green-700',
  review: 'bg-[#F2EAFE] text-purple-700',
} as const;

const defaultLabels = {
  assistant: 'Assistant to Reply',
  client: 'Client to Reply',
  noreply: 'No Reply Needed',
  review: 'Needs Review',
} as const;

export interface BadgeProps {
  variant: 'assistant' | 'client' | 'noreply' | 'review';
  children?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant, children, className = '' }) => {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${variantStyles[variant]} ${className}`}
    >
      {children || defaultLabels[variant]}
    </span>
  );
};

export default Badge;
