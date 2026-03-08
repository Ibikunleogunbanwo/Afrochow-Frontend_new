"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

const LocationContext = createContext(undefined);

export const LocationProvider = ({ children }) => {
    const [city, setCity] = useState('Toronto');
    const [detectedCity, setDetectedCity] = useState(null);
    const [isDetecting, setIsDetecting] = useState(false);

    useEffect(() => {
        // Check for cached city first
        const cached = localStorage.getItem('userCity');
        if (cached) {
            setCity(cached);
        } else {
            void autoDetectCity();
        }
    }, []);

    const autoDetectCity = async () => {
        try {
            setIsDetecting(true);
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();
            const detected = data.city;

            setDetectedCity(detected);
            setCity(detected);
            localStorage.setItem('userCity', detected);
        } catch (error) {
            const cached = localStorage.getItem('userCity') || 'Toronto';
            setCity(cached);
        } finally {
            setIsDetecting(false);
        }
    };

    const updateCity = (newCity) => {
        setCity(newCity);
        localStorage.setItem('userCity', newCity);
    };

    return (
        <LocationContext.Provider
            value={{
                city,
                detectedCity,
                isDetecting,
                updateCity,
                autoDetectCity
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
