import { CloudSun, Thermometer, Droplets, CloudRain, Wind } from 'lucide-react';
import type { Language, WeatherIntelligence } from '../types/agriculture';
import { t } from '../utils/translations';

interface WeatherIntelligenceSectionProps {
    weather: WeatherIntelligence;
    lang: Language;
}

export function WeatherIntelligenceSection({ weather, lang }: WeatherIntelligenceSectionProps) {
    return (
        <div className="bg-[#102D25] rounded-3xl p-6 sm:p-7 shadow-xl border border-white/10 mb-8 text-[#F3EBDD]">
            
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-[#00E5FF]/15 text-[#00E5FF] font-bold border border-[#00E5FF]/30">
                        <CloudSun className="w-5 h-5 text-[#00E5FF]" />
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-[#F3EBDD]">
                            {t('weatherIntelligence', lang)}
                        </h2>
                        <p className="text-xs text-[#A8B9AE] font-medium">
                            Live Open-Meteo satellite feed & 5-day agro-climatic forecast
                        </p>
                    </div>
                </div>

                <span className="self-start sm:self-center text-[11px] font-bold text-[#00E5FF] bg-[#00E5FF]/15 px-3 py-1 rounded-full border border-[#00E5FF]/30">
                    {t('liveDataTag', lang)}
                </span>
            </div>

            {/* CURRENT WEATHER CARDS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                
                {/* TEMP */}
                <div className="p-4 rounded-xl bg-[#0C241E] border border-white/5 text-[#F3EBDD]">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#D6A84F]">Current Temp</span>
                        <Thermometer className="w-4 h-4 text-[#D6A84F]" />
                    </div>
                    <div className="text-2xl font-black text-[#F3EBDD] mt-1">
                        {weather.temperature}°C
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#D6A84F]/20 text-[#D6A84F] mt-1 inline-block border border-[#D6A84F]/30">
                        LIVE SENSOR
                    </span>
                </div>

                {/* HUMIDITY */}
                <div className="p-4 rounded-xl bg-[#0C241E] border border-white/5 text-[#F3EBDD]">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#00E5FF]">Humidity</span>
                        <Droplets className="w-4 h-4 text-[#00E5FF]" />
                    </div>
                    <div className="text-2xl font-black text-[#F3EBDD] mt-1">
                        {weather.humidity}%
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#00E5FF]/20 text-[#00E5FF] mt-1 inline-block border border-[#00E5FF]/30">
                        LIVE SENSOR
                    </span>
                </div>

                {/* RAINFALL */}
                <div className="p-4 rounded-xl bg-[#0C241E] border border-white/5 text-[#F3EBDD]">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#38BDF8]">Precipitation</span>
                        <CloudRain className="w-4 h-4 text-[#38BDF8]" />
                    </div>
                    <div className="text-2xl font-black text-[#F3EBDD] mt-1">
                        {weather.rainfall} <span className="text-xs font-normal text-[#738A7C]">mm</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#38BDF8]/20 text-[#38BDF8] mt-1 inline-block border border-[#38BDF8]/30">
                        LIVE SENSOR
                    </span>
                </div>

                {/* WIND / CONDITION */}
                <div className="p-4 rounded-xl bg-[#0C241E] border border-white/5 text-[#F3EBDD]">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#00B884]">Condition</span>
                        <Wind className="w-4 h-4 text-[#00B884]" />
                    </div>
                    <div className="text-sm font-extrabold text-[#F3EBDD] mt-1 truncate">
                        {weather.condition}
                    </div>
                    <span className="text-[10px] text-[#A8B9AE] font-medium block mt-1">
                        Wind: {weather.windSpeed} km/h
                    </span>
                </div>

            </div>

            {/* 5-DAY FORECAST GRID */}
            <div>
                <h3 className="text-xs font-extrabold text-[#F3EBDD] uppercase tracking-wider mb-3 flex items-center justify-between">
                    <span>5-Day Agro-Climatic Forecast</span>
                    <span className="text-[10px] text-[#738A7C] font-normal">Updated via Open-Meteo API</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {weather.forecast.map((day, idx) => (
                        <div key={idx} className="p-3 rounded-xl border border-white/5 bg-[#0C241E] text-center space-y-1">
                            <span className="text-xs font-extrabold text-[#F3EBDD] block">{day.day}</span>
                            <span className="text-[10px] text-[#738A7C] block">{day.date}</span>
                            <div className="text-xs font-bold text-[#F3EBDD] py-1">
                                {day.tempMax}° / <span className="text-[#A8B9AE]">{day.tempMin}°C</span>
                            </div>
                            <div className="text-[10px] font-semibold text-[#00E5FF] bg-[#00E5FF]/10 py-0.5 rounded border border-[#00E5FF]/20">
                                Rain: {day.rainProb}% ({day.rainfallMm}mm)
                            </div>
                            <span className="text-[9px] text-[#A8B9AE] block truncate">{day.condition}</span>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}
