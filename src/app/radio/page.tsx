'use client';

import React, { useState, useMemo } from 'react';
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
  Info
} from 'lucide-react';
import { useQuranRadio } from '@/hooks/quran/use-quran-radio';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { RadioStation } from '@/components/radio-provider';

// Smart categories
const CATEGORIES = [
  { id: 'all', label: 'جميع الإذاعات', icon: RadioIcon },
  { id: 'popular', label: 'الإذاعات الكبرى', icon: Flame },
  { id: 'cairo_makkah', label: 'الحرمين ومصر', icon: Compass },
  { id: 'adhkar', label: 'الأذكار والرقية', icon: ShieldCheck },
  { id: 'reciters', label: 'كبار القراء', icon: Headphones },
  { id: 'favorites', label: 'المفضلة', icon: Heart },
  { id: 'custom', label: 'إذاعاتي الخاصة', icon: Plus },
];

// Ambient sounds definition
const AMBIENT_SOUNDS = [
  { id: 'rain', label: 'مطر خفيف', icon: '🌧️', src: 'https://cdn.pixabay.com/download/audio/2022/05/16/audio_db6591201e.mp3?filename=gentle-rain-16274.mp3' },
  { id: 'birds', label: 'عصافير الفجر', icon: '🕊️', src: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_bb630cc098.mp3?filename=birds-in-the-forest-24189.mp3' },
  { id: 'night', label: 'هدوء الليل', icon: '🌌', src: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=night-ambience-17064.mp3' },
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
    canvasRef,
    visualizerStyle,
    setVisualizerStyle,
    startRecording,
    stopRecording,
    isRecording,
    recordingDuration,
    listeningMinutes,
  } = useQuranRadio();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Sleep Timer States
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState<number | null>(null);
  const [isTimerDialogOpen, setIsTimerDialogOpen] = useState(false);

  // Ambient Sound States
  const [activeAmbient, setActiveAmbient] = useState<string | null>(null);
  const [ambientVolume, setAmbientVolume] = useState(0.4);
  const ambientAudioRef = React.useRef<HTMLAudioElement | null>(null);

  // Custom radio dialog states
  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const [newStationName, setNewStationName] = useState('');
  const [newStationUrl, setNewStationUrl] = useState('');

  // Handle sleep timer countdown
  React.useEffect(() => {
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
    let list: RadioStation[] = [...customRadioStations, ...radioStations];

    // Category filter
    if (selectedCategory === 'favorites') {
      list = list.filter(s => favoriteRadioIds.includes(s.id));
    } else if (selectedCategory === 'custom') {
      list = list.filter(s => s.id.startsWith('custom_'));
    } else if (selectedCategory === 'popular') {
      list = list.filter(s => 
        s.name.includes('القاهرة') || 
        s.name.includes('مكة') || 
        s.name.includes('السعودية') || 
        s.name.includes('الرياض') || 
        s.name.includes('زايد')
      );
    } else if (selectedCategory === 'cairo_makkah') {
      list = list.filter(s => s.name.includes('القاهرة') || s.name.includes('الحرم') || s.name.includes('مكة') || s.name.includes('المدينة'));
    } else if (selectedCategory === 'adhkar') {
      list = list.filter(s => s.name.includes('أذكار') || s.name.includes('الرقية') || s.name.includes('تفسير') || s.name.includes('فتوى'));
    } else if (selectedCategory === 'reciters') {
      list = list.filter(s => 
        s.name.includes('عبد الباسط') || 
        s.name.includes('المنشاوي') || 
        s.name.includes('الحصري') || 
        s.name.includes('البنا') || 
        s.name.includes('العفاسي') || 
        s.name.includes('المعيقلي') || 
        s.name.includes('الشريم') || 
        s.name.includes('السديس')
      );
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(s => s.name.toLowerCase().includes(q) || (s.subtitle && s.subtitle.toLowerCase().includes(q)));
    }

    return list;
  }, [radioStations, customRadioStations, selectedCategory, searchQuery, favoriteRadioIds]);

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

  return (
    <div className="min-h-screen pb-32 space-y-10">
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

          {/* Quick listening stats & Sleep Timer trigger */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-white/80 text-xs">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>استمعت اليوم: <b>{listeningMinutes}</b> دقيقة</span>
            </div>

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
          </div>

          {/* Sleep Timer Popup */}
          <AnimatePresence>
            {isTimerDialogOpen && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-4 bg-zinc-900/90 backdrop-blur-2xl border border-white/15 rounded-3xl shadow-2xl flex flex-wrap items-center justify-center gap-2 max-w-md mx-auto"
              >
                <span className="text-xs text-white/70 w-full mb-1">اختر مدة مؤقت النوم:</span>
                {[15, 30, 45, 60, 90].map(mins => (
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
        </motion.div>
      </section>

      {/* ── Active Station Live Dashboard ── */}
      {currentStation && (
        <section className="container px-4 max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }}
            className="p-6 md:p-8 rounded-[2.5rem] bg-gradient-to-br from-zinc-900/90 to-zinc-950 border border-emerald-500/30 backdrop-blur-2xl shadow-2xl relative overflow-hidden"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Station Info */}
              <div className="lg:col-span-4 flex items-center gap-5">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-emerald-950/40 border border-emerald-500/30 flex items-center justify-center text-4xl shadow-lg shrink-0">
                  {currentStation.icon || '📻'}
                </div>
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-emerald-500/10 border-emerald-500/30 text-emerald-400 text-[10px] px-2 py-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping me-1" />
                      بث مباشر
                    </Badge>
                  </div>
                  <h2 className="text-xl md:text-2xl font-black font-headline text-white truncate">
                    {currentStation.name}
                  </h2>
                  <p className="text-xs text-white/50 truncate font-medium">{currentStation.subtitle || 'إذاعة القرآن الكريم'}</p>
                </div>
              </div>

              {/* Visualizer Canvas */}
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

              {/* Controls */}
              <div className="lg:col-span-4 flex flex-col sm:flex-row items-center justify-end gap-4">
                {/* Volume slider */}
                <div className="flex items-center gap-2 w-full sm:w-36">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setRadioVolume(radioVolume > 0 ? 0 : 0.8)}
                    className="text-white/60 hover:text-white h-8 w-8"
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

                {/* Play/Pause Button */}
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
              </div>
            </div>

            {/* Ambient Background Sounds Bar */}
            <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white/70">أصوات بيئية مرافقة:</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
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

      {/* ── Search & Filter Tabs ── */}
      <section className="container px-4 max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search bar */}
          <div className="relative w-full md:max-w-md">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن إذاعة، قارئ، أو مدينة..."
              className="pr-10 rounded-2xl bg-zinc-900/60 border-white/10 text-white placeholder:text-white/30 h-12"
            />
          </div>

          {/* Add custom radio button */}
          <Button
            onClick={() => setIsCustomOpen(!isCustomOpen)}
            variant="outline"
            className="rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs h-12 px-5 gap-2 w-full md:w-auto"
          >
            <Plus className="w-4 h-4" /> إضافة إذاعة خاصة
          </Button>
        </div>

        {/* Custom Station Add Form */}
        <AnimatePresence>
          {isCustomOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-6 rounded-3xl bg-zinc-900/80 border border-white/10 space-y-4"
            >
              <h4 className="text-sm font-bold text-white">إضافة رابط بث مباشر مخصص (M3U8 / MP3 Stream):</h4>
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
              <div key={i} className="h-32 rounded-3xl bg-white/5 animate-pulse" />
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
                    "p-5 rounded-3xl border transition-all cursor-pointer group relative overflow-hidden flex flex-col justify-between h-40",
                    isCurrent 
                      ? "bg-emerald-500/15 border-emerald-500/50 shadow-xl shadow-emerald-500/10 ring-1 ring-emerald-500/30" 
                      : "bg-zinc-900/60 hover:bg-zinc-800/80 border-white/10 hover:border-white/20"
                  )}
                >
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
                      >
                        <Heart className={cn("w-4 h-4", isFav && "fill-current")} />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => handleShareStation(station, e)}
                        className="h-8 w-8 rounded-full text-white/30 hover:text-white"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-1 mt-auto">
                    <h3 className={cn(
                      "font-bold text-sm line-clamp-1 group-hover:text-emerald-400 transition-colors",
                      isCurrent ? "text-emerald-400 font-black" : "text-white"
                    )}>
                      {station.name}
                    </h3>
                    <div className="flex items-center justify-between text-[10px] text-white/40">
                      <span className="flex items-center gap-1.5">
                        <span className={cn("w-1.5 h-1.5 rounded-full", isCurrent ? "bg-emerald-400 animate-ping" : "bg-emerald-500/50")} />
                        مباشر
                      </span>
                      {isCurrent && isPlayingRadio && (
                        <span className="text-emerald-400 font-bold">يعمل الآن</span>
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
