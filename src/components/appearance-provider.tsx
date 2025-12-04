
"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type AppearanceContextType = {
  font: string;
  setFont: (font: string) => void;
  background: string | null;
  setBackground: (background: string | null) => void;
};

const AppearanceContext = createContext<AppearanceContextType | undefined>(undefined);

export function AppearanceProvider({ children }: { children: ReactNode }) {
  const [font, setFont] = useState("font-body");
  const [background, setBackground] = useState<string | null>(null);

  useEffect(() => {
    // Load font from localStorage
    const storedFont = localStorage.getItem("site-font");
    if (storedFont) {
      setFont(storedFont);
      document.body.classList.add(storedFont);
    } else {
      document.body.classList.add(font);
    }

    // Load background from localStorage
    const storedBackground = localStorage.getItem("site-background");
    if (storedBackground) {
        handleSetBackground(storedBackground);
    } else {
        document.body.classList.add('body-background'); // Fallback to default
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSetFont = (newFont: string) => {
    // Remove old font class
    document.body.classList.remove(font);
    // Add new font class
    document.body.classList.add(newFont);
    // Persist new font
    localStorage.setItem("site-font", newFont);
    setFont(newFont);
  };
  
  const handleSetBackground = (newBg: string | null) => {
      if (newBg) {
          document.body.style.backgroundImage = `url(${newBg})`;
          document.body.classList.remove('body-background');
          localStorage.setItem("site-background", newBg);
      } else {
          document.body.style.backgroundImage = '';
          document.body.classList.add('body-background');
          localStorage.removeItem("site-background");
      }
      setBackground(newBg);
  }

  return (
    <AppearanceContext.Provider value={{ font, setFont: handleSetFont, background, setBackground: handleSetBackground }}>
      {children}
    </AppearanceContext.Provider>
  );
}

export const useAppearance = () => {
  const context = useContext(AppearanceContext);
  if (context === undefined) {
    throw new Error("useAppearance must be used within an AppearanceProvider");
  }
  return context;
};
