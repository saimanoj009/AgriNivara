import React from 'react';
import { Sprout, Inbox, Plus, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  secondaryHref?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  secondaryLabel,
  secondaryHref,
  onSecondaryAction,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      role="region"
      aria-label={title}
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl border border-white/10 bg-[#0e2b23]/70 backdrop-blur-sm ${className}`}
    >
      <div className="p-4 rounded-2xl bg-[#12362b] border border-emerald-500/30 text-[#00b884] mb-4 shadow-lg shadow-black/20">
        {icon || <Sprout className="w-8 h-8 animate-pulse" />}
      </div>

      <h3 className="text-base sm:text-lg font-semibold text-[#f3ebdd] tracking-tight">
        {title}
      </h3>
      <p className="mt-1.5 text-xs sm:text-sm text-[#a8b9ae] max-w-sm leading-relaxed">
        {description}
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {actionLabel && (actionHref ? (
          <Link
            to={actionHref}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-[#00b884] text-white font-medium text-xs sm:text-sm shadow-md hover:from-emerald-500 hover:to-[#12c995] active:scale-95 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            <Plus className="w-4 h-4" />
            <span>{actionLabel}</span>
          </Link>
        ) : onAction ? (
          <button
            type="button"
            onClick={onAction}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-[#00b884] text-white font-medium text-xs sm:text-sm shadow-md hover:from-emerald-500 hover:to-[#12c995] active:scale-95 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            <Plus className="w-4 h-4" />
            <span>{actionLabel}</span>
          </button>
        ) : null)}

        {secondaryLabel && (secondaryHref ? (
          <Link
            to={secondaryHref}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[#f3ebdd] font-medium text-xs sm:text-sm hover:bg-white/10 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            <span>{secondaryLabel}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        ) : onSecondaryAction ? (
          <button
            type="button"
            onClick={onSecondaryAction}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[#f3ebdd] font-medium text-xs sm:text-sm hover:bg-white/10 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            <span>{secondaryLabel}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : null)}
      </div>
    </div>
  );
}
