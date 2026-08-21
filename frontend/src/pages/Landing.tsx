import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  Sparkles,
  Sprout,
  ShieldCheck,
  TrendingUp,
  CloudSun,
  Activity,
  SlidersHorizontal,
  Volume2,
  CheckCircle2,
  ChevronRight,
  Cpu,
  Layers,
  BarChart3,
  Search,
  Droplets,
  ThermometerSun,
  ShieldAlert,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { AgriLogo } from '../components/ui/AgriLogo';
import { GlassCard } from '../components/ui/GlassCard';
import { AISeedGrowthAnimation } from '../components/ui/AISeedGrowthAnimation';
import { AnimatedCounter } from '../components/ui/AnimatedCounter';

export default function Landing() {
  // Hero entrance animation timer (0-5s choreography)
  const [heroStep, setHeroStep] = useState<number>(0);

  // Interactive Live Teaser States
  const [activeTab, setActiveTab] = useState<'crop' | 'disease' | 'whatif' | 'voice'>('crop');
  const [soilPreset, setSoilPreset] = useState<'alluvial' | 'black' | 'red'>('alluvial');
  const [simTemp, setSimTemp] = useState<number>(26);
  const [simRain, setSimRain] = useState<number>(180);

  useEffect(() => {
    const t1 = setTimeout(() => setHeroStep(1), 300);   // Environment fade
    const t2 = setTimeout(() => setHeroStep(2), 1000);  // Landscape & movement
    const t3 = setTimeout(() => setHeroStep(3), 2000);  // Logo & glowing AI beam
    const t4 = setTimeout(() => setHeroStep(4), 3000);  // Data nodes appear
    const t5 = setTimeout(() => setHeroStep(5), 4000);  // Final heading reveal

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 overflow-hidden selection:bg-emerald-500 selection:text-slate-950">
      {/* GLOBAL NAVBAR */}
      <Navbar />

      {/* ========================================================================= */}
      {/* 1. CINEMATIC HERO SECTION                                                 */}
      {/* ========================================================================= */}
      <section className="relative min-h-[92vh] flex items-center justify-center pt-8 pb-20 px-4 sm:px-6 lg:px-8">
        
        {/* Background Ambient Glow & Neural Grid */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-emerald-600/15 rounded-full blur-[140px]"></div>
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-teal-600/10 rounded-full blur-[120px]"></div>
          <div className="absolute top-20 right-10 w-80 h-80 bg-lime-600/10 rounded-full blur-[100px]"></div>
          
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:48px_48px]"></div>
        </div>

        <div className="relative max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center z-10">
          
          {/* LEFT: Hero Marketing Pitch */}
          <div className={`lg:col-span-7 space-y-7 transition-all duration-1000 ${heroStep >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            
            {/* Enterprise Platform Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-black tracking-wide shadow-lg shadow-emerald-950/50">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-emerald-200">PRECISION AGRITECH SAAS</span>
              <span className="text-slate-500">•</span>
              <span className="text-emerald-400">INTELLIGENT FARM SOFTWARE</span>
            </div>

            {/* Main Hero Headline */}
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.06]">
                INTELLIGENCE FOR <br />
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-lime-300 bg-clip-text text-transparent drop-shadow-sm">
                  EVERY FARM.
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-slate-300 font-medium max-w-2xl pt-2 leading-relaxed">
                Turning soil chemistry, hyperlocal weather, and plant imagery into high-precision, explainable farming decisions.
              </p>
            </div>

            {/* 4-Stage Intelligence Flow Indicators */}
            <div className={`grid grid-cols-4 gap-2 sm:gap-3 py-2 transition-all duration-700 ${heroStep >= 3 ? 'opacity-100' : 'opacity-30'}`}>
              {[
                { step: 'SOIL', label: 'NPK & pH Telemetry', icon: Activity, color: 'text-amber-400' },
                { step: 'WEATHER', label: 'Live Forecast & Rain', icon: CloudSun, color: 'text-teal-400' },
                { step: 'PLANT', label: 'Computer Vision', icon: ShieldCheck, color: 'text-emerald-400' },
                { step: 'AI DECISION', label: 'Explainable Advice', icon: Sparkles, color: 'text-lime-400' },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="p-2.5 sm:p-3 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
                    <div className="flex items-center gap-1.5">
                      <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                      <span className="text-[10px] sm:text-xs font-black text-white">{item.step}</span>
                    </div>
                    <p className="text-[9px] sm:text-[10px] text-slate-400 font-medium truncate mt-0.5">{item.label}</p>
                  </div>
                );
              })}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <Link
                to="/signup"
                className="group relative overflow-hidden px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-slate-950 font-black text-base shadow-xl shadow-emerald-500/25 transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                <span>Launch AgriNivara Free</span>
                <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>

              <a
                href="#demo"
                className="px-6 py-4 rounded-2xl bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-700/80 font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 hover:border-emerald-500/40"
              >
                <span>Explore Interactive Demos</span>
                <ChevronRight className="w-4 h-4 text-emerald-400" />
              </a>
            </div>

            {/* Metrics Trust Strip */}
            <div className="flex items-center gap-6 pt-4 border-t border-slate-800/80 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero Guesswork ML</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Explainable AI Engine</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Multilingual Voice Ready</span>
              </div>
            </div>

          </div>

          {/* RIGHT: High-Tech Live Farm Command Simulation Card */}
          <div className={`lg:col-span-5 transition-all duration-1000 delay-300 ${heroStep >= 2 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-95'}`}>
            <GlassCard variant="emerald" className="p-6 sm:p-7 relative overflow-hidden border-emerald-500/30">
              
              {/* Header inside Preview Card */}
              <div className="flex items-center justify-between pb-5 border-b border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
                    <Sprout className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-extrabold text-white tracking-tight">Farm Command Telemetry</h2>
                    <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Live Neural Sync Active</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[10px] font-black">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  94.2% OPTIMAL
                </div>
              </div>

              {/* Primary Recommended Crop Card */}
              <div className="mt-5 p-5 rounded-2xl bg-gradient-to-br from-emerald-900/60 to-slate-900/90 border border-emerald-500/40 relative">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-black tracking-widest text-emerald-400 uppercase">Top Crop Recommendation</span>
                    <h3 className="text-2xl font-black text-white mt-1">🌾 RICE (PADDY)</h3>
                    <p className="text-xs text-slate-300 mt-1">High compatibility with current alluvial moisture profile</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-emerald-300"><AnimatedCounter value={94} suffix="%" /></span>
                    <span className="block text-[9px] font-bold text-slate-400 uppercase">AI Fit Score</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4 w-full h-2 rounded-full bg-slate-950 overflow-hidden p-0.5 border border-emerald-500/20">
                  <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-300 w-[94%] transition-all duration-1000"></div>
                </div>
              </div>

              {/* Telemetry Grid */}
              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Soil NPK</span>
                  <p className="text-sm font-black text-white mt-0.5">90 : 42 : 43</p>
                  <span className="text-[9px] font-bold text-emerald-400">Optimal N</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Temp / Rain</span>
                  <p className="text-sm font-black text-white mt-0.5">26.8°C | 185mm</p>
                  <span className="text-[9px] font-bold text-teal-400">Rain Expected</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Pathogen Risk</span>
                  <p className="text-sm font-black text-emerald-300 mt-0.5">LOW (9.2%)</p>
                  <span className="text-[9px] font-bold text-emerald-400">No Blight</span>
                </div>
              </div>

              {/* Proactive Action Plan Card */}
              <div className="mt-4 p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/20 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-slate-200 font-medium">Delay irrigation by 12 hrs due to forecast showers.</span>
                </div>
                <span className="text-[10px] font-extrabold text-emerald-400 uppercase whitespace-nowrap pl-2">AI ADVISORY</span>
              </div>

            </GlassCard>
          </div>

        </div>

      </section>


      {/* ========================================================================= */}
      {/* 2. SIGNATURE AI METAPHOR: DATA -> AI -> GROWTH                           */}
      {/* ========================================================================= */}
      <section id="metaphor" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-400 text-xs font-black uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Signature AI Architecture
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            From Raw Farm Data to Flourishing Crops
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-3">
            Experience how AgriNivara ingests heterogeneous agricultural signals, computes mathematical suitability boundaries, and guides farmers toward sustainable harvest growth.
          </p>
        </div>

        {/* Embedded Interactive Seed Growth Animation */}
        <AISeedGrowthAnimation className="max-w-4xl mx-auto" />
      </section>


      {/* ========================================================================= */}
      {/* 3. INTERACTIVE FEATURE DEMO LAB                                            */}
      {/* ========================================================================= */}
      <section id="demo" className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-900/50 border-y border-slate-800/80 relative">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-emerald-400">Interactive Innovation Suite</span>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-2">
                Test AgriNivara's Core AI Capabilities
              </h2>
              <p className="text-slate-400 text-sm max-w-xl mt-2">
                Explore our production-ready machine learning models, computer vision diagnostic pipelines, and simulation tools right now.
              </p>
            </div>

            {/* Interactive Tab Switcher */}
            <div className="flex flex-wrap items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
              {[
                { id: 'crop', label: '1. Crop AI', icon: Sprout },
                { id: 'disease', label: '2. Disease Vision', icon: ShieldCheck },
                { id: 'whatif', label: '3. What-If Simulator', icon: SlidersHorizontal },
                { id: 'voice', label: '4. Voice AI', icon: Volume2 },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* TAB 1: CROP AI DEMO PREVIEW */}
          {activeTab === 'crop' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-slate-950/80 rounded-3xl p-6 sm:p-10 border border-emerald-500/20">
              <div className="lg:col-span-6 space-y-6">
                <span className="px-3 py-1 rounded-full text-[10px] font-black tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase">
                  Multi-Factor Agronomic AI
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white">
                  Multi-Factor Crop Suitability Engine
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  AgriNivara evaluates 7 key agricultural factors simultaneously: Nitrogen, Phosphorus, Potassium, Temperature, Humidity, Soil pH, and Rainfall.
                </p>

                {/* Preset Selectors */}
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-2">Select Regional Soil Scenario:</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'alluvial', label: 'Alluvial (Rice / Cotton)', n: 90, p: 42, k: 43 },
                      { id: 'black', label: 'Black Soil (Cotton / Maize)', n: 120, p: 58, k: 25 },
                      { id: 'red', label: 'Red Sandy (Groundnut)', n: 20, p: 60, k: 30 },
                    ].map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => setSoilPreset(preset.id as any)}
                        className={`p-3 rounded-xl text-left border transition-all ${
                          soilPreset === preset.id
                            ? 'bg-emerald-950/70 border-emerald-500 text-white'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <span className="text-xs font-bold block">{preset.label}</span>
                        <span className="text-[10px] text-slate-400 mt-1 block">N:{preset.n} P:{preset.p} K:{preset.k}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <Link
                  to="/crop-recommendation"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs hover:bg-emerald-400 transition"
                >
                  Run Full Farm Analysis in Dashboard <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="lg:col-span-6">
                <GlassCard variant="emerald" className="p-6">
                  <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                    <span className="text-xs font-black text-emerald-400 uppercase">AI Prediction Matrix</span>
                    <span className="text-xs text-slate-400">Inference: 18ms</span>
                  </div>

                  <div className="mt-5 space-y-4">
                    <div className="p-4 rounded-xl bg-slate-900/90 border border-emerald-500/30 flex justify-between items-center">
                      <div>
                        <span className="text-xs text-slate-400 block">Top Match</span>
                        <h4 className="text-xl font-black text-white mt-0.5">
                          {soilPreset === 'alluvial' ? '🌾 RICE (94.2%)' : soilPreset === 'black' ? '🌽 MAIZE (91.8%)' : '🥜 GROUNDNUT (89.5%)'}
                        </h4>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold text-xs">
                        HIGH SUITABILITY
                      </span>
                    </div>

                    {/* Factor Breakdown Bars */}
                    <div className="space-y-2 text-xs">
                      <div>
                        <div className="flex justify-between text-slate-400 font-bold mb-1">
                          <span>Soil Chemistry (NPK)</span>
                          <span className="text-emerald-400">96% Optimal</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden"><div className="h-full bg-emerald-400 w-[96%]"></div></div>
                      </div>
                      <div>
                        <div className="flex justify-between text-slate-400 font-bold mb-1">
                          <span>Hydrological & Precipitation Fit</span>
                          <span className="text-teal-400">92% Optimal</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden"><div className="h-full bg-teal-400 w-[92%]"></div></div>
                      </div>
                      <div>
                        <div className="flex justify-between text-slate-400 font-bold mb-1">
                          <span>Thermal & Sunlight Compatibility</span>
                          <span className="text-amber-400">88% Optimal</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden"><div className="h-full bg-amber-400 w-[88%]"></div></div>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </div>
            </div>
          )}

          {/* TAB 2: DISEASE VISION DEMO PREVIEW */}
          {activeTab === 'disease' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-slate-950/80 rounded-3xl p-6 sm:p-10 border border-emerald-500/20">
              <div className="lg:col-span-6 space-y-6">
                <span className="px-3 py-1 rounded-full text-[10px] font-black tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase">
                  Computer Vision Diagnostics
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white">
                  Instant Plant Pathology Diagnostics
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Upload any smartphone photo of a crop leaf. Our deep convolutional network classifies rusts, blights, scabs, and mildew with high precision, providing immediate biological & chemical remedies.
                </p>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                    <span className="text-lg font-black text-emerald-400">38+</span>
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">Crop Disease Classes</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                    <span className="text-lg font-black text-emerald-400">96.4%</span>
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">Top-1 Accuracy</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                    <span className="text-lg font-black text-emerald-400">&lt; 0.5s</span>
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">Inference Speed</p>
                  </div>
                </div>

                <Link
                  to="/disease-detection"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs hover:bg-emerald-400 transition"
                >
                  Test Real Leaf Image Diagnostic <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="lg:col-span-6">
                <GlassCard variant="emerald" className="p-6 relative overflow-hidden">
                  <div className="relative h-64 rounded-2xl overflow-hidden bg-slate-900 border border-emerald-500/30 flex items-center justify-center">
                    
                    {/* Simulated Leaf Graphic with scanning line */}
                    <div className="text-center">
                      <span className="text-7xl filter drop-shadow-2xl">🍃</span>
                      <p className="text-xs font-extrabold text-emerald-400 mt-2">Apple Leaf Sample #204</p>
                    </div>

                    {/* Scanning line */}
                    <div className="absolute inset-0 bg-emerald-950/20 pointer-events-none">
                      <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981] animate-scan-line"></div>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 p-3 rounded-xl bg-slate-950/90 border border-slate-800 flex justify-between items-center text-xs">
                      <div>
                        <span className="text-[9px] text-slate-400 block font-bold">DIAGNOSIS</span>
                        <b className="text-emerald-400">Apple Cedar Rust (96.4%)</b>
                      </div>
                      <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-[10px] font-bold rounded">
                        Early Stage
                      </span>
                    </div>
                  </div>
                </GlassCard>
              </div>
            </div>
          )}

          {/* TAB 3: WHAT-IF SIMULATOR PREVIEW */}
          {activeTab === 'whatif' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-slate-950/80 rounded-3xl p-6 sm:p-10 border border-emerald-500/20">
              <div className="lg:col-span-6 space-y-6">
                <span className="px-3 py-1 rounded-full text-[10px] font-black tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase">
                  Climate Stress Simulation
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white">
                  Realtime Scenario Testing & Stress Matrix
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Adjust simulated rainfall and temperature sliders to observe how crop suitability dynamically shifts before investing in seeds and fertilizers.
                </p>

                <div className="space-y-4 bg-slate-900/90 p-5 rounded-2xl border border-slate-800">
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                      <span>Simulated Temperature: {simTemp}°C</span>
                      <span className={simTemp > 35 ? 'text-rose-400' : 'text-emerald-400'}>{simTemp > 35 ? 'Heat Stress' : 'Normal'}</span>
                    </div>
                    <input
                      type="range"
                      min="15"
                      max="45"
                      value={simTemp}
                      onChange={(e) => setSimTemp(+e.target.value)}
                      className="w-full accent-emerald-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                      <span>Simulated Rainfall: {simRain} mm</span>
                      <span className={simRain < 60 ? 'text-amber-400' : 'text-teal-400'}>{simRain < 60 ? 'Drought Risk' : 'Adequate'}</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="350"
                      value={simRain}
                      onChange={(e) => setSimRain(+e.target.value)}
                      className="w-full accent-emerald-500"
                    />
                  </div>
                </div>

                <Link
                  to="/crop-recommendation"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs hover:bg-emerald-400 transition"
                >
                  Open Full What-If Simulator <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="lg:col-span-6">
                <GlassCard variant="emerald" className="p-6">
                  <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                    <span className="text-xs font-black text-emerald-400 uppercase">Simulated Crop Shifts</span>
                    <span className="text-[10px] text-slate-400 font-bold">Instant Evaluation</span>
                  </div>

                  <div className="mt-5 space-y-3">
                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
                      <div>
                        <p className="text-xs text-slate-400">Rice (Moisture Dependent)</p>
                        <span className="text-sm font-black text-white">{simRain > 120 ? '94% Suitability' : '45% (Unsuitable)'}</span>
                      </div>
                      <span className={`px-2.5 py-1 text-[10px] font-black rounded ${simRain > 120 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                        {simRain > 120 ? 'RECOMMENDED' : 'WATER DEFICIT'}
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
                      <div>
                        <p className="text-xs text-slate-400">Maize / Millet (Drought Hardy)</p>
                        <span className="text-sm font-black text-white">{simRain <= 120 ? '92% Suitability' : '78%'}</span>
                      </div>
                      <span className={`px-2.5 py-1 text-[10px] font-black rounded ${simRain <= 120 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>
                        {simRain <= 120 ? 'HIGH RESILIENCE' : 'VIABLE'}
                      </span>
                    </div>
                  </div>
                </GlassCard>
              </div>
            </div>
          )}

          {/* TAB 4: VOICE AI DEMO PREVIEW */}
          {activeTab === 'voice' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-slate-950/80 rounded-3xl p-6 sm:p-10 border border-emerald-500/20">
              <div className="lg:col-span-6 space-y-6">
                <span className="px-3 py-1 rounded-full text-[10px] font-black tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase">
                  Multilingual Speech Engine
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white">
                  Natural Voice Advisories for Every Farmer
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  AgriNivara breaks language barriers with native voice synthesis in English, Telugu (తెలుగు), and Hindi (हिन्दी), allowing farmers to listen to complex advisories effortlessly.
                </p>

                <div className="space-y-2">
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                    <b className="text-emerald-400 block mb-1">Telugu Advisory:</b>
                    <p className="text-slate-300 italic">"మీ నేల మరియు వర్షపాతానికి వరి పంట 94% అనుకూలంగా ఉంది. రేపు వర్షం కారణంగా నీటిపారుదల వాయిదా వేయండి."</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                    <b className="text-teal-400 block mb-1">Hindi Advisory:</b>
                    <p className="text-slate-300 italic">"मिट्टी और मौसम के अनुसार धान की फसल 94% उपयुक्त है। बारिश की संभावना को देखते हुए सिंचाई स्थगित करें।"</p>
                  </div>
                </div>

                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs hover:bg-emerald-400 transition"
                >
                  Listen Live in Command Center <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="lg:col-span-6 flex items-center justify-center">
                <GlassCard variant="emerald" className="p-8 text-center max-w-sm w-full">
                  <div className="w-24 h-24 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-400/60 flex items-center justify-center shadow-2xl shadow-emerald-500/30 animate-pulse">
                    <Volume2 className="w-10 h-10 text-emerald-300" />
                  </div>
                  <h4 className="text-lg font-black text-white mt-4">AgriNivara Voice Agent</h4>
                  <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider mt-1">Multi-Lingual TTS Ready</p>
                  
                  {/* Waveform graphic */}
                  <div className="flex items-center justify-center gap-1 mt-6 h-8">
                    {[12, 24, 36, 18, 40, 28, 16, 32, 20, 30].map((h, i) => (
                      <div
                        key={i}
                        className="w-1.5 bg-emerald-400 rounded-full animate-pulse"
                        style={{ height: `${h}px`, animationDelay: `${i * 120}ms` }}
                      ></div>
                    ))}
                  </div>
                </GlassCard>
              </div>
            </div>
          )}

        </div>
      </section>


      {/* ========================================================================= */}
      {/* 4. EXPLAINABLE AI ARCHITECTURE                                            */}
      {/* ========================================================================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-400 text-xs font-black uppercase">
              <Cpu className="w-3.5 h-3.5" /> Explainable AI (XAI)
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              No Black Boxes. Full Scientific Transparency.
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Every recommendation comes with a transparent agronomic breakdown. Farmers and agriculture officers see precisely why a crop was selected, which soil nutrients are deficient, and what micro-climate risks exist.
            </p>

            <div className="space-y-3">
              {[
                { title: 'Feature Boundary Validation', desc: 'Direct comparison against verified agronomic ICAR & FAO soil suitability thresholds.' },
                { title: 'Actionable Fertilizer Strategy', desc: 'Specific NPK amendment advice based on actual measured deficits.' },
                { title: 'Hyperlocal Meteorological Warning', desc: 'Integrates real-time rain probability and humidity alerts from Open-Meteo.' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-white">{item.title}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-6">
            <GlassCard variant="dark" className="p-6 border-slate-800">
              <h3 className="text-sm font-black text-white uppercase tracking-wider pb-4 border-b border-slate-800">
                Decision Attribution Breakdown
              </h3>
              
              <div className="mt-5 space-y-4">
                {[
                  { factor: 'Soil Nitrogen (N)', score: '95%', reason: '90 mg/kg matches optimal Rice vegetative growth phase.', status: 'Optimal' },
                  { factor: 'Hydrological Fit', score: '92%', reason: '202mm rainfall meets heavy water demands.', status: 'Optimal' },
                  { factor: 'Soil pH Balance', score: '88%', reason: 'pH 6.5 allows maximum micronutrient bioavailability.', status: 'Optimal' },
                  { factor: 'Temperature Range', score: '84%', reason: '26.8°C promotes steady flowering & tillering.', status: 'Good' },
                ].map((row, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800/80">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-black text-slate-200">{row.factor}</span>
                      <span className="text-xs font-extrabold text-emerald-400">{row.score} Match</span>
                    </div>
                    <p className="text-xs text-slate-400">{row.reason}</p>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      </section>


      {/* ========================================================================= */}
      {/* 5. FINAL CALL TO ACTION                                                   */}
      {/* ========================================================================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border border-emerald-500/40 p-8 sm:p-14 text-center shadow-2xl">
          
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="max-w-3xl mx-auto space-y-6 relative z-10">
            <AgriLogo size="lg" variant="dark" showBadge={true} className="justify-center" />
            
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Make Your Next Farming Decision Smarter.
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              AgriNivara bridges precision agricultural science with state-of-the-art decision intelligence for farmers, cooperatives, and agribusinesses.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                to="/signup"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/25 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
              >
                <span>Start with AgriNivara</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-850 text-white border border-slate-700 font-bold text-sm transition"
              >
                Sign In to Farm Portal
              </Link>
            </div>
          </div>

        </div>
      </section>


      {/* ========================================================================= */}
      {/* 6. STARTUP FOOTER                                                         */}
      {/* ========================================================================= */}
      <footer className="border-t border-slate-800 bg-slate-950/80 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <AgriLogo size="sm" variant="dark" />
          <p className="text-xs text-slate-500 text-center md:text-left">
            © 2026 AgriNivara Inc. Precision Agriculture & Intelligent Decision Software.
          </p>
          <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
            <Link to="/login" className="hover:text-emerald-400">Farmer Login</Link>
            <span>•</span>
            <Link to="/login" className="hover:text-emerald-400">Admin Portal</Link>
            <span>•</span>
            <a href="#metaphor" className="hover:text-emerald-400">Architecture</a>
          </div>
        </div>
      </footer>

    </div>
  );
}