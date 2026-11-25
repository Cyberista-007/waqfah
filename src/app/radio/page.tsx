'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Radio as RadioIcon,
  Search,
  Heart,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Moon,
  Sparkles,
  Share2,
  Activity,
  Plus,
  Mic,
  RefreshCw,
  Flame,
  Compass,
  Headphones,
  Maximize2,
  Minimize2,
  SkipForward,
  SkipBack,
  Bell,
  BellRing,
  Shuffle,
  History,
  BookOpen,
  Waves,
  Square,
  Globe,
  ShieldCheck,
  X,
  Trash2,
  ChevronDown,
  SlidersHorizontal
} from 'lucide-react';
import { useQuranRadio } from '@/hooks/quran/use-quran-radio';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn, normalizeArabic } from '@/lib/utils';
import { RadioStation } from '@/components/radio-provider';

const CATEGORIES = [
  { id: 'all', label: 'جميع الإذاعات', icon: RadioIcon },
  { id: 'reciters', label: 'كبار القراء', icon: Headphones },
  { id: 'popular', label: 'الإذاعات الكبرى', icon: Flame },
  { id: 'cairo', label: 'القاهرة ومصر', icon: Compass },
  { id: 'haramain', label: 'الحرمين الشريفين', icon: Compass },
  { id: 'gulf', label: 'الخليج والعالم', icon: Globe },
  { id: 'adhkar', label: 'الأذكار والتفسير', icon: ShieldCheck },
  { id: 'imported', label: 'دروس وقفة', icon: BookOpen },
  { id: 'favorites', label: 'المفضلة', icon: Heart },
  { id: 'custom', label: 'إذاعاتي الخاصة', icon: Plus },
];

const AMBIENT_SOUNDS = [
  { id: 'rain', label: 'مطر خفيف', icon: '🌧️', src: 'https://cdn.pixabay.com/download/audio/2022/05/16/audio_db6591201e.mp3?filename=gentle-rain-16274.mp3' },
  { id: 'birds', label: 'عصافير الفجر', icon: '🕊️', src: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_bb630cc098.mp3?filename=birds-in-the-forest-24189.mp3' },
  { id: 'night', label: 'هدوء الليل', icon: '🌌', src: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=night-ambience-17064.mp3' },
  { id: 'waves', label: 'أمواج البحر', icon: '🌊', src: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c3527e30ec.mp3?filename=sea-waves-112906.mp3' },
];

const RECITER_KEYWORDS = [
  'عبدالباسط', 'عبد الباسط', 'المنشاوي', 'الحصري', 'البنا', 'الطبلاوي',
  'العفاسي', 'المعيقلي', 'الشريم', 'السديس', 'الغامدي', 'العجمي',
  'الدوسري', 'القطامي', 'الحذيفي', 'ماهر', 'فارس عباد', 'إدريس أبكر'
];

const STATIONS_PAGE_SIZE = 24;

export default function RadioPage() {
  const { toast } = useToast();
  const {
    currentStation,
    isPlayingRadio,
    isRadioBuffering,
    radioVolume,
    setRadioVolume,
    handlePlayRadio,
    handleToggleRadio,
    stopRadio,
    radioStations,
    isLoadingRadios,
    favoriteRadioIds,
    toggleFavoriteRadio,
    customRadioStations,
    setCustomRadioStations,
    handleAddCustomRadio,
    importedRadioStations,
    canvasRef,
    visualizerStyle,
    setVisualizerStyle,
    startRecording,
    stopRecording,
    isRecording,
    recordingDuration,
    listeningMinutes,
    handleNextStation,
    handlePrevStation,
    alarmTime,
    isAlarmEnabled,
    toggleAlarm,
    alarmStationId,
    radioHistory,
    setIsAmbientScreenSaver,
  } = useQuranRadio();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [visibleCount, setVisibleCount] = useState(STATIONS_PAGE_SIZE);

  // Sleep Timer States
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState<number | null>(null);
  const [isTimerDialogOpen, setIsTimerDialogOpen] = useState(false);

  // Alarm Dialog State
  const [isAlarmDialogOpen, setIsAlarmDialogOpen] = useState(false);
  const [inputAlarmTime, setInputAlarmTime] = useState(alarmTime || '05:00');
  const [selectedAlarmStation, setSelectedAlarmStation] = useState<string>(alarmStationId || '');

  // Fullscreen / Zen Screensaver State
  const [isZenMode, setIsZenMode] = useState(false);
  const [zenTime, setZenTime] = useState('');

  // Ambient Sound States
  const [activeAmbient, setActiveAmbient] = useState<string | null>(null);
  const [ambientVolume, setAmbientVolume] = useState(0.4);
  const [showAmbientMixer, setShowAmbientMixer] = useState(false);
  const ambientAudioRef = useRef<HTMLAudioElement | null>(null);
  const radioVolumeRef = useRef(radioVolume);

  // Custom radio dialog states
  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const [newStationName, setNewStationName] = useState('');
  const [newStationUrl, setNewStationUrl] = useState('');
  const [newStationIcon, setNewStationIcon] = useState('📻');

  useEffect(() => {
    radioVolumeRef.current = radioVolume;
  }, [radioVolume]);

  useEffect(() => {
    setInputAlarmTime(alarmTime || '05:00');
  }, [alarmTime]);

  // Sync Zen Mode state so visualizer canvas re-attaches cleanly on exit
  useEffect(() => {
    setIsAmbientScreenSaver(isZenMode);
  }, [isZenMode, setIsAmbientScreenSaver]);

  // Cleanup ambient audio on unmount
  useEffect(() => {
    return () => {
      if (ambientAudioRef.current) {
        ambientAudioRef.current.pause();
        ambientAudioRef.current.src = '';
        ambientAudioRef.current = null;
      }
    };
  }, []);

  // Sync ambient volume live
  useEffect(() => {
    if (ambientAudioRef.current) {
      ambientAudioRef.current.volume = ambientVolume;
    }
  }, [ambientVolume]);

  // Live Zen Clock
  useEffect(() => {
    if (!isZenMode) return;
    const updateTime = () => {
      const now = new Date();
      setZenTime(now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [isZenMode]);

  // Stable sleep timer countdown (does not recreate interval every second)
  const isTimerActive = sleepTimerRemaining !== null && sleepTimerRemaining > 0;
  useEffect(() => {
    if (!isTimerActive) return;

    const interval = setInterval(() => {
      setSleepTimerRemaining(prev => {
        if (prev === null) return null;
        if (prev <= 1) {
          stopRadio();
          if (ambientAudioRef.current) {
            ambientAudioRef.current.pause();
            setActiveAmbient(null);
          }
          toast({
            title: 'تم إيقاف الإذاعة',
            description: 'انتهى مؤقت النوم المجدول وتم إيقاف الصوت بنجاح.',
          });
          return null;
        }
        if (prev <= 120 && prev % 20 === 0) {
          setRadioVolume(Math.max(0.1, radioVolumeRef.current * 0.8));
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerActive, stopRadio, setRadioVolume, toast]);

  const setSleepTimer = (minutes: number | null) => {
    setSleepTimerRemaining(minutes ? minutes * 60 : null);
    setIsTimerDialogOpen(false);
    if (minutes) {
      toast({
        title: `تم ضبط مؤقت النوم على ${minutes} دقيقة`,
        description: 'سيتم خفض الصوت تدريجياً وإيقاف البث تلقائياً.',
      });
    } else {
      toast({ title: 'تم إلغاء مؤقت النوم' });
    }
  };

  const toggleAmbient = (ambientId: string) => {
    if (activeAmbient === ambientId) {
      if (ambientAudioRef.current) {
        ambientAudioRef.current.pause();
      }
      setActiveAmbient(null);
    } else {
      const sound = AMBIENT_SOUNDS.find(s => s.id === ambientId);
      if (sound) {
        if (!ambientAudioRef.current) {
          ambientAudioRef.current = new Audio();
          ambientAudioRef.current.loop = true;
        }
        ambientAudioRef.current.src = sound.src;
        ambientAudioRef.current.volume = ambientVolume;
        ambientAudioRef.current.play().catch(e => console.warn('Ambient play err:', e));
        setActiveAmbient(ambientId);
      }
    }
  };

  // Reset pagination when filter or search changes
  useEffect(() => {
    setVisibleCount(STATIONS_PAGE_SIZE);
  }, [selectedCategory, searchQuery]);

  const allStations = useMemo(
    () => [...customRadioStations, ...importedRadioStations, ...radioStations],
    [customRadioStations, importedRadioStations, radioStations]
  );

  const filteredStations = useMemo(() => {
    let list = allStations;

    if (selectedCategory === 'favorites') {
      list = list.filter(s => favoriteRadioIds.includes(s.id));
    } else if (selectedCategory === 'custom') {
      list = list.filter(s => s.id.startsWith('custom_'));
    } else if (selectedCategory === 'imported') {
      list = list.filter(s => s.id.startsWith('imported_') || s.subtitle?.includes('محاضرة'));
    } else if (selectedCategory === 'popular') {
      list = list.filter(s =>
        s.name.includes('القاهرة') ||
        s.name.includes('مكة') ||
        s.name.includes('السعودية') ||
        s.name.includes('الرياض') ||
        s.name.includes('زايد') ||
        s.name.includes('العامة')
      );
    } else if (selectedCategory === 'cairo') {
      list = list.filter(s => s.name.includes('القاهرة') || s.name.includes('مصر'));
    } else if (selectedCategory === 'haramain') {
      list = list.filter(s => s.name.includes('الحرم') || s.name.includes('مكة') || s.name.includes('المدينة') || s.name.includes('السعودية'));
    } else if (selectedCategory === 'gulf') {
      list = list.filter(s =>
        s.name.includes('الرياض') ||
        s.name.includes('زايد') ||
        s.name.includes('دبي') ||
        s.name.includes('الشارقة') ||
        s.name.includes('الكويت') ||
        s.name.includes('عمان') ||
        s.name.includes('قطر') ||
        s.name.includes('البحرين')
      );
    } else if (selectedCategory === 'adhkar') {
      list = list.filter(s => s.name.includes('أذكار') || s.name.includes('الرقية') || s.name.includes('تفسير') || s.name.includes('فتوى') || s.name.includes('الفتاوى'));
    } else if (selectedCategory === 'reciters') {
      list = list.filter(s => RECITER_KEYWORDS.some(kw => s.name.includes(kw)));
    }

    if (searchQuery.trim()) {
      const q = normalizeArabic(searchQuery.toLowerCase().trim());
      list = list.filter(s => {
        const nameNorm = normalizeArabic(s.name.toLowerCase());
        const subNorm = s.subtitle ? normalizeArabic(s.subtitle.toLowerCase()) : '';
        return nameNorm.includes(q) || subNorm.includes(q);
      });
    }

    return list;
  }, [allStations, selectedCategory, searchQuery, favoriteRadioIds]);

  const displayedStations = useMemo(
    () => filteredStations.slice(0, visibleCount),
    [filteredStations, visibleCount]
  );

  const recentStations = useMemo(() => {
    return radioHistory
      .map(id => allStations.find(s => s.id === id))
      .filter(Boolean) as RadioStation[];
  }, [radioHistory, allStations]);

  const handlePlayRandom = () => {
    const pool = filteredStations.length > 0 ? filteredStations : allStations;
    if (pool.length === 0) return;
    const randomStation = pool[Math.floor(Math.random() * pool.length)];
    handlePlayRadio(randomStation);
    toast({
      title: 'تم اختيار إذاعة عشوائية',
      description: `تستمع الآن إلى: ${randomStation.name}`,
    });
  };

  const handleShareStation = (station: RadioStation, e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: station.name,
        text: `استمع الآن إلى ${station.name} عبر منصة وقفة`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: 'تم نسخ الرابط بنجاح!' });
    }
  };

  const handleDeleteCustomStation = (stationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCustomRadioStations(prev => {
      const next = prev.filter(s => s.id !== stationId);
      localStorage.setItem('quran_custom_radios', JSON.stringify(next));
      return next;
    });
    if (currentStation?.id === stationId) {
      stopRadio();
    }
    toast({ title: 'تم حذف الإذاعة المخصصة' });
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const renderStationIcon = (icon?: string) => {
    if (icon && (icon.startsWith('http://') || icon.startsWith('https://'))) {
      return <img src={icon} alt="" className="w-full h-full object-cover" />;
    }
    return <span>{icon || '📻'}</span>;
  };

  return (
    <div className="min-h-screen pb-28 space-y-8" dir="rtl">
      {/* ── Zen / Fullscreen Screensaver Modal ── */}
      <AnimatePresence>
        {isZenMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-zinc-950 flex flex-col items-center justify-between p-6 sm:p-12 overflow-hidden select-none"
          >
            <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
              <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[650px] h-[650px] bg-primary/15 blur-[160px] rounded-full animate-pulse" />
            </div>

            <div className="w-full max-w-5xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-sm font-bold text-primary">وضع السكينة والاسترخاء</span>
              </div>

              <span className="text-xl sm:text-2xl font-mono font-bold text-white/85">{zenTime}</span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsZenMode(false)}
                className="rounded-2xl border-white/15 bg-white/5 hover:bg-white/15 text-white gap-2 cursor-pointer"
              >
                <Minimize2 className="w-4 h-4" />
                <span>إغلاق</span>
              </Button>
            </div>

            <div className="flex flex-col items-center text-center space-y-7 max-w-2xl my-auto">
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-br from-primary/25 to-primary/5 border border-primary/40 flex items-center justify-center text-5xl sm:text-6xl shadow-2xl shadow-primary/20 overflow-hidden">
                {renderStationIcon(currentStation?.icon)}
              </div>

              <div className="space-y-2">
                <h2 className="text-3xl sm:text-5xl font-black font-headline text-white tracking-tight">
                  {currentStation?.name || 'إذاعة القرآن الكريم'}
                </h2>
                <p className="text-base sm:text-lg text-primary/90 font-medium">
                  {currentStation?.subtitle || 'بث مباشر متواصل 24/7'}
                </p>
                <p className="text-sm sm:text-base text-white/60 pt-2 font-quran">
                  ﴿ أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ ﴾
                </p>
              </div>

              <div className="w-full max-w-md h-24 rounded-3xl bg-black/50 border border-white/10 p-3 overflow-hidden flex items-center justify-center backdrop-blur-md">
                <canvas ref={isZenMode ? canvasRef : null} className="w-full h-full" />
              </div>

              <div className="flex items-center gap-6">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => handlePrevStation(filteredStations)}
                  className="rounded-full w-12 h-12 border-white/15 text-white/80 hover:text-white bg-white/5 cursor-pointer"
                  aria-label="الإذاعة السابقة"
                >
                  <SkipBack className="w-5 h-5" />
                </Button>

                <Button
                  onClick={handleToggleRadio}
                  className="rounded-full w-20 h-20 bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/30 scale-105 transition-transform cursor-pointer"
                  aria-label={isPlayingRadio ? 'إيقاف' : 'تشغيل'}
                >
                  {isRadioBuffering ? (
                    <RefreshCw className="w-8 h-8 animate-spin" />
                  ) : isPlayingRadio ? (
                    <Pause className="w-8 h-8 fill-current" />
                  ) : (
                    <Play className="w-8 h-8 fill-current ms-1" />
                  )}
                </Button>

                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => handleNextStation(filteredStations)}
                  className="rounded-full w-12 h-12 border-white/15 text-white/80 hover:text-white bg-white/5 cursor-pointer"
                  aria-label="الإذاعة التالية"
                >
                  <SkipForward className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div className="w-full max-w-md flex flex-wrap items-center justify-center gap-2">
              {AMBIENT_SOUNDS.map(sound => (
                <Button
                  key={sound.id}
                  size="sm"
                  variant="outline"
                  onClick={() => toggleAmbient(sound.id)}
                  className={cn(
                    "rounded-xl text-xs gap-1.5 transition-all cursor-pointer",
                    activeAmbient === sound.id
                      ? "bg-primary/20 border-primary/50 text-primary font-bold"
                      : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                  )}
                >
                  <span>{sound.icon}</span>
                  <span>{sound.label}</span>
                </Button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Compact Studio Header & Quick Tools ── */}
      <section className="container px-4 max-w-6xl mx-auto pt-4">
        <div className="page-hero-banner p-6 sm:p-8 md:p-10 relative">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-primary/15 blur-[120px] rounded-full pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6 text-center lg:text-right">
            <div className="space-y-3 max-w-2xl">
              <div className="luxury-badge luxury-badge-primary inline-flex">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>بث قرآني مباشر 24/7 • {allStations.length} إذاعة</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black font-headline tracking-tight text-white">
                أثير <span className="text-primary">السكينة والقرآن</span>
              </h1>

              <p className="text-sm sm:text-base text-white/70 font-medium leading-relaxed">
                استمع لأشهر إذاعات العالم الإسلامي وكبار القراء، مع مؤقت نوم، منبه الفجر، ومزج الأصوات الطبيعية الهادئة.
              </p>
            </div>

            {/* Quick Tools & Daily Stats */}
            <div className="flex flex-col items-center lg:items-end gap-3 shrink-0 w-full lg:w-auto">
              <div className="flex flex-wrap items-center justify-center lg:justify-end gap-2">
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white/85 text-xs font-bold">
                  <Activity className="w-4 h-4 text-primary" />
                  <span>اليوم: {listeningMinutes} دقيقة</span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePlayRandom}
                  className="rounded-xl border-white/10 bg-white/5 text-white/85 hover:bg-white/10 text-xs gap-1.5 h-9 cursor-pointer"
                >
                  <Shuffle className="w-3.5 h-3.5 text-primary" />
                  <span>عشوائي</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsZenMode(true)}
                  className="rounded-xl border-white/10 bg-white/5 text-white/85 hover:bg-white/10 text-xs gap-1.5 h-9 cursor-pointer"
                >
                  <Maximize2 className="w-3.5 h-3.5 text-primary" />
                  <span>شاشة السكينة</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setIsTimerDialogOpen(!isTimerDialogOpen); setIsAlarmDialogOpen(false); }}
                  className={cn(
                    "rounded-xl border-white/10 text-xs gap-1.5 h-9 transition-all cursor-pointer",
                    sleepTimerRemaining ? "bg-amber-500/20 border-amber-500/40 text-amber-300 font-bold" : "bg-white/5 text-white/85 hover:bg-white/10"
                  )}
                >
                  <Moon className="w-3.5 h-3.5" />
                  <span>
                    {sleepTimerRemaining
                      ? `${Math.floor(sleepTimerRemaining / 60)}:${String(sleepTimerRemaining % 60).padStart(2, '0')}`
                      : 'مؤقت النوم'}
                  </span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setIsAlarmDialogOpen(!isAlarmDialogOpen); setIsTimerDialogOpen(false); }}
                  className={cn(
                    "rounded-xl border-white/10 text-xs gap-1.5 h-9 transition-all cursor-pointer",
                    isAlarmEnabled ? "bg-primary/20 border-primary/40 text-primary font-bold" : "bg-white/5 text-white/85 hover:bg-white/10"
                  )}
                >
                  {isAlarmEnabled ? <BellRing className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5" />}
                  <span>{isAlarmEnabled ? `منبه ${alarmTime}` : 'منبه'}</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Inline Sleep Timer & Alarm Panels */}
          <AnimatePresence>
            {isTimerDialogOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mt-6 p-4 rounded-2xl bg-black/50 border border-white/10 flex flex-wrap items-center justify-between gap-3"
              >
                <span className="text-xs font-bold text-white/80">إيقاف البث تلقائياً بعد:</span>
                <div className="flex flex-wrap items-center gap-2">
                  {[15, 30, 45, 60, 90, 120].map(mins => (
                    <Button
                      key={mins}
                      size="sm"
                      variant="outline"
                      onClick={() => setSleepTimer(mins)}
                      className="rounded-xl border-white/15 bg-white/5 hover:bg-primary/20 hover:text-primary text-xs cursor-pointer"
                    >
                      {mins} دقيقة
                    </Button>
                  ))}
                  {sleepTimerRemaining && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setSleepTimer(null)}
                      className="rounded-xl text-xs cursor-pointer"
                    >
                      إلغاء المؤقت
                    </Button>
                  )}
                </div>
              </motion.div>
            )}

            {isAlarmDialogOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mt-6 p-5 rounded-2xl bg-black/50 border border-white/10 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <BellRing className="w-4 h-4 text-primary" />
                    <span>منبه الاستيقاظ على الإذاعة</span>
                  </h4>
                  <button onClick={() => setIsAlarmDialogOpen(false)} className="text-white/50 hover:text-white cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                  <div>
                    <label className="text-xs text-white/70 font-semibold mb-1.5 block">وقت التشغيل:</label>
                    <Input
                      type="time"
                      value={inputAlarmTime}
                      onChange={(e) => setInputAlarmTime(e.target.value)}
                      className="rounded-xl bg-zinc-950 border-white/15 text-white font-mono text-center h-10"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/70 font-semibold mb-1.5 block">الإذاعة:</label>
                    <select
                      value={selectedAlarmStation || currentStation?.id || ''}
                      onChange={(e) => setSelectedAlarmStation(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-zinc-950 border border-white/15 text-white text-xs"
                    >
                      <option value="">(الإذاعة الحالية أو الأولى)</option>
                      {radioStations.slice(0, 30).map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    {isAlarmEnabled && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          toggleAlarm(false);
                          setIsAlarmDialogOpen(false);
                          toast({ title: 'تم تعطيل المنبه' });
                        }}
                        className="rounded-xl h-10 text-xs cursor-pointer"
                      >
                        تعطيل
                      </Button>
                    )}
                    <Button
                      size="sm"
                      onClick={() => {
                        toggleAlarm(true, inputAlarmTime, selectedAlarmStation || currentStation?.id);
                        setIsAlarmDialogOpen(false);
                        toast({
                          title: 'تم تفعيل المنبه بنجاح',
                          description: `سيتم تشغيل الإذاعة تلقائياً في الساعة ${inputAlarmTime}`,
                        });
                      }}
                      className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs h-10 flex-1 cursor-pointer"
                    >
                      حفظ وتفعيل
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ── Always-Available Studio Player Deck ── */}
      <section className="container px-4 max-w-6xl mx-auto">
        <div className="luxury-glass rounded-[2rem] p-5 sm:p-7 border border-white/10 relative overflow-hidden space-y-5">
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-primary/15 blur-[100px] rounded-full pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
            {/* Station Info */}
            <div className="lg:col-span-5 flex items-center gap-4">
              <div className={cn(
                "w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border flex items-center justify-center text-3xl sm:text-4xl shrink-0 overflow-hidden transition-all",
                currentStation ? "bg-primary/15 border-primary/35 shadow-lg shadow-primary/10" : "bg-white/5 border-white/10"
              )}>
                {currentStation ? renderStationIcon(currentStation.icon) : <RadioIcon className="w-8 h-8 text-primary" />}
              </div>

              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-primary/15 border-primary/30 text-primary text-[10px] px-2.5 py-0.5 font-bold">
                    <span className={cn("w-1.5 h-1.5 rounded-full me-1.5", isPlayingRadio ? "bg-emerald-400 animate-ping" : "bg-primary")} />
                    {currentStation ? (isPlayingRadio ? 'يبث الآن' : 'متوقف مؤقتاً') : 'جاهز للتشغيل'}
                  </Badge>
                </div>
                <h2 className="text-lg sm:text-2xl font-black font-headline text-white truncate">
                  {currentStation ? currentStation.name : 'اختر إذاعة من القائمة'}
                </h2>
                <p className="text-xs text-white/60 truncate font-medium">
                  {currentStation?.subtitle || 'انقر على أي محطة بالأسفل أو اضغط تشغيل للبدء فوراً'}
                </p>
              </div>
            </div>

            {/* Visualizer Canvas */}
            <div className="lg:col-span-4 flex flex-col items-center gap-2">
              <div className="w-full h-14 rounded-2xl bg-black/50 border border-white/10 p-1.5 overflow-hidden flex items-center justify-center">
                <canvas ref={!isZenMode ? canvasRef : null} className="w-full h-full" />
              </div>
              <div className="flex items-center gap-1.5">
                {(['columns', 'waves', 'particles'] as const).map(style => (
                  <button
                    key={style}
                    onClick={() => setVisualizerStyle(style)}
                    className={cn(
                      "text-[10px] px-3 py-0.5 rounded-full transition-all cursor-pointer font-bold",
                      visualizerStyle === style ? "bg-primary text-primary-foreground" : "bg-white/5 text-white/60 hover:text-white"
                    )}
                  >
                    {style === 'columns' ? 'أعمدة' : style === 'waves' ? 'أمواج' : 'نبض'}
                  </button>
                ))}
              </div>
            </div>

            {/* Controls & Volume */}
            <div className="lg:col-span-3 flex flex-col items-center lg:items-end gap-3">
              <div className="flex items-center gap-2.5">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => handlePrevStation(filteredStations)}
                  disabled={allStations.length === 0}
                  className="rounded-xl w-10 h-10 border-white/10 bg-white/5 hover:bg-white/10 text-white cursor-pointer"
                  title="الإذاعة السابقة"
                  aria-label="الإذاعة السابقة"
                >
                  <SkipBack className="w-4 h-4" />
                </Button>

                <Button
                  onClick={() => {
                    if (currentStation) handleToggleRadio();
                    else if (filteredStations[0]) handlePlayRadio(filteredStations[0]);
                  }}
                  disabled={!currentStation && filteredStations.length === 0}
                  className="rounded-full w-14 h-14 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/30 cursor-pointer"
                  aria-label={isPlayingRadio ? 'إيقاف مؤقت' : 'تشغيل'}
                >
                  {isRadioBuffering ? (
                    <RefreshCw className="w-6 h-6 animate-spin" />
                  ) : isPlayingRadio ? (
                    <Pause className="w-6 h-6 fill-current" />
                  ) : (
                    <Play className="w-6 h-6 fill-current ms-0.5" />
                  )}
                </Button>

                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => handleNextStation(filteredStations)}
                  disabled={allStations.length === 0}
                  className="rounded-xl w-10 h-10 border-white/10 bg-white/5 hover:bg-white/10 text-white cursor-pointer"
                  title="الإذاعة التالية"
                  aria-label="الإذاعة التالية"
                >
                  <SkipForward className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex items-center gap-2 w-full max-w-[200px]">
                <button
                  onClick={() => setRadioVolume(radioVolume > 0 ? 0 : 0.8)}
                  className="text-white/65 hover:text-white cursor-pointer"
                  aria-label="كتم الصوت"
                >
                  {radioVolume === 0 ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-primary" />}
                </button>
                <Slider
                  value={[radioVolume * 100]}
                  max={100}
                  step={1}
                  onValueChange={(val) => setRadioVolume(val[0] / 100)}
                  className="w-full cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Sub-bar: Recording & Ambient Sounds Mixer Toggle */}
          <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 relative z-10">
            <div className="flex items-center gap-2">
              {currentStation && (
                isRecording ? (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={stopRecording}
                    className="rounded-xl text-xs gap-2 animate-pulse font-bold cursor-pointer"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>إيقاف التسجيل ({formatTime(recordingDuration)})</span>
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={startRecording}
                    className="rounded-xl border-white/10 bg-white/5 hover:bg-rose-500/15 hover:text-rose-300 hover:border-rose-500/30 text-white/80 text-xs gap-1.5 cursor-pointer"
                  >
                    <Mic className="w-3.5 h-3.5 text-rose-400" />
                    <span>تسجيل مقطع</span>
                  </Button>
                )
              )}

              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowAmbientMixer(!showAmbientMixer)}
                className={cn(
                  "rounded-xl border-white/10 text-xs gap-1.5 cursor-pointer",
                  activeAmbient || showAmbientMixer
                    ? "bg-primary/15 border-primary/35 text-primary font-bold"
                    : "bg-white/5 text-white/80 hover:bg-white/10"
                )}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>أصوات الخلفية {activeAmbient ? '(نشط)' : ''}</span>
              </Button>
            </div>

            {currentStation && (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => toggleFavoriteRadio(currentStation.id, e)}
                  className="rounded-xl text-xs gap-1.5 text-white/75 hover:text-rose-400 cursor-pointer"
                >
                  <Heart className={cn("w-3.5 h-3.5", favoriteRadioIds.includes(currentStation.id) && "fill-rose-500 text-rose-500")} />
                  <span>{favoriteRadioIds.includes(currentStation.id) ? 'في المفضلة' : 'تفضيل'}</span>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => handleShareStation(currentStation, e)}
                  className="rounded-xl text-xs gap-1.5 text-white/75 hover:text-white cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>مشاركة</span>
                </Button>
              </div>
            )}
          </div>

          {/* Expandable Ambient Mixer */}
          <AnimatePresence>
            {showAmbientMixer && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-4 bg-black/30 p-4 rounded-2xl border border-white/10">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-white/70 flex items-center gap-1.5 me-1">
                      <Sparkles className="w-3.5 h-3.5 text-primary" />
                      <span>أصوات طبيعية مرافقة:</span>
                    </span>
                    {AMBIENT_SOUNDS.map(sound => (
                      <button
                        key={sound.id}
                        onClick={() => toggleAmbient(sound.id)}
                        className={cn(
                          "px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer",
                          activeAmbient === sound.id
                            ? "bg-primary/20 border-primary/45 text-primary"
                            : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
                        )}
                      >
                        <span>{sound.icon}</span>
                        <span>{sound.label}</span>
                      </button>
                    ))}
                  </div>

                  {activeAmbient && (
                    <div className="flex items-center gap-2.5 w-full sm:w-48">
                      <Volume2 className="w-4 h-4 text-primary shrink-0" />
                      <Slider
                        value={[ambientVolume * 100]}
                        max={100}
                        step={1}
                        onValueChange={(val) => setAmbientVolume(val[0] / 100)}
                        className="w-full cursor-pointer"
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ── Recently Played Stations Row ── */}
      {recentStations.length > 0 && (
        <section className="container px-4 max-w-6xl mx-auto space-y-2.5">
          <div className="flex items-center gap-2 text-white/75 text-xs font-bold">
            <History className="w-3.5 h-3.5 text-primary" />
            <span>استمعت إليها مؤخراً</span>
          </div>

          <div className="flex items-center gap-2.5 overflow-x-auto pb-1 no-scrollbar">
            {recentStations.map(station => (
              <button
                key={station.id}
                onClick={() => handlePlayRadio(station)}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-2 rounded-2xl border text-xs shrink-0 transition-all cursor-pointer",
                  currentStation?.id === station.id
                    ? "bg-primary/20 border-primary/40 text-primary font-bold"
                    : "bg-white/[0.03] border-white/10 text-white/75 hover:bg-white/10 hover:text-white"
                )}
              >
                <span className="w-5 h-5 rounded-md overflow-hidden flex items-center justify-center text-sm shrink-0">
                  {renderStationIcon(station.icon)}
                </span>
                <span className="truncate max-w-[150px]">{station.name}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ── Search, Filters & Stations Grid ── */}
      <section className="container px-4 max-w-6xl mx-auto space-y-5">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1 md:max-w-md">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/45" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن قارئ، إذاعة، مدينة، أو دولة..."
              className="pr-10 pl-10 rounded-2xl luxury-glass border-white/10 text-white placeholder:text-white/40 h-12"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/45 hover:text-white cursor-pointer"
                aria-label="مسح البحث"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <div className="px-4 h-12 rounded-2xl luxury-glass text-xs font-black text-white/80 flex items-center gap-2 shrink-0">
              <RadioIcon className="w-3.5 h-3.5 text-primary" />
              <span>{filteredStations.length} إذاعة</span>
            </div>

            <Button
              onClick={() => setIsCustomOpen(!isCustomOpen)}
              variant="outline"
              className="rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs h-12 px-5 gap-2 flex-1 md:flex-none cursor-pointer"
            >
              <Plus className="w-4 h-4 text-primary" />
              <span>إضافة إذاعة خاصة</span>
            </Button>
          </div>
        </div>

        {/* Custom Station Add Form */}
        <AnimatePresence>
          {isCustomOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-5 sm:p-6 rounded-3xl luxury-glass border border-white/10 space-y-4">
                <h4 className="text-sm font-bold text-white">إضافة رابط بث مباشر مخصص (MP3 / M3U8 / YouTube):</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    value={newStationName}
                    onChange={(e) => setNewStationName(e.target.value)}
                    placeholder="اسم الإذاعة (مثال: إذاعة القرآن الخاصة)"
                    className="rounded-xl bg-zinc-950/70 border-white/15 text-white h-11"
                  />
                  <Input
                    value={newStationUrl}
                    onChange={(e) => setNewStationUrl(e.target.value)}
                    placeholder="رابط البث الصوتي (URL)"
                    className="rounded-xl bg-zinc-950/70 border-white/15 text-white h-11 text-left"
                    dir="ltr"
                  />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 bg-black/40 border border-white/10 rounded-xl px-3 py-1.5">
                    <span className="text-xs text-white/60 me-1">الأيقونة:</span>
                    {['📻', '🕌', '🌙', '📖', '🎙️', '🌟'].map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setNewStationIcon(emoji)}
                        className={cn(
                          "w-7 h-7 rounded-lg text-sm flex items-center justify-center transition-all cursor-pointer",
                          newStationIcon === emoji ? "bg-primary/25 ring-1 ring-primary" : "hover:bg-white/10"
                        )}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setIsCustomOpen(false)} className="rounded-xl cursor-pointer">
                      إلغاء
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        if (!newStationName.trim() || !newStationUrl.trim()) {
                          toast({ variant: 'destructive', title: 'يرجى إدخال الاسم والرابط' });
                          return;
                        }
                        if (!newStationUrl.trim().startsWith('http://') && !newStationUrl.trim().startsWith('https://')) {
                          toast({ variant: 'destructive', title: 'يجب أن يبدأ الرابط بـ http:// أو https://' });
                          return;
                        }
                        handleAddCustomRadio(newStationName, newStationUrl, newStationIcon);
                        setNewStationName('');
                        setNewStationUrl('');
                        setIsCustomOpen(false);
                        setSelectedCategory('custom');
                        toast({ title: 'تمت إضافة الإذاعة بنجاح' });
                      }}
                      className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold cursor-pointer"
                    >
                      حفظ الإذاعة
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full text-xs font-bold px-4 h-9 border transition-all cursor-pointer",
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]"
                    : "bg-white/[0.03] border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Stations Grid */}
        {isLoadingRadios ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-40 rounded-[1.5rem] bg-white/5 animate-pulse border border-white/5" />
            ))}
          </div>
        ) : filteredStations.length === 0 ? (
          <div className="p-12 text-center rounded-[2rem] luxury-glass border border-white/10 space-y-3">
            <RadioIcon className="w-10 h-10 text-white/30 mx-auto" />
            <h3 className="text-lg font-bold text-white">لم يتم العثور على إذاعات</h3>
            <p className="text-xs text-white/60">جرّب البحث بكلمات أخرى أو اختر تصنيفاً مختلفاً.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {displayedStations.map((station) => {
                const isCurrent = currentStation?.id === station.id;
                const isFav = favoriteRadioIds.includes(station.id);
                const isCustom = station.id.startsWith('custom_');

                return (
                  <div
                    key={station.id}
                    onClick={() => handlePlayRadio(station)}
                    className={cn(
                      "p-4 rounded-[1.5rem] border transition-all duration-300 cursor-pointer group relative overflow-hidden flex flex-col justify-between min-h-[156px]",
                      isCurrent
                        ? "bg-primary/15 border-primary/50 shadow-[0_15px_35px_-10px_rgba(var(--primary-rgb),0.35)] ring-1 ring-primary/30"
                        : "luxury-card"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className={cn(
                        "w-11 h-11 rounded-xl border flex items-center justify-center text-2xl group-hover:scale-105 transition-transform shrink-0 overflow-hidden",
                        isCurrent ? "bg-primary/20 border-primary/40" : "bg-white/5 border-white/10"
                      )}>
                        {renderStationIcon(station.icon)}
                      </div>

                      <div className="flex items-center gap-0.5">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={(e) => toggleFavoriteRadio(station.id, e)}
                          className={cn(
                            "h-8 w-8 rounded-full hover:bg-white/10 cursor-pointer",
                            isFav ? "text-rose-500" : "text-white/45 hover:text-rose-400"
                          )}
                          title="إضافة للمفضلة"
                          aria-label="إضافة للمفضلة"
                        >
                          <Heart className={cn("w-4 h-4", isFav && "fill-current")} />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={(e) => handleShareStation(station, e)}
                          className="h-8 w-8 rounded-full text-white/45 hover:text-white hover:bg-white/10 cursor-pointer"
                          title="مشاركة الإذاعة"
                          aria-label="مشاركة الإذاعة"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </Button>
                        {isCustom && (
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={(e) => handleDeleteCustomStation(station.id, e)}
                            className="h-8 w-8 rounded-full text-rose-400/60 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                            title="حذف الإذاعة"
                            aria-label="حذف الإذاعة"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1 mt-4">
                      <h3 className={cn(
                        "font-bold text-sm line-clamp-1 group-hover:text-primary transition-colors",
                        isCurrent ? "text-primary font-black" : "text-white"
                      )}>
                        {station.name}
                      </h3>
                      <p className="text-[11px] text-white/60 line-clamp-1">
                        {station.subtitle || 'بث مباشر 24/7'}
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-white/55 pt-1.5">
                        <span className="flex items-center gap-1.5">
                          <span className={cn("w-1.5 h-1.5 rounded-full", isCurrent ? "bg-emerald-400 animate-ping" : "bg-emerald-500/60")} />
                          مباشر
                        </span>
                        {isCurrent && isPlayingRadio ? (
                          <span className="text-primary font-bold flex items-center gap-1">
                            <Waves className="w-3 h-3 animate-pulse" />
                            يعمل الآن
                          </span>
                        ) : (
                          <span className="text-white/40 group-hover:text-primary transition-colors flex items-center gap-1 text-[10px] font-bold">
                            <Play className="w-3 h-3 fill-current" />
                            استماع
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {visibleCount < filteredStations.length && (
              <div className="text-center pt-4">
                <Button
                  onClick={() => setVisibleCount(prev => prev + STATIONS_PAGE_SIZE)}
                  className="luxury-pill-btn px-8 h-11 text-xs font-black gap-2 cursor-pointer"
                >
                  <span>عرض المزيد ({filteredStations.length - visibleCount} إذاعة متبقية)</span>
                  <ChevronDown className="w-4 h-4 text-primary" />
                </Button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
