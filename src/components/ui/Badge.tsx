import React from 'react';

const variantStyles = {
  assistant: 'bg-classify-assistant-bg text-classify-assistant-text border border-classify-assistant-border',
  client: 'bg-classify-client-bg text-classify-client-text border border-classify-client-border',
  noreply: 'bg-classify-noreply-bg text-classify-noreply-text border border-classify-noreply-border',
  review: 'bg-classify-review-bg text-classify-review-text border border-classify-review-border',
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
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold capitalize leading-tight ${variantStyles[variant]} ${className}`}
    >
      {children || defaultLabels[variant]}
    </span>
  );
};

export default Badge;
