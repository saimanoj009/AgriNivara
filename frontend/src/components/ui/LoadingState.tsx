import React from 'react';
import { Loader2, Sprout, Sparkles } from 'lucide-react';

export interface LoadingStateProps {
  message?: string;
  subMessage?: string;
  variant?: 'spinner' | 'growth' | 'skeleton' | 'inline';
  size?: 'sm' | 'md' | 'lg' | 'fullscreen';
  className?: string;
}

export function LoadingState({
  message = 'AI Analysis in progress...',
  subMessage,
  variant = 'spinner',
  size = 'md',
  className = '',
}: LoadingStateProps) {
  if (variant === 'skeleton') {
    return (
      <div
        role="status"
        aria-busy="true"
        aria-label={message}
        className={`w-full space-y-4 ${className}`}
      >
        <div className="h-7 w-1/3 skeleton-botanical rounded-xl" />
        <div className="h-28 w-full skeleton-botanical rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="h-24 skeleton-botanical rounded-2xl" />
          <div className="h-24 skeleton-botanical rounded-2xl" />
          <div className="h-24 skeleton-botanical rounded-2xl" />
        </div>
        <span className="sr-only">{message}</span>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div
        role="status"
        aria-busy="true"
        className={`inline-flex items-center gap-2 text-sm text-[#00b884] ${className}`}
      >
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        <span>{message}</span>
        <span className="sr-only">Loading</span>
      </div>
    );
  }

  const isFullscreen = size === 'fullscreen';

  const containerClasses = isFullscreen
    ? 'fixed inset-0 z-50 bg-[#071c17]/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center'
    : `flex flex-col items-center justify-center text-center p-8 rounded-2xl border border-white/10 bg-[#0e2b23]/80 backdrop-blur-sm ${className}`;

  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    fullscreen: 'w-16 h-16',
  };

  return (
    <div role="status" aria-busy="true" className={containerClasses}>
      <div className="relative mb-4 flex items-center justify-center">
        {/* Outer glowing pulse ring */}
        <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl animate-pulse" />

        {variant === 'growth' ? (
          <div className="relative p-4 rounded-2xl bg-[#12362b] border border-emerald-500/30 text-emerald-400">
            <Sprout className={`${iconSizes[size]} animate-bounce`} />
            <Sparkles className="w-4 h-4 text-[#d6a84f] absolute -top-1 -right-1 animate-spin" />
          </div>
        ) : (
          <div className="relative p-3 rounded-full bg-[#102d25] border border-emerald-500/40 text-[#00b884]">
            <Loader2 className={`${iconSizes[size]} animate-spin`} />
          </div>
        )}
      </div>

      <h3 className="text-base sm:text-lg font-semibold text-[#f3ebdd] tracking-wide">
        {message}
      </h3>
      {subMessage && (
        <p className="mt-1 text-xs sm:text-sm text-[#a8b9ae] max-w-sm">
          {subMessage}
        </p>
      )}
      <span className="sr-only">Loading content...</span>
    </div>
  );
}
