
"use client"

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { fonts } from "./font-switcher";
import { HeroBanner } from "@/lib/types";

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

export type BackgroundEffect = 'none' | 'particles' | 'liquid-image';

export const liquidImagePresets = {
  images: [
    {
      name: 'المسجد الأقصى - القدس',
      src: '/palestine_gallery_jerusalem_old_city.png',
      alt: 'القدس القديمة ومسجد قبة الصخرة'
    },
    {
      name: 'غروب الشمس في غزة',
      src: '/palestine_gallery_gaza_sunset.png',
      alt: 'غروب الشمس الجميل على ساحل غزة'
    },
    {
      name: 'مسجد المدينة المنورة القديم',
      src: '/madinah_early_mosque_cinematic_1777413331481.png',
      alt: 'رسم سينمائي للمسجد النبوي في المدينة المنورة'
    },
    {
      name: 'أشجار الزيتون الفلسطينية',
      src: '/palestine_landscape_olive_trees.png',
      alt: 'شجر الزيتون المبارك في تلال فلسطين'
    },
    {
      name: 'نقوش هندسية إسلامية ذهبية',
      src: '/islamic_geometric_pattern_gold_cinematic_1777414372644.png',
      alt: 'فن الزخرفة الإسلامية باللون الذهبي'
    }
  ],
  videos: [
    {
      name: 'تموجات الألوان التجريدية',
      src: 'https://framerusercontent.com/assets/MLWPbW1dUQawJLhhun3dBwpgJak.mp4'
    },
    {
      name: 'حبر سائل متدفق',
      src: 'https://assets.mixkit.co/videos/preview/mixkit-liquid-ink-swirling-underwater-43187-large.mp4'
    }
  ]
};

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
  liquidImageSourceType: 'image' | 'video';
  setLiquidImageSourceType: (type: 'image' | 'video') => void;
  liquidImageImage: string;
  setLiquidImageImage: (image: string) => void;
  liquidImageVideo: string;
  setLiquidImageVideo: (video: string) => void;
  liquidImageStrength: number;
  setLiquidImageStrength: (strength: number) => void;
  liquidImageSpeed: number;
  setLiquidImageSpeed: (speed: number) => void;
  gradientPreset: string;
  setGradientPreset: (preset: string) => void;
  particleColor: string;
  setParticleColor: (color: string) => void;
  particleSettings: ParticleSettings;
  setParticleSettings: (settings: Partial<ParticleSettings>) => void;
  aiApiKey: string | null;
  setAiApiKey: (key: string | null) => void;
  aiModel: string;
  setAiModel: (model: string) => void;
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
  const [font, setFont] = useState(defaultFont || "font-body");
  const [language, setLanguageState] = useState('ar');
  const [background, setBackground] = useState<BackgroundState>({ image: null, color: null, type: 'image' });
  const [isBackgroundShown, setIsBackgroundShown] = useState(true);
  const [backgroundEffect, setBackgroundEffectState] = useState<BackgroundEffect>('none');
  const [gradientPreset, setGradientPresetState] = useState<string>('cinematic-blue');
  const [particleColor, setParticleColor] = useState('#FFFFFF');
  const [aiApiKey, setAiApiKeyState] = useState<string | null>(null);
  const [aiModel, setAiModelState] = useState<string>('gemini-2.5-flash');
  
  const [particleSettings, setParticleSettingsState] = useState<ParticleSettings>({
    interaction: true,
    count: 80,
    speed: 0.3,
    lineDistance: 120,
  });

  const [customColors, setCustomColorsState] = useState<[string, string, string, string]>(["217 91% 60%", "240 80% 65%", "270 75% 62%", "200 85% 58%"]);
  const [auroraSpeed, setAuroraSpeedState] = useState(1);
  const [auroraBlur, setAuroraBlurState] = useState(1);
  const [auroraComplexity, setAuroraComplexityState] = useState(6);
  const [auroraChaos, setAuroraChaosState] = useState(1);
  const [auroraSaturation, setAuroraSaturationState] = useState(100);
  const [auroraGrain, setAuroraGrainState] = useState(0.03);

  const [liquidImageSourceType, setLiquidImageSourceTypeState] = useState<'image' | 'video'>('image');
  const [liquidImageImage, setLiquidImageImageState] = useState<string>('/palestine_gallery_jerusalem_old_city.png');
  const [liquidImageVideo, setLiquidImageVideoState] = useState<string>('https://framerusercontent.com/assets/MLWPbW1dUQawJLhhun3dBwpgJak.mp4');
  const [liquidImageStrength, setLiquidImageStrengthState] = useState<number>(0.12);
  const [liquidImageSpeed, setLiquidImageSpeedState] = useState<number>(0.15);

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

  const setLiquidImageSourceType = useCallback((type: 'image' | 'video') => {
    setLiquidImageSourceTypeState(type);
    localStorage.setItem("site-liquid-image-source-type", type);
  }, []);

  const setLiquidImageImage = useCallback((image: string) => {
    setLiquidImageImageState(image);
    localStorage.setItem("site-liquid-image-image", image);
  }, []);

  const setLiquidImageVideo = useCallback((video: string) => {
    setLiquidImageVideoState(video);
    localStorage.setItem("site-liquid-image-video", video);
  }, []);

  const setLiquidImageStrength = useCallback((strength: number) => {
    setLiquidImageStrengthState(strength);
    localStorage.setItem("site-liquid-image-strength", strength.toString());
  }, []);

  const setLiquidImageSpeed = useCallback((speed: number) => {
    setLiquidImageSpeedState(speed);
    localStorage.setItem("site-liquid-image-speed", speed.toString());
  }, []);

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

    const storedApiKey = localStorage.getItem("site-ai-api-key");
    setAiApiKeyState(storedApiKey);

    const storedModel = localStorage.getItem("site-ai-model");
    if (storedModel) {
      setAiModelState(storedModel);
    }

    const storedIsShown = localStorage.getItem("site-background-shown");
    const show = storedIsShown !== "false";
    
    setIsBackgroundShown(show);
    if (show) {
      applyBackground();
    } else {
      clearBackgroundStyles();
    }
    
    const storedEffect = localStorage.getItem("site-background-effect") as BackgroundEffect | null;
    if (storedEffect && ['none', 'particles', 'liquid-image'].includes(storedEffect)) {
      setBackgroundEffectState(storedEffect);
    } else {
        setBackgroundEffectState('none');
    }

    const storedLiquidSourceType = localStorage.getItem("site-liquid-image-source-type") as 'image' | 'video' | null;
    if (storedLiquidSourceType) {
      setLiquidImageSourceTypeState(storedLiquidSourceType);
    }

    const storedLiquidImage = localStorage.getItem("site-liquid-image-image");
    if (storedLiquidImage) {
      setLiquidImageImageState(storedLiquidImage);
    }

    const storedLiquidVideo = localStorage.getItem("site-liquid-image-video");
    if (storedLiquidVideo) {
      setLiquidImageVideoState(storedLiquidVideo);
    }

    const storedLiquidStrength = localStorage.getItem("site-liquid-image-strength");
    if (storedLiquidStrength) {
      setLiquidImageStrengthState(parseFloat(storedLiquidStrength));
    }

    const storedLiquidSpeed = localStorage.getItem("site-liquid-image-speed");
    if (storedLiquidSpeed) {
      setLiquidImageSpeedState(parseFloat(storedLiquidSpeed));
    }

    const storedGradient = localStorage.getItem("site-gradient-preset");
    if (storedGradient) {
      setGradientPresetState(storedGradient);
      applyGradientPreset(storedGradient);
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
  }, [defaultFont, applyBackground, clearBackgroundStyles, applyGradientPreset]);

  const value = {
    font,
    setFont: handleSetFont,
    language,
    setLanguage: handleSetLanguage,
    background,
    setBackground: handleSetBackground,
    isBackgroundShown,
    toggleBackground,
    backgroundEffect,
    setBackgroundEffect,
    gradientPreset,
    setGradientPreset,
    particleColor,
    setParticleColor: handleSetParticleColor,
    particleSettings,
    setParticleSettings,
    aiApiKey,
    setAiApiKey,
    aiModel,
    setAiModel,
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
    setAuroraGrain,
    liquidImageSourceType,
    setLiquidImageSourceType,
    liquidImageImage,
    setLiquidImageImage,
    liquidImageVideo,
    setLiquidImageVideo,
    liquidImageStrength,
    setLiquidImageStrength,
    liquidImageSpeed,
    setLiquidImageSpeed
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

    
