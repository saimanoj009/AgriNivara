import React from 'react';
import { MapPin, Sprout, AlertTriangle, ShieldCheck } from 'lucide-react';
import type { FarmInputs, Language, SuitabilityScores } from '../types/agriculture';
import { t } from '../utils/translations';

interface FarmProfileSummaryProps {
  inputs: FarmInputs;
  recommendedCrop: string;
  confidence: number;
  suitability: SuitabilityScores;
  mainRisk: string;
  lang: Language;
}

export function FarmProfileSummary({
  inputs,
  recommendedCrop,
  confidence,
  suitability,
  mainRisk,
  lang,
}: FarmProfileSummaryProps) {
  const cropCap = recommendedCrop.charAt(0).toUpperCase() + recommendedCrop.slice(1);

  return (
    <div className="bg-[#102D25] rounded-3xl p-6 sm:p-7 shadow-xl shadow-black/40 border border-white/10 mb-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
        
        {/* FARM SUMMARY & LOCATION */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-950/80 text-[#00B884] text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#00B884]" />
              {inputs.location || 'Farm Location Set'}
            </span>
            <span className="bg-[#0C241E] text-[#D6A84F] text-xs font-bold px-2.5 py-1 rounded-full border border-[#D6A84F]/30">
              {t('aiModelTag', lang)}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#F3EBDD] flex items-center gap-3">
            <Sprout className="w-8 h-8 text-[#00B884] shrink-0" />
            {cropCap}
          </h1>

          <p className="text-xs sm:text-sm text-[#A8B9AE] font-medium">
            {t('confidence', lang)}: <strong className="text-[#00B884] text-base">{confidence}%</strong>
            <span className="text-[#738A7C] text-xs ml-2">(High Agronomic Match)</span>
          </p>
        </div>

        {/* SUITABILITY & RISK BADGES */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* SUITABILITY SCORE BADGE */}
          <div className="bg-[#0C241E] border border-white/10 rounded-2xl px-4 py-3 text-center min-w-[130px] shadow-inner">
            <span className="text-[10px] uppercase tracking-wider text-[#738A7C] font-bold block">
              Overall Suitability
            </span>
            <div className="text-2xl font-black text-[#F3EBDD] mt-0.5">
              {suitability.overall}%
            </div>
            <span
              className={`inline-block text-[10px] font-black px-2 py-0.5 rounded-md mt-1 ${
                suitability.status === 'GOOD'
                  ? 'bg-emerald-950 text-[#00B884] border border-emerald-500/30'
                  : suitability.status === 'MODERATE'
                  ? 'bg-amber-950 text-[#E0B65A] border border-amber-500/30'
                  : 'bg-rose-950 text-rose-400 border border-rose-500/30'
              }`}
            >
              {t(
                suitability.status === 'GOOD'
                  ? 'good'
                  : suitability.status === 'MODERATE'
                  ? 'moderate'
                  : 'needsAttention',
                lang
              )}
            </span>
          </div>

          {/* MAIN RISK BADGE */}
          <div className="bg-[#0C241E] border border-white/10 rounded-2xl px-4 py-3 text-center min-w-[130px] shadow-inner">
            <span className="text-[10px] uppercase tracking-wider text-[#738A7C] font-bold block">
              Dominant Risk
            </span>
            <div className="text-xs font-bold text-amber-400 mt-1 flex items-center justify-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate max-w-[120px]">{mainRisk || 'Low Risk'}</span>
            </div>
            <span className="text-[10px] text-[#738A7C] block mt-1">
              {t('ruleBasedTag', lang)}
            </span>
          </div>

        </div>

      </div>

      {/* FARM PARAMETER GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-[#0C241E] border border-white/10 rounded-xl p-3 text-center">
          <span className="text-[10px] font-bold text-[#738A7C] uppercase block">Nitrogen (N)</span>
          <span className="text-base font-black text-[#F3EBDD]">
            {inputs.N} <span className="text-xs font-normal text-[#738A7C]">ppm</span>
          </span>
        </div>

        <div className="bg-[#0C241E] border border-white/10 rounded-xl p-3 text-center">
          <span className="text-[10px] font-bold text-[#738A7C] uppercase block">Phosphorus (P)</span>
          <span className="text-base font-black text-[#F3EBDD]">
            {inputs.P} <span className="text-xs font-normal text-[#738A7C]">ppm</span>
          </span>
        </div>

        <div className="bg-[#0C241E] border border-white/10 rounded-xl p-3 text-center">
          <span className="text-[10px] font-bold text-[#738A7C] uppercase block">Potassium (K)</span>
          <span className="text-base font-black text-[#F3EBDD]">
            {inputs.K} <span className="text-xs font-normal text-[#738A7C]">ppm</span>
          </span>
        </div>

        <div className="bg-[#0C241E] border border-white/10 rounded-xl p-3 text-center">
          <span className="text-[10px] font-bold text-[#738A7C] uppercase block">Soil pH</span>
          <span className="text-base font-black text-[#F3EBDD]">{inputs.ph}</span>
        </div>

        <div className="bg-[#0C241E] border border-white/10 rounded-xl p-3 text-center">
          <span className="text-[10px] font-bold text-[#738A7C] uppercase block">Temp (°C)</span>
          <span className="text-base font-black text-[#F3EBDD]">{inputs.temperature}°C</span>
        </div>

        <div className="bg-[#0C241E] border border-white/10 rounded-xl p-3 text-center">
          <span className="text-[10px] font-bold text-[#738A7C] uppercase block">Humidity (%)</span>
          <span className="text-base font-black text-[#F3EBDD]">{inputs.humidity}%</span>
        </div>

        <div className="bg-[#0C241E] border border-white/10 rounded-xl p-3 text-center col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold text-[#738A7C] uppercase block">Rainfall (mm)</span>
          <span className="text-base font-black text-[#F3EBDD]">
            {inputs.rainfall} <span className="text-xs font-normal text-[#738A7C]">mm</span>
          </span>
        </div>
      </div>
    </div>
  );
}
