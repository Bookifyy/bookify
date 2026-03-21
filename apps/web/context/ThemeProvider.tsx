'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

type ThemeContextType = {
    theme: 'light' | 'dark';
    setTheme: (theme: 'light' | 'dark') => void;
    fontSize: 'small' | 'medium' | 'large';
    setFontSize: (size: 'small' | 'medium' | 'large') => void;
};

const ThemeContext = createContext<ThemeContextType>({ theme: 'dark', setTheme: () => {}, fontSize: 'medium', setFontSize: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [theme, setThemeState] = useState<'light' | 'dark'>('dark');
    const [fontSize, setFontSizeState] = useState<'small' | 'medium' | 'large'>('medium');

    // Read initial theme and font from user settings and observe changes
    useEffect(() => {
        if (user && user.settings) {
            try {
                const s = typeof user.settings === 'string' ? JSON.parse(user.settings) : user.settings;
                if (s.theme === 'light') {
                    setThemeState('light');
                } else {
                    setThemeState('dark');
                }
                
                if (s.readerFontSize === 'small' || s.readerFontSize === 'large') {
                    setFontSizeState(s.readerFontSize);
                } else {
                    setFontSizeState('medium');
                }
            } catch (e) {
                // Keep default
            }
        } else {
            // Default to dark and medium
            setThemeState('dark');
            setFontSizeState('medium');
        }
    }, [user]);

    // Apply the active theme to document.html root class securely overriding hardcoded attributes
    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'light') {
            root.classList.remove('dark');
            root.classList.add('light'); // Just to be explicit
        } else {
            root.classList.add('dark');
            root.classList.remove('light');
        }
    }, [theme]);

    // Apply font size globally modifying root rem scaling
    useEffect(() => {
        const root = document.documentElement;
        if (fontSize === 'small') {
            root.style.fontSize = '14px';
        } else if (fontSize === 'large') {
            root.style.fontSize = '18px';
        } else {
            root.style.fontSize = '16px'; // default
        }
    }, [fontSize]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme: setThemeState, fontSize, setFontSize: setFontSizeState }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => useContext(ThemeContext);
