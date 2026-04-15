"use client";

import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext({
    isDarkMode: false,
    toggleDarkMode: () => {},
});

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    // Initialise from localStorage on the client; SSR defaults to false to
    // avoid a hydration mismatch (the class is applied synchronously below).
    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof window === 'undefined') return false;
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        return savedTheme === 'dark' || (!savedTheme && prefersDark);
    });

    // Keep the <html> class in sync — never calls setState, no cascading renders.
    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    const toggleDarkMode = () => {
        setIsDarkMode(prev => {
            const newMode = !prev;

            if (newMode) {
                document.documentElement.classList.add('dark');
                localStorage.setItem('theme', 'dark');
            } else {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('theme', 'light');
            }

            return newMode;
        });
    };

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
            {children}
        </ThemeContext.Provider>
    );
};
