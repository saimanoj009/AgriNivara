import { Layers } from 'lucide-react';
import type { AlternativeAnalysis, Language } from '../types/agriculture';
import { t } from '../utils/translations';

interface AlternativeCropComparisonProps {
    alternatives: AlternativeAnalysis[];
    lang: Language;
}

export function AlternativeCropComparison({ alternatives, lang }: AlternativeCropComparisonProps) {
    return (
        <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200 mb-8">
            
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-purple-100 text-purple-800 font-bold">
                        <Layers className="w-5 h-5 text-purple-700" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">
                            {t('topAlternatives', lang)}
                        </h2>
                        <p className="text-xs text-slate-500 font-medium">
                            Comparative suitability ranking across top 3 AI predicted crop candidates
                        </p>
                    </div>
                </div>

                <span className="self-start sm:self-center text-[11px] font-bold text-purple-800 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                    Ranked Comparison
                </span>
            </div>

            {/* COMPARISON TABLE */}
            <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                    <thead>
                        <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                            <th className="py-3 px-4 rounded-l-lg">{t('ranking', lang)}</th>
                            <th className="py-3 px-4">{t('crop', lang)}</th>
                            <th className="py-3 px-4">{t('confidence', lang)}</th>
                            <th className="py-3 px-4">{t('soilFit', lang)}</th>
                            <th className="py-3 px-4">{t('weatherFit', lang)}</th>
                            <th className="py-3 px-4">{t('waterFit', lang)}</th>
                            <th className="py-3 px-4 rounded-r-lg">{t('riskLevel', lang)}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                        {alternatives.map((item, idx) => {
                            const isFirst = idx === 0;
                            const cropCap = item.crop.charAt(0).toUpperCase() + item.crop.slice(1);

                            return (
                                <tr key={idx} className={isFirst ? 'bg-emerald-50/50 font-bold' : 'hover:bg-slate-50'}>
                                    
                                    {/* RANK */}
                                    <td className="py-3.5 px-4">
                                        <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-black ${
                                            isFirst ? 'bg-amber-400 text-amber-950' : 'bg-slate-200 text-slate-700'
                                        }`}>
                                            #{idx + 1}
                                        </span>
                                    </td>

                                    {/* CROP NAME */}
                                    <td className="py-3.5 px-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-slate-900">{cropCap}</span>
                                            {isFirst && (
                                                <span className="bg-emerald-100 text-emerald-800 text-[9px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-300">
                                                    Top Choice
                                                </span>
                                            )}
                                        </div>
                                    </td>

                                    {/* CONFIDENCE */}
                                    <td className="py-3.5 px-4 text-emerald-700 font-bold">
                                        {item.confidence}%
                                    </td>

                                    {/* SOIL FIT */}
                                    <td className="py-3.5 px-4 text-slate-700">
                                        {item.soil_fit}
                                    </td>

                                    {/* WEATHER FIT */}
                                    <td className="py-3.5 px-4 text-slate-700">
                                        {item.weather_fit}
                                    </td>

                                    {/* WATER FIT */}
                                    <td className="py-3.5 px-4 text-slate-700">
                                        {item.water_fit}
                                    </td>

                                    {/* RISK LEVEL */}
                                    <td className="py-3.5 px-4">
                                        <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${
                                            item.risk_rating === 'LOW' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                                            item.risk_rating === 'MODERATE' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                                            'bg-rose-100 text-rose-800 border-rose-300'
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
