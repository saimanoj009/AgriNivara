import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  CloudSun,
  MapPin,
  Loader2,
  Droplets,
  Wind,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Calendar,
} from 'lucide-react';

import {
  fetchRealtimeWeatherApi,
  searchLocationApi,
} from '../services/api';

import { AgriLogo } from '../components/ui/AgriLogo';
import { GlassCard } from '../components/ui/GlassCard';
import { UnifiedLocationSelector } from '../components/UnifiedLocationSelector';
import { SmartIrrigationSection } from '../components/SmartIrrigationSection';

interface LocationResult {
  lat: string;
  lon: string;
  display_name: string;
  name?: string;
  type?: string;
}

export default function Weather() {
  const [q, setQ] = useState('');
  const [suggestions, setSuggestions] = useState<LocationResult[]>([]);
  const [weather, setWeather] = useState<any>(null);
  const [selectedLocation, setSelectedLocation] = useState('Hyderabad, Telangana');
  const [loading, setLoading] = useState(false);
  const [searchingLocations, setSearchingLocations] = useState(false);
  const [error, setError] = useState('');

  const suggestionRef = useRef<HTMLDivElement>(null);

  // Load default weather on mount
  useEffect(() => {
    loadWeather(17.385, 78.4867, 'Hyderabad, Telangana');
  }, []);

  // Location autocomplete
  useEffect(() => {
    const query = q.trim();
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchingLocations(true);
      try {
        const results = await searchLocationApi(query);
        setSuggestions(
          (results || []).slice(0, 5).map((item: any) => ({
            lat: String(item.lat),
            lon: String(item.lon),
            display_name: item.display_name,
            name: item.name,
            type: item.type,
          }))
        );
      } catch {
        setSuggestions([]);
      } finally {
        setSearchingLocations(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [q]);

  // Click outside to dismiss autocomplete
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionRef.current &&
        !suggestionRef.current.contains(event.target as Node)
      ) {
        setSuggestions([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadWeather = async (lat: number, lon: number, locationName: string) => {
    setLoading(true);
    setError('');
    setSuggestions([]);

    try {
      const result = await fetchRealtimeWeatherApi(lat, lon);
      setWeather(result);
      setSelectedLocation(locationName);
    } catch (err) {
      console.error(err);
      setWeather(null);
      setError('Unable to load live weather from satellite API. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectLocation = async (location: LocationResult) => {
    setQ(location.name || location.display_name.split(',')[0]);
    await loadWeather(
      Number(location.lat),
      Number(location.lon),
      location.display_name
    );
  };

  const handleManualSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = q.trim();
    if (query.length < 3) return;

    setLoading(true);
    setError('');
    try {
      const results = await searchLocationApi(query);
      if (results && results.length > 0) {
        await selectLocation(results[0]);
      } else {
        setError('Location not found. Please try another query.');
      }
    } catch {
      setError('Failed to search location.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#071C17] text-[#F3EBDD] pb-20 selection:bg-[#00B884] selection:text-[#071C17]">
      
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-[#0A211B]/90 backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0C241E] hover:bg-[#143B30] text-xs font-bold text-[#00B884] border border-white/10 transition"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
          <AgriLogo size="sm" variant="dark" />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-[#00B884]/15 text-[#00B884] border border-[#00B884]/30">
            Open-Meteo Satellite Feed
          </span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* TOP SEARCH & PRESETS BANNER */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#00B884]">
            Agro-Meteorological Engine
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-[#F3EBDD] tracking-tight">
            Hyperlocal Weather & Farm Advisories
          </h1>
          <p className="text-xs sm:text-sm text-[#A8B9AE]">
            Real-time atmospheric telemetry transformed into actionable agronomic decisions for irrigation, spraying, and harvest timing.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-[#102D25] border border-white/10 shadow-xl space-y-4">
          <div className="max-w-2xl mx-auto">
            <UnifiedLocationSelector
              value={selectedLocation}
              onChange={(val, details) => {
                setSelectedLocation(val);
                if (details?.lat && details?.lon) {
                  loadWeather(details.lat, details.lon, val);
                }
              }}
              placeholder="Search farm village, city, or district (e.g. Guntur, Warangal, Ludhiana)..."
              inputId="weather-location-input"
            />
          </div>

          {/* Quick Region Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 border-t border-white/10 text-xs">
            <span className="text-[#738A7C] text-[10px] font-bold uppercase mr-1">Popular Agricultural Hubs:</span>
            {[
              { label: 'Guntur, AP', lat: 16.3067, lon: 80.4365 },
              { label: 'Warangal, TS', lat: 17.9689, lon: 79.5941 },
              { label: 'Ludhiana, PB', lat: 30.9010, lon: 75.8573 },
              { label: 'Nashik, MH', lat: 19.9975, lon: 73.7898 },
            ].map((hub, idx) => (
              <button
                key={idx}
                onClick={() => loadWeather(hub.lat, hub.lon, hub.label)}
                className="px-3 py-1 rounded-lg bg-[#0C241E] hover:bg-[#143B30] text-[#F3EBDD] hover:text-[#00B884] border border-white/10 text-[11px] font-semibold transition cursor-pointer"
              >
                {hub.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* WEATHER DISPLAY DASHBOARD */}
        {weather && (
          <div className="space-y-6">
            
            {/* MAIN CURRENT WEATHER & DECISION HERO */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* CURRENT TELEMETRY CARD */}
              <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-[#102D25] border border-white/10 shadow-xl relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#00B884]">
                      Current Telemetry
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-[#F3EBDD] mt-1 truncate max-w-md">
                      {selectedLocation}
                    </h2>
                    <p className="text-xs text-[#A8B9AE] mt-0.5">{weather.condition}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-4xl sm:text-5xl font-black text-[#00B884]">
                      {weather.temperature}°C
                    </span>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-white/10">
                  <div className="p-3.5 rounded-2xl bg-[#0C241E] border border-white/5">
                    <div className="flex items-center gap-1.5 text-[#00E5FF] text-xs font-medium mb-1">
                      <Droplets className="w-4 h-4 text-[#00E5FF]" /> Humidity
                    </div>
                    <p className="text-lg font-black text-[#F3EBDD]">{weather.humidity}%</p>
                    <span className="text-[10px] text-[#738A7C]">Relative 2m</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#0C241E] border border-white/5">
                    <div className="flex items-center gap-1.5 text-[#38BDF8] text-xs font-medium mb-1">
                      <CloudSun className="w-4 h-4 text-[#38BDF8]" /> Rainfall
                    </div>
                    <p className="text-lg font-black text-[#F3EBDD]">{weather.rainfall} mm</p>
                    <span className="text-[10px] text-[#738A7C]">Past 24h</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#0C241E] border border-white/5">
                    <div className="flex items-center gap-1.5 text-[#D6A84F] text-xs font-medium mb-1">
                      <Wind className="w-4 h-4 text-[#D6A84F]" /> Wind Speed
                    </div>
                    <p className="text-lg font-black text-[#F3EBDD]">{weather.windSpeed} km/h</p>
                    <span className="text-[10px] text-[#738A7C]">Surface flow</span>
                  </div>
                </div>
              </div>

              {/* AGRICULTURAL DECISION TRANSLATION CARD */}
              <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-[#102D25] border border-white/10 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 pb-4 border-b border-white/10">
                    <Sparkles className="w-4 h-4 text-[#00B884]" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#F3EBDD]">
                      Agricultural Decision Translation
                    </h3>
                  </div>

                  <div className="mt-5 space-y-4">
                    <div className="p-4 rounded-2xl bg-[#0C241E] border border-[#00B884]/30">
                      <span className="text-[10px] font-bold uppercase text-[#00B884] tracking-wider block">
                        Primary Agro-Advisory:
                      </span>
                      <p className="text-sm font-bold text-[#F3EBDD] mt-1 leading-snug">
                        {weather.risk}
                      </p>
                    </div>

                    <div className="space-y-2 text-xs text-[#A8B9AE]">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#00B884] shrink-0 mt-0.5" />
                        <span>
                          {weather.rainfall > 10
                            ? 'Delay irrigation by 24h to avoid waterlogging and nutrient loss.'
                            : 'Optimal conditions for drip or surface irrigation schedule.'}
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#00B884] shrink-0 mt-0.5" />
                        <span>
                          {weather.humidity > 80
                            ? 'High humidity warning: monitor leaves for fungal spore development.'
                            : 'Low fungal risk profile: ideal window for foliar nutrient spraying.'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/10 text-[10px] font-bold text-[#738A7C] uppercase flex items-center justify-between">
                  <span>AI Crop Protection Protocol</span>
                  <span className="text-[#00B884] font-extrabold">Active</span>
                </div>
              </div>
            </div>

            {/* SMART IRRIGATION RECOMMENDATION LAYER */}
            <SmartIrrigationSection weather={weather} />

            {/* 5-DAY AGRO-METEOROLOGICAL FORECAST */}
            {weather.forecast && weather.forecast.length > 0 && (
              <div className="p-6 rounded-3xl bg-[#102D25] border border-white/10 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#00B884]" />
                    <h3 className="text-sm font-bold text-[#F3EBDD] uppercase tracking-wider">
                      5-Day Agro-Meteorological Forecast
                    </h3>
                  </div>
                  <span className="text-xs text-[#738A7C]">Hourly synoptic model</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {weather.forecast.map((day: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-[#0C241E] border border-white/5 text-center space-y-2 hover:border-[#00B884]/30 transition"
                    >
                      <span className="text-xs font-bold text-[#00B884] block">{day.day}</span>
                      <span className="text-[10px] text-[#738A7C] block font-medium">{day.date}</span>
                      
                      <div className="py-2">
                        <span className="text-xl font-extrabold text-[#F3EBDD]">{day.tempMax}°</span>
                        <span className="text-xs text-[#738A7C] ml-1">/ {day.tempMin}°</span>
                      </div>

                      <div className="p-1.5 rounded-lg bg-[#00B884]/15 text-[10px] font-bold text-[#00B884] flex items-center justify-center gap-1 border border-[#00B884]/30">
                        <Droplets className="w-3 h-3 text-[#00B884]" />
                        <span>{day.rainProb}% Rain</span>
                      </div>

                      <p className="text-[10px] text-[#A8B9AE] truncate">{day.condition}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

      </main>
    </div>
  );
}