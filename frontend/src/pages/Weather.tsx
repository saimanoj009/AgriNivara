import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  CloudSun,
  MapPin,
  Search,
  Loader2,
  Droplets,
  Wind,
  ThermometerSun,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Calendar,
  Layers,
  ChevronRight,
  Info,
} from 'lucide-react';
import {
  fetchRealtimeWeatherApi,
  searchLocationApi,
} from '../services/api';
import { AgriLogo } from '../components/ui/AgriLogo';
import { GlassCard } from '../components/ui/GlassCard';

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
            Open-Meteo Satellite Feed
          </span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* TOP SEARCH & PRESETS BANNER */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-emerald-400">
            Agro-Meteorological Engine
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Hyperlocal Weather & Farm Advisories
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time atmospheric telemetry transformed into actionable agronomic decisions for irrigation, spraying, and harvest timing.
          </p>
        </div>

        {/* SEARCH BAR & DISTRICT PRESETS */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
          <form onSubmit={handleManualSearch} className="relative max-w-2xl mx-auto" ref={suggestionRef}>
            <div className="relative flex items-center">
              <MapPin className="w-5 h-5 text-emerald-400 absolute left-4" />
              <input
                type="text"
                placeholder="Search farm village, mandal, or district (e.g. Warangal, Guntur, Ludhiana)..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="w-full pl-12 pr-28 py-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-sm font-bold text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={loading}
                className="absolute right-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Fetch Weather'}
              </button>
            </div>

            {/* Suggestions Dropdown */}
            {suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-30 mt-2 bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 overflow-hidden max-h-56 overflow-y-auto">
                {suggestions.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => selectLocation(item)}
                    className="w-full text-left px-4 py-3 text-xs hover:bg-emerald-950/70 text-slate-200 font-medium truncate border-b border-slate-800/60 last:border-0 cursor-pointer flex items-center gap-2"
                  >
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{item.display_name}</span>
                  </button>
                ))}
              </div>
            )}
          </form>

          {/* Quick Region Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 border-t border-slate-800/80 text-xs">
            <span className="text-slate-500 text-[10px] font-extrabold uppercase mr-1">Popular Agricultural Hubs:</span>
            {[
              { label: 'Guntur, AP', lat: 16.3067, lon: 80.4365 },
              { label: 'Warangal, TS', lat: 17.9689, lon: 79.5941 },
              { label: 'Ludhiana, PB', lat: 30.9010, lon: 75.8573 },
              { label: 'Nashik, MH', lat: 19.9975, lon: 73.7898 },
            ].map((hub, idx) => (
              <button
                key={idx}
                onClick={() => loadWeather(hub.lat, hub.lon, hub.label)}
                className="px-3 py-1 rounded-lg bg-slate-950 hover:bg-slate-850 text-slate-300 hover:text-emerald-400 border border-slate-800 text-[11px] font-bold transition"
              >
                {hub.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-800 text-xs text-rose-300 flex items-center gap-2">
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
              <GlassCard variant="emerald" className="lg:col-span-7 p-6 sm:p-8 relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                      Current Telemetry
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-white mt-1 truncate max-w-md">
                      {selectedLocation}
                    </h2>
                    <p className="text-xs text-slate-300 mt-0.5">{weather.condition}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-4xl sm:text-5xl font-black text-white">
                      {weather.temperature}°C
                    </span>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-800">
                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                    <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold mb-1">
                      <Droplets className="w-4 h-4 text-teal-400" /> Humidity
                    </div>
                    <p className="text-lg font-black text-white">{weather.humidity}%</p>
                    <span className="text-[10px] text-slate-400">Relative 2m</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                    <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold mb-1">
                      <CloudSun className="w-4 h-4 text-emerald-400" /> Rainfall
                    </div>
                    <p className="text-lg font-black text-white">{weather.rainfall} mm</p>
                    <span className="text-[10px] text-slate-400">Past 24h</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                    <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold mb-1">
                      <Wind className="w-4 h-4 text-amber-400" /> Wind Speed
                    </div>
                    <p className="text-lg font-black text-white">{weather.windSpeed} km/h</p>
                    <span className="text-[10px] text-slate-400">Surface flow</span>
                  </div>
                </div>
              </GlassCard>

              {/* AGRICULTURAL DECISION TRANSLATION CARD */}
              <GlassCard variant="dark" className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 pb-4 border-b border-slate-800">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-white">
                      Agricultural Decision Translation
                    </h3>
                  </div>

                  <div className="mt-5 space-y-4">
                    <div className="p-4 rounded-2xl bg-emerald-950/50 border border-emerald-500/30">
                      <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider block">
                        Primary Agro-Advisory:
                      </span>
                      <p className="text-sm font-bold text-white mt-1 leading-snug">
                        {weather.risk}
                      </p>
                    </div>

                    <div className="space-y-2 text-xs text-slate-300">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>
                          {weather.rainfall > 10
                            ? 'Delay irrigation by 24h to avoid waterlogging and nutrient loss.'
                            : 'Optimal conditions for drip or surface irrigation schedule.'}
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>
                          {weather.humidity > 80
                            ? 'High humidity warning: monitor leaves for fungal spore development.'
                            : 'Low fungal risk profile: ideal window for foliar nutrient spraying.'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-800 text-[10px] font-extrabold text-slate-500 uppercase flex items-center justify-between">
                  <span>AI Crop Protection Protocol</span>
                  <span className="text-emerald-400">Active</span>
                </div>
              </GlassCard>

            </div>

            {/* 5-DAY AGRO-METEOROLOGICAL FORECAST */}
            {weather.forecast && weather.forecast.length > 0 && (
              <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">
                      5-Day Agro-Meteorological Forecast
                    </h3>
                  </div>
                  <span className="text-xs text-slate-500">Hourly synoptic model</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {weather.forecast.map((day: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2"
                    >
                      <span className="text-xs font-black text-emerald-400 block">{day.day}</span>
                      <span className="text-[10px] text-slate-500 block font-bold">{day.date}</span>
                      
                      <div className="py-2">
                        <span className="text-xl font-black text-white">{day.tempMax}°</span>
                        <span className="text-xs text-slate-400 ml-1">/ {day.tempMin}°</span>
                      </div>

                      <div className="p-1.5 rounded-lg bg-slate-900 text-[10px] font-bold text-teal-300 flex items-center justify-center gap-1">
                        <Droplets className="w-3 h-3 text-teal-400" />
                        <span>{day.rainProb}% Rain</span>
                      </div>

                      <p className="text-[10px] text-slate-400 truncate">{day.condition}</p>
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