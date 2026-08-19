'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Headphones, 
  Mic2, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Clock, 
  Sparkles, 
  Rss, 
  Share2, 
  Heart, 
  Search, 
  Flame, 
  Radio, 
  Check, 
  Copy, 
  ExternalLink, 
  RotateCcw, 
  RotateCw, 
  Sliders, 
  Compass, 
  BookOpen, 
  Layers, 
  ArrowUpRight,
  TrendingUp,
  Download,
  Filter,
  User,
  ListMusic,
  LayoutGrid,
  List,
  Moon,
  Zap,
  CheckCircle2,
  ChevronLeft,
  X,
  Loader2
} from 'lucide-react';
import { useCollection } from '@/firebase';
import type { Lecture, Series } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useRadio, RadioStation } from '@/components/radio-provider';
import Link from 'next/link';

// Ambient sounds definition
const AMBIENT_SOUNDS = [
  { id: 'rain', label: 'مطر خفيف', icon: '🌧️', src: 'https://cdn.pixabay.com/download/audio/2022/05/16/audio_db6591201e.mp3?filename=gentle-rain-16274.mp3' },
  { id: 'birds', label: 'عصافير الفجر', icon: '🕊️', src: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_bb630cc098.mp3?filename=birds-in-the-forest-24189.mp3' },
  { id: 'night', label: 'هدوء الليل', icon: '🌌', src: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=night-ambience-17064.mp3' },
  { id: 'waves', label: 'أمواج البحر', icon: '🌊', src: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c3527e30ec.mp3?filename=sea-waves-112906.mp3' },
];

// Categories for Podcasts
const PODCAST_CATEGORIES = [
  { id: 'all', label: 'جميع الحلقات', icon: Headphones },
  { id: 'tazkiyah', label: 'الفكر والتزكية', icon: Sparkles },
  { id: 'seerah', label: 'السيرة والتاريخ', icon: Compass },
  { id: 'quran', label: 'تأملات قرآنية', icon: BookOpen },
  { id: 'contemporary', label: 'قضايا معاصرة وشبهات', icon: Flame },
  { id: 'series', label: 'سلاسل بودكاستية كاملة', icon: Layers },
  { id: 'favorites', label: 'حلقاتي المفضلة', icon: Heart },
];

export default function PodcastsPage() {
  const { toast } = useToast();
  const { 
    playStation, 
    currentStation, 
    isPlaying, 
    isBuffering,
    togglePlay, 
    volume, 
    setVolume, 
    playbackRate, 
    setPlaybackRate,
    currentTime,
    duration,
    seekTo
  } = useRadio();

  // Pagination & Fetch Limits to prevent downloading 6,000+ documents at once
  const [fetchLimit, setFetchLimit] = useState(48);
  const [displayLimit, setDisplayLimit] = useState(24);

  // Firestore queries for series and lectures with query limits
  const { data: allLectures, isLoading: isLoadingLectures } = useCollection<Lecture>('lectures', {
    orderBy: ['createdAt', 'desc'],
    limit: fetchLimit
  });

  const { data: allSeries, isLoading: isLoadingSeries } = useCollection<Series>('series', {
    orderBy: ['createdAt', 'desc']
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [durationFilter, setDurationFilter] = useState<'all' | 'short' | 'medium' | 'long'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'longest' | 'shortest'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // RSS Feed Modal States
  const [selectedSeriesForRss, setSelectedSeriesForRss] = useState<Series | null>(null);
  const [selectedSeriesDetail, setSelectedSeriesDetail] = useState<Series | null>(null);
  const [isCopiedRss, setIsCopiedRss] = useState(false);

  // Ambient sound states
  const [activeAmbient, setActiveAmbient] = useState<string | null>(null);
  const ambientAudioRef = useRef<HTMLAudioElement | null>(null);

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
        ambientAudioRef.current.volume = 0.4;
        ambientAudioRef.current.play().catch(e => console.warn('Ambient play err:', e));
        setActiveAmbient(ambientId);
      }
    }
  };

  // Visualizer State & Animation
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [visualizerStyle, setVisualizerStyle] = useState<'columns' | 'waves' | 'particles'>('columns');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    let phase = 0;
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      if (!isPlaying) {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 2;
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
        animationId = requestAnimationFrame(render);
        return;
      }

      phase += 0.08;

      if (visualizerStyle === 'waves') {
        ctx.beginPath();
        ctx.moveTo(0, height);
        const barCount = 36;
        const sliceWidth = width / barCount;

        for (let i = 0; i <= barCount; i++) {
          const val = (Math.sin(i * 0.25 + phase) * Math.cos(i * 0.15 - phase * 0.4) + 1) * 70;
          const yVal = height - (val / 255) * (height * 0.8) - 4;
          const xVal = i * sliceWidth;
          ctx.lineTo(xVal, yVal);
        }

        ctx.lineTo(width, height);
        ctx.closePath();

        const grad = ctx.createLinearGradient(0, height, 0, 0);
        grad.addColorStop(0, 'rgba(139, 92, 246, 0.05)');
        grad.addColorStop(0.5, 'rgba(139, 92, 246, 0.3)');
        grad.addColorStop(1, 'rgba(168, 85, 247, 0.7)');
        ctx.fillStyle = grad;
        ctx.fill();
      } else if (visualizerStyle === 'particles') {
        const barCount = 28;
        const barWidth = width / barCount;
        for (let i = 0; i < barCount; i++) {
          const val = (Math.sin(i * 0.4 + phase * 1.5) + 1) * 60;
          const barHeight = (val / 255) * (height * 0.75) + 4;
          const x = i * barWidth + barWidth / 2;
          const y = height / 2 - barHeight / 2;

          ctx.beginPath();
          ctx.arc(x, y + barHeight / 2, Math.max(2, barHeight / 4), 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(192, 132, 252, 0.8)';
          ctx.fill();
        }
      } else {
        // Columns
        const barCount = 24;
        const barWidth = (width / barCount) * 0.65;
        const gap = (width / barCount) * 0.35;

        for (let i = 0; i < barCount; i++) {
          const val = (Math.sin(i * 0.35 + phase * 1.2) * 0.5 + 0.5) * 180 + 30;
          const barHeight = Math.max(4, (val / 255) * height * 0.85);
          const x = i * (barWidth + gap) + gap / 2;
          const y = height - barHeight;

          const grad = ctx.createLinearGradient(0, height, 0, y);
          grad.addColorStop(0, '#7c3aed');
          grad.addColorStop(1, '#c084fc');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, [4, 4, 0, 0]);
          ctx.fill();
        }
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, [isPlaying, visualizerStyle]);

  // Sleep Timer
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState<number | null>(null);
  const sleepTimerRef = useRef<NodeJS.Timeout | null>(null);

  const startSleepTimer = (minutes: number) => {
    if (sleepTimerRef.current) clearInterval(sleepTimerRef.current);
    if (sleepTimerMinutes === minutes) {
      // Toggle off
      setSleepTimerMinutes(null);
      setSleepTimerRemaining(null);
      toast({ title: 'تم إلغاء مؤقت النوم' });
      return;
    }

    setSleepTimerMinutes(minutes);
    setSleepTimerRemaining(minutes * 60);
    toast({ title: `تم ضبط مؤقت النوم على ${minutes} دقيقة` });

    sleepTimerRef.current = setInterval(() => {
      setSleepTimerRemaining(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(sleepTimerRef.current!);
          setSleepTimerMinutes(null);
          if (isPlaying) togglePlay();
          toast({ title: 'انتهى وقت مؤقت النوم، تم إيقاف الصوت' });
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (sleepTimerRef.current) clearInterval(sleepTimerRef.current);
    };
  }, []);

  // Favorites
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('waqfah_podcast_favorites');
        if (saved) setFavoriteIds(JSON.parse(saved));
      } catch {}
    }
  }, []);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavoriteIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem('waqfah_podcast_favorites', JSON.stringify(next));
      toast({
        title: next.includes(id) ? 'تمت الإضافة إلى المفضلة' : 'تمت الإزالة من المفضلة'
      });
      return next;
    });
  };

  // Normalize Arabic text for robust search
  const normalizeArabic = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[\u064B-\u065F\u0670]/g, '') // remove tashkeel
      .replace(/[إأآا]/g, 'ا')
      .replace(/ة/g, 'ه')
      .replace(/ى/g, 'ي')
      .trim();
  };

  // Convert Lecture to playable RadioStation format
  const handlePlayEpisode = (lecture: Lecture) => {
    const streamUrl = lecture.audioSrc || lecture.youtubeUrl || '';
    if (!streamUrl) {
      toast({
        variant: 'destructive',
        title: 'عذراً، الرابط الصوتي غير متوفر لهذه الحلقة'
      });
      return;
    }

    const stationId = `podcast_${lecture.id}`;
    if (currentStation?.id === stationId) {
      togglePlay();
      return;
    }

    const station: RadioStation = {
      id: stationId,
      name: lecture.title,
      subtitle: lecture.programName || lecture.seriesTitle || 'بودكاست وقفة',
      url: streamUrl,
      icon: '🎙️',
      color: 'from-violet-500/20 to-violet-950/40',
      borderColor: 'border-violet-500/30',
      textColor: 'text-violet-400'
    };

    playStation(station);
  };

  // Filter & Sort lectures
  const filteredLectures = useMemo(() => {
    if (!allLectures) return [];
    let list = allLectures.filter(l => Boolean(l.audioSrc || l.youtubeUrl));

    // Category filter
    if (selectedCategory === 'favorites') {
      list = list.filter(l => favoriteIds.includes(l.id));
    } else if (selectedCategory === 'tazkiyah') {
      list = list.filter(l => 
        l.title.includes('قلب') || l.title.includes('نفس') || l.title.includes('تزكية') || l.title.includes('إيمان') || l.title.includes('صبر')
      );
    } else if (selectedCategory === 'seerah') {
      list = list.filter(l => 
        l.title.includes('سيرة') || l.title.includes('نبي') || l.title.includes('صحابة') || l.title.includes('تاريخ') || l.title.includes('غزوة')
      );
    } else if (selectedCategory === 'quran') {
      list = list.filter(l => 
        l.title.includes('قرآن') || l.title.includes('سورة') || l.title.includes('آية') || l.title.includes('تفسير') || l.title.includes('تدبر')
      );
    } else if (selectedCategory === 'contemporary') {
      list = list.filter(l => 
        l.title.includes('شبهة') || l.title.includes('فكر') || l.title.includes('عصر') || l.title.includes('إلحاد') || l.title.includes('معاصر')
      );
    }

    // Duration filter
    if (durationFilter === 'short') {
      list = list.filter(l => (l.duration || 0) > 0 && l.duration < 900); // < 15 mins
    } else if (durationFilter === 'medium') {
      list = list.filter(l => (l.duration || 0) >= 900 && l.duration <= 1800); // 15 - 30 mins
    } else if (durationFilter === 'long') {
      list = list.filter(l => (l.duration || 0) > 1800); // > 30 mins
    }

    // Search query with Arabic normalization
    if (searchQuery.trim()) {
      const q = normalizeArabic(searchQuery);
      list = list.filter(l => 
        normalizeArabic(l.title).includes(q) || 
        (l.description && normalizeArabic(l.description).includes(q)) ||
        (l.programName && normalizeArabic(l.programName).includes(q)) ||
        (l.seriesTitle && normalizeArabic(l.seriesTitle).includes(q))
      );
    }

    // Sorting
    if (sortBy === 'longest') {
      list.sort((a, b) => (b.duration || 0) - (a.duration || 0));
    } else if (sortBy === 'shortest') {
      list.sort((a, b) => (a.duration || 0) - (b.duration || 0));
    }

    return list;
  }, [allLectures, selectedCategory, durationFilter, searchQuery, favoriteIds, sortBy]);

  // Reset display count when filter or search changes
  useEffect(() => {
    setDisplayLimit(24);
  }, [selectedCategory, durationFilter, searchQuery, sortBy]);

  // Slice to visible count to keep DOM tree lightweight and memory footprint small
  const visibleLectures = useMemo(() => {
    return filteredLectures.slice(0, displayLimit);
  }, [filteredLectures, displayLimit]);

  // Spotlight Episode: First lecture or currently playing
  const spotlightEpisode = useMemo(() => {
    if (!allLectures || allLectures.length === 0) return null;
    return allLectures.find(l => Boolean(l.audioSrc || l.youtubeUrl)) || allLectures[0];
  }, [allLectures]);

  // Active playing lecture object
  const activeLecture = useMemo(() => {
    if (!currentStation || !currentStation.id.startsWith('podcast_')) return null;
    const lectureId = currentStation.id.replace('podcast_', '');
    return allLectures?.find(l => l.id === lectureId) || null;
  }, [currentStation, allLectures]);

  // Format seconds to mm:ss or hh:mm:ss
  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'حلقة صوتية';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h} س و ${m} د`;
    return `${m} دقيقة`;
  };

  const formatTimerDigits = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const copyRssUrl = (slug: string) => {
    if (typeof window === 'undefined') return;
    const url = `${window.location.origin}/api/podcasts/${slug}`;
    navigator.clipboard.writeText(url);
    setIsCopiedRss(true);
    setTimeout(() => setIsCopiedRss(false), 2500);
    toast({
      title: 'تم نسخ رابط الـ RSS بنجاح!',
      description: 'يمكنك الآن لصقه في تطبيق البودكاست المفضل لديك (Apple Podcasts, Spotify, Pocket Casts).'
    });
  };

  return (
    <div className="min-h-screen pb-44 space-y-12" dir="rtl">
      {/* ── Cinematic Hero Section ── */}
      <section className="relative mx-4 sm:mx-8 mt-4 sm:mt-6 pt-20 pb-20 px-6 md:px-12 flex flex-col items-center text-center overflow-hidden border border-violet-500/20 bg-gradient-to-b from-violet-950/40 via-zinc-950 to-zinc-950 rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-violet-500/15 blur-[150px] rounded-full" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-emerald-500/10 blur-[130px] rounded-full" />
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-4xl">
          <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-400 text-xs font-bold tracking-wider shadow-inner">
            <Mic2 className="w-4 h-4 text-violet-400 animate-pulse" />
            بودكاست وقفة الصوتي | Waqfah Podcast Hub
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black font-headline tracking-tight text-white leading-tight">
            أثير <span className="bg-clip-text text-transparent bg-gradient-to-l from-violet-400 via-fuchsia-300 to-white">الفكر والمعرفة</span> الإسلامية
          </h1>

          <p className="text-base sm:text-xl text-white/60 font-medium leading-relaxed max-w-2xl mx-auto">
            مكتبة صوتية راقية تضم مئات السلاسل والمحاضرات الفكرية، الإيمانية، والتاريخية، قابلة للاستماع المباشر والاشتراك عبر أشهر تطبيقات البودكاست.
          </p>

          {/* Quick Counter Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 max-w-xl mx-auto">
            <div className="p-4 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
              <div className="text-2xl sm:text-3xl font-black text-violet-400">{allLectures?.length || '450+'}</div>
              <div className="text-[11px] text-white/50 font-bold mt-0.5">حلقة صوتية</div>
            </div>
            <div className="p-4 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
              <div className="text-2xl sm:text-3xl font-black text-emerald-400">{allSeries?.length || '35+'}</div>
              <div className="text-[11px] text-white/50 font-bold mt-0.5">سلسلة بودكاست</div>
            </div>
            <div className="p-4 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl col-span-2 sm:col-span-1">
              <div className="text-2xl sm:text-3xl font-black text-amber-400">100%</div>
              <div className="text-[11px] text-white/50 font-bold mt-0.5">دعم خلاصات RSS</div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Active Podcast Live Top Player Dashboard (Styled like Radio) ── */}
      {spotlightEpisode && (
        <section className="container px-4 max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }}
            className="p-6 md:p-8 rounded-[2.5rem] bg-gradient-to-br from-zinc-900/95 via-zinc-900/80 to-zinc-950 border border-violet-500/40 backdrop-blur-2xl shadow-2xl relative overflow-hidden space-y-6"
          >
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-1/4 w-72 h-72 bg-violet-600/10 blur-[100px] pointer-events-none rounded-full" />
            <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-fuchsia-600/10 blur-[100px] pointer-events-none rounded-full" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Left/Start: Episode Thumbnail & Info */}
              <div className="lg:col-span-4 flex items-center gap-4 min-w-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-zinc-950 border border-violet-500/30 overflow-hidden relative shadow-xl shrink-0 flex items-center justify-center">
                  <img
                    src={(activeLecture || spotlightEpisode).youtubeUrl ? `https://img.youtube.com/vi/${(activeLecture || spotlightEpisode).youtubeUrl!.match(/([a-zA-Z0-9_-]{11})/)?.[1]}/hqdefault.jpg` : '/icon.jpg'}
                    alt={(activeLecture || spotlightEpisode).title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/icon.jpg'; }}
                  />
                  {isBuffering && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-violet-500/15 border-violet-500/40 text-violet-300 text-[10px] px-2 py-0.5">
                      {isPlaying ? (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-ping me-1" />
                          يتم التشغيل الآن
                        </>
                      ) : (
                        'بودكاست صوتي'
                      )}
                    </Badge>
                  </div>
                  <h2 className="text-lg md:text-xl font-black font-headline text-white truncate" title={(activeLecture || spotlightEpisode).title}>
                    {(activeLecture || spotlightEpisode).title}
                  </h2>
                  <p className="text-xs text-violet-400 truncate font-medium">
                    {(activeLecture || spotlightEpisode).programName || (activeLecture || spotlightEpisode).seriesTitle || 'بودكاست وقفة'}
                  </p>
                </div>
              </div>

              {/* Center: Interactive Visualizer Canvas & Mode Selector */}
              <div className="lg:col-span-4 flex flex-col items-center justify-center space-y-2">
                <div className="w-full h-16 rounded-2xl bg-black/50 border border-white/10 p-2 overflow-hidden flex items-center justify-center backdrop-blur-sm">
                  <canvas ref={canvasRef} className="w-full h-full" />
                </div>
                <div className="flex items-center gap-1.5">
                  {(['columns', 'waves', 'particles'] as const).map(style => (
                    <button
                      key={style}
                      onClick={() => setVisualizerStyle(style)}
                      className={cn(
                        "text-[10px] px-2.5 py-0.5 rounded-full transition-all font-medium",
                        visualizerStyle === style 
                          ? "bg-violet-600 text-white font-bold shadow-md shadow-violet-600/30" 
                          : "bg-white/5 text-white/40 hover:text-white"
                      )}
                    >
                      {style === 'columns' ? 'أعمدة' : style === 'waves' ? 'أمواج' : 'نبض'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Right/End: Volume Slider & Playback Controls */}
              <div className="lg:col-span-4 flex flex-col sm:flex-row items-center justify-end gap-4">
                {/* Volume slider */}
                <div className="flex items-center gap-2 w-full sm:w-28">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setVolume(volume > 0 ? 0 : 0.8)}
                    className="text-white/60 hover:text-white h-8 w-8 shrink-0"
                  >
                    {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </Button>
                  <Slider
                    value={[volume * 100]}
                    max={100}
                    step={1}
                    onValueChange={(val) => setVolume(val[0] / 100)}
                    className="w-full cursor-pointer"
                  />
                </div>

                {/* Tuner Navigation: -15s / Play / +15s */}
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => seekTo(Math.max(0, currentTime - 15))}
                    className="rounded-2xl w-10 h-10 border-white/10 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white"
                    title="تأخير 15 ثانية"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>

                  <Button
                    onClick={() => {
                      const ep = activeLecture || spotlightEpisode;
                      if (!currentStation || currentStation.id !== `podcast_${ep.id}`) {
                        handlePlayEpisode(ep);
                      } else {
                        togglePlay();
                      }
                    }}
                    className="rounded-full w-14 h-14 bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/30 shrink-0 transition-transform active:scale-95"
                  >
                    {isBuffering ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : isPlaying ? (
                      <Pause className="w-6 h-6 fill-current" />
                    ) : (
                      <Play className="w-6 h-6 fill-current ms-0.5" />
                    )}
                  </Button>

                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => seekTo(Math.min(duration || currentTime + 15, currentTime + 15))}
                    className="rounded-2xl w-10 h-10 border-white/10 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white"
                    title="تقديم 15 ثانية"
                  >
                    <RotateCw className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* ── Timeline / Scrubber Bar ── */}
            <div className="space-y-1 pt-2">
              <Slider
                value={[currentTime]}
                max={duration || (activeLecture || spotlightEpisode).duration || 100}
                step={1}
                onValueChange={(val) => seekTo(val[0])}
                className="w-full cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-white/40 font-mono">
                <span>{formatTimerDigits(currentTime)}</span>
                <span>{duration ? formatTimerDigits(duration) : formatDuration((activeLecture || spotlightEpisode).duration)}</span>
              </div>
            </div>

            {/* ── Sub-Bar: Ambient Sounds Accompaniment & Sleep Timer & Speed ── */}
            <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs">
              {/* Ambient Sounds */}
              <div className="flex items-center gap-2">
                <span className="text-white/40 font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                  أصوات مرافقة:
                </span>
                <div className="flex items-center gap-1.5">
                  {AMBIENT_SOUNDS.map(sound => (
                    <Button
                      key={sound.id}
                      size="sm"
                      variant="outline"
                      onClick={() => toggleAmbient(sound.id)}
                      className={cn(
                        "rounded-xl text-[11px] h-7 px-2.5 gap-1 transition-all",
                        activeAmbient === sound.id 
                          ? "bg-violet-600/30 border-violet-500/50 text-violet-300 font-bold" 
                          : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                      )}
                    >
                      <span>{sound.icon}</span>
                      <span>{sound.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Right Side: Speed Chips & Sleep Timer & Share */}
              <div className="flex items-center gap-2 ms-auto">
                {/* Speed Multiplier */}
                <div className="flex items-center rounded-xl bg-white/5 border border-white/10 p-0.5">
                  {[1, 1.25, 1.5, 2].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => setPlaybackRate(rate)}
                      className={cn(
                        "px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all",
                        playbackRate === rate ? "bg-violet-600 text-white" : "text-white/40 hover:text-white"
                      )}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>

                {/* Sleep Timer */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => startSleepTimer(sleepTimerMinutes ? sleepTimerMinutes : 30)}
                  className={cn(
                    "rounded-xl text-[11px] h-7 px-2.5 gap-1.5 transition-all",
                    sleepTimerRemaining ? "bg-amber-500/20 border-amber-500/40 text-amber-300 font-bold" : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                  )}
                >
                  <Moon className="w-3 h-3" />
                  <span>{sleepTimerRemaining ? `مؤقت: ${formatTimerDigits(sleepTimerRemaining)}` : 'مؤقت النوم'}</span>
                </Button>

                {/* Share Episode */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const ep = activeLecture || spotlightEpisode;
                    const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/lectures/${ep.slug}` : '';
                    if (navigator.share) {
                      navigator.share({ title: ep.title, url: shareUrl }).catch(() => {});
                    } else {
                      navigator.clipboard.writeText(shareUrl);
                      toast({ title: 'تم نسخ رابط الحلقة بنجاح' });
                    }
                  }}
                  className="rounded-xl text-[11px] h-7 px-2.5 border-white/10 bg-white/5 hover:bg-white/10 text-white/70 gap-1"
                >
                  <Share2 className="w-3 h-3" />
                  <span>مشاركة</span>
                </Button>
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
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث في حلقات وسلاسل البودكاست..."
              className="pr-11 rounded-2xl bg-zinc-900/60 border-white/10 text-white placeholder:text-white/30 h-12"
            />
          </div>

          {/* Controls: Duration, Sort & View Mode */}
          <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 justify-between md:justify-end">
            {/* Duration Filter Pills */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-xs text-white/40 font-bold shrink-0 me-1">المدة:</span>
              {[
                { id: 'all', label: 'الكل' },
                { id: 'short', label: 'أقل من 15 د' },
                { id: 'medium', label: '15 - 30 د' },
                { id: 'long', label: 'أكثر من 30 د' },
              ].map(d => (
                <button
                  key={d.id}
                  onClick={() => setDurationFilter(d.id as any)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 border",
                    durationFilter === d.id
                      ? "bg-violet-600 border-violet-500 text-white"
                      : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
                  )}
                >
                  {d.label}
                </button>
              ))}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-white/5 border border-white/10 p-1 rounded-xl shrink-0">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  "p-1.5 rounded-lg transition-colors",
                  viewMode === 'grid' ? "bg-violet-600 text-white" : "text-white/40 hover:text-white"
                )}
                title="عرض شبكي"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  "p-1.5 rounded-lg transition-colors",
                  viewMode === 'list' ? "bg-violet-600 text-white" : "text-white/40 hover:text-white"
                )}
                title="عرض قائمة"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {PODCAST_CATEGORIES.map(cat => {
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
                    ? "bg-violet-600 hover:bg-violet-500 text-white font-bold shadow-lg shadow-violet-600/20"
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

      {/* ── Main Content: Series or Episodes ── */}
      <section className="container px-4 max-w-6xl mx-auto">
        {selectedCategory === 'series' ? (
          /* Series Grid with Direct RSS Feeds */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-violet-400" />
                السلاسل البودكاستية المكتملة
              </h3>
              <span className="text-xs text-white/40 font-bold">{allSeries?.length || 0} سلسلة</span>
            </div>

            {isLoadingSeries ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-64 rounded-3xl bg-white/5 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {allSeries?.map(series => (
                  <div
                    key={series.id}
                    className="p-6 rounded-3xl bg-zinc-900/60 border border-white/10 hover:border-violet-500/40 transition-all space-y-4 flex flex-col justify-between group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="bg-violet-500/10 border-violet-500/30 text-violet-300 text-[10px]">
                          {series.lectureCount || 0} حلقة
                        </Badge>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setSelectedSeriesForRss(series)}
                          className="h-8 w-8 rounded-full text-white/40 hover:text-amber-400"
                          title="خلاصة البودكاست RSS"
                        >
                          <Rss className="w-4 h-4" />
                        </Button>
                      </div>

                      <h4 className="text-lg font-bold text-white group-hover:text-violet-300 transition-colors line-clamp-1">
                        {series.title}
                      </h4>
                      <p className="text-xs text-white/50 line-clamp-2 leading-relaxed">
                        {series.description || 'سلسلة بودكاستية متكاملة تتناول موضوعات علمية وإيمانية عميقة.'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                      <Link
                        href={`/series/${series.slug}`}
                        className="text-xs text-violet-400 hover:text-violet-300 font-bold flex items-center gap-1"
                      >
                        <span>عرض الحلقات</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyRssUrl(series.slug)}
                        className="rounded-xl text-[11px] h-8 border-white/10 bg-white/5 hover:bg-white/10 text-white/80 gap-1.5"
                      >
                        <Copy className="w-3 h-3 text-amber-400" />
                        <span>نسخ RSS</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Episodes Section: Grid or List */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Headphones className="w-5 h-5 text-violet-400" />
                حلقات البودكاست
              </h3>
              <span className="text-xs text-white/40 font-bold">{filteredLectures.length} حلقة متوفرة</span>
            </div>

            {isLoadingLectures ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-60 rounded-3xl bg-white/5 animate-pulse" />
                ))}
              </div>
            ) : filteredLectures.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-white/5 border border-white/10 space-y-3">
                <Mic2 className="w-10 h-10 text-white/20 mx-auto" />
                <h4 className="text-lg font-bold text-white">لم يتم العثور على حلقات</h4>
                <p className="text-xs text-white/50">جرب البحث بكلمات أخرى أو اختر تصنيفاً مختلفاً.</p>
              </div>
            ) : viewMode === 'list' ? (
              /* List View Mode */
              <div className="space-y-2">
                {visibleLectures.map((lecture, idx) => {
                  const isCurrent = currentStation?.id === `podcast_${lecture.id}`;
                  const isThisPlaying = isCurrent && isPlaying;
                  const isFav = favoriteIds.includes(lecture.id);

                  return (
                    <motion.div
                      key={lecture.id}
                      layout
                      onClick={() => handlePlayEpisode(lecture)}
                      className={cn(
                        "p-3 sm:p-4 rounded-2xl border transition-all cursor-pointer group flex items-center gap-4 relative overflow-hidden",
                        isCurrent
                          ? "bg-violet-600/15 border-violet-500/50 shadow-lg shadow-violet-600/10 ring-1 ring-violet-500/30"
                          : "bg-zinc-900/60 hover:bg-zinc-800/80 border-white/10 hover:border-white/20"
                      )}
                    >
                      {/* Index / Play indicator */}
                      <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-white/10 flex items-center justify-center shrink-0 text-xs font-bold text-white/60 group-hover:bg-violet-600 group-hover:text-white transition-colors">
                        {isThisPlaying ? (
                          <Pause className="w-4 h-4 fill-current text-violet-400 group-hover:text-white" />
                        ) : isCurrent ? (
                          <Play className="w-4 h-4 fill-current text-violet-400 group-hover:text-white ms-0.5" />
                        ) : (
                          <span>{(idx + 1).toString().padStart(2, '0')}</span>
                        )}
                      </div>

                      {/* Main Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-violet-400 font-bold truncate">
                            {lecture.programName || lecture.seriesTitle || 'بودكاست وقفة'}
                          </span>
                        </div>
                        <h4 className={cn(
                          "font-bold text-sm truncate group-hover:text-violet-300 transition-colors",
                          isCurrent ? "text-violet-400 font-black" : "text-white"
                        )}>
                          {lecture.title}
                        </h4>
                      </div>

                      {/* Duration */}
                      <div className="text-xs text-white/40 font-mono shrink-0 hidden sm:block">
                        {formatDuration(lecture.duration)}
                      </div>

                      {/* Quick Actions */}
                      <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={(e) => toggleFavorite(lecture.id, e)}
                          className={cn(
                            "h-8 w-8 rounded-full",
                            isFav ? "text-rose-500" : "text-white/30 hover:text-rose-400"
                          )}
                          title="إضافة للمفضلة"
                        >
                          <Heart className={cn("w-3.5 h-3.5", isFav && "fill-current")} />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/lectures/${lecture.slug}` : '';
                            if (navigator.share) {
                              navigator.share({
                                title: lecture.title,
                                url: shareUrl
                              }).catch(() => {});
                            } else {
                              navigator.clipboard.writeText(shareUrl);
                              toast({ title: 'تم نسخ رابط الحلقة بنجاح' });
                            }
                          }}
                          className="h-8 w-8 rounded-full text-white/30 hover:text-white"
                          title="مشاركة"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </Button>
                        <Link
                          href={`/lectures/${lecture.slug}`}
                          className="h-8 w-8 rounded-full text-white/30 hover:text-violet-400 inline-flex items-center justify-center"
                          title="عرض صفحة المادة"
                        >
                          <ArrowUpRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              /* Grid View Mode */
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {visibleLectures.map(lecture => {
                  const isCurrent = currentStation?.id === `podcast_${lecture.id}`;
                  const isThisPlaying = isCurrent && isPlaying;
                  const isFav = favoriteIds.includes(lecture.id);

                  return (
                    <motion.div
                      key={lecture.id}
                      layout
                      onClick={() => handlePlayEpisode(lecture)}
                      className={cn(
                        "p-4 rounded-3xl border transition-all cursor-pointer group flex flex-col justify-between relative overflow-hidden",
                        isCurrent
                          ? "bg-violet-600/15 border-violet-500/50 shadow-xl shadow-violet-600/15 ring-1 ring-violet-500/30"
                          : "bg-zinc-900/60 hover:bg-zinc-800/80 border-white/10 hover:border-white/20"
                      )}
                    >
                      {/* Top Row: Thumbnail + Play Overlay */}
                      <div className="relative aspect-video rounded-2xl bg-zinc-950 overflow-hidden mb-3">
                        <img
                          src={lecture.youtubeUrl ? `https://img.youtube.com/vi/${lecture.youtubeUrl.match(/([a-zA-Z0-9_-]{11})/)?.[1]}/hqdefault.jpg` : '/icon.jpg'}
                          alt={lecture.title}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => { (e.target as HTMLImageElement).src = '/icon.jpg'; }}
                        />
                        <div className={cn(
                          "absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity",
                          isThisPlaying ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                        )}>
                          <div className={cn(
                            "w-10 h-10 rounded-full text-white flex items-center justify-center shadow-lg transition-transform active:scale-90",
                            isThisPlaying ? "bg-violet-500 ring-4 ring-violet-500/30" : "bg-violet-600"
                          )}>
                            {isThisPlaying ? (
                              <Pause className="w-4 h-4 fill-current" />
                            ) : (
                              <Play className="w-4 h-4 fill-current ms-0.5" />
                            )}
                          </div>
                        </div>
                        <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-lg text-[10px] text-white/80 font-bold">
                          {formatDuration(lecture.duration)}
                        </div>
                      </div>

                      {/* Middle: Details */}
                      <div className="space-y-1.5 flex-1">
                        <p className="text-[11px] text-violet-400 font-bold truncate">
                          {lecture.programName || lecture.seriesTitle || 'بودكاست وقفة'}
                        </p>
                        <h4 className={cn(
                          "font-bold text-sm line-clamp-2 leading-snug group-hover:text-violet-300 transition-colors",
                          isCurrent ? "text-violet-400 font-black" : "text-white"
                        )}>
                          {lecture.title}
                        </h4>
                      </div>

                      {/* Bottom Row: Actions */}
                      <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/5">
                        <span className="text-[10px] text-white/40">
                          {isCurrent ? (isPlaying ? 'يتم التشغيل الآن' : 'متوقف مؤقتاً') : 'تشغيل الحلقة'}
                        </span>

                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={(e) => toggleFavorite(lecture.id, e)}
                            className={cn(
                              "h-7 w-7 rounded-full",
                              isFav ? "text-rose-500" : "text-white/30 hover:text-rose-400"
                            )}
                            title="إضافة للمفضلة"
                          >
                            <Heart className={cn("w-3.5 h-3.5", isFav && "fill-current")} />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/lectures/${lecture.slug}` : '';
                              if (navigator.share) {
                                navigator.share({
                                  title: lecture.title,
                                  url: shareUrl
                                }).catch(() => {});
                              } else {
                                navigator.clipboard.writeText(shareUrl);
                                toast({ title: 'تم نسخ رابط الحلقة بنجاح' });
                              }
                            }}
                            className="h-7 w-7 rounded-full text-white/30 hover:text-white"
                            title="مشاركة"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </Button>
                          <Link
                            href={`/lectures/${lecture.slug}`}
                            className="h-7 w-7 rounded-full text-white/30 hover:text-violet-400 inline-flex items-center justify-center"
                            title="عرض صفحة المادة"
                          >
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Load More Episodes Button */}
            {(filteredLectures.length > displayLimit || (allLectures && allLectures.length >= fetchLimit)) && (
              <div className="flex justify-center pt-8">
                <Button
                  onClick={() => {
                    setDisplayLimit(prev => prev + 24);
                    setFetchLimit(prev => prev + 48);
                  }}
                  size="lg"
                  className="rounded-full bg-violet-600/20 hover:bg-violet-600 text-violet-300 hover:text-white border border-violet-500/40 px-8 h-12 font-bold text-sm gap-2 transition-all shadow-lg hover:shadow-violet-600/20"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>تحميل المزيد من الحلقات</span>
                </Button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ── RSS Feed Info Modal ── */}
      <AnimatePresence>
        {selectedSeriesForRss && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setSelectedSeriesForRss(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg p-6 sm:p-8 rounded-[2.5rem] bg-zinc-900 border border-white/15 shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Rss className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">الاشتراك عبر تطبيقات البودكاست</h3>
                    <p className="text-xs text-white/50">{selectedSeriesForRss.title}</p>
                  </div>
                </div>
                <Button size="icon" variant="ghost" onClick={() => setSelectedSeriesForRss(null)} className="rounded-full text-white/50">
                  ✕
                </Button>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-white/70 leading-relaxed">
                  انسخ رابط الـ RSS المباشر التالي والصقه في أي تطبيق بودكاست تفضله (Apple Podcasts, Spotify, Pocket Casts, Castbox) للاستماع لجميع حلقات السلسلة ومتابعة جديدها تلقائياً:
                </p>

                <div className="flex items-center gap-2 p-3 rounded-2xl bg-zinc-950 border border-white/10">
                  <input
                    readOnly
                    value={typeof window !== 'undefined' ? `${window.location.origin}/api/podcasts/${selectedSeriesForRss.slug}` : ''}
                    className="bg-transparent text-xs text-amber-300 font-mono w-full outline-none"
                  />
                  <Button
                    size="sm"
                    onClick={() => copyRssUrl(selectedSeriesForRss.slug)}
                    className="rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shrink-0 gap-1.5"
                  >
                    {isCopiedRss ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopiedRss ? 'تم النسخ' : 'نسخ'}</span>
                  </Button>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button variant="ghost" onClick={() => setSelectedSeriesForRss(null)} className="rounded-xl text-xs">
                  إغلاق
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
