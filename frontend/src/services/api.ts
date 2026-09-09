import type {
    CropPredictionResponse,
    FarmAnalysisResponse,
    FarmInputs,
    IrrigationDecision,
    LocationSuggestion,
    SIHJudgeSpecs,
    WeatherIntelligence,
    WhatIfResponse
} from '../types/agriculture';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export async function predictCropApi(inputs: FarmInputs): Promise<CropPredictionResponse> {
    const response = await fetch(`${API_BASE_URL}/predict-crop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            N: inputs.N,
            P: inputs.P,
            K: inputs.K,
            temperature: inputs.temperature,
            humidity: inputs.humidity,
            ph: inputs.ph,
            rainfall: inputs.rainfall
        })
    });

    if (!response.ok) {
        throw new Error(`Crop prediction failed with status ${response.status}`);
    }

    return response.json();
}

export async function getFarmAnalysisApi(inputs: FarmInputs, selectedCrop?: string): Promise<FarmAnalysisResponse> {
    const response = await fetch(`${API_BASE_URL}/farm-analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            N: inputs.N,
            P: inputs.P,
            K: inputs.K,
            temperature: inputs.temperature,
            humidity: inputs.humidity,
            ph: inputs.ph,
            rainfall: inputs.rainfall,
            selected_crop: selectedCrop
        })
    });

    if (!response.ok) {
        throw new Error(`Farm analysis failed with status ${response.status}`);
    }

    return response.json();
}

export async function simulateWhatIfApi(current: FarmInputs, changed: FarmInputs): Promise<WhatIfResponse> {
    const response = await fetch(`${API_BASE_URL}/what-if`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            current: {
                N: current.N, P: current.P, K: current.K,
                temperature: current.temperature, humidity: current.humidity,
                ph: current.ph, rainfall: current.rainfall
            },
            changed: {
                N: changed.N, P: changed.P, K: changed.K,
                temperature: changed.temperature, humidity: changed.humidity,
                ph: changed.ph, rainfall: changed.rainfall
            }
        })
    });

    if (!response.ok) {
        throw new Error(`What-If simulation failed with status ${response.status}`);
    }

    return response.json();
}

export async function fetchIrrigationDecisionApi(payload: {
    temperature: number;
    humidity: number;
    rainfall_today?: number;
    rainfall_forecast_48h?: number;
    rain_prob_48h?: number;
    soil_moisture?: number;
    crop_type?: string;
    crop_stage?: string;
    irrigation_method?: string;
    location?: string;
}): Promise<IrrigationDecision> {
    const response = await fetch(`${API_BASE_URL}/irrigation/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error(`Irrigation decision fetch failed with status ${response.status}`);
    }

    return response.json();
}

export async function getDiseaseModelHealthApi(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/health`, { cache: 'no-store' });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data?.detail || `Health check failed with status ${response.status}`);
    return data;
}

export async function predictDiseaseApi(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/predict-disease`, {
        method: 'POST',
        body: formData
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        const detail = typeof data?.detail === 'string'
            ? data.detail
            : data?.detail?.message || data?.message;
        throw new Error(detail || `Disease prediction failed with status ${response.status}`);
    }
    return data;
}

export async function fetchTechnicalDetailsApi(): Promise<SIHJudgeSpecs> {
    const response = await fetch(`${API_BASE_URL}/technical-details`);
    if (!response.ok) {
        throw new Error('Failed to fetch technical specs');
    }
    return response.json();
}

export async function searchLocationApi(query: string): Promise<LocationSuggestion[]> {
    if (!query || query.length < 3) return [];
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`;
    const response = await fetch(url, {
        headers: { 'User-Agent': 'AgriNivara-SIH-App' }
    });
    if (!response.ok) return [];
    return response.json();
}

export async function fetchRealtimeWeatherApi(lat: number, lon: number): Promise<WeatherIntelligence> {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=relative_humidity_2m,rain&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum&timezone=auto`;
    
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Open-Meteo weather fetch failed');
    }

    const data = await response.json();
    const current = data.current_weather || {};
    const daily = data.daily || {};

    const humidityList = data.hourly?.relative_humidity_2m || [];
    const avgHumidity = humidityList.length > 0 ? Math.round(humidityList.slice(0, 24).reduce((a: number, b: number) => a + b, 0) / 24) : 65;

    const rainList = data.hourly?.rain || [];
    const todayRain = rainList.length > 0 ? Math.round(rainList.slice(0, 24).reduce((a: number, b: number) => a + b, 0) * 10) / 10 : 0;

    const weatherCode = current.weathercode || 0;
    const condition = getWeatherConditionLabel(weatherCode);

    let risk = "Optimal growth weather";
    if (current.temperature > 38) risk = "Extreme heat stress warning";
    else if (todayRain > 50) risk = "Heavy precipitation / flooding warning";
    else if (avgHumidity > 85) risk = "High humidity fungal disease risk";

    const forecastDays = (daily.time || []).slice(0, 5).map((timeStr: string, idx: number) => {
        const dateObj = new Date(timeStr);
        const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
        return {
            day: dayName,
            date: timeStr,
            tempMax: Math.round(daily.temperature_2m_max?.[idx] || 30),
            tempMin: Math.round(daily.temperature_2m_min?.[idx] || 20),
            rainProb: Math.round(daily.precipitation_probability_max?.[idx] || 0),
            rainfallMm: Math.round((daily.precipitation_sum?.[idx] || 0) * 10) / 10,
            condition: getWeatherConditionLabel(daily.weathercode?.[idx] || 0)
        };
    });

    return {
        temperature: Math.round(current.temperature || 25),
        humidity: avgHumidity,
        rainfall: todayRain,
        condition,
        windSpeed: Math.round(current.windspeed || 10),
        risk,
        forecast: forecastDays,
        isLoaded: true
    };
}

function getWeatherConditionLabel(code: number): string {
    if (code === 0) return "Clear Sky";
    if (code >= 1 && code <= 3) return "Partly Cloudy";
    if (code >= 45 && code <= 48) return "Foggy / Mist";
    if (code >= 51 && code <= 67) return "Drizzle / Light Rain";
    if (code >= 71 && code <= 77) return "Snow";
    if (code >= 80 && code <= 82) return "Showers / Heavy Rain";
    if (code >= 95) return "Thunderstorm";
    return "Partly Sunny";
}


// ============================================================
// AUTHENTICATION
// ============================================================

export interface AuthUser {
    id: string | number;
    name: string;
    mobile: string;
    location?: string;
}

export interface AuthResponse {
    success: boolean;
    token: string;
    role: 'user' | 'admin';
    user: AuthUser;
}

const AUTH_TOKEN_KEY = 'agrinivara_token';
const AUTH_USER_KEY = 'agrinivara_user';
const AUTH_ROLE_KEY = 'agrinivara_role';

export async function loginApi(identifier: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data.detail || 'Invalid username/mobile number or password.');
    }
    return data;
}

export async function signupApi(
    name: string,
    mobile: string,
    location: string,
    password: string
): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, mobile, location, password })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data.detail || 'Unable to create account.');
    }
    return data;
}

export function saveAuthSession(auth: AuthResponse): void {
    localStorage.setItem(AUTH_TOKEN_KEY, auth.token);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(auth.user));
    localStorage.setItem(AUTH_ROLE_KEY, auth.role);
}

export function getAuthToken(): string | null {
    return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function getAuthRole(): 'user' | 'admin' | null {
    const role = localStorage.getItem(AUTH_ROLE_KEY);
    if (!role) return null;
    const lower = role.toLowerCase();
    if (lower === 'admin') return 'admin';
    if (lower === 'user' || lower === 'farmer') return 'user';
    return null;
}

export function getAuthUser(): AuthUser | null {
    try {
        const value = localStorage.getItem(AUTH_USER_KEY);
        return value ? JSON.parse(value) : null;
    } catch {
        return null;
    }
}

export function logout(): void {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(AUTH_ROLE_KEY);
}

export function isAuthenticated(): boolean {
    return Boolean(getAuthToken() && getAuthRole());
}

export async function fetchAdminStatsApi(): Promise<any> {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/admin/stats`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.detail || 'Unable to load admin statistics.');
    return data;
}


export async function fetchAlertsApi(): Promise<any[]> {
    const token = getAuthToken();
    const r = await fetch(`${API_BASE_URL}/alerts`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(d.detail || 'Unable to load alerts.');
    return d.alerts || [];
}

export async function markAlertReadApi(id: number): Promise<void> {
    const token = getAuthToken();
    await fetch(`${API_BASE_URL}/alerts/${id}/read`, { method: 'POST', headers: token ? { Authorization: `Bearer ${token}` } : {} });
}

export async function createHelpRequestApi(message: string, image?: File): Promise<any> {
    const token = getAuthToken();
    const form = new FormData(); form.append('message', message); if (image) form.append('image', image);
    const r = await fetch(`${API_BASE_URL}/farmer/help`, { method: 'POST', headers: token ? { Authorization: `Bearer ${token}` } : {}, body: form });
    const d = await r.json().catch(() => ({})); if (!r.ok) throw new Error(d.detail || 'Unable to send help request.'); return d;
}

export async function fetchHelpRequestsApi(): Promise<any[]> {
    const token = getAuthToken(); const r = await fetch(`${API_BASE_URL}/farmer/help`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
    const d = await r.json().catch(() => ({})); if (!r.ok) throw new Error(d.detail || 'Unable to load help requests.'); return d.requests || [];
}

export async function updateHelpRequestApi(id: number, status: string, adminReply: string): Promise<void> {
    const token = getAuthToken(); const q = new URLSearchParams({ status, admin_reply: adminReply });
    const r = await fetch(`${API_BASE_URL}/admin/help/${id}?${q}`, { method: 'PATCH', headers: token ? { Authorization: `Bearer ${token}` } : {} });
    const d = await r.json().catch(() => ({})); if (!r.ok) throw new Error(d.detail || 'Unable to update request.');
}

export async function fetchFarmersApi(): Promise<any[]> {
    const token = getAuthToken(); const r = await fetch(`${API_BASE_URL}/admin/farmers`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
    const d = await r.json().catch(() => ({})); if (!r.ok) throw new Error(d.detail || 'Unable to load farmers.'); return d.farmers || [];
}

export async function sendAdminAlertApi(title: string, message: string, userId: string, image?: File): Promise<void> {
    const token = getAuthToken(); const form = new FormData(); form.append('title', title); form.append('message', message); form.append('user_id', userId); if (image) form.append('image', image);
    const r = await fetch(`${API_BASE_URL}/admin/alerts`, { method: 'POST', headers: token ? { Authorization: `Bearer ${token}` } : {}, body: form });
    const d = await r.json().catch(() => ({})); if (!r.ok) throw new Error(d.detail || 'Unable to send alert.');
}

// PRODUCE MANAGEMENT & WORKFLOW API
export async function submitProduceApi(data: {
    crop_name: string;
    quantity: number;
    unit: string;
    harvest_date: string;
    quality_grade: string;
    moisture_pct?: number;
    storage_condition: string;
    location: string;
    expected_price: number;
    notes?: string;
    image?: File;
}): Promise<any> {
    const token = getAuthToken();
    const form = new FormData();
    form.append('crop_name', data.crop_name);
    form.append('quantity', String(data.quantity));
    form.append('unit', data.unit);
    form.append('harvest_date', data.harvest_date);
    form.append('quality_grade', data.quality_grade);
    if (data.moisture_pct !== undefined) form.append('moisture_pct', String(data.moisture_pct));
    form.append('storage_condition', data.storage_condition);
    form.append('location', data.location);
    form.append('expected_price', String(data.expected_price));
    if (data.notes) form.append('notes', data.notes);
    if (data.image) form.append('image', data.image);

    const r = await fetch(`${API_BASE_URL}/produce`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(d.detail || 'Failed to submit produce for sale.');
    return d;
}

export async function fetchMyProduceApi(): Promise<any[]> {
    const token = getAuthToken();
    const r = await fetch(`${API_BASE_URL}/produce/my`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(d.detail || 'Unable to load produce listings.');
    return d.produce || [];
}

export async function fetchAdminProduceApi(): Promise<any[]> {
    const token = getAuthToken();
    const r = await fetch(`${API_BASE_URL}/admin/produce`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(d.detail || 'Unable to load produce listings for admin.');
    return d.produce || [];
}

export async function updateProduceStatusApi(produceId: number, status: string, adminNotes?: string): Promise<void> {
    const token = getAuthToken();
    const form = new FormData();
    form.append('status', status);
    if (adminNotes) form.append('admin_notes', adminNotes);

    const r = await fetch(`${API_BASE_URL}/admin/produce/${produceId}/status`, {
        method: 'PATCH',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(d.detail || 'Unable to update produce status.');
}


export async function resetFarmerPasswordApi(userId: number, newPassword: string): Promise<{ success: boolean; message: string }> {
    const token = getAuthToken();
    const r = await fetch(`${API_BASE_URL}/admin/farmers/${userId}/reset-password`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ new_password: newPassword }),
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(d.detail || 'Failed to reset farmer password.');
    return d;
}

// ============================================================
// AI CHAT — ASK AGRINIVARA
// ============================================================

export interface ChatContext {
    location?: string;
    crop?: string;
    temperature?: number;
    disease?: string;
}

export async function askAgriNivaraApi(
    question: string,
    lang: 'en' | 'te' | 'hi',
    context?: ChatContext
): Promise<{ answer: string; source: string }> {
    const token = getAuthToken();
    const r = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
            question,
            lang,
            context: context || {},
        }),
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(d.detail || 'Unable to get AI response.');
    return { answer: d.answer, source: d.source };
}

// ============================================================
// IOT TELEMETRY & SENSORS
// ============================================================

export async function fetchSensorTelemetryApi(deviceId?: string): Promise<{
    success: boolean;
    connected: boolean;
    count: number;
    status: string;
    message: string;
    readings: Array<{
        id: number;
        device_id: string;
        sensor_type: string;
        value: number;
        unit: string;
        status: string;
        created_at: string;
    }>;
}> {
    const token = getAuthToken();
    const url = deviceId
        ? `${API_BASE_URL}/api/iot/sensors?device_id=${encodeURIComponent(deviceId)}`
        : `${API_BASE_URL}/api/iot/sensors`;

    const r = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(d.detail || 'Failed to fetch sensor telemetry.');
    return d;
}

// ============================================================
// SATELLITE GEOSPATIAL INDICES
// ============================================================

export async function fetchSatelliteIndicesApi(
    lat: number = 17.9689,
    lon: number = 79.5941,
    crop: string = 'Rice'
): Promise<any> {
    const r = await fetch(
        `${API_BASE_URL}/api/satellite/indices?lat=${lat}&lon=${lon}&crop=${encodeURIComponent(crop)}`
    );
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(d.detail || 'Failed to retrieve satellite data.');
    return d;
}

// ============================================================
// ECONOMIC ROI CALCULATOR
// ============================================================

export async function calculateFarmEconomicRoiApi(params: {
    crop: string;
    area_acres: number;
    expected_yield_qtl_per_acre?: number;
    market_price_per_qtl?: number;
    input_cost_per_acre?: number;
    irrigation_method?: string;
}): Promise<any> {
    const r = await fetch(`${API_BASE_URL}/api/economic/roi`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(d.detail || 'Unable to calculate ROI.');
    return d;
}

// ============================================================
// PERSISTENT FARM PROFILE SYNC
// ============================================================

export async function syncFarmProfileApi(profile: any): Promise<{ success: boolean; message: string }> {
    const token = getAuthToken();
    if (!token) return { success: false, message: 'Not logged in' };
    const r = await fetch(`${API_BASE_URL}/api/farm/profile`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profile),
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(d.detail || 'Failed to sync farm profile.');
    return d;
}

export async function getPersistedFarmProfileApi(): Promise<{ success: boolean; profile: any }> {
    const token = getAuthToken();
    if (!token) return { success: false, profile: null };
    const r = await fetch(`${API_BASE_URL}/api/farm/profile`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) return { success: false, profile: null };
    return d;
}

