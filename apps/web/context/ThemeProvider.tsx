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
        const storedTheme = localStorage.getItem('bookify_theme');
        const storedFont = localStorage.getItem('bookify_font');
        
        let initialTheme = 'dark';
        let initialFont = 'medium';

        if (storedTheme === 'light' || storedTheme === 'dark') {
            initialTheme = storedTheme;
        } else if (user && user.settings) {
            try {
                const s = typeof user.settings === 'string' ? JSON.parse(user.settings) : user.settings;
                if (s.theme === 'light') initialTheme = 'light';
            } catch (e) {}
        }
        
        if (storedFont === 'small' || storedFont === 'large' || storedFont === 'medium') {
            initialFont = storedFont;
        } else if (user && user.settings) {
            try {
                const s = typeof user.settings === 'string' ? JSON.parse(user.settings) : user.settings;
                if (s.readerFontSize === 'small' || s.readerFontSize === 'large') initialFont = s.readerFontSize;
            } catch (e) {}
        }

        setThemeState(initialTheme as 'light' | 'dark');
        setFontSizeState(initialFont as 'small' | 'medium' | 'large');
    }, [user]);

    const handleSetTheme = (newTheme: 'light' | 'dark') => {
        setThemeState(newTheme);
        localStorage.setItem('bookify_theme', newTheme);
    };

    const handleSetFontSize = (newSize: 'small' | 'medium' | 'large') => {
        setFontSizeState(newSize);
        localStorage.setItem('bookify_font', newSize);
    };

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
        <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme, fontSize, setFontSize: handleSetFontSize }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => useContext(ThemeContext);
