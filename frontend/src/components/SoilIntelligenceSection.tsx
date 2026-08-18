import { Activity, Info } from 'lucide-react';
import type { FarmInputs, Language, SoilIntelligence } from '../types/agriculture';
import { t } from '../utils/translations';

interface SoilIntelligenceSectionProps {
    inputs: FarmInputs;
    soilIntel: SoilIntelligence;
    recommendedCrop: string;
    lang: Language;
}

export function SoilIntelligenceSection({ inputs, soilIntel, recommendedCrop, lang }: SoilIntelligenceSectionProps) {
    const cropCap = recommendedCrop.charAt(0).toUpperCase() + recommendedCrop.slice(1);

    const getBadgeCls = (level: string) => {
        if (level === 'HIGH' || level === 'SUITABLE') return 'bg-emerald-100 text-emerald-800 border-emerald-300';
        if (level === 'MODERATE') return 'bg-amber-100 text-amber-800 border-amber-300';
        return 'bg-rose-100 text-rose-800 border-rose-300';
    };

    return (
        <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200 mb-8">
            
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 font-bold">
                        <Activity className="w-5 h-5 text-emerald-700" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">
                            {t('soilIntelligence', lang)}
                        </h2>
                        <p className="text-xs text-slate-500 font-medium">
                            Standardized soil nutrient and pH status indicators for <strong className="text-emerald-700">{cropCap}</strong>
                        </p>
                    </div>
                </div>

                <span className="self-start sm:self-center text-[11px] font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                    Decision Support
                </span>
            </div>

            {/* NUTRIENT CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
                
                {/* NITROGEN */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Nitrogen (N)</span>
                    <div className="flex items-baseline justify-between mt-1">
                        <span className="text-xl font-black text-slate-900">{inputs.N} <span className="text-xs text-slate-400 font-normal">mg/kg</span></span>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${getBadgeCls(soilIntel.N)}`}>
                            {soilIntel.N}
                        </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-2">
                        {soilIntel.N === 'HIGH' ? 'Sufficient vegetative leafy growth support.' : 'Top dressing nitrogen application recommended.'}
                    </p>
                </div>

                {/* PHOSPHORUS */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Phosphorus (P)</span>
                    <div className="flex items-baseline justify-between mt-1">
                        <span className="text-xl font-black text-slate-900">{inputs.P} <span className="text-xs text-slate-400 font-normal">mg/kg</span></span>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${getBadgeCls(soilIntel.P)}`}>
                            {soilIntel.P}
                        </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-2">
                        {soilIntel.P === 'HIGH' ? 'Excellent root establishment support.' : 'DAP or Single Super Phosphate addition advised.'}
                    </p>
                </div>

                {/* POTASSIUM */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Potassium (K)</span>
                    <div className="flex items-baseline justify-between mt-1">
                        <span className="text-xl font-black text-slate-900">{inputs.K} <span className="text-xs text-slate-400 font-normal">mg/kg</span></span>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${getBadgeCls(soilIntel.K)}`}>
                            {soilIntel.K}
                        </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-2">
                        {soilIntel.K === 'HIGH' ? 'Enhances disease resistance & grain filling.' : 'Muriate of Potash application recommended.'}
                    </p>
                </div>

                {/* PH */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Soil pH Status</span>
                    <div className="flex items-baseline justify-between mt-1">
                        <span className="text-xl font-black text-slate-900">{inputs.ph}</span>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${getBadgeCls(soilIntel.ph)}`}>
                            {soilIntel.ph}
                        </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-2">
                        {soilIntel.ph === 'SUITABLE' ? 'Optimal micro-nutrient availability.' : 'pH adjustment required for max nutrient uptake.'}
                    </p>
                </div>

            </div>

            {/* DISCLAIMER */}
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2 text-xs text-amber-900">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                    <strong>Disclaimer:</strong> {soilIntel.disclaimer || 'These indicators provide decision support. Always consult a government-certified laboratory soil test report for precise fertilizer recommendations.'}
                </span>
            </div>

        </div>
    );
}
