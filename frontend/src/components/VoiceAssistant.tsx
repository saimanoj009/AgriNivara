import { useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import type { Language } from '../types/agriculture';
import { t } from '../utils/translations';

interface VoiceAssistantProps {
    recommendedCrop: string;
    confidence: number;
    suitabilityStatus: string;
    primaryRisk: string;
    lang: Language;
    isSpeaking: boolean;
    onToggleSpeech: () => void;
}

export function VoiceAssistant({
    recommendedCrop,
    confidence,
    suitabilityStatus,
    primaryRisk,
    lang,
    isSpeaking,
    onToggleSpeech
}: VoiceAssistantProps) {

    useEffect(() => {
        if (!isSpeaking) {
            window.speechSynthesis?.cancel();
            return;
        }

        if (!('speechSynthesis' in window)) {
            alert('Browser speech synthesis is not supported in your browser.');
            return;
        }

        window.speechSynthesis.cancel();

        const cropCap = recommendedCrop.charAt(0).toUpperCase() + recommendedCrop.slice(1);
        let text = `Agri Nivara Recommendation: Based on your farm soil and live weather conditions, the AI model recommends growing ${cropCap} with ${confidence}% confidence. Overall farm suitability is ${suitabilityStatus}. Dominant risk identified: ${primaryRisk}. Please review your smart farm action plan before sowing.`;

        if (lang === 'te') {
            text = `అగ్రి నివార వ్యవసాయ సలహా: మీ పొలం నేల మరియు వాతావరణ పరిస్థితుల ప్రకారం, ఏఐ విధానం ${cropCap} పంటను సిఫార్సు చేస్తోంది. మీ పొలం అనుకూలత స్కోరు ${suitabilityStatus}. ప్రధాన ప్రమాదం: ${primaryRisk}. నాటు వేసే ముందు యాక్షన్ ప్లాన్ చూడండి.`;
        } else if (lang === 'hi') {
            text = `कृषि निवारा सलाह: आपके खेत की मिट्टी और मौसम के आधार पर, एआई मॉडल ${cropCap} फसल उगाने की सिफारिश करता है। खेत की उपयुक्तता ${suitabilityStatus} है। मुख्य जोखिम: ${primaryRisk}। बुआई से पहले कार्य योजना देखें।`;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang === 'te' ? 'te-IN' : (lang === 'hi' ? 'hi-IN' : 'en-US');
        utterance.rate = 0.95;

        utterance.onend = () => {
            onToggleSpeech();
        };

        window.speechSynthesis.speak(utterance);

        return () => {
            window.speechSynthesis?.cancel();
        };
    }, [isSpeaking, recommendedCrop, confidence, suitabilityStatus, primaryRisk, lang, onToggleSpeech]);

    return (
        <div className="fixed bottom-6 right-6 z-40">
            <button
                onClick={onToggleSpeech}
                className={`flex items-center gap-2 px-4 py-3 rounded-full font-bold text-xs shadow-2xl transition-all transform hover:scale-105 cursor-pointer border ${
                    isSpeaking
                        ? 'bg-amber-500 text-amber-950 border-amber-300 animate-bounce'
                        : 'bg-emerald-800 text-emerald-100 hover:bg-emerald-700 border-emerald-600'
                }`}
            >
                {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                <span className="hidden sm:inline">
                    {isSpeaking ? t('stopAudio', lang) : t('listenAudio', lang)}
                </span>
            </button>
        </div>
    );
}
