'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface MoodContextType {
    moodColor: string;
    setMoodColor: (color: string) => void;
}

const MoodContext = createContext<MoodContextType | undefined>(undefined);

export function MoodProvider({ children }: { children: ReactNode }) {
    // Default to primary color opacity
    const [moodColor, setMoodColor] = useState('hsl(var(--primary))');

    useEffect(() => {
        // Sync with global CSS variable for all components to use
        document.documentElement.style.setProperty('--mood-color', moodColor);
    }, [moodColor]);

    return (
        <MoodContext.Provider value={{ moodColor, setMoodColor }}>
            {children}
        </MoodContext.Provider>
    );
}

export function useMood() {
    const context = useContext(MoodContext);
    if (!context) {
        throw new Error('useMood must be used within a MoodProvider');
    }
    return context;
}
