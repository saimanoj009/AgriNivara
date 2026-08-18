import { Globe, Leaf, Volume2, VolumeX, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Language } from '../types/agriculture';
import { t } from '../utils/translations';

interface NavbarProps {
    currentLang: Language;
    onLangChange: (lang: Language) => void;
    isSpeaking: boolean;
    onToggleSpeech: () => void;
}

export function Navbar({
    currentLang,
    onLangChange,
    isSpeaking,
    onToggleSpeech,
}: NavbarProps) {
    return (
        <header className="sticky top-0 z-50 bg-emerald-900 text-white shadow-lg border-b border-emerald-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                
                {/* LOGO */}
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="h-10 w-10 rounded-xl bg-emerald-500 flex items-center justify-center text-emerald-950 font-bold shadow-md transform group-hover:scale-105 transition">
                        <Leaf className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-extrabold text-lg sm:text-xl tracking-wider text-white">
                                {t('appTitle', currentLang)}
                            </span>
                        </div>
                        <p className="text-[10px] tracking-widest text-emerald-200 font-medium hidden sm:block">
                            {t('appSubtitle', currentLang)}
                        </p>
                    </div>
                </Link>

                {/* CONTROLS */}
                <div className="flex items-center gap-2 sm:gap-4">
                    
                    {/* Home button */}
                    <Link
                        to="/dashboard"
                        className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-800/80 hover:bg-emerald-800 text-xs font-semibold text-emerald-100 transition border border-emerald-700"
                    >
                        <Home className="w-3.5 h-3.5" />
                        Dashboard
                    </Link>

                    {/* LANGUAGE SELECTOR */}
                    <div className="relative flex items-center bg-emerald-950/60 rounded-xl p-1 border border-emerald-700">
                        <Globe className="w-4 h-4 text-emerald-300 ml-2 mr-1 hidden sm:block" />
                        <select
                            value={currentLang}
                            onChange={(e) => onLangChange(e.target.value as Language)}
                            className="bg-transparent text-xs font-bold text-emerald-100 py-1 px-2 focus:outline-none cursor-pointer"
                        >
                            <option value="en" className="bg-emerald-900 text-white">English (EN)</option>
                            <option value="te" className="bg-emerald-900 text-white">తెలుగు (TE)</option>
                            <option value="hi" className="bg-emerald-900 text-white">हिन्दी (HI)</option>
                        </select>
                    </div>

                    {/* VOICE READOUT BUTTON */}
                    <button
                        onClick={onToggleSpeech}
                        title="Voice Readout Advisory"
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
                            isSpeaking
                                ? 'bg-amber-500 text-amber-950 border-amber-400 animate-pulse'
                                : 'bg-emerald-800/90 text-emerald-100 hover:bg-emerald-700 border-emerald-600'
                        }`}
                    >
                        {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        <span className="hidden sm:inline">
                            {isSpeaking ? 'Stop Voice' : 'Listen Voice'}
                        </span>
                    </button>
                </div>

            </div>
        </header>
    );
}
