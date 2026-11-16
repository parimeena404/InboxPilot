import React from 'react';

const sizeStyles = {
  sm: 'w-7 h-7 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-12 h-12 text-base',
} as const;

const avatarColors = [
  '#6558E8',
  '#E85858',
  '#58B4E8',
  '#E8A858',
  '#58E88A',
  '#D358E8',
  '#E85894',
  '#5894E8',
  '#8A58E8',
  '#E8D358',
];

function hashName(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

interface AvatarProps {
  name: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  src,
  size = 'md',
  className = '',
}) => {
  const bgColor = avatarColors[hashName(name) % avatarColors.length];

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`rounded-full object-cover flex-shrink-0 ${sizeStyles[size]} ${className}`}
      />
    );
  }

  return (
    <div
      className={`rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0 ${sizeStyles[size]} ${className}`}
      style={{ backgroundColor: bgColor }}
      title={name}
    >
      {getInitials(name)}
    </div>
  );
};
