import { ShieldAlert, AlertTriangle, ShieldCheck } from 'lucide-react';
import type { Language, RiskItem } from '../types/agriculture';
import { t } from '../utils/translations';

interface AgriculturalRiskAnalysisProps {
    risks: RiskItem[];
    lang: Language;
}

export function AgriculturalRiskAnalysis({ risks, lang }: AgriculturalRiskAnalysisProps) {
    return (
        <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200 mb-8">
            
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800 font-bold">
                        <ShieldAlert className="w-5 h-5 text-amber-700" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">
                            {t('riskAnalysis', lang)}
                        </h2>
                        <p className="text-xs text-slate-500 font-medium">
                            Proactive identification of environmental, moisture, and soil stress hazards
                        </p>
                    </div>
                </div>

                <span className="self-start sm:self-center text-[11px] font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                    {t('ruleBasedTag', lang)}
                </span>
            </div>

            {/* RISK CARDS */}
            <div className="space-y-3">
                {risks.map((risk, idx) => {
                    const isHigh = risk.severity === 'HIGH';
                    const isMod = risk.severity === 'MODERATE';

                    return (
                        <div
                            key={idx}
                            className={`p-4 rounded-xl border transition-all ${
                                isHigh
                                    ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                                    : isMod
                                    ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                                    : 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                            }`}
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div className="flex items-center gap-3">
                                    {isHigh ? (
                                        <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                                    ) : isMod ? (
                                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                                    ) : (
                                        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                                    )}

                                    <h3 className="text-sm font-bold">{risk.title}</h3>
                                </div>

                                <span className={`self-start sm:self-auto text-[10px] font-extrabold px-2.5 py-1 rounded-full border uppercase ${
                                    isHigh
                                        ? 'bg-rose-200 text-rose-900 border-rose-300'
                                        : isMod
                                        ? 'bg-amber-200 text-amber-900 border-amber-300'
                                        : 'bg-emerald-200 text-emerald-900 border-emerald-300'
                                }`}>
                                    {t('riskLevel', lang)}: {risk.severity}
                                </span>
                            </div>

                            <div className="mt-2 text-xs space-y-1 pl-8">
                                <p className="font-medium text-slate-700">
                                    <strong>Cause:</strong> {risk.reason}
                                </p>
                                <p className="font-medium text-emerald-800">
                                    <strong>Mitigation Advice:</strong> {risk.mitigation}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

        </div>
    );
}
