import { useState } from 'react';
import { SlidersHorizontal, RefreshCw, ArrowRight, Sparkles } from 'lucide-react';
import type { CropPredictionResponse, FarmInputs, Language } from '../types/agriculture';
import { simulateWhatIfApi, predictCropApi } from '../services/api';
import { t } from '../utils/translations';

interface WhatIfSimulatorProps {
    currentInputs: FarmInputs;
    currentPrediction: CropPredictionResponse;
    lang: Language;
}

export function WhatIfSimulator({ currentInputs, currentPrediction, lang }: WhatIfSimulatorProps) {
    const [changedInputs, setChangedInputs] = useState<FarmInputs>({ ...currentInputs });
    const [simulatedResult, setSimulatedResult] = useState<CropPredictionResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [explanation, setExplanation] = useState<string>('');

    const handleSliderChange = (field: keyof FarmInputs, value: number) => {
        setChangedInputs(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const runSimulation = async () => {
        setLoading(true);
        try {
            const res = await simulateWhatIfApi(currentInputs, changedInputs);
            setSimulatedResult(res.changed);
            setExplanation(res.explanation);
        } catch (e) {
            try {
                const res = await predictCropApi(changedInputs);
                setSimulatedResult(res);
                const currCrop = currentPrediction.recommended_crop;
                const chanCrop = res.recommended_crop;
                if (currCrop !== chanCrop) {
                    setExplanation(`Modifying farm parameters shifted optimal recommendation from ${currCrop.toUpperCase()} to ${chanCrop.toUpperCase()}.`);
                } else {
                    setExplanation(`Parameter adjustments evaluated. Optimal recommendation remains ${currCrop.toUpperCase()} (Confidence: ${res.confidence}%).`);
                }
            } catch (err) {
                setExplanation('Simulation evaluation failed. Please check backend connection.');
            }
        } finally {
            setLoading(false);
        }
    };

    const resetSimulation = () => {
        setChangedInputs({ ...currentInputs });
        setSimulatedResult(null);
        setExplanation('');
    };

    const currentCropName = currentPrediction.recommended_crop;
    const simulatedCropName = simulatedResult?.recommended_crop || currentCropName;
    const isCropChanged = simulatedResult && (simulatedCropName !== currentCropName);

    return (
        <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-emerald-950 text-white rounded-2xl p-6 shadow-xl border border-emerald-700/50 mb-8">
            
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-700">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        <SlidersHorizontal className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-bold tracking-tight text-white">
                                {t('whatIfSimulator', lang)}
                            </h2>
                            <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-400/30">
                                INNOVATION
                            </span>
                        </div>
                        <p className="text-xs text-slate-300 font-medium">
                            Simulate weather & soil changes to test crop resilience in real-time
                        </p>
                    </div>
                </div>

                <button
                    onClick={resetSimulation}
                    className="self-start sm:self-center flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition border border-slate-700 cursor-pointer"
                >
                    <RefreshCw className="w-3.5 h-3.5" />
                    {t('resetSimulator', lang)}
                </button>
            </div>

            {/* MAIN TWO COLUMN LAYOUT */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* LEFT SLIDERS PANEL */}
                <div className="lg:col-span-7 space-y-4 bg-slate-950/60 p-5 rounded-xl border border-slate-800">
                    <h3 className="text-xs font-extrabold tracking-wider text-emerald-400 uppercase mb-3">
                        Adjust Parameter Sliders
                    </h3>

                    {/* RAINFALL SLIDER */}
                    <div>
                        <div className="flex justify-between text-xs font-bold mb-1">
                            <span className="text-slate-300">Rainfall (mm)</span>
                            <span className="text-emerald-400">{changedInputs.rainfall} mm</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="400"
                            step="5"
                            value={changedInputs.rainfall}
                            onChange={(e) => handleSliderChange('rainfall', parseFloat(e.target.value))}
                            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                        />
                    </div>

                    {/* TEMPERATURE SLIDER */}
                    <div>
                        <div className="flex justify-between text-xs font-bold mb-1">
                            <span className="text-slate-300">Temperature (°C)</span>
                            <span className="text-emerald-400">{changedInputs.temperature} °C</span>
                        </div>
                        <input
                            type="range"
                            min="5"
                            max="50"
                            step="0.5"
                            value={changedInputs.temperature}
                            onChange={(e) => handleSliderChange('temperature', parseFloat(e.target.value))}
                            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                        />
                    </div>

                    {/* HUMIDITY SLIDER */}
                    <div>
                        <div className="flex justify-between text-xs font-bold mb-1">
                            <span className="text-slate-300">Humidity (%)</span>
                            <span className="text-emerald-400">{changedInputs.humidity} %</span>
                        </div>
                        <input
                            type="range"
                            min="10"
                            max="100"
                            step="1"
                            value={changedInputs.humidity}
                            onChange={(e) => handleSliderChange('humidity', parseFloat(e.target.value))}
                            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                        />
                    </div>

                    {/* NITROGEN SLIDER */}
                    <div>
                        <div className="flex justify-between text-xs font-bold mb-1">
                            <span className="text-slate-300">Nitrogen (N)</span>
                            <span className="text-emerald-400">{changedInputs.N} mg/kg</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="150"
                            step="1"
                            value={changedInputs.N}
                            onChange={(e) => handleSliderChange('N', parseFloat(e.target.value))}
                            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                        />
                    </div>

                    {/* PHOSPHORUS SLIDER */}
                    <div>
                        <div className="flex justify-between text-xs font-bold mb-1">
                            <span className="text-slate-300">Phosphorus (P)</span>
                            <span className="text-emerald-400">{changedInputs.P} mg/kg</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="150"
                            step="1"
                            value={changedInputs.P}
                            onChange={(e) => handleSliderChange('P', parseFloat(e.target.value))}
                            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                        />
                    </div>

                    {/* POTASSIUM SLIDER */}
                    <div>
                        <div className="flex justify-between text-xs font-bold mb-1">
                            <span className="text-slate-300">Potassium (K)</span>
                            <span className="text-emerald-400">{changedInputs.K} mg/kg</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="210"
                            step="1"
                            value={changedInputs.K}
                            onChange={(e) => handleSliderChange('K', parseFloat(e.target.value))}
                            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                        />
                    </div>

                    {/* PH SLIDER */}
                    <div>
                        <div className="flex justify-between text-xs font-bold mb-1">
                            <span className="text-slate-300">Soil pH</span>
                            <span className="text-emerald-400">{changedInputs.ph}</span>
                        </div>
                        <input
                            type="range"
                            min="3.5"
                            max="9.5"
                            step="0.1"
                            value={changedInputs.ph}
                            onChange={(e) => handleSliderChange('ph', parseFloat(e.target.value))}
                            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                        />
                    </div>

                    {/* RUN SIMULATION BUTTON */}
                    <button
                        onClick={runSimulation}
                        disabled={loading}
                        className="w-full mt-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black text-xs uppercase tracking-wider shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                        {loading ? (
                            <>
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                Running AI Simulation...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4" />
                                {t('simulateChange', lang)}
                            </>
                        )}
                    </button>
                </div>

                {/* RIGHT SIMULATION COMPARISON CARD */}
                <div className="lg:col-span-5 flex flex-col justify-between space-y-4 bg-slate-950/60 p-5 rounded-xl border border-slate-800">
                    <div>
                        <h3 className="text-xs font-extrabold tracking-wider text-emerald-400 uppercase mb-4">
                            Simulated Recommendation Output
                        </h3>

                        {/* COMPARISON DISPLAY */}
                        <div className="space-y-4">
                            
                            {/* CURRENT */}
                            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                                <span className="text-[10px] font-bold text-slate-400 uppercase block">
                                    {t('currentConditions', lang)}
                                </span>
                                <div className="flex items-center justify-between mt-1">
                                    <span className="text-base font-extrabold text-white capitalize">
                                        {currentCropName}
                                    </span>
                                    <span className="text-xs font-bold text-emerald-400">
                                        {currentPrediction.confidence}%
                                    </span>
                                </div>
                            </div>

                            {/* ARROW */}
                            <div className="flex justify-center text-emerald-400">
                                <ArrowRight className="w-6 h-6 rotate-90 sm:rotate-0" />
                            </div>

                            {/* CHANGED */}
                            <div className={`p-3.5 rounded-xl border transition ${
                                isCropChanged
                                    ? 'bg-amber-950/40 border-amber-500/60 text-amber-200'
                                    : 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200'
                            }`}>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold uppercase block text-slate-300">
                                        {t('changedConditions', lang)}
                                    </span>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-900 border border-slate-700">
                                        {t('simulatedTag', lang)}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between mt-1">
                                    <span className="text-lg font-black capitalize text-white">
                                        {simulatedCropName}
                                    </span>
                                    <span className="text-xs font-bold text-emerald-400">
                                        {simulatedResult ? `${simulatedResult.confidence}%` : '---'}
                                    </span>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* EXPLANATION TEXT BOX */}
                    {explanation ? (
                        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-600/60 text-xs font-medium text-emerald-100 leading-relaxed flex items-start gap-2.5">
                            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            <div>
                                <strong className="text-emerald-300 block mb-0.5">AI Simulation Advisory:</strong>
                                {explanation}
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 text-center">
                            Adjust sliders on the left and click <strong>RUN SIMULATION</strong> to evaluate parameter shifts.
                        </div>
                    )}
                </div>

            </div>

        </div>
    );
}
