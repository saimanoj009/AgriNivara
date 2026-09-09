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
        <div className="bg-[#102D25] rounded-3xl p-6 sm:p-7 shadow-xl border border-white/10 mb-8 text-[#F3EBDD]">
            
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-[#00B884]/15 text-[#00B884] font-bold border border-[#00B884]/30">
                        <CheckSquare className="w-5 h-5 text-[#00B884]" />
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-[#F3EBDD]">
                            {t('actionPlan', lang)}
                        </h2>
                        <p className="text-xs text-[#A8B9AE] font-medium">
                            Step-by-step actionable cultivation roadmap for <strong className="text-[#00B884]">{cropCap}</strong>
                        </p>
                    </div>
                </div>

                <span className="self-start sm:self-center text-[11px] font-bold text-[#00B884] bg-[#00B884]/15 px-3 py-1 rounded-full border border-[#00B884]/30">
                    Integrated Advisory
                </span>
            </div>

            {/* TAB BUTTONS */}
            <div className="flex flex-wrap gap-2 mb-6 border-b border-white/10 pb-3">
                {tabs.map((tab) => {
                    const IconComp = tab.icon;
                    const isActive = activeTab === tab.key;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                isActive
                                    ? 'bg-[#00B884] text-[#071C17] shadow-lg font-black'
                                    : 'bg-[#0C241E] text-[#A8B9AE] hover:bg-[#143B30] hover:text-[#F3EBDD] border border-white/5'
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
                        className="p-4 rounded-xl bg-[#0C241E] border border-white/10 flex items-start gap-3 text-xs sm:text-sm text-[#F3EBDD] font-medium leading-relaxed"
                    >
                        <span className="h-6 w-6 rounded-full bg-[#00B884]/20 text-[#00B884] font-black flex items-center justify-center shrink-0 mt-0.5 text-xs border border-[#00B884]/30">
                            {idx + 1}
                        </span>
                        <div className="space-y-1">
                            <p>{item}</p>
                            <span className="inline-block text-[10px] font-bold text-[#738A7C] bg-[#102D25] px-2 py-0.5 rounded border border-white/10">
                                {tabs.find(t => t.key === activeTab)?.tag}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
}
