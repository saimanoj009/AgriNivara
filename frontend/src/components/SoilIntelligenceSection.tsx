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
        if (level === 'HIGH' || level === 'SUITABLE') return 'bg-[#00B884]/20 text-[#00B884] border-[#00B884]/30';
        if (level === 'MODERATE') return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
    };

    return (
        <div className="bg-[#102D25] rounded-3xl p-6 sm:p-7 shadow-xl border border-white/10 mb-8 text-[#F3EBDD]">
            
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-[#00B884]/15 text-[#00B884] font-bold border border-[#00B884]/30">
                        <Activity className="w-5 h-5 text-[#00B884]" />
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-[#F3EBDD]">
                            {t('soilIntelligence', lang)}
                        </h2>
                        <p className="text-xs text-[#A8B9AE] font-medium">
                            Standardized soil nutrient and pH status indicators for <strong className="text-[#00B884]">{cropCap}</strong>
                        </p>
                    </div>
                </div>

                <span className="self-start sm:self-center text-[11px] font-bold text-[#A8B9AE] bg-[#0C241E] px-3 py-1 rounded-full border border-white/10">
                    Decision Support
                </span>
            </div>

            {/* NUTRIENT CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
                
                {/* NITROGEN */}
                <div className="p-4 rounded-xl border border-white/5 bg-[#0C241E]">
                    <span className="text-[10px] font-bold text-[#738A7C] uppercase block">Nitrogen (N)</span>
                    <div className="flex items-baseline justify-between mt-1">
                        <span className="text-xl font-black text-[#F3EBDD]">{inputs.N} <span className="text-xs text-[#738A7C] font-normal">mg/kg</span></span>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${getBadgeCls(soilIntel.N)}`}>
                            {soilIntel.N}
                        </span>
                    </div>
                    <p className="text-[11px] text-[#A8B9AE] mt-2">
                        {soilIntel.N === 'HIGH' ? 'Sufficient vegetative leafy growth support.' : 'Top dressing nitrogen application recommended.'}
                    </p>
                </div>

                {/* PHOSPHORUS */}
                <div className="p-4 rounded-xl border border-white/5 bg-[#0C241E]">
                    <span className="text-[10px] font-bold text-[#738A7C] uppercase block">Phosphorus (P)</span>
                    <div className="flex items-baseline justify-between mt-1">
                        <span className="text-xl font-black text-[#F3EBDD]">{inputs.P} <span className="text-xs text-[#738A7C] font-normal">mg/kg</span></span>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${getBadgeCls(soilIntel.P)}`}>
                            {soilIntel.P}
                        </span>
                    </div>
                    <p className="text-[11px] text-[#A8B9AE] mt-2">
                        {soilIntel.P === 'HIGH' ? 'Excellent root establishment support.' : 'DAP or Single Super Phosphate addition advised.'}
                    </p>
                </div>

                {/* POTASSIUM */}
                <div className="p-4 rounded-xl border border-white/5 bg-[#0C241E]">
                    <span className="text-[10px] font-bold text-[#738A7C] uppercase block">Potassium (K)</span>
                    <div className="flex items-baseline justify-between mt-1">
                        <span className="text-xl font-black text-[#F3EBDD]">{inputs.K} <span className="text-xs text-[#738A7C] font-normal">mg/kg</span></span>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${getBadgeCls(soilIntel.K)}`}>
                            {soilIntel.K}
                        </span>
                    </div>
                    <p className="text-[11px] text-[#A8B9AE] mt-2">
                        {soilIntel.K === 'HIGH' ? 'Enhances disease resistance & grain filling.' : 'Muriate of Potash application recommended.'}
                    </p>
                </div>

                {/* PH */}
                <div className="p-4 rounded-xl border border-white/5 bg-[#0C241E]">
                    <span className="text-[10px] font-bold text-[#738A7C] uppercase block">Soil pH Status</span>
                    <div className="flex items-baseline justify-between mt-1">
                        <span className="text-xl font-black text-[#F3EBDD]">{inputs.ph}</span>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${getBadgeCls(soilIntel.ph)}`}>
                            {soilIntel.ph}
                        </span>
                    </div>
                    <p className="text-[11px] text-[#A8B9AE] mt-2">
                        {soilIntel.ph === 'SUITABLE' ? 'Optimal micro-nutrient availability.' : 'pH adjustment required for max nutrient uptake.'}
                    </p>
                </div>

            </div>

            {/* DISCLAIMER */}
            <div className="p-3 rounded-xl bg-[#0C241E] border border-amber-500/30 flex items-start gap-2 text-xs text-amber-300">
                <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                    <strong>Disclaimer:</strong> {soilIntel.disclaimer || 'These indicators provide decision support. Always consult a government-certified laboratory soil test report for precise fertilizer recommendations.'}
                </span>
            </div>

        </div>
    );
}
