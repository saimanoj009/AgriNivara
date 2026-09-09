import React from 'react';
import {
  Droplets,
  AlertTriangle,
  CheckCircle2,
  CloudRain,
  Thermometer,
  Sparkles,
  Clock,
  Compass,
  Layers,
  ShieldAlert,
  Info,
} from 'lucide-react';
import type { WeatherIntelligence, IrrigationDecision, IrrigationStatusCode } from '../types/agriculture';
import { calculateIrrigationDecision, useFarm } from '../context/FarmContext';

interface SmartIrrigationSectionProps {
  weather?: WeatherIntelligence | null;
  crop?: string;
  temperature?: number;
  humidity?: number;
  rainfall?: number;
  cropStage?: string;
  soilMoisture?: number;
  irrigationMethod?: string;
  decisionOverride?: IrrigationDecision;
}

export const SmartIrrigationSection: React.FC<SmartIrrigationSectionProps> = ({
  weather: propWeather,
  crop: propCrop,
  temperature,
  humidity,
  rainfall,
  cropStage,
  soilMoisture,
  irrigationMethod,
  decisionOverride,
}) => {
  // Use FarmContext if available as fallback/enrichment
  let farmContext: ReturnType<typeof useFarm> | null = null;
  try {
    farmContext = useFarm();
  } catch {
    // Component mounted outside FarmContext provider (e.g. standalone test)
  }

  const effectiveWeather: WeatherIntelligence | null = propWeather ?? farmContext?.weather ?? (
    temperature !== undefined
      ? {
          temperature: temperature ?? 28,
          humidity: humidity ?? 65,
          rainfall: rainfall ?? 0,
          condition: 'Partly Cloudy',
          windSpeed: 12,
          risk: 'Normal',
          forecast: [],
          isLoaded: true,
        }
      : null
  );

  const effectiveProfile = {
    location: farmContext?.farmProfile.location || 'Your Farm',
    primary_crop: propCrop || farmContext?.farmProfile.primary_crop || 'Rice (Paddy)',
    crop_stage: cropStage || farmContext?.farmProfile.crop_stage || 'Vegetative',
    irrigation_method: irrigationMethod || farmContext?.farmProfile.irrigation_method || 'Drip Irrigation',
    moisture_pct: soilMoisture ?? farmContext?.farmProfile.moisture_pct ?? 65,
  };

  const decision: IrrigationDecision = decisionOverride ?? calculateIrrigationDecision(
    effectiveProfile as any,
    effectiveWeather
  );

  const badgeConfig: Record<
    IrrigationStatusCode,
    { bg: string; text: string; border: string; icon: any }
  > = {
    IRRIGATE_NOW: {
      bg: 'bg-emerald-950/90',
      text: 'text-[#00B884]',
      border: 'border-emerald-500/40',
      icon: Droplets,
    },
    WAIT: {
      bg: 'bg-amber-950/80',
      text: 'text-[#E0B65A]',
      border: 'border-amber-500/40',
      icon: Clock,
    },
    IRRIGATE_LATER: {
      bg: 'bg-teal-950/80',
      text: 'text-[#2DD4BF]',
      border: 'border-teal-500/40',
      icon: Clock,
    },
    REDUCE_IRRIGATION: {
      bg: 'bg-teal-950/80',
      text: 'text-[#2DD4BF]',
      border: 'border-teal-500/40',
      icon: Droplets,
    },
    NO_IRRIGATION_REQUIRED: {
      bg: 'bg-sky-950/80',
      text: 'text-sky-300',
      border: 'border-sky-500/40',
      icon: CheckCircle2,
    },
    HEAVY_RAIN_DELAY: {
      bg: 'bg-indigo-950/80',
      text: 'text-indigo-300',
      border: 'border-indigo-500/40',
      icon: CloudRain,
    },
    WATER_STRESS_DETECTED: {
      bg: 'bg-rose-950/80',
      text: 'text-rose-300',
      border: 'border-rose-500/40',
      icon: AlertTriangle,
    },
  };

  const badge = badgeConfig[decision.status_code] || badgeConfig.IRRIGATE_NOW;
  const StatusIcon = badge.icon;

  return (
    <div className="p-6 sm:p-7 rounded-3xl bg-[#102D25] border border-white/10 shadow-xl shadow-black/40 space-y-6">
      
      {/* HEADER STRIP */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-[#071C17] border border-emerald-500/30 text-[#00B884] shadow-inner animate-droplet">
            <Droplets className="w-6 h-6 text-[#00B884]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-[#F3EBDD] tracking-tight">Smart Irrigation Advisor</h3>
              <span className="px-2.5 py-0.5 rounded-full bg-[#071C17] text-[#D6A84F] text-[10px] font-black uppercase tracking-wider border border-[#D6A84F]/30">
                DECISION LAYER
              </span>
            </div>
            <p className="text-xs text-[#A8B9AE] mt-0.5">
              Hydrological balance for <span className="font-bold text-[#F3EBDD]">{effectiveProfile.primary_crop}</span> ({effectiveProfile.crop_stage} stage)
            </p>
          </div>
        </div>

        <div className={`self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-black tracking-wider uppercase shadow-md ${badge.bg} ${badge.text} ${badge.border}`}>
          <StatusIcon className="w-4 h-4" />
          <span>{decision.status_label}</span>
        </div>
      </div>

      {/* DECISION & WHY? EXPLANATION CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* WHY? TRANSPARENT RATIONALE */}
        <div className="lg:col-span-8 p-5 rounded-2xl bg-[#0C241E] border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-black text-[#00B884] uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-[#00B884]" /> Why This Recommendation?
            </div>
            <span className="text-[10px] font-bold text-[#A8B9AE] uppercase">Multi-Factor Hydrological Model</span>
          </div>

          <h4 className="text-sm font-black text-[#F3EBDD]">{decision.title}</h4>
          <p className="text-xs text-[#A8B9AE] leading-relaxed font-medium">
            {decision.reason}
          </p>

          <div className="pt-3 border-t border-white/10 space-y-2">
            <div className="flex items-start gap-2 text-xs text-[#F3EBDD] font-semibold bg-[#12362B] p-3.5 rounded-xl border border-emerald-500/25">
              <Clock className="w-4 h-4 text-[#00B884] shrink-0 mt-0.5" />
              <div>
                <strong className="block text-[10px] uppercase text-[#00B884] tracking-wider">Recommended Action:</strong>
                <span>{decision.action_tip}</span>
              </div>
            </div>
          </div>
        </div>

        {/* METHOD & PRIORITY CARD */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-[#0C241E] border border-white/10 flex flex-col justify-between space-y-4">
          <div>
            <span className="text-[10px] font-black text-[#738A7C] uppercase tracking-wider block">Decision Priority</span>
            <div className="mt-1">
              <span className={`text-base font-black uppercase ${
                decision.priority === 'CRITICAL' ? 'text-rose-400' :
                decision.priority === 'HIGH' ? 'text-amber-400' :
                decision.priority === 'MODERATE' ? 'text-teal-400' : 'text-[#00B884]'
              }`}>
                {decision.priority} PRIORITY
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-white/10">
            <span className="text-[10px] font-black text-[#738A7C] uppercase tracking-wider block">Application Protocol</span>
            <p className="text-xs font-bold text-[#F3EBDD] mt-1 leading-snug">
              {decision.method_guidance}
            </p>
          </div>

          <div className="pt-2 text-[10px] text-[#738A7C] flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-[#00B884] shrink-0" />
            <span>Real-time evapotranspiration depth based on live satellite atmospheric moisture.</span>
          </div>
        </div>

      </div>

      {/* CONTRIBUTING TELEMETRY PILLS */}
      <div>
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#738A7C] block mb-2">
          Telemetry Factors Evaluated
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          
          <div className="p-3.5 rounded-xl bg-[#0C241E] border border-white/10 flex items-center gap-2.5">
            <Thermometer className="w-4 h-4 text-[#D6A84F] shrink-0" />
            <div>
              <span className="text-[10px] text-[#738A7C] uppercase block font-bold">Temperature</span>
              <span className="text-xs font-black text-[#F3EBDD]">{decision.factors.temperature}°C</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0C241E] border border-white/10 flex items-center gap-2.5">
            <Droplets className="w-4 h-4 text-[#2DD4BF] shrink-0" />
            <div>
              <span className="text-[10px] text-[#738A7C] uppercase block font-bold">Humidity</span>
              <span className="text-xs font-black text-[#F3EBDD]">{decision.factors.humidity}%</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0C241E] border border-white/10 flex items-center gap-2.5">
            <CloudRain className="w-4 h-4 text-sky-400 shrink-0" />
            <div>
              <span className="text-[10px] text-[#738A7C] uppercase block font-bold">48h Rain Forecast</span>
              <span className="text-xs font-black text-[#F3EBDD]">
                {decision.factors.forecast_rain_mm.toFixed(1)} mm ({decision.factors.forecast_rain_prob}%)
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0C241E] border border-white/10 flex items-center gap-2.5">
            <Compass className="w-4 h-4 text-[#00B884] shrink-0" />
            <div>
              <span className="text-[10px] text-[#738A7C] uppercase block font-bold">Soil Moisture Est.</span>
              <span className="text-xs font-black text-[#F3EBDD]">
                {decision.factors.soil_moisture_estimate || `${effectiveProfile.moisture_pct}%`}
              </span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
