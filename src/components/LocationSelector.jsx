"use client";
import { useState, useEffect, useRef } from 'react';
import { MapPin, ChevronDown } from 'lucide-react';
import { useLocation } from '@/contexts/LocationContext';

const LocationSelector = () => {
    const [showSelector, setShowSelector] = useState(false);
    const dropdownRef = useRef(null);
    const { city, detectedCity, isDetecting, updateCity, autoDetectCity } = useLocation();

    const canadianCities = [
        'Toronto', 'Vancouver', 'Montreal', 'Calgary',
        'Ottawa', 'Edmonton', 'Winnipeg', 'Hamilton',
        'Quebec City', 'Mississauga', 'Brampton', 'Surrey'
    ];

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowSelector(false);
            }
        };

        if (showSelector) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showSelector]);

    const handleCityChange = (newCity) => {
        updateCity(newCity);
        setShowSelector(false);
    };

    return (
        <div className="relative inline-block" ref={dropdownRef}>
            <button
                onClick={() => setShowSelector(!showSelector)}
                className="flex items-center space-x-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-xl hover:border-orange-300 transition-all focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
                <MapPin className="w-5 h-5 text-orange-600" />
                <span className="font-medium text-gray-900">{city}</span>
                {detectedCity && (
                    <span className="text-xs text-green-600 font-medium">(Auto)</span>
                )}
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showSelector ? 'rotate-180' : ''}`} />
            </button>

            {showSelector && (
                <div className="absolute top-full mt-2 left-0 w-64 bg-white border-2 border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in">
                    <button
                        onClick={autoDetectCity}
                        disabled={isDetecting}
                        className="w-full px-4 py-3 text-left hover:bg-orange-50 transition-colors flex items-center space-x-2 border-b border-gray-100"
                    >
                        <MapPin className="w-4 h-4 text-orange-600" />
                        <span className="font-medium text-gray-900">
                            {isDetecting ? 'Detecting...' : '🎯 Auto-detect my location'}
                        </span>
                    </button>

                    <div className="max-h-64 overflow-y-auto">
                        {canadianCities.map(cityName => (
                            <button
                                key={cityName}
                                onClick={() => handleCityChange(cityName)}
                                className={`w-full px-4 py-3 text-left hover:bg-orange-50 transition-colors ${
                                    city === cityName ? 'bg-orange-100 font-semibold text-orange-700' : 'text-gray-700'
                                }`}
                            >
                                {cityName}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LocationSelector;
