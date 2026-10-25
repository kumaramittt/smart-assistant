import React from 'react';
import { BrandLogo } from './BrandLogo';

interface EmptyStateProps {
  onSelectPrompt?: (query: string) => void;
}

export const EmptyState: React.FC<EmptyStateProps> = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center select-none py-6 sm:py-10">
      {/* Brand Icon */}
      <BrandLogo size="xl" className="mb-6 animate-in fade-in zoom-in-95 duration-300" />

      {/* Heading */}
      <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
        How can I help you today?
      </h1>
    </div>
  );
};
