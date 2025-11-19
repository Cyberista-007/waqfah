
"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type FontContextType = {
  font: string;
  setFont: (font: string) => void;
};

const FontContext = createContext<FontContextType | undefined>(undefined);

export function FontProvider({ children }: { children: ReactNode }) {
  const [font, setFont] = useState("font-body"); // Default font class

  useEffect(() => {
    const storedFont = localStorage.getItem("site-font");
    if (storedFont) {
      setFont(storedFont);
      document.body.classList.add(storedFont);
    } else {
        document.body.classList.add(font);
    }
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

  return (
    <FontContext.Provider value={{ font, setFont: handleSetFont }}>
      {children}
    </FontContext.Provider>
  );
}

export const useFont = () => {
  const context = useContext(FontContext);
  if (context === undefined) {
    throw new Error("useFont must be used within a FontProvider");
  }
  return context;
};
