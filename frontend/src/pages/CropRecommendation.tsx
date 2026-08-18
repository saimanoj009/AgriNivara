import { useState, useEffect } from 'react';
import {
    ArrowLeft,
    Leaf,
    MapPin,
    Sprout,
    AlertCircle,
    Loader2,
    Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';

import type {
    CropPredictionResponse,
    FarmAnalysisResponse,
    FarmInputs,
    Language,
    LocationSuggestion,
    WeatherIntelligence
} from '../types/agriculture';

import {
    fetchRealtimeWeatherApi,
    getFarmAnalysisApi,
    predictCropApi,
    searchLocationApi
} from '../services/api';

import {
    generateActionPlan,
    generateAlternativeAnalysis,
    generateExplainability,
    generateRiskAnalysis,
    generateSuitabilityScores,
    getSoilIntelligence
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
        lat: 17.3850,
        lon: 78.4867
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
            { day: 'Fri', date: '2026-08-21', tempMax: 30, tempMin: 22, rainProb: 10, rainfallMm: 0.0, condition: 'Sunny' }
        ],
        isLoaded: true
    });

    // Fetch initial weather & run default analysis on mount
    useEffect(() => {
        fetchInitialWeather();
        handleAnalyzeFarm();
    }, []);

    const fetchInitialWeather = async () => {
        try {
            const wData = await fetchRealtimeWeatherApi(17.3850, 78.4867);
            setWeather(wData);
            setFormData(prev => ({ ...prev, temperature: wData.temperature, humidity: wData.humidity, rainfall: wData.rainfall }));
        } catch (e) { console.error('Initial weather fetch error:', e); }
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
        setFormData(prev => ({
            ...prev,
            location: loc.display_name,
            lat,
            lon
        }));
        setLocationSearch('');
        setLocationSuggestions([]);

        try {
            const wData = await fetchRealtimeWeatherApi(lat, lon);
            setWeather(wData);
            setFormData(prev => ({
                ...prev,
                temperature: wData.temperature,
                humidity: wData.humidity,
                rainfall: wData.rainfall > 0 ? wData.rainfall : prev.rainfall
            }));
        } catch (e) {
            console.error("Weather fetch error:", e);
        }
    };

    // --------------------------------------------------------
    // MAIN ANALYZE FARM DECISION ENGINE
    // --------------------------------------------------------
    const [analysisResult, setAnalysisResult] = useState<FarmAnalysisResponse | null>(null);
    const [cropPrediction, setCropPrediction] = useState<CropPredictionResponse | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [analysisError, setAnalysisError] = useState<string>('');

    const handleAnalyzeFarm = async () => {
        setAnalyzing(true);
        setAnalysisError('');

        try {
            const res = await getFarmAnalysisApi(formData);
            setAnalysisResult(res);
            
            setCropPrediction({
                success: true,
                recommended_crop: res.recommended_crop,
                confidence: res.confidence,
                top_predictions: res.top_predictions,
                input_features: {
                    N: formData.N, P: formData.P, K: formData.K,
                    temperature: formData.temperature, humidity: formData.humidity,
                    ph: formData.ph, rainfall: formData.rainfall
                }
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
                        ml_method: "Random Forest Classifier (Client Fallback)",
                        xai_method: "Feature Bound Agronomic Rule Engine",
                        live_weather: "Open-Meteo API",
                        simulation: "Available"
                    }
                });
            } catch (fallbackErr: any) {
                setAnalysisError("Unable to connect to the AgriNivara AI server. Please try again.");
            }
        } finally {
            setAnalyzing(false);
        }
    };

    const recCrop = analysisResult?.recommended_crop || cropPrediction?.recommended_crop || 'rice';
    const confidence = analysisResult?.confidence || cropPrediction?.confidence || 95;
    const suitability = analysisResult?.suitability_scores || generateSuitabilityScores(formData, recCrop);
    const risks = analysisResult?.risk_analysis || generateRiskAnalysis(formData, recCrop);
    const explainability = analysisResult?.explainability || generateExplainability(formData, recCrop);
    const actionPlan = analysisResult?.action_plan || generateActionPlan(formData, recCrop, risks);
    const soilIntel = analysisResult?.soil_intelligence || getSoilIntelligence(formData);
    const altAnalysis = analysisResult?.alternative_analysis || generateAlternativeAnalysis(formData, cropPrediction?.top_predictions || [{ crop: recCrop, confidence }]);

    const mainRisk = risks.find(r => r.severity === 'HIGH' || r.severity === 'MODERATE')?.title || 'Low Environmental Risk';

    return (
        <div className="min-h-screen bg-slate-100 text-slate-900 font-sans pb-16">
            
            {/* NAVBAR */}
            <Navbar
                currentLang={currentLang}
                onLangChange={setCurrentLang}
                isSpeaking={isSpeaking}
                onToggleSpeech={() => setIsSpeaking(!isSpeaking)}
            />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
                
                {/* BREADCRUMB & PAGE TITLE */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div className="space-y-1">
                        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition">
                            <ArrowLeft className="w-3.5 h-3.5" />
                            Back to Dashboard
                        </Link>
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                            <Leaf className="w-7 h-7 text-emerald-600 shrink-0" />
                            {t('appSubtitle', currentLang)}
                        </h1>
                    </div>

                    {/* AI DECISION PIPELINE STEP BADGES */}
                    <div className="hidden lg:flex items-center gap-1.5 text-[10px] font-bold bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm text-slate-600">
                        <span className="text-emerald-700">Inputs</span>
                        <span>→</span>
                        <span className="text-sky-700">Weather</span>
                        <span>→</span>
                        <span className="text-purple-700">RF ML Model</span>
                        <span>→</span>
                        <span className="text-amber-700">XAI & Risks</span>
                        <span>→</span>
                        <span className="text-emerald-700 font-black">Decision</span>
                    </div>
                </div>

                {/* SECTION 1: FARM CONDITIONS & LOCATION INPUT CARD */}
                <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200 mb-8">
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 font-bold">
                                <Sprout className="w-5 h-5 text-emerald-700" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">
                                    {t('farmConditions', currentLang)}
                                </h2>
                                <p className="text-xs text-slate-500 font-medium">
                                    Specify soil nutrients, location, and weather for AI Decision Analysis
                                </p>
                            </div>
                        </div>

                        <span className="self-start sm:self-center text-[11px] font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                            Farmer Input Protocol
                        </span>
                    </div>

                    {/* INPUT FORM GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        
                        {/* LOCATION SEARCH */}
                        <div className="space-y-2 md:col-span-1">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                                {t('location', currentLang)}
                            </label>
                            <div className="relative">
                                <div className="relative flex items-center">
                                    <MapPin className="w-4 h-4 text-emerald-600 absolute left-3" />
                                    <input
                                        type="text"
                                        placeholder={formData.location || "Search location (e.g. Guntur)..."}
                                        value={locationSearch}
                                        onChange={(e) => handleLocationSearch(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                    {locationLoading && (
                                        <Loader2 className="w-4 h-4 animate-spin text-emerald-600 absolute right-3" />
                                    )}
                                </div>

                                {/* SUGGESTIONS DROPDOWN */}
                                {locationSuggestions.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden max-h-48 overflow-y-auto">
                                        {locationSuggestions.map((loc) => (
                                            <button
                                                key={loc.place_id}
                                                type="button"
                                                onClick={() => handleSelectLocation(loc)}
                                                className="w-full text-left px-3 py-2 text-xs hover:bg-emerald-50 text-slate-800 font-medium truncate border-b border-slate-100 last:border-0 cursor-pointer"
                                            >
                                                {loc.display_name}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <p className="text-[11px] text-slate-500 font-medium">
                                Auto-loads real-time temperature, humidity & rainfall via Open-Meteo.
                            </p>
                        </div>

                        {/* NPK & PH SLIDERS / NUMERIC INPUTS */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:col-span-2">
                            
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                                    {t('nitrogen', currentLang)}
                                </label>
                                <input
                                    type="number"
                                    value={formData.N}
                                    onChange={(e) => setFormData({ ...formData, N: parseFloat(e.target.value) || 0 })}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-sm font-extrabold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                                    {t('phosphorus', currentLang)}
                                </label>
                                <input
                                    type="number"
                                    value={formData.P}
                                    onChange={(e) => setFormData({ ...formData, P: parseFloat(e.target.value) || 0 })}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-sm font-extrabold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                                    {t('potassium', currentLang)}
                                </label>
                                <input
                                    type="number"
                                    value={formData.K}
                                    onChange={(e) => setFormData({ ...formData, K: parseFloat(e.target.value) || 0 })}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-sm font-extrabold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                                    {t('ph', currentLang)}
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={formData.ph}
                                    onChange={(e) => setFormData({ ...formData, ph: parseFloat(e.target.value) || 0 })}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-sm font-extrabold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                                    {t('temperature', currentLang)}
                                </label>
                                <input
                                    type="number"
                                    step="0.5"
                                    value={formData.temperature}
                                    onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) || 0 })}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-sm font-extrabold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                                    {t('humidity', currentLang)}
                                </label>
                                <input
                                    type="number"
                                    value={formData.humidity}
                                    onChange={(e) => setFormData({ ...formData, humidity: parseFloat(e.target.value) || 0 })}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-sm font-extrabold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>

                            <div className="col-span-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                                    {t('rainfall', currentLang)}
                                </label>
                                <input
                                    type="number"
                                    value={formData.rainfall}
                                    onChange={(e) => setFormData({ ...formData, rainfall: parseFloat(e.target.value) || 0 })}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-sm font-extrabold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>

                        </div>

                    </div>

                    {/* ANALYZE MY FARM BUTTON */}
                    <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-xs text-slate-500">
                            Runs Random Forest ML Model + XAI Explainability Engine + Risk Evaluation
                        </p>

                        <button
                            onClick={handleAnalyzeFarm}
                            disabled={analyzing}
                            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm uppercase tracking-wider shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                        >
                            {analyzing ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    {t('analyzing', currentLang)}
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5" />
                                    {t('analyzeMyFarm', currentLang)}
                                </>
                            )}
                        </button>
                    </div>

                    {/* ERROR MESSAGE IF ANY */}
                    {analysisError && (
                        <div className="mt-4 p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                            <span>{analysisError}</span>
                        </div>
                    )}

                </div>

                {/* SECTION 2: EXECUTIVE FARM SUMMARY BANNER */}
                <FarmProfileSummary
                    inputs={formData}
                    recommendedCrop={recCrop}
                    confidence={confidence}
                    suitability={suitability}
                    mainRisk={mainRisk}
                    lang={currentLang}
                />

                {/* SECTION 3 & 4: EXPLAINABLE AI & SUITABILITY SCORES (GRID) */}
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

                {/* SECTION 7: INTERACTIVE WHAT-IF CROP SIMULATOR (INNOVATION FEATURE) */}
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
                    onSimulateIotData={(sim) => setFormData(prev => ({ ...prev, ...sim }))}
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