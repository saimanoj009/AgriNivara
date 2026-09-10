import { Layers } from 'lucide-react';
import type { AlternativeAnalysis, Language } from '../types/agriculture';
import { t } from '../utils/translations';

interface AlternativeCropComparisonProps {
    alternatives: AlternativeAnalysis[];
    lang: Language;
}

export function AlternativeCropComparison({ alternatives, lang }: AlternativeCropComparisonProps) {
    return (
        <div className="bg-[#102D25] rounded-3xl p-6 sm:p-7 shadow-xl border border-white/10 mb-8 text-[#F3EBDD]">
            
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-[#00B884]/15 text-[#00B884] font-bold border border-[#00B884]/30">
                        <Layers className="w-5 h-5 text-[#00B884]" />
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-[#F3EBDD]">
                            {t('topAlternatives', lang)}
                        </h2>
                        <p className="text-xs text-[#A8B9AE] font-medium">
                            Comparative suitability ranking across top 3 AI predicted crop candidates
                        </p>
                    </div>
                </div>

                <span className="self-start sm:self-center text-[11px] font-bold text-[#D6A84F] bg-[#D6A84F]/15 px-3 py-1 rounded-full border border-[#D6A84F]/30">
                    Ranked Comparison
                </span>
            </div>

            {/* COMPARISON TABLE */}
            <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                    <thead>
                        <tr className="border-b border-white/10 bg-[#0C241E] text-[#A8B9AE] font-bold uppercase text-[10px] tracking-wider">
                            <th className="py-3 px-4 rounded-l-xl">{t('ranking', lang)}</th>
                            <th className="py-3 px-4">{t('crop', lang)}</th>
                            <th className="py-3 px-4">{t('confidence', lang)}</th>
                            <th className="py-3 px-4">{t('soilFit', lang)}</th>
                            <th className="py-3 px-4">{t('weatherFit', lang)}</th>
                            <th className="py-3 px-4">{t('waterFit', lang)}</th>
                            <th className="py-3 px-4 rounded-r-xl">{t('riskLevel', lang)}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-medium">
                        {alternatives.map((item, idx) => {
                            const isFirst = idx === 0;
                            const cropCap = item.crop.charAt(0).toUpperCase() + item.crop.slice(1);

                            return (
                                <tr key={idx} className={isFirst ? 'bg-[#143B30]/50 font-bold' : 'hover:bg-[#0C241E]/50'}>
                                    
                                    {/* RANK */}
                                    <td className="py-3.5 px-4">
                                        <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-black ${
                                            isFirst ? 'bg-[#D6A84F] text-[#071C17]' : 'bg-[#0C241E] text-[#A8B9AE] border border-white/10'
                                        }`}>
                                            #{idx + 1}
                                        </span>
                                    </td>

                                    {/* CROP NAME & BADGE */}
                                    <td className="py-3.5 px-4">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-sm font-bold text-[#F3EBDD]">{cropCap}</span>
                                            {isFirst && (
                                                <span className="bg-[#00B884]/20 text-[#00B884] text-[9px] font-extrabold px-2 py-0.5 rounded-full border border-[#00B884]/30">
                                                    Top Choice
                                                </span>
                                            )}
                                            {item.source === 'ml' && !isFirst && (
                                                <span className="bg-[#38BDF8]/15 text-[#38BDF8] text-[9px] font-bold px-1.5 py-0.5 rounded border border-[#38BDF8]/30">
                                                    🤖 AI ML
                                                </span>
                                            )}
                                            {item.source === 'agronomic' && (
                                                <span className="bg-[#D6A84F]/15 text-[#D6A84F] text-[9px] font-bold px-1.5 py-0.5 rounded border border-[#D6A84F]/30">
                                                    🌱 Agronomic Alt
                                                </span>
                                            )}
                                        </div>
                                    </td>

                                    {/* CONFIDENCE */}
                                    <td className="py-3.5 px-4 text-[#00B884] font-bold">
                                        {item.confidence}%
                                    </td>

                                    {/* SOIL FIT */}
                                    <td className="py-3.5 px-4 text-[#A8B9AE]">
                                        {item.soil_fit}
                                    </td>

                                    {/* WEATHER FIT */}
                                    <td className="py-3.5 px-4 text-[#A8B9AE]">
                                        {item.weather_fit}
                                    </td>

                                    {/* WATER FIT */}
                                    <td className="py-3.5 px-4 text-[#A8B9AE]">
                                        {item.water_fit}
                                    </td>

                                    {/* RISK LEVEL */}
                                    <td className="py-3.5 px-4">
                                        <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${
                                            item.risk_rating === 'LOW' ? 'bg-[#00B884]/20 text-[#00B884] border-[#00B884]/30' :
                                            item.risk_rating === 'MODERATE' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                                            'bg-rose-500/20 text-rose-300 border-rose-500/30'
                                        }`}>
                                            {item.risk_rating}
                                        </span>
                                    </td>

                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

        </div>
    );
}
