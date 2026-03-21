"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

const LocationContext = createContext(undefined);

// Reverse geocode lat/lng to city name using OpenStreetMap Nominatim (free, no API key)
const reverseGeocode = async (lat, lng) => {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
            { headers: { 'Accept-Language': 'en' } }
        );
        const data = await response.json();
        return (
            data?.address?.city    ||
            data?.address?.town    ||
            data?.address?.village ||
            data?.address?.county  ||
            null
        );
    } catch {
        return null;
    }
};

// Fallback: IP-based geolocation
const detectCityFromIP = async () => {
    try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        return data?.city || null;
    } catch {
        return null;
    }
};

export const LocationProvider = ({ children }) => {
    const [city,           setCity]           = useState('Calgary');
    const [detectedCity,   setDetectedCity]   = useState(null);
    const [isDetecting,    setIsDetecting]    = useState(false);
    const [coordinates,    setCoordinates]    = useState(null);
    const [locationSource, setLocationSource] = useState(null);

    useEffect(() => {
        const cachedCity = localStorage.getItem('userCity');

        if (cachedCity) {
            setCity(cachedCity);
            setLocationSource('cached');
            // Re-detect in background to keep location fresh
            void autoDetectCity();
        } else {
            void autoDetectCity();
        }
    }, []);

    // Try GPS first, fall back to IP
    const autoDetectCity = async () => {
        setIsDetecting(true);
        try {
            if (navigator.geolocation) {
                await requestPreciseLocation();
            } else {
                await fallbackToIP();
            }
        } catch {
            await fallbackToIP();
        } finally {
            setIsDetecting(false);
        }
    };

    // Request precise GPS location from browser
    const requestPreciseLocation = async () => {
        setIsDetecting(true);
        try {
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout:            8000,
                    maximumAge:         5 * 60 * 1000, // cache position for 5 minutes
                });
            });

            const { latitude, longitude } = position.coords;
            setCoordinates({ lat: latitude, lng: longitude });

            const detectedFromGPS = await reverseGeocode(latitude, longitude);
            if (detectedFromGPS) {
                setDetectedCity(detectedFromGPS);
                setCity(detectedFromGPS);
                setLocationSource('gps');
                localStorage.setItem('userCity',       detectedFromGPS);
                localStorage.setItem('userCitySource', 'gps');
            } else {
                // Reverse geocode failed — fall back to IP
                await fallbackToIP();
            }
        } catch {
            // User denied permission or timeout — fall back to IP
            await fallbackToIP();
        } finally {
            setIsDetecting(false);
        }
    };

    const fallbackToIP = async () => {
        const detectedFromIP = await detectCityFromIP();
        if (detectedFromIP) {
            setDetectedCity(detectedFromIP);
            setCity(detectedFromIP);
            setLocationSource('ip');
            localStorage.setItem('userCity',       detectedFromIP);
            localStorage.setItem('userCitySource', 'ip');
        }
        // If both fail, keep the default 'Calgary'
    };

    const updateCity = (newCity) => {
        setCity(newCity);
        setLocationSource('manual');
        localStorage.setItem('userCity',       newCity);
        localStorage.setItem('userCitySource', 'manual');
    };

    return (
        <LocationContext.Provider
            value={{
                city,
                detectedCity,
                isDetecting,
                coordinates,
                locationSource,
                updateCity,
                autoDetectCity,
                requestPreciseLocation,
            }}
        >
            {children}
        </LocationContext.Provider>
    );
};

export const useLocation = () => {
    const context = useContext(LocationContext);
    if (context === undefined) {
        throw new Error('useLocation must be used within a LocationProvider');
    }
    return context;
};