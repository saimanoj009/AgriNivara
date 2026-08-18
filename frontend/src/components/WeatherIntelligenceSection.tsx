import { CloudSun, Thermometer, Droplets, CloudRain, Wind } from 'lucide-react';
import type { Language, WeatherIntelligence } from '../types/agriculture';
import { t } from '../utils/translations';

interface WeatherIntelligenceSectionProps {
    weather: WeatherIntelligence;
    lang: Language;
}

export function WeatherIntelligenceSection({ weather, lang }: WeatherIntelligenceSectionProps) {
    return (
        <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200 mb-8">
            
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-sky-100 text-sky-800 font-bold">
                        <CloudSun className="w-5 h-5 text-sky-700" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">
                            {t('weatherIntelligence', lang)}
                        </h2>
                        <p className="text-xs text-slate-500 font-medium">
                            Live Open-Meteo satellite feed & 5-day agro-climatic forecast
                        </p>
                    </div>
                </div>

                <span className="self-start sm:self-center text-[11px] font-bold text-sky-800 bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
                    {t('liveDataTag', lang)}
                </span>
            </div>

            {/* CURRENT WEATHER CARDS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                
                {/* TEMP */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/80 text-amber-950">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Current Temp</span>
                        <Thermometer className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="text-2xl font-black text-slate-900 mt-1">
                        {weather.temperature}°C
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-200 text-amber-900 mt-1 inline-block">
                        CURRENT
                    </span>
                </div>

                {/* HUMIDITY */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-200/80 text-sky-950">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800">Humidity</span>
                        <Droplets className="w-4 h-4 text-sky-600" />
                    </div>
                    <div className="text-2xl font-black text-slate-900 mt-1">
                        {weather.humidity}%
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-200 text-sky-900 mt-1 inline-block">
                        CURRENT
                    </span>
                </div>

                {/* RAINFALL */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/80 text-blue-950">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800">Precipitation</span>
                        <CloudRain className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="text-2xl font-black text-slate-900 mt-1">
                        {weather.rainfall} <span className="text-xs font-normal">mm</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-200 text-blue-900 mt-1 inline-block">
                        CURRENT
                    </span>
                </div>

                {/* WIND / CONDITION */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-200/80 text-teal-950">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800">Condition</span>
                        <Wind className="w-4 h-4 text-teal-600" />
                    </div>
                    <div className="text-sm font-extrabold text-slate-900 mt-1 truncate">
                        {weather.condition}
                    </div>
                    <span className="text-[10px] text-teal-800 font-medium block mt-1">
                        Wind: {weather.windSpeed} km/h
                    </span>
                </div>

            </div>

            {/* 5-DAY FORECAST GRID */}
            <div>
                <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-3 flex items-center justify-between">
                    <span>5-Day Agro-Climatic Forecast</span>
                    <span className="text-[10px] text-slate-400 font-normal">Updated via Open-Meteo API</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {weather.forecast.map((day, idx) => (
                        <div key={idx} className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-center space-y-1">
                            <span className="text-xs font-extrabold text-slate-800 block">{day.day}</span>
                            <span className="text-[10px] text-slate-400 block">{day.date}</span>
                            <div className="text-xs font-bold text-slate-900 py-1">
                                {day.tempMax}° / <span className="text-slate-500">{day.tempMin}°C</span>
                            </div>
                            <div className="text-[10px] font-semibold text-blue-700 bg-blue-50 py-0.5 rounded border border-blue-100">
                                Rain: {day.rainProb}% ({day.rainfallMm}mm)
                            </div>
                            <span className="text-[9px] text-slate-500 block truncate">{day.condition}</span>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}
