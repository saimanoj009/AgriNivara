import React from 'react';
import { ShieldAlert, AlertTriangle, ShieldCheck, Info } from 'lucide-react';
import type { Language, RiskItem } from '../types/agriculture';
import { t } from '../utils/translations';

interface AgriculturalRiskAnalysisProps {
    risks: RiskItem[];
    lang: Language;
}

export function AgriculturalRiskAnalysis({ risks, lang }: AgriculturalRiskAnalysisProps) {
    if (!risks || risks.length === 0) return null;

    return (
        <div className="bg-[#102D25] border border-white/10 rounded-3xl p-6 sm:p-7 shadow-xl mb-8 space-y-5 text-[#F3EBDD]">
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
                        <ShieldAlert className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-[#F3EBDD] tracking-tight">
                            {t('riskAnalysis', lang)}
                        </h2>
                        <p className="text-xs text-[#A8B9AE]">
                            Proactive evaluation of climate, moisture, soil, and biological pathogens
                        </p>
                    </div>
                </div>

                <span className="self-start sm:self-center text-[10px] font-bold text-amber-300 bg-amber-500/15 px-3 py-1 rounded-full border border-amber-500/30 uppercase tracking-widest">
                    {t('ruleBasedTag', lang)}
                </span>
            </div>

            {/* RISK CARDS GRID */}
            <div className="space-y-3">
                {risks.map((risk, idx) => {
                    const isHigh = risk.severity === 'HIGH';
                    const isMod = risk.severity === 'MODERATE';

                    return (
                        <div
                            key={idx}
                            className={`p-4 rounded-2xl border transition-all ${
                                isHigh
                                    ? 'bg-[#0C241E] border-rose-500/30 text-[#F3EBDD]'
                                    : isMod
                                    ? 'bg-[#0C241E] border-amber-500/30 text-[#F3EBDD]'
                                    : 'bg-[#0C241E] border-[#00B884]/30 text-[#F3EBDD]'
                            }`}
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div className="flex items-center gap-3">
                                    {isHigh ? (
                                        <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                                    ) : isMod ? (
                                        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                                    ) : (
                                        <ShieldCheck className="w-5 h-5 text-[#00B884] shrink-0" />
                                    )}

                                    <h3 className="text-sm font-bold text-[#F3EBDD]">{risk.title}</h3>
                                </div>

                                <span className={`self-start sm:self-auto text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${
                                    isHigh
                                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                                        : isMod
                                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                        : 'bg-[#00B884]/20 text-[#00B884] border-[#00B884]/30'
                                }`}>
                                    {t('riskLevel', lang)}: {risk.severity}
                                </span>
                            </div>

                            <div className="mt-2.5 text-xs space-y-1.5 pl-8 border-t border-white/5 pt-2">
                                <p className="text-[#A8B9AE]">
                                    <strong className="text-[#F3EBDD] uppercase tracking-wider text-[10px]">Cause:</strong> {risk.reason}
                                </p>
                                <p className="text-[#00B884] flex items-start gap-1.5 font-medium">
                                    <Info className="w-3.5 h-3.5 text-[#00B884] shrink-0 mt-0.5" />
                                    <span><strong className="uppercase tracking-wider text-[10px] text-[#00D097]">Mitigation Protocol:</strong> {risk.mitigation}</span>
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
