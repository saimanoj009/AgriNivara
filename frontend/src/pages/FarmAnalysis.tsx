import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Sprout,
  Activity,
  Layers,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  MapPin,
  HelpCircle,
  Cpu,
  Droplets,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { getFarmAnalysisApi } from '../services/api';
import { AgriLogo } from '../components/ui/AgriLogo';
import { UnifiedLocationSelector } from '../components/UnifiedLocationSelector';
import { AskAgriNivaraFloating } from '../components/AskAgriNivaraFloating';
import { SmartActionPlan } from '../components/SmartActionPlan';
import { ExplainableAISection } from '../components/ExplainableAISection';
import { useFarm } from '../context/FarmContext';
import type { FarmAnalysisResponse } from '../types/agriculture';

export default function FarmAnalysis() {
  const { farmProfile, weather } = useFarm();

  const [formData, setFormData] = useState({
    N: farmProfile.N ?? 90,
    P: farmProfile.P ?? 42,
    K: farmProfile.K ?? 43,
    temperature: weather?.temperature ?? 24.5,
    humidity: weather?.humidity ?? 78.0,
    ph: farmProfile.ph ?? 6.5,
    rainfall: weather?.rainfall ?? 185.0,
    location: farmProfile.location || 'Warangal, Telangana',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<FarmAnalysisResponse | null>(null);

  const handleLocationSelect = (locName: string) => {
    setFormData((prev) => ({
      ...prev,
      location: locName,
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: parseFloat(value) || 0,
    }));
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const data = await getFarmAnalysisApi({
        N: Number(formData.N),
        P: Number(formData.P),
        K: Number(formData.K),
        temperature: Number(formData.temperature),
        humidity: Number(formData.humidity),
        ph: Number(formData.ph),
        rainfall: Number(formData.rainfall),
        location: formData.location,
      });

      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Unable to complete farm analysis. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#071C17] text-[#F3EBDD] pb-20 selection:bg-[#00B884] selection:text-[#071C17]">
      
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-[#0A211B]/90 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0C241E] hover:bg-[#143B30] text-xs font-bold text-[#00B884] border border-white/10 transition"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Command Center</span>
          </Link>
          <AgriLogo size="sm" variant="dark" />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-7">
        
        {/* TITLE BANNER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#00B884]/15 text-[#00B884] text-[10px] font-black uppercase tracking-wider border border-[#00B884]/30 mb-2">
              <Layers size={12} /> Decision Architecture
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#F3EBDD] tracking-tight flex items-center gap-2.5">
              <Activity className="w-7 h-7 text-[#00B884] shrink-0" />
              Unified Farm Intelligence Hub
            </h1>
            <p className="text-xs text-[#A8B9AE] mt-1">
              Multi-parameter synthesis: Soil chemistry + atmospheric demand + AI crop suitability + actionable guidance
            </p>
          </div>
        </div>

        {/* INPUT TELEMETRY FORM CARD */}
        <div className="p-6 sm:p-7 rounded-3xl bg-[#102D25] border border-white/10 shadow-xl">
          <form onSubmit={handleAnalyze} className="space-y-6">
            
            {/* Location Selector */}
            <div>
              <label className="text-xs font-bold text-[#A8B9AE] uppercase tracking-wider block mb-1.5">
                Farm Location / District
              </label>
              <UnifiedLocationSelector
                value={formData.location}
                onChange={(val) => handleLocationSelect(val)}
                placeholder="Search farm city or district..."
                inputId="farm-analysis-location"
              />
            </div>

            {/* NUMERIC PARAMETERS */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-bold text-[#F3EBDD] uppercase tracking-wider">
                  Soil Chemistry & Microclimate Telemetry Inputs
                </label>
                <span className="text-[11px] text-[#738A7C]">Pre-populated from active Farm Context</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div>
                  <label className="text-[10px] font-bold text-[#A8B9AE] uppercase block mb-1">Nitrogen (N) - ppm</label>
                  <input
                    type="number"
                    name="N"
                    value={formData.N}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-[#0C241E] border border-white/10 text-sm font-bold text-[#F3EBDD] focus:border-[#00B884] focus:ring-1 focus:ring-[#00B884] outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#A8B9AE] uppercase block mb-1">Phosphorus (P) - ppm</label>
                  <input
                    type="number"
                    name="P"
                    value={formData.P}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-[#0C241E] border border-white/10 text-sm font-bold text-[#F3EBDD] focus:border-[#00B884] focus:ring-1 focus:ring-[#00B884] outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#A8B9AE] uppercase block mb-1">Potassium (K) - ppm</label>
                  <input
                    type="number"
                    name="K"
                    value={formData.K}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-[#0C241E] border border-white/10 text-sm font-bold text-[#F3EBDD] focus:border-[#00B884] focus:ring-1 focus:ring-[#00B884] outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#A8B9AE] uppercase block mb-1">Soil pH (0 - 14)</label>
                  <input
                    type="number"
                    step="0.1"
                    name="ph"
                    value={formData.ph}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-[#0C241E] border border-white/10 text-sm font-bold text-[#F3EBDD] focus:border-[#00B884] focus:ring-1 focus:ring-[#00B884] outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#A8B9AE] uppercase block mb-1">Temperature (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    name="temperature"
                    value={formData.temperature}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-[#0C241E] border border-white/10 text-sm font-bold text-[#F3EBDD] focus:border-[#00B884] focus:ring-1 focus:ring-[#00B884] outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#A8B9AE] uppercase block mb-1">Humidity (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    name="humidity"
                    value={formData.humidity}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-[#0C241E] border border-white/10 text-sm font-bold text-[#F3EBDD] focus:border-[#00B884] focus:ring-1 focus:ring-[#00B884] outline-none"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-[#A8B9AE] uppercase block mb-1">Seasonal Rainfall (mm)</label>
                  <input
                    type="number"
                    step="0.1"
                    name="rainfall"
                    value={formData.rainfall}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-[#0C241E] border border-white/10 text-sm font-bold text-[#F3EBDD] focus:border-[#00B884] focus:ring-1 focus:ring-[#00B884] outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <p className="text-xs text-[#738A7C] hidden sm:block">
                Evaluates Random Forest Model + Gaussian Agronomic Boundary Metrics
              </p>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-7 py-3 rounded-xl bg-[#00B884] hover:bg-[#00D097] text-[#071C17] font-black text-xs uppercase tracking-wider shadow-[0_4px_20px_rgba(0,184,132,0.3)] transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                <span>{loading ? 'Evaluating Farm Telemetry...' : 'Generate Farm Decisions'}</span>
              </button>
            </div>

          </form>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle size={16} className="text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* DECISION HIERARCHY LAYER */}
        {result && (
          <div className="space-y-7">
            
            {/* ========================================================= */}
            {/* LEVEL 1: FARM STATUS                                      */}
            {/* ========================================================= */}
            <div className="p-6 sm:p-7 rounded-3xl bg-[#102D25] border border-white/10 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#738A7C]">
                  Level 1 • Farm Status
                </span>
                <span className="px-3 py-0.5 rounded-full bg-[#00B884]/20 text-[#00B884] text-[10px] font-black uppercase border border-[#00B884]/30">
                  {result.suitability_scores?.status || 'OPTIMAL'}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-[#F3EBDD]">
                    🌾 {result.recommended_crop}
                  </h2>
                  <p className="text-xs text-[#A8B9AE] mt-1">
                    Highest agronomic suitability rating for current soil chemistry and seasonal parameters in {formData.location}.
                  </p>
                </div>
                {result.confidence && (
                  <div className="text-left sm:text-right">
                    <span className="text-4xl font-black text-[#00B884]">{result.confidence}%</span>
                    <span className="block text-[10px] font-bold uppercase text-[#738A7C]">AI Confidence Score</span>
                  </div>
                )}
              </div>

              {/* Multi-parameter Suitability Bars */}
              {result.suitability_scores && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-white/10">
                  <div className="p-3 rounded-xl bg-[#0C241E] border border-white/5">
                    <span className="text-[10px] font-bold text-[#738A7C] uppercase block">Soil Fit</span>
                    <span className="text-sm font-black text-[#00B884]">{result.suitability_scores.soil}%</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#0C241E] border border-white/5">
                    <span className="text-[10px] font-bold text-[#738A7C] uppercase block">Weather Fit</span>
                    <span className="text-sm font-black text-[#00E5FF]">{result.suitability_scores.weather}%</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#0C241E] border border-white/5">
                    <span className="text-[10px] font-bold text-[#738A7C] uppercase block">Water Fit</span>
                    <span className="text-sm font-black text-[#38BDF8]">{result.suitability_scores.water}%</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#0C241E] border border-white/5">
                    <span className="text-[10px] font-bold text-[#738A7C] uppercase block">Nutrient Fit</span>
                    <span className="text-sm font-black text-[#D6A84F]">{result.suitability_scores.nutrients}%</span>
                  </div>
                </div>
              )}
            </div>

            {/* ========================================================= */}
            {/* LEVEL 2: WHAT IS HAPPENING?                               */}
            {/* ========================================================= */}
            <div className="p-6 sm:p-7 rounded-3xl bg-[#102D25] border border-white/10 shadow-xl space-y-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#738A7C] block border-b border-white/10 pb-2">
                Level 2 • What Is Happening?
              </span>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-[#0C241E] border border-white/5 space-y-1">
                  <span className="text-[10px] font-bold text-[#738A7C] uppercase block">Nutrient Assessment</span>
                  <p className="text-xs font-bold text-[#F3EBDD]">
                    N: {result.soil_intelligence?.N || 'Adequate'} • P: {result.soil_intelligence?.P || 'Adequate'} • K: {result.soil_intelligence?.K || 'Adequate'}
                  </p>
                  <p className="text-[11px] text-[#A8B9AE]">
                    Soil pH is {result.soil_intelligence?.ph || 'Suitable'} ({formData.ph}).
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#0C241E] border border-white/5 space-y-1">
                  <span className="text-[10px] font-bold text-[#738A7C] uppercase block">Atmospheric Demand</span>
                  <p className="text-xs font-bold text-[#F3EBDD]">
                    {formData.temperature}°C Temperature • {formData.humidity}% Humidity
                  </p>
                  <p className="text-[11px] text-[#A8B9AE]">
                    Seasonal rainfall total is {formData.rainfall} mm.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#0C241E] border border-white/5 space-y-1">
                  <span className="text-[10px] font-bold text-[#738A7C] uppercase block">Alternative Top Options</span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {result.top_predictions?.slice(1, 4).map((p, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-[#102D25] border border-white/10 text-[10px] font-bold text-[#00B884]">
                        {p.crop} ({p.confidence}%)
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ========================================================= */}
            {/* LEVEL 3: WHY? (EXPLAINABLE AI)                            */}
            {/* ========================================================= */}
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#738A7C] block mb-2 px-1">
                Level 3 • Why Did AgriNivara Recommend This?
              </span>
              <ExplainableAISection
                items={result.explainability}
                recommendedCrop={result.recommended_crop}
                confidence={result.confidence}
                lang="en"
              />
            </div>

            {/* ========================================================= */}
            {/* LEVEL 4: WHAT SHOULD I DO? (ACTION PLAN)                  */}
            {/* ========================================================= */}
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#738A7C] block mb-2 px-1">
                Level 4 • What Should The Farmer Do?
              </span>
              {result.action_plan && (
                <SmartActionPlan
                  plan={result.action_plan}
                  recommendedCrop={result.recommended_crop}
                  lang="en"
                />
              )}
            </div>

          </div>
        )}

      </main>

      <AskAgriNivaraFloating farmerContext={{ location: formData.location }} />
    </div>
  );
}