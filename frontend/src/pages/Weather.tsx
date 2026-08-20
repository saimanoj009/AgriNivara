import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    fetchRealtimeWeatherApi,
    searchLocationApi
} from '../services/api';

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
    const [selectedLocation, setSelectedLocation] = useState('');
    const [loading, setLoading] = useState(false);
    const [searchingLocations, setSearchingLocations] = useState(false);
    const [error, setError] = useState('');

    const suggestionRef = useRef<HTMLDivElement>(null);

    // ------------------------------------------------------------
    // LOCATION AUTOCOMPLETE
    // ------------------------------------------------------------
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
                        type: item.type
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

    // Close suggestions when clicking outside
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

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // ------------------------------------------------------------
    // FETCH WEATHER
    // ------------------------------------------------------------
    const loadWeather = async (
        lat: number,
        lon: number,
        locationName: string
    ) => {
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
            setError(
                'Unable to load live weather. Please check your internet connection and try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    // ------------------------------------------------------------
    // SELECT LOCATION
    // ------------------------------------------------------------
    const selectLocation = async (location: LocationResult) => {
        setQ(location.name || location.display_name.split(',')[0]);

        await loadWeather(
            Number(location.lat),
            Number(location.lon),
            location.display_name
        );
    };

    // ------------------------------------------------------------
    // MANUAL SEARCH
    // ------------------------------------------------------------
    const search = async () => {
        const query = q.trim();

        if (query.length < 3) {
            setError('Please enter at least 3 characters.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const results = await searchLocationApi(query);

            if (!results || results.length === 0) {
                setWeather(null);
                setError('Location not found. Try another village, town or district.');
                return;
            }

            const location = results[0];

            setSuggestions([]);

            await loadWeather(
                Number(location.lat),
                Number(location.lon),
                location.display_name
            );
        } catch (err) {
            console.error(err);
            setWeather(null);
            setError('Unable to find this location.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-5 lg:p-10">
            <div className="max-w-5xl mx-auto">

                <Link
                    to="/dashboard"
                    className="text-green-700 font-bold hover:underline"
                >
                    ← Dashboard
                </Link>

                <h1 className="text-3xl font-black mt-6">
                    Live Weather Intelligence
                </h1>

                <p className="text-slate-500 mt-2">
                    Search your farm location to retrieve current conditions
                    and a five-day forecast.
                </p>

                {/* SEARCH */}
                <div className="mt-6 relative" ref={suggestionRef}>
                    <div className="flex gap-2">
                        <input
                            value={q}
                            onChange={(e) => {
                                setQ(e.target.value);
                                setError('');
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    search();
                                }
                            }}
                            placeholder="Enter village, town or district"
                            className="flex-1 border border-slate-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-green-500"
                        />

                        <button
                            onClick={search}
                            disabled={loading}
                            className="bg-green-700 hover:bg-green-800 disabled:bg-green-400 text-white rounded-xl px-5 font-bold"
                        >
                            {loading ? 'Loading...' : 'Search'}
                        </button>
                    </div>

                    {/* AUTOCOMPLETE */}
                    {(suggestions.length > 0 || searchingLocations) && (
                        <div className="absolute z-50 left-0 right-[105px] mt-2 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">

                            {searchingLocations && (
                                <div className="p-4 text-sm text-slate-500">
                                    Searching locations...
                                </div>
                            )}

                            {!searchingLocations &&
                                suggestions.map((location, index) => (
                                    <button
                                        key={`${location.lat}-${location.lon}-${index}`}
                                        onClick={() =>
                                            selectLocation(location)
                                        }
                                        className="w-full text-left p-4 hover:bg-green-50 border-b last:border-b-0 transition"
                                    >
                                        <div className="flex items-start gap-3">
                                            <span className="text-green-600 text-lg">
                                                📍
                                            </span>

                                            <div>
                                                <p className="font-bold text-slate-800">
                                                    {location.name ||
                                                        location.display_name.split(',')[0]}
                                                </p>

                                                <p className="text-xs text-slate-500 mt-1">
                                                    {location.display_name}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                        </div>
                    )}
                </div>

                {/* SELECTED LOCATION */}
                {selectedLocation && (
                    <div className="mt-4 inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-800 px-4 py-2 rounded-xl text-sm font-semibold">
                        📍 {selectedLocation}
                    </div>
                )}

                {/* ERROR */}
                {error && (
                    <div className="mt-4 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
                        {error}
                    </div>
                )}

                {/* LOADING */}
                {loading && !weather && (
                    <div className="mt-8 bg-white border rounded-2xl p-8 text-center">
                        <div className="text-3xl mb-3">🌦️</div>
                        <p className="font-bold text-slate-700">
                            Fetching live weather...
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                            Getting current conditions for your selected location.
                        </p>
                    </div>
                )}

                {/* WEATHER */}
                {weather && (
                    <>
                        <div className="grid md:grid-cols-4 gap-4 mt-7">
                            <W
                                t="Temperature"
                                v={`${weather.temperature}°C`}
                            />

                            <W
                                t="Humidity"
                                v={`${weather.humidity}%`}
                            />

                            <W
                                t="Rainfall"
                                v={`${weather.rainfall} mm`}
                            />

                            <W
                                t="Wind"
                                v={`${weather.windSpeed} km/h`}
                            />
                        </div>

                        <div className="bg-white border rounded-2xl p-6 mt-6">

                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                <div>
                                    <h2 className="font-black text-xl">
                                        {weather.condition}
                                    </h2>

                                    <p className="text-sm text-slate-500 mt-1">
                                        {weather.risk}
                                    </p>
                                </div>

                                <div className="text-sm font-semibold text-green-700 bg-green-50 px-4 py-2 rounded-xl">
                                    Live Weather
                                </div>
                            </div>

                            <div className="grid md:grid-cols-5 gap-3 mt-5">
                                {weather.forecast?.map((d: any) => (
                                    <div
                                        key={d.date}
                                        className="rounded-xl bg-slate-50 p-4"
                                    >
                                        <b>{d.day}</b>

                                        <p className="text-sm mt-2">
                                            {d.tempMin}–{d.tempMax}°C
                                        </p>

                                        <p className="text-xs text-blue-700 mt-1">
                                            Rain {d.rainProb}%
                                        </p>

                                        <p className="text-xs text-slate-500 mt-1">
                                            {d.condition}
                                        </p>

                                        {d.rainfallMm !== undefined && (
                                            <p className="text-xs text-slate-500 mt-1">
                                                {d.rainfallMm} mm expected
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}

            </div>
        </div>
    );
}

function W({ t, v }: { t: string; v: string }) {
    return (
        <div className="bg-white border rounded-2xl p-5">
            <p className="text-xs text-slate-500 font-bold">
                {t}
            </p>

            <b className="text-2xl mt-2 block">
                {v}
            </b>
        </div>
    );
}