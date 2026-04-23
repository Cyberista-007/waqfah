'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface ReadingContextType {
  isReadingMode: boolean;
  toggleReadingMode: () => void;
  fontSize: number;
  setFontSize: (size: number) => void;
}

const ReadingContext = createContext<ReadingContextType | undefined>(undefined);

export function ReadingProvider({ children }: { children: React.ReactNode }) {
  const [isReadingMode, setIsReadingMode] = useState(false);
  const [fontSize, setFontSize] = useState(18);

  const toggleReadingMode = () => {
    setIsReadingMode(prev => !prev);
  };

  useEffect(() => {
    if (isReadingMode) {
      document.body.classList.add('reading-mode-active');
    } else {
      document.body.classList.remove('reading-mode-active');
    }
  }, [isReadingMode]);

  return (
    <ReadingContext.Provider value={{ isReadingMode, toggleReadingMode, fontSize, setFontSize }}>
      {children}
    </ReadingContext.Provider>
  );
}

export function useReadingMode() {
  const context = useContext(ReadingContext);
  if (context === undefined) {
    throw new Error('useReadingMode must be used within a ReadingProvider');
  }
  return context;
}
