"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MapPin, Search, Loader2, X, Navigation } from "lucide-react";
import { useLocation } from "@/contexts/LocationContext";

// Nominatim forward geocode — returns up to 5 Canadian results
const searchNominatim = async (query) => {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&countrycodes=ca&addressdetails=1&limit=5`;
    const res = await fetch(url, { headers: { "Accept-Language": "en" } });
    return res.json();
};

// Pull the most useful city-level label from a Nominatim result.
// Handles cities, towns, villages, postal code lookups (where city may be
// in municipality or county instead), and neighbourhood-level results.
const extractCity = (address) =>
    address?.city         ||
    address?.town         ||
    address?.village      ||
    address?.municipality ||
    address?.county       ||
    null;

// Human-readable suggestion label shown in the dropdown
const buildLabel = (result) => {
    const addr = result.address || {};
    const city = extractCity(addr);
    const parts = [
        addr.neighbourhood || addr.suburb || addr.road,
        city,
        addr.state,
        addr.postcode,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : result.display_name;
};

export default function LocationSearchInput({ placeholder = "Search city or address…", className = "", compact = false }) {
    const { city, isDetecting, locationSource, requestPreciseLocation, updateCityWithCoordinates } = useLocation();

    const [query,       setQuery]       = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [searching,   setSearching]   = useState(false);
    const [open,        setOpen]        = useState(false);
    const [focused,     setFocused]     = useState(false);
    const debounceRef = useRef(null);
    const containerRef = useRef(null);

    // Close on outside click
    useEffect(() => {
        const handler = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const search = useCallback(async (q) => {
        if (!q || q.trim().length < 2) { setSuggestions([]); setOpen(false); return; }
        setSearching(true);
        try {
            const results = await searchNominatim(q);
            setSuggestions(Array.isArray(results) ? results : []);
            setOpen(true);
        } catch {
            setSuggestions([]);
        } finally {
            setSearching(false);
        }
    }, []);

    const handleChange = (e) => {
        const val = e.target.value;
        setQuery(val);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => search(val), 350);
    };

    const handleSelect = (result) => {
        const addr = result.address || {};
        // For postal code searches, city may be absent — fall back to municipality/county
        const selectedCity =
            extractCity(addr) ||
            addr.municipality ||
            addr.postcode ||
            result.display_name;
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        const details = {
            neighbourhood: addr.neighbourhood || addr.suburb || null,
            city:          selectedCity,
            province:      addr.state || null,
            postalCode:    addr.postcode || null,
            country:       addr.country || null,
            displayName:   result.display_name,
        };
        updateCityWithCoordinates(selectedCity, lat, lng, details);
        setQuery(buildLabel(result));
        setSuggestions([]);
        setOpen(false);
    };

    const handleClear = () => {
        setQuery("");
        setSuggestions([]);
        setOpen(false);
    };

    const displayValue = focused ? query : (query || city || "");

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            {/* Input */}
            <div className={`flex items-center gap-2 bg-white border-2 rounded-2xl px-4 shadow-sm transition-colors
                ${compact ? "py-1.5" : "py-3"}
                ${focused ? "border-orange-400" : "border-gray-200 hover:border-gray-300"}`}>
                {searching ? (
                    <Loader2 className="w-4 h-4 text-orange-500 animate-spin shrink-0" />
                ) : (
                    <Search className="w-4 h-4 text-gray-400 shrink-0" />
                )}
                <input
                    type="text"
                    value={displayValue}
                    onChange={handleChange}
                    onFocus={() => { setFocused(true); if (suggestions.length > 0) setOpen(true); }}
                    onBlur={() => setFocused(false)}
                    placeholder={placeholder}
                    className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
                />
                {query && (
                    <button onClick={handleClear} className="text-gray-400 hover:text-gray-600 shrink-0">
                        <X className="w-3.5 h-3.5" />
                    </button>
                )}
                {/* GPS button */}
                <button
                    onClick={() => { requestPreciseLocation(); setQuery(""); }}
                    disabled={isDetecting}
                    title="Use my current location"
                    className="shrink-0 p-1 rounded-lg text-orange-500 hover:bg-orange-50 transition-colors disabled:opacity-50"
                >
                    {isDetecting
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Navigation className="w-4 h-4" />}
                </button>
            </div>

            {/* Current city pill — hidden in compact (navbar) mode */}
            {!compact && city && !query && (
                <div className="mt-2 flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-orange-500" />
                    <span className="text-xs text-gray-500">
                        Showing results near <span className="font-semibold text-gray-700">{city}</span>
                        {locationSource === "gps" && <span className="text-orange-500"> (GPS)</span>}
                    </span>
                </div>
            )}

            {/* Suggestions dropdown */}
            {open && suggestions.length > 0 && (
                <ul className="absolute z-50 top-full mt-1.5 w-full bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
                    {suggestions.map((result, i) => (
                        <li key={result.place_id || i}>
                            <button
                                onMouseDown={(e) => e.preventDefault()} // prevent blur before click
                                onClick={() => handleSelect(result)}
                                className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-orange-50 transition-colors border-b border-gray-50 last:border-0"
                            >
                                <MapPin className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-gray-800 truncate">
                                        {buildLabel(result)}
                                    </p>
                                    <p className="text-xs text-gray-400 truncate">{result.address?.country || "Canada"}</p>
                                </div>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
