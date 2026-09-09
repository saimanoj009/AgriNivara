import React, { useState, useEffect } from 'react';
import { Sprout, CloudRain, Sun, Activity, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';

interface AISeedGrowthProps {
  interactive?: boolean;
  className?: string;
}

export const AISeedGrowthAnimation: React.FC<AISeedGrowthProps> = ({
  interactive = true,
  className = '',
}) => {
  const [stage, setStage] = useState<number>(0); // 0: Data Inflow, 1: AI Computation, 2: Seed Sprouting, 3: Full Yield
  const [autoPlay, setAutoPlay] = useState<boolean>(true);

  useEffect(() => {
    if (!autoPlay) return;
    const interval = setInterval(() => {
      setStage((prev) => (prev + 1) % 4);
    }, 3200);
    return () => clearInterval(interval);
  }, [autoPlay]);

  const stagesData = [
    {
      label: '1. Multimodal Farm Telemetry',
      sub: 'Gathering Soil NPK, Precipitation, Realtime Humidity & Temperature',
      badge: 'INPUT PHASE',
    },
    {
      label: '2. Neural Agronomic Inference',
      sub: 'Agronomic Intelligence & Mathematical Feature Boundary Evaluation',
      badge: 'AI COMPUTE',
    },
    {
      label: '3. Precision Decision Formulation',
      sub: 'Synthesizing Explainable Advice & Climate Resilient Strategy',
      badge: 'OPTIMIZATION',
    },
    {
      label: '4. Sustainable Harvest & Growth',
      sub: 'Maximizing Yield Potential while Minimizing Input Wastage',
      badge: 'HARVEST SUCCESS',
    },
  ];

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-slate-900 via-slate-900/95 to-emerald-950/70 p-6 sm:p-8 text-white shadow-2xl ${className}`}
      onMouseEnter={() => setAutoPlay(false)}
      onMouseLeave={() => setAutoPlay(true)}
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
              Signature AI Metaphor: Data to Growth
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-extrabold px-2 py-0.5 rounded-full border border-emerald-500/40">
                LIVE PIPELINE
              </span>
            </h4>
            <p className="text-xs text-slate-400">
              Watch how raw agricultural parameters transform into flourishing crops
            </p>
          </div>
        </div>

        {/* Stage Pills */}
        <div className="flex items-center gap-1.5 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800">
          {[0, 1, 2, 3].map((s) => (
            <button
              key={s}
              onClick={() => {
                setStage(s);
                setAutoPlay(false);
              }}
              className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all ${
                stage === s
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 scale-105'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              Stage {s + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Visual Animation Canvas */}
      <div className="relative z-10 py-6 my-2 flex flex-col items-center justify-center">
        {/* Animated Central Graphic */}
        <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center">
          
          {/* Orbital Rings */}
          <div className={`absolute inset-0 rounded-full border border-dashed border-emerald-500/30 transition-transform duration-1000 ${stage >= 1 ? 'animate-spin' : ''}`} style={{ animationDuration: '24s' }}></div>
          <div className={`absolute inset-4 rounded-full border border-emerald-400/20 transition-all duration-700 ${stage >= 2 ? 'scale-105 border-emerald-400/40' : 'scale-100'}`}></div>

          {/* Data Particles flowing in during stage 0 & 1 */}
          <div className="absolute top-0 flex flex-col items-center">
            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all duration-500 ${stage >= 0 ? 'bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 translate-y-0 opacity-100' : 'opacity-30'}`}>
              <Activity className="w-3 h-3 text-emerald-400" /> Soil NPK (90:42:43)
            </div>
            <div className="w-0.5 h-6 bg-gradient-to-b from-emerald-400 to-transparent"></div>
          </div>

          <div className="absolute bottom-0 flex flex-col items-center">
            <div className="w-0.5 h-6 bg-gradient-to-t from-teal-400 to-transparent"></div>
            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all duration-500 ${stage >= 0 ? 'bg-teal-950/90 border border-teal-500/40 text-teal-300 translate-y-0 opacity-100' : 'opacity-30'}`}>
              <CloudRain className="w-3 h-3 text-teal-400" /> Live Rain & Humidity
            </div>
          </div>

          <div className="absolute left-0 flex items-center">
            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all duration-500 ${stage >= 0 ? 'bg-amber-950/90 border border-amber-500/40 text-amber-300 translate-x-0 opacity-100' : 'opacity-30'}`}>
              <Sun className="w-3 h-3 text-amber-400" /> 27.5°C Solar
            </div>
            <div className="w-6 h-0.5 bg-gradient-to-r from-amber-400 to-transparent"></div>
          </div>

          {/* Center Orb: Changes from Seed -> Neural Core -> Sprout -> Flourishing Crop */}
          <div className="relative flex items-center justify-center">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-700 shadow-2xl ${
              stage === 0
                ? 'bg-amber-950/80 border-2 border-amber-500/60 shadow-amber-500/30'
                : stage === 1
                ? 'bg-emerald-950/90 border-2 border-emerald-400 shadow-emerald-500/50 animate-pulse'
                : stage === 2
                ? 'bg-gradient-to-tr from-emerald-600 to-teal-400 border-2 border-white/80 shadow-emerald-400/60 scale-110'
                : 'bg-gradient-to-tr from-emerald-500 via-green-400 to-lime-300 border-2 border-white shadow-emerald-300/80 scale-125'
            }`}>
              {stage === 0 && (
                <div className="text-center">
                  <div className="w-5 h-7 bg-amber-400 rounded-full mx-auto shadow-md"></div>
                  <span className="text-[9px] font-black tracking-widest text-amber-300 mt-1 block">SEED</span>
                </div>
              )}
              {stage === 1 && (
                <div className="text-center">
                  <Sparkles className="w-8 h-8 text-emerald-300 animate-spin" style={{ animationDuration: '8s' }} />
                  <span className="text-[8px] font-black tracking-widest text-emerald-300 mt-1 block">INFERENCE</span>
                </div>
              )}
              {stage === 2 && (
                <div className="text-center text-slate-950">
                  <Sprout className="w-10 h-10 text-white animate-bounce" />
                  <span className="text-[8px] font-black tracking-widest text-emerald-950 mt-1 block">GROWTH</span>
                </div>
              )}
              {stage === 3 && (
                <div className="text-center text-slate-950">
                  <span className="text-3xl filter drop-shadow">🌾</span>
                  <span className="text-[8px] font-black tracking-widest text-slate-950 block">RICE 94%</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dynamic Descriptive Bar */}
        <div className="mt-4 w-full max-w-lg bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-center">
          <div className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mb-1">
            {stagesData[stage].badge}
          </div>
          <h5 className="font-bold text-sm text-white">{stagesData[stage].label}</h5>
          <p className="text-xs text-slate-400 mt-1">{stagesData[stage].sub}</p>
        </div>
      </div>
    </div>
  );
};
