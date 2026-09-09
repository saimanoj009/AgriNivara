import React from 'react';
import { AlertCircle, RefreshCw, ArrowLeft, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  showHomeLink?: boolean;
  className?: string;
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'We encountered an issue processing agricultural telemetry or AI predictions. Please try again.',
  onRetry,
  retryLabel = 'Retry Operation',
  showHomeLink = false,
  className = '',
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={`flex flex-col items-center justify-center text-center p-8 rounded-2xl border border-rose-500/25 bg-[#231215]/90 backdrop-blur-md ${className}`}
    >
      <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 mb-4 shadow-lg shadow-rose-900/20">
        <AlertCircle className="w-8 h-8" />
      </div>

      <h3 className="text-lg font-semibold text-rose-200 tracking-tight">
        {title}
      </h3>
      <p className="mt-1.5 text-sm text-[#f3ebdd]/80 max-w-md leading-relaxed">
        {message}
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-[#00b884] text-white font-medium text-sm shadow-lg shadow-emerald-950/40 hover:from-emerald-500 hover:to-[#12c995] active:scale-95 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#071c17]"
          >
            <RefreshCw className="w-4 h-4" />
            <span>{retryLabel}</span>
          </button>
        )}

        {showHomeLink && (
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[#f3ebdd] font-medium text-sm hover:bg-white/10 hover:border-white/20 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            <Home className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
        )}
      </div>
    </div>
  );
}
