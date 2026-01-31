"use client"

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";

type AppearanceContextType = {
  font: string;
  setFont: (font: string) => void;
  background: string | null;
  setBackground: (background: string | null) => void;
  isBackgroundShown: boolean;
  toggleBackground: (shown: boolean) => void;
};

const AppearanceContext = createContext<AppearanceContextType | undefined>(undefined);

export function AppearanceProvider({ children }: { children: ReactNode }) {
  const [font, setFont] = useState("font-body");
  const [background, setBackground] = useState<string | null>(null);
  const [isBackgroundShown, setIsBackgroundShown] = useState(true);

  const applyBackground = useCallback(() => {
    const customBg = localStorage.getItem("site-background");
    if (customBg) {
      document.body.style.backgroundImage = `url(${customBg})`;
      document.body.style.backgroundAttachment = 'fixed';
      document.body.style.backgroundPosition = 'center';
      document.body.style.backgroundRepeat = 'no-repeat';
      document.body.style.backgroundSize = 'cover';
      document.body.classList.remove('body-background');
      setBackground(customBg);
    } else {
      document.body.style.backgroundImage = '';
      document.body.style.backgroundAttachment = '';
      document.body.style.backgroundPosition = '';
      document.body.style.backgroundRepeat = '';
      document.body.style.backgroundSize = '';
      document.body.classList.add('body-background');
      setBackground(null);
    }
  }, []);

  const clearBackground = useCallback(() => {
    document.body.style.backgroundImage = '';
    document.body.style.backgroundAttachment = '';
    document.body.style.backgroundPosition = '';
    document.body.style.backgroundRepeat = '';
    document.body.style.backgroundSize = '';
    document.body.classList.remove('body-background');
  }, []);

  const toggleBackground = useCallback((shown: boolean) => {
    if (shown) {
      applyBackground();
    } else {
      clearBackground();
    }
    setIsBackgroundShown(shown);
    localStorage.setItem("site-background-shown", shown ? "true" : "false");
  }, [applyBackground, clearBackground]);

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
          document.body.style.backgroundAttachment = 'fixed';
          document.body.style.backgroundPosition = 'center';
          document.body.style.backgroundRepeat = 'no-repeat';
          document.body.style.backgroundSize = 'cover';
          document.body.classList.remove('body-background');
          localStorage.setItem("site-background", newBg);
          setBackground(newBg);
      } else {
          // This case is now for restoring default, which applyBackground does.
          localStorage.removeItem("site-background");
          applyBackground();
      }
      // When a new background is set, always ensure it's shown
      if (!isBackgroundShown) {
        toggleBackground(true);
      }
  };

  useEffect(() => {
    // FONT
    const storedFont = localStorage.getItem("site-font");
    if (storedFont) {
      setFont(storedFont);
      document.body.classList.add(storedFont);
    } else {
      document.body.classList.add("font-body");
    }

    // BACKGROUND
    const storedIsShown = localStorage.getItem("site-background-shown");
    const show = storedIsShown !== "false"; // default to true
    
    if (show) {
      setIsBackgroundShown(true);
      applyBackground();
    } else {
      setIsBackgroundShown(false);
      clearBackground();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  return (
    <AppearanceContext.Provider value={{ font, setFont: handleSetFont, background, setBackground: handleSetBackground, isBackgroundShown, toggleBackground }}>
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
