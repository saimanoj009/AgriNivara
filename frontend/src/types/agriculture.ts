// ============================================================
// AGRINIVARA - TYPESCRIPT TYPES FOR DECISION SUPPORT SYSTEM
// ============================================================

export interface LocationSuggestion {
    place_id: number;
    display_name: string;
    lat: string;
    lon: string;
}

export interface FarmInputs {
    N: number;
    P: number;
    K: number;
    temperature: number;
    humidity: number;
    ph: number;
    rainfall: number;
    location: string;
    lat?: number;
    lon?: number;
}

export interface TopPrediction {
    crop: string;
    confidence: number;
}

export interface CropPredictionResponse {
    success: boolean;
    recommended_crop: string;
    confidence: number | null;
    top_predictions: TopPrediction[];
    input_features: {
        N: number;
        P: number;
        K: number;
        temperature: number;
        humidity: number;
        ph: number;
        rainfall: number;
    };
}

export interface ExplainabilityItem {
    feature: string;
    key: string;
    status: 'good' | 'moderate' | 'warning';
    score: number;
    actual_value: number;
    optimal_range: string;
    message: string;
}

export interface SuitabilityScores {
    soil: number;
    weather: number;
    water: number;
    nutrients: number;
    overall: number;
    status: 'GOOD' | 'MODERATE' | 'NEEDS ATTENTION';
}

export interface RiskItem {
    title: string;
    severity: 'LOW' | 'MODERATE' | 'HIGH';
    reason: string;
    mitigation: string;
}

export interface ActionPlan {
    before_planting: string[];
    during_growth: string[];
    warning: string[];
    next_action: string[];
}

export interface AlternativeAnalysis {
    crop: string;
    confidence: number;
    soil_fit: string;
    weather_fit: string;
    water_fit: string;
    risk_rating: 'LOW' | 'MODERATE' | 'HIGH';
}

export interface SoilIntelligence {
    N: 'LOW' | 'MODERATE' | 'HIGH';
    P: 'LOW' | 'MODERATE' | 'HIGH';
    K: 'LOW' | 'MODERATE' | 'HIGH';
    ph: 'ACIDIC' | 'SUITABLE' | 'ALKALINE';
    disclaimer: string;
}

export interface ForecastDay {
    day: string;
    date: string;
    tempMax: number;
    tempMin: number;
    rainProb: number;
    rainfallMm: number;
    condition: string;
}

export interface WeatherIntelligence {
    temperature: number;
    humidity: number;
    rainfall: number;
    condition: string;
    windSpeed: number;
    risk: string;
    forecast: ForecastDay[];
    isLoaded: boolean;
}

export interface FarmAnalysisResponse {
    success: boolean;
    recommended_crop: string;
    target_crop: string;
    confidence: number;
    top_predictions: TopPrediction[];
    explainability: ExplainabilityItem[];
    suitability_scores: SuitabilityScores;
    risk_analysis: RiskItem[];
    action_plan: ActionPlan;
    alternative_analysis: AlternativeAnalysis[];
    soil_intelligence: SoilIntelligence;
    data_integrity: {
        ml_method: string;
        xai_method: string;
        live_weather: string;
        simulation: string;
    };
}

export interface WhatIfResponse {
    success: boolean;
    crop_changed: boolean;
    explanation: string;
    current: CropPredictionResponse;
    changed: CropPredictionResponse;
}

export type Language = 'en' | 'te' | 'hi';

export interface SIHJudgeSpecs {
    model_architecture: string;
    n_estimators: number;
    num_classes: number;
    features: string[];
    xai_engine: string;
    apis_integrated: string[];
    version: string;
    sih_presentation_ready: boolean;
}
