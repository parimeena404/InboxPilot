import React from 'react';

const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

export const EmailSkeleton: React.FC = () => {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-[#E9EAF1]">
      <Skeleton className="w-9 h-9 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-16 rounded-full" />
        </div>
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-3 w-12 flex-shrink-0" />
    </div>
  );
};

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-[#E9EAF1] p-5 space-y-3">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>
      {/* Content area */}
      <div className="bg-white rounded-xl border border-[#E9EAF1] p-4 space-y-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <EmailSkeleton key={i} />
        ))}
      </div>
    </div>
  );
};
