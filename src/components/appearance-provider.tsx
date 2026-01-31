"use client"

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";

type BackgroundState = {
  image: string | null;
  color: string | null;
};

type AppearanceContextType = {
  font: string;
  setFont: (font: string) => void;
  background: BackgroundState;
  setBackground: (background: BackgroundState | null) => void;
  isBackgroundShown: boolean;
  toggleBackground: (shown: boolean) => void;
};

const AppearanceContext = createContext<AppearanceContextType | undefined>(undefined);

export function AppearanceProvider({ children }: { children: ReactNode }) {
  const [font, setFont] = useState("font-body");
  const [background, setBackground] = useState<BackgroundState>({ image: null, color: null });
  const [isBackgroundShown, setIsBackgroundShown] = useState(true);

  const applyBackground = useCallback(() => {
    const customBgImage = localStorage.getItem("site-background-image");
    const customBgColor = localStorage.getItem("site-background-color");
    
    document.body.style.backgroundImage = customBgImage || '';
    document.body.style.backgroundColor = customBgColor || '';

    if (customBgImage || customBgColor) {
      document.body.style.backgroundAttachment = 'fixed';
      document.body.style.backgroundPosition = 'center';
      document.body.style.backgroundRepeat = 'no-repeat';
      document.body.style.backgroundSize = 'cover';
      document.body.classList.remove('body-background');
    } else {
      document.body.style.backgroundAttachment = '';
      document.body.style.backgroundPosition = '';
      document.body.style.backgroundRepeat = '';
      document.body.style.backgroundSize = '';
      document.body.classList.add('body-background');
    }

    setBackground({ image: customBgImage, color: customBgColor });
  }, []);

  const clearBackgroundStyles = useCallback(() => {
    document.body.style.backgroundImage = '';
    document.body.style.backgroundColor = '';
    document.body.classList.add('body-background');
  }, []);

  const toggleBackground = useCallback((shown: boolean) => {
    if (shown) {
      applyBackground();
    } else {
      clearBackgroundStyles();
    }
    setIsBackgroundShown(shown);
    localStorage.setItem("site-background-shown", shown ? "true" : "false");
  }, [applyBackground, clearBackgroundStyles]);

  const handleSetFont = (newFont: string) => {
    document.body.classList.remove(font);
    document.body.classList.add(newFont);
    localStorage.setItem("site-font", newFont);
    setFont(newFont);
  };
  
  const handleSetBackground = (newBg: BackgroundState | null) => {
      if (newBg?.image) {
        localStorage.setItem("site-background-image", newBg.image);
      } else {
        localStorage.removeItem("site-background-image");
      }
      
      if (newBg?.color) {
        localStorage.setItem("site-background-color", newBg.color);
      } else {
        localStorage.removeItem("site-background-color");
      }

    // Apply the new background immediately
    applyBackground();
    
    // If the background was hidden, show it now that a new one is set.
    if (!isBackgroundShown) {
      toggleBackground(true);
    }
  };

  useEffect(() => {
    const storedFont = localStorage.getItem("site-font");
    if (storedFont) {
      setFont(storedFont);
      document.body.classList.add(storedFont);
    } else {
      document.body.classList.add("font-body");
    }

    const storedIsShown = localStorage.getItem("site-background-shown");
    const show = storedIsShown !== "false";
    
    setIsBackgroundShown(show);
    if (show) {
      applyBackground();
    } else {
      clearBackgroundStyles();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
