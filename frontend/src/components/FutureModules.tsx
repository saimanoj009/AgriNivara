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
        <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200 mb-8">
            
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-800 font-bold">
                        <Cpu className="w-5 h-5 text-indigo-700" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">
                            {t('futureModules', lang)}
                        </h2>
                        <p className="text-xs text-slate-500 font-medium">
                            Architectural extensions for IoT telemetry, CV plant pathology, smart irrigation & Mandi prices
                        </p>
                    </div>
                </div>

                <span className="self-start sm:self-center text-[11px] font-bold text-indigo-800 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
                    {t('futureTag', lang)}
                </span>
            </div>

            {/* MODULE TABS */}
            <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-100 pb-3">
                <button
                    onClick={() => setActiveTab('iot')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        activeTab === 'iot' ? 'bg-indigo-700 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                >
                    <Cpu className="w-4 h-4" />
                    <span>{t('iotStream', lang)}</span>
                </button>

                <button
                    onClick={() => setActiveTab('disease')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        activeTab === 'disease' ? 'bg-indigo-700 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{t('diseaseScanner', lang)}</span>
                </button>

                <button
                    onClick={() => setActiveTab('irrigation')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        activeTab === 'irrigation' ? 'bg-indigo-700 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                >
                    <Droplets className="w-4 h-4" />
                    <span>{t('smartIrrigation', lang)}</span>
                </button>

                <button
                    onClick={() => setActiveTab('market')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        activeTab === 'market' ? 'bg-indigo-700 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                >
                    <TrendingUp className="w-4 h-4" />
                    <span>{t('marketPrices', lang)}</span>
                </button>
            </div>

            {/* TAB CONTENT */}

            {/* 1. IOT SENSOR STREAM */}
            {activeTab === 'iot' && (
                <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                ESP32 / LoRaWAN Soil & Environment Node
                                <span className="text-[10px] bg-slate-200 text-slate-700 font-mono px-2 py-0.5 rounded">
                                    [SIMULATED / IOT SENSOR STREAM]
                                </span>
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Live telemetry bridge for automated ESP32 hardware sensors (Capacitive Moisture, NPK probe, DHT22)
                            </p>
                        </div>

                        <button
                            onClick={handleIotToggle}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                                isIotActive
                                    ? 'bg-emerald-600 text-white shadow'
                                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                            }`}
                        >
                            <span className={`h-2.5 w-2.5 rounded-full ${isIotActive ? 'bg-emerald-300 animate-ping' : 'bg-slate-400'}`} />
                            {isIotActive ? 'IoT Telemetry Live' : 'Connect ESP32 Simulation'}
                        </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div className="bg-white p-3 rounded-lg border border-slate-200">
                            <span className="text-slate-400 block text-[10px]">Soil Moisture</span>
                            <span className="font-extrabold text-slate-900 text-base">
                                {isIotActive ? '38.4%' : 'Simulated (35%)'}
                            </span>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-slate-200">
                            <span className="text-slate-400 block text-[10px]">Telemetry Latency</span>
                            <span className="font-extrabold text-emerald-600 text-base">
                                {isIotActive ? '120ms' : 'Offline'}
                            </span>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-slate-200">
                            <span className="text-slate-400 block text-[10px]">Protocol</span>
                            <span className="font-extrabold text-slate-900 text-base">MQTT / HTTP</span>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-slate-200">
                            <span className="text-slate-400 block text-[10px]">Status</span>
                            <span className="font-extrabold text-indigo-600 text-base">
                                {isIotActive ? 'Streaming' : 'Ready'}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* 2. PLANT DISEASE SCANNER */}
            {activeTab === 'disease' && (
                <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-200">
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                            Computer Vision Leaf Pathology Model
                            <span className="text-[10px] bg-slate-200 text-slate-700 font-mono px-2 py-0.5 rounded">
                                [AI/ML CNN DIAGNOSTICS]
                            </span>
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Upload crop leaf photo to run PlantVillage MobileNet/ResNet disease identification model
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-700 hover:bg-indigo-600 text-white font-bold text-xs cursor-pointer shadow">
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
                            <span className="text-xs font-semibold text-slate-700 truncate max-w-[200px]">
                                Selected: {selectedFile.name}
                            </span>
                        )}
                    </div>

                    {diseaseLoading && (
                        <div className="p-4 rounded-lg bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 flex items-center gap-2">
                            <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                            Running TensorFlow MobileNet leaf disease inference...
                        </div>
                    )}

                    {diseaseResult && (
                        <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-1">
                            <div className="flex items-center justify-between">
                                <strong className="text-sm font-extrabold text-emerald-800 capitalize">
                                    Detected: {diseaseResult.predicted_disease?.replace(/___/g, ' - ') || 'Healthy'}
                                </strong>
                                <span className="font-bold bg-emerald-200 text-emerald-900 px-2.5 py-0.5 rounded">
                                    Confidence: {diseaseResult.confidence}%
                                </span>
                            </div>
                        </div>
                    )}

                    {diseaseError && (
                        <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>{diseaseError}</span>
                        </div>
                    )}
                </div>
            )}

            {/* 3. SMART IRRIGATION INTELLIGENCE */}
            {activeTab === 'irrigation' && (
                <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-200">
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                            Penman-Monteith Evapotranspiration (ET0) Irrigation Index
                            <span className="text-[10px] bg-slate-200 text-slate-700 font-mono px-2 py-0.5 rounded">
                                [FUTURE / IRRIGATION ADVISORY]
                            </span>
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Automated water budget calculation combining temperature, solar radiation, humidity & rainfall
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1">
                            <span className="text-slate-500 font-bold block">Water Stress Status</span>
                            <span className="text-sm font-extrabold text-emerald-700">OPTIMAL WATERING</span>
                            <p className="text-[10px] text-slate-400">Current soil moisture is within crop comfort zone.</p>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1">
                            <span className="text-slate-500 font-bold block">Estimated Daily ET0</span>
                            <span className="text-sm font-extrabold text-slate-900">4.2 mm / day</span>
                            <p className="text-[10px] text-slate-400">Calculated crop evapotranspiration loss.</p>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1">
                            <span className="text-slate-500 font-bold block">Recommended Schedule</span>
                            <span className="text-sm font-extrabold text-indigo-700">Drip 45 Mins / Day</span>
                            <p className="text-[10px] text-slate-400">Saves 30% water compared to flood irrigation.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* 4. MARKET INTELLIGENCE */}
            {activeTab === 'market' && (
                <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-200">
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                            Mandi Market Price & Gross Return Advisory
                            <span className="text-[10px] bg-slate-200 text-slate-700 font-mono px-2 py-0.5 rounded">
                                [DEMO / MARKET ADVISORY]
                            </span>
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Regional wholesale market trends, estimated cultivation input costs & projected gross revenue
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1">
                            <span className="text-slate-500 font-bold block">Avg Mandi Price ({cropCap})</span>
                            <span className="text-base font-black text-emerald-700">₹2,350 / Quintal</span>
                            <span className="text-[10px] text-emerald-600 font-bold block">↑ +4.2% Seasonal Trend</span>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1">
                            <span className="text-slate-500 font-bold block">Estimated Input Cost</span>
                            <span className="text-base font-black text-slate-800">₹14,500 / Acre</span>
                            <span className="text-[10px] text-slate-400 block">Includes seed, fertilizer & labor</span>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1">
                            <span className="text-slate-500 font-bold block">Est. Revenue Potential</span>
                            <span className="text-base font-black text-indigo-700">₹42,000 / Acre</span>
                            <span className="text-[10px] text-indigo-600 font-bold block">Net Profit: ~₹27,500 / Acre</span>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
