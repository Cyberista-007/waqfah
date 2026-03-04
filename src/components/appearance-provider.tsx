
"use client"

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { fonts } from "./font-switcher";

type BackgroundState = {
  image: string | null;
  color: string | null;
  type?: 'image' | 'pattern';
};

export type BackgroundEffect = 'none' | 'particles';

export type ParticleSettings = {
  interaction: boolean;
  count: number;
  speed: number;
  lineDistance: number;
};

type AppearanceContextType = {
  font: string;
  setFont: (font: string) => void;
  language: string;
  setLanguage: (language: string) => void;
  background: BackgroundState;
  setBackground: (background: BackgroundState | null) => void;
  isBackgroundShown: boolean;
  toggleBackground: (shown: boolean) => void;
  backgroundEffect: BackgroundEffect;
  setBackgroundEffect: (effect: BackgroundEffect) => void;
  particleColor: string;
  setParticleColor: (color: string) => void;
  particleSettings: ParticleSettings;
  setParticleSettings: (settings: Partial<ParticleSettings>) => void;
  quranIconUrl?: string | null;
  hadithIconUrl?: string | null;
  heroImageUrl?: string | null;
  heroTitle?: string | null;
  heroSubtitle?: string | null;
};

const AppearanceContext = createContext<AppearanceContextType | undefined>(undefined);

type AppearanceProviderProps = {
  children: ReactNode;
  defaultFont?: string;
  quranIconUrl?: string | null;
  hadithIconUrl?: string | null;
  heroImageUrl?: string | null;
  heroTitle?: string | null;
  heroSubtitle?: string | null;
};


export function AppearanceProvider({ children, defaultFont, quranIconUrl, hadithIconUrl, heroImageUrl, heroTitle, heroSubtitle }: AppearanceProviderProps) {
  const [font, setFont] = useState(defaultFont || "font-body");
  const [language, setLanguageState] = useState('ar');
  const [background, setBackground] = useState<BackgroundState>({ image: null, color: null, type: 'image' });
  const [isBackgroundShown, setIsBackgroundShown] = useState(true);
  const [backgroundEffect, setBackgroundEffectState] = useState<BackgroundEffect>('none');
  const [particleColor, setParticleColor] = useState('#FFFFFF');
  
  const [particleSettings, setParticleSettingsState] = useState<ParticleSettings>({
    interaction: true,
    count: 80,
    speed: 0.3,
    lineDistance: 120,
  });

  const applyBackground = useCallback(() => {
    const customBgImage = localStorage.getItem("site-background-image");
    const customBgColor = localStorage.getItem("site-background-color");
    const customBgType = localStorage.getItem("site-background-type") as 'image' | 'pattern' | null;

    document.body.style.backgroundImage = customBgImage || '';
    document.body.style.backgroundColor = customBgColor || '';

    if (customBgImage || customBgColor) {
      if (customBgType === 'pattern' && customBgImage) {
        document.body.style.backgroundAttachment = 'scroll';
        document.body.style.backgroundPosition = '0 0';
        document.body.style.backgroundRepeat = 'repeat';
        document.body.style.backgroundSize = 'auto';
      } else { // 'image' or not set (legacy for images)
        document.body.style.backgroundAttachment = 'fixed';
        document.body.style.backgroundPosition = 'center';
        document.body.style.backgroundRepeat = 'no-repeat';
        document.body.style.backgroundSize = 'cover';
      }
      document.body.classList.remove('body-background');
    } else {
      document.body.style.backgroundAttachment = '';
      document.body.style.backgroundPosition = '';
      document.body.style.backgroundRepeat = '';
      document.body.style.backgroundSize = '';
      document.body.classList.add('body-background');
    }

    setBackground({ image: customBgImage, color: customBgColor, type: customBgType || 'image' });
  }, []);

  const clearBackgroundStyles = useCallback(() => {
    document.body.style.backgroundImage = '';
    document.body.style.backgroundColor = '';
    document.body.classList.add('body-background');
  }, []);

  const setBackgroundEffect = useCallback((effect: BackgroundEffect) => {
    setBackgroundEffectState(effect);
    localStorage.setItem("site-background-effect", effect);
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

  const handleSetFont = useCallback((newFont: string) => {
    const allFontClasses = fonts.map(f => f.value);
    document.body.classList.remove(...allFontClasses);
    document.body.classList.add(newFont);
    localStorage.setItem("site-font", newFont);
    setFont(newFont);
  }, []);
  
  const handleSetLanguage = useCallback((newLang: string) => {
    localStorage.setItem("site-language", newLang);
    setLanguageState(newLang);
  }, []);
  
  const handleSetBackground = useCallback((newBg: BackgroundState | null) => {
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
    
      if (newBg?.type) {
        localStorage.setItem("site-background-type", newBg.type);
      } else {
        localStorage.removeItem("site-background-type");
      }


    if (!isBackgroundShown && (newBg?.image || newBg?.color)) {
        toggleBackground(true);
    } else if (isBackgroundShown) {
        applyBackground();
    }
  }, [isBackgroundShown, toggleBackground, applyBackground]);

  const handleSetParticleColor = useCallback((color: string) => {
    setParticleColor(color);
    localStorage.setItem("site-particle-color", color);
  }, []);
  
  const setParticleSettings = useCallback((newSettings: Partial<ParticleSettings>) => {
    setParticleSettingsState(prev => {
        const updated = {...prev, ...newSettings};
        localStorage.setItem("site-particle-settings", JSON.stringify(updated));
        return updated;
    });
  }, []);

  useEffect(() => {
    const allFontClasses = fonts.map(f => f.value);
    const storedFont = localStorage.getItem("site-font");
    const initialFont = storedFont || defaultFont || 'font-body';
    
    document.body.classList.remove(...allFontClasses);
    document.body.classList.add(initialFont);
    setFont(initialFont);

    const storedLang = localStorage.getItem("site-language");
    const initialLang = storedLang || 'ar';
    setLanguageState(initialLang);

    const storedIsShown = localStorage.getItem("site-background-shown");
    const show = storedIsShown !== "false";
    
    setIsBackgroundShown(show);
    if (show) {
      applyBackground();
    } else {
      clearBackgroundStyles();
    }
    
    const storedEffect = localStorage.getItem("site-background-effect") as BackgroundEffect | null;
    if (storedEffect && ['none', 'particles'].includes(storedEffect)) {
      setBackgroundEffectState(storedEffect);
    } else {
        setBackgroundEffectState('none');
    }

    const storedParticleColor = localStorage.getItem("site-particle-color");
    if (storedParticleColor) {
      setParticleColor(storedParticleColor);
    }

    const storedParticleSettings = localStorage.getItem("site-particle-settings");
    if (storedParticleSettings) {
      try {
        setParticleSettingsState(prev => ({...prev, ...JSON.parse(storedParticleSettings)}));
      } catch (e) { console.error("Failed to parse particle settings", e) }
    }
  }, [defaultFont, applyBackground, clearBackgroundStyles]);

  const value = { font, setFont: handleSetFont, language, setLanguage: handleSetLanguage, background, setBackground: handleSetBackground, isBackgroundShown, toggleBackground, backgroundEffect, setBackgroundEffect, particleColor, setParticleColor: handleSetParticleColor, particleSettings, setParticleSettings, quranIconUrl, hadithIconUrl, heroImageUrl, heroTitle, heroSubtitle };

  return (
    <AppearanceContext.Provider value={value}>
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

    
