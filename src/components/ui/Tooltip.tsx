import React from 'react';

const positionStyles = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
} as const;

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
}) => {
  return (
    <div className="relative group inline-flex">
      {children}
      <div
        className={`absolute ${positionStyles[position]} pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50`}
      >
        <div className="px-2.5 py-1.5 bg-[#20243A] text-white text-xs font-medium rounded-lg whitespace-nowrap shadow-lg">
          {content}
        </div>
      </div>
    </div>
  );
};
