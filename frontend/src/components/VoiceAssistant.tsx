import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Volume2, VolumeX, Mic, MicOff, Bot, X, AlertCircle, ChevronDown } from 'lucide-react';
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

type VoiceState = 'idle' | 'speaking' | 'error' | 'unsupported';

const LANG_CODES: Record<Language, string> = {
  en: 'en-IN',
  te: 'te-IN',
  hi: 'hi-IN',
};

const LANG_LABELS: Record<Language, string> = {
  en: 'English',
  te: 'తెలుగు',
  hi: 'हिन्दी',
};

function buildAdvisoryText(
  lang: Language,
  crop: string,
  confidence: number,
  suitability: string,
  risk: string
): string {
  const c = crop.charAt(0).toUpperCase() + crop.slice(1);
  if (lang === 'te') {
    return `అగ్రి నివార సలహా: మీ నేల మరియు వాతావరణ పరిస్థితుల ప్రకారం, ${c} పంట సిఫార్సు చేయబడింది. అనుకూలత స్థాయి ${suitability}. ప్రధాన ప్రమాదం ${risk}. నాటు వేయడానికి ముందు కార్యాచరణ ప్రణాళికను సమీక్షించండి.`;
  }
  if (lang === 'hi') {
    return `कृषि निवारा सलाह: आपकी मिट्टी और मौसम की स्थिति के आधार पर, ${c} फसल की सिफारिश की गई है। उपयुक्तता स्तर ${suitability} है। मुख्य जोखिम ${risk} है। बुआई से पहले कार्य योजना की समीक्षा करें।`;
  }
  return `AgriNivara Advisory: Based on your soil profile and current weather conditions, ${c} is recommended for your farm. Suitability level is ${suitability}. Primary risk identified is ${risk}. Please review your action plan before sowing.`;
}

/**
 * Pick the best available voice for the target locale.
 * Falls back to any voice if none is found for the locale.
 */
function pickVoice(langCode: string): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  // Exact locale match first (e.g. "te-IN")
  let voice = voices.find(v => v.lang === langCode);
  if (voice) return voice;

  // Language prefix match (e.g. "te")
  const prefix = langCode.split('-')[0];
  voice = voices.find(v => v.lang.startsWith(prefix));
  if (voice) return voice;

  // English fallback
  voice = voices.find(v => v.lang.startsWith('en'));
  return voice ?? voices[0] ?? null;
}

export function VoiceAssistant({
  recommendedCrop,
  confidence,
  suitabilityStatus,
  primaryRisk,
  lang,
  isSpeaking,
  onToggleSpeech,
}: VoiceAssistantProps) {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [expanded, setExpanded] = useState(false);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load voices — some browsers load them asynchronously
  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setVoiceState('unsupported');
      return;
    }

    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices();
      if (v.length > 0) setVoicesLoaded(true);
    };

    loadVoices();
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
  }, []);

  const stopSpeech = useCallback(() => {
    window.speechSynthesis?.cancel();
    utteranceRef.current = null;
    setVoiceState('idle');
    setExpanded(false);
  }, []);

  // Trigger or stop speech when isSpeaking toggles
  useEffect(() => {
    if (!isSpeaking) {
      stopSpeech();
      return;
    }

    if (!('speechSynthesis' in window)) {
      setVoiceState('unsupported');
      setErrorMsg('Speech synthesis is not supported in this browser.');
      return;
    }

    window.speechSynthesis.cancel();
    setExpanded(true);
    setVoiceState('speaking');
    setErrorMsg('');

    const text = buildAdvisoryText(lang, recommendedCrop, confidence, suitabilityStatus, primaryRisk);
    const langCode = LANG_CODES[lang];

    const speak = () => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langCode;
      utterance.rate = 0.92;
      utterance.pitch = 1;

      const voice = pickVoice(langCode);
      if (voice) utterance.voice = voice;

      utterance.onstart = () => setVoiceState('speaking');

      utterance.onend = () => {
        setVoiceState('idle');
        utteranceRef.current = null;
        setTimeout(() => {
          setExpanded(false);
          if (isSpeaking) onToggleSpeech();
        }, 800);
      };

      utterance.onerror = (e) => {
        // 'interrupted' is a normal cancellation — not a real error
        if (e.error === 'interrupted' || e.error === 'canceled') {
          setVoiceState('idle');
          return;
        }
        setVoiceState('error');
        setErrorMsg(
          e.error === 'language-unavailable'
            ? `${LANG_LABELS[lang]} voice is not available on this device. Playing in English.`
            : 'Voice synthesis failed. Please try again.'
        );
        // Retry in English if language unavailable
        if (e.error === 'language-unavailable' && lang !== 'en') {
          const fallbackText = buildAdvisoryText('en', recommendedCrop, confidence, suitabilityStatus, primaryRisk);
          const fallbackUtterance = new SpeechSynthesisUtterance(fallbackText);
          fallbackUtterance.lang = 'en-IN';
          const fallbackVoice = pickVoice('en-IN');
          if (fallbackVoice) fallbackUtterance.voice = fallbackVoice;
          fallbackUtterance.onstart = () => setVoiceState('speaking');
          fallbackUtterance.onend = () => {
            setVoiceState('idle');
            setTimeout(() => { setExpanded(false); if (isSpeaking) onToggleSpeech(); }, 800);
          };
          window.speechSynthesis.speak(fallbackUtterance);
        }
      };

      utteranceRef.current = utterance;

      // Chrome bug: speechSynthesis sometimes pauses after ~15s — keepAlive ping
      window.speechSynthesis.speak(utterance);

      // Chrome keepalive workaround
      const keepAlive = setInterval(() => {
        if (window.speechSynthesis.paused) window.speechSynthesis.resume();
      }, 5000);

      return () => clearInterval(keepAlive);
    };

    // Voices may not be ready yet — wait a tick
    const timer = setTimeout(speak, voicesLoaded ? 0 : 300);
    return () => {
      clearTimeout(timer);
      window.speechSynthesis?.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSpeaking]);

  // Cleanup on unmount
  useEffect(() => {
    return () => { window.speechSynthesis?.cancel(); };
  }, []);

  const handleToggle = () => {
    if (voiceState === 'unsupported') return;
    onToggleSpeech();
  };

  const stateLabel = () => {
    if (voiceState === 'unsupported') return 'Not Supported';
    if (voiceState === 'error') return 'Try Again';
    if (voiceState === 'speaking') return t('stopAudio', lang);
    return t('listenAudio', lang);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">

      {/* Expanded HUD panel */}
      {expanded && (
        <div
          className="w-72 sm:w-80 rounded-2xl bg-slate-900/95 backdrop-blur-2xl border border-emerald-500/30 p-5 shadow-2xl shadow-slate-950/80"
          style={{ animation: 'slideUp 0.25s ease-out' }}
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                <Bot size={15} />
              </div>
              <span className="text-xs font-bold text-white">AgriNivara Voice Advisory</span>
            </div>
            <button
              onClick={() => { stopSpeech(); if (isSpeaking) onToggleSpeech(); }}
              className="text-slate-400 hover:text-white transition cursor-pointer"
              title="Close"
            >
              <X size={15} />
            </button>
          </div>

          <div className="py-4 text-center space-y-3">
            {voiceState === 'speaking' && (
              <div className="flex items-end justify-center gap-1 h-8">
                {[6, 14, 20, 10, 24, 16, 8, 18, 12, 20].map((h, i) => (
                  <div
                    key={i}
                    className="w-1 bg-gradient-to-t from-emerald-600 to-teal-300 rounded-full"
                    style={{
                      height: `${h}px`,
                      animation: `waveBar 0.8s ease-in-out infinite alternate`,
                      animationDelay: `${i * 80}ms`,
                    }}
                  />
                ))}
              </div>
            )}

            {voiceState === 'error' && (
              <div className="flex items-center justify-center gap-2 text-rose-400">
                <AlertCircle size={16} />
                <span className="text-xs font-bold">Voice Error</span>
              </div>
            )}

            <p className="text-xs font-bold text-emerald-400">
              {voiceState === 'speaking' ? `Speaking in ${LANG_LABELS[lang]}...` : errorMsg || 'Ready'}
            </p>

            {errorMsg && (
              <p className="text-[11px] text-slate-400 px-2 leading-relaxed">{errorMsg}</p>
            )}

            <p className="text-[11px] text-slate-400 italic">
              Advisory for: <span className="text-white font-bold capitalize">{recommendedCrop}</span>
            </p>
          </div>
        </div>
      )}

      {/* Floating orb button */}
      <button
        onClick={handleToggle}
        disabled={voiceState === 'unsupported'}
        title={voiceState === 'unsupported' ? 'Speech not supported in this browser' : stateLabel()}
        className={`group flex items-center gap-2.5 px-5 py-3 rounded-full font-bold text-xs shadow-xl transition-all duration-200 transform hover:scale-105 cursor-pointer border disabled:opacity-40 disabled:cursor-not-allowed ${
          voiceState === 'speaking'
            ? 'bg-amber-500 text-slate-950 border-amber-400/50 shadow-amber-500/30'
            : voiceState === 'error'
            ? 'bg-rose-600 text-white border-rose-500/40 shadow-rose-600/30'
            : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-500/30 shadow-emerald-600/30 hover:from-emerald-500 hover:to-teal-500'
        }`}
        style={voiceState === 'speaking' ? { animation: 'gentlePulse 2s ease-in-out infinite' } : undefined}
      >
        <div className="relative">
          {voiceState === 'speaking' ? (
            <VolumeX className="w-4 h-4" />
          ) : voiceState === 'error' ? (
            <AlertCircle className="w-4 h-4" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
          {voiceState === 'speaking' && (
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-white animate-ping opacity-75" />
          )}
        </div>
        <span>{stateLabel()}</span>
      </button>

      {/* Inline CSS for voice wave and pulse animations */}
      <style>{`
        @keyframes waveBar {
          from { transform: scaleY(0.4); }
          to   { transform: scaleY(1.2); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes gentlePulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4); }
          50%       { box-shadow: 0 0 0 8px rgba(245, 158, 11, 0); }
        }
      `}</style>
    </div>
  );
}
