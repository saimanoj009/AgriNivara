import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Loader2, Search, X } from 'lucide-react';
import { searchLocationApi, reverseGeocodeLocationApi } from '../services/api';
import type { LocationSuggestion, StructuredLocation } from '../types/agriculture';

export interface LocationDetails {
    fullAddress: string;
    city: string;
    village?: string;
    district?: string;
    state?: string;
    country?: string;
    lat?: number;
    lon?: number;
    structured?: StructuredLocation;
}

interface UnifiedLocationSelectorProps {
    value: string;
    onChange: (value: string, details?: LocationDetails) => void;
    placeholder?: string;
    className?: string;
    showGeolocationButton?: boolean;
    inputId?: string;
}

export const UnifiedLocationSelector: React.FC<UnifiedLocationSelectorProps> = ({
    value,
    onChange,
    placeholder = 'Search farm village, city, or district (e.g. Guntur, Hyderabad)...',
    className = '',
    showGeolocationButton = true,
    inputId = 'location-search-input',
}) => {
    const [query, setQuery] = useState(value);
    const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isGeolocating, setIsGeolocating] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const dropdownRef = useRef<HTMLDivElement>(null);
    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        setQuery(value);
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setQuery(val);
        setErrorMsg(null);
        onChange(val);

        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        if (val.trim().length < 2) {
            setSuggestions([]);
            setIsOpen(false);
            return;
        }

        setIsSearching(true);
        debounceTimerRef.current = setTimeout(async () => {
            try {
                const results = await searchLocationApi(val);
                setSuggestions(results);
                setIsOpen(results.length > 0);
            } catch (err) {
                console.error('Location search error:', err);
                setSuggestions([]);
            } finally {
                setIsSearching(false);
            }
        }, 300);
    };

    const handleSelectSuggestion = (suggestion: LocationSuggestion) => {
        const structured = suggestion.structured;
        const lat = parseFloat(suggestion.lat);
        const lon = parseFloat(suggestion.lon);

        const details: LocationDetails = {
            fullAddress: suggestion.display_name,
            city: structured?.city || suggestion.name || suggestion.display_name.split(',')[0],
            village: structured?.village,
            district: structured?.district,
            state: structured?.state,
            country: structured?.country || 'India',
            lat,
            lon,
            structured,
        };

        const targetDisplayName = structured?.display_name || suggestion.display_name;
        setQuery(targetDisplayName);
        onChange(targetDisplayName, details);
        setIsOpen(false);
        setSuggestions([]);
    };

    const handleUseMyLocation = () => {
        if (!navigator.geolocation) {
            setErrorMsg('Geolocation is not supported by your browser.');
            return;
        }

        setIsGeolocating(true);
        setErrorMsg(null);

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const structured = await reverseGeocodeLocationApi(latitude, longitude);

                    const displayName = structured.display_name || `${structured.city}, ${structured.state}, India`;
                    const details: LocationDetails = {
                        fullAddress: displayName,
                        city: structured.city,
                        village: structured.village,
                        district: structured.district,
                        state: structured.state,
                        country: structured.country,
                        lat: latitude,
                        lon: longitude,
                        structured,
                    };

                    setQuery(displayName);
                    onChange(displayName, details);
                } catch {
                    const fallbackName = `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`;
                    setQuery(fallbackName);
                    onChange(fallbackName, {
                        fullAddress: fallbackName,
                        city: 'Current Location',
                        lat: latitude,
                        lon: longitude,
                    });
                } finally {
                    setIsGeolocating(false);
                }
            },
            () => {
                setErrorMsg('Location permission denied or GPS unavailable.');
                setIsGeolocating(false);
            },
            { timeout: 10000, enableHighAccuracy: true }
        );
    };

    const handleClear = () => {
        setQuery('');
        onChange('');
        setSuggestions([]);
        setIsOpen(false);
    };

    return (
        <div className={`relative w-full ${className}`} ref={dropdownRef}>
            <div className="relative flex items-center">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#00B884]">
                    <MapPin className="w-4 h-4" />
                </div>

                <input
                    id={inputId}
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    onFocus={() => {
                        if (suggestions.length > 0) setIsOpen(true);
                    }}
                    placeholder={placeholder}
                    className="w-full pl-11 pr-24 py-3 bg-[#0C241E] border border-white/10 focus:border-[#00B884] focus:ring-2 focus:ring-[#00B884]/20 rounded-xl text-[#F3EBDD] placeholder-[#738A7C] text-sm font-medium transition-all outline-none shadow-inner"
                />

                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                    {query && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="p-1.5 text-[#738A7C] hover:text-[#F3EBDD] rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                            title="Clear"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}

                    {showGeolocationButton && (
                        <button
                            type="button"
                            onClick={handleUseMyLocation}
                            disabled={isGeolocating}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-[#12362B] hover:bg-[#183F33] text-[#00B884] rounded-lg text-xs font-semibold border border-emerald-500/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
                            title="Use My Current Location"
                        >
                            {isGeolocating ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#00B884]" />
                            ) : (
                                <Navigation className="w-3.5 h-3.5 text-[#00B884]" />
                            )}
                            <span className="hidden sm:inline">GPS</span>
                        </button>
                    )}

                    {isSearching && <Loader2 className="w-4 h-4 text-[#00B884] animate-spin mr-1" />}
                </div>
            </div>

            {errorMsg && <p className="text-xs text-rose-400 mt-1 pl-1">{errorMsg}</p>}

            {/* Suggestions Dropdown */}
            {isOpen && suggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1.5 bg-[#102D25] border border-white/10 rounded-xl shadow-2xl shadow-black/80 overflow-hidden max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-3 py-2 bg-[#0C241E] border-b border-white/5 text-[11px] font-bold tracking-wider text-[#00B884] uppercase flex items-center gap-1.5">
                        <Search className="w-3 h-3" /> Select Location
                    </div>

                    {suggestions.map((item) => (
                        <button
                            key={item.place_id}
                            type="button"
                            onClick={() => handleSelectSuggestion(item)}
                            className="w-full text-left px-3.5 py-2.5 hover:bg-[#143B30] border-b border-white/5 last:border-0 transition-colors flex items-start gap-2.5 group cursor-pointer"
                        >
                            <MapPin className="w-4 h-4 text-[#00B884] shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                            <div className="overflow-hidden">
                                <p className="text-sm font-semibold text-[#F3EBDD] group-hover:text-[#00B884] truncate">
                                    {item.display_name.split(',')[0]}
                                </p>
                                <p className="text-xs text-[#A8B9AE] truncate mt-0.5">{item.display_name}</p>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
