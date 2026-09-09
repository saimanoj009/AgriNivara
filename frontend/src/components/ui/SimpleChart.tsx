import React from 'react';
import { Sprout, Activity, TrendingUp, Info } from 'lucide-react';

export interface ChartDataItem {
  label: string;
  value: number; // 0 to 100
  secondaryValue?: string;
  category?: string;
  status?: 'optimal' | 'moderate' | 'low' | 'high';
  color?: string;
}

export interface SimpleChartProps {
  title?: string;
  subtitle?: string;
  items: ChartDataItem[];
  type?: 'bar' | 'progress';
  showPercentage?: boolean;
  className?: string;
}

export function SimpleChart({
  title,
  subtitle,
  items,
  type = 'bar',
  showPercentage = true,
  className = '',
}: SimpleChartProps) {
  const getBarColor = (item: ChartDataItem) => {
    if (item.color) return item.color;
    if (item.status === 'optimal' || item.value >= 80) {
      return 'bg-gradient-to-r from-emerald-600 to-[#00b884]';
    }
    if (item.status === 'moderate' || item.value >= 50) {
      return 'bg-gradient-to-r from-teal-600 to-[#14b8a6]';
    }
    if (item.value >= 30) {
      return 'bg-gradient-to-r from-amber-600 to-[#d6a84f]';
    }
    return 'bg-gradient-to-r from-rose-600 to-rose-400';
  };

  const getStatusBadge = (item: ChartDataItem) => {
    if (item.status === 'optimal' || item.value >= 80) {
      return { text: 'Optimal', style: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20' };
    }
    if (item.status === 'moderate' || item.value >= 50) {
      return { text: 'Good', style: 'text-teal-300 bg-teal-500/10 border-teal-500/20' };
    }
    if (item.value >= 30) {
      return { text: 'Moderate', style: 'text-amber-300 bg-amber-500/10 border-amber-500/20' };
    }
    return { text: 'Deficit', style: 'text-rose-300 bg-rose-500/10 border-rose-500/20' };
  };

  return (
    <div
      role="region"
      aria-label={title || 'Agricultural Suitability Chart'}
      className={`rounded-2xl bg-[#102d25] border border-white/10 p-5 shadow-xl ${className}`}
    >
      {(title || subtitle) && (
        <div className="mb-4 flex items-start justify-between">
          <div>
            {title && (
              <h3 className="text-base font-semibold text-[#f3ebdd] flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#00b884]" />
                <span>{title}</span>
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-[#a8b9ae] mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
      )}

      <div className="space-y-3.5">
        {items.map((item, idx) => {
          const badge = getStatusBadge(item);
          const barColor = getBarColor(item);
          const pct = Math.max(0, Math.min(100, item.value));

          return (
            <div key={`${item.label}-${idx}`} className="group">
              <div className="flex items-center justify-between text-xs sm:text-sm mb-1.5 font-medium">
                <div className="flex items-center gap-2 text-[#f3ebdd]">
                  <span>{item.label}</span>
                  {item.category && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-[#a8b9ae]">
                      {item.category}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {item.secondaryValue && (
                    <span className="text-xs text-[#a8b9ae]">
                      {item.secondaryValue}
                    </span>
                  )}
                  {showPercentage && (
                    <span className="font-semibold text-[#f3ebdd]">
                      {Math.round(pct)}%
                    </span>
                  )}
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full border ${badge.style}`}
                  >
                    {badge.text}
                  </span>
                </div>
              </div>

              {/* Bar track */}
              <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-[#0c241e] border border-white/5">
                <div
                  role="progressbar"
                  aria-valuenow={pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${item.label}: ${Math.round(pct)}%`}
                  className={`h-full rounded-full transition-all duration-700 ease-out ${barColor}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
