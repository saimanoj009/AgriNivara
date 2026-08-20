import { CheckCircle2, AlertTriangle, AlertCircle, Info, Sparkles } from 'lucide-react';
import type { ExplainabilityItem, Language } from '../types/agriculture';
import { t } from '../utils/translations';

interface ExplainableAISectionProps {
    items: ExplainabilityItem[];
    recommendedCrop: string;
    lang: Language;
}

export function ExplainableAISection({ items, recommendedCrop, lang }: ExplainableAISectionProps) {
    const cropCap = recommendedCrop.charAt(0).toUpperCase() + recommendedCrop.slice(1);

    return (
        <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200 mb-8">
            
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 font-bold">
                        <Sparkles className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">
                            {t('whyThisCrop', lang)}: <span className="text-emerald-700">{cropCap}</span>
                        </h2>
                        <p className="text-xs text-slate-500 font-medium">
                            Explainable AI (XAI) feature breakdown based on actual farm input parameters
                        </p>
                    </div>
                </div>

                <span className="self-start sm:self-center text-[11px] font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                    {t('ruleBasedTag', lang)}
                </span>
            </div>

            {/* FEATURE EXPLANATION LIST */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {items.map((item, idx) => {
                    const isGood = item.status === 'good';
                    const isModerate = item.status === 'moderate';

                    return (
                        <div
                            key={idx}
                            className={`p-4 rounded-xl border transition-all ${
                                isGood
                                    ? 'bg-emerald-50/60 border-emerald-200/80 text-emerald-950'
                                    : isModerate
                                    ? 'bg-amber-50/60 border-amber-200/80 text-amber-950'
                                    : 'bg-rose-50/60 border-rose-200/80 text-rose-950'
                            }`}
                        >
                            <div className="flex items-start gap-3">
                                {isGood ? (
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                                ) : isModerate ? (
                                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                ) : (
                                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                                )}

                                <div className="space-y-1 flex-1">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                            {item.feature}
                                        </span>
                                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                                            isGood
                                                ? 'bg-emerald-200 text-emerald-800'
                                                : isModerate
                                                ? 'bg-amber-200 text-amber-800'
                                                : 'bg-rose-200 text-rose-800'
                                        }`}>
                                            Target: {item.optimal_range}
                                        </span>
                                    </div>

                                    <p className="text-xs font-medium leading-relaxed">
                                        {item.message}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* XAI NOTICE */}
            <div className="mt-5 p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2 text-xs text-slate-600">
                <Info className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                    <strong>Transparent Decision Engine:</strong> Explanations represent direct mathematical feature boundary evaluations comparing actual farm inputs against established crop agronomic requirement profiles.
                </span>
            </div>

        </div>
    );
}
