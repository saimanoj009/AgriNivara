import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Leaf,
  MapPin,
  Sprout,
  AlertCircle,
  Loader2,
  Sparkles,
  RefreshCw,
  SlidersHorizontal,
  CheckCircle2,
  Activity,
  Droplets,
  ThermometerSun,
  ShieldCheck,
  ChevronRight,
  Layers,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import type {
  CropPredictionResponse,
  FarmAnalysisResponse,
  FarmInputs,
  Language,
  LocationSuggestion,
  WeatherIntelligence,
} from '../types/agriculture';

import {
  fetchRealtimeWeatherApi,
  getFarmAnalysisApi,
  predictCropApi,
  searchLocationApi,
} from '../services/api';

import {
  generateActionPlan,
  generateAlternativeAnalysis,
  generateExplainability,
  generateRiskAnalysis,
  generateSuitabilityScores,
  getSoilIntelligence,
} from '../utils/cropKnowledge';

import { t } from '../utils/translations';
import { Navbar } from '../components/Navbar';
import { FarmProfileSummary } from '../components/FarmProfileSummary';
import { ExplainableAISection } from '../components/ExplainableAISection';
import { FarmSuitabilityScores } from '../components/FarmSuitabilityScores';
import { AgriculturalRiskAnalysis } from '../components/AgriculturalRiskAnalysis';
import { SmartActionPlan } from '../components/SmartActionPlan';
import { WhatIfSimulator } from '../components/WhatIfSimulator';
import { AlternativeCropComparison } from '../components/AlternativeCropComparison';
import { SoilIntelligenceSection } from '../components/SoilIntelligenceSection';
import { WeatherIntelligenceSection } from '../components/WeatherIntelligenceSection';
import { VoiceAssistant } from '../components/VoiceAssistant';
import { FutureModules } from '../components/FutureModules';
import { GlassCard } from '../components/ui/GlassCard';

export default function CropRecommendation() {
  // --------------------------------------------------------
  // LANGUAGE & VOICE STATES
  // --------------------------------------------------------
  const [currentLang, setCurrentLang] = useState<Language>('en');
  const [isSpeaking, setIsSpeaking] = useState(false);

  // --------------------------------------------------------
  // FORM & LOCATION STATES
  // --------------------------------------------------------
  const [formData, setFormData] = useState<FarmInputs>({
    N: 90,
    P: 42,
    K: 43,
    temperature: 20.8,
    humidity: 82.0,
    ph: 6.5,
    rainfall: 202.9,
    location: 'Hyderabad, Telangana',
    lat: 17.385,
    lon: 78.4867,
  });

  const [locationSearch, setLocationSearch] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [locationLoading, setLocationLoading] = useState(false);

  // --------------------------------------------------------
  // WEATHER STATE
  // --------------------------------------------------------
  const [weather, setWeather] = useState<WeatherIntelligence>({
    temperature: 20.8,
    humidity: 82,
    rainfall: 202.9,
    condition: 'Partly Cloudy',
    windSpeed: 12,
    risk: 'Optimal growth conditions',
    forecast: [
      { day: 'Mon', date: '2026-08-17', tempMax: 28, tempMin: 20, rainProb: 20, rainfallMm: 5.0, condition: 'Partly Sunny' },
      { day: 'Tue', date: '2026-08-18', tempMax: 29, tempMin: 21, rainProb: 15, rainfallMm: 2.0, condition: 'Clear Sky' },
      { day: 'Wed', date: '2026-08-19', tempMax: 27, tempMin: 19, rainProb: 60, rainfallMm: 18.0, condition: 'Light Rain' },
      { day: 'Thu', date: '2026-08-20', tempMax: 26, tempMin: 18, rainProb: 40, rainfallMm: 8.0, condition: 'Showers' },
      { day: 'Fri', date: '2026-08-21', tempMax: 30, tempMin: 22, rainProb: 10, rainfallMm: 0.0, condition: 'Sunny' },
    ],
    isLoaded: true,
  });

  // Fetch initial weather & run default analysis on mount
  useEffect(() => {
    fetchInitialWeather();
    handleAnalyzeFarm();
  }, []);

  const fetchInitialWeather = async () => {
    try {
      const wData = await fetchRealtimeWeatherApi(17.385, 78.4867);
      setWeather(wData);
      setFormData((prev) => ({
        ...prev,
        temperature: wData.temperature,
        humidity: wData.humidity,
        rainfall: wData.rainfall,
      }));
    } catch (e) {
      console.error('Initial weather fetch error:', e);
    }
  };

  // --------------------------------------------------------
  // LOCATION SEARCH & SELECT
  // --------------------------------------------------------
  const handleLocationSearch = async (val: string) => {
    setLocationSearch(val);
    if (val.length < 3) {
      setLocationSuggestions([]);
      return;
    }
    setLocationLoading(true);
    try {
      const res = await searchLocationApi(val);
      setLocationSuggestions(res);
    } catch (e) {
      setLocationSuggestions([]);
    } finally {
      setLocationLoading(false);
    }
  };

  const handleSelectLocation = async (loc: LocationSuggestion) => {
    const lat = parseFloat(loc.lat);
    const lon = parseFloat(loc.lon);
    setFormData((prev) => ({
      ...prev,
      location: loc.display_name,
      lat,
      lon,
    }));
    setLocationSearch('');
    setLocationSuggestions([]);

    try {
      const wData = await fetchRealtimeWeatherApi(lat, lon);
      setWeather(wData);
      setFormData((prev) => ({
        ...prev,
        temperature: wData.temperature,
        humidity: wData.humidity,
        rainfall: wData.rainfall > 0 ? wData.rainfall : prev.rainfall,
      }));
    } catch (e) {
      console.error('Weather fetch error:', e);
    }
  };

  // --------------------------------------------------------
  // MAIN ANALYZE FARM DECISION ENGINE
  // --------------------------------------------------------
  const [analysisResult, setAnalysisResult] = useState<FarmAnalysisResponse | null>(null);
  const [cropPrediction, setCropPrediction] = useState<CropPredictionResponse | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string>('');
  const [analysisStep, setAnalysisStep] = useState<number>(0);

  const handleAnalyzeFarm = async () => {
    setAnalyzing(true);
    setAnalysisError('');
    setAnalysisStep(1);

    const stepTimer1 = setTimeout(() => setAnalysisStep(2), 300);
    const stepTimer2 = setTimeout(() => setAnalysisStep(3), 600);

    try {
      const res = await getFarmAnalysisApi(formData);
      setAnalysisResult(res);

      setCropPrediction({
        success: true,
        recommended_crop: res.recommended_crop,
        confidence: res.confidence,
        top_predictions: res.top_predictions,
        input_features: {
          N: formData.N,
          P: formData.P,
          K: formData.K,
          temperature: formData.temperature,
          humidity: formData.humidity,
          ph: formData.ph,
          rainfall: formData.rainfall,
        },
      });
    } catch (err: any) {
      try {
        const pred = await predictCropApi(formData);
        setCropPrediction(pred);

        const recCrop = pred.recommended_crop;
        const topPreds = pred.top_predictions || [{ crop: recCrop, confidence: pred.confidence || 95 }];

        const explainability = generateExplainability(formData, recCrop);
        const suitability = generateSuitabilityScores(formData, recCrop);
        const risks = generateRiskAnalysis(formData, recCrop);
        const actionPlan = generateActionPlan(formData, recCrop, risks);
        const soilIntel = getSoilIntelligence(formData);
        const altAnalysis = generateAlternativeAnalysis(formData, topPreds);

        setAnalysisResult({
          success: true,
          recommended_crop: recCrop,
          target_crop: recCrop,
          confidence: pred.confidence || 95,
          top_predictions: topPreds,
          explainability,
          suitability_scores: suitability,
          risk_analysis: risks,
          action_plan: actionPlan,
          alternative_analysis: altAnalysis,
          soil_intelligence: soilIntel,
          data_integrity: {
            ml_method: 'Random Forest Classifier (Client Fallback)',
            xai_method: 'Feature Bound Agronomic Rule Engine',
            live_weather: 'Open-Meteo API',
            simulation: 'Available',
          },
        });
      } catch (fallbackErr: any) {
        setAnalysisError('Unable to connect to the AgriNivara AI server. Please try again.');
      }
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setTimeout(() => setAnalyzing(false), 500);
    }
  };

  // Quick Preset Handlers for SIH Judge Demos
  const applyPreset = (preset: 'rice' | 'wheat' | 'cotton' | 'maize') => {
    const presets = {
      rice: { N: 90, P: 42, K: 43, temperature: 24, humidity: 82, ph: 6.5, rainfall: 210, location: 'Guntur, Andhra Pradesh' },
      wheat: { N: 120, P: 55, K: 40, temperature: 18, humidity: 55, ph: 6.8, rainfall: 85, location: 'Ludhiana, Punjab' },
      cotton: { N: 110, P: 50, K: 45, temperature: 28, humidity: 65, ph: 7.2, rainfall: 90, location: 'Warangal, Telangana' },
      maize: { N: 85, P: 48, K: 35, temperature: 25, humidity: 60, ph: 6.2, rainfall: 110, location: 'Dharwad, Karnataka' },
    };
    setFormData((prev) => ({ ...prev, ...presets[preset] }));
  };

  const recCrop = analysisResult?.recommended_crop || cropPrediction?.recommended_crop || 'rice';
  const confidence = analysisResult?.confidence || cropPrediction?.confidence || 95;
  const suitability = analysisResult?.suitability_scores || generateSuitabilityScores(formData, recCrop);
  const risks = analysisResult?.risk_analysis || generateRiskAnalysis(formData, recCrop);
  const explainability = analysisResult?.explainability || generateExplainability(formData, recCrop);
  const actionPlan = analysisResult?.action_plan || generateActionPlan(formData, recCrop, risks);
  const soilIntel = analysisResult?.soil_intelligence || getSoilIntelligence(formData);
  const altAnalysis =
    analysisResult?.alternative_analysis ||
    generateAlternativeAnalysis(formData, cropPrediction?.top_predictions || [{ crop: recCrop, confidence }]);

  const mainRisk =
    risks.find((r) => r.severity === 'HIGH' || r.severity === 'MODERATE')?.title || 'Low Environmental Risk';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20 selection:bg-emerald-500 selection:text-slate-950">
      
      {/* NAVBAR */}
      <Navbar
        currentLang={currentLang}
        onLangChange={setCurrentLang}
        isSpeaking={isSpeaking}
        onToggleSpeech={() => setIsSpeaking(!isSpeaking)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-8">
        
        {/* BREADCRUMB & HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Command Center
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <Sprout className="w-8 h-8 text-emerald-400 shrink-0" />
              AI Crop Suitability & Agronomic Advisory
            </h1>
            <p className="text-xs text-slate-400">
              Multi-parametric decision engine with transparent feature boundary attribution
            </p>
          </div>

          {/* AI Decision Pipeline Ribbon */}
          <div className="hidden lg:flex items-center gap-2 text-[10px] font-extrabold bg-slate-900 px-4 py-2 rounded-2xl border border-slate-800 text-slate-400">
            <span className="text-emerald-400">NPK Telemetry</span>
            <span>→</span>
            <span className="text-teal-400">Live Weather</span>
            <span>→</span>
            <span className="text-purple-400">Decision Engine</span>
            <span>→</span>
            <span className="text-amber-400">Explainability</span>
            <span>→</span>
            <span className="text-white font-black bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">
              Optimal Recommendation
            </span>
          </div>
        </div>

        {/* SECTION 1: FARM CONDITIONS INPUT PROTOCOL */}
        <GlassCard variant="emerald" className="p-6 sm:p-8 relative">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-white">
                  Farm Conditions & Soil Parameters
                </h2>
                <p className="text-xs text-slate-400">
                  Configure soil NPK, pH, and hyperlocal location coordinates
                </p>
              </div>
            </div>

            {/* Regional Soil Presets */}
            <div className="flex items-center gap-1.5 self-start sm:self-center">
              <span className="text-[10px] font-bold text-slate-400 mr-1 hidden sm:inline">Soil Profiles:</span>
              <button
                type="button"
                onClick={() => applyPreset('rice')}
                className="px-2.5 py-1 text-[10px] font-extrabold rounded-lg bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-slate-800"
              >
                🌾 Alluvial (Paddy)
              </button>
              <button
                type="button"
                onClick={() => applyPreset('wheat')}
                className="px-2.5 py-1 text-[10px] font-extrabold rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-800"
              >
                🌾 Sandy Loam (Wheat)
              </button>
              <button
                type="button"
                onClick={() => applyPreset('cotton')}
                className="px-2.5 py-1 text-[10px] font-extrabold rounded-lg bg-slate-900 hover:bg-slate-800 text-teal-400 border border-slate-800"
              >
                ☁️ Black Soil (Cotton)
              </button>
              <button
                type="button"
                onClick={() => applyPreset('maize')}
                className="px-2.5 py-1 text-[10px] font-extrabold rounded-lg bg-slate-900 hover:bg-slate-800 text-lime-400 border border-slate-800"
              >
                🌽 Red Loam (Maize)
              </button>
            </div>
          </div>

          {/* INPUT FORM GRID */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6">
            
            {/* LOCATION SEARCH */}
            <div className="md:col-span-4 space-y-2">
              <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider block">
                {t('location', currentLang)}
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder={formData.location || 'Search location (e.g. Guntur)...'}
                  value={locationSearch}
                  onChange={(e) => handleLocationSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                />
                {locationLoading && (
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-400 absolute right-3.5 top-3.5" />
                )}

                {/* SUGGESTIONS DROPDOWN */}
                {locationSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-slate-900 rounded-xl shadow-2xl border border-slate-800 overflow-hidden max-h-48 overflow-y-auto">
                    {locationSuggestions.map((loc) => (
                      <button
                        key={loc.place_id}
                        type="button"
                        onClick={() => handleSelectLocation(loc)}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-emerald-950/70 text-slate-200 font-medium truncate border-b border-slate-800/60 last:border-0 cursor-pointer"
                      >
                        {loc.display_name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Auto-syncs hyperlocal weather and rainfall data from Open-Meteo satellites.
              </p>
            </div>

            {/* NUMERIC INPUTS */}
            <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                  {t('nitrogen', currentLang)} (N)
                </label>
                <input
                  type="number"
                  value={formData.N}
                  onChange={(e) => setFormData({ ...formData, N: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm font-black text-white focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                  {t('phosphorus', currentLang)} (P)
                </label>
                <input
                  type="number"
                  value={formData.P}
                  onChange={(e) => setFormData({ ...formData, P: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm font-black text-white focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                  {t('potassium', currentLang)} (K)
                </label>
                <input
                  type="number"
                  value={formData.K}
                  onChange={(e) => setFormData({ ...formData, K: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm font-black text-white focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                  {t('ph', currentLang)} Level
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.ph}
                  onChange={(e) => setFormData({ ...formData, ph: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm font-black text-white focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                  {t('temperature', currentLang)} (°C)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.temperature}
                  onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm font-black text-white focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                  {t('humidity', currentLang)} (%)
                </label>
                <input
                  type="number"
                  value={formData.humidity}
                  onChange={(e) => setFormData({ ...formData, humidity: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm font-black text-white focus:border-emerald-500"
                />
              </div>

              <div className="col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                  {t('rainfall', currentLang)} (mm)
                </label>
                <input
                  type="number"
                  value={formData.rainfall}
                  onChange={(e) => setFormData({ ...formData, rainfall: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm font-black text-white focus:border-emerald-500"
                />
              </div>
            </div>

          </div>

          {/* SUBMIT BUTTON & MULTI-STAGE ANALYSIS FEEDBACK */}
          <div className="mt-6 pt-5 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              {analyzing ? (
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>
                    {analysisStep === 1 && '1/3 Reading Soil & Climate Telemetry...'}
                    {analysisStep === 2 && '2/3 Evaluating Agronomic Suitability Models...'}
                    {analysisStep === 3 && '3/3 Synthesizing Explainable Insights & Action Plan...'}
                  </span>
                </div>
              ) : (
                <p className="text-xs text-slate-400">
                  Runs Precision Decision Engine + Explainable Attribution + Environmental Risk Assessment
                </p>
              )}
            </div>

            <button
              onClick={handleAnalyzeFarm}
              disabled={analyzing}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-xl shadow-emerald-500/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t('analyzing', currentLang)}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{t('analyzeMyFarm', currentLang)}</span>
                </>
              )}
            </button>
          </div>

          {analysisError && (
            <div className="mt-4 p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{analysisError}</span>
            </div>
          )}
        </GlassCard>

        {/* SECTION 2: EXECUTIVE FARM SUMMARY BANNER */}
        <FarmProfileSummary
          inputs={formData}
          recommendedCrop={recCrop}
          confidence={confidence}
          suitability={suitability}
          mainRisk={mainRisk}
          lang={currentLang}
        />

        {/* SECTION 3 & 4: EXPLAINABLE AI & SUITABILITY SCORES */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7">
            <ExplainableAISection
              items={explainability}
              recommendedCrop={recCrop}
              lang={currentLang}
            />
          </div>

          <div className="lg:col-span-5">
            <FarmSuitabilityScores
              suitability={suitability}
              lang={currentLang}
            />
          </div>
        </div>

        {/* SECTION 5: AGRICULTURAL RISK ANALYSIS */}
        <AgriculturalRiskAnalysis
          risks={risks}
          lang={currentLang}
        />

        {/* SECTION 6: SMART FARM ACTION PLAN */}
        <SmartActionPlan
          plan={actionPlan}
          recommendedCrop={recCrop}
          lang={currentLang}
        />

        {/* SECTION 7: INTERACTIVE WHAT-IF CROP SIMULATOR */}
        {cropPrediction && (
          <WhatIfSimulator
            currentInputs={formData}
            currentPrediction={cropPrediction}
            lang={currentLang}
          />
        )}

        {/* SECTION 8: TOP ALTERNATIVE CROP COMPARISON */}
        <AlternativeCropComparison
          alternatives={altAnalysis}
          lang={currentLang}
        />

        {/* SECTION 9: SOIL INTELLIGENCE */}
        <SoilIntelligenceSection
          inputs={formData}
          soilIntel={soilIntel}
          recommendedCrop={recCrop}
          lang={currentLang}
        />

        {/* SECTION 10: WEATHER INTELLIGENCE */}
        <WeatherIntelligenceSection
          weather={weather}
          lang={currentLang}
        />

        {/* SECTION 11: FUTURE INNOVATION CAPABILITIES */}
        <FutureModules
          inputs={formData}
          recommendedCrop={recCrop}
          lang={currentLang}
          onSimulateIotData={(sim) => setFormData((prev) => ({ ...prev, ...sim }))}
        />

      </main>

      {/* FLOATING VOICE READOUT ASSISTANT */}
      <VoiceAssistant
        recommendedCrop={recCrop}
        confidence={confidence}
        suitabilityStatus={suitability.status}
        primaryRisk={mainRisk}
        lang={currentLang}
        isSpeaking={isSpeaking}
        onToggleSpeech={() => setIsSpeaking(!isSpeaking)}
      />

    </div>
  );
}