import React, { useState } from 'react';
import { SlidersHorizontal, RefreshCw, ArrowRight, Sparkles, Info } from 'lucide-react';
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
    setChangedInputs((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const runSimulation = async () => {
    setLoading(true);
    try {
      const res = await simulateWhatIfApi(currentInputs, changedInputs);
      setSimulatedResult(res.changed);
      setExplanation(res.explanation);
    } catch {
      try {
        const res = await predictCropApi(changedInputs);
        setSimulatedResult(res);
        const currCrop = currentPrediction.recommended_crop;
        const chanCrop = res.recommended_crop;
        if (currCrop !== chanCrop) {
          setExplanation(`Parameter shift indicates optimal recommendation moves from ${currCrop.toUpperCase()} to ${chanCrop.toUpperCase()}.`);
        } else {
          setExplanation(`Optimal crop recommendation remains ${currCrop.toUpperCase()} (Simulated Suitability: ${res.confidence}%).`);
        }
      } catch {
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
    <div className="bg-[#102D25] rounded-3xl p-6 sm:p-7 shadow-xl border border-white/10 mb-8 space-y-6 text-[#F3EBDD]">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-[#00B884]/15 text-[#00B884] border border-[#00B884]/30">
            <SlidersHorizontal className="w-5 h-5 text-[#00B884]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black tracking-tight text-[#F3EBDD]">
                {t('whatIfSimulator', lang)}
              </h2>
              <span className="bg-[#00B884]/20 text-[#00B884] text-[10px] font-black px-2.5 py-0.5 rounded-full border border-[#00B884]/30 uppercase">
                SCENARIO SANDBOX
              </span>
            </div>
            <p className="text-xs text-[#A8B9AE] font-medium">
              Simulate weather and soil variations to test crop resilience in real-time
            </p>
          </div>
        </div>

        <button
          onClick={resetSimulation}
          className="self-start sm:self-center flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0C241E] hover:bg-[#143B30] text-[#F3EBDD] text-xs font-bold transition border border-white/10 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#00B884]" />
          {t('resetSimulator', lang)}
        </button>
      </div>

      {/* TWO COLUMN SIMULATION WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT SLIDERS PANEL */}
        <div className="lg:col-span-7 space-y-4 bg-[#0C241E] p-5 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-black tracking-wider text-[#F3EBDD] uppercase">
              Adjust Simulation Parameters
            </h3>
            <span className="text-[10px] text-[#738A7C] font-medium">Interactive Sensitivity Test</span>
          </div>

          {/* RAINFALL SLIDER */}
          <div>
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-[#A8B9AE]">Simulated Rainfall (mm)</span>
              <span className="text-[#00B884] font-black">{changedInputs.rainfall} mm</span>
            </div>
            <input
              type="range"
              min="0"
              max="400"
              step="5"
              value={changedInputs.rainfall}
              onChange={(e) => handleSliderChange('rainfall', parseFloat(e.target.value))}
              className="w-full h-2 bg-[#071C17] rounded-lg appearance-none cursor-pointer accent-[#00B884]"
            />
          </div>

          {/* TEMPERATURE SLIDER */}
          <div>
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-[#A8B9AE]">Simulated Temperature (°C)</span>
              <span className="text-[#00B884] font-black">{changedInputs.temperature} °C</span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              step="0.5"
              value={changedInputs.temperature}
              onChange={(e) => handleSliderChange('temperature', parseFloat(e.target.value))}
              className="w-full h-2 bg-[#071C17] rounded-lg appearance-none cursor-pointer accent-[#00B884]"
            />
          </div>

          {/* HUMIDITY SLIDER */}
          <div>
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-[#A8B9AE]">Simulated Humidity (%)</span>
              <span className="text-[#00B884] font-black">{changedInputs.humidity} %</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              step="1"
              value={changedInputs.humidity}
              onChange={(e) => handleSliderChange('humidity', parseFloat(e.target.value))}
              className="w-full h-2 bg-[#071C17] rounded-lg appearance-none cursor-pointer accent-[#00B884]"
            />
          </div>

          {/* NITROGEN SLIDER */}
          <div>
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-[#A8B9AE]">Nitrogen (N)</span>
              <span className="text-[#00B884] font-black">{changedInputs.N} mg/kg</span>
            </div>
            <input
              type="range"
              min="0"
              max="150"
              step="1"
              value={changedInputs.N}
              onChange={(e) => handleSliderChange('N', parseFloat(e.target.value))}
              className="w-full h-2 bg-[#071C17] rounded-lg appearance-none cursor-pointer accent-[#00B884]"
            />
          </div>

          {/* PHOSPHORUS SLIDER */}
          <div>
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-[#A8B9AE]">Phosphorus (P)</span>
              <span className="text-[#00B884] font-black">{changedInputs.P} mg/kg</span>
            </div>
            <input
              type="range"
              min="0"
              max="150"
              step="1"
              value={changedInputs.P}
              onChange={(e) => handleSliderChange('P', parseFloat(e.target.value))}
              className="w-full h-2 bg-[#071C17] rounded-lg appearance-none cursor-pointer accent-[#00B884]"
            />
          </div>

          {/* POTASSIUM SLIDER */}
          <div>
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-[#A8B9AE]">Potassium (K)</span>
              <span className="text-[#00B884] font-black">{changedInputs.K} mg/kg</span>
            </div>
            <input
              type="range"
              min="0"
              max="210"
              step="1"
              value={changedInputs.K}
              onChange={(e) => handleSliderChange('K', parseFloat(e.target.value))}
              className="w-full h-2 bg-[#071C17] rounded-lg appearance-none cursor-pointer accent-[#00B884]"
            />
          </div>

          {/* PH SLIDER */}
          <div>
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-[#A8B9AE]">Soil pH</span>
              <span className="text-[#00B884] font-black">{changedInputs.ph}</span>
            </div>
            <input
              type="range"
              min="3.5"
              max="9.5"
              step="0.1"
              value={changedInputs.ph}
              onChange={(e) => handleSliderChange('ph', parseFloat(e.target.value))}
              className="w-full h-2 bg-[#071C17] rounded-lg appearance-none cursor-pointer accent-[#00B884]"
            />
          </div>

          <button
            onClick={runSimulation}
            disabled={loading}
            className="w-full mt-4 py-3 rounded-xl bg-[#00B884] hover:bg-[#00D097] text-[#071C17] font-black text-xs uppercase tracking-wider shadow-[0_4px_20px_rgba(0,184,132,0.3)] transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Evaluating Simulation Scenario...
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
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4 bg-[#0C241E] p-5 rounded-2xl border border-white/10">
          <div>
            <h3 className="text-xs font-black tracking-wider text-[#F3EBDD] uppercase mb-4">
              Baseline vs Simulated Outcome
            </h3>

            <div className="space-y-4">
              {/* CURRENT */}
              <div className="p-3.5 rounded-xl bg-[#102D25] border border-white/10">
                <span className="text-[10px] font-bold text-[#738A7C] uppercase block">
                  {t('currentConditions', lang)} (Baseline)
                </span>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-base font-black text-[#F3EBDD] capitalize">
                    {currentCropName}
                  </span>
                  <span className="text-xs font-black text-[#00B884]">
                    {currentPrediction.confidence}%
                  </span>
                </div>
              </div>

              <div className="flex justify-center text-[#00B884]">
                <ArrowRight className="w-5 h-5 rotate-90 sm:rotate-0" />
              </div>

              {/* SIMULATED */}
              <div
                className={`p-3.5 rounded-xl border transition ${
                  isCropChanged
                    ? 'bg-[#143B30] border-amber-500/40 text-[#F3EBDD]'
                    : 'bg-[#143B30] border-[#00B884]/40 text-[#F3EBDD]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase block text-[#A8B9AE]">
                    {t('changedConditions', lang)}
                  </span>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded bg-[#102D25] border border-white/10 text-[#00B884]">
                    SIMULATION
                  </span>
                </div>

                <div className="flex items-center justify-between mt-1">
                  <span className="text-lg font-black capitalize text-[#F3EBDD]">
                    {simulatedCropName}
                  </span>
                  <span className="text-xs font-black text-[#00B884]">
                    {simulatedResult ? `${simulatedResult.confidence}%` : '---'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* EXPLANATION */}
          {explanation ? (
            <div className="p-4 rounded-xl bg-[#102D25] border border-[#00B884]/30 text-xs font-medium text-[#F3EBDD] leading-relaxed flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-[#00B884] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#00B884] block mb-0.5">Simulation Advisory:</strong>
                <span className="text-[#A8B9AE]">{explanation}</span>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-[#102D25] border border-white/5 text-xs text-[#738A7C] text-center">
              Adjust any slider and click <strong>Simulate Scenario</strong> to evaluate agronomic sensitivity.
            </div>
          )}

          <div className="text-[11px] text-[#738A7C] flex items-center gap-1">
            <Info size={13} className="shrink-0" />
            <span>Simulated outputs illustrate model sensitivity, not a guaranteed weather forecast.</span>
          </div>
        </div>

      </div>

    </div>
  );
}
