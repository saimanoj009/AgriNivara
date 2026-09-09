import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Cpu,
} from 'lucide-react';
import type { ExplainabilityItem, Language } from '../types/agriculture';
import { t } from '../utils/translations';

interface ExplainableAISectionProps {
  items: ExplainabilityItem[];
  recommendedCrop: string;
  confidence?: number | null;
  lang: Language;
}

export function ExplainableAISection({
  items,
  recommendedCrop,
  confidence,
  lang,
}: ExplainableAISectionProps) {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const cropCap = recommendedCrop.charAt(0).toUpperCase() + recommendedCrop.slice(1);

  return (
    <div className="bg-[#102D25] rounded-3xl p-6 sm:p-7 shadow-xl border border-white/10 mb-8 space-y-6 text-[#F3EBDD]">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-[#00B884]/15 text-[#00B884] font-bold border border-[#00B884]/30">
            <Sparkles className="w-5 h-5 text-[#00B884]" />
          </div>
          <div>
            <h2 className="text-lg font-black text-[#F3EBDD] tracking-tight">
              {t('whyThisCrop', lang)}: <span className="text-[#00B884]">{cropCap}</span>
            </h2>
            <p className="text-xs text-[#A8B9AE] font-medium">
              Transparent agronomic breakdown linking farm inputs directly to crop physiological requirements
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {confidence !== undefined && confidence !== null && (
            <span className="text-xs font-black text-[#00B884] bg-[#00B884]/15 px-3 py-1 rounded-full border border-[#00B884]/30">
              Confidence: {confidence}%
            </span>
          )}
          <span className="text-[10px] font-bold text-[#A8B9AE] bg-[#0C241E] px-3 py-1 rounded-full border border-white/10 uppercase tracking-wider">
            Explainable AI
          </span>
        </div>
      </div>

      {/* FEATURE EXPLANATION CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {items.map((item, idx) => {
          const isGood = item.status === 'good';
          const isModerate = item.status === 'moderate';

          return (
            <div
              key={idx}
              className={`p-4 rounded-2xl border transition-all ${
                isGood
                  ? 'bg-[#0C241E] border-[#00B884]/30 text-[#F3EBDD]'
                  : isModerate
                  ? 'bg-[#0C241E] border-amber-500/30 text-[#F3EBDD]'
                  : 'bg-[#0C241E] border-rose-500/30 text-[#F3EBDD]'
              }`}
            >
              <div className="flex items-start gap-3">
                {isGood ? (
                  <CheckCircle2 className="w-5 h-5 text-[#00B884] shrink-0 mt-0.5" />
                ) : isModerate ? (
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                )}

                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#F3EBDD]">
                      {item.feature}
                    </span>
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                        isGood
                          ? 'bg-[#00B884]/20 text-[#00B884] border border-[#00B884]/30'
                          : isModerate
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      Target: {item.optimal_range}
                    </span>
                  </div>

                  <p className="text-xs font-medium leading-relaxed text-[#A8B9AE]">
                    {item.message}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* TECHNICAL DETAILS EXPANDABLE ACCORDION (For SIH Judges & Agronomists) */}
      <div className="pt-2 border-t border-white/10">
        <button
          type="button"
          onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
          className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#0C241E] hover:bg-[#143B30] text-xs font-bold text-[#F3EBDD] transition cursor-pointer border border-white/10"
        >
          <span className="flex items-center gap-2">
            <Cpu size={14} className="text-[#00B884]" />
            <span>Technical Details & Model Architecture (Judges & Agronomists)</span>
          </span>
          {showTechnicalDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {showTechnicalDetails && (
          <div className="mt-3 p-4 rounded-2xl bg-[#0C241E] border border-white/10 text-xs space-y-3 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-[#102D25] border border-white/10">
                <span className="text-[10px] font-bold text-[#738A7C] uppercase block">Model Algorithm</span>
                <span className="font-black text-[#F3EBDD]">Random Forest Classifier</span>
                <span className="block text-[10px] text-[#00B884] font-semibold mt-0.5">51 Regional Crop Classes</span>
              </div>
              <div className="p-3 rounded-xl bg-[#102D25] border border-white/10">
                <span className="text-[10px] font-bold text-[#738A7C] uppercase block">Explainability Engine</span>
                <span className="font-black text-[#F3EBDD]">Agronomic Boundary Metric</span>
                <span className="block text-[10px] text-[#A8B9AE] font-semibold mt-0.5">Gaussian Fit against ICAR standards</span>
              </div>
              <div className="p-3 rounded-xl bg-[#102D25] border border-white/10">
                <span className="text-[10px] font-bold text-[#738A7C] uppercase block">Model Verification</span>
                <span className="font-black text-[#F3EBDD]">100% Deterministic Weights</span>
                <span className="block text-[10px] text-[#A8B9AE] font-semibold mt-0.5">Scikit-learn joblib bundle</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#102D25] border border-white/10 text-[#A8B9AE] leading-relaxed text-[11px]">
              <strong className="text-[#F3EBDD]">Mathematical Explanation Formulation:</strong> Explanations represent direct mathematical feature boundary evaluations comparing actual farm inputs against established crop agronomic requirement profiles. Confidence is the normalized probability distribution across estimator decision trees.
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
