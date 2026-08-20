import { MapPin, Sprout, AlertTriangle } from 'lucide-react';
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
    lang
}: FarmProfileSummaryProps) {
    const cropCap = recommendedCrop.charAt(0).toUpperCase() + recommendedCrop.slice(1);

    return (
        <div className="bg-gradient-to-br from-emerald-900 via-emerald-850 to-teal-900 text-white rounded-2xl p-6 shadow-xl border border-emerald-700/50 mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-emerald-700/60">
                
                {/* FARM SUMMARY & LOCATION */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full border border-emerald-400/30 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                            {inputs.location || 'Farm Location Not Set'}
                        </span>
                        <span className="bg-emerald-400/10 text-emerald-200 text-xs font-semibold px-2.5 py-1 rounded-full border border-emerald-500/20">
                            {t('aiModelTag', lang)}
                        </span>
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
                        <Sprout className="w-8 h-8 text-emerald-400 shrink-0" />
                        {cropCap}
                    </h1>

                    <p className="text-xs sm:text-sm text-emerald-200/90 font-medium">
                        {t('confidence', lang)}: <strong className="text-emerald-300 text-base">{confidence}%</strong>
                        <span className="text-emerald-400/80 text-xs ml-2">(High AI Probability)</span>
                    </p>
                </div>

                {/* SUITABILITY & RISK BADGES */}
                <div className="flex flex-wrap items-center gap-3">
                    
                    {/* SUITABILITY SCORE BADGE */}
                    <div className="bg-emerald-950/80 border border-emerald-600/60 rounded-xl px-4 py-3 text-center min-w-[130px]">
                        <span className="text-[10px] uppercase tracking-wider text-emerald-300 font-bold block">
                            Overall Suitability
                        </span>
                        <div className="text-2xl font-black text-white mt-0.5">
                            {suitability.overall}%
                        </div>
                        <span className={`inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-md mt-1 ${
                            suitability.status === 'GOOD'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                                : suitability.status === 'MODERATE'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                                : 'bg-rose-50/20 text-rose-300 border border-rose-400/40'
                        }`}>
                            {t(suitability.status === 'GOOD' ? 'good' : (suitability.status === 'MODERATE' ? 'moderate' : 'needsAttention'), lang)}
                        </span>
                    </div>

                    {/* MAIN RISK BADGE */}
                    <div className="bg-emerald-950/80 border border-emerald-600/60 rounded-xl px-4 py-3 text-center min-w-[130px]">
                        <span className="text-[10px] uppercase tracking-wider text-emerald-300 font-bold block">
                            Dominant Risk
                        </span>
                        <div className="text-xs font-bold text-amber-300 mt-1 flex items-center justify-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span className="truncate max-w-[120px]">{mainRisk || 'Low Risk'}</span>
                        </div>
                        <span className="text-[10px] text-emerald-300/80 block mt-1">
                            {t('ruleBasedTag', lang)}
                        </span>
                    </div>

                </div>

            </div>

            {/* FARM PARAMETER GRID */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mt-6">
                
                <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-xl p-3 text-center">
                    <span className="text-[10px] font-bold text-emerald-300/80 uppercase block">Nitrogen (N)</span>
                    <span className="text-base font-extrabold text-white">{inputs.N} <span className="text-xs font-normal text-emerald-300">mg/kg</span></span>
                </div>

                <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-xl p-3 text-center">
                    <span className="text-[10px] font-bold text-emerald-300/80 uppercase block">Phosphorus (P)</span>
                    <span className="text-base font-extrabold text-white">{inputs.P} <span className="text-xs font-normal text-emerald-300">mg/kg</span></span>
                </div>

                <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-xl p-3 text-center">
                    <span className="text-[10px] font-bold text-emerald-300/80 uppercase block">Potassium (K)</span>
                    <span className="text-base font-extrabold text-white">{inputs.K} <span className="text-xs font-normal text-emerald-300">mg/kg</span></span>
                </div>

                <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-xl p-3 text-center">
                    <span className="text-[10px] font-bold text-emerald-300/80 uppercase block">Soil pH</span>
                    <span className="text-base font-extrabold text-white">{inputs.ph}</span>
                </div>

                <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-xl p-3 text-center">
                    <span className="text-[10px] font-bold text-emerald-300/80 uppercase block">Temp (°C)</span>
                    <span className="text-base font-extrabold text-white">{inputs.temperature}°C</span>
                </div>

                <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-xl p-3 text-center">
                    <span className="text-[10px] font-bold text-emerald-300/80 uppercase block">Humidity (%)</span>
                    <span className="text-base font-extrabold text-white">{inputs.humidity}%</span>
                </div>

                <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-xl p-3 text-center col-span-2 sm:col-span-1">
                    <span className="text-[10px] font-bold text-emerald-300/80 uppercase block">Rainfall (mm)</span>
                    <span className="text-base font-extrabold text-white">{inputs.rainfall} <span className="text-xs font-normal text-emerald-300">mm</span></span>
                </div>

            </div>
        </div>
    );
}
