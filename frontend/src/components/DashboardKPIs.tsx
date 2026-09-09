import React from 'react';
import {
  Layers,
  Sprout,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  MapPin,
  ShieldCheck,
  Sparkles,
  Compass,
} from 'lucide-react';
import { AnimatedCounter } from './ui/AnimatedCounter';

export interface DashboardKPIsProps {
  totalAcres?: number;
  activeCropsCount?: number;
  healthIndex?: number;
  activeAlertsCount?: number;
  actionsExecuted?: number;
  yieldBoostPct?: number;
  location?: string;
  className?: string;
}

export function DashboardKPIs({
  totalAcres = 12.5,
  activeCropsCount = 3,
  healthIndex = 96,
  activeAlertsCount = 2,
  actionsExecuted = 18,
  yieldBoostPct = 24.8,
  location = 'Warangal, Telangana',
  className = '',
}: DashboardKPIsProps) {
  const kpis = [
    {
      id: 'kpi-area',
      title: 'Monitored Farm Area',
      value: totalAcres,
      suffix: ' Acres',
      decimals: 1,
      badge: 'Live GPS Synced',
      badgeColor: 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30',
      icon: <Layers className="w-5 h-5 text-[#00b884]" />,
      subtext: location || 'Field Precision Grid',
      glow: 'group-hover:border-emerald-500/50',
    },
    {
      id: 'kpi-crops',
      title: 'Active Crops & Health',
      value: healthIndex,
      suffix: '% Vigor',
      decimals: 0,
      badge: `${activeCropsCount} Standing Crops`,
      badgeColor: 'text-teal-300 bg-teal-500/15 border-teal-500/30',
      icon: <Sprout className="w-5 h-5 text-teal-400" />,
      subtext: 'Optimal Photosynthesis & Soil NPK',
      glow: 'group-hover:border-teal-500/50',
    },
    {
      id: 'kpi-alerts',
      title: 'Agro-Climate Alerts',
      value: activeAlertsCount,
      suffix: ' Active',
      decimals: 0,
      badge: activeAlertsCount > 0 ? 'Action Recommended' : 'All Clear',
      badgeColor:
        activeAlertsCount > 0
          ? 'text-amber-300 bg-amber-500/15 border-amber-500/30'
          : 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30',
      icon: (
        <AlertTriangle
          className={`w-5 h-5 ${
            activeAlertsCount > 0 ? 'text-amber-400' : 'text-emerald-400'
          }`}
        />
      ),
      subtext: '48h Open-Meteo & Radar Forecast',
      glow:
        activeAlertsCount > 0
          ? 'group-hover:border-amber-500/50'
          : 'group-hover:border-emerald-500/50',
    },
    {
      id: 'kpi-actions',
      title: 'Smart Actions Executed',
      value: actionsExecuted,
      suffix: ' Tasks',
      decimals: 0,
      badge: `+${yieldBoostPct}% Yield Projected`,
      badgeColor: 'text-[#d6a84f] bg-[#d6a84f]/15 border-[#d6a84f]/30',
      icon: <Sparkles className="w-5 h-5 text-[#d6a84f]" />,
      subtext: 'Irrigation & Nutrient Optimizations',
      glow: 'group-hover:border-[#d6a84f]/50',
    },
  ];

  return (
    <section aria-label="Farm Performance KPIs" className={`w-full ${className}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {kpis.map((kpi) => (
          <div
            key={kpi.id}
            className={`group relative overflow-hidden rounded-2xl bg-[#102d25] border border-white/10 p-5 shadow-lg shadow-black/25 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/40 ${kpi.glow}`}
          >
            {/* Background subtle radial glow */}
            <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/15 transition-all duration-500" />

            <div className="flex items-start justify-between gap-3">
              <div className="p-2.5 rounded-xl bg-[#0c241e] border border-white/10 shadow-inner">
                {kpi.icon}
              </div>
              <span
                className={`text-[11px] font-medium px-2.5 py-1 rounded-full border ${kpi.badgeColor}`}
              >
                {kpi.badge}
              </span>
            </div>

            <div className="mt-4">
              <p className="text-xs font-medium text-[#a8b9ae] uppercase tracking-wider">
                {kpi.title}
              </p>
              <div className="mt-1 flex items-baseline gap-1 text-2xl sm:text-3xl font-bold text-[#f3ebdd] tracking-tight">
                <AnimatedCounter
                  value={kpi.value}
                  decimals={kpi.decimals}
                  duration={1200}
                />
                <span className="text-sm sm:text-base font-semibold text-[#a8b9ae]">
                  {kpi.suffix}
                </span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-1.5 text-xs text-[#a8b9ae]/80">
              <Compass className="w-3.5 h-3.5 text-[#00b884] shrink-0" />
              <span className="truncate">{kpi.subtext}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
