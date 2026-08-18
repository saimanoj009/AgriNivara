import { useState } from 'react';
import { Calendar, Sprout, AlertTriangle, ArrowRight, CheckSquare } from 'lucide-react';
import type { ActionPlan, Language } from '../types/agriculture';
import { t } from '../utils/translations';

interface SmartActionPlanProps {
    plan: ActionPlan;
    recommendedCrop: string;
    lang: Language;
}

export function SmartActionPlan({ plan, recommendedCrop, lang }: SmartActionPlanProps) {
    const [activeTab, setActiveTab] = useState<'before' | 'during' | 'warning' | 'next'>('before');
    const cropCap = recommendedCrop.charAt(0).toUpperCase() + recommendedCrop.slice(1);

    const tabs = [
        { key: 'before', label: t('beforePlanting', lang), icon: Calendar, tag: t('ruleBasedTag', lang) },
        { key: 'during', label: t('duringGrowth', lang), icon: Sprout, tag: t('ruleBasedTag', lang) },
        { key: 'warning', label: t('warning', lang), icon: AlertTriangle, tag: t('ruleBasedTag', lang) },
        { key: 'next', label: t('nextAction', lang), icon: ArrowRight, tag: t('aiModelTag', lang) },
    ] as const;

    const getTabContent = () => {
        switch (activeTab) {
            case 'before': return plan.before_planting;
            case 'during': return plan.during_growth;
            case 'warning': return plan.warning;
            case 'next': return plan.next_action;
        }
    };

    return (
        <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200 mb-8">
            
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 font-bold">
                        <CheckSquare className="w-5 h-5 text-emerald-700" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">
                            {t('actionPlan', lang)}
                        </h2>
                        <p className="text-xs text-slate-500 font-medium">
                            Step-by-step actionable cultivation roadmap for <strong className="text-emerald-700">{cropCap}</strong>
                        </p>
                    </div>
                </div>

                <span className="self-start sm:self-center text-[11px] font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    Integrated Advisory
                </span>
            </div>

            {/* TAB BUTTONS */}
            <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-100 pb-3">
                {tabs.map((tab) => {
                    const IconComp = tab.icon;
                    const isActive = activeTab === tab.key;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                isActive
                                    ? 'bg-emerald-700 text-white shadow-md'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                            }`}
                        >
                            <IconComp className="w-4 h-4" />
                            <span>{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* ACTIVE TAB CONTENT */}
            <div className="space-y-3 min-h-[160px]">
                {getTabContent().map((item, idx) => (
                    <div
                        key={idx}
                        className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3 text-xs sm:text-sm text-slate-800 font-medium leading-relaxed"
                    >
                        <span className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 mt-0.5 text-xs">
                            {idx + 1}
                        </span>
                        <div className="space-y-1">
                            <p>{item}</p>
                            <span className="inline-block text-[10px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200">
                                {tabs.find(t => t.key === activeTab)?.tag}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
}
