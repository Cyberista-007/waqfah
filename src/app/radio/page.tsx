'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
  Clock, 
  Sliders, 
  CloudRain, 
  Sparkles, 
  Share2, 
  Activity, 
  Wifi, 
  Volume1, 
  Plus, 
  Mic, 
  RefreshCw, 
  Flame, 
  Compass, 
  Headphones, 
  Check, 
  ExternalLink,
  ShieldCheck,
  Disc,
  Info,
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
  Download,
  Square,
  Globe
} from 'lucide-react';
import { useQuranRadio } from '@/hooks/quran/use-quran-radio';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { RadioStation } from '@/components/radio-provider';

// Expanded Categories
const CATEGORIES = [
  { id: 'all', label: 'جميع الإذاعات', icon: RadioIcon },
  { id: 'reciters', label: 'كبار القراء', icon: Headphones },
  { id: 'popular', label: 'الإذاعات الكبرى', icon: Flame },
  { id: 'cairo', label: 'إذاعة القاهرة ومصر', icon: Compass },
  { id: 'haramain', label: 'الحرم المكي والمدني', icon: Compass },
  { id: 'gulf', label: 'إذاعات الخليج والعالم', icon: Globe },
  { id: 'adhkar', label: 'الأذكار والرقية والتفسير', icon: ShieldCheck },
  { id: 'imported', label: 'محاضرات ودروس وقفة', icon: BookOpen },
  { id: 'favorites', label: 'المفضلة', icon: Heart },
  { id: 'custom', label: 'إذاعاتي الخاصة', icon: Plus },
];

// Ambient sounds definition
const AMBIENT_SOUNDS = [
  { id: 'rain', label: 'مطر خفيف', icon: '🌧️', src: 'https://cdn.pixabay.com/download/audio/2022/05/16/audio_db6591201e.mp3?filename=gentle-rain-16274.mp3' },
  { id: 'birds', label: 'عصافير الفجر', icon: '🕊️', src: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_bb630cc098.mp3?filename=birds-in-the-forest-24189.mp3' },
  { id: 'night', label: 'هدوء الليل', icon: '🌌', src: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=night-ambience-17064.mp3' },
  { id: 'waves', label: 'أمواج البحر', icon: '🌊', src: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c3527e30ec.mp3?filename=sea-waves-112906.mp3' },
];

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
  } = useQuranRadio();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Sleep Timer States
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);
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
  const ambientAudioRef = React.useRef<HTMLAudioElement | null>(null);

  // Custom radio dialog states
  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const [newStationName, setNewStationName] = useState('');
  const [newStationUrl, setNewStationUrl] = useState('');

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

  // Handle sleep timer countdown
  useEffect(() => {
    if (!sleepTimerRemaining || sleepTimerRemaining <= 0) return;

    const interval = setInterval(() => {
      setSleepTimerRemaining(prev => {
        if (!prev || prev <= 1) {
          stopRadio();
          if (ambientAudioRef.current) ambientAudioRef.current.pause();
          toast({
            title: 'تم إيقاف الإذاعة',
            description: 'انتهى مؤقت النوم المجدول وتم إيقاف الصوت بنجاح.',
          });
          return null;
        }
        // Fade out volume in last 2 minutes
        if (prev <= 120 && prev % 20 === 0) {
          setRadioVolume(Math.max(0.1, radioVolume * 0.8));
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [sleepTimerRemaining, stopRadio, radioVolume, setRadioVolume, toast]);

  const setSleepTimer = (minutes: number | null) => {
    setSleepTimerMinutes(minutes);
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

  // Toggle ambient background audio
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

  // Filter stations based on search and category
  const filteredStations = useMemo(() => {
    let list: RadioStation[] = [
      ...customRadioStations,
      ...importedRadioStations,
      ...radioStations
    ];

    // Category filter
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
      list = list.filter(s => s.name.includes('أذكار') || s.name.includes('الرقية') || s.name.includes('تفسير') || s.name.includes('فتوى'));
    } else if (selectedCategory === 'reciters') {
      list = list.filter(s => 
        s.name.includes('عبد الباسط') || 
        s.name.includes('المنشاوي') || 
        s.name.includes('الحصري') || 
        s.name.includes('البنا') || 
        s.name.includes('الطبلاوي') || 
        s.name.includes('العفاسي') || 
        s.name.includes('المعيقلي') || 
        s.name.includes('الشريم') || 
        s.name.includes('السديس') ||
        s.name.includes('الغامدي') ||
        s.name.includes('العجمي') ||
        s.name.includes('الدوسري') ||
        s.name.includes('القطامي')
      );
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(s => s.name.toLowerCase().includes(q) || (s.subtitle && s.subtitle.toLowerCase().includes(q)));
    }

    return list;
  }, [radioStations, customRadioStations, importedRadioStations, selectedCategory, searchQuery, favoriteRadioIds]);

  // Recently played station objects
  const recentStations = useMemo(() => {
    const all = [...customRadioStations, ...importedRadioStations, ...radioStations];
    return radioHistory
      .map(id => all.find(s => s.id === id))
      .filter(Boolean) as RadioStation[];
  }, [radioHistory, customRadioStations, importedRadioStations, radioStations]);

  // Pick random station
  const handlePlayRandom = () => {
    const all = [...customRadioStations, ...importedRadioStations, ...radioStations];
    if (all.length === 0) return;
    const randomStation = all[Math.floor(Math.random() * all.length)];
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

  // Format recording duration (seconds to MM:SS)
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="min-h-screen pb-32 space-y-10">
      {/* ── Zen / Fullscreen Screensaver Modal ── */}
      <AnimatePresence>
        {isZenMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-zinc-950 flex flex-col items-center justify-between p-6 sm:p-12 overflow-hidden select-none"
          >
            {/* Background dynamic ambient glow */}
            <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
              <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-emerald-600/15 blur-[160px] rounded-full animate-pulse" />
              <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-teal-500/10 blur-[130px] rounded-full" />
            </div>

            {/* Top Bar: Live Clock & Exit Button */}
            <div className="w-full max-w-5xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-sm font-bold text-emerald-400 tracking-wider">وضع السكينة والاسترخاء</span>
              </div>

              <div className="text-center">
                <span className="text-xl sm:text-2xl font-mono font-bold text-white/80">{zenTime}</span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsZenMode(false)}
                className="rounded-2xl border-white/10 bg-white/5 hover:bg-white/15 text-white gap-2"
              >
                <Minimize2 className="w-4 h-4" />
                <span>إغلاق</span>
              </Button>
            </div>

            {/* Middle Section: Active Station & Visualizer */}
            <div className="flex flex-col items-center text-center space-y-8 max-w-2xl my-auto">
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-950/60 border border-emerald-500/40 flex items-center justify-center text-5xl sm:text-6xl shadow-2xl shadow-emerald-500/20 animate-bounce-slow">
                {currentStation?.icon || '📻'}
              </div>

              <div className="space-y-2">
                <h2 className="text-3xl sm:text-5xl font-black font-headline text-white tracking-tight">
                  {currentStation?.name || 'إذاعة القرآن الكريم'}
                </h2>
                <p className="text-base sm:text-lg text-emerald-300/80 font-medium">
                  {currentStation?.subtitle || 'بث مباشر متواصل 24/7'}
                </p>
                <p className="text-xs sm:text-sm text-white/40 pt-2 italic">
                  ﴿ أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ ﴾
                </p>
              </div>

              {/* Visualizer in Zen Mode */}
              <div className="w-full max-w-md h-24 rounded-3xl bg-black/40 border border-white/10 p-3 overflow-hidden flex items-center justify-center backdrop-blur-md">
                <canvas ref={canvasRef} className="w-full h-full" />
              </div>

              {/* Zen Controls */}
              <div className="flex items-center gap-6">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => handlePrevStation(filteredStations)}
                  className="rounded-full w-12 h-12 border-white/10 text-white/80 hover:text-white bg-white/5"
                >
                  <SkipBack className="w-5 h-5" />
                </Button>

                <Button
                  onClick={handleToggleRadio}
                  className="rounded-full w-20 h-20 bg-emerald-500 hover:bg-emerald-400 text-black shadow-xl shadow-emerald-500/30 scale-105 transition-transform"
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
                  className="rounded-full w-12 h-12 border-white/10 text-white/80 hover:text-white bg-white/5"
                >
                  <SkipForward className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Bottom: Quick Ambient Sounds Selector */}
            <div className="w-full max-w-md flex items-center justify-center gap-2">
              {AMBIENT_SOUNDS.map(sound => (
                <Button
                  key={sound.id}
                  size="sm"
                  variant="outline"
                  onClick={() => toggleAmbient(sound.id)}
                  className={cn(
                    "rounded-xl text-xs gap-1.5 transition-all",
                    activeAmbient === sound.id 
                      ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-bold" 
                      : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
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

      {/* ── Cinematic Hero Section ── */}
      <section className="relative mx-4 sm:mx-8 mt-4 sm:mt-6 pt-24 pb-16 px-6 md:px-12 flex flex-col items-center text-center overflow-hidden border border-emerald-500/20 bg-gradient-to-b from-emerald-950/40 via-zinc-950 to-zinc-950 rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-500/15 blur-[140px] rounded-full" />
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-3xl">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            إذاعات القرآن الكريم المباشرة 24/7
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black font-headline tracking-tight text-white">
            أثير <span className="bg-clip-text text-transparent bg-gradient-to-l from-emerald-400 via-teal-300 to-white">السكينة والقرآن</span>
          </h1>

          <p className="text-base sm:text-lg text-white/60 font-medium leading-relaxed">
            استمع لأشهر إذاعات العالم الإسلامي، كبار القراء، وأذكار الصباح والمساء بجودة فائقة وبث مستمر بلا انقطاع.
          </p>

          {/* Quick Action Tools Bar */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {/* Listening Stats */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-white/80 text-xs">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>استمعت اليوم: <b>{listeningMinutes}</b> دقيقة</span>
            </div>

            {/* Random Pick Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handlePlayRandom}
              className="rounded-2xl border-white/10 bg-white/5 text-white/80 hover:bg-white/10 text-xs gap-2"
            >
              <Shuffle className="w-3.5 h-3.5 text-teal-400" />
              <span>إذاعة عشوائية</span>
            </Button>

            {/* Zen Fullscreen Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsZenMode(true)}
              className="rounded-2xl border-white/10 bg-white/5 text-white/80 hover:bg-white/10 text-xs gap-2"
            >
              <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>شاشة السكينة</span>
            </Button>

            {/* Sleep Timer Trigger */}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsTimerDialogOpen(!isTimerDialogOpen)}
              className={cn(
                "rounded-2xl border-white/10 text-xs gap-2 transition-all",
                sleepTimerRemaining ? "bg-amber-500/20 border-amber-500/40 text-amber-300" : "bg-white/5 text-white/80 hover:bg-white/10"
              )}
            >
              <Moon className="w-3.5 h-3.5" />
              {sleepTimerRemaining ? (
                <span>مؤقت النوم: {Math.floor(sleepTimerRemaining / 60)}:{String(sleepTimerRemaining % 60).padStart(2, '0')}</span>
              ) : (
                <span>مؤقت النوم</span>
              )}
            </Button>

            {/* Radio Alarm Trigger */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAlarmDialogOpen(true)}
              className={cn(
                "rounded-2xl border-white/10 text-xs gap-2 transition-all",
                isAlarmEnabled ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-bold" : "bg-white/5 text-white/80 hover:bg-white/10"
              )}
            >
              {isAlarmEnabled ? <BellRing className="w-3.5 h-3.5 text-emerald-400" /> : <Bell className="w-3.5 h-3.5" />}
              <span>{isAlarmEnabled ? `منبه: ${alarmTime}` : 'منبه الإذاعة'}</span>
            </Button>
          </div>

          {/* Sleep Timer Popup */}
          <AnimatePresence>
            {isTimerDialogOpen && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-4 bg-zinc-900/95 backdrop-blur-2xl border border-white/15 rounded-3xl shadow-2xl flex flex-wrap items-center justify-center gap-2 max-w-md mx-auto"
              >
                <span className="text-xs text-white/70 w-full mb-1 font-bold">اختر مدة إيقاف البث التلقائي:</span>
                {[15, 30, 45, 60, 90, 120].map(mins => (
                  <Button
                    key={mins}
                    size="sm"
                    variant="outline"
                    onClick={() => setSleepTimer(mins)}
                    className="rounded-xl border-white/10 hover:bg-emerald-500/20 hover:text-emerald-300 text-xs"
                  >
                    {mins} دقيقة
                  </Button>
                ))}
                {sleepTimerRemaining && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setSleepTimer(null)}
                    className="rounded-xl text-xs"
                  >
                    إلغاء المؤقت
                  </Button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Alarm Configuration Dialog */}
          <AnimatePresence>
            {isAlarmDialogOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-6 bg-zinc-900/95 backdrop-blur-2xl border border-white/15 rounded-3xl shadow-2xl max-w-md mx-auto text-right space-y-4"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <BellRing className="w-4 h-4 text-emerald-400" />
                    منبه الاستيقاظ على الإذاعة
                  </h4>
                  <Button size="icon" variant="ghost" onClick={() => setIsAlarmDialogOpen(false)} className="h-7 w-7 text-white/50">
                    ✕
                  </Button>
                </div>

                <p className="text-xs text-white/60">
                  حدد الوقت المناسب (مثل الفجر أو الصباح) وسيتم تشغيل إذاعتك المختارة تلقائياً.
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-white/70 font-semibold mb-1 block">وقت التشغيل:</label>
                    <Input
                      type="time"
                      value={inputAlarmTime}
                      onChange={(e) => setInputAlarmTime(e.target.value)}
                      className="rounded-xl bg-zinc-950 border-white/10 text-white font-mono text-center"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-white/70 font-semibold mb-1 block">إذاعة المنبه:</label>
                    <select
                      value={selectedAlarmStation || currentStation?.id || ''}
                      onChange={(e) => setSelectedAlarmStation(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-zinc-950 border border-white/10 text-white text-xs"
                    >
                      <option value="">(الإذاعة الحالية)</option>
                      {radioStations.slice(0, 30).map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  {isAlarmEnabled && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        toggleAlarm(false);
                        setIsAlarmDialogOpen(false);
                        toast({ title: 'تم تعطيل المنبه' });
                      }}
                      className="rounded-xl text-xs"
                    >
                      تعطيل المنبه
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
                    className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs ms-auto"
                  >
                    حفظ وتفعيل
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* ── Active Station Live Dashboard ── */}
      {currentStation && (
        <section className="container px-4 max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }}
            className="p-6 md:p-8 rounded-[2.5rem] bg-gradient-to-br from-zinc-900/90 to-zinc-950 border border-emerald-500/30 backdrop-blur-2xl shadow-2xl relative overflow-hidden space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Station Info & Badges */}
              <div className="lg:col-span-4 flex items-center gap-5">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-emerald-950/40 border border-emerald-500/30 flex items-center justify-center text-4xl shadow-lg shrink-0">
                  {currentStation.icon || '📻'}
                </div>
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-emerald-500/10 border-emerald-500/30 text-emerald-400 text-[10px] px-2 py-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping me-1" />
                      بث مباشر 24/7
                    </Badge>
                  </div>
                  <h2 className="text-xl md:text-2xl font-black font-headline text-white truncate">
                    {currentStation.name}
                  </h2>
                  <p className="text-xs text-white/50 truncate font-medium">{currentStation.subtitle || 'إذاعة القرآن الكريم'}</p>
                </div>
              </div>

              {/* Visualizer Canvas & Mode Selector */}
              <div className="lg:col-span-4 flex flex-col items-center justify-center space-y-2">
                <div className="w-full h-16 rounded-2xl bg-black/40 border border-white/5 p-2 overflow-hidden flex items-center justify-center">
                  <canvas ref={canvasRef} className="w-full h-full" />
                </div>
                <div className="flex items-center gap-2">
                  {(['columns', 'waves', 'particles'] as const).map(style => (
                    <button
                      key={style}
                      onClick={() => setVisualizerStyle(style)}
                      className={cn(
                        "text-[10px] px-2.5 py-0.5 rounded-full transition-all",
                        visualizerStyle === style ? "bg-emerald-500 text-black font-bold" : "bg-white/5 text-white/40 hover:text-white"
                      )}
                    >
                      {style === 'columns' ? 'أعمدة' : style === 'waves' ? 'أمواج' : 'نبض'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Controls & Tuner */}
              <div className="lg:col-span-4 flex flex-col sm:flex-row items-center justify-end gap-4">
                {/* Volume slider */}
                <div className="flex items-center gap-2 w-full sm:w-32">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setRadioVolume(radioVolume > 0 ? 0 : 0.8)}
                    className="text-white/60 hover:text-white h-8 w-8 shrink-0"
                  >
                    {radioVolume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </Button>
                  <Slider
                    value={[radioVolume * 100]}
                    max={100}
                    step={1}
                    onValueChange={(val) => setRadioVolume(val[0] / 100)}
                    className="w-full cursor-pointer"
                  />
                </div>

                {/* Tuner Navigation: Prev - Play/Pause - Next */}
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => handlePrevStation(filteredStations)}
                    className="rounded-2xl w-10 h-10 border-white/10 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white"
                    title="الإذاعة السابقة"
                  >
                    <SkipBack className="w-4 h-4" />
                  </Button>

                  <Button
                    onClick={handleToggleRadio}
                    className="rounded-full w-14 h-14 bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/25 shrink-0"
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
                    className="rounded-2xl w-10 h-10 border-white/10 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white"
                    title="الإذاعة التالية"
                  >
                    <SkipForward className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* ── Sub-Bar: Live Recording & Ambient Sounds Mixer ── */}
            <div className="pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
              {/* Live Audio Recorder Widget */}
              <div className="flex items-center gap-2">
                {isRecording ? (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={stopRecording}
                    className="rounded-xl text-xs gap-2 animate-pulse font-bold"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>إيقاف وحفظ التسجيل ({formatTime(recordingDuration)})</span>
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={startRecording}
                    className="rounded-xl border-white/10 bg-white/5 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/40 text-white/80 text-xs gap-2"
                  >
                    <Mic className="w-3.5 h-3.5 text-rose-400" />
                    <span>تسجيل مقطع صوتي</span>
                  </Button>
                )}
              </div>

              {/* Ambient Sounds Layering */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 text-xs text-white/50 me-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>أصوات مرافقة:</span>
                </div>
                {AMBIENT_SOUNDS.map(sound => (
                  <Button
                    key={sound.id}
                    size="sm"
                    variant="outline"
                    onClick={() => toggleAmbient(sound.id)}
                    className={cn(
                      "rounded-xl text-xs gap-1.5 transition-all",
                      activeAmbient === sound.id 
                        ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-bold" 
                        : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <span>{sound.icon}</span>
                    <span>{sound.label}</span>
                  </Button>
                ))}
              </div>
            </div>
          </motion.div>
        </section>
      )}

      {/* ── Recently Played Stations Row ── */}
      {recentStations.length > 0 && (
        <section className="container px-4 max-w-6xl mx-auto space-y-3">
          <div className="flex items-center gap-2 text-white/70 text-xs font-bold">
            <History className="w-3.5 h-3.5 text-emerald-400" />
            <span>استمعت إليها مؤخراً:</span>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
            {recentStations.map(station => (
              <button
                key={station.id}
                onClick={() => handlePlayRadio(station)}
                className={cn(
                  "flex items-center gap-2.5 px-3.5 py-2 rounded-2xl border text-xs shrink-0 transition-all text-right",
                  currentStation?.id === station.id 
                    ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-bold" 
                    : "bg-zinc-900/60 border-white/10 text-white/70 hover:bg-zinc-800 hover:text-white"
                )}
              >
                <span className="text-base">{station.icon || '📻'}</span>
                <span className="truncate max-w-[140px]">{station.name}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ── Search & Filter Tabs ── */}
      <section className="container px-4 max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search bar */}
          <div className="relative w-full md:max-w-md">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن قارئ، إذاعة، مدينة، أو دولة..."
              className="pr-10 rounded-2xl bg-zinc-900/60 border-white/10 text-white placeholder:text-white/30 h-12"
            />
          </div>

          {/* Add custom radio button */}
          <Button
            onClick={() => setIsCustomOpen(!isCustomOpen)}
            variant="outline"
            className="rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs h-12 px-5 gap-2 w-full md:w-auto"
          >
            <Plus className="w-4 h-4 text-emerald-400" /> إضافة إذاعة خاصة
          </Button>
        </div>

        {/* Custom Station Add Form */}
        <AnimatePresence>
          {isCustomOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-6 rounded-3xl bg-zinc-900/90 border border-white/10 space-y-4"
            >
              <h4 className="text-sm font-bold text-white">إضافة رابط بث مباشر مخصص (M3U8 / MP3 Stream / YouTube):</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  value={newStationName}
                  onChange={(e) => setNewStationName(e.target.value)}
                  placeholder="اسم الإذاعة (مثال: إذاعة القرآن الخاصة)"
                  className="rounded-xl bg-zinc-950 border-white/10 text-white"
                />
                <Input
                  value={newStationUrl}
                  onChange={(e) => setNewStationUrl(e.target.value)}
                  placeholder="رابط البث الصوتي (URL)"
                  className="rounded-xl bg-zinc-950 border-white/10 text-white"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => setIsCustomOpen(false)} className="rounded-xl">إلغاء</Button>
                <Button 
                  size="sm" 
                  onClick={() => {
                    if (!newStationName || !newStationUrl) {
                      toast({ variant: 'destructive', title: 'يرجى إدخال الاسم والرابط' });
                      return;
                    }
                    handleAddCustomRadio(newStationName, newStationUrl, '📻');
                    setNewStationName('');
                    setNewStationUrl('');
                    setIsCustomOpen(false);
                    toast({ title: 'تمت إضافة الإذاعة بنجاح' });
                  }}
                  className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold"
                >
                  حفظ الإذاعة
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <Button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                variant={isSelected ? 'default' : 'outline'}
                size="sm"
                className={cn(
                  "rounded-2xl text-xs gap-2 shrink-0 transition-all h-10 px-4",
                  isSelected 
                    ? "bg-emerald-500 hover:bg-emerald-400 text-black font-bold shadow-lg shadow-emerald-500/20" 
                    : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {cat.label}
              </Button>
            );
          })}
        </div>
      </section>

      {/* ── Stations Grid ── */}
      <section className="container px-4 max-w-6xl mx-auto">
        {isLoadingRadios ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-36 rounded-3xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : filteredStations.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white/5 border border-white/10 space-y-3">
            <RadioIcon className="w-10 h-10 text-white/20 mx-auto" />
            <h3 className="text-lg font-bold text-white">لم يتم العثور على إذاعات</h3>
            <p className="text-xs text-white/50">جرب البحث بكلمات أخرى أو اختر تصنيفاً مختلفاً.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredStations.map((station) => {
              const isCurrent = currentStation?.id === station.id;
              const isFav = favoriteRadioIds.includes(station.id);

              return (
                <motion.div
                  key={station.id}
                  layout
                  onClick={() => handlePlayRadio(station)}
                  className={cn(
                    "p-5 rounded-3xl border transition-all cursor-pointer group relative overflow-hidden flex flex-col justify-between h-44",
                    isCurrent 
                      ? "bg-emerald-500/15 border-emerald-500/50 shadow-xl shadow-emerald-500/10 ring-1 ring-emerald-500/30" 
                      : "bg-zinc-900/60 hover:bg-zinc-800/80 border-white/10 hover:border-white/20"
                  )}
                >
                  {/* Top: Icon + Actions */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shrink-0">
                      {station.icon || '📻'}
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => toggleFavoriteRadio(station.id, e)}
                        className={cn(
                          "h-8 w-8 rounded-full",
                          isFav ? "text-rose-500" : "text-white/30 hover:text-rose-400"
                        )}
                        title="إضافة للمفضلة"
                      >
                        <Heart className={cn("w-4 h-4", isFav && "fill-current")} />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => handleShareStation(station, e)}
                        className="h-8 w-8 rounded-full text-white/30 hover:text-white"
                        title="مشاركة الإذاعة"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Bottom: Info */}
                  <div className="space-y-1.5 mt-auto">
                    <h3 className={cn(
                      "font-bold text-sm line-clamp-1 group-hover:text-emerald-400 transition-colors",
                      isCurrent ? "text-emerald-400 font-black" : "text-white"
                    )}>
                      {station.name}
                    </h3>
                    <p className="text-[11px] text-white/40 line-clamp-1">
                      {station.subtitle || 'بث مباشر 24/7'}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-white/40 pt-1">
                      <span className="flex items-center gap-1.5">
                        <span className={cn("w-1.5 h-1.5 rounded-full", isCurrent ? "bg-emerald-400 animate-ping" : "bg-emerald-500/50")} />
                        مباشر
                      </span>
                      {isCurrent && isPlayingRadio && (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <Waves className="w-3 h-3 animate-pulse" />
                          يعمل الآن
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
