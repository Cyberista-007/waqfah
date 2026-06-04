
'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useQuranRadio } from '@/hooks/quran/use-quran-radio';
import { useQuranChat } from '@/hooks/quran/use-quran-chat';
import {
  SURAH_JUZ_MAPPING,
  JUZ_DATA,
  RECITERS,
  TAFSEERS,
  SCRIPTS,
  TOPICS,
  MEMO_PLANS,
  TRANSLATIONS,
  SEMANTIC_TOPICS,
  AMBIENT_SOUNDS,
  PREMIUM_RECITERS_STATIONS,
  MEMORIZATION_STATUS,
  CARD_THEMES,
  CARD_PATTERNS,
  CARD_FRAMES
} from '@/components/quran/quran-constants';
import type { SurahInfo, RadioStation } from '@/components/quran/quran-constants';
import {
  ModalPortal,
  PlanProgress,
  SurahInfoModal,
  ShareModal,
  ExamModal,
  WordAnalysisModal,
  CustomPlanModal,
  TajweedGuideModal,
  TafseerChatModal,
  QuickJumpModal
} from '@/components/quran/quran-modals';
import { VerseCard } from '@/components/quran/verse-card';
import { QuranNavDrawer } from '@/components/quran/quran-nav-drawer';
import { LOCAL_SCHOLAR_DB, getLocalFallbackExplanation } from '@/components/quran/local-scholar-db';

import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Copy, Share2, Check, Search, X,
  Layers, Heart, Star, Bookmark, LayoutGrid, Sparkles,
  Play, Pause, Volume2, Settings2, ArrowLeft, ArrowRight,
  Maximize2, Minimize2, Languages, History, Info,
  User, ChevronDown, Music, Quote, Download, Image as ImageIcon, ImagePlus,
  Palette, Edit3, Smartphone, Trophy, Target, CheckCircle2, Clock,
  Flame, BookmarkCheck, FileText, AlignRight, ChevronLeft, ChevronRight,
  Loader2, Mic, Eye, EyeOff, ChevronsDown, Map, Minus, Plus, Menu,
  Radio, VolumeX, Trash2, ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useReadingMode } from '@/components/reading-provider';
import { ReadingModeToggle } from '@/components/reading-mode-toggle';
import { useSync } from '@/hooks/useSync';
import { QURAN_DATA, Verse as VerseType } from '@/lib/quran-data';
import { LuminousMushaf } from '@/components/quran/luminous-mushaf';
import confetti from 'canvas-confetti';
import { useRadio } from '@/components/radio-provider';

// ━━━━━━━━━━━ TYPES & CONSTANTS ━━━━━━━━━━━

// ── Helper ──
const getYoutubeId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|live\/)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

// ━━━━━━━━━━━ MAIN PAGE ━━━━━━━━━━━

export default function QuranPage() {
  const { isReadingMode, fontSize } = useReadingMode();
  const { state, updateState } = useSync();
  const [view, setView] = useState<'full' | 'plan' | 'luminous' | 'radio'>('full');

  // ── Quran Radio Hook Integration ──
  const {
    currentStation: currentRadioStation,
    isPlayingRadio,
    isRadioBuffering,
    radioVolume,
    setRadioVolume,
    handlePlayRadio,
    handleToggleRadio,
    stopRadio,
    activeYoutubeId,
    radioSearchQuery,
    setRadioSearchQuery,
    favoriteRadioIds,
    setFavoriteRadioIds,
    radioStations,
    isLoadingRadios,
    customRadioStations,
    setCustomRadioStations,
    isAddCustomRadioOpen,
    setIsAddCustomRadioOpen,
    customRadioName,
    setCustomRadioName,
    customRadioUrl,
    setCustomRadioUrl,
    customRadioIcon,
    setCustomRadioIcon,
    isAmbientScreenSaver,
    setIsAmbientScreenSaver,
    radioQuality,
    setRadioQuality,
    radioHistory,
    isShareCopied,
    setIsShareCopied,
    radioCategory,
    setRadioCategory,
    visualizerStyle,
    setVisualizerStyle,
    alarmTime,
    setAlarmTime,
    isAlarmEnabled,
    setIsAlarmEnabled,
    alarmStationId,
    setAlarmStationId,
    isRecording,
    recordingDuration,
    listeningMinutes,
    canvasRef,
    radioAudioRef,
    toggleFavoriteRadio,
    startRecording,
    stopRecording,
    handleAddCustomRadio
  } = useQuranRadio();

  const [activeCollection, setActiveCollection] = useState(QURAN_DATA[0].id);
  const [activeTopic, setActiveTopic] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [surahs, setSurahs] = useState<SurahInfo[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<number | null>(null);
  const [surahContent, setSurahContent] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedReciter, setSelectedReciter] = useState(RECITERS[0]);
  const [selectedTafseer, setSelectedTafseer] = useState(TAFSEERS[0]);
  const [selectedScript, setSelectedScript] = useState(SCRIPTS[0]);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [playMode, setPlayMode] = useState<'ayah' | 'surah' | 'single'>('surah');
  const [isLoop, setIsLoop] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSurahInfo, setActiveSurahInfo] = useState<SurahInfo | null>(null);
  const [dailyVerse, setDailyVerse] = useState<any>(null);
  const [sharingVerse, setSharingVerse] = useState<any>(null);
  const [isExamOpen, setIsExamOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'ayah' | 'page'>('ayah');
  const [currentPage, setCurrentPage] = useState(1);
  const [recentSurahs, setRecentSurahs] = useState<number[]>([]);
  const [activeWordAnalysis, setActiveWordAnalysis] = useState<{ verse: any, wordIndex: number, wordData?: any, loading?: boolean, error?: boolean } | null>(null);
  const [mushafError, setMushafError] = useState(false);
  const [pageViewLayout, setPageViewLayout] = useState<'single' | 'double'>('double');
  const [showSidePanel, setShowSidePanel] = useState<boolean>(false);
  const [showPageReciterMenu, setShowPageReciterMenu] = useState<boolean>(false);
  const [navDrawerOpen, setNavDrawerOpen] = useState<boolean>(false);
  type NavTab = 'surahs' | 'juz' | 'bookmarks';
  const [navDrawerTab, setNavDrawerTab] = useState<NavTab>('surahs');

  // Audio repetition and looping states
  const [verseRepetition, setVerseRepetition] = useState<number>(1);
  const [verseRepetitionCount, setVerseRepetitionCount] = useState<number>(0);
  const [rangeLoopActive, setRangeLoopActive] = useState<boolean>(false);
  const [rangeStartVerse, setRangeStartVerse] = useState<any>(null);
  const [rangeEndVerse, setRangeEndVerse] = useState<any>(null);
  const [rangeLoopCount, setRangeLoopCount] = useState<number>(0);
  const [maxRangeLoop, setMaxRangeLoop] = useState<number>(1);

  // AI Speech Recitation Check states
  const [isTestingRecitation, setIsTestingRecitation] = useState<boolean>(false);
  const [testVerse, setTestVerse] = useState<any>(null);
  const [isListeningRecitation, setIsListeningRecitation] = useState<boolean>(false);
  const [testWordsResult, setTestWordsResult] = useState<any[] | null>(null);
  const [testMatchPercentage, setTestMatchPercentage] = useState<number>(0);

  // Dual-page image sources and loading states
  const [rightImgSrc, setRightImgSrc] = useState<string>('');
  const [isRightImageLoading, setIsRightImageLoading] = useState<boolean>(true);
  const [leftImgSrc, setLeftImgSrc] = useState<string>('');
  const [isLeftImageLoading, setIsLeftImageLoading] = useState<boolean>(true);
  const [rightImgError, setRightImgError] = useState<boolean>(false);
  const [leftImgError, setLeftImgError] = useState<boolean>(false);
  const [globalResults, setGlobalResults] = useState<any[]>([]);
  const [tafseerResults, setTafseerResults] = useState<any[]>([]);
  const [isSearchingGlobal, setIsSearchingGlobal] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);

  // ── Phase 2: New Smart Features States ──
  const [isHideRevealMode, setIsHideRevealMode] = useState<boolean>(false);
  const [quranHideMode, setQuranHideMode] = useState<'show' | 'hideFirst' | 'hideSecond' | 'hideAll'>('hideAll');
  const [isAutoScrollActive, setIsAutoScrollActive] = useState<boolean>(false);
  const [autoScrollSpeed, setAutoScrollSpeed] = useState<number>(3);
  const [pauseSecondsBetweenAyahs, setPauseSecondsBetweenAyahs] = useState<number>(0);
  const autoScrollRef = useRef<number | null>(null);
  const pauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const voiceRecognitionRef = useRef<any>(null);
  const [searchFilter, setSearchFilter] = useState<'all' | 'surahs' | 'verses' | 'tafseer'>('all');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Synchronize Radio & Quran Recitation: pause verse player when radio plays
  useEffect(() => {
    if (isPlayingRadio) {
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, [isPlayingRadio]);

  // ── Phase 3: Brand New Optimized & Developed Features States ──
  const [mushafType, setMushafType] = useState<'image' | 'digital'>('image');
  const [selectedTranslation, setSelectedTranslation] = useState(TRANSLATIONS[0]);
  const [activeAmbient, setActiveAmbient] = useState<string | null>(null);
  const [ambientVolume, setAmbientVolume] = useState<number>(0.3);
  const [isCustomPlanModalOpen, setIsCustomPlanModalOpen] = useState<boolean>(false);
  const [isTajweedGuideOpen, setIsTajweedGuideOpen] = useState<boolean>(false);
  const [customPagesInput, setCustomPagesInput] = useState<number>(2);
  const [customDurationInput, setCustomDurationInput] = useState<number>(6);
  const [customPlanType, setCustomPlanType] = useState<'pages' | 'duration'>('pages');
  const ambientAudioRef = useRef<HTMLAudioElement | null>(null);

  // ── Phase 4: Comparison & AI Chat Hook Integration ──
  const {
    isComparisonMode,
    setIsComparisonMode,
    selectedSecondaryTafseer,
    setSelectedSecondaryTafseer,
    selectedSecondaryTranslation,
    setSelectedSecondaryTranslation,
    activeChatVerse,
    setActiveChatVerse,
    chatMessages,
    setChatMessages,
    chatInput,
    setChatInput,
    isChatLoading,
    setIsChatLoading,
    chatConnectionMode,
    setChatConnectionMode,
    handleSendChatMessage,
    startTafseerChat
  } = useQuranChat();

  // ── Phase 5: Dynamic Typography Engine States ──
  const [isTypographyPanelOpen, setIsTypographyPanelOpen] = useState<boolean>(false);
  const [typoFontWeight, setTypoFontWeight] = useState<number>(400);
  const [typoLineHeight, setTypoLineHeight] = useState<number>(2.3);
  const [typoWordSpacing, setTypoWordSpacing] = useState<number>(0);
  const [typoLetterSpacing, setTypoLetterSpacing] = useState<number>(0);
  const [typoFontSize, setTypoFontSize] = useState<number>(32);

  // ── Sleep Timer, Surah Filters & Quick Jump States ──
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState<number>(0);
  const [customTimerMinutes, setCustomTimerMinutes] = useState<string>('');
  const sleepTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [surahTypeFilter, setSurahTypeFilter] = useState<'all' | 'Meccan' | 'Medinan'>('all');
  const [surahJuzFilter, setSurahJuzFilter] = useState<number>(0);
  const [quickJumpSurah, setQuickJumpSurah] = useState<number>(1);
  const [quickJumpAyah, setQuickJumpAyah] = useState<string>('');
  const [isQuickJumpOpen, setIsQuickJumpOpen] = useState<boolean>(false);

  // Sync typography to CSS variables
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--quran-weight', String(typoFontWeight));
    root.style.setProperty('--quran-line-height', String(typoLineHeight));
    root.style.setProperty('--quran-word-spacing', `${typoWordSpacing}px`);
    root.style.setProperty('--quran-kashida', `${typoLetterSpacing}em`);
    root.style.setProperty('--quran-font-size', `${typoFontSize}px`);
  }, [typoFontWeight, typoLineHeight, typoWordSpacing, typoLetterSpacing, typoFontSize]);

  // Persistence Effect
  useEffect(() => {
    const savedReciter = localStorage.getItem('quran_reciter');
    const savedTafseer = localStorage.getItem('quran_tafseer');
    const savedTranslation = localStorage.getItem('quran_translation');
    const savedMushafType = localStorage.getItem('quran_mushaf_type');
    const savedScript = localStorage.getItem('quran_script');
    const savedSpeed = localStorage.getItem('quran_speed');
    const savedHistory = localStorage.getItem('quran_search_history');
    const savedPlayMode = localStorage.getItem('quran_play_mode');

    if (savedReciter) setSelectedReciter(JSON.parse(savedReciter));
    if (savedTafseer) setSelectedTafseer(JSON.parse(savedTafseer));
    if (savedTranslation) setSelectedTranslation(JSON.parse(savedTranslation));
    if (savedMushafType) setMushafType(savedMushafType as any);
    if (savedScript) setSelectedScript(JSON.parse(savedScript));
    if (savedSpeed) setPlaybackSpeed(parseFloat(savedSpeed));
    if (savedHistory) setSearchHistory(JSON.parse(savedHistory));
    if (savedPlayMode) setPlayMode(savedPlayMode as any);
  }, []);

  // Handle tab routing from URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab === 'radio') {
        setView('radio');
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('quran_reciter', JSON.stringify(selectedReciter));
    localStorage.setItem('quran_tafseer', JSON.stringify(selectedTafseer));
    localStorage.setItem('quran_translation', JSON.stringify(selectedTranslation));
    localStorage.setItem('quran_mushaf_type', mushafType);
    localStorage.setItem('quran_script', JSON.stringify(selectedScript));
    localStorage.setItem('quran_speed', playbackSpeed.toString());
    localStorage.setItem('quran_play_mode', playMode);
  }, [selectedReciter, selectedTafseer, selectedTranslation, mushafType, selectedScript, playbackSpeed, playMode]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = playbackSpeed;
  }, [playbackSpeed, currentAudio]);

  useEffect(() => {
    const handleScroll = () => {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      setScrollProgress(scrolled);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ── Auto-Scroll (Tahajjud Mode) Effect ──
  useEffect(() => {
    if (isAutoScrollActive) {
      const scrollStep = () => {
        window.scrollBy(0, autoScrollSpeed * 0.4);
        autoScrollRef.current = requestAnimationFrame(scrollStep);
      };
      autoScrollRef.current = requestAnimationFrame(scrollStep);
    } else {
      if (autoScrollRef.current) {
        cancelAnimationFrame(autoScrollRef.current);
        autoScrollRef.current = null;
      }
    }
    return () => {
      if (autoScrollRef.current) {
        cancelAnimationFrame(autoScrollRef.current);
        autoScrollRef.current = null;
      }
    };
  }, [isAutoScrollActive, autoScrollSpeed]);

  // ── Cleanup pause timer on unmount ──
  useEffect(() => {
    return () => {
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    };
  }, []);

  // ── Ambient Sound Control Effect ──
  useEffect(() => {
    if (!ambientAudioRef.current && typeof Audio !== 'undefined') {
      ambientAudioRef.current = new Audio();
      ambientAudioRef.current.loop = true;
    }

    if (activeAmbient) {
      const sound = AMBIENT_SOUNDS.find(s => s.id === activeAmbient);
      if (sound && ambientAudioRef.current) {
        ambientAudioRef.current.src = sound.url;
        ambientAudioRef.current.volume = ambientVolume;
        ambientAudioRef.current.play().catch(e => console.warn("Failed to play ambient sound:", e));
      }
    } else {
      if (ambientAudioRef.current) {
        ambientAudioRef.current.pause();
      }
    }
  }, [activeAmbient]);

  useEffect(() => {
    if (ambientAudioRef.current) {
      ambientAudioRef.current.volume = ambientVolume;
    }
  }, [ambientVolume]);

  useEffect(() => {
    return () => {
      if (ambientAudioRef.current) {
        ambientAudioRef.current.pause();
        ambientAudioRef.current = null;
      }
    };
  }, []);

  

  

  // ── Sleep Timer Logic ──
  const startSleepTimer = useCallback((minutes: number) => {
    if (sleepTimerRef.current) clearInterval(sleepTimerRef.current);
    setSleepTimerMinutes(minutes);
    setSleepTimerRemaining(minutes * 60);
    sleepTimerRef.current = setInterval(() => {
      setSleepTimerRemaining(prev => {
        if (prev <= 1) {
          // Time's up - stop all audio
          stopRadio();
          if (audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
          }

          clearInterval(sleepTimerRef.current!);
          sleepTimerRef.current = null;
          setSleepTimerMinutes(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [stopRadio, setIsPlaying]);

  const cancelSleepTimer = useCallback(() => {
    if (sleepTimerRef.current) clearInterval(sleepTimerRef.current);
    sleepTimerRef.current = null;
    setSleepTimerMinutes(null);
    setSleepTimerRemaining(0);
  }, []);

  useEffect(() => {
    return () => { if (sleepTimerRef.current) clearInterval(sleepTimerRef.current); };
  }, []);

  

  useEffect(() => {
    fetch('https://api.alquran.cloud/v1/surah').then(res => res.json()).then(data => setSurahs(data.data));
    const recents = JSON.parse(localStorage.getItem('quran_recents') || '[]');
    setRecentSurahs(recents);
    const randomAyah = Math.floor(Math.random() * 6236) + 1;
    fetch(`https://api.alquran.cloud/v1/ayah/${randomAyah}/editions/${selectedScript.edition},ar.jalalayn`).then(res => res.json()).then(data => {
      const scriptData = data.data[0]; const jalalayn = data.data[1];
      setDailyVerse({ id: scriptData.number, arabic: scriptData.text, tafseer: jalalayn.text, surah: scriptData.surah.name, ayahNumber: scriptData.numberInSurah });
    });
  }, [selectedScript]);


  const loadSurah = useCallback(async (num: number) => {
    setIsLoading(true); setSelectedSurah(num);
    setRecentSurahs(prev => {
      const newRecents = [num, ...prev.filter(n => n !== num)].slice(0, 4);
      localStorage.setItem('quran_recents', JSON.stringify(newRecents));
      return newRecents;
    });
    try {
      const [scriptData, tafseer, translationData, secTafseerData, secTranslationData] = await Promise.all([
        fetch(`https://api.alquran.cloud/v1/surah/${num}/editions/${selectedScript.edition}`).then(res => res.json()),
        fetch(`https://api.alquran.cloud/v1/surah/${num}/${selectedTafseer.id}`).then(res => res.json()),
        fetch(`https://api.alquran.cloud/v1/surah/${num}/${selectedTranslation.id}`).then(res => res.json()),
        fetch(`https://api.alquran.cloud/v1/surah/${num}/${selectedSecondaryTafseer.id}`).then(res => res.json()),
        fetch(`https://api.alquran.cloud/v1/surah/${num}/${selectedSecondaryTranslation.id}`).then(res => res.json())
      ]);
      const combined = scriptData.data[0].ayahs.map((ayah: any, i: number) => ({
        id: ayah.number,
        surah: scriptData.data[0].name,
        surahNumber: num,
        ayahNumber: ayah.numberInSurah,
        arabic: ayah.text,
        tafseer: tafseer.data.ayahs[i].text,
        translation: translationData?.data?.ayahs?.[i]?.text || '',
        secondaryTafseer: secTafseerData?.data?.ayahs?.[i]?.text || '',
        secondaryTranslation: secTranslationData?.data?.ayahs?.[i]?.text || '',
        sajdah: ayah.sajdah,
        page_number: ayah.page || 1,
        juz_number: ayah.juz || 1
      }));

      // Clean Bismillah from first verse if surah is not Fatiha (1) or Tawbah (9)
      if (num !== 1 && num !== 9 && combined.length > 0) {
        // Very aggressive regex to handle almost all Bismillah variations across different APIs/Scripts
        const bismillahPattern = /^بِسْمِ[\s\S]*?الرَّحِيْمِ\s*|^بِسْمِ[\s\S]*?الرَّحِيمِ\s*/;
        combined[0].arabic = combined[0].arabic.replace(bismillahPattern, "").trim();
      }

      setSurahContent(combined);
      // Immediately set current page to the first page of this surah
      if (combined.length > 0) {
        setCurrentPage(combined[0].page_number);
      }
    } catch (e) { console.error(e); } finally { setIsLoading(false); }
  }, [selectedTafseer, selectedScript, selectedTranslation, selectedSecondaryTafseer, selectedSecondaryTranslation]);

  // Effect to reload surah when tafseer, translation or script changes
  useEffect(() => {
    if (selectedSurah) loadSurah(selectedSurah);
  }, [selectedTafseer, selectedScript, selectedTranslation, selectedSecondaryTafseer, selectedSecondaryTranslation, loadSurah, selectedSurah]);

  const rightPage = useMemo(() => {
    return pageViewLayout === 'double' ? (currentPage % 2 === 0 ? currentPage - 1 : currentPage) : currentPage;
  }, [currentPage, pageViewLayout]);

  const leftPage = useMemo(() => {
    return rightPage + 1;
  }, [rightPage]);

  // Load right page image
  useEffect(() => {
    setRightImgError(false);
    setIsRightImageLoading(true);
    setRightImgSrc(`https://quran.islam-db.com/public/data/pages/quranpages_1920/images/page${String(rightPage).padStart(3, '0')}.png`);
  }, [rightPage]);

  // Load left page image
  useEffect(() => {
    setLeftImgError(false);
    setIsLeftImageLoading(true);
    setLeftImgSrc(`https://quran.islam-db.com/public/data/pages/quranpages_1920/images/page${String(leftPage).padStart(3, '0')}.png`);
  }, [leftPage]);

  // Fallback handlers
  const handleRightImageError = useCallback(() => {
    if (rightImgSrc.includes('quranpages_1920')) {
      setRightImgSrc(`https://quran.islam-db.com/public/data/pages/quranpages_1024/images/page${String(rightPage).padStart(3, '0')}.png`);
    } else {
      setRightImgError(true);
    }
  }, [rightImgSrc, rightPage]);

  const handleLeftImageError = useCallback(() => {
    if (leftImgSrc.includes('quranpages_1920')) {
      setLeftImgSrc(`https://quran.islam-db.com/public/data/pages/quranpages_1024/images/page${String(leftPage).padStart(3, '0')}.png`);
    } else {
      setLeftImgError(true);
    }
  }, [leftImgSrc, leftPage]);

  // If right image fails, or both fail, we fallback to text
  useEffect(() => {
    if (pageViewLayout === 'double') {
      if (rightImgError && leftImgError) {
        setMushafError(true);
      } else {
        setMushafError(false);
      }
    } else {
      if (rightImgError) {
        setMushafError(true);
      } else {
        setMushafError(false);
      }
    }
  }, [rightImgError, leftImgError, pageViewLayout]);

  const normalizeArabic = (text: string) => {
    if (!text) return '';
    return text
      .replace(/[\u064B-\u065F\u06D6-\u06ED]/g, "")
      .replace(/[أإآ]/g, "ا")
      .replace(/ة/g, "ه")
      .replace(/ى/g, "ي")
      .trim();
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query || !text) return text;
    const normalizedQuery = normalizeArabic(query.toLowerCase());
    const words = text.split(' ');

    return words.map((word, i) => {
      const normalizedWord = normalizeArabic(word.toLowerCase());
      if (normalizedWord.includes(normalizedQuery)) {
        return (
          <span key={i} className="text-primary drop-shadow-glow-primary font-black">
            {word}{' '}
          </span>
        );
      }
      return word + ' ';
    });
  };

  const filteredSurahs = useMemo(() => {
    let result = surahs;
    const query = normalizeArabic(searchQuery.toLowerCase());
    if (query) {
      result = result.filter(s =>
        normalizeArabic(s.name).includes(query) ||
        s.englishName.toLowerCase().includes(query) ||
        s.number.toString() === query
      );
    }

    if (surahTypeFilter !== 'all') {
      result = result.filter(s => s.revelationType === surahTypeFilter);
    }

    if (surahJuzFilter > 0) {
      result = result.filter(s => SURAH_JUZ_MAPPING[s.number] === surahJuzFilter);
    }

    return result;
  }, [surahs, searchQuery, surahTypeFilter, surahJuzFilter]);

  const semanticResults = useMemo(() => {
    const query = normalizeArabic(searchQuery.trim().toLowerCase());
    if (!query || query.length < 2) return [];

    const foundTopic = SEMANTIC_TOPICS.find(topic =>
      topic.keywords.some(keyword => query.includes(normalizeArabic(keyword)) || normalizeArabic(keyword).includes(query))
    );

    if (!foundTopic) return [];

    return foundTopic.ayahs.map((a, index) => {
      const surahObj = surahs.find(s => s.number === a.surah);
      const surahName = surahObj ? surahObj.name : 'سورة مجهولة';
      return {
        id: a.surah * 1000 + a.ayah,
        surah: surahName,
        surahNumber: a.surah,
        ayahNumber: a.ayah.toString(),
        arabic: a.text,
        tafseer: `مطابقة دلالية لموضوع: ${foundTopic.title}`,
        type: 'verse',
        isSemantic: true,
        semanticTitle: foundTopic.title
      };
    });
  }, [searchQuery, surahs]);

  const searchResults = useMemo(() => {
    const query = normalizeArabic(searchQuery.trim());
    if (!query || query.length < 2) return [];

    const results: any[] = [];

    // 0. Prepend Semantic Results
    semanticResults.forEach(v => {
      results.push({
        ...v,
        accentColor: 'text-emerald-400',
        border: 'border-emerald-500/20'
      });
    });

    // 1. Search in global results first (most accurate for broad search)
    globalResults.forEach(v => {
      if (!results.some(r => r.surahNumber === v.surahNumber && r.ayahNumber.toString() === v.ayahNumber.toString())) {
        results.push({
          ...v,
          type: 'verse',
          accentColor: 'text-primary',
          border: 'border-primary/20',
          isGlobal: true
        });
      }
    });

    // 2. Search in selected collections
    if (results.length < 10) {
      QURAN_DATA.forEach(col => {
        col.verses.forEach(v => {
          if (normalizeArabic(v.arabic).includes(query) || normalizeArabic(v.tafseer).includes(query)) {
            if (!results.some(r => r.surahNumber === v.surahNumber && r.ayahNumber.toString() === v.ayahNumber.toString())) {
              results.push({ ...v, type: 'verse', accentColor: col.color, border: col.border });
            }
          }
        });
      });
    }

    // 3. Search in currently loaded surah content
    if (surahContent.length > 0 && results.length < 15) {
      surahContent.forEach(v => {
        if (normalizeArabic(v.arabic).includes(query) || normalizeArabic(v.tafseer).includes(query)) {
          if (!results.some(r => r.surahNumber === v.surahNumber && r.ayahNumber.toString() === v.ayahNumber.toString())) {
            results.push({ ...v, type: 'verse', accentColor: 'text-primary', border: 'border-primary/20' });
          }
        }
      });
    }

    return results.slice(0, 30);
  }, [searchQuery, surahContent, globalResults, semanticResults]);

  // Global Search Effect (Debounced)
  useEffect(() => {
    const query = searchQuery.trim();
    if (query.length < 3) {
      setGlobalResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingGlobal(true);
      try {
        // Save to history if query is significant
        if (query.length > 3) {
          setSearchHistory(prev => {
            const next = [query, ...prev.filter(h => h !== query)].slice(0, 6);
            localStorage.setItem('quran_search_history', JSON.stringify(next));
            return next;
          });
        }

        // Fetch BOTH Quran and Tafseer results for separate tabs
        const [quranRes, tafseerRes] = await Promise.all([
          fetch(`https://api.alquran.cloud/v1/search/${query}/all/quran-simple`),
          fetch(`https://api.alquran.cloud/v1/search/${query}/all/ar.muyassar`)
        ]);

        const [quranData, tafseerData] = await Promise.all([quranRes.json(), tafseerRes.json()]);

        if (quranData.data && quranData.data.matches) {
          setGlobalResults(quranData.data.matches.map((m: any) => ({
            id: m.number,
            surah: m.surah.name,
            surahNumber: m.surah.number,
            ayahNumber: m.numberInSurah,
            arabic: m.text,
            type: 'verse',
            page_number: m.page
          })));
        }

        if (tafseerData.data && tafseerData.data.matches) {
          setTafseerResults(tafseerData.data.matches.map((m: any) => ({
            id: m.number,
            surah: m.surah.name,
            surahNumber: m.surah.number,
            ayahNumber: m.numberInSurah,
            arabic: m.text,
            type: 'tafseer',
            page_number: m.page
          })));
        }
      } catch (e) {
        console.error("Global search failed", e);
      } finally {
        setIsSearchingGlobal(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchResultClick = (v: any) => {
    setView('full');
    setViewMode('ayah');
    setSelectedSurah(v.surahNumber);
    loadSurah(v.surahNumber);
    setSearchQuery('');

    let attempts = 0;
    const scrollInterval = setInterval(() => {
      const el = document.getElementById(`verse-${v.id}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-4', 'ring-primary/40', 'ring-offset-8');
        setTimeout(() => el.classList.remove('ring-4', 'ring-primary/40', 'ring-offset-8'), 3000);
        clearInterval(scrollInterval);
      }
      if (attempts++ > 15) clearInterval(scrollInterval);
    }, 400);
  };

  const getGlobalVerseNumber = useCallback((surahNum: number, ayahNum: number) => {
    let count = 0;
    for (let i = 1; i < surahNum; i++) {
      const s = surahs.find(item => item.number === i);
      if (s) count += s.numberOfAyahs;
    }
    return count + ayahNum;
  }, [surahs]);

  const handleQuickJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickJumpSurah) return;

    setIsQuickJumpOpen(false);
    setSelectedSurah(quickJumpSurah);
    loadSurah(quickJumpSurah);
    setView('full');
    setViewMode('ayah');

    if (quickJumpAyah) {
      const ayahNum = Number(quickJumpAyah);
      if (!isNaN(ayahNum)) {
        const targetGlobalId = getGlobalVerseNumber(quickJumpSurah, ayahNum);
        let attempts = 0;
        const scrollInterval = setInterval(() => {
          const el = document.getElementById(`verse-${targetGlobalId}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.classList.add('ring-4', 'ring-primary/40', 'ring-offset-8');
            setTimeout(() => el.classList.remove('ring-4', 'ring-primary/40', 'ring-offset-8'), 3000);
            clearInterval(scrollInterval);
          }
          if (attempts++ > 20) clearInterval(scrollInterval);
        }, 300);
      }
    }
  };

  const toggleBookmark = (verse: any) => {
    const currentBookmarks = state.favorites || [];
    const id = `quran_${verse.id}`;
    if (currentBookmarks.includes(id)) { updateState({ favorites: currentBookmarks.filter(b => b !== id) }); }
    else { updateState({ favorites: [...currentBookmarks, id] }); }
  };

  const updateMemorization = (surahNum: number, status: keyof typeof MEMORIZATION_STATUS) => {
    const currentProg = state.quranMemorization || {};
    updateState({ quranMemorization: { ...currentProg, [surahNum]: status } });
  };

  const memorizedVerses = useMemo(() => {
    const list: any[] = [];
    QURAN_DATA.forEach(col => {
      col.verses.forEach(v => {
        if (state.quranMemorization?.[v.surahNumber] === 'completed') {
          list.push(v);
        }
      });
    });
    return list;
  }, [state.quranMemorization]);

  const pages = useMemo(() => {
    if (!selectedSurah || surahContent.length === 0) return {};
    const grouped: { [key: number]: any[] } = {};
    surahContent.forEach((v: any) => {
      const p = v.page_number || 1;
      if (!grouped[p]) grouped[p] = [];
      grouped[p].push(v);
    });
    return grouped;
  }, [selectedSurah, surahContent]);

  const pageNumbers = useMemo(() => Object.keys(pages).map(Number).sort((a, b) => a - b), [pages]);

  // Touch gesture state and handlers for page flipping
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (touchStart === null || touchEnd === null) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    const currentIndex = pageNumbers.indexOf(currentPage);
    if (currentIndex === -1) return;

    if (isLeftSwipe) {
      // Swiping left (finger moves left) -> previous page in RTL
      if (currentIndex > 0) {
        setCurrentPage(pageNumbers[currentIndex - 1]);
      }
    } else if (isRightSwipe) {
      // Swiping right (finger moves right) -> next page in RTL
      if (currentIndex < pageNumbers.length - 1) {
        setCurrentPage(pageNumbers[currentIndex + 1]);
      }
    }
  }, [touchStart, touchEnd, pageNumbers, currentPage]);

  const memorizationStats = useMemo(() => {
    const prog = state.quranMemorization || {};
    const completed = Object.values(prog).filter(s => s === 'completed' || s === 'reviewed').length;
    return { completed, percentage: Math.round((completed / 114) * 100) };
  }, [state.quranMemorization]);

  const handlePlayVerse = useCallback((verse: any) => {
    if (currentAudio?.id === verse.id) {
      if (isPlaying) { audioRef.current?.pause(); setIsPlaying(false); }
      else { audioRef.current?.play(); setIsPlaying(true); }
      return;
    }

    // Stop radio if playing
    if (isPlayingRadio) {
      stopRadio();
    }

    setCurrentAudio(verse);
    setIsPlaying(true);
    if (audioRef.current) {
      audioRef.current.src = `https://cdn.islamic.network/quran/audio/128/${selectedReciter.id}/${verse.id}.mp3`;
      audioRef.current.playbackRate = playbackSpeed;
      audioRef.current.play();
    }
  }, [selectedReciter, isPlaying, currentAudio, playbackSpeed, isPlayingRadio, stopRadio]);




  const cleanArabicText = useCallback((text: string) => {
    if (!text) return '';
    return text
      .replace(/[\u064B-\u065F\u06D6-\u06ED\u0670\u0671\u06E5\u06E6]/g, "") // remove tashkeel & quran stop signs
      .replace(/[أإآٱ]/g, "ا")
      .replace(/ة/g, "ه")
      .replace(/ى/g, "ي")
      .replace(/ؤ/g, "و")
      .replace(/ئ/g, "ي")
      .replace(/[\.\,\?\!\-\،\؛\؟]/g, "") // remove punctuation
      .replace(/\s+/g, " ")
      .trim();
  }, []);

  const compareRecitation = useCallback((spokenText: string, originalText: string) => {
    const origWords = originalText.split(/\s+/);
    const spokenWords = spokenText.split(/\s+/);

    const results = [];
    let sp = 0;
    let correctCount = 0;

    for (let i = 0; i < origWords.length; i++) {
      const origWord = origWords[i];
      const normOrig = cleanArabicText(origWord);

      let matched = false;
      // lookahead window of 4 words in spoken text
      for (let offset = 0; offset < 4; offset++) {
        const checkIndex = sp + offset;
        if (checkIndex < spokenWords.length) {
          const normSpoken = cleanArabicText(spokenWords[checkIndex]);
          if (normOrig === normSpoken || normOrig.includes(normSpoken) || normSpoken.includes(normOrig)) {
            matched = true;
            sp = checkIndex + 1;
            break;
          }
        }
      }

      if (matched) {
        results.push({ word: origWord, status: 'correct' });
        correctCount++;
      } else {
        results.push({ word: origWord, status: 'incorrect' });
      }
    }

    const percentage = origWords.length > 0 ? Math.round((correctCount / origWords.length) * 100) : 0;
    return { results, percentage };
  }, [cleanArabicText]);

  const startListeningRecitation = useCallback((verse: any) => {
    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      alert('متصفحك لا يدعم التحليل الصوتي المتقدم. يُرجى استخدام متصفح Chrome أو Edge.');
      return;
    }

    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    }

    setTestVerse(verse);
    setIsTestingRecitation(true);
    setIsListeningRecitation(true);
    setTestWordsResult(null);
    setTestMatchPercentage(0);

    const recognition = new SpeechRecognitionAPI();
    voiceRecognitionRef.current = recognition;
    recognition.lang = 'ar-SA';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (e: any) => {
      let currentTranscript = '';
      for (let i = 0; i < e.results.length; ++i) {
        currentTranscript += e.results[i][0].transcript + ' ';
      }

      if (currentTranscript.trim()) {
        const { results, percentage } = compareRecitation(currentTranscript, verse.arabic);
        setTestWordsResult(results);
        setTestMatchPercentage(percentage);
      }
    };

    recognition.onend = () => setIsListeningRecitation(false);
    recognition.start();
  }, [compareRecitation, isPlaying]);

  const stopListeningRecitation = useCallback(() => {
    if (voiceRecognitionRef.current) {
      voiceRecognitionRef.current.stop();
      voiceRecognitionRef.current = null;
    }
    setIsListeningRecitation(false);
  }, []);

  const handleAudioEnded = useCallback(() => {
    // 1. Verse Repetition
    if (verseRepetition > 1 && verseRepetitionCount < verseRepetition - 1) {
      setVerseRepetitionCount(prev => prev + 1);
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
      return;
    } else {
      setVerseRepetitionCount(0);
    }

    // 2. Loop Verse (Legacy loop toggle)
    if (isLoop) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
      return;
    }

    // 3. Range Loop Active
    if (rangeLoopActive && rangeStartVerse && rangeEndVerse) {
      if (currentAudio?.id === rangeEndVerse.id) {
        if (rangeLoopCount + 1 < maxRangeLoop) {
          setRangeLoopCount(prev => prev + 1);
          handlePlayVerse(rangeStartVerse);
        } else {
          setIsPlaying(false);
          setRangeLoopCount(0);
        }
        return;
      } else {
        const idx = surahContent.findIndex(v => v.id === currentAudio?.id);
        if (idx !== -1 && idx < surahContent.length - 1) {
          const nextVerse = surahContent[idx + 1];
          if (nextVerse.id <= rangeEndVerse.id) {
            handlePlayVerse(nextVerse);
            return;
          }
        }
        setIsPlaying(false);
        return;
      }
    }

    // 4. Normal Autoplay
    if (playMode === 'single') {
      setIsPlaying(false);
      return;
    }

    let nextVerse = null;
    if (playMode === 'surah') {
      const idx = surahContent.findIndex(v => v.id === currentAudio?.id);
      if (idx !== -1 && idx < surahContent.length - 1) {
        nextVerse = surahContent[idx + 1];
        if (viewMode === 'page' && nextVerse.page && nextVerse.page !== currentPage) {
          setCurrentPage(nextVerse.page);
        }
      }
    } else {
      if (viewMode === 'ayah') {
        const idx = surahContent.findIndex(v => v.id === currentAudio?.id);
        if (idx !== -1 && idx < surahContent.length - 1) nextVerse = surahContent[idx + 1];
      } else {
        const currentPageVerses = pages[currentPage] || [];
        const idx = currentPageVerses.findIndex(v => v.id === currentAudio?.id);
        if (idx !== -1 && idx < currentPageVerses.length - 1) {
          nextVerse = currentPageVerses[idx + 1];
        } else {
          const pageIndex = pageNumbers.indexOf(currentPage);
          if (pageIndex !== -1 && pageIndex < pageNumbers.length - 1) {
            const nextPage = pageNumbers[pageIndex + 1];
            setCurrentPage(nextPage);
            const nextPageVerses = pages[nextPage] || [];
            if (nextPageVerses.length > 0) {
              nextVerse = nextPageVerses[0];
            }
          }
        }
      }
    }

    if (nextVerse) {
      if (pauseSecondsBetweenAyahs > 0) {
        // Clear any previous pause timer
        if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
        pauseTimerRef.current = setTimeout(() => {
          handlePlayVerse(nextVerse);
        }, pauseSecondsBetweenAyahs * 1000);
      } else {
        handlePlayVerse(nextVerse);
      }
    } else {
      setIsPlaying(false);
    }
  }, [
    verseRepetition,
    verseRepetitionCount,
    isLoop,
    rangeLoopActive,
    rangeStartVerse,
    rangeEndVerse,
    rangeLoopCount,
    maxRangeLoop,
    playMode,
    viewMode,
    surahContent,
    pages,
    currentPage,
    pageNumbers,
    currentAudio,
    handlePlayVerse,
    pauseSecondsBetweenAyahs
  ]);



  const activatePlan = (planId: string) => {
    if (planId === 'custom') {
      setIsCustomPlanModalOpen(true);
      return;
    }
    updateState({
      activeMemoPlan: {
        planId,
        startDate: new Date().toISOString(),
        dailyReminderTime: '08:00'
      }
    });
    // Request notification permission
    if (typeof window !== "undefined" && "Notification" in window) {
      Notification.requestPermission();
    }
  };

  const handleExamComplete = (points: number) => {
    updateState({ points: (state.points || 0) + points });
  };

  
  
  const saveCustomPlan = () => {
    let pagesPerDay = customPagesInput;
    let months = 0;
    if (customPlanType === 'duration') {
      months = customDurationInput;
      pagesPerDay = Math.round((604 / (months * 30)) * 10) / 10;
    }
    updateState({
      activeMemoPlan: {
        planId: 'custom',
        startDate: new Date().toISOString(),
        dailyReminderTime: '08:00',
        customPagesPerDay: pagesPerDay,
        customMonths: months
      }
    });
    setIsCustomPlanModalOpen(false);
  };

  const getDailyWord = useCallback(() => {
    if (!state.activeMemoPlan) return null;
    const plan = MEMO_PLANS.find(p => p.id === state.activeMemoPlan?.planId);
    if (!plan) return { page: 1, surah: 'البقرة' };

    let pagesPerDay = plan.pagesPerDay;
    if (plan.id === 'custom') {
      pagesPerDay = state.activeMemoPlan.customPagesPerDay || 1.0;
    }

    const start = new Date(state.activeMemoPlan.startDate);
    const today = new Date();
    const diffDays = Math.floor((today.getTime() - start.getTime()) / (1000 * 3600 * 24));

    const targetPage = Math.min(604, Math.floor(diffDays * pagesPerDay) + 1);

    // Simple lookup for surah based on page (could be more precise with a full map)
    let surah = 'البقرة';
    if (targetPage > 582) surah = 'النبأ';
    else if (targetPage > 562) surah = 'الملك';
    else if (targetPage > 526) surah = 'الواقعة';
    else if (targetPage > 499) surah = 'الأحقاف';
    else if (targetPage > 440) surah = 'يس';
    else if (targetPage > 282) surah = 'الإسراء';
    else if (targetPage > 177) surah = 'الأعراف';

    return { page: targetPage, surah };
  }, [state.activeMemoPlan]);

  const dailyWord = useMemo(() => getDailyWord(), [getDailyWord]);

  useEffect(() => {
    if (pageNumbers.length > 0 && !pageNumbers.includes(currentPage)) {
      setCurrentPage(pageNumbers[0]);
    }
  }, [pageNumbers, currentPage]);

  const handleShare = useCallback((verse: any) => {
    setSharingVerse({ ...verse, fontClass: selectedScript.font });
  }, [selectedScript]);

  const streak = useMemo(() => {
    // Simple streak logic (could be more complex with actual dates)
    return memorizationStats.completed > 0 ? (memorizationStats.completed % 7) + 1 : 0;
  }, [memorizationStats]);

  const filteredStations = useMemo(() => {
    let list: RadioStation[] = [];

    if (radioCategory === 'custom') {
      list = customRadioStations;
    } else if (radioCategory === 'premium_reciters') {
      list = PREMIUM_RECITERS_STATIONS;
    } else if (radioCategory === 'favorites') {
      list = [...customRadioStations, ...radioStations, ...PREMIUM_RECITERS_STATIONS].filter(s => favoriteRadioIds.includes(s.id));
    } else if (radioCategory === 'history') {
      const all = [...customRadioStations, ...radioStations, ...PREMIUM_RECITERS_STATIONS];
      list = radioHistory
        .map(histId => all.find(s => s.id === histId))
        .filter((s): s is RadioStation => !!s);
    } else if (radioCategory === 'adhkar') {
      list = [...customRadioStations, ...radioStations, ...PREMIUM_RECITERS_STATIONS].filter(s =>
        s.name.includes('أذكار') || s.name.includes('رقية') || s.name.includes('دعاء') || s.name.includes('حصن')
      );
    } else {
      list = [...customRadioStations, ...radioStations, ...PREMIUM_RECITERS_STATIONS];
    }

    if (radioSearchQuery.trim()) {
      const q = radioSearchQuery.toLowerCase().replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/[\u064B-\u065F]/g, '');
      list = list.filter(s => s.name.toLowerCase().replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/[\u064B-\u065F]/g, '').includes(q));
    }

    // Pinned favorites at top if not looking at history or favorites tabs
    if (radioCategory !== 'history' && radioCategory !== 'favorites') {
      return [...list].sort((a, b) => {
        const aFav = favoriteRadioIds.includes(a.id) ? 1 : 0;
        const bFav = favoriteRadioIds.includes(b.id) ? 1 : 0;
        return bFav - aFav;
      });
    }

    return list;
  }, [radioSearchQuery, favoriteRadioIds, radioStations, customRadioStations, radioHistory, radioCategory]);

  const handleWordClick = async (verse: any, wordIndex: number) => {
    // verse.surahNumber must be available. If not, we might need a lookup, but it should be available.
    const sNum = verse.surahNumber || QURAN_DATA.find(c => c.verses.some(v => v.id === verse.id))?.verses.find(v => v.id === verse.id)?.surahNumber || 2;

    setActiveWordAnalysis({ verse, wordIndex, loading: true });
    try {
      // language=ar gives Arabic translation, text_uthmani for clean display
      const res = await fetch(`https://api.quran.com/api/v4/verses/by_key/${sNum}:${verse.ayahNumber}?language=ar&words=true&word_fields=text_uthmani,translation,transliteration`);
      const data = await res.json();
      const apiWords = data.verse.words;
      // Map frontend clicked word to API word array. API array often includes the end symbol as a word.
      const wordData = apiWords[wordIndex] || apiWords[apiWords.length - 2];

      setActiveWordAnalysis({ verse, wordIndex, wordData, loading: false });
    } catch (e) {
      setActiveWordAnalysis({ verse, wordIndex, error: true, loading: false });
    }
  };

  return (
    <div className="min-h-screen pb-40">
      <div className="fixed top-0 left-0 w-full h-1 z-[250] pointer-events-none">
        <motion.div className="h-full bg-primary shadow-glow-primary" style={{ width: `${scrollProgress}%` }} />
      </div>

      <audio ref={audioRef} onEnded={handleAudioEnded} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} />

      {/* ═══════════════════ FIXED TOP BAR ═══════════════════ */}
      <div className="fixed top-1 left-1/2 -translate-x-1/2 z-[200] w-[98%] max-w-7xl">
        <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/5 rounded-[2rem] shadow-[0_10px_50px_-10px_rgba(0,0,0,0.8)] px-4 md:px-6">
          <div className="flex items-center justify-between h-16 gap-3">
            {/* Right: View Mode & Tajweed */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsTajweedGuideOpen(true)}
                className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1e1b4b]/40 text-purple-300 border border-purple-900/30 hover:bg-[#1e1b4b]/60 hover:text-white transition-all text-[9px] font-black"
              >
                📖 التجويد
              </button>
              <button
                onClick={() => setIsTypographyPanelOpen(p => !p)}
                className={cn(
                  "flex items-center gap-1 px-2.5 py-2 rounded-xl transition-all text-[9px] font-black border",
                  isTypographyPanelOpen
                    ? "bg-primary/20 border-primary/45 text-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.2)]"
                    : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
                )}
                title="تغيير حجم الخط والتباعد"
              >
                <span>Aa حجم الخط</span>
              </button>
              <div className={cn("flex bg-white/5 border border-white/10 rounded-xl p-1", isReadingMode && "opacity-0 scale-95 pointer-events-none")}>
                <button onClick={() => setViewMode('ayah')} className={cn("px-3 py-1.5 rounded-lg text-[10px] font-black transition-all", viewMode === 'ayah' ? "bg-primary text-primary-foreground shadow-glow-primary" : "text-white/30 hover:text-white")}>آيات</button>
                <button onClick={() => setViewMode('page')} className={cn("px-3 py-1.5 rounded-lg text-[10px] font-black transition-all", viewMode === 'page' ? "bg-primary text-primary-foreground shadow-glow-primary" : "text-white/30 hover:text-white")}>صفحة</button>
              </div>
            </div>

            {/* Center: Main Tabs */}
            <div className={cn("flex items-center gap-1.5 flex-1 justify-center overflow-x-auto no-scrollbar", isReadingMode && "opacity-0 scale-95 pointer-events-none")}>
              {['full', 'plan', 'luminous', 'radio'].map((v: any) => (
                <button
                  key={v}
                  onClick={() => setView(v as any)}
                  className={cn(
                    "px-4 md:px-6 py-2 rounded-xl font-black text-[10px] md:text-xs transition-all border relative overflow-hidden whitespace-nowrap",
                    view === v ? "bg-white text-black border-white shadow-glow-white" : "bg-white/5 text-white/30 border-white/5 hover:bg-white/10"
                  )}
                >
                  {v === 'full' ? 'المصحف كاملاً' : v === 'luminous' ? 'المصحف المضيء' : v === 'plan' ? 'خطة الحفظ' : 'إذاعة القرآن'}
                </button>
              ))}
            </div>

            {/* Left: Reading Mode */}
            <div className="shrink-0">
              <ReadingModeToggle />
            </div>
          </div>
        </div>
      </div>

      {/* ── Quran Nav Drawer ── */}
      <QuranNavDrawer
        isOpen={navDrawerOpen}
        activeTab={navDrawerTab}
        onClose={() => setNavDrawerOpen(false)}
        onTabChange={setNavDrawerTab}
        surahs={surahs}
        currentPage={currentPage}
        selectedSurah={selectedSurah}
        onSelectSurah={(n) => { loadSurah(n); setView('full'); setViewMode('ayah'); }}
        onSelectJuzPage={(page) => { setCurrentPage(page); setView('full'); setViewMode('page'); }}
        bookmarks={state.favorites || []}
        onSelectBookmark={(id) => { /* scroll to verse */ }}
      />

      {/* ── 3 Floating Nav Strip Buttons ── */}
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-[390] flex flex-col gap-1" dir="ltr">
        {/* Strip 1 — السور */}
        <button
          onClick={() => { setNavDrawerTab('surahs'); setNavDrawerOpen(true); }}
          className="group flex items-center gap-0 overflow-hidden rounded-l-2xl transition-all duration-300 hover:gap-2 bg-[#1a1208] border border-amber-900/40 border-r-0 hover:bg-[#2a1e0a] shadow-xl"
          title="قائمة السور"
        >
          <span className="text-[10px] font-black text-amber-400/80 group-hover:text-amber-300 whitespace-nowrap max-w-0 group-hover:max-w-[60px] overflow-hidden transition-all duration-300 pl-3">
            السور
          </span>
          <div className="w-9 h-12 flex items-center justify-center shrink-0">
            <div className="flex flex-col gap-[3px]">
              <span className="block w-4 h-[2px] bg-amber-500/70 rounded-full group-hover:bg-amber-400 transition-colors" />
              <span className="block w-4 h-[2px] bg-amber-500/70 rounded-full group-hover:bg-amber-400 transition-colors" />
              <span className="block w-4 h-[2px] bg-amber-500/70 rounded-full group-hover:bg-amber-400 transition-colors" />
            </div>
          </div>
        </button>

        {/* Strip 2 — الأجزاء */}
        <button
          onClick={() => { setNavDrawerTab('juz'); setNavDrawerOpen(true); }}
          className="group flex items-center gap-0 overflow-hidden rounded-l-2xl transition-all duration-300 hover:gap-2 bg-[#0a1810] border border-emerald-900/40 border-r-0 hover:bg-[#0e2416] shadow-xl"
          title="قائمة الأجزاء"
        >
          <span className="text-[10px] font-black text-emerald-400/80 group-hover:text-emerald-300 whitespace-nowrap max-w-0 group-hover:max-w-[60px] overflow-hidden transition-all duration-300 pl-3">
            الأجزاء
          </span>
          <div className="w-9 h-12 flex items-center justify-center shrink-0">
            <div className="flex flex-col gap-[3px]">
              <span className="block w-4 h-[2px] bg-emerald-500/70 rounded-full group-hover:bg-emerald-400 transition-colors" />
              <span className="block w-3 h-[2px] bg-emerald-500/70 rounded-full group-hover:bg-emerald-400 transition-colors" />
              <span className="block w-4 h-[2px] bg-emerald-500/70 rounded-full group-hover:bg-emerald-400 transition-colors" />
            </div>
          </div>
        </button>

        {/* Strip 3 — علامات */}
        <button
          onClick={() => { setNavDrawerTab('bookmarks'); setNavDrawerOpen(true); }}
          className="group flex items-center gap-0 overflow-hidden rounded-l-2xl transition-all duration-300 hover:gap-2 bg-[#150a18] border border-purple-900/40 border-r-0 hover:bg-[#1e1020] shadow-xl"
          title="العلامات المرجعية"
        >
          <span className="text-[10px] font-black text-purple-400/80 group-hover:text-purple-300 whitespace-nowrap max-w-0 group-hover:max-w-[60px] overflow-hidden transition-all duration-300 pl-3">
            علامات
          </span>
          <div className="w-9 h-12 flex items-center justify-center shrink-0">
            <Bookmark className="w-3.5 h-3.5 text-purple-500/70 group-hover:text-purple-400 transition-colors" />
          </div>
        </button>
      </div>
      <AnimatePresence>
        {sharingVerse && <ShareModal verse={sharingVerse} onClose={() => setSharingVerse(null)} />}
        {isExamOpen && <ExamModal memorizedVerses={memorizedVerses} onClose={() => setIsExamOpen(false)} onComplete={handleExamComplete} />}
        {activeSurahInfo && <SurahInfoModal surah={activeSurahInfo} onClose={() => setActiveSurahInfo(null)} />}
        {activeWordAnalysis && <WordAnalysisModal analysis={activeWordAnalysis} onClose={() => setActiveWordAnalysis(null)} />}
        {isCustomPlanModalOpen && (
          <CustomPlanModal
            onClose={() => setIsCustomPlanModalOpen(false)}
            customPagesInput={customPagesInput}
            setCustomPagesInput={setCustomPagesInput}
            customDurationInput={customDurationInput}
            setCustomDurationInput={setCustomDurationInput}
            customPlanType={customPlanType}
            setCustomPlanType={setCustomPlanType}
            onSave={saveCustomPlan}
          />
        )}
        {isTajweedGuideOpen && <TajweedGuideModal onClose={() => setIsTajweedGuideOpen(false)} />}
        {activeChatVerse && (
          <TafseerChatModal
            verse={activeChatVerse}
            messages={chatMessages}
            isListLoading={isChatLoading}
            connectionMode={chatConnectionMode}
            onClose={() => setActiveChatVerse(null)}
            onSendMessage={handleSendChatMessage}
            chatInput={chatInput}
            setChatInput={setChatInput}
          />
        )}
      </AnimatePresence>

      {/* ════════════ TYPOGRAPHY PANEL BUTTON ════════════ */}
      <button
        onClick={() => setIsTypographyPanelOpen(p => !p)}
        className={cn(
          "fixed right-0 bottom-36 z-[390] group flex items-center gap-0 overflow-hidden rounded-l-2xl transition-all duration-300 hover:gap-2 border border-r-0 shadow-xl",
          isTypographyPanelOpen
            ? "bg-primary/20 border-primary/50 text-primary"
            : "bg-[#0a120a] border-emerald-900/40 hover:bg-[#0f1f0f] text-emerald-400/80 hover:text-emerald-300"
        )}
        title="لوحة تحكم الخطوط"
      >
        <span className="text-[10px] font-black whitespace-nowrap max-w-0 group-hover:max-w-[80px] overflow-hidden transition-all duration-300 pl-3">
          الخطوط
        </span>
        <div className="w-9 h-12 flex items-center justify-center shrink-0">
          <span className="text-base font-black">Aa</span>
        </div>
      </button>

      {/* ════════════ TYPOGRAPHY PANEL ════════════ */}
      <AnimatePresence>
        {isTypographyPanelOpen && (
          <motion.div
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.95 }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed right-12 bottom-16 z-[389] w-80 bg-[#0a0a0a]/95 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-[0_30px_80px_-15px_rgba(0,0,0,0.9)] overflow-hidden"
            dir="rtl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.02]">
              <h3 className="text-sm font-black text-white flex items-center gap-2.5">
                <span className="text-xl">Aa</span>
                <span>محرّك الخط القرآني</span>
              </h3>
              <button onClick={() => setIsTypographyPanelOpen(false)} className="p-1.5 rounded-xl bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Live Preview */}
            <div className="mx-5 mt-5 p-4 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent border border-primary/10 text-right">
              <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-2">معاينة مباشرة</p>
              <span
                dir="rtl"
                style={{
                  fontSize: `${typoFontSize}px`,
                  fontWeight: typoFontWeight,
                  lineHeight: typoLineHeight,
                  letterSpacing: `${typoLetterSpacing}em`,
                  wordSpacing: `${typoWordSpacing}px`
                }}
                className="text-white/90 leading-loose block"
              >
                بِسْمِ اللَّهِ
              </span>
            </div>

            {/* Controls */}
            <div className="p-5 flex flex-col gap-5">

              {/* Font Size */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">حجم الخط</span>
                  <span className="text-xs font-black text-primary bg-primary/10 px-2 py-0.5 rounded-lg">{typoFontSize}px</span>
                </div>
                <input
                  type="range" min={20} max={72} step={2}
                  value={typoFontSize}
                  onChange={e => setTypoFontSize(Number(e.target.value))}
                  className="w-full accent-primary h-1.5 rounded-full cursor-pointer bg-white/10"
                />
                <div className="flex justify-between text-[9px] text-white/20 font-black">
                  <span>20px</span><span>72px</span>
                </div>
              </div>

              {/* Font Weight */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">سماكة الخط</span>
                  <span className="text-xs font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg">{typoFontWeight}</span>
                </div>
                <input
                  type="range" min={100} max={900} step={100}
                  value={typoFontWeight}
                  onChange={e => setTypoFontWeight(Number(e.target.value))}
                  className="w-full accent-amber-400 h-1.5 rounded-full cursor-pointer bg-white/10"
                />
                <div className="flex justify-between text-[9px] text-white/20 font-black">
                  <span>رفيع</span><span>عادي</span><span>عريض</span>
                </div>
              </div>

              {/* Line Height */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">تباعد الأسطر</span>
                  <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg">{typoLineHeight.toFixed(1)}</span>
                </div>
                <input
                  type="range" min={1.2} max={4.0} step={0.1}
                  value={typoLineHeight}
                  onChange={e => setTypoLineHeight(Number(e.target.value))}
                  className="w-full accent-emerald-400 h-1.5 rounded-full cursor-pointer bg-white/10"
                />
                <div className="flex justify-between text-[9px] text-white/20 font-black">
                  <span>مضغوط</span><span>متسع</span>
                </div>
              </div>

              {/* Word Spacing */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">تباعد الكلمات</span>
                  <span className="text-xs font-black text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-lg">{typoWordSpacing}px</span>
                </div>
                <input
                  type="range" min={0} max={30} step={1}
                  value={typoWordSpacing}
                  onChange={e => setTypoWordSpacing(Number(e.target.value))}
                  className="w-full accent-violet-400 h-1.5 rounded-full cursor-pointer bg-white/10"
                />
              </div>

              {/* Letter Spacing (Kashida) */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">تمديد الحروف (كشيدة)</span>
                  <span className="text-xs font-black text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-lg">{typoLetterSpacing.toFixed(2)}em</span>
                </div>
                <input
                  type="range" min={0} max={0.3} step={0.01}
                  value={typoLetterSpacing}
                  onChange={e => setTypoLetterSpacing(Number(e.target.value))}
                  className="w-full accent-rose-400 h-1.5 rounded-full cursor-pointer bg-white/10"
                />
              </div>

              {/* Reset */}
              <button
                onClick={() => { setTypoFontWeight(400); setTypoLineHeight(2.3); setTypoWordSpacing(0); setTypoLetterSpacing(0); setTypoFontSize(32); }}
                className="w-full py-2.5 rounded-2xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all text-xs font-black mt-1"
              >
                ↺ إعادة الضبط الافتراضي
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container relative z-10 px-4 pt-24">
        {/* ═══ Contextual Toolbar ═══ */}
        <div className={cn("mb-10 p-4 rounded-[2rem] bg-white/[0.02] border border-white/5 transition-all", (isReadingMode || view === 'radio') && "opacity-0 h-0 overflow-hidden mb-0 pointer-events-none")}>
          <div className="flex flex-wrap items-center gap-4 justify-center">
            {/* Tafseer Selector */}
            <div className={cn("relative group transition-all", isReadingMode && "opacity-0 scale-95 pointer-events-none")}>
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-2 pr-4 hover:bg-white/10 cursor-pointer">
                <div className="text-right"><p className="text-[8px] font-black text-white/30 uppercase tracking-widest">التفسير الحالي</p><p className="text-xs font-bold text-white">{selectedTafseer.name}</p></div>
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary"><FileText className="w-5 h-5" /></div>
                <ChevronDown className="w-4 h-4 text-white/20 mr-2" />
              </div>
              <div className="absolute top-[90%] right-0 pt-3 w-56 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all z-[80]">
                <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-2 shadow-3xl backdrop-blur-3xl">
                  {TAFSEERS.map(t => (<button key={t.id} onClick={() => setSelectedTafseer(t)} className={cn("w-full text-right p-4 rounded-xl text-xs font-bold transition-all", selectedTafseer.id === t.id ? "bg-primary text-primary-foreground" : "text-white/40 hover:bg-white/5 hover:text-white")}>{t.name}</button>))}
                </div>
              </div>
            </div>

            {/* Translation Selector */}
            <div className={cn("relative group transition-all", isReadingMode && "opacity-0 scale-95 pointer-events-none")}>
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-2 pr-4 hover:bg-white/10 cursor-pointer">
                <div className="text-right"><p className="text-[8px] font-black text-white/30 uppercase tracking-widest">الترجمة الحالية</p><p className="text-xs font-bold text-white">{selectedTranslation.name}</p></div>
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary"><Languages className="w-5 h-5" /></div>
                <ChevronDown className="w-4 h-4 text-white/20 mr-2" />
              </div>
              <div className="absolute top-[90%] right-0 pt-3 w-56 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all z-[80]">
                <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-2 shadow-3xl backdrop-blur-3xl">
                  {TRANSLATIONS.map(t => (<button key={t.id} onClick={() => setSelectedTranslation(t)} className={cn("w-full text-right p-4 rounded-xl text-xs font-bold transition-all", selectedTranslation.id === t.id ? "bg-primary text-primary-foreground" : "text-white/40 hover:bg-white/5 hover:text-white")}>{t.name}</button>))}
                </div>
              </div>
            </div>

            {/* Script Selector */}
            <div className={cn("relative group transition-all", isReadingMode && "opacity-0 scale-95 pointer-events-none")}>
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-2 pr-4 hover:bg-white/10 cursor-pointer">
                <div className="text-right"><p className="text-[8px] font-black text-white/30 uppercase tracking-widest">نوع الرسم</p><p className="text-xs font-bold text-white">{selectedScript.name}</p></div>
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary"><AlignRight className="w-5 h-5" /></div>
                <ChevronDown className="w-4 h-4 text-white/20 mr-2" />
              </div>
              <div className="absolute top-[90%] right-0 pt-3 w-64 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all z-[75]">
                <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-2 shadow-3xl backdrop-blur-3xl">
                  {SCRIPTS.map(s => (<button key={s.id} onClick={() => setSelectedScript(s)} className={cn("w-full text-right p-4 rounded-xl text-xs font-bold transition-all flex items-center justify-between", selectedScript.id === s.id ? "bg-primary text-primary-foreground" : "text-white/40 hover:bg-white/5 hover:text-white")}><span>{s.name}</span>{selectedScript.id === s.id && <Check className="w-3 h-3" />}</button>))}
                </div>
              </div>
            </div>

            {/* Comparison Mode Toggle */}
            <div className={cn("relative transition-all", isReadingMode && "opacity-0 scale-95 pointer-events-none")}>
              <button
                onClick={() => setIsComparisonMode(!isComparisonMode)}
                className={cn(
                  "flex items-center gap-3 border rounded-2xl p-2 pr-4 transition-all hover:bg-white/10 cursor-pointer text-right",
                  isComparisonMode
                    ? "bg-amber-500/20 border-amber-500/30 text-amber-300 hover:bg-amber-500/30"
                    : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                )}
                title="تفعيل مقارنة التراجم والتفاسير جنبًا إلى جنب"
              >
                <div className="text-right">
                  <p className="text-[8px] font-black opacity-55 uppercase tracking-widest">شاشة المقارنة</p>
                  <p className="text-xs font-bold">{isComparisonMode ? "مقارنة نشطة" : "مقارنة مغلقة"}</p>
                </div>
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-colors", isComparisonMode ? "bg-amber-500/30 text-amber-300" : "bg-primary/20 text-primary")}>
                  <LayoutGrid className="w-5 h-5" />
                </div>
              </button>
            </div>

            {/* Memorization Test Mode Toggle */}
            <div className={cn("relative transition-all", isReadingMode && "opacity-0 scale-95 pointer-events-none")}>
              <button
                onClick={() => setIsHideRevealMode(!isHideRevealMode)}
                className={cn(
                  "flex items-center gap-3 border rounded-2xl p-2 pr-4 transition-all hover:bg-white/10 cursor-pointer text-right",
                  isHideRevealMode
                    ? "bg-violet-500/20 border-violet-500/30 text-violet-300 hover:bg-violet-500/30"
                    : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                )}
                title="تفعيل وضع اختبار الحفظ (إخفاء/إظهار الكلمات)"
              >
                <div className="text-right">
                  <p className="text-[8px] font-black opacity-55 uppercase tracking-widest">اختبار الحفظ</p>
                  <p className="text-xs font-bold">{isHideRevealMode ? "وضع الإخفاء نشط" : "وضع الإخفاء مغلق"}</p>
                </div>
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-colors", isHideRevealMode ? "bg-violet-500/30 text-violet-300" : "bg-primary/20 text-primary")}>
                  <EyeOff className="w-5 h-5" />
                </div>
              </button>
            </div>

            {isComparisonMode && (
              <>
                {/* Secondary Tafseer Selector */}
                <div className={cn("relative group transition-all", isReadingMode && "opacity-0 scale-95 pointer-events-none")}>
                  <div className="flex items-center gap-3 bg-amber-500/5 border border-amber-500/20 rounded-2xl p-2 pr-4 hover:bg-amber-500/10 cursor-pointer">
                    <div className="text-right">
                      <p className="text-[8px] font-black text-amber-400/50 uppercase tracking-widest">التفسير المقارن</p>
                      <p className="text-xs font-bold text-amber-300">{selectedSecondaryTafseer.name}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-300"><FileText className="w-5 h-5" /></div>
                    <ChevronDown className="w-4 h-4 text-amber-300/40 mr-2" />
                  </div>
                  <div className="absolute top-[90%] right-0 pt-3 w-56 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all z-[80]">
                    <div className="bg-[#0a0a0a] border border-amber-500/25 rounded-2xl p-2 shadow-3xl backdrop-blur-3xl">
                      {TAFSEERS.map(t => (
                        <button
                          key={t.id}
                          onClick={() => setSelectedSecondaryTafseer(t)}
                          className={cn(
                            "w-full text-right p-4 rounded-xl text-xs font-bold transition-all",
                            selectedSecondaryTafseer.id === t.id ? "bg-amber-500 text-black font-black" : "text-white/40 hover:bg-white/5 hover:text-white"
                          )}
                        >
                          {t.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Secondary Translation Selector */}
                <div className={cn("relative group transition-all", isReadingMode && "opacity-0 scale-95 pointer-events-none")}>
                  <div className="flex items-center gap-3 bg-amber-500/5 border border-amber-500/20 rounded-2xl p-2 pr-4 hover:bg-amber-500/10 cursor-pointer">
                    <div className="text-right">
                      <p className="text-[8px] font-black text-amber-400/50 uppercase tracking-widest">الترجمة المقارنة</p>
                      <p className="text-xs font-bold text-amber-300">{selectedSecondaryTranslation.name}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-300"><Languages className="w-5 h-5" /></div>
                    <ChevronDown className="w-4 h-4 text-amber-300/40 mr-2" />
                  </div>
                  <div className="absolute top-[90%] right-0 pt-3 w-56 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all z-[80]">
                    <div className="bg-[#0a0a0a] border border-amber-500/25 rounded-2xl p-2 shadow-3xl backdrop-blur-3xl">
                      {TRANSLATIONS.map(t => (
                        <button
                          key={t.id}
                          onClick={() => setSelectedSecondaryTranslation(t)}
                          className={cn(
                            "w-full text-right p-4 rounded-xl text-xs font-bold transition-all",
                            selectedSecondaryTranslation.id === t.id ? "bg-amber-500 text-black font-black" : "text-white/40 hover:bg-white/5 hover:text-white"
                          )}
                        >
                          {t.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}


            {/* Reciter Selector */}
            <div className={cn("relative group transition-all", isReadingMode && "opacity-0 scale-95 pointer-events-none")}>
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-2 pr-4 hover:bg-white/10 cursor-pointer">
                <div className="text-right"><p className="text-[8px] font-black text-white/30 uppercase tracking-widest">القارئ الحالي</p><p className="text-xs font-bold text-white">{selectedReciter.name}</p></div>
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-xl">{selectedReciter.icon}</div>
                <ChevronDown className="w-4 h-4 text-white/20 mr-2" />
              </div>
              <div className="absolute top-[90%] left-0 pt-3 w-64 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all z-[70]">
                <div className="bg-[#0a0a0a] border border-white/10 rounded-[2rem] p-3 shadow-3xl backdrop-blur-3xl">
                  <div className="grid gap-1">{RECITERS.map(r => (<button key={r.id} onClick={() => setSelectedReciter(r)} className={cn("flex items-center justify-between p-4 rounded-2xl transition-all", selectedReciter.id === r.id ? "bg-primary/20 text-primary" : "hover:bg-white/5 text-white/40 hover:text-white")}><span className="font-bold text-sm">{r.name}</span><span className="text-lg">{r.icon}</span></button>))}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Recent Surahs ── */}
        {!isReadingMode && !selectedSurah && view !== 'radio' && recentSurahs.length > 0 && (
          <div className="w-full mb-10 overflow-hidden">
            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-4 flex items-center gap-2 px-4"><History className="w-3.5 h-3.5" /> استكمل قراءتك</p>
            <div className="flex gap-3 overflow-x-auto no-scrollbar px-4">
              {recentSurahs.map(num => {
                const surah = surahs.find(s => s.number === num);
                if (!surah) return null;
                return (<button key={num} onClick={() => loadSurah(num)} className="flex items-center gap-4 bg-white/5 border border-white/10 px-6 py-4 rounded-2xl hover:bg-white/10 hover:border-primary/20 transition-all whitespace-nowrap"><span className="w-8 h-8 rounded-lg bg-primary/20 text-primary text-[10px] font-black flex items-center justify-center">{num}</span><span className="font-bold text-sm">{surah.name}</span></button>);
              })}
            </div>
          </div>
        )}

        {/* ── Dashboard Bento Grid ── */}
        {!isReadingMode && !selectedSurah && view === 'full' && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="w-full mb-16 grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Memorization Progress (Large, spans 2 columns) */}
            <div className="md:col-span-2 bg-[#0a0a0a] border border-white/10 rounded-[3rem] p-8 md:p-12 relative overflow-hidden group hover:border-white/20 transition-all cursor-default shadow-3xl">
              <div className="absolute top-0 left-0 h-1.5 bg-gradient-to-r from-primary to-emerald-400 w-full opacity-50 group-hover:opacity-100 transition-opacity" />
              <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/10 blur-[100px] rounded-full group-hover:bg-primary/20 transition-all duration-700 pointer-events-none" />

              <div className="relative z-10 flex flex-col justify-between h-full gap-10">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-primary/30 to-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform shadow-glow-primary border border-primary/20"><Trophy className="w-8 h-8 text-primary" /></div>
                    <div>
                      <h3 className="text-2xl font-black text-white mb-2">إنجاز الحفظ</h3>
                      <p className="text-white/40 text-sm font-bold flex items-center gap-2">
                        المصحف كاملاً
                        <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                        114 سورة
                      </p>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-2xl border border-white/5 bg-white/5 flex items-center justify-center text-white/30 group-hover:text-primary group-hover:bg-primary/10 transition-all cursor-help relative" title="النسبة المئوية لما أتممت حفظه من إجمالي سور القرآن الكريم.">
                    <Info className="w-5 h-5" />
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="flex items-end justify-between">
                    <span className="text-6xl font-black text-primary drop-shadow-[0_0_15px_rgba(var(--primary),0.3)]">{memorizationStats.percentage}%</span>
                    <span className="text-sm font-black text-white/40 uppercase tracking-widest mb-2 bg-white/5 px-4 py-2 rounded-full border border-white/5">تم حفظ {memorizationStats.completed} سورة</span>
                  </div>
                  <div className="h-5 bg-black rounded-full overflow-hidden border border-white/10 relative p-1 shadow-inner">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${memorizationStats.percentage}%` }} className="h-full bg-gradient-to-r from-primary to-emerald-400 shadow-glow-primary rounded-full relative overflow-hidden">
                      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 mix-blend-overlay" />
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>

            {/* Daily Streak Card (Square) */}
            <div className="bg-gradient-to-br from-[#1c0a00] to-[#0a0400] border border-orange-500/20 rounded-[3rem] p-8 relative overflow-hidden group hover:border-orange-500/40 hover:shadow-[0_0_50px_-15px_rgba(249,115,22,0.3)] transition-all cursor-default flex flex-col justify-center items-center text-center shadow-3xl">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-10 mix-blend-overlay pointer-events-none" />

              <div className="w-24 h-24 rounded-full bg-gradient-to-t from-orange-500/10 to-orange-500/30 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500 shadow-[0_0_30px_rgba(249,115,22,0.3)] border border-orange-500/20 relative">
                <Flame className="w-12 h-12 text-orange-500 drop-shadow-[0_0_20px_rgba(249,115,22,1)] z-10" />
                <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-xl animate-pulse" />
              </div>

              <h4 className="text-5xl font-black text-white mb-2 drop-shadow-md">{streak}</h4>
              <p className="text-orange-500/80 text-[10px] font-black uppercase tracking-[0.3em]">أيام متتالية</p>

              {/* Tooltip / Motivation */}
              <div className="absolute bottom-6 px-5 py-2.5 bg-orange-500/10 backdrop-blur-md rounded-full border border-orange-500/20 text-[10px] font-black text-orange-200 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0 shadow-xl">
                حافظ على وردك اليومي 🔥
              </div>
            </div>

            {/* Quick Access / Plan Cards */}
            <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#0a0a0a] border border-white/5 rounded-[2rem] p-6 flex items-center justify-between group hover:bg-white/[0.03] hover:border-white/10 transition-all cursor-pointer shadow-xl" onClick={() => setView('plan')}>
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-[1rem] bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors shadow-inner"><Target className="w-6 h-6 text-blue-400" /></div>
                  <div>
                    <h4 className="text-white font-black text-sm mb-1">الخطة الحالية</h4>
                    <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">ختمة في سنة</p>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center group-hover:bg-white/5 transition-colors">
                  <ChevronLeft className="w-5 h-5 text-white/20 group-hover:text-blue-400 transition-colors" />
                </div>
              </div>

              <div className="bg-[#0a0a0a] border border-white/5 rounded-[2rem] p-6 flex items-center justify-between group hover:bg-white/[0.03] hover:border-white/10 transition-all cursor-pointer shadow-xl" onClick={() => { setNavDrawerOpen(true); setNavDrawerTab('bookmarks'); }}>
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-[1rem] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors shadow-inner"><BookmarkCheck className="w-6 h-6 text-emerald-400" /></div>
                  <div>
                    <h4 className="text-white font-black text-sm mb-1">الآيات المحفوظة</h4>
                    <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">راجع وردك اليومي</p>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center group-hover:bg-white/5 transition-colors">
                  <ChevronLeft className="w-5 h-5 text-white/20 group-hover:text-emerald-400 transition-colors" />
                </div>
              </div>
            </div>

          </motion.div>
        )}

        {/* ── Daily Verse ── */}
        {!isReadingMode && !selectedSurah && view === 'full' && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full mb-20 group">
            <div className="relative rounded-[3.5rem] p-1.5 bg-gradient-to-br from-primary/30 via-primary/5 to-transparent border border-primary/10">
              <div className="bg-[#050505]/80 backdrop-blur-3xl rounded-[3.4rem] p-10 md:p-14 overflow-hidden relative">
                <Quote className="absolute -top-10 -left-10 w-40 h-40 text-primary/5 -rotate-12" />
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="px-5 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-10">آيـة الـيـوم الملهمة</div>
                  {dailyVerse ? (
                    <>
                      <p
                        className={cn("text-3xl md:text-5xl text-white/90 mb-10 text-center", selectedScript.font)}
                        style={{ lineHeight: '2.5', paddingTop: '0.5rem', paddingBottom: '0.5rem' }}
                      >
                        {dailyVerse.arabic}
                      </p>
                      <div className="flex flex-col items-center gap-4">
                        <p className="text-white/40 text-sm leading-relaxed max-w-2xl italic">"{dailyVerse.tafseer}"</p>
                        <div className="h-px w-20 bg-primary/20 my-2" />
                        <span className="text-primary font-black text-xs uppercase tracking-widest font-tajawal">
                          سورة {dailyVerse.surah} • آية {dailyVerse.ayahNumber}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-10">
                        <button onClick={() => handleShare(dailyVerse)} className="w-14 h-14 rounded-2xl bg-white/5 text-white/40 flex items-center justify-center hover:text-primary transition-all"><ImageIcon className="w-6 h-6" /></button>
                        <button onClick={() => handlePlayVerse(dailyVerse)} className="w-20 h-20 rounded-[2.5rem] bg-primary text-primary-foreground flex items-center justify-center hover:scale-105 transition-transform shadow-glow-primary">{currentAudio?.id === dailyVerse.id && isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 fill-current" />}</button>
                        <button className="w-14 h-14 rounded-2xl bg-white/5 text-white/40 flex items-center justify-center hover:text-white transition-all"><Share2 className="w-6 h-6" /></button>
                      </div>
                    </>
                  ) : <Loader2 className="w-10 h-10 text-primary animate-spin" />}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Search ── */}
        <div className={cn("w-full mb-16 space-y-8", (isReadingMode || view === 'radio') && "opacity-0 h-0 overflow-hidden mb-0 transition-all pointer-events-none")}>
          <div className="relative group">
            <Search className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder={view === 'full' ? "ابحث عن سورة، جزء، أو رقم..." : "ابحث في الآيات المختارة..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-20 bg-white/5 border border-white/10 rounded-[2.5rem] ps-16 pe-16 text-xl text-white outline-none focus:border-primary/30 focus:bg-white/[0.08] transition-all shadow-inner"
            />
            <button
              onClick={() => {
                // Stop if already listening
                if (isListening) {
                  voiceRecognitionRef.current?.stop();
                  setIsListening(false);
                  return;
                }

                // Check browser support
                const SpeechRecognitionAPI =
                  (window as any).SpeechRecognition ||
                  (window as any).webkitSpeechRecognition;

                if (!SpeechRecognitionAPI) {
                  alert('متصفحك لا يدعم البحث الصوتي. يُرجى استخدام Chrome أو Edge.');
                  return;
                }

                const recognition = new SpeechRecognitionAPI();
                voiceRecognitionRef.current = recognition;
                recognition.lang = 'ar-SA';
                recognition.continuous = false;
                recognition.interimResults = true;
                recognition.maxAlternatives = 1;

                recognition.onstart = () => setIsListening(true);

                recognition.onresult = (e: any) => {
                  const result = e.results[e.resultIndex];
                  const transcript = result[0].transcript;
                  setSearchQuery(transcript);
                  if (result.isFinal) {
                    setIsListening(false);
                  }
                };

                recognition.onerror = (e: any) => {
                  console.warn('Voice search error:', e.error);
                  setIsListening(false);
                };

                recognition.onend = () => {
                  setIsListening(false);
                };

                try {
                  recognition.start();
                } catch (err) {
                  console.warn('Failed to start voice search:', err);
                  setIsListening(false);
                }
              }}
              className={cn(
                "absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl flex items-center justify-center transition-all overflow-hidden",
                isListening
                  ? "bg-primary text-white shadow-[0_0_20px_rgba(var(--primary-rgb),0.5)] scale-110"
                  : "bg-primary/10 text-primary border border-primary/20 hover:scale-110 hover:bg-primary/20"
              )}
              title={isListening ? 'إيقاف الاستماع' : 'بحث صوتي باللغة العربية'}
            >
              {isListening ? (
                <div className="flex gap-[3px] items-center">
                  {[0, 0.1, 0.2].map((delay, i) => (
                    <motion.div
                      key={i}
                      className="w-[3px] bg-white rounded-full"
                      animate={{ height: [6, 16, 6] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay, ease: 'easeInOut' }}
                    />
                  ))}
                </div>
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </button>
          </div>

          <div className="flex flex-col items-center gap-6">
            {searchHistory.length > 0 && searchQuery.length === 0 && (
              <div className="flex flex-wrap gap-2 justify-center px-4 animate-in fade-in slide-in-from-top-2">
                <span className="text-[10px] font-black text-white/10 uppercase tracking-[0.2em] w-full text-center mb-1">عمليات البحث الأخيرة</span>
                {searchHistory.map(h => (
                  <button key={h} onClick={() => setSearchQuery(h)} className="px-5 py-2 rounded-xl bg-white/[0.03] border border-white/5 text-[10px] font-bold text-white/40 hover:text-primary hover:bg-primary/10 transition-all flex items-center gap-2">
                    <Clock className="w-3 h-3 opacity-30" /> {h}
                  </button>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-2 justify-center px-4">
              {['الجنة', 'الصبر', 'الرحمة', 'القلب', 'الاستغفار', 'التوكل'].map(keyword => (
                <button
                  key={keyword}
                  onClick={() => setSearchQuery(keyword)}
                  className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black text-white/30 hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-all"
                >
                  # {keyword}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Search Results Overlay ── */}
        <AnimatePresence>
          {searchQuery.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="w-full mb-16 space-y-6"
            >
              <div className="flex items-center justify-between px-6">
                <h3 className="text-sm font-black text-white/30 uppercase tracking-[0.3em] flex items-center gap-3">
                  <Sparkles className="w-4 h-4 text-primary" /> نتائج البحث الذكي ({searchResults.length})
                </h3>
                <div className="flex bg-white/5 rounded-xl p-1 border border-white/5">
                  {[
                    { id: 'all', label: 'الكل' },
                    { id: 'surahs', label: 'سور' },
                    { id: 'verses', label: 'آيات' },
                    { id: 'tafseer', label: 'تفسير' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setSearchFilter(tab.id as any)}
                      className={cn(
                        "px-4 py-1.5 rounded-lg text-[10px] font-black transition-all",
                        searchFilter === tab.id ? "bg-primary text-primary-foreground shadow-glow-primary" : "text-white/20 hover:text-white"
                      )}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-6">
                {isSearchingGlobal && (
                  <div className="flex items-center justify-center py-10 gap-3 text-primary animate-pulse">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-[10px] font-black uppercase tracking-widest">جاري البحث في كامل المصحف...</span>
                  </div>
                )}

                {/* Surah Matches (if in 'all' or 'surahs' filter) */}
                {(searchFilter === 'all' || searchFilter === 'surahs') && filteredSurahs.length > 0 && searchQuery.length > 1 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    {filteredSurahs.slice(0, 6).map((s: any) => (
                      <motion.button
                        key={`search-surah-${s.number}`}
                        whileHover={{ y: -3, scale: 1.02 }}
                        onClick={() => { setSelectedSurah(s.number); loadSurah(s.number); setView('full'); setViewMode('ayah'); setSearchQuery(''); }}
                        className="flex items-center gap-4 p-5 rounded-[2rem] bg-primary/5 border border-primary/20 hover:bg-primary/10 transition-all text-right group"
                      >
                        <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary text-[10px] font-black flex items-center justify-center group-hover:scale-110 transition-transform">{s.number}</div>
                        <div>
                          <h4 className="text-white font-black text-sm">{highlightMatch(s.name, searchQuery)}</h4>
                          <p className="text-[8px] text-white/30 font-bold uppercase tracking-widest">{s.numberOfAyahs} آية</p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}

                {/* Verse Matches (if in 'all' or 'verses' filter) */}
                {(searchFilter === 'all' || searchFilter === 'verses') && searchResults.map((v, i) => (
                  <div key={`search-container-${v.id}`} onClick={() => handleSearchResultClick(v)} className="cursor-pointer">
                    <VerseCard
                      id={v.id}
                      verse={v}
                      accentColor={v.accentColor}
                      border={v.border}
                      index={i}
                      searchQuery={searchQuery}
                      isHideRevealMode={isHideRevealMode}
                    quranHideMode={quranHideMode}
                      onPlay={(e: any) => { e.stopPropagation(); handlePlayVerse(v); }}
                      onShare={(e: any) => { e.stopPropagation(); handleShare(v); }}
                      onBookmark={(e: any) => { e.stopPropagation(); toggleBookmark(v); }}
                      onWordClick={(e: any) => { e.stopPropagation(); handleWordClick(v, 0); }}
                      isPlaying={currentAudio?.id === v.id && isPlaying}
                      isBookmarked={state.favorites?.includes(`quran_${v.id}`)}
                      reciterName={selectedReciter.name}
                      fontClass={selectedScript.font}
                      selectedTranslation={selectedTranslation}
                      onChatClick={startTafseerChat}
                      isComparisonMode={isComparisonMode}
                      selectedSecondaryTafseerName={selectedSecondaryTafseer.name}
                      selectedSecondaryTranslation={selectedSecondaryTranslation}
                    />
                  </div>
                ))}

                {/* Tafseer Matches */}
                {(searchFilter === 'all' || searchFilter === 'tafseer') && tafseerResults.map((v, i) => (
                  <div key={`search-tafseer-${v.id}`} onClick={() => handleSearchResultClick(v)} className="cursor-pointer">
                    <div className="p-8 rounded-[2.5rem] bg-amber-500/5 border border-amber-500/10 hover:bg-amber-500/10 transition-all text-right group relative overflow-hidden">
                      <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl" />
                      <div className="flex justify-between items-center mb-6 relative z-10">
                        <span className="px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-widest">نتائج التفسير الميسر</span>
                        <span className="text-xs font-black text-white/20">{v.surah} - آية {v.ayahNumber}</span>
                      </div>
                      <p className="text-xl md:text-2xl text-white/80 leading-relaxed font-medium relative z-10">
                        {highlightMatch(v.arabic, searchQuery)}
                      </p>
                      <div className="mt-4 flex items-center gap-2 text-amber-400/40 text-[10px] font-bold relative z-10">
                        <Sparkles className="w-3 h-3" /> اضغط للانتقال لموضع الآية في المصحف
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="h-px w-full bg-gradient-to-r from-transparent via-white/5 to-transparent my-10" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Content View ── */}
        <div className="w-full">

          {view === 'full' && (
            <div className="space-y-12">
              {!selectedSurah ? (
                <div className="space-y-6">
                  {/* Filters & Quick Jump Panel */}
                  <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-[2rem] bg-white/[0.02] border border-white/5 backdrop-blur-md" dir="rtl">
                    {/* Revelation Type Filter */}
                    <div className="flex items-center gap-2 bg-white/5 rounded-xl p-1 border border-white/5">
                      {[
                        { id: 'all', label: 'الكل' },
                        { id: 'Meccan', label: 'مكية 🕋' },
                        { id: 'Medinan', label: 'مدنية 🕌' }
                      ].map(type => (
                        <button
                          key={type.id}
                          onClick={() => setSurahTypeFilter(type.id as any)}
                          className={cn(
                            "px-4 py-1.5 rounded-lg text-[10px] font-black transition-all",
                            surahTypeFilter === type.id
                              ? "bg-primary text-primary-foreground shadow-glow-primary"
                              : "text-white/30 hover:text-white"
                          )}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>

                    {/* Juz Filter Selector */}
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black text-white/30 tracking-wider">تصفية حسب الجزء:</span>
                      <select
                        value={surahJuzFilter}
                        onChange={(e) => setSurahJuzFilter(Number(e.target.value))}
                        className="bg-[#0c0c0c] border border-white/10 rounded-xl px-4 py-2 text-xs font-bold text-white outline-none focus:border-primary/40 focus:bg-white/10 transition-all cursor-pointer"
                      >
                        <option value={0} className="bg-[#0c0c0c] text-white">كل الأجزاء</option>
                        {Array.from({ length: 30 }, (_, i) => i + 1).map(juz => (
                          <option key={juz} value={juz} className="bg-[#0c0c0c] text-white">الجزء {juz}</option>
                        ))}
                      </select>
                    </div>

                    {/* Quick Jump Button */}
                    <button
                      onClick={() => setIsQuickJumpOpen(true)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all shadow-md active:scale-95"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>الانتقال السريع لآية ⚡</span>
                    </button>
                  </div>

                  {/* Active Filter Indicators & Results Count */}
                  <div className="flex items-center justify-between w-full px-2 text-[10px] font-bold text-white/40" dir="rtl">
                    <div>
                      <span>عدد السور المعروضة: </span>
                      <span className="text-primary font-black bg-primary/10 px-2.5 py-1 rounded-lg">{(filteredSurahs || []).length}</span>
                    </div>
                    {((surahTypeFilter !== 'all' ? 1 : 0) + (surahJuzFilter !== 0 ? 1 : 0)) > 0 && (
                      <button
                        onClick={() => { setSurahTypeFilter('all'); setSurahJuzFilter(0); }}
                        className="text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/20 px-3 py-1 rounded-lg"
                      >
                        <span>إلغاء التصفية ({ (surahTypeFilter !== 'all' ? 1 : 0) + (surahJuzFilter !== 0 ? 1 : 0) })</span>
                      </button>
                    )}
                  </div>

                  {filteredSurahs.length === 0 ? (
                    <div className="text-center py-20 bg-white/[0.01] rounded-[2.5rem] border border-white/5">
                      <BookOpen className="w-10 h-10 text-white/10 mx-auto mb-4" />
                      <p className="text-white/40 text-sm font-bold">لم يتم العثور على أي سور تطابق التصفية الحالية.</p>
                      <button
                        onClick={() => { setSurahTypeFilter('all'); setSurahJuzFilter(0); setSearchQuery(''); }}
                        className="mt-4 text-xs font-black text-primary hover:underline text-center w-full"
                      >
                        إعادة تعيين التصفية
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredSurahs.map((s: SurahInfo, i: number) => {
                        const status = (state.quranMemorization?.[s.number] || 'not-started') as keyof typeof MEMORIZATION_STATUS;
                        const config = MEMORIZATION_STATUS[status];
                        const StatusIcon = config.icon;
                        const juzNum = SURAH_JUZ_MAPPING[s.number];
                        const isMeccan = s.revelationType === 'Meccan';

                        return (
                          <motion.button
                            key={s.number}
                            whileHover={{ y: -5, scale: 1.02 }}
                            onClick={() => loadSurah(s.number)}
                            className="group flex flex-col p-6 rounded-[2.5rem] bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] hover:border-primary/20 transition-all text-right relative overflow-hidden"
                          >
                            {status !== 'not-started' && (
                              <div className={cn("absolute top-0 right-0 w-1.5 h-full", config.color.replace('text-', 'bg-'))} />
                            )}
                            {/* Top row: badges */}
                            <div className="flex items-center justify-between w-full mb-4 relative z-10">
                              <div className="flex items-center gap-1.5">
                                <span className={cn(
                                  "px-2.5 py-1 rounded-lg text-[9px] font-black border",
                                  isMeccan
                                    ? "bg-amber-500/10 text-amber-400 border-amber-500/15"
                                    : "bg-emerald-500/10 text-emerald-400 border-emerald-500/15"
                                )}>
                                  {isMeccan ? '🕋 مكية' : '🕌 مدنية'}
                                </span>
                                {juzNum && (
                                  <span className="px-2 py-1 rounded-lg bg-white/5 text-white/25 text-[9px] font-bold border border-white/5">
                                    جزء {juzNum}
                                  </span>
                                )}
                              </div>
                              <ArrowLeft className="w-4 h-4 text-white/10 group-hover:text-primary transition-all" />
                            </div>

                            {/* Main content row */}
                            <div className="flex items-center gap-4 relative z-10 w-full">
                              <div className={cn(
                                "w-14 h-14 rounded-2xl flex items-center justify-center text-sm font-black transition-all shadow-xl shrink-0",
                                status !== 'not-started' ? `${config.bg} ${config.color}` : "bg-white/5 text-white/20"
                              )}>
                                {status === 'not-started' ? s.number : <StatusIcon className="w-6 h-6" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-xl font-black text-white group-hover:text-primary transition-colors leading-relaxed font-tajawal truncate">
                                  {s.name}
                                </h3>
                                <p className="text-[10px] text-white/30 font-bold tracking-widest mt-0.5">
                                  {s.numberOfAyahs} آية • {s.englishName} • {config.label}
                                </p>
                              </div>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-12">
                  <div className={cn("flex flex-col md:flex-row justify-between items-center gap-8 bg-white/5 p-10 rounded-[3.5rem] border border-white/10", isReadingMode && "fixed top-8 left-8 right-8 z-50")}>
                    <button onClick={() => setSelectedSurah(null)} className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-white/5 text-white/60 hover:bg-white/10 transition-all font-black text-sm border border-white/10"><ArrowRight className="w-4 h-4" /> الفهرس</button>
                    <div className="text-center group">
                      <h2
                        onClick={() => {
                          const surah = surahs.find(s => s.number === selectedSurah);
                          if (surah) setActiveSurahInfo(surah);
                        }}
                        className="text-5xl md:text-8xl font-black text-white tracking-tighter mb-4 cursor-help hover:text-primary transition-colors flex items-center justify-center gap-4"
                      >
                        {surahContent[0]?.surah}
                        <Info className="w-8 h-8 opacity-0 group-hover:opacity-20 transition-all" />
                      </h2>
                      <div className="flex flex-wrap items-center justify-center gap-2">{Object.entries(MEMORIZATION_STATUS).map(([key, config]) => (<button key={key} onClick={() => updateMemorization(selectedSurah, key as any)} className={cn("flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black transition-all border", (state.quranMemorization?.[selectedSurah] || 'not-started') === key ? `${config.bg} ${config.color} border-white/20` : "bg-white/5 text-white/20 border-transparent hover:bg-white/10")}><config.icon className="w-3.5 h-3.5" /> {config.label}</button>))}</div>
                    </div>
                    <div className="flex flex-col items-center md:items-end gap-3 shrink-0">
                      {/* Reciter Selector */}
                      <div className="relative">
                        <button
                          onClick={() => setShowPageReciterMenu(prev => !prev)}
                          className="flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black transition-all border bg-amber-500/10 text-amber-300 border-amber-500/20 hover:bg-amber-500/25"
                        >
                          <span>{selectedReciter.icon}</span>
                          <span>{selectedReciter.name}</span>
                          <ChevronDown className="w-3 h-3 opacity-60" />
                        </button>
                        {showPageReciterMenu && (
                          <div className="absolute top-13 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-auto md:right-0 z-50 bg-[#0d0d0d] border border-white/10 rounded-2xl p-3 shadow-2xl min-w-[210px] space-y-1">
                            <p className="text-[9px] font-black text-white/30 uppercase tracking-widest px-3 pb-2 border-b border-white/5 mb-2 text-right">اختر القارئ</p>
                            {RECITERS.map(r => (
                              <button
                                key={r.id}
                                onClick={() => { setSelectedReciter(r); setShowPageReciterMenu(false); }}
                                className={cn(
                                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-right",
                                  selectedReciter.id === r.id
                                    ? "bg-amber-500/15 text-amber-300 border border-amber-500/20"
                                    : "text-white/50 hover:bg-white/5 hover:text-white border border-transparent"
                                )}
                              >
                                <span className="text-base">{r.icon}</span>
                                <span className="flex-1">{r.name}</span>
                                {selectedReciter.id === r.id && <span className="text-amber-400 text-sm">✓</span>}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Playback Mode Control */}
                      <div className="flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/5" dir="rtl">
                        <button
                          onClick={() => setPlayMode('surah')}
                          className={cn("px-4 py-2 rounded-xl text-[10px] font-black transition-all flex items-center gap-1.5", playMode === 'surah' ? "bg-amber-500 text-black shadow-glow-amber" : "text-white/40 hover:text-white")}
                          title="تشغيل السورة كاملة متواصلة"
                        >
                          🔁 السورة كاملة
                        </button>
                        <button
                          onClick={() => setPlayMode('ayah')}
                          className={cn("px-4 py-2 rounded-xl text-[10px] font-black transition-all flex items-center gap-1.5", playMode === 'ayah' ? "bg-amber-500 text-black shadow-glow-amber" : "text-white/40 hover:text-white")}
                          title="تشغيل آية بعد آية تلقائياً"
                        >
                          ⏭️ آية بعد آية
                        </button>
                        <button
                          onClick={() => setPlayMode('single')}
                          className={cn("px-4 py-2 rounded-xl text-[10px] font-black transition-all flex items-center gap-1.5", playMode === 'single' ? "bg-amber-500 text-black shadow-glow-amber" : "text-white/40 hover:text-white")}
                          title="تشغيل آية واحدة فقط والوقوف"
                        >
                          🔂 آية واحدة
                        </button>
                      </div>
                    </div>
                  </div>
                  {isLoading ? (
                    <div className="flex flex-col items-center py-48 gap-6"><Loader2 className="w-16 h-16 text-primary animate-spin" /><p className="text-white/20 font-black tracking-widest uppercase text-[10px]">جاري جلب الآيات العظيمة...</p></div>
                  ) : (
                    <>
                      {viewMode === 'ayah' ? (
                        <div className="grid gap-10">
                          {selectedSurah !== 1 && selectedSurah !== 9 && (
                            <div className={cn("text-center py-10 opacity-80", selectedScript.font)}>
                              <p className="text-4xl md:text-6xl text-white/90">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</p>
                            </div>
                          )}
                          {surahContent.map((v, i) => (
                            <VerseCard
                              key={v.id}
                              id={v.id}
                              verse={v}
                              accentColor="text-primary"
                              border="border-primary/20"
                              index={i}
                              isReadingMode={isReadingMode}
                              fontSize={fontSize}
                              isHideRevealMode={isHideRevealMode}
                    quranHideMode={quranHideMode}
                              onPlay={handlePlayVerse}
                              onShare={handleShare}
                              onBookmark={toggleBookmark}
                              onWordClick={handleWordClick}
                              isBookmarked={state.favorites?.includes(`quran_${v.id}`)}
                              isPlaying={currentAudio?.id === v.id && isPlaying}
                              reciterName={selectedReciter.name}
                              fontClass={selectedScript.font}
                              selectedTranslation={selectedTranslation}
                              onChatClick={startTafseerChat}
                              isComparisonMode={isComparisonMode}
                              selectedSecondaryTafseerName={selectedSecondaryTafseer.name}
                              selectedSecondaryTranslation={selectedSecondaryTranslation}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-6 w-full">
                          {/* Layout Controls Bar */}
                          <div className="w-full max-w-5xl flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4 mb-4" dir="rtl">
                            <div className="flex items-center gap-2 flex-wrap">
                              <button
                                onClick={() => setPageViewLayout(pageViewLayout === 'double' ? 'single' : 'double')}
                                className={cn("px-4 py-2 rounded-xl text-[10px] font-black transition-all border", pageViewLayout === 'double' ? "bg-primary text-primary-foreground border-primary/20" : "bg-white/5 text-white/40 border-transparent hover:bg-white/10")}
                              >
                                {pageViewLayout === 'double' ? "عرض صفحة واحدة" : "عرض صفحتين (3D)"}
                              </button>

                              <button
                                onClick={() => setMushafType(mushafType === 'digital' ? 'image' : 'digital')}
                                className={cn("px-4 py-2 rounded-xl text-[10px] font-black transition-all border", mushafType === 'digital' ? "bg-amber-500 text-black border-amber-400/20" : "bg-white/5 text-white/40 border-transparent hover:bg-white/10")}
                              >
                                {mushafType === 'digital' ? "عرض المصحف المصور 🖼️" : "عرض المصحف الرقمي التفاعلي ✍️"}
                              </button>

                              <button
                                onClick={() => setShowSidePanel(!showSidePanel)}
                                className={cn("px-4 py-2 rounded-xl text-[10px] font-black transition-all border", showSidePanel ? "bg-primary text-primary-foreground border-primary/20" : "bg-white/5 text-white/40 border-transparent hover:bg-white/10")}
                              >
                                {showSidePanel ? "إخفاء اللوحة الذكية" : "إظهار اللوحة الذكية"}
                              </button>

                              {/* ── Reciter Selector in Page View ── */}
                              <div className="relative">
                                <button
                                  onClick={() => setShowPageReciterMenu(prev => !prev)}
                                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black transition-all border bg-amber-500/10 text-amber-300 border-amber-500/20 hover:bg-amber-500/25"
                                >
                                  <span>{selectedReciter.icon}</span>
                                  <span>{selectedReciter.name}</span>
                                  <ChevronDown className="w-3 h-3 opacity-60" />
                                </button>
                                {showPageReciterMenu && (
                                  <div className="absolute top-11 right-0 z-50 bg-[#0d0d0d] border border-white/10 rounded-2xl p-3 shadow-2xl min-w-[210px] space-y-1">
                                    <p className="text-[9px] font-black text-white/30 uppercase tracking-widest px-3 pb-2 border-b border-white/5 mb-2 text-right">اختر القارئ</p>
                                    {RECITERS.map(r => (
                                      <button
                                        key={r.id}
                                        onClick={() => { setSelectedReciter(r); setShowPageReciterMenu(false); }}
                                        className={cn(
                                          "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-right",
                                          selectedReciter.id === r.id
                                            ? "bg-amber-500/15 text-amber-300 border border-amber-500/20"
                                            : "text-white/50 hover:bg-white/5 hover:text-white border border-transparent"
                                        )}
                                      >
                                        <span className="text-base">{r.icon}</span>
                                        <span className="flex-1">{r.name}</span>
                                        {selectedReciter.id === r.id && <span className="text-amber-400 text-sm">✓</span>}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* ── Playback Mode Selector in Page View ── */}
                              <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5" dir="rtl">
                                <button
                                  onClick={() => setPlayMode('surah')}
                                  className={cn("px-3 py-1.5 rounded-lg text-[9px] font-black transition-all", playMode === 'surah' ? "bg-amber-500 text-black font-black" : "text-white/40 hover:text-white")}
                                  title="سماع السورة كاملة"
                                >
                                  🔁 السورة كاملة
                                </button>
                                <button
                                  onClick={() => setPlayMode('ayah')}
                                  className={cn("px-3 py-1.5 rounded-lg text-[9px] font-black transition-all", playMode === 'ayah' ? "bg-amber-500 text-black font-black" : "text-white/40 hover:text-white")}
                                  title="سماع آية بعد آية"
                                >
                                  ⏭️ آية بعد آية
                                </button>
                                <button
                                  onClick={() => setPlayMode('single')}
                                  className={cn("px-3 py-1.5 rounded-lg text-[9px] font-black transition-all", playMode === 'single' ? "bg-amber-500 text-black font-black" : "text-white/40 hover:text-white")}
                                  title="سماع آية واحدة فقط"
                                >
                                  🔂 آية واحدة
                                </button>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 text-white/30 text-[10px] font-bold">
                              <span>سورة {surahContent[0]?.surah || '-'}</span>
                              <span className="opacity-30">|</span>
                              <span>صفحة {currentPage}</span>
                              <span className="opacity-30">|</span>
                              <span>الجزء {pages[currentPage]?.[0]?.juz_number || '-'}</span>
                            </div>
                          </div>

                          {/* Swipe Hint — mobile only */}
                          <div className="lg:hidden flex items-center justify-center gap-2 text-white/30 text-[10px] font-bold mb-2 select-none" dir="rtl">
                            <span className="text-base">👆</span>
                            <span>مرّر إصبعك على المصحف لتقليب الصفحات</span>
                          </div>

                          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                            {/* Left: The page workspace (double/single) */}
                            <div className={cn("w-full transition-all duration-500", showSidePanel ? "lg:col-span-8" : "lg:col-span-12")}>
                              {pages[currentPage] ? (
                                <div className="space-y-6">
                                  {pageViewLayout === 'double' ? (
                                    <>
                                      {/* Desktop Double-Page Flip Book Spread */}
                                      <div
                                        onTouchStart={handleTouchStart}
                                        onTouchMove={handleTouchMove}
                                        onTouchEnd={handleTouchEnd}
                                        className="hidden lg:block relative bg-[#2a1b0e] p-8 rounded-[3rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] border-8 border-[#3d2715]"
                                      >
                                        <div className="grid grid-cols-2 gap-0 relative bg-[#fbf9f1] rounded-2xl shadow-inner overflow-hidden min-h-[550px]">
                                          {/* Spine gutter shadow */}
                                          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[2px] bg-black/10 z-20 pointer-events-none" />
                                          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-10 bg-gradient-to-r from-black/15 via-transparent to-black/15 z-10 pointer-events-none" />

                                          {/* Right Page (Odd) */}
                                          <div className="relative border-l border-black/5 p-8 flex flex-col justify-between">
                                            <div className="flex justify-between items-center text-[9px] font-black text-amber-950/40 pb-2 border-b border-amber-950/5 mb-4">
                                              <span>صفحة {rightPage}</span>
                                              <span>الجزء {pages[rightPage]?.[0]?.juz_number || '-'}</span>
                                            </div>

                                            {!rightImgError && mushafType !== 'digital' ? (
                                              <div className="relative flex-1 flex items-center justify-center">
                                                {isRightImageLoading && (
                                                  <Loader2 className="w-8 h-8 animate-spin text-amber-800/40 absolute" />
                                                )}
                                                <img
                                                  src={rightImgSrc}
                                                  onLoad={() => setIsRightImageLoading(false)}
                                                  onError={handleRightImageError}
                                                  alt={`Page ${rightPage}`}
                                                  className={cn("max-h-[580px] object-contain mix-blend-multiply opacity-95 transition-opacity duration-300", isRightImageLoading ? "opacity-0" : "opacity-95")}
                                                />
                                              </div>
                                            ) : (
                                              <div className="flex-1 text-center font-quran text-2xl text-amber-950 leading-loose flex flex-wrap justify-center content-center gap-x-2 gap-y-1" dir="rtl">
                                                {pages[rightPage]?.map((v: any) => (
                                                  <span key={v.id} onClick={() => handlePlayVerse(v)} className={cn("cursor-pointer hover:text-primary transition-all rounded px-1", currentAudio?.id === v.id ? "text-primary font-black bg-primary/10" : "")}>
                                                    {v.arabic}
                                                    <span className="mx-1 inline-flex w-8 h-8 rounded-full border border-amber-950/20 items-center justify-center text-[9px] font-sans text-amber-900 bg-amber-950/5 align-middle">
                                                      {v.ayahNumber}
                                                    </span>
                                                  </span>
                                                ))}
                                              </div>
                                            )}
                                            <div className="absolute inset-0 pointer-events-none opacity-[0.1] bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] mix-blend-overlay" />
                                          </div>

                                          {/* Left Page (Even) */}
                                          <div className="relative p-8 flex flex-col justify-between">
                                            <div className="flex justify-between items-center text-[9px] font-black text-amber-950/40 pb-2 border-b border-amber-950/5 mb-4">
                                              <span>الجزء {pages[leftPage]?.[0]?.juz_number || '-'}</span>
                                              <span>صفحة {leftPage}</span>
                                            </div>

                                            {!leftImgError && mushafType !== 'digital' ? (
                                              <div className="relative flex-1 flex items-center justify-center">
                                                {isLeftImageLoading && (
                                                  <Loader2 className="w-8 h-8 animate-spin text-amber-800/40 absolute" />
                                                )}
                                                <img
                                                  src={leftImgSrc}
                                                  onLoad={() => setIsLeftImageLoading(false)}
                                                  onError={handleLeftImageError}
                                                  alt={`Page ${leftPage}`}
                                                  className={cn("max-h-[580px] object-contain mix-blend-multiply opacity-95 transition-opacity duration-300", isLeftImageLoading ? "opacity-0" : "opacity-95")}
                                                />
                                              </div>
                                            ) : (
                                              <div className="flex-1 text-center font-quran text-2xl text-amber-950 leading-loose flex flex-wrap justify-center content-center gap-x-2 gap-y-1" dir="rtl">
                                                {pages[leftPage]?.map((v: any) => (
                                                  <span key={v.id} onClick={() => handlePlayVerse(v)} className={cn("cursor-pointer hover:text-primary transition-all rounded px-1", currentAudio?.id === v.id ? "text-primary font-black bg-primary/10" : "")}>
                                                    {v.arabic}
                                                    <span className="mx-1 inline-flex w-8 h-8 rounded-full border border-amber-950/20 items-center justify-center text-[9px] font-sans text-amber-900 bg-amber-950/5 align-middle">
                                                      {v.ayahNumber}
                                                    </span>
                                                  </span>
                                                ))}
                                              </div>
                                            )}
                                            <div className="absolute inset-0 pointer-events-none opacity-[0.1] bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] mix-blend-overlay" />
                                          </div>
                                        </div>
                                      </div>

                                      {/* Mobile Single-Page Fallback */}
                                      <div
                                        onTouchStart={handleTouchStart}
                                        onTouchMove={handleTouchMove}
                                        onTouchEnd={handleTouchEnd}
                                        className="lg:hidden relative bg-[#2a1b0e] p-5 rounded-[2.5rem] shadow-[0_20px_50px_-15px_rgba(0,0,0,0.8)] border-6 border-[#3d2715]"
                                      >
                                        <div className="relative bg-[#fbf9f1] rounded-xl shadow-inner overflow-hidden p-6 min-h-[480px] flex flex-col justify-between">
                                          <div className="flex justify-between items-center text-[9px] font-black text-amber-950/40 pb-2 border-b border-amber-950/5 mb-4">
                                            <span>صفحة {currentPage}</span>
                                            <span>الجزء {pages[currentPage]?.[0]?.juz_number || '-'}</span>
                                          </div>

                                          {!mushafError && mushafType !== 'digital' ? (
                                            <div className="relative flex-1 flex items-center justify-center">
                                              {isRightImageLoading && (
                                                <Loader2 className="w-8 h-8 animate-spin text-amber-800/40 absolute" />
                                              )}
                                              <img
                                                src={rightImgSrc}
                                                onLoad={() => setIsRightImageLoading(false)}
                                                onError={handleRightImageError}
                                                alt={`Page ${currentPage}`}
                                                className={cn("max-h-[500px] object-contain mix-blend-multiply opacity-95 transition-opacity duration-300", isRightImageLoading ? "opacity-0" : "opacity-95")}
                                              />
                                            </div>
                                          ) : (
                                            <div className="flex-1 text-center font-quran text-xl text-amber-950 leading-loose flex flex-wrap justify-center content-center gap-x-2 gap-y-1" dir="rtl">
                                              {pages[currentPage]?.map((v: any) => (
                                                <span key={v.id} onClick={() => handlePlayVerse(v)} className={cn("cursor-pointer hover:text-primary transition-all rounded px-1", currentAudio?.id === v.id ? "text-primary font-black bg-primary/10" : "")}>
                                                  {v.arabic}
                                                  <span className="mx-1 inline-flex w-8 h-8 rounded-full border border-amber-950/20 items-center justify-center text-[9px] font-sans text-amber-900 bg-amber-950/5 align-middle">
                                                    {v.ayahNumber}
                                                  </span>
                                                </span>
                                              ))}
                                            </div>
                                          )}
                                          <div className="absolute inset-0 pointer-events-none opacity-[0.1] bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] mix-blend-overlay" />
                                        </div>
                                      </div>
                                    </>
                                  ) : (
                                    /* Single-Page Layout (All Screens) */
                                    <div
                                      onTouchStart={handleTouchStart}
                                      onTouchMove={handleTouchMove}
                                      onTouchEnd={handleTouchEnd}
                                      className="relative bg-[#2a1b0e] p-8 rounded-[3rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] border-8 border-[#3d2715] max-w-xl mx-auto"
                                    >
                                      <div className="relative bg-[#fbf9f1] rounded-2xl shadow-inner overflow-hidden p-8 min-h-[550px] flex flex-col justify-between">
                                        <div className="flex justify-between items-center text-[9px] font-black text-amber-950/40 pb-2 border-b border-amber-950/5 mb-4">
                                          <span>صفحة {currentPage}</span>
                                          <span>الجزء {pages[currentPage]?.[0]?.juz_number || '-'}</span>
                                        </div>

                                        {!mushafError && mushafType !== 'digital' ? (
                                          <div className="relative flex-1 flex items-center justify-center">
                                            {isRightImageLoading && (
                                              <Loader2 className="w-8 h-8 animate-spin text-amber-800/40 absolute" />
                                            )}
                                            <img
                                              src={rightImgSrc}
                                              onLoad={() => setIsRightImageLoading(false)}
                                              onError={handleRightImageError}
                                              alt={`Page ${currentPage}`}
                                              className={cn("max-h-[580px] object-contain mix-blend-multiply opacity-95 transition-opacity duration-300", isRightImageLoading ? "opacity-0" : "opacity-95")}
                                            />
                                          </div>
                                        ) : (
                                          <div className="flex-1 text-center font-quran text-2xl text-amber-950 leading-loose flex flex-wrap justify-center content-center gap-x-2 gap-y-1" dir="rtl">
                                            {pages[currentPage]?.map((v: any) => (
                                              <span key={v.id} onClick={() => handlePlayVerse(v)} className={cn("cursor-pointer hover:text-primary transition-all rounded px-1", currentAudio?.id === v.id ? "text-primary font-black bg-primary/10" : "")}>
                                                {v.arabic}
                                                <span className="mx-1 inline-flex w-8 h-8 rounded-full border border-amber-950/20 items-center justify-center text-[9px] font-sans text-amber-900 bg-amber-950/5 align-middle">
                                                  {v.ayahNumber}
                                                </span>
                                              </span>
                                            ))}
                                          </div>
                                        )}
                                        <div className="absolute inset-0 pointer-events-none opacity-[0.1] bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] mix-blend-overlay" />
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="py-20 flex flex-col items-center gap-4 text-white/20">
                                  <Loader2 className="w-8 h-8 animate-spin" />
                                  <p className="text-[10px] font-black uppercase tracking-widest">جاري إعداد الصفحة...</p>
                                </div>
                              )}
                            </div>

                            {/* Right: The Split-Screen Side Panel Drawer */}
                            {showSidePanel && (
                              <div className="w-full lg:col-span-4 bg-[#080808]/95 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-6 shadow-2xl space-y-6 lg:sticky lg:top-6" dir="rtl">
                                <div className="flex justify-between items-center pb-4 border-b border-white/5">
                                  <div className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-primary" />
                                    <h3 className="text-white font-black text-xs">اللوحة الذكية التفاعلية</h3>
                                  </div>
                                  <button onClick={() => setShowSidePanel(false)} className="w-8 h-8 rounded-full bg-white/5 text-white/40 hover:text-white flex items-center justify-center">
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>

                                {/* Verses Interactive Directory */}
                                <div className="space-y-3">
                                  <h4 className="text-[9px] font-black text-white/30 uppercase tracking-widest">آيات الصفحة الحالية</h4>
                                  <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                                    {((pageViewLayout === 'double'
                                      ? [...(pages[rightPage] || []), ...(pages[leftPage] || [])]
                                      : (pages[currentPage] || [])) as any[]).map((verse: any) => {
                                        const isCurrentActive = currentAudio?.id === verse.id;
                                        return (
                                          <div
                                            key={verse.id}
                                            onClick={() => handlePlayVerse(verse)}
                                            className={cn(
                                              "p-3.5 rounded-2xl border transition-all cursor-pointer text-right space-y-2",
                                              isCurrentActive
                                                ? "bg-primary/10 border-primary/30"
                                                : "bg-white/[0.02] border-white/5 hover:bg-white/5"
                                            )}
                                          >
                                            <div className="flex justify-between items-center text-[9px] font-bold text-white/40">
                                              <span className="px-2 py-0.5 rounded bg-white/5">آية {verse.ayahNumber}</span>
                                              <span>صفحة {verse.page_number}</span>
                                            </div>
                                            <p className="font-quran text-base text-white leading-relaxed">{verse.arabic}</p>
                                            {isCurrentActive && (
                                              <div className="pt-2.5 border-t border-white/5 text-xs text-white/60 font-tajawal space-y-1">
                                                <p className="text-primary font-black">تفسير الآية:</p>
                                                <p className="leading-relaxed text-[11px] text-white/70">{verse.tafseer}</p>
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                  </div>
                                </div>

                                {/* memorization repetition module */}
                                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 space-y-4">
                                  <h4 className="text-[9px] font-black text-white/30 uppercase tracking-widest pb-2 border-b border-white/5">أدوات الحفظ والمراجعة التكرارية</h4>

                                  {/* Single Verse Repetition */}
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-white/60">تكرار الآية الحالية:</span>
                                    <div className="flex items-center gap-2">
                                      <button onClick={() => setVerseRepetition(prev => Math.max(1, prev - 1))} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white flex items-center justify-center font-bold text-sm">-</button>
                                      <span className="w-6 text-center text-primary font-black">{verseRepetition}x</span>
                                      <button onClick={() => setVerseRepetition(prev => prev + 1)} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white flex items-center justify-center font-bold text-sm">+</button>
                                    </div>
                                  </div>

                                  {/* Range Loop */}
                                  <div className="space-y-3 pt-3 border-t border-white/5">
                                    <div className="flex items-center justify-between text-xs">
                                      <span className="text-white/60">تكرار نطاق من الآيات (حلقة):</span>
                                      <button
                                        onClick={() => setRangeLoopActive(!rangeLoopActive)}
                                        className={cn("px-3 py-1 rounded-lg text-[9px] font-black transition-all", rangeLoopActive ? "bg-primary text-primary-foreground shadow-glow-primary" : "bg-white/5 text-white/40")}
                                      >
                                        {rangeLoopActive ? "مفعل" : "مغلق"}
                                      </button>
                                    </div>

                                    {rangeLoopActive && (
                                      <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-1">
                                          <label className="text-[8px] text-white/30 font-bold block">من آية:</label>
                                          <select
                                            value={rangeStartVerse?.id || ''}
                                            onChange={(e) => {
                                              const currentRangeVerses = pageViewLayout === 'double'
                                                ? [...(pages[rightPage] || []), ...(pages[leftPage] || [])]
                                                : (pages[currentPage] || []);
                                              const v = currentRangeVerses.find((x: any) => x.id === Number(e.target.value));
                                              if (v) setRangeStartVerse(v);
                                            }}
                                            className="w-full bg-[#121212] border border-white/10 rounded-lg p-2 text-[10px] text-white focus:outline-none"
                                          >
                                            <option value="">اختر...</option>
                                            {((pageViewLayout === 'double'
                                              ? [...(pages[rightPage] || []), ...(pages[leftPage] || [])]
                                              : (pages[currentPage] || [])) as any[]).map((x: any) => (
                                                <option key={x.id} value={x.id}>آية {x.ayahNumber}</option>
                                              ))}
                                          </select>
                                        </div>

                                        <div className="space-y-1">
                                          <label className="text-[8px] text-white/30 font-bold block">إلى آية:</label>
                                          <select
                                            value={rangeEndVerse?.id || ''}
                                            onChange={(e) => {
                                              const currentRangeVerses = pageViewLayout === 'double'
                                                ? [...(pages[rightPage] || []), ...(pages[leftPage] || [])]
                                                : (pages[currentPage] || []);
                                              const v = currentRangeVerses.find((x: any) => x.id === Number(e.target.value));
                                              if (v) setRangeEndVerse(v);
                                            }}
                                            className="w-full bg-[#121212] border border-white/10 rounded-lg p-2 text-[10px] text-white focus:outline-none"
                                          >
                                            <option value="">اختر...</option>
                                            {((pageViewLayout === 'double'
                                              ? [...(pages[rightPage] || []), ...(pages[leftPage] || [])]
                                              : (pages[currentPage] || [])) as any[]).map((x: any) => (
                                                <option key={x.id} value={x.id}>آية {x.ayahNumber}</option>
                                              ))}
                                          </select>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Speech Recitation Verification Panel */}
                                {currentAudio && (
                                  <div className="bg-gradient-to-br from-primary/5 to-transparent border border-primary/20 rounded-2xl p-4 space-y-4">
                                    <div className="flex justify-between items-center">
                                      <h4 className="text-[9px] font-black text-primary uppercase tracking-widest">تسميع الآية بالذكاء الاصطناعي</h4>
                                      {isTestingRecitation && (
                                        <button
                                          onClick={() => {
                                            stopListeningRecitation();
                                            setIsTestingRecitation(false);
                                            setTestWordsResult(null);
                                          }}
                                          className="text-[9px] text-white/40 hover:text-white"
                                        >
                                          إلغاء
                                        </button>
                                      )}
                                    </div>

                                    {!isTestingRecitation ? (
                                      <button
                                        onClick={() => startListeningRecitation(currentAudio)}
                                        className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-black text-xs hover:scale-[1.02] transition-all flex items-center justify-center gap-2 shadow-glow-primary"
                                      >
                                        <Mic className="w-3.5 h-3.5" />
                                        <span>ابدأ التسميع الصوتي الآن</span>
                                      </button>
                                    ) : (
                                      <div className="space-y-3">
                                        <div className="p-3 bg-black/40 rounded-xl border border-white/5 min-h-[60px] flex items-center justify-center flex-wrap gap-1" dir="rtl">
                                          {testWordsResult ? (
                                            testWordsResult.map((w, idx) => (
                                              <span
                                                key={idx}
                                                className={cn(
                                                  "text-sm font-quran transition-colors",
                                                  w.status === 'correct' ? "text-emerald-400 font-bold" : "text-red-500 line-through opacity-60"
                                                )}
                                              >
                                                {w.word}
                                              </span>
                                            ))
                                          ) : (
                                            <p className="text-white/20 text-[10px] font-bold animate-pulse">اقرأ الآية بصوتك المرتل الآن...</p>
                                          )}
                                        </div>

                                        <div className="flex items-center justify-between text-xs">
                                          <div className="flex items-center gap-2">
                                            <span className={cn("w-2 h-2 rounded-full", isListeningRecitation ? "bg-emerald-500 animate-ping" : "bg-red-500")} />
                                            <span className="text-[10px] text-white/60">{isListeningRecitation ? "جاري الاستماع..." : "متوقف"}</span>
                                          </div>

                                          <div className="flex items-center gap-2">
                                            {isListeningRecitation ? (
                                              <button
                                                onClick={stopListeningRecitation}
                                                className="px-2.5 py-1 bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg text-[9px] font-black hover:bg-red-500/30 transition-all"
                                              >
                                                إيقاف الاستماع
                                              </button>
                                            ) : (
                                              <button
                                                onClick={() => startListeningRecitation(currentAudio)}
                                                className="px-2.5 py-1 bg-primary text-primary-foreground rounded-lg text-[9px] font-black hover:scale-105 transition-all"
                                              >
                                                تحدث مجدداً
                                              </button>
                                            )}
                                          </div>
                                        </div>

                                        {testMatchPercentage > 0 && (
                                          <div className="space-y-1">
                                            <div className="flex justify-between text-[9px] font-black">
                                              <span className="text-white/40">نسبة تطابق التسميع:</span>
                                              <span className="text-primary">{testMatchPercentage}%</span>
                                            </div>
                                            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                              <div className="h-full bg-primary transition-all duration-300" style={{ width: `${testMatchPercentage}%` }} />
                                            </div>
                                            {testMatchPercentage === 100 && (
                                              <p className="text-[10px] text-emerald-400 font-black text-center pt-1 animate-bounce">ما شاء الله! قراءة وحفظ متقن 100% ✨</p>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}


                                {/* ── Ambient Focus Sounds ── */}
                                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 space-y-4">
                                  <div className="flex justify-between items-center pb-2 border-b border-white/5">
                                    <h4 className="text-[9px] font-black text-white/30 uppercase tracking-widest">أصوات التركيز المهدئة 🌧️</h4>
                                    {activeAmbient && (
                                      <button
                                        onClick={() => setActiveAmbient(null)}
                                        className="text-[9px] text-amber-500 font-bold hover:text-amber-400"
                                      >
                                        إيقاف الكل
                                      </button>
                                    )}
                                  </div>

                                  <div className="grid grid-cols-2 gap-2">
                                    {AMBIENT_SOUNDS.map(s => {
                                      const isActive = activeAmbient === s.id;
                                      return (
                                        <button
                                          key={s.id}
                                          onClick={() => setActiveAmbient(isActive ? null : s.id)}
                                          className={cn(
                                            "p-3 rounded-xl text-[10px] font-black text-right transition-all flex items-center justify-between border",
                                            isActive
                                              ? "bg-amber-500/10 border-amber-500/30 text-amber-400 font-bold"
                                              : "bg-white/5 border-transparent text-white/40 hover:bg-white/10 hover:text-white"
                                          )}
                                        >
                                          <span>{s.name}</span>
                                          {isActive && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />}
                                        </button>
                                      );
                                    })}
                                  </div>

                                  {activeAmbient && (
                                    <div className="space-y-2 pt-2 animate-in fade-in slide-in-from-top-2">
                                      <div className="flex justify-between items-center text-[8px] font-black text-white/30">
                                        <span>حجم صوت الخلفية</span>
                                        <span>{Math.round(ambientVolume * 100)}%</span>
                                      </div>
                                      <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.05"
                                        value={ambientVolume}
                                        onChange={(e) => setAmbientVolume(parseFloat(e.target.value))}
                                        className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Pagination Control buttons at the bottom of the page */}
                          <div className="flex items-center gap-6 mt-4">
                            <button
                              disabled={pageNumbers.indexOf(currentPage) === 0}
                              onClick={() => setCurrentPage(pageNumbers[pageNumbers.indexOf(currentPage) - 1])}
                              className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-primary hover:border-primary/40 transition-all disabled:opacity-20 shadow-xl"
                            >
                              <ChevronRight className="w-6 h-6" />
                            </button>
                            <div className="px-8 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-white/40 text-xs tracking-widest shadow-inner">
                              {pageNumbers.indexOf(currentPage) + 1} <span className="mx-2 opacity-20">/</span> {pageNumbers.length}
                            </div>
                            <button
                              disabled={pageNumbers.indexOf(currentPage) === pageNumbers.length - 1}
                              onClick={() => setCurrentPage(pageNumbers[pageNumbers.indexOf(currentPage) + 1])}
                              className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-primary hover:border-primary/40 transition-all disabled:opacity-20 shadow-xl"
                            >
                              <ChevronLeft className="w-6 h-6" />
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {view === 'plan' && (
            <div className="space-y-12">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative">
                <div className="absolute inset-0 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
                  {/* Left Column: Progress & Quick Actions */}
                  <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 text-center relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <PlanProgress percentage={memorizationStats.percentage} />
                      <div className="mt-8">
                        <h3 className="text-2xl font-black text-white mb-2">تقدمك الحالي</h3>
                        <p className="text-white/30 text-xs font-bold leading-relaxed">
                          أنت تسير بشكل رائع! لقد أنجزت {memorizationStats.completed} سورة من أصل 114 سورة.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-8">
                        <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                          <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">سور محفوظة</p>
                          <p className="text-xl font-black text-white">{memorizationStats.completed}</p>
                        </div>
                        <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                          <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">النقاط</p>
                          <p className="text-xl font-black text-primary">{(state.points || 0) + (memorizationStats.completed * 50)}</p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setIsExamOpen(true)}
                      disabled={memorizedVerses.length === 0}
                      className="w-full p-8 rounded-[2.5rem] bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/20 hover:border-amber-500/40 transition-all flex items-center justify-between group disabled:opacity-50 shadow-xl"
                    >
                      <div className="text-right">
                        <h4 className="text-amber-100 font-black mb-1">اختبار الحفظ</h4>
                        <p className="text-[10px] text-amber-500/60 font-bold uppercase tracking-widest">ثبت حفظك بالاختبارات</p>
                      </div>
                      <Trophy className="w-8 h-8 text-amber-400" />
                    </button>
                  </div>

                  {/* Right Column: Active Plan & Selection */}
                  <div className="lg:col-span-8 space-y-8">
                    {state.activeMemoPlan ? (
                      <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 md:p-12 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-12 text-white/[0.02] text-9xl font-black select-none pointer-events-none">📖</div>

                        <div className="relative z-10 flex flex-col md:flex-row items-start justify-between gap-8">
                          <div className="text-right">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                              <Target className="w-3.5 h-3.5" /> الخطة الحالية
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                              {MEMO_PLANS.find(p => p.id === state.activeMemoPlan?.planId)?.label}
                            </h2>
                            <p className="text-white/40 text-sm leading-relaxed max-w-md">
                              تتطلب هذه الخطة حفظ {MEMO_PLANS.find(p => p.id === state.activeMemoPlan?.planId)?.pagesPerDay} صفحة يومياً لإكمال المصحف كاملاً.
                            </p>
                          </div>

                          <div className="w-full md:w-auto p-8 rounded-[2.5rem] bg-primary text-primary-foreground shadow-glow-primary text-center">
                            <p className="text-[10px] font-black uppercase tracking-widest mb-4 opacity-70">الورد اليومي المقترح</p>
                            <h3 className="text-2xl font-black mb-6">
                              صفحة {dailyWord?.page} - {dailyWord?.surah}
                            </h3>
                            <button
                              onClick={() => {
                                setView('full');
                                setViewMode('page');
                                setCurrentPage(dailyWord?.page || 1);
                                // Optional: load the specific surah for that page
                              }}
                              className="w-full py-4 bg-black/20 hover:bg-black/30 rounded-xl font-black text-sm flex items-center justify-center gap-3 transition-all"
                            >
                              ابدأ الآن <ArrowLeft className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="mt-12 pt-12 border-t border-white/5">
                          <h4 className="text-sm font-black text-white/30 uppercase tracking-widest mb-8">تغيير الخطة</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                            {MEMO_PLANS.map(plan => {
                              const isActive = state.activeMemoPlan?.planId === plan.id;
                              return (
                                <button
                                  key={plan.id}
                                  onClick={() => activatePlan(plan.id)}
                                  className={cn(
                                    "p-6 rounded-2xl border transition-all text-right group",
                                    isActive ? "bg-primary/20 border-primary shadow-glow-primary" : "bg-white/5 border-white/5 hover:border-white/20"
                                  )}
                                >
                                  <h5 className={cn("font-black text-sm mb-1", isActive ? "text-primary" : "text-white/60")}>{plan.label}</h5>
                                  <p className="text-[10px] text-white/20 font-bold">{plan.months > 0 ? `${plan.months} شهراً` : 'مخصص'}</p>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white/5 border border-white/10 rounded-[3rem] p-16 text-center space-y-8">
                        <Sparkles className="w-16 h-16 text-primary mx-auto opacity-20" />
                        <div>
                          <h2 className="text-3xl font-black text-white mb-4">ابدأ رحلتك المباركة</h2>
                          <p className="text-white/40 max-w-md mx-auto leading-relaxed">قم باختيار الخطة التي تناسب وقتك وقدراتك لنقوم بمساعدتك في تتبع وردك اليومي ومراجعتك بانتظام.</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                          {MEMO_PLANS.map(plan => (
                            <button key={plan.id} onClick={() => activatePlan(plan.id)} className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-primary/40 hover:bg-primary/5 transition-all text-right group">
                              <h4 className="text-white font-black mb-2 group-hover:text-primary transition-colors">{plan.label}</h4>
                              <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">{plan.months > 0 ? `${plan.months} شهراً` : 'خطة حرة'}</p>
                              <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                                <span className="text-sm font-black text-primary">{plan.pagesPerDay} <span className="text-[10px] text-white/40 font-normal">صفحة/يوم</span></span>
                                <ArrowLeft className="w-4 h-4 text-white/10 group-hover:text-primary group-hover:translate-x-[-4px] transition-all" />
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 flex items-center justify-between">
                        <div className="text-right">
                          <h4 className="text-white font-black mb-1">أوسمة الإنجاز</h4>
                          <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">تلقيت 3 أوسمة هذا الأسبوع</p>
                        </div>
                        <div className="flex -space-x-3">
                          {[1, 2, 3].map(i => <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 border-2 border-[#0a0a0a] flex items-center justify-center text-[10px] shadow-lg">🏆</div>)}
                        </div>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 flex items-center justify-between">
                        <div className="text-right">
                          <h4 className="text-white font-black mb-1">سجل المراجعة</h4>
                          <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">آخر مراجعة: منذ يومين</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/20 flex items-center justify-center text-blue-400"><History className="w-6 h-6" /></div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {view === 'radio' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
              
              {/* Top Banner Player (Now Playing) */}
              <div className="bg-[#0a0a0a]/90 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-6 relative overflow-hidden group shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                {/* Glowing ambient background based on selected station */}
                <div
                  className={cn(
                    "absolute -top-32 -right-32 w-96 h-96 blur-[120px] rounded-full opacity-20 transition-all duration-1000 pointer-events-none bg-gradient-to-br",
                    currentRadioStation ? currentRadioStation.color : "from-primary/30 to-transparent"
                  )}
                />

                <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6" dir="rtl">
                  {/* Left Column: Metadata & Vinyl & Play Button */}
                  <div className="flex flex-col sm:flex-row items-center gap-6 lg:w-1/3 w-full">
                    {/* Rotating Vinyl design (smaller for horizontal layout) */}
                    <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                      <div
                        className={cn(
                          "absolute inset-0 rounded-full border border-white/5 bg-black/50 transition-all duration-[4s] shadow-2xl flex items-center justify-center",
                          isPlayingRadio && !isRadioBuffering ? "animate-spin" : ""
                        )}
                        style={{ animationDuration: '10s' }}
                      >
                        <div className="absolute inset-1 rounded-full border border-dashed border-white/5" />
                        <div className="absolute inset-2 rounded-full border border-white/5" />
                        <div className="absolute inset-4 rounded-full border border-dashed border-white/5" />
                        <div className="absolute inset-6 rounded-full border border-white/5" />
                      </div>
                      <div className={cn(
                        "w-12 h-12 rounded-full bg-gradient-to-tr flex flex-col items-center justify-center border-[4px] border-black/90 shadow-2xl relative z-10 transition-all duration-700",
                        currentRadioStation ? currentRadioStation.color : "from-zinc-800 to-zinc-900"
                      )}>
                        <span className="text-xl">{currentRadioStation ? currentRadioStation.icon : '📻'}</span>
                      </div>
                    </div>

                    {/* Info & Play controls */}
                    <div className="flex-1 text-center sm:text-right space-y-2">
                      <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[8px] font-black uppercase tracking-[0.25em] inline-flex items-center gap-1.5">
                        <Radio className="w-3 h-3 animate-pulse" />
                        <span>إذاعة القرآن الكريم</span>
                      </div>
                      
                      <div className="space-y-0.5">
                        {currentRadioStation ? (
                          <>
                            <h3 className="text-base font-black text-white leading-tight">{currentRadioStation.name}</h3>
                            <p className="text-white/40 text-[10px] font-semibold">{currentRadioStation.subtitle}</p>
                          </>
                        ) : (
                          <>
                            <h3 className="text-base font-black text-white/40">بانتظار اختيار محطة</h3>
                            <p className="text-white/20 text-[10px] font-medium">استمع بتلاوات وبث مباشر على مدار الساعة</p>
                          </>
                        )}
                      </div>

                      {/* Play & Volume controls row */}
                      <div className="flex items-center justify-center sm:justify-start gap-4 mt-2">
                        {currentRadioStation && (
                          <button
                            onClick={() => handlePlayRadio(currentRadioStation)}
                            className={cn(
                              "w-11 h-11 rounded-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl shrink-0",
                              isPlayingRadio && !isRadioBuffering ? "bg-white text-black hover:bg-white/90" : "bg-primary text-primary-foreground shadow-glow-primary"
                            )}
                          >
                            {isRadioBuffering ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : isPlayingRadio ? (
                              <Pause className="w-5 h-5 fill-current" />
                            ) : (
                              <Play className="w-5 h-5 fill-current" />
                            )}
                          </button>
                        )}

                        <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl w-full max-w-[150px]">
                          <button onClick={() => setRadioVolume(radioVolume === 0 ? 0.8 : 0)} className="text-white/40 hover:text-white transition-colors shrink-0">
                            {radioVolume === 0 ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-primary" />}
                          </button>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={radioVolume}
                            onChange={(e) => setRadioVolume(parseFloat(e.target.value))}
                            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Center Column: Real-time Visualizer & Shortcuts */}
                  <div className="flex flex-col justify-center gap-3 lg:w-1/3 w-full">
                    <div className="w-full h-12 relative overflow-hidden rounded-2xl border border-white/5 bg-black/40 group/viz">
                      <canvas ref={isAmbientScreenSaver ? null : canvasRef} className="w-full h-full" />
                      
                      <div className="absolute top-1.5 left-2 z-20 flex gap-1 bg-black/70 p-0.5 rounded-lg border border-white/10 opacity-0 group-hover/viz:opacity-100 transition-opacity">
                        {([
                          { id: 'columns', name: 'أعمدة' },
                          { id: 'waves', name: 'موجات' },
                          { id: 'particles', name: 'نبضات' }
                        ] as const).map(style => (
                          <button
                            key={style.id}
                            onClick={() => setVisualizerStyle(style.id)}
                            className={cn(
                              "px-2 py-0.5 rounded text-[8px] font-black transition-all whitespace-nowrap",
                              visualizerStyle === style.id ? "bg-primary text-black font-black" : "text-white/40 hover:text-white"
                            )}
                          >
                            {style.name}
                          </button>
                        ))}
                      </div>

                      {isRadioBuffering && (
                        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 text-white/60 text-[10px] font-black backdrop-blur-[1px]">
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                          <span>جاري الاتصال بالبث...</span>
                        </div>
                      )}
                    </div>

                    {currentRadioStation && (
                      <div className="grid grid-cols-4 gap-1.5 w-full">
                        <button
                          onClick={() => setRadioQuality(prev => prev === 'high' ? 'low' : 'high')}
                          className={cn(
                            "flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl border text-[8px] font-black transition-all active:scale-95",
                            radioQuality === 'high'
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : "bg-white/5 text-white/50 border-white/5 hover:bg-white/10"
                          )}
                          title="تحديد جودة البث للحفاظ على باقة الإنترنت"
                        >
                          <span className="text-xs mb-0.5">⚡</span>
                          <span className="truncate w-full text-center">{radioQuality === 'high' ? "جودة عالية" : "توفير الباقة"}</span>
                        </button>

                        <button
                          onClick={() => setIsAmbientScreenSaver(true)}
                          className="flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl bg-white/5 text-white/60 border border-white/5 hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-all active:scale-95"
                          title="تفعيل وضع ملء الشاشة الهادئ"
                        >
                          <span className="text-xs mb-0.5">🌙</span>
                          <span className="truncate w-full text-center">الشاشة الهادئة</span>
                        </button>

                        <button
                          onClick={isRecording ? stopRecording : startRecording}
                          className={cn(
                            "flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl border text-[8px] font-black transition-all active:scale-95",
                            isRecording
                              ? "bg-rose-500/20 text-rose-400 border-rose-500/30 animate-pulse"
                              : "bg-white/5 text-white/60 border-white/5 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20"
                          )}
                          title="تسجيل مقطع صوتي من البث المباشر"
                        >
                          <span className="text-xs mb-0.5">{isRecording ? "🔴" : "🎙️"}</span>
                          <span className="truncate w-full text-center">{isRecording ? `${recordingDuration}ث` : "تسجيل البث"}</span>
                        </button>

                        <button
                          onClick={() => {
                            const shareUrl = `${window.location.origin}${window.location.pathname}?radio=${currentRadioStation.id}`;
                            navigator.clipboard.writeText(shareUrl);
                            setIsShareCopied(true);
                            setTimeout(() => setIsShareCopied(false), 2000);
                          }}
                          className={cn(
                            "flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl border text-[8px] font-black transition-all active:scale-95",
                            isShareCopied
                              ? "bg-primary/20 text-primary border-primary/30"
                              : "bg-white/5 text-white/60 border-white/5 hover:bg-white/10"
                          )}
                          title="مشاركة رابط الإذاعة المباشر"
                        >
                          <span className="text-xs mb-0.5">{isShareCopied ? "✓" : "🔗"}</span>
                          <span className="truncate w-full text-center">{isShareCopied ? "تم النسخ!" : "مشاركة البث"}</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Sleep Timer & Scheduled Alarm */}
                  <div className="flex flex-col sm:flex-row items-stretch gap-3 lg:w-1/3 w-full">
                    {/* Sleep Timer */}
                    <div className="flex-1 bg-white/[0.02] border border-white/5 rounded-2xl p-3 flex flex-col justify-between gap-1.5 text-right">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black text-white/45 uppercase tracking-widest">⏰ مؤقت النوم</span>
                        {sleepTimerMinutes && <span className="text-[8px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">نشط</span>}
                      </div>

                      {sleepTimerMinutes ? (
                        <div className="flex flex-col items-center justify-center py-0.5">
                          <span className="text-xl font-black text-primary tracking-wider font-mono">
                            {Math.floor(sleepTimerRemaining / 60)}:{String(sleepTimerRemaining % 60).padStart(2, '0')}
                          </span>
                          <button
                            onClick={cancelSleepTimer}
                            className="mt-1 text-[8px] font-bold text-rose-400 hover:text-rose-300 transition-colors"
                          >
                            إلغاء المؤقت ✖
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <div className="flex gap-1">
                            <input
                              type="number"
                              placeholder="دقائق"
                              value={customTimerMinutes}
                              onChange={(e) => setCustomTimerMinutes(e.target.value)}
                              className="w-12 bg-black/40 border border-white/10 rounded-lg px-1.5 py-0.5 text-[9px] text-white outline-none focus:border-primary/45"
                              min="1"
                            />
                            <button
                              onClick={() => {
                                const mins = parseInt(customTimerMinutes);
                                if (mins > 0) {
                                  startSleepTimer(mins);
                                  setCustomTimerMinutes('');
                                }
                              }}
                              className="flex-1 py-0.5 rounded-lg bg-primary text-primary-foreground font-black text-[9px] hover:bg-primary/95 transition-all shadow-glow-primary"
                            >
                              تفعيل ⚡
                            </button>
                          </div>
                          <div className="grid grid-cols-4 gap-0.5">
                            {[15, 30, 45, 60].map(mins => (
                              <button
                                key={mins}
                                onClick={() => startSleepTimer(mins)}
                                className="py-0.5 rounded bg-white/5 text-white/50 text-[8px] font-black hover:text-primary transition-all border border-white/5"
                              >
                                {mins}د
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Scheduled Alarm */}
                    <div className="flex-1 bg-white/[0.02] border border-white/5 rounded-2xl p-3 flex flex-col justify-between gap-1.5 text-right">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black text-white/45 uppercase tracking-widest">⏰ تشغيل تلقائي</span>
                        {isAlarmEnabled && <span className="text-[8px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">مفعل</span>}
                      </div>

                      <div className="space-y-1">
                        <div className="flex gap-1">
                          <input
                            type="time"
                            value={alarmTime}
                            onChange={(e) => {
                              setAlarmTime(e.target.value);
                              localStorage.setItem('quran_radio_alarm_time', e.target.value);
                            }}
                            className="w-16 bg-black/40 border border-white/10 rounded-lg px-1 py-0.5 text-[9px] text-white outline-none focus:border-primary/45 text-center font-mono"
                          />
                          <button
                            onClick={() => {
                              const nextVal = !isAlarmEnabled;
                              setIsAlarmEnabled(nextVal);
                              localStorage.setItem('quran_radio_alarm_enabled', String(nextVal));
                              if (nextVal && currentRadioStation) {
                                setAlarmStationId(currentRadioStation.id);
                                localStorage.setItem('quran_radio_alarm_station', currentRadioStation.id);
                              }
                            }}
                            className={cn(
                              "flex-1 py-0.5 rounded-lg font-black text-[9px] transition-all",
                              isAlarmEnabled ? "bg-rose-500/20 text-rose-400" : "bg-primary text-primary-foreground hover:bg-primary/95"
                            )}
                          >
                            {isAlarmEnabled ? "إلغاء ✖" : "جدولة ⚡"}
                          </button>
                        </div>
                        <p className="text-[8px] text-white/30 text-center leading-tight">
                          {isAlarmEnabled ? `يعمل تلقائياً الساعة ${alarmTime}` : "جدول موعد لتشغيل الإذاعة"}
                        </p>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Bottom Sections Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
                {/* Stations List Grid Section (lg:col-span-2) */}
                <div className="lg:col-span-2 space-y-6 flex flex-col">
                  {/* Search bar inside Radio View */}
                  <div className="relative group">
                    <Search className="absolute right-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-white/30 group-focus-within:text-primary transition-colors" />
                    <input
                      type="text"
                      placeholder="ابحث عن محطة بث أو اسم قارئ..."
                      value={radioSearchQuery}
                      onChange={(e) => setRadioSearchQuery(e.target.value)}
                      className="w-full h-16 bg-[#0a0a0a]/80 border border-white/10 rounded-[1.5rem] ps-14 pe-6 text-sm text-white outline-none focus:border-primary/30 focus:bg-white/[0.04] transition-all"
                    />
                    {radioSearchQuery && (
                      <button onClick={() => setRadioSearchQuery('')} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors">
                        <X className="w-4.5 h-4.5" />
                      </button>
                    )}
                  </div>

                  {/* Category Selector Tabs */}
                  <div className="flex flex-wrap gap-2 pb-2 overflow-x-auto no-scrollbar" dir="rtl">
                    {[
                      { id: 'all', label: 'الكل 📻' },
                      { id: 'premium_reciters', label: 'كبار القرّاء 🎙️' },
                      { id: 'favorites', label: 'المفضلة ❤️' },
                      { id: 'history', label: 'استمعت مؤخراً ⏳' },
                      { id: 'custom', label: 'إذاعاتي الخاصة ➕' },
                      { id: 'adhkar', label: 'إذاعات الأذكار 📿' },
                    ].map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setRadioCategory(cat.id as any)}
                        className={cn(
                          "px-4 py-2 rounded-xl text-xs font-black transition-all border whitespace-nowrap active:scale-95",
                          radioCategory === cat.id
                            ? "bg-primary text-primary-foreground border-primary shadow-glow-primary"
                            : "bg-white/5 text-white/50 border-white/5 hover:bg-white/10 hover:text-white"
                        )}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Add Custom Radio Station form/trigger row */}
                  {radioCategory === 'custom' && (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-white/80">أضف إذاعة جديدة مخصصة:</span>
                        <button
                          onClick={() => setIsAddCustomRadioOpen(!isAddCustomRadioOpen)}
                          className="px-3 py-1 rounded-lg bg-primary/20 text-primary border border-primary/20 text-[10px] font-black hover:bg-primary/30 transition-all"
                        >
                          {isAddCustomRadioOpen ? "إخفاء الاستمارة ✖" : "فتح الاستمارة ➕"}
                        </button>
                      </div>

                      {isAddCustomRadioOpen && (
                        <div className="space-y-3 pt-2 border-t border-white/5">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <input
                              type="text"
                              placeholder="اسم الإذاعة (مثال: إذاعة القارئ فلان)"
                              value={customRadioName}
                              onChange={(e) => setCustomRadioName(e.target.value)}
                              className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/25 outline-none focus:border-primary/40 focus:bg-black/60 transition-all"
                            />
                            <input
                              type="text"
                              placeholder="رابط البث المباشر (URL) أو رابط يوتيوب"
                              value={customRadioUrl}
                              onChange={(e) => setCustomRadioUrl(e.target.value)}
                              className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/25 outline-none focus:border-primary/40 focus:bg-black/60 transition-all text-left"
                              dir="ltr"
                            />
                          </div>
                          <p className="text-[10px] text-white/40 text-right leading-relaxed font-semibold">
                            💡 يمكنك إدخال رابط بث مباشر أو فيديو من يوتيوب، وسنقوم بتشغيل الصوت منه تلقائياً كبث مباشر صوتي!
                          </p>
                          <div className="flex gap-2 justify-end">
                            <div className="flex gap-1.5 items-center bg-black/40 border border-white/10 rounded-xl px-3 py-1 text-xs">
                              <span className="text-white/40">أيقونة:</span>
                              {['📻', '🕌', '🌙', '📖', '🎙️', '🌟', '🛡️'].map(emoji => (
                                <button
                                  key={emoji}
                                  type="button"
                                  onClick={() => setCustomRadioIcon(emoji)}
                                  className={cn(
                                    "p-1 rounded-lg text-sm transition-all hover:bg-white/10",
                                    customRadioIcon === emoji ? "bg-primary/20 scale-110" : ""
                                  )}
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                            <button
                              onClick={() => {
                                if (!customRadioName.trim() || !customRadioUrl.trim()) {
                                  alert('الرجاء تعبئة جميع الحقول');
                                  return;
                                }
                                if (!customRadioUrl.startsWith('http://') && !customRadioUrl.startsWith('https://')) {
                                  alert('رابط البث يجب أن يبدأ بـ http:// أو https://');
                                  return;
                                }
                                
                                const newStation: RadioStation = {
                                  id: `custom_${Date.now()}`,
                                  name: customRadioName.trim(),
                                  subtitle: 'إذاعة مخصصة بواسطة المستخدم',
                                  url: customRadioUrl.trim(),
                                  icon: customRadioIcon,
                                  color: 'from-violet-500/20 to-violet-950/40',
                                  borderColor: 'border-violet-500/30',
                                  textColor: 'text-violet-400'
                                };
                                
                                setCustomRadioStations(prev => {
                                  const next = [newStation, ...prev];
                                  localStorage.setItem('quran_custom_radios', JSON.stringify(next));
                                  return next;
                                });
                                
                                setCustomRadioName('');
                                setCustomRadioUrl('');
                                setIsAddCustomRadioOpen(false);
                              }}
                              className="px-5 py-2 rounded-xl bg-primary text-primary-foreground font-black text-xs hover:bg-primary/95 transition-all shadow-glow-primary active:scale-95"
                            >
                              حفظ الإذاعة 💾
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Stations Grid */}
                  <div className="flex flex-col gap-2 max-h-[520px] overflow-y-auto pr-1 no-scrollbar">
                    {filteredStations.map(station => {
                      const isCurrent = currentRadioStation?.id === station.id;
                      const isPlayingThis = isCurrent && isPlayingRadio;
                      const isFav = favoriteRadioIds.includes(station.id);
                      return (
                        <div
                          key={station.id}
                          onClick={() => handlePlayRadio(station)}
                          className={cn(
                            "flex items-center justify-between gap-4 px-5 py-4 rounded-2xl border cursor-pointer transition-all duration-200 group",
                            isCurrent
                              ? "bg-primary/10 border-primary/30 shadow-md"
                              : "bg-white/[0.03] border-white/10 hover:bg-white/[0.07] hover:border-white/20"
                          )}
                        >
                          {/* Icon */}
                          <div className={cn(
                            "w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0",
                            isCurrent ? "bg-primary/20" : "bg-white/5"
                          )}>
                            {station.icon}
                          </div>

                          {/* Name */}
                          <div className="flex-1 text-right">
                            <p className={cn(
                              "font-bold text-sm leading-snug",
                              isCurrent ? "text-primary" : "text-white/80 group-hover:text-white"
                            )}>
                              {station.name}
                            </p>
                            <p className={cn(
                              "text-[10px] mt-0.5 font-semibold",
                              isPlayingThis ? "text-emerald-400" : isCurrent && isRadioBuffering ? "text-amber-400" : "text-white/30"
                            )}>
                              {isPlayingThis ? "🟢 البث نشط" : isCurrent && isRadioBuffering ? "⏳ جاري التوصيل..." : "● بث مباشر"}
                            </p>
                          </div>

                           {/* Favorite */}
                           <button
                             onClick={(e) => toggleFavoriteRadio(station.id, e)}
                             className="w-12 h-12 rounded-2xl flex items-center justify-center hover:bg-white/5 transition-all z-10 shrink-0 group/fav"
                             title="إضافة إلى المفضلة"
                           >
                             <Heart
                               className={cn(
                                 "w-6 h-6 transition-all duration-300 transform group-hover/fav:scale-110",
                                 isFav
                                   ? "text-rose-500 fill-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]"
                                   : "text-white/40 group-hover:text-white/80"
                               )}
                             />
                           </button>

                           {/* Custom Delete Button */}
                           {station.id.startsWith('custom_') && (
                             <button
                               onClick={(e) => {
                                 e.stopPropagation();
                                 if (confirm('هل أنت متأكد من حذف هذه الإذاعة المخصصة؟')) {
                                   setCustomRadioStations(prev => {
                                     const next = prev.filter(s => s.id !== station.id);
                                     localStorage.setItem('quran_custom_radios', JSON.stringify(next));
                                     return next;
                                   });
                                   if (currentRadioStation?.id === station.id) {
                                     stopRadio();
                                   }
                                 }
                               }}
                               className="w-12 h-12 rounded-2xl flex items-center justify-center hover:bg-rose-500/10 text-rose-400/60 hover:text-rose-400 transition-all z-10 shrink-0 group/del"
                               title="حذف الإذاعة"
                             >
                               <Trash2 className="w-5 h-5 transition-transform group-hover/del:scale-110" />
                             </button>
                           )}

                           {/* Play Button */}
                           <div className={cn(
                             "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300",
                             isCurrent
                               ? "bg-primary text-white shadow-glow-primary scale-105"
                               : "bg-white/5 text-white/60 group-hover:bg-primary/20 group-hover:text-primary group-hover:scale-105"
                           )}>
                             {isPlayingThis
                               ? <Pause className="w-5 h-5 fill-current" />
                               : <Play className="w-5 h-5 fill-current translate-x-[1.5px]" />
                             }
                           </div>
                        </div>
                      );
                    })}

                    {isLoadingRadios && (
                      <div className="col-span-full py-20 text-center text-white/30">
                        <Loader2 className="w-10 h-10 mx-auto mb-4 animate-spin text-primary" />
                        <p className="text-sm font-bold">جاري تحميل محطات الإذاعة...</p>
                        <p className="text-[10px] text-white/20 mt-1">يتصل بـ mp3quran.net</p>
                      </div>
                    )}

                    {!isLoadingRadios && filteredStations.length === 0 && (
                      <div className="col-span-full py-20 text-center text-white/20">
                        <Radio className="w-12 h-12 mx-auto opacity-15 mb-4 animate-pulse" />
                        <p className="text-sm font-bold">لم نجد محطة بث تطابق بحثك</p>
                        <p className="text-[10px] text-white/10 mt-1">تأكد من إدخال اسم القارئ بشكل صحيح</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sidebar (lg:col-span-1): Analytics & Ambient focus mixer */}
                <div className="lg:col-span-1 space-y-6 flex flex-col">
                  {/* Listening Analytics Dashboard Card */}
                  <div className="bg-[#0a0a0a]/90 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-8 space-y-6 shadow-xl text-right" dir="rtl">
                    <div className="flex items-center justify-between pb-4 border-b border-white/5">
                      <h4 className="text-sm font-black text-white flex items-center gap-2">
                        <span>📊 إحصائيات الاستماع الشخصية</span>
                      </h4>
                      <span className="text-[9px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-lg">تحديث مباشر</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-center">
                        <span className="text-2xl block mb-1">⏳</span>
                        <span className="text-xl font-black text-white block">{listeningMinutes}</span>
                        <span className="text-[9px] text-white/30 font-bold block mt-1">دقائق الاستماع</span>
                      </div>
                      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-center">
                        <span className="text-2xl block mb-1">📿</span>
                        <span className="text-xl font-black text-emerald-400 block">+{listeningMinutes * 10}</span>
                        <span className="text-[9px] text-white/30 font-bold block mt-1">حسنات تقديرية</span>
                      </div>
                    </div>

                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 space-y-2">
                      <div className="flex justify-between text-[10px] text-white/40 font-bold">
                        <span>الهدف اليومي: 30 دقيقة</span>
                        <span>{Math.min(100, Math.round((listeningMinutes / 30) * 100))}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-emerald-400 transition-all duration-500"
                          style={{ width: `${Math.min(100, (listeningMinutes / 30) * 100)}%` }}
                        />
                      </div>
                      <p className="text-[9px] text-white/30 text-center font-semibold pt-1">
                        {listeningMinutes >= 30 ? "🎉 أحسنت! لقد أكملت هدف الاستماع اليومي." : "استمر في الاستماع لتصل إلى هدفك اليومي!"}
                      </p>
                    </div>
                  </div>

                  {/* Ambient Focus Sound Mixer Card */}
                  <div className="bg-[#0a0a0a]/90 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-8 space-y-6 shadow-xl text-right" dir="rtl">
                    <div className="flex items-center justify-between pb-4 border-b border-white/5">
                      <h4 className="text-sm font-black text-white flex items-center gap-2">
                        <span>🌧️ دمج الأصوات الإيمانية المهدئة</span>
                      </h4>
                      {activeAmbient && (
                        <button
                          onClick={() => setActiveAmbient(null)}
                          className="text-[10px] text-rose-400 font-bold hover:text-rose-300"
                        >
                          إيقاف دمج الصوت
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] text-white/40 leading-relaxed">
                      اختر مؤثراً صوتياً طبيعياً لدمجه وتشغيله بهدوء في الخلفية أثناء استماعك للقرآن الكريم:
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                      {AMBIENT_SOUNDS.map(s => {
                        const isActive = activeAmbient === s.id;
                        return (
                          <button
                            key={s.id}
                            onClick={() => setActiveAmbient(isActive ? null : s.id)}
                            className={cn(
                              "p-4 rounded-2xl text-xs font-black text-right transition-all flex items-center justify-between border active:scale-95",
                              isActive
                                ? "bg-primary/10 border-primary/30 text-primary font-bold shadow-sm"
                                : "bg-white/5 border-white/5 text-white/50 hover:bg-white/10 hover:text-white"
                            )}
                          >
                            <span>{s.name}</span>
                            {isActive && <span className="w-2 h-2 rounded-full bg-primary animate-ping" />}
                          </button>
                        );
                      })}
                    </div>

                    {activeAmbient && (
                      <div className="space-y-2 pt-2 animate-in fade-in slide-in-from-top-2">
                        <div className="flex justify-between items-center text-[10px] font-black text-white/30">
                          <span>حجم صوت الطبيعة المدمج</span>
                          <span>{Math.round(ambientVolume * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={ambientVolume}
                          onChange={(e) => setAmbientVolume(parseFloat(e.target.value))}
                          className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>

      {/* ── Luminous Mushaf View ── */}
      {view === 'luminous' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-[200] bg-black overflow-y-auto">
          <div className="sticky top-4 left-4 z-50 flex justify-end px-4">
            <button onClick={() => setView('full')} className="bg-white/10 hover:bg-white/20 text-white p-4 rounded-full backdrop-blur-md">
              <X className="w-6 h-6" />
            </button>
          </div>
          <LuminousMushaf
            surahs={surahs}
            currentAudio={currentAudio}
            isPlaying={isPlaying}
            onPlay={handlePlayVerse}
            selectedScript={selectedScript}
            selectedTafseer={selectedTafseer}
            selectedReciter={selectedReciter}
            reciters={RECITERS}
            onSelectReciter={setSelectedReciter}
            selectedTranslation={selectedTranslation}
            translations={TRANSLATIONS}
            onSelectTranslation={setSelectedTranslation}
            audioRef={audioRef}
          />
        </motion.div>
      )}

      <AnimatePresence>
        {currentAudio && (
          <motion.div initial={{ y: 150, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 150, opacity: 0 }} className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] w-[95%] max-w-xl">
            <div className="bg-[#0a0a0a]/90 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-6 shadow-[0_20px_100px_-20px_rgba(0,0,0,1)] flex items-center justify-between gap-8">
              <div className="flex items-center gap-5 overflow-hidden"><div className="w-16 h-16 rounded-[2rem] bg-primary/20 flex items-center justify-center shrink-0 shadow-inner"><span className="text-2xl animate-pulse">{selectedReciter.icon}</span></div><div className="overflow-hidden"><h4 className="text-white font-black text-base truncate mb-1">سورة {currentAudio.surah}</h4><div className="flex items-center gap-2"><span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-black">آية {currentAudio.ayahNumber}</span><span className="text-white/20 text-[10px] font-bold">بصوت {selectedReciter.name}</span></div></div></div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/5" dir="rtl">
                  <button
                    onClick={() => setPlayMode('surah')}
                    className={cn(
                      "px-3 py-2 rounded-xl text-[10px] font-black transition-all flex items-center gap-1",
                      playMode === 'surah' ? "bg-primary text-primary-foreground font-black shadow-glow-primary" : "text-white/40 hover:text-white"
                    )}
                    title="سماع السورة كاملة"
                  >
                    🔁 <span className="hidden sm:inline">السورة كاملة</span>
                  </button>
                  <button
                    onClick={() => setPlayMode('ayah')}
                    className={cn(
                      "px-3 py-2 rounded-xl text-[10px] font-black transition-all flex items-center gap-1",
                      playMode === 'ayah' ? "bg-primary text-primary-foreground font-black shadow-glow-primary" : "text-white/40 hover:text-white"
                    )}
                    title="سماع آية بعد آية"
                  >
                    ⏭️ <span className="hidden sm:inline">آية بعد آية</span>
                  </button>
                  <button
                    onClick={() => setPlayMode('single')}
                    className={cn(
                      "px-3 py-2 rounded-xl text-[10px] font-black transition-all flex items-center gap-1",
                      playMode === 'single' ? "bg-primary text-primary-foreground font-black shadow-glow-primary" : "text-white/40 hover:text-white"
                    )}
                    title="سماع آية واحدة فقط"
                  >
                    🔂 <span className="hidden sm:inline">آية واحدة</span>
                  </button>
                </div>
                <div className="hidden md:flex items-center gap-1 px-3 py-2 bg-white/5 rounded-2xl border border-white/5">
                  <span className="text-[8px] font-black text-white/20 uppercase tracking-widest mr-2">السرعة</span>
                  {[0.5, 1, 1.5, 2].map(speed => (
                    <button key={speed} onClick={() => setPlaybackSpeed(speed)} className={cn("w-8 h-8 rounded-lg text-[10px] font-black transition-all", playbackSpeed === speed ? "bg-primary text-primary-foreground" : "text-white/40 hover:bg-white/10")}>{speed}x</button>
                  ))}
                </div>
                <button onClick={() => setIsPlaying(!isPlaying)} className="w-16 h-16 rounded-[2rem] bg-white text-black flex items-center justify-center hover:scale-105 transition-all shadow-glow-white shrink-0">{isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 fill-current" />}</button>
                <button onClick={() => { setCurrentAudio(null); setIsPlaying(false); audioRef.current?.pause(); }} className="w-12 h-12 rounded-2xl bg-white/5 text-white/20 hover:text-white transition-all flex items-center justify-center shrink-0"><X className="w-5 h-5" /></button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Floating Radio Mini-Bar (shows when radio plays & not on radio tab) ── */}
      <AnimatePresence>
        {isPlayingRadio && currentRadioStation && view !== 'radio' && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[150] w-[92%] max-w-md"
          >
            <div className="bg-[#0a0a0a]/95 backdrop-blur-2xl border border-white/10 rounded-[2rem] px-5 py-3.5 shadow-[0_10px_60px_-15px_rgba(0,0,0,0.9)] flex items-center gap-4" dir="rtl">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-lg shrink-0 animate-pulse">
                {currentRadioStation.icon}
              </div>
              <div className="flex-1 min-w-0 text-right">
                <p className="text-xs font-black text-white truncate">{currentRadioStation.name}</p>
                <p className="text-[9px] text-emerald-400 font-bold">🟢 بث مباشر{sleepTimerMinutes ? ` • ⏳ ${Math.floor(sleepTimerRemaining / 60)}:${String(sleepTimerRemaining % 60).padStart(2, '0')}` : ''}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => { setView('radio'); }}
                  className="p-2 rounded-xl bg-white/5 text-white/50 hover:bg-white/10 hover:text-white transition-all"
                  title="الذهاب للإذاعة"
                >
                  <Radio className="w-4 h-4" />
                </button>
                <button
                  onClick={stopRadio}
                  className="p-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-all"
                  title="إيقاف البث"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isQuickJumpOpen && (
          <QuickJumpModal
            onClose={() => setIsQuickJumpOpen(false)}
            surahs={surahs}
            quickJumpSurah={quickJumpSurah}
            setQuickJumpSurah={setQuickJumpSurah}
            quickJumpAyah={quickJumpAyah}
            setQuickJumpAyah={setQuickJumpAyah}
            onSubmit={handleQuickJumpSubmit}
          />
        )}
      </AnimatePresence>

      {/* ── Ambient Sleep Screen Saver Overlay ── */}
      <AnimatePresence>
        {isAmbientScreenSaver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[600] bg-[#030303] text-white flex flex-col justify-between p-8 md:p-12 overflow-hidden"
            dir="rtl"
          >
            {/* Animated Radial Light Background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--primary-rgb),0.07)_0%,transparent_70%)] animate-pulse pointer-events-none" style={{ animationDuration: '6s' }} />

            {/* Floating particle simulations in background */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
              <div className="absolute w-[2px] h-[2px] bg-white rounded-full top-1/4 left-1/4 animate-ping" style={{ animationDuration: '4s' }} />
              <div className="absolute w-[2px] h-[2px] bg-white rounded-full top-1/3 left-2/3 animate-ping" style={{ animationDuration: '6s' }} />
              <div className="absolute w-[2px] h-[2px] bg-white rounded-full top-2/3 left-1/3 animate-ping" style={{ animationDuration: '5s' }} />
              <div className="absolute w-[2px] h-[2px] bg-white rounded-full top-3/4 left-3/4 animate-ping" style={{ animationDuration: '7s' }} />
            </div>

            {/* Header Area */}
            <div className="flex items-center justify-between w-full relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-black text-white/40 uppercase tracking-widest">وضع الاستماع الهادئ</span>
              </div>

              {/* Clock */}
              <div className="text-left font-mono text-white/50 text-sm font-bold">
                <span className="hidden sm:inline-block ml-2">{new Date().toLocaleDateString('ar-EG', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                <span>{new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>

            {/* Center Content: Rotating vinyl or audio waves */}
            <div className="flex flex-col items-center justify-center gap-8 my-auto relative z-10">
              <div className="relative w-64 h-64 flex items-center justify-center">
                {/* Outer glow ring */}
                <div className={cn(
                  "absolute inset-0 rounded-full border border-primary/20 blur-xl opacity-50 scale-110 transition-all duration-[3s]",
                  isPlayingRadio ? "animate-pulse" : ""
                )} />

                <div
                  className={cn(
                    "absolute inset-0 rounded-full border border-white/5 bg-black/60 shadow-[0_0_80px_rgba(0,0,0,0.8)] transition-all duration-[10s] flex items-center justify-center",
                    isPlayingRadio ? "animate-spin" : ""
                  )}
                  style={{ animationDuration: '16s' }}
                >
                  {/* Vinyl grooves */}
                  <div className="absolute inset-4 rounded-full border border-dashed border-white/5" />
                  <div className="absolute inset-8 rounded-full border border-white/5" />
                  <div className="absolute inset-16 rounded-full border border-dashed border-white/5" />
                  <div className="absolute inset-24 rounded-full border border-white/5" />
                </div>

                {/* Vinyl center sticker */}
                <div className={cn(
                  "w-28 h-28 rounded-full bg-gradient-to-tr flex flex-col items-center justify-center border-[8px] border-[#0a0a0a] shadow-2xl relative z-10",
                  currentRadioStation ? currentRadioStation.color : "from-zinc-800 to-zinc-900"
                )}>
                  <span className="text-4xl">{currentRadioStation ? currentRadioStation.icon : '📻'}</span>
                </div>
              </div>

              {/* Station details */}
              <div className="text-center space-y-3">
                <h2 className="text-2xl md:text-3xl font-black text-white max-w-lg mx-auto leading-tight drop-shadow-md">
                  {currentRadioStation ? currentRadioStation.name : 'إذاعة القرآن الكريم'}
                </h2>
                <p className="text-white/40 text-xs md:text-sm font-bold tracking-wide">
                  {currentRadioStation ? currentRadioStation.subtitle : 'استماع مباشر بدون تشتيت'}
                </p>
              </div>

              {/* Active countdown or visual wave */}
              <div className="w-full max-w-md h-16 relative overflow-hidden rounded-xl border border-white/5 bg-black/40 group/viz mx-auto">
                <canvas ref={isAmbientScreenSaver ? canvasRef : null} className="w-full h-full" />
                
                <div className="absolute top-1.5 left-2 z-20 flex gap-1 bg-black/70 p-0.5 rounded-lg border border-white/10 opacity-0 group-hover/viz:opacity-100 transition-opacity">
                  {([
                    { id: 'columns', name: 'أعمدة' },
                    { id: 'waves', name: 'موجات' },
                    { id: 'particles', name: 'نبضات' }
                  ] as const).map(style => (
                    <button
                      key={style.id}
                      onClick={() => setVisualizerStyle(style.id)}
                      className={cn(
                        "px-2 py-0.5 rounded text-[8px] font-black transition-all whitespace-nowrap",
                        visualizerStyle === style.id ? "bg-primary text-black font-black" : "text-white/40 hover:text-white"
                      )}
                    >
                      {style.name}
                    </button>
                  ))}
                </div>

                {isRadioBuffering && (
                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 text-white/60 text-[10px] font-black backdrop-blur-[1px]">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                    <span>جاري الاتصال بالبث المباشر...</span>
                  </div>
                )}

                {!isPlayingRadio && !isRadioBuffering && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white/40 text-[10px] font-black backdrop-blur-[1px]">
                    <span>البث متوقف مؤقتاً</span>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Area: Simple controls & Exit */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 w-full relative z-10 border-t border-white/5 pt-6">
              {/* Left: Volume control */}
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl w-full sm:w-auto max-w-[200px]">
                <button onClick={() => setRadioVolume(radioVolume === 0 ? 0.8 : 0)} className="text-white/40 hover:text-white transition-colors shrink-0">
                  {radioVolume === 0 ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-primary" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={radioVolume}
                  onChange={(e) => setRadioVolume(parseFloat(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              {/* Center: Play/Pause */}
              <div className="flex items-center gap-4">
                {currentRadioStation && (
                  <button
                    onClick={() => handlePlayRadio(currentRadioStation)}
                    className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-glow-white"
                  >
                    {isPlayingRadio ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current translate-x-[1.5px]" />}
                  </button>
                )}
                {sleepTimerMinutes && (
                  <div className="bg-white/5 border border-white/10 px-4 py-2.5 rounded-2xl text-xs font-black text-emerald-400 font-mono tracking-wider flex items-center gap-2">
                    <span>⏳</span>
                    <span>{Math.floor(sleepTimerRemaining / 60)}:{String(sleepTimerRemaining % 60).padStart(2, '0')}</span>
                  </div>
                )}
              </div>

              {/* Right: Exit */}
              <button
                onClick={() => setIsAmbientScreenSaver(false)}
                className="px-6 py-2.5 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-xs font-black border border-rose-500/20 transition-all flex items-center justify-center gap-2 active:scale-95 w-full sm:w-auto"
              >
                <span>خروج من وضع الهدوء</span>
                <span>✖</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden YouTube Player Iframe */}
      {activeYoutubeId && (
        <iframe
          id="youtube-radio-player"
          width="1"
          height="1"
          src={`https://www.youtube.com/embed/${activeYoutubeId}?enablejsapi=1&autoplay=1&controls=0&mute=0`}
          title="YouTube Radio Player"
          className="absolute -top-1000 -left-1000 w-1 h-1 opacity-0 pointer-events-none"
          allow="autoplay"
        />
      )}
    </div>
  );
}

