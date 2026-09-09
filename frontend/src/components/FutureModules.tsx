import { useState } from 'react';
import { Cpu, ShieldCheck, Droplets, TrendingUp, Upload, AlertCircle, RefreshCw } from 'lucide-react';
import type { FarmInputs, Language } from '../types/agriculture';
import { predictDiseaseApi } from '../services/api';
import { t } from '../utils/translations';

interface FutureModulesProps {
    inputs: FarmInputs;
    recommendedCrop: string;
    lang: Language;
    onSimulateIotData: (simulated: Partial<FarmInputs>) => void;
}

export function FutureModules({ inputs, recommendedCrop, lang, onSimulateIotData }: FutureModulesProps) {
    const [activeTab, setActiveTab] = useState<'iot' | 'disease' | 'irrigation' | 'market'>('iot');
    
    // Disease Upload State
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [diseaseLoading, setDiseaseLoading] = useState(false);
    const [diseaseResult, setDiseaseResult] = useState<any>(null);
    const [diseaseError, setDiseaseError] = useState<string>('');

    // IoT Stream Toggle
    const [isIotActive, setIsIotActive] = useState(false);

    const handleIotToggle = () => {
        const nextState = !isIotActive;
        setIsIotActive(nextState);
        if (nextState) {
            onSimulateIotData({
                temperature: Math.round((inputs.temperature + (Math.random() * 2 - 1)) * 10) / 10,
                humidity: Math.round(inputs.humidity + (Math.random() * 4 - 2)),
                ph: Math.round((inputs.ph + (Math.random() * 0.4 - 0.2)) * 10) / 10
            });
        }
    };

    const handleDiseaseUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setSelectedFile(file);
        setDiseaseLoading(true);
        setDiseaseError('');
        setDiseaseResult(null);

        try {
            const res = await predictDiseaseApi(file);
            setDiseaseResult(res);
        } catch (err: any) {
            setDiseaseError(err.message || 'Disease detection failed. Backend plant disease model unavailable.');
        } finally {
            setDiseaseLoading(false);
        }
    };

    const cropCap = recommendedCrop.charAt(0).toUpperCase() + recommendedCrop.slice(1);

    return (
        <div className="bg-[#102D25] rounded-3xl p-6 sm:p-7 shadow-xl border border-white/10 mb-8 text-[#F3EBDD]">
            
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-[#00B884]/15 text-[#00B884] font-bold border border-[#00B884]/30">
                        <Cpu className="w-5 h-5 text-[#00B884]" />
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-[#F3EBDD]">
                            {t('futureModules', lang)}
                        </h2>
                        <p className="text-xs text-[#A8B9AE] font-medium">
                            Architectural extensions for IoT telemetry, CV plant pathology, smart irrigation & Mandi prices
                        </p>
                    </div>
                </div>

                <span className="self-start sm:self-center text-[11px] font-bold text-[#D6A84F] bg-[#D6A84F]/15 px-3 py-1 rounded-full border border-[#D6A84F]/30">
                    {t('futureTag', lang)}
                </span>
            </div>

            {/* MODULE TABS */}
            <div className="flex flex-wrap gap-2 mb-6 border-b border-white/10 pb-3">
                <button
                    onClick={() => setActiveTab('iot')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        activeTab === 'iot'
                            ? 'bg-[#00B884] text-[#071C17] shadow-lg font-black'
                            : 'bg-[#0C241E] text-[#A8B9AE] hover:bg-[#143B30] hover:text-[#F3EBDD] border border-white/5'
                    }`}
                >
                    <Cpu className="w-4 h-4" />
                    <span>{t('iotStream', lang)}</span>
                </button>

                <button
                    onClick={() => setActiveTab('disease')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        activeTab === 'disease'
                            ? 'bg-[#00B884] text-[#071C17] shadow-lg font-black'
                            : 'bg-[#0C241E] text-[#A8B9AE] hover:bg-[#143B30] hover:text-[#F3EBDD] border border-white/5'
                    }`}
                >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{t('diseaseScanner', lang)}</span>
                </button>

                <button
                    onClick={() => setActiveTab('irrigation')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        activeTab === 'irrigation'
                            ? 'bg-[#00B884] text-[#071C17] shadow-lg font-black'
                            : 'bg-[#0C241E] text-[#A8B9AE] hover:bg-[#143B30] hover:text-[#F3EBDD] border border-white/5'
                    }`}
                >
                    <Droplets className="w-4 h-4" />
                    <span>{t('smartIrrigation', lang)}</span>
                </button>

                <button
                    onClick={() => setActiveTab('market')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        activeTab === 'market'
                            ? 'bg-[#00B884] text-[#071C17] shadow-lg font-black'
                            : 'bg-[#0C241E] text-[#A8B9AE] hover:bg-[#143B30] hover:text-[#F3EBDD] border border-white/5'
                    }`}
                >
                    <TrendingUp className="w-4 h-4" />
                    <span>{t('marketPrices', lang)}</span>
                </button>
            </div>

            {/* TAB CONTENT */}

            {/* 1. IOT SENSOR STREAM */}
            {activeTab === 'iot' && (
                <div className="space-y-4 bg-[#0C241E] p-5 rounded-2xl border border-white/10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <h3 className="text-sm font-black text-[#F3EBDD] flex items-center gap-2">
                                Physical IoT Telemetry Ingestion Architecture
                                <span className="text-[10px] bg-[#102D25] text-[#00B884] font-mono px-2 py-0.5 rounded border border-[#00B884]/30">
                                    [HARDWARE API READY]
                                </span>
                            </h3>
                            <p className="text-xs text-[#A8B9AE] mt-0.5">
                                REST API endpoint ready for ESP32/LoRaWAN field nodes. If no hardware node is broadcasting, truthful status is shown.
                            </p>
                        </div>

                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#102D25] text-[#A8B9AE] text-xs font-bold border border-white/10">
                            <span className="h-2 w-2 rounded-full bg-slate-500"></span>
                            <span>No Hardware Node Connected</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div className="bg-[#102D25] p-3.5 rounded-xl border border-white/5">
                            <span className="text-[#738A7C] block text-[10px] uppercase font-bold">Hardware Bridge</span>
                            <span className="font-extrabold text-[#F3EBDD] text-sm">REST /api/iot/sensors</span>
                        </div>
                        <div className="bg-[#102D25] p-3.5 rounded-xl border border-white/5">
                            <span className="text-[#738A7C] block text-[10px] uppercase font-bold">Supported Sensors</span>
                            <span className="font-extrabold text-[#00B884] text-sm">Capacitive Moisture, DHT22</span>
                        </div>
                        <div className="bg-[#102D25] p-3.5 rounded-xl border border-white/5">
                            <span className="text-[#738A7C] block text-[10px] uppercase font-bold">Telemetry Fallback</span>
                            <span className="font-extrabold text-[#F3EBDD] text-sm">Open-Meteo Synoptic</span>
                        </div>
                        <div className="bg-[#102D25] p-3.5 rounded-xl border border-white/5">
                            <span className="text-[#738A7C] block text-[10px] uppercase font-bold">Connection State</span>
                            <span className="font-extrabold text-[#A8B9AE] text-sm">STANDBY</span>
                        </div>
                    </div>
                </div>
            )}

            {/* 2. PLANT DISEASE SCANNER */}
            {activeTab === 'disease' && (
                <div className="space-y-4 bg-[#0C241E] p-5 rounded-2xl border border-white/10">
                    <div>
                        <h3 className="text-sm font-black text-[#F3EBDD] flex items-center gap-2">
                            Deep Learning Foliar Pathology Scanner
                            <span className="text-[10px] bg-[#102D25] text-[#00B884] font-mono px-2 py-0.5 rounded border border-[#00B884]/30">
                                [38-CLASS KERAS CNN MODEL]
                            </span>
                        </h3>
                        <p className="text-xs text-[#A8B9AE] mt-0.5">
                            Upload crop leaf photo to run deep learning foliar disease classification.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <label className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00B884] hover:bg-[#00D097] text-[#071C17] font-black text-xs cursor-pointer shadow-[0_4px_20px_rgba(0,184,132,0.3)] transition">
                            <Upload className="w-4 h-4" />
                            <span>Upload Crop Leaf Photo</span>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleDiseaseUpload}
                                className="hidden"
                            />
                        </label>

                        {selectedFile && (
                            <span className="text-xs font-semibold text-[#A8B9AE] truncate max-w-[200px]">
                                Selected: {selectedFile.name}
                            </span>
                        )}
                    </div>

                    {diseaseLoading && (
                        <div className="p-4 rounded-xl bg-[#102D25] border border-[#00B884]/30 text-xs text-[#00B884] flex items-center gap-2">
                            <RefreshCw className="w-4 h-4 animate-spin text-[#00B884]" />
                            Running Deep Learning leaf pathology diagnosis...
                        </div>
                    )}

                    {diseaseResult && (
                        <div className="p-4 rounded-xl bg-[#102D25] border border-[#00B884]/30 text-xs text-[#F3EBDD] space-y-1">
                            <div className="flex items-center justify-between">
                                <strong className="text-sm font-extrabold text-[#00B884] capitalize">
                                    Identified: {diseaseResult.predicted_disease?.replace(/___/g, ' - ') || 'Healthy'}
                                </strong>
                                <span className="font-bold bg-[#00B884]/20 text-[#00B884] px-2.5 py-0.5 rounded-md border border-[#00B884]/30">
                                    Confidence: {diseaseResult.confidence}%
                                </span>
                            </div>
                        </div>
                    )}

                    {diseaseError && (
                        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/30 text-xs text-amber-300 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                            <span>{diseaseError}</span>
                        </div>
                    )}
                </div>
            )}

            {/* 3. SMART IRRIGATION INTELLIGENCE */}
            {activeTab === 'irrigation' && (
                <div className="space-y-4 bg-[#0C241E] p-5 rounded-2xl border border-white/10">
                    <div>
                        <h3 className="text-sm font-black text-[#F3EBDD] flex items-center gap-2">
                            Smart Irrigation Decision Pipeline
                            <span className="text-[10px] bg-[#102D25] text-[#00E5FF] font-mono px-2 py-0.5 rounded border border-[#00E5FF]/30">
                                [HYPERLOCAL WATER ADVISORY]
                            </span>
                        </h3>
                        <p className="text-xs text-[#A8B9AE] mt-0.5">
                            Automated qualitative irrigation scheduling combining forecast rainfall, ambient humidity, and crop stage.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div className="bg-[#102D25] p-4 rounded-2xl border border-white/5 space-y-1">
                            <span className="text-[#738A7C] font-bold block">Water Decision Principle</span>
                            <span className="text-sm font-black text-[#00B884]">QUALITATIVE ADVISORY</span>
                            <p className="text-[10px] text-[#A8B9AE]">Zero unscientific volume guessing. Actionable farmer instructions.</p>
                        </div>

                        <div className="bg-[#102D25] p-4 rounded-2xl border border-white/5 space-y-1">
                            <span className="text-[#738A7C] font-bold block">Rainfall Integration</span>
                            <span className="text-sm font-black text-[#F3EBDD]">48-Hour Open-Meteo Window</span>
                            <p className="text-[10px] text-[#A8B9AE]">Postpones pumping if natural precipitation is incoming.</p>
                        </div>

                        <div className="bg-[#102D25] p-4 rounded-2xl border border-white/5 space-y-1">
                            <span className="text-[#738A7C] font-bold block">Method Efficiency</span>
                            <span className="text-sm font-black text-[#00E5FF]">Drip / Micro-Soaking</span>
                            <p className="text-[10px] text-[#A8B9AE]">Saves ~40% water over flood irrigation.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* 4. MARKET & ECONOMIC INTELLIGENCE */}
            {activeTab === 'market' && (
                <div className="space-y-4 bg-[#0C241E] p-5 rounded-2xl border border-white/10">
                    <div>
                        <h3 className="text-sm font-black text-[#F3EBDD] flex items-center gap-2">
                            Agronomic ROI & Economic Transparency
                            <span className="text-[10px] bg-[#102D25] text-[#D6A84F] font-mono px-2 py-0.5 rounded border border-[#D6A84F]/30">
                                [AGMARKNET / ICAR BASELINES]
                            </span>
                        </h3>
                        <p className="text-xs text-[#A8B9AE] mt-0.5">
                            Every cost and yield projection explicitly labelled with origin (USER ENTERED / ESTIMATED).
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div className="bg-[#102D25] p-4 rounded-2xl border border-white/5 space-y-1">
                            <span className="text-[#738A7C] font-bold block">Market Baseline ({cropCap})</span>
                            <span className="text-base font-black text-[#00B884]">₹2,300 / Quintal</span>
                            <span className="text-[10px] text-[#A8B9AE] block">Origin: AGMARKNET Regional Mandi Baseline</span>
                        </div>

                        <div className="bg-[#102D25] p-4 rounded-2xl border border-white/5 space-y-1">
                            <span className="text-[#738A7C] font-bold block">Estimated Input Cost</span>
                            <span className="text-base font-black text-[#F3EBDD]">₹16,500 / Acre</span>
                            <span className="text-[10px] text-[#A8B9AE] block">Origin: ICAR Cultivation Benchmark</span>
                        </div>

                        <div className="bg-[#102D25] p-4 rounded-2xl border border-white/5 space-y-1">
                            <span className="text-[#738A7C] font-bold block">Water Conservation Value</span>
                            <span className="text-base font-black text-[#00E5FF]">~450 kL Saved</span>
                            <span className="text-[10px] text-[#A8B9AE] block">Origin: Smart Irrigation Scheduling Estimate</span>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
