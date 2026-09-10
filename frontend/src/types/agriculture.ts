// ============================================================
// AGRINIVARA - TYPESCRIPT TYPES FOR DECISION SUPPORT SYSTEM
// ============================================================

export interface StructuredLocation {
    display_name: string;
    village?: string;
    city: string;
    district?: string;
    state: string;
    country: string;
    latitude: number;
    longitude: number;
}

export interface LocationSuggestion {
    place_id: number | string;
    display_name: string;
    lat: string;
    lon: string;
    name?: string;
    type?: string;
    address?: {
        village?: string;
        town?: string;
        city?: string;
        county?: string;
        state_district?: string;
        district?: string;
        state?: string;
        country?: string;
        country_code?: string;
        [key: string]: any;
    };
    structured?: StructuredLocation;
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
    source?: 'ml' | 'agronomic';
    badge?: string;
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

export type IrrigationStatusCode =
    | 'IRRIGATE_NOW'
    | 'WAIT'
    | 'IRRIGATE_LATER'
    | 'REDUCE_IRRIGATION'
    | 'NO_IRRIGATION_REQUIRED'
    | 'HEAVY_RAIN_DELAY'
    | 'WATER_STRESS_DETECTED';

export interface IrrigationDecision {
    status_code: IrrigationStatusCode;
    status_label: string;
    priority: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
    title: string;
    reason: string;
    action_tip: string;
    method_guidance: string;
    factors: {
        temperature: number;
        humidity: number;
        rainfall_today: number;
        forecast_rain_mm: number;
        forecast_rain_prob: number;
        soil_moisture_estimate?: string;
        crop: string;
        crop_stage?: string;
    };
}

export interface FarmProfile {
    name?: string;
    mobile?: string;
    location: string;
    lat?: number;
    lon?: number;
    area_acres?: number;
    primary_crop?: string;
    crop_stage?: string;
    irrigation_method?: string;
    soil_type?: string;
    N?: number;
    P?: number;
    K?: number;
    ph?: number;
    moisture_pct?: number;
}

export interface FarmStatusOverview {
    status: 'OPTIMAL' | 'ATTENTION' | 'CRITICAL';
    health_score: number;
    headline: string;
    primary_reason: string;
    immediate_action: string;
}

