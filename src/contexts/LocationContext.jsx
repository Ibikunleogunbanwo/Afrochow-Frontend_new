"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const LocationContext = createContext(undefined);

// Full address object shape returned by Nominatim
const buildLocationDetails = (address) => ({
    neighbourhood: address?.neighbourhood || address?.suburb    || null,
    city:          address?.city          || address?.town      || address?.village || address?.county || null,
    province:      address?.state         || null,
    postalCode:    address?.postcode      || null,
    country:       address?.country       || null,
    displayName:   null, // set separately from top-level display_name
});

const reverseGeocode = async (lat, lng) => {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
            { headers: { 'Accept-Language': 'en' } }
        );
        const data = await response.json();
        const details = buildLocationDetails(data?.address || {});
        details.displayName = data?.display_name || null;
        return details;
    } catch {
        return null;
    }
};

const detectFromIP = async () => {
    try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        return {
            neighbourhood: null,
            city:          data?.city     || null,
            province:      data?.region   || null,
            postalCode:    data?.postal   || null,
            country:       data?.country_name || null,
            displayName:   data?.city     || null,
        };
    } catch {
        return null;
    }
};

export const LocationProvider = ({ children }) => {
    const [city,            setCity]            = useState('Calgary');
    const [locationDetails, setLocationDetails] = useState(null);
    const [isDetecting,     setIsDetecting]     = useState(false);
    const [coordinates,     setCoordinates]     = useState(null);
    const [locationSource,  setLocationSource]  = useState(null);

    const autoDetectCity = useCallback(async () => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const cachedCity    = localStorage.getItem('userCity');
        const cachedDetails = localStorage.getItem('userLocationDetails');

        if (cachedCity) {
            setCity(cachedCity);
            setLocationSource('cached');
            if (cachedDetails) {
                try { setLocationDetails(JSON.parse(cachedDetails)); } catch {}
            }
            // Re-detect in background to keep fresh
            void autoDetectCity();
        } else {
            void autoDetectCity();
        }
    }, [autoDetectCity]);

    const requestPreciseLocation = async () => {
        setIsDetecting(true);
        try {
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout:            8000,
                    maximumAge:         5 * 60 * 1000,
                });
            });

            const { latitude, longitude } = position.coords;
            setCoordinates({ lat: latitude, lng: longitude });

            const details = await reverseGeocode(latitude, longitude);
            if (details?.city) {
                setCity(details.city);
                setLocationDetails(details);
                setLocationSource('gps');
                localStorage.setItem('userCity',            details.city);
                localStorage.setItem('userCitySource',      'gps');
                localStorage.setItem('userLocationDetails', JSON.stringify(details));
            } else {
                await fallbackToIP();
            }
        } catch {
            await fallbackToIP();
        } finally {
            setIsDetecting(false);
        }
    };

    const fallbackToIP = async () => {
        const details = await detectFromIP();
        if (details?.city) {
            setCity(details.city);
            setLocationDetails(details);
            setLocationSource('ip');
            localStorage.setItem('userCity',            details.city);
            localStorage.setItem('userCitySource',      'ip');
            localStorage.setItem('userLocationDetails', JSON.stringify(details));
        }
    };

    const updateCity = (newCity) => {
        setCity(newCity);
        setCoordinates(null); // clear GPS coords so city-name search is used
        setLocationSource('manual');
        setLocationDetails(prev => ({ ...(prev || {}), city: newCity }));
        localStorage.setItem('userCity',       newCity);
        localStorage.setItem('userCitySource', 'manual');
    };

    // Called when user picks a Nominatim suggestion — sets both city AND coordinates
    // so the radius-based vendor search fires (most accurate path).
    const updateCityWithCoordinates = (newCity, lat, lng, details = null) => {
        setCity(newCity);
        setCoordinates({ lat, lng });
        setLocationSource('manual');
        const merged = { ...(details || {}), city: newCity };
        setLocationDetails(merged);
        localStorage.setItem('userCity',            newCity);
        localStorage.setItem('userCitySource',      'manual');
        localStorage.setItem('userLocationDetails', JSON.stringify(merged));
    };

    // Build a human-readable location label at whatever granularity is available
    // e.g. "Bridgeland, Calgary, AB" or just "Calgary, AB" or "Calgary"
    const getLocationLabel = () => {
        if (!locationDetails) return city || null;
        const parts = [
            locationDetails.neighbourhood,
            locationDetails.city,
            locationDetails.province,
        ].filter(Boolean);
        return parts.length > 0 ? parts.join(', ') : city || null;
    };

    return (
        <LocationContext.Provider
            value={{
                city,
                locationDetails,
                isDetecting,
                coordinates,
                locationSource,
                locationLabel: getLocationLabel(),
                updateCity,
                updateCityWithCoordinates,
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