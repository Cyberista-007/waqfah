
"use client"

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { useTheme } from "next-themes";
import { fonts } from "./font-switcher";
import { isLightTheme } from "./theme-switcher";
import { HeroBanner } from "@/lib/types";

function isHexDark(hex?: string | null): boolean {
  if (!hex) return true;
  const clean = hex.trim().replace('#', '');
  let r = 0, g = 0, b = 0;
  if (clean.length === 3) {
    r = parseInt(clean[0] + clean[0], 16);
    g = parseInt(clean[1] + clean[1], 16);
    b = parseInt(clean[2] + clean[2], 16);
  } else if (clean.length >= 6) {
    r = parseInt(clean.slice(0, 2), 16);
    g = parseInt(clean.slice(2, 4), 16);
    b = parseInt(clean.slice(4, 6), 16);
  } else {
    return true;
  }
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
}

type BackgroundState = {
  image: string | null;
  color: string | null;
  type?: 'image' | 'pattern';
};

export type GradientPreset = {
  name: string;
  value: string;
  colors: [string, string, string, string]; // HSL values like "217 91% 60%"
};

export const gradientPresets: GradientPreset[] = [
  { name: "Cinematic Blue", value: "cinematic-blue", colors: ["217 91% 60%", "240 80% 65%", "270 75% 62%", "200 85% 58%"] },
  { name: "Midnight Purple", value: "midnight-purple", colors: ["262 80% 65%", "285 75% 60%", "320 75% 65%", "200 90% 65%"] },
  { name: "Desert Gold", value: "desert-gold", colors: ["40 95% 58%", "25 90% 55%", "10 85% 55%", "50 100% 65%"] },
  { name: "Deep Forest", value: "deep-forest", colors: ["150 65% 50%", "130 65% 50%", "100 60% 50%", "80 70% 55%"] },
  { name: "Arctic Blue", value: "arctic-blue", colors: ["217 91% 55%", "240 80% 60%", "270 75% 60%", "200 80% 55%"] },
  { name: "Sunset Glow", value: "sunset-glow", colors: ["15 90% 60%", "340 80% 60%", "300 70% 55%", "40 95% 65%"] },
  { name: "Ocean Deep", value: "ocean-deep", colors: ["190 90% 50%", "210 85% 55%", "230 80% 60%", "170 95% 45%"] },
  { name: "Cyberpunk", value: "cyberpunk", colors: ["320 100% 60%", "280 90% 60%", "190 90% 50%", "250 80% 65%"] },
];

type AppearanceContextType = {
  font: string;
  setFont: (font: string) => void;
  language: string;
  setLanguage: (language: string) => void;
  background: BackgroundState;
  setBackground: (background: BackgroundState | null) => void;
  isBackgroundShown: boolean;
  toggleBackground: (shown: boolean) => void;
  gradientPreset: string;
  setGradientPreset: (preset: string) => void;
  aiApiKey: string | null;
  setAiApiKey: (key: string | null) => void;
  aiModel: string;
  setAiModel: (model: string) => void;
  showChatbot: boolean;
  setShowChatbot: (show: boolean) => void;
  quranIconUrl?: string | null;
  hadithIconUrl?: string | null;
  heroImageUrl?: string | null;
  heroTitle?: string | null;
  heroSubtitle?: string | null;
  heroBanners?: HeroBanner[];
  customColors: [string, string, string, string];
  setCustomColors: (colors: [string, string, string, string]) => void;
  auroraSpeed: number;
  setAuroraSpeed: (speed: number) => void;
  auroraBlur: number;
  setAuroraBlur: (blur: number) => void;
  auroraComplexity: number;
  setAuroraComplexity: (complexity: number) => void;
  auroraChaos: number;
  setAuroraChaos: (chaos: number) => void;
  auroraSaturation: number;
  setAuroraSaturation: (sat: number) => void;
  auroraGrain: number;
  setAuroraGrain: (grain: number) => void;
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
  heroBanners?: HeroBanner[];
};


export function AppearanceProvider({ children, defaultFont, quranIconUrl, hadithIconUrl, heroImageUrl, heroTitle, heroSubtitle, heroBanners }: AppearanceProviderProps) {
  const { theme, resolvedTheme } = useTheme();
  const activeTheme = !theme || theme === 'system' ? resolvedTheme : theme;
  const lightModeActive = isLightTheme(activeTheme);

  const [font, setFont] = useState(defaultFont || "font-body");
  const [language, setLanguageState] = useState('ar');
  const [background, setBackground] = useState<BackgroundState>({ image: null, color: null, type: 'image' });
  const [isBackgroundShown, setIsBackgroundShown] = useState(true);
  const [gradientPreset, setGradientPresetState] = useState<string>('cinematic-blue');
  const [aiApiKey, setAiApiKeyState] = useState<string | null>(null);
  const [aiModel, setAiModelState] = useState<string>('gemini-4-hydrogen');
  const [showChatbot, setShowChatbotState] = useState<boolean>(true);

  const [customColors, setCustomColorsState] = useState<[string, string, string, string]>(["217 91% 60%", "240 80% 65%", "270 75% 62%", "200 85% 58%"]);
  const [auroraSpeed, setAuroraSpeedState] = useState(1);
  const [auroraBlur, setAuroraBlurState] = useState(1);
  const [auroraComplexity, setAuroraComplexityState] = useState(6);
  const [auroraChaos, setAuroraChaosState] = useState(1);
  const [auroraSaturation, setAuroraSaturationState] = useState(100);
  const [auroraGrain, setAuroraGrainState] = useState(0.03);

  const applyGradientPreset = useCallback((presetValue: string) => {
    const preset = gradientPresets.find(p => p.value === presetValue);
    if (!preset) return;

    const root = document.documentElement;
    root.style.setProperty('--gradient-start', preset.colors[0]);
    root.style.setProperty('--gradient-mid', preset.colors[1]);
    root.style.setProperty('--gradient-end', preset.colors[2]);
    root.style.setProperty('--gradient-extra', preset.colors[3]);
  }, []);

  const setGradientPreset = useCallback((preset: string) => {
    setGradientPresetState(preset);
    localStorage.setItem("site-gradient-preset", preset);
    if (preset !== 'custom') {
      applyGradientPreset(preset);
    } else {
       // Apply custom colors if switching back to custom
       const root = document.documentElement;
       root.style.setProperty('--gradient-start', customColors[0]);
       root.style.setProperty('--gradient-mid', customColors[1]);
       root.style.setProperty('--gradient-end', customColors[2]);
       root.style.setProperty('--gradient-extra', customColors[3]);
    }
  }, [applyGradientPreset, customColors]);

  const setCustomColors = useCallback((colors: [string, string, string, string]) => {
    setCustomColorsState(colors);
    localStorage.setItem("site-custom-colors", JSON.stringify(colors));
    if (gradientPreset === 'custom') {
      const root = document.documentElement;
      root.style.setProperty('--gradient-start', colors[0]);
      root.style.setProperty('--gradient-mid', colors[1]);
      root.style.setProperty('--gradient-end', colors[2]);
      root.style.setProperty('--gradient-extra', colors[3]);
    }
  }, [gradientPreset]);

  const setAuroraSpeed = useCallback((speed: number) => {
    setAuroraSpeedState(speed);
    localStorage.setItem("site-aurora-speed", speed.toString());
    document.documentElement.style.setProperty('--aurora-speed', speed.toString());
  }, []);

  const setAuroraBlur = useCallback((blur: number) => {
    setAuroraBlurState(blur);
    localStorage.setItem("site-aurora-blur", blur.toString());
    document.documentElement.style.setProperty('--aurora-blur', blur.toString());
  }, []);

  const setAuroraComplexity = useCallback((complexity: number) => {
    setAuroraComplexityState(complexity);
    localStorage.setItem("site-aurora-complexity", complexity.toString());
    document.documentElement.style.setProperty('--aurora-complexity', complexity.toString());
  }, []);

  const setAuroraChaos = useCallback((chaos: number) => {
    setAuroraChaosState(chaos);
    localStorage.setItem("site-aurora-chaos", chaos.toString());
    document.documentElement.style.setProperty('--aurora-chaos', chaos.toString());
  }, []);

  const setAuroraSaturation = useCallback((sat: number) => {
    setAuroraSaturationState(sat);
    localStorage.setItem("site-aurora-saturation", sat.toString());
    document.documentElement.style.setProperty('--aurora-saturation', sat.toString());
  }, []);

  const setAuroraGrain = useCallback((grain: number) => {
    setAuroraGrainState(grain);
    localStorage.setItem("site-aurora-grain", grain.toString());
    document.documentElement.style.setProperty('--aurora-grain', grain.toString());
  }, []);

  const applyBackground = useCallback(() => {
    const customBgImage = localStorage.getItem("site-background-image");
    const customBgColor = localStorage.getItem("site-background-color");
    const customBgType = localStorage.getItem("site-background-type") as 'image' | 'pattern' | null;
    const customBgMode = localStorage.getItem("site-background-mode");
    const currentMode = lightModeActive ? 'light' : 'dark';

    const colorConflictsWithMode =
      !!customBgColor &&
      ((lightModeActive && isHexDark(customBgColor)) ||
        (!lightModeActive && !isHexDark(customBgColor)));

    const imageConflictsWithMode =
      !!customBgImage &&
      customBgType !== 'pattern' &&
      (customBgMode ? customBgMode !== currentMode : lightModeActive);

    const effectiveColor = colorConflictsWithMode ? '' : (customBgColor || '');
    const effectiveImage = imageConflictsWithMode ? '' : (customBgImage || '');

    document.body.style.backgroundImage = effectiveImage;
    document.body.style.backgroundColor = effectiveColor;

    if (effectiveImage) {
      if (customBgType === 'pattern') {
        document.body.style.backgroundAttachment = 'scroll';
        document.body.style.backgroundPosition = '0 0';
        document.body.style.backgroundRepeat = 'repeat';
        document.body.style.backgroundSize = 'auto';
      } else {
        document.body.style.backgroundAttachment = 'fixed';
        document.body.style.backgroundPosition = 'center';
        document.body.style.backgroundRepeat = 'no-repeat';
        document.body.style.backgroundSize = 'cover';
      }
    } else {
      document.body.style.backgroundAttachment = '';
      document.body.style.backgroundPosition = '';
      document.body.style.backgroundRepeat = '';
      document.body.style.backgroundSize = '';
    }

    if (effectiveColor) {
      document.body.classList.remove('body-background');
    } else {
      document.body.classList.add('body-background');
    }

    setBackground({
      image: effectiveImage || null,
      color: effectiveColor || null,
      type: customBgType || 'image',
    });
  }, [lightModeActive]);

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

  const handleSetFont = useCallback((newFont: string) => {
    const allFontClasses = fonts.map(f => f.value);
    document.body.classList.remove(...allFontClasses);
    document.body.classList.add(newFont);
    localStorage.setItem("site-font", newFont);
    setFont(newFont);
  }, []);
  
  const applyLanguageAttributes = useCallback((langCode: string) => {
    const dir = langCode === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = langCode;
    document.documentElement.dir = dir;
  }, []);

  const handleSetLanguage = useCallback((newLang: string) => {
    localStorage.setItem("site-language", newLang);
    applyLanguageAttributes(newLang);
    setLanguageState(newLang);
  }, [applyLanguageAttributes]);

  const setAiApiKey = useCallback((key: string | null) => {
    if (key) {
        localStorage.setItem("site-ai-api-key", key);
    } else {
        localStorage.removeItem("site-ai-api-key");
    }
    setAiApiKeyState(key);
  }, []);

  const setAiModel = useCallback((model: string) => {
    localStorage.setItem("site-ai-model", model);
    setAiModelState(model);
  }, []);

  const setShowChatbot = useCallback((show: boolean) => {
    localStorage.setItem("site-show-chatbot", show ? "true" : "false");
    setShowChatbotState(show);
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

      if (newBg?.image || newBg?.color) {
        const bgMode = newBg.type === 'pattern'
          ? 'any'
          : (newBg.color ? (isHexDark(newBg.color) ? 'dark' : 'light') : (lightModeActive ? 'light' : 'dark'));
        localStorage.setItem("site-background-mode", bgMode);
      } else {
        localStorage.removeItem("site-background-mode");
      }


    if (!isBackgroundShown && (newBg?.image || newBg?.color)) {
        toggleBackground(true);
    } else if (isBackgroundShown) {
        applyBackground();
    }
  }, [isBackgroundShown, lightModeActive, toggleBackground, applyBackground]);

  useEffect(() => {
    const allFontClasses = fonts.map(f => f.value);
    const storedFont = localStorage.getItem("site-font");
    const initialFont = storedFont || defaultFont || 'font-body';
    
    document.body.classList.remove(...allFontClasses);
    document.body.classList.add(initialFont);
    setFont(initialFont);

    const storedLang = localStorage.getItem("site-language");
    const initialLang = storedLang || 'ar';
    applyLanguageAttributes(initialLang);
    setLanguageState(initialLang);

    const storedApiKey = localStorage.getItem("site-ai-api-key");
    setAiApiKeyState(storedApiKey);

    const storedModel = localStorage.getItem("site-ai-model");
    if (storedModel && storedModel !== 'gemini-2.5-flash' && storedModel !== 'gemini-3.8-flash') {
      setAiModelState(storedModel);
    } else {
      setAiModelState('gemini-4-hydrogen');
      localStorage.setItem("site-ai-model", 'gemini-4-hydrogen');
    }

    const storedShowChatbot = localStorage.getItem("site-show-chatbot");
    if (storedShowChatbot !== null) {
      setShowChatbotState(storedShowChatbot === "true");
    } else {
      setShowChatbotState(true);
    }

    const storedIsShown = localStorage.getItem("site-background-shown");
    const show = storedIsShown !== "false";
    
    setIsBackgroundShown(show);

    const storedGradient = localStorage.getItem("site-gradient-preset");
    if (storedGradient) {
      setGradientPresetState(storedGradient);
      applyGradientPreset(storedGradient);
    }

    const storedCustomColors = localStorage.getItem("site-custom-colors");
    if (storedCustomColors) {
      try {
        const colors = JSON.parse(storedCustomColors);
        setCustomColorsState(colors);
        if (storedGradient === 'custom') {
          const root = document.documentElement;
          root.style.setProperty('--gradient-start', colors[0]);
          root.style.setProperty('--gradient-mid', colors[1]);
          root.style.setProperty('--gradient-end', colors[2]);
          root.style.setProperty('--gradient-extra', colors[3]);
        }
      } catch (e) {}
    }

    const storedSpeed = localStorage.getItem("site-aurora-speed");
    if (storedSpeed) {
      const s = parseFloat(storedSpeed);
      setAuroraSpeedState(s);
      document.documentElement.style.setProperty('--aurora-speed', s.toString());
    }

    const storedBlur = localStorage.getItem("site-aurora-blur");
    if (storedBlur) {
      const b = parseFloat(storedBlur);
      setAuroraBlurState(b);
      document.documentElement.style.setProperty('--aurora-blur', b.toString());
    }

    const storedComplexity = localStorage.getItem("site-aurora-complexity");
    if (storedComplexity) {
      const c = parseInt(storedComplexity);
      setAuroraComplexityState(c);
      document.documentElement.style.setProperty('--aurora-complexity', c.toString());
    }

    const storedChaos = localStorage.getItem("site-aurora-chaos");
    if (storedChaos) {
      const c = parseFloat(storedChaos);
      setAuroraChaosState(c);
      document.documentElement.style.setProperty('--aurora-chaos', c.toString());
    }

    const storedSat = localStorage.getItem("site-aurora-saturation");
    if (storedSat) {
      const s = parseFloat(storedSat);
      setAuroraSaturationState(s);
      document.documentElement.style.setProperty('--aurora-saturation', s.toString());
    }

    const storedGrain = localStorage.getItem("site-aurora-grain");
    if (storedGrain) {
      const g = parseFloat(storedGrain);
      setAuroraGrainState(g);
      document.documentElement.style.setProperty('--aurora-grain', g.toString());
    }
  }, [defaultFont, applyGradientPreset, applyLanguageAttributes]);

  useEffect(() => {
    if (isBackgroundShown) {
      applyBackground();
    } else {
      clearBackgroundStyles();
    }
  }, [isBackgroundShown, applyBackground, clearBackgroundStyles]);

  const value = {
    font,
    setFont: handleSetFont,
    language,
    setLanguage: handleSetLanguage,
    background,
    setBackground: handleSetBackground,
    isBackgroundShown,
    toggleBackground,
    gradientPreset,
    setGradientPreset,
    aiApiKey,
    setAiApiKey,
    aiModel,
    setAiModel,
    showChatbot,
    setShowChatbot,
    quranIconUrl,
    hadithIconUrl,
    heroImageUrl,
    heroTitle,
    heroSubtitle,
    heroBanners,
    customColors,
    setCustomColors,
    auroraSpeed,
    setAuroraSpeed,
    auroraBlur,
    setAuroraBlur,
    auroraComplexity,
    setAuroraComplexity,
    auroraChaos,
    setAuroraChaos,
    auroraSaturation,
    setAuroraSaturation,
    auroraGrain,
    setAuroraGrain
  };

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

    
