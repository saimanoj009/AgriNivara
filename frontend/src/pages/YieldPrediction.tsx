import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  TrendingUp,
  Sprout,
  Droplets,
  Activity,
  Sparkles,
  BarChart3,
  Calendar,
  Layers,
  ChevronRight,
  Info,
} from 'lucide-react';
import { AgriLogo } from '../components/ui/AgriLogo';
import { GlassCard } from '../components/ui/GlassCard';
import { AnimatedCounter } from '../components/ui/AnimatedCounter';

export default function YieldPrediction() {
  const [area, setArea] = useState<number>(2.5);
  const [crop, setCrop] = useState<string>('Rice');
  const [health, setHealth] = useState<number>(85);
  const [water, setWater] = useState<number>(80);

  const baseYieldTonsPerAcre: { [key: string]: number } = {
    Rice: 3.8,
    Wheat: 3.2,
    Groundnut: 2.1,
    Cotton: 1.8,
    Maize: 3.5,
  };

  const base = baseYieldTonsPerAcre[crop] || 3.0;
  const multiplier = 0.55 + health / 200 + water / 400;
  const totalEstimate = base * area * multiplier;
  const perAcreEstimate = base * multiplier;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20 selection:bg-emerald-500 selection:text-slate-950">
      
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-emerald-400 border border-slate-800 transition"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
          <AgriLogo size="sm" variant="dark" />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/30">
            Agronomic Harvest Model
          </span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* TITLE BANNER */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-emerald-400">
            Yield Forecast Engine
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            AI Crop Yield & Production Estimator
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Calculate expected harvest tonnage using baseline agronomic yield curves, total farm acreage, crop vigor index, and seasonal water availability.
          </p>
        </div>

        {/* MAIN PLANNING GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* SLIDERS & CONFIGURATION */}
          <div className="lg:col-span-6 space-y-4">
            <GlassCard variant="dark" className="p-6 sm:p-7 space-y-5">
              <h2 className="text-sm font-black text-white uppercase tracking-wider pb-3 border-b border-slate-800 flex items-center justify-between">
                <span>1. Farm Acreage & Health</span>
                <span className="text-[10px] text-slate-400 font-bold">Parameters</span>
              </h2>

              {/* Crop Selector */}
              <div>
                <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider block mb-1.5">
                  Target Crop
                </label>
                <select
                  value={crop}
                  onChange={(e) => setCrop(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-sm font-black text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="Rice">🌾 Rice (Paddy)</option>
                  <option value="Wheat">🌾 Wheat</option>
                  <option value="Groundnut">🥜 Groundnut</option>
                  <option value="Cotton">☁️ Cotton</option>
                  <option value="Maize">🌽 Maize</option>
                </select>
              </div>

              {/* Farm Area in Acres */}
              <div>
                <div className="flex justify-between items-center text-xs font-extrabold text-slate-300 mb-1.5">
                  <span className="uppercase tracking-wider">Farm Area (Acres)</span>
                  <span className="text-emerald-400 font-black">{area} Acres</span>
                </div>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={area}
                  onChange={(e) => setArea(Math.max(0.1, parseFloat(e.target.value) || 1))}
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-sm font-black text-white focus:border-emerald-500"
                />
              </div>

              {/* Crop Health Index */}
              <div>
                <div className="flex justify-between items-center text-xs font-extrabold text-slate-300 mb-1.5">
                  <span className="uppercase tracking-wider">Crop Vigor / Health: {health}%</span>
                  <span className={health > 75 ? 'text-emerald-400' : 'text-amber-400'}>
                    {health > 75 ? 'Optimal Vigor' : 'Moderate Stress'}
                  </span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="100"
                  value={health}
                  onChange={(e) => setHealth(+e.target.value)}
                  className="w-full accent-emerald-500"
                />
              </div>

              {/* Water Supply Index */}
              <div>
                <div className="flex justify-between items-center text-xs font-extrabold text-slate-300 mb-1.5">
                  <span className="uppercase tracking-wider">Water Supply Index: {water}%</span>
                  <span className={water > 70 ? 'text-teal-400' : 'text-amber-400'}>
                    {water > 70 ? 'Adequate Moisture' : 'Deficit'}
                  </span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="100"
                  value={water}
                  onChange={(e) => setWater(+e.target.value)}
                  className="w-full accent-emerald-500"
                />
              </div>
            </GlassCard>
          </div>

          {/* ESTIMATED OUTPUT CARD */}
          <div className="lg:col-span-6 space-y-4">
            <GlassCard variant="emerald" className="p-6 sm:p-8 flex flex-col justify-between min-h-[380px]">
              <div>
                <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                    Calculated Production
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black">
                    AGRI FORECAST
                  </span>
                </div>

                <div className="mt-6 text-center">
                  <span className="text-5xl sm:text-6xl font-black text-white tracking-tight">
                    <AnimatedCounter value={totalEstimate} decimals={2} />
                  </span>
                  <span className="text-xl font-bold text-emerald-400 block mt-1">
                    Metric Tonnes
                  </span>
                  <p className="text-xs text-slate-300 mt-2">
                    Estimated total yield for <b className="text-white">{area} acre(s)</b> of <b className="text-white">{crop}</b>.
                  </p>
                </div>

                {/* Sub Factors Grid */}
                <div className="grid grid-cols-2 gap-3 mt-8">
                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Per Acre Yield</span>
                    <b className="text-base font-black text-emerald-400 mt-0.5 block">{perAcreEstimate.toFixed(2)} t/ac</b>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Efficiency Factor</span>
                    <b className="text-base font-black text-teal-400 mt-0.5 block">{(multiplier * 100).toFixed(0)}%</b>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-500 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Yield model accounts for baseline agronomic genetic potential, seasonal soil fertility index, and irrigation efficacy.</span>
              </div>
            </GlassCard>
          </div>

        </div>

      </main>
    </div>
  );
}
