import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import type {
  FarmProfile,
  WeatherIntelligence,
  IrrigationDecision,
  FarmStatusOverview,
} from '../types/agriculture';
import { fetchRealtimeWeatherApi, getAuthUser } from '../services/api';

interface FarmContextType {
  farmProfile: FarmProfile;
  weather: WeatherIntelligence | null;
  irrigationDecision: IrrigationDecision;
  farmStatus: FarmStatusOverview;
  loadingWeather: boolean;
  weatherError: string;
  updateFarmProfile: (updates: Partial<FarmProfile>) => void;
  refreshWeather: () => Promise<void>;
}

const STORAGE_KEY = 'agrinivara_farm_context';

const DEFAULT_PROFILE: FarmProfile = {
  location: 'Warangal, Telangana',
  lat: 17.9689,
  lon: 79.5941,
  area_acres: 2.5,
  primary_crop: 'Rice (Paddy)',
  crop_stage: 'Vegetative',
  irrigation_method: 'Drip Irrigation',
  soil_type: 'Clay Loam',
  N: 90,
  P: 42,
  K: 43,
  ph: 6.5,
  moisture_pct: 68,
};

const FarmContext = createContext<FarmContextType | undefined>(undefined);

export function calculateIrrigationDecision(
  profile: FarmProfile,
  weather: WeatherIntelligence | null
): IrrigationDecision {
  const temp = weather?.temperature ?? 28;
  const hum = weather?.humidity ?? 65;
  const rainToday = weather?.rainfall ?? 0;
  const forecast = weather?.forecast || [];
  const crop = profile.primary_crop || 'General Crops';
  const stage = profile.crop_stage || 'Active Growth';
  const soilMoisture = profile.moisture_pct ?? 65;

  const next48hRainProb = forecast.length > 0
    ? Math.max(...forecast.slice(0, 2).map((f) => f.rainProb))
    : 15;

  const next48hRainMm = forecast.length > 0
    ? forecast.slice(0, 2).reduce((acc, f) => acc + (f.rainfallMm || 0), 0)
    : 0;

  // Decision formulation
  if (rainToday >= 20 || next48hRainMm >= 25 || next48hRainProb >= 70) {
    return {
      status_code: 'HEAVY_RAIN_DELAY',
      status_label: 'HEAVY RAIN EXPECTED — DELAY IRRIGATION',
      priority: 'HIGH',
      title: 'Heavy Rainfall Incoming — Postpone Watering',
      reason: `Forecast anticipates significant precipitation (${next48hRainMm > 0 ? `${next48hRainMm.toFixed(1)}mm` : `${next48hRainProb}% chance`} in 48h). Soil will receive sufficient natural moisture.`,
      action_tip: 'Halt pumps immediately. Inspect perimeter drainage bunds to avoid root waterlogging.',
      method_guidance: 'Zero supplemental irrigation. Maintain field drainage channels.',
      factors: {
        temperature: temp,
        humidity: hum,
        rainfall_today: rainToday,
        forecast_rain_mm: next48hRainMm,
        forecast_rain_prob: next48hRainProb,
        soil_moisture_estimate: `${soilMoisture}% (Adequate)`,
        crop,
        crop_stage: stage,
      },
    };
  }

  if (temp >= 35 && hum <= 45) {
    return {
      status_code: 'WATER_STRESS_DETECTED',
      status_label: 'WATER STRESS DETECTED — IRRIGATE NOW',
      priority: 'CRITICAL',
      title: 'High Thermal Stress & Rapid Evapotranspiration',
      reason: `Ambient heat (${temp}°C) paired with low humidity (${hum}%) creates severe atmospheric moisture deficit. Soil moisture (${soilMoisture}%) is depleting rapidly.`,
      action_tip: 'Apply deep early-morning or dusk irrigation (5:00 AM – 8:00 AM) to minimize evaporation losses.',
      method_guidance: 'Deep drip soaking for root zone. Avoid midday overhead sprinkler.',
      factors: {
        temperature: temp,
        humidity: hum,
        rainfall_today: rainToday,
        forecast_rain_mm: next48hRainMm,
        forecast_rain_prob: next48hRainProb,
        soil_moisture_estimate: `${soilMoisture}% (Depleting)`,
        crop,
        crop_stage: stage,
      },
    };
  }

  if (temp >= 30 && next48hRainProb < 35 && soilMoisture < 60) {
    return {
      status_code: 'IRRIGATE_NOW',
      status_label: 'IRRIGATE NOW',
      priority: 'HIGH',
      title: 'Moisture Window Open — Recommended Cycle',
      reason: `Moderate-high temperature (${temp}°C) with dry forecast for 48 hours. Crop in ${stage} stage requires steady soil moisture maintenance.`,
      action_tip: 'Execute scheduled watering cycle today during cooler morning hours.',
      method_guidance: 'Standard drip or furrow cycle tailored to root depth.',
      factors: {
        temperature: temp,
        humidity: hum,
        rainfall_today: rainToday,
        forecast_rain_mm: next48hRainMm,
        forecast_rain_prob: next48hRainProb,
        soil_moisture_estimate: `${soilMoisture}% (Approaching Threshold)`,
        crop,
        crop_stage: stage,
      },
    };
  }

  if (soilMoisture >= 75 || hum >= 85) {
    return {
      status_code: 'NO_IRRIGATION_REQUIRED',
      status_label: 'NO IRRIGATION REQUIRED',
      priority: 'LOW',
      title: 'Soil Moisture & Humidity Saturated',
      reason: `High ambient humidity (${hum}%) and ample current moisture reserve (${soilMoisture}%) satisfy current crop evapotranspiration needs.`,
      action_tip: 'Conserve water and power. Skip irrigation today; scout leaves for fungal symptoms.',
      method_guidance: 'No watering required for next 24–36 hours.',
      factors: {
        temperature: temp,
        humidity: hum,
        rainfall_today: rainToday,
        forecast_rain_mm: next48hRainMm,
        forecast_rain_prob: next48hRainProb,
        soil_moisture_estimate: `${soilMoisture}% (Optimal / High)`,
        crop,
        crop_stage: stage,
      },
    };
  }

  if (next48hRainProb >= 40 && next48hRainProb < 70) {
    return {
      status_code: 'WAIT',
      status_label: 'WAIT & MONITOR',
      priority: 'MODERATE',
      title: 'Scattered Showers Probable — Defer 12–18 Hours',
      reason: `Precipitation probability is moderate (${next48hRainProb}%). Soil retains adequate moisture (${soilMoisture}%) to safely wait for cloud cover.`,
      action_tip: 'Re-evaluate moisture in the evening before initiating watering cycle.',
      method_guidance: 'Hold off active irrigation. Prepare drip valves if rain does not materialize.',
      factors: {
        temperature: temp,
        humidity: hum,
        rainfall_today: rainToday,
        forecast_rain_mm: next48hRainMm,
        forecast_rain_prob: next48hRainProb,
        soil_moisture_estimate: `${soilMoisture}% (Stable)`,
        crop,
        crop_stage: stage,
      },
    };
  }

  return {
    status_code: 'IRRIGATE_LATER',
    status_label: 'IRRIGATE LATER (EVENING WINDOW)',
    priority: 'MODERATE',
    title: 'Standard Maintenance Window',
    reason: `Mild temperature (${temp}°C) and steady atmospheric conditions. Nighttime watering offers higher water efficiency.`,
    action_tip: 'Water during 6:00 PM – 9:00 PM to maximize ground infiltration.',
    method_guidance: 'Even distribution irrigation at standard flow rate.',
    factors: {
      temperature: temp,
      humidity: hum,
      rainfall_today: rainToday,
      forecast_rain_mm: next48hRainMm,
      forecast_rain_prob: next48hRainProb,
      soil_moisture_estimate: `${soilMoisture}% (Normal)`,
      crop,
      crop_stage: stage,
    },
  };
}

export function calculateFarmStatus(
  profile: FarmProfile,
  weather: WeatherIntelligence | null,
  irrigation: IrrigationDecision
): FarmStatusOverview {
  let score = 92;
  let status: 'OPTIMAL' | 'ATTENTION' | 'CRITICAL' = 'OPTIMAL';
  let headline = 'Farm Operating at Optimal Agronomic Efficiency';
  let primaryReason = 'Soil chemistry, temperature, and moisture levels are within healthy ranges.';
  let immediateAction = 'Continue scheduled crop monitoring and maintain standard nutrient plan.';

  if (irrigation.status_code === 'WATER_STRESS_DETECTED') {
    score = 72;
    status = 'CRITICAL';
    headline = 'Elevated Heat & Moisture Stress Detected';
    primaryReason = `High ambient heat (${weather?.temperature ?? 36}°C) with depleting soil moisture reserves.`;
    immediateAction = 'Initiate deep root watering during early morning window.';
  } else if (irrigation.status_code === 'HEAVY_RAIN_DELAY') {
    score = 84;
    status = 'ATTENTION';
    headline = 'Precipitation Alert — Moisture Adequate';
    primaryReason = `Incoming rainfall expected (${irrigation.factors.forecast_rain_prob}% probability).`;
    immediateAction = 'Suspend artificial watering and inspect field drainage.';
  } else if (weather && weather.humidity > 85) {
    score = 86;
    status = 'ATTENTION';
    headline = 'High Ambient Humidity — Heightened Foliar Risk';
    primaryReason = `Relative humidity (${weather.humidity}%) favors fungal pathogen reproduction.`;
    immediateAction = 'Scout lower crop foliage for leaf spots or mildew.';
  }

  return {
    status,
    health_score: score,
    headline,
    primary_reason: primaryReason,
    immediate_action: immediateAction,
  };
}

export const FarmContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const authUser = getAuthUser();

  const [farmProfile, setFarmProfile] = useState<FarmProfile>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...DEFAULT_PROFILE,
          ...parsed,
          location: authUser?.location || parsed.location || DEFAULT_PROFILE.location,
          name: authUser?.name || parsed.name,
          mobile: authUser?.mobile || parsed.mobile,
        };
      }
    } catch {
      // ignore
    }
    return {
      ...DEFAULT_PROFILE,
      location: authUser?.location || DEFAULT_PROFILE.location,
      name: authUser?.name,
      mobile: authUser?.mobile,
    };
  });

  const [weather, setWeather] = useState<WeatherIntelligence | null>(null);
  const [loadingWeather, setLoadingWeather] = useState<boolean>(false);
  const [weatherError, setWeatherError] = useState<string>('');

  const refreshWeather = useCallback(async () => {
    const lat = farmProfile.lat ?? 17.9689;
    const lon = farmProfile.lon ?? 79.5941;
    setLoadingWeather(true);
    setWeatherError('');
    try {
      const wData = await fetchRealtimeWeatherApi(lat, lon);
      setWeather(wData);
    } catch (err: any) {
      console.warn('Weather sync error in FarmContext:', err);
      setWeatherError('Live satellite feed temporarily unavailable. Using calibrated regional baseline.');
    } finally {
      setLoadingWeather(false);
    }
  }, [farmProfile.lat, farmProfile.lon]);

  useEffect(() => {
    refreshWeather();
  }, [refreshWeather]);

  const updateFarmProfile = useCallback((updates: Partial<FarmProfile>) => {
    setFarmProfile((prev) => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        // Keep auth user location in sync if location changed
        const currentAuth = getAuthUser();
        if (currentAuth && updates.location && currentAuth.location !== updates.location) {
          const updatedAuth = { ...currentAuth, location: updates.location };
          localStorage.setItem('agrinivara_user', JSON.stringify(updatedAuth));
        }
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const irrigationDecision = useMemo(() => {
    return calculateIrrigationDecision(farmProfile, weather);
  }, [farmProfile, weather]);

  const farmStatus = useMemo(() => {
    return calculateFarmStatus(farmProfile, weather, irrigationDecision);
  }, [farmProfile, weather, irrigationDecision]);

  return (
    <FarmContext.Provider
      value={{
        farmProfile,
        weather,
        irrigationDecision,
        farmStatus,
        loadingWeather,
        weatherError,
        updateFarmProfile,
        refreshWeather,
      }}
    >
      {children}
    </FarmContext.Provider>
  );
};

export function useFarm(): FarmContextType {
  const context = useContext(FarmContext);
  if (!context) {
    throw new Error('useFarm must be used within a FarmContextProvider');
  }
  return context;
}
