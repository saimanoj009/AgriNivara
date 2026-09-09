import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import type { ToastItem, ToastType } from '../../context/ToastContext';

interface ToastProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}

const typeStyles: Record<
  ToastType,
  {
    icon: React.ReactNode;
    bg: string;
    border: string;
    accent: string;
    titleColor: string;
    progressColor: string;
  }
> = {
  success: {
    icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    bg: 'bg-[#0e2b23]/95',
    border: 'border-emerald-500/40',
    accent: 'text-emerald-300',
    titleColor: 'text-emerald-200',
    progressColor: 'bg-emerald-400',
  },
  error: {
    icon: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    bg: 'bg-[#291216]/95',
    border: 'border-rose-500/40',
    accent: 'text-rose-300',
    titleColor: 'text-rose-200',
    progressColor: 'bg-rose-400',
  },
  warning: {
    icon: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
    bg: 'bg-[#292212]/95',
    border: 'border-amber-500/40',
    accent: 'text-amber-300',
    titleColor: 'text-amber-200',
    progressColor: 'bg-amber-400',
  },
  info: {
    icon: <Info className="w-5 h-5 text-teal-400 shrink-0" />,
    bg: 'bg-[#0b2729]/95',
    border: 'border-teal-500/40',
    accent: 'text-teal-300',
    titleColor: 'text-teal-200',
    progressColor: 'bg-teal-400',
  },
};

export function ToastCard({ toast, onDismiss }: ToastProps) {
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);
  const style = typeStyles[toast.type] || typeStyles.info;
  const duration = toast.duration || 4500;

  useEffect(() => {
    if (isPaused) return;

    const intervalTime = 50;
    const step = (intervalTime / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= step) {
          clearInterval(timer);
          onDismiss(toast.id);
          return 0;
        }
        return prev - step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [duration, isPaused, onDismiss, toast.id]);

  return (
    <div
      role={toast.type === 'error' ? 'alert' : 'status'}
      aria-live="polite"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`relative overflow-hidden w-full max-w-md backdrop-blur-xl border rounded-2xl shadow-2xl p-4 transition-all duration-300 animate-in fade-in slide-in-from-top-4 sm:slide-in-from-bottom-4 ${style.bg} ${style.border}`}
    >
      <div className="flex items-start gap-3">
        <div className="p-1 rounded-lg bg-black/20 shrink-0">{style.icon}</div>
        <div className="flex-1 min-w-0 pr-2">
          {toast.title && (
            <h4 className={`text-sm font-semibold mb-0.5 ${style.titleColor}`}>
              {toast.title}
            </h4>
          )}
          <p className="text-xs sm:text-sm text-[#f3ebdd]/90 leading-relaxed break-words">
            {toast.message}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          aria-label="Dismiss notification"
          className="p-1 rounded-lg text-[#a8b9ae] hover:text-[#f3ebdd] hover:bg-white/10 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
        <div
          className={`h-full transition-all duration-75 ${style.progressColor}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <aside
      aria-label="Notifications"
      className="fixed z-50 pointer-events-none inset-x-0 top-4 sm:top-auto sm:bottom-6 sm:right-6 sm:left-auto flex flex-col gap-2.5 px-4 sm:px-0 sm:max-w-md items-center sm:items-end"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto w-full">
          <ToastCard toast={toast} onDismiss={onDismiss} />
        </div>
      ))}
    </aside>
  );
}
