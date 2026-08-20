import { Gauge, Layers, CloudSun, Droplets, Activity } from 'lucide-react';
import type { Language, SuitabilityScores } from '../types/agriculture';
import { t } from '../utils/translations';

interface FarmSuitabilityScoresProps {
    suitability: SuitabilityScores;
    lang: Language;
}

export function FarmSuitabilityScores({ suitability, lang }: FarmSuitabilityScoresProps) {
    const categories = [
        {
            key: 'soil',
            label: 'Soil Suitability',
            score: suitability.soil,
            icon: Layers,
            color: 'emerald',
            desc: 'Soil pH & physical matrix suitability'
        },
        {
            key: 'weather',
            label: 'Weather Suitability',
            score: suitability.weather,
            icon: CloudSun,
            color: 'sky',
            desc: 'Temperature & relative atmospheric humidity'
        },
        {
            key: 'water',
            label: 'Water / Rainfall Fit',
            score: suitability.water,
            icon: Droplets,
            color: 'blue',
            desc: 'Seasonal rainfall & crop water requirement'
        },
        {
            key: 'nutrients',
            label: 'Nutrient Balance (NPK)',
            score: suitability.nutrients,
            icon: Activity,
            color: 'teal',
            desc: 'Nitrogen, Phosphorus, Potassium levels'
        }
    ];

    const getBadgeStyle = (score: number) => {
        if (score >= 75) return { text: t('good', lang), cls: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
        if (score >= 55) return { text: t('moderate', lang), cls: 'bg-amber-100 text-amber-800 border-amber-300' };
        return { text: t('needsAttention', lang), cls: 'bg-rose-100 text-rose-800 border-rose-300' };
    };

    return (
        <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200 mb-8">
            
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-teal-100 text-teal-800 font-bold">
                        <Gauge className="w-5 h-5 text-teal-700" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">
                            {t('farmSuitability', lang)}
                        </h2>
                        <p className="text-xs text-slate-500 font-medium">
                            Multi-dimensional agronomic compatibility scoring
                        </p>
                    </div>
                </div>

                {/* OVERALL BADGE */}
                <div className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl">
                    <span className="text-xs text-slate-300 font-medium">Overall Score:</span>
                    <span className="text-lg font-black text-emerald-400">{suitability.overall}%</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        suitability.overall >= 75 ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                        suitability.overall >= 55 ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                        'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    }`}>
                        {getBadgeStyle(suitability.overall).text}
                    </span>
                </div>
            </div>

            {/* SUITABILITY PROGRESS BARS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {categories.map((cat) => {
                    const badge = getBadgeStyle(cat.score);
                    const IconComponent = cat.icon;

                    return (
                        <div key={cat.key} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                                        <IconComponent className="w-4 h-4" />
                                    </div>
                                    <span className="text-xs font-bold text-slate-800">{cat.label}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-extrabold text-slate-900">{cat.score}%</span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${badge.cls}`}>
                                        {badge.text}
                                    </span>
                                </div>
                            </div>

                            {/* PROGRESS BAR */}
                            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden mb-1.5">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ${
                                        cat.score >= 75 ? 'bg-emerald-500' : cat.score >= 55 ? 'bg-amber-500' : 'bg-rose-500'
                                    }`}
                                    style={{ width: `${cat.score}%` }}
                                />
                            </div>

                            <p className="text-[11px] text-slate-500">{cat.desc}</p>
                        </div>
                    );
                })}
            </div>

        </div>
    );
}
