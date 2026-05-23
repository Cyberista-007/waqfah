'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Sparkles, ChevronRight, ChevronLeft, Loader2, Play, Pause, List, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LuminousMushafProps {
  surahs: any[];
  currentAudio: any;
  isPlaying: boolean;
  onPlay: (verse: any) => void;
  selectedScript: any;
  selectedTafseer: any;
  selectedReciter: any;
  reciters?: any[];
  onSelectReciter?: (reciter: any) => void;
}

export function LuminousMushaf({
  surahs = [],
  currentAudio,
  isPlaying,
  onPlay,
  selectedScript,
  selectedTafseer,
  selectedReciter,
  reciters = [],
  onSelectReciter
}: LuminousMushafProps) {
  const [activeSurahNumber, setActiveSurahNumber] = useState<number>(1);
  const [verses, setVerses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeVerseIndex, setActiveVerseIndex] = useState<number>(0);
  const [showSurahList, setShowSurahList] = useState<boolean>(false);
  const [showReciterList, setShowReciterList] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const activeVerseRef = useRef<HTMLDivElement | null>(null);

  // Sync with currentAudio playing globally
  useEffect(() => {
    if (currentAudio && currentAudio.surahNumber === activeSurahNumber) {
      const idx = verses.findIndex(v => v.id === currentAudio.id);
      if (idx !== -1) {
        setActiveVerseIndex(idx);
      }
    }
  }, [currentAudio, verses, activeSurahNumber]);

  // Load verses of activeSurahNumber
  const loadSurahVerses = useCallback(async (num: number) => {
    setIsLoading(true);
    try {
      const scriptEdition = selectedScript?.edition || 'quran-uthmani';
      const tafseerEdition = selectedTafseer?.id || 'ar.muyassar';

      const [scriptData, tafseerData] = await Promise.all([
        fetch(`https://api.alquran.cloud/v1/surah/${num}/editions/${scriptEdition}`).then(res => res.json()),
        fetch(`https://api.alquran.cloud/v1/surah/${num}/${tafseerEdition}`).then(res => res.json())
      ]);

      if (scriptData?.data?.[0] && tafseerData?.data) {
        const combined = scriptData.data[0].ayahs.map((ayah: any, i: number) => ({
          id: ayah.number,
          surah: scriptData.data[0].name,
          surahNumber: num,
          ayahNumber: ayah.numberInSurah,
          arabic: ayah.text,
          tafseer: tafseerData.data.ayahs[i].text,
          sajdah: ayah.sajdah,
          page_number: ayah.page || 1,
          juz_number: ayah.juz || 1
        }));

        // Clean Bismillah
        if (num !== 1 && num !== 9 && combined.length > 0) {
          const bismillahPattern = /^بِسْمِ[\s\S]*?الرَّحِيْمِ\s*|^بِسْمِ[\s\S]*?الرَّحِيمِ\s*/;
          combined[0].arabic = combined[0].arabic.replace(bismillahPattern, "").trim();
        }

        setVerses(combined);
        
        // Match active index to current audio if same surah
        if (currentAudio && currentAudio.surahNumber === num) {
          const idx = combined.findIndex((v: any) => v.id === currentAudio.id);
          setActiveVerseIndex(idx !== -1 ? idx : 0);
        } else {
          setActiveVerseIndex(0);
        }
      }
    } catch (e) {
      console.error('Error fetching luminous verses:', e);
    } finally {
      setIsLoading(false);
    }
  }, [selectedScript, selectedTafseer, currentAudio]);

  useEffect(() => {
    loadSurahVerses(activeSurahNumber);
  }, [activeSurahNumber, loadSurahVerses]);

  // Scroll active verse into view
  useEffect(() => {
    if (activeVerseRef.current) {
      activeVerseRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeVerseIndex]);

  const handleVerseClick = (idx: number) => {
    setActiveVerseIndex(idx);
    const verse = verses[idx];
    if (verse) {
      onPlay(verse);
    }
  };

  const nextVerse = () => {
    if (activeVerseIndex < verses.length - 1) {
      handleVerseClick(activeVerseIndex + 1);
    }
  };

  const prevVerse = () => {
    if (activeVerseIndex > 0) {
      handleVerseClick(activeVerseIndex - 1);
    }
  };

  const filteredSurahs = surahs.filter(s => 
    s.name.includes(searchQuery) || 
    s.number.toString() === searchQuery ||
    s.englishName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeSurahName = surahs.find(s => s.number === activeSurahNumber)?.name || 'سورة الفاتحة';
  const activeVerse = verses[activeVerseIndex];

  return (
    <div className="relative min-h-[90vh] bg-[#020202] flex flex-col items-center justify-between py-12 px-4 selection:bg-amber-500/30 selection:text-amber-200" dir="rtl">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{
            top: `${30 + (activeVerseIndex * 2)}%`,
            opacity: [0.15, 0.25, 0.15],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-1/2 -translate-x-1/2 w-[90%] max-w-[800px] h-[500px] bg-amber-500/10 rounded-[100%] blur-[120px]" 
        />
      </div>

      {/* Header Selector */}
      <div className="relative z-30 w-full max-w-xl mb-6">
        <div className="flex items-center justify-between bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 shadow-xl">
          <button 
            onClick={() => {
              setShowSurahList(!showSurahList);
              setShowReciterList(false);
            }}
            className="flex items-center gap-3 text-amber-100 hover:text-amber-400 font-bold transition-all text-xs md:text-sm"
          >
            <List className="w-4 h-4 text-amber-500" />
            <span>{activeSurahName}</span>
          </button>

          {/* Reciter Selector in Smart Page */}
          {reciters.length > 0 && onSelectReciter && (
            <button 
              onClick={() => {
                setShowReciterList(!showReciterList);
                setShowSurahList(false);
              }}
              className="flex items-center gap-2 text-amber-100 hover:text-amber-400 font-bold transition-all text-xs md:text-sm border-r border-white/10 pr-4 mr-auto"
            >
              <span className="text-sm">{selectedReciter?.icon || '🎙️'}</span>
              <span>{selectedReciter?.name || 'القارئ'}</span>
            </button>
          )}
          
          <div className="flex items-center gap-2 text-white/40 text-xs">
            <span>آية {activeVerseIndex + 1} من {verses.length || 0}</span>
          </div>
        </div>

        {/* Surah List Modal/Dropdown */}
        <AnimatePresence>
          {showSurahList && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: 15 }}
              className="absolute top-16 left-0 right-0 bg-[#0c0c0c] border border-white/10 rounded-[2rem] p-6 shadow-3xl max-h-[350px] overflow-y-auto z-50 custom-scrollbar"
            >
              <div className="relative mb-4">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input 
                  type="text" 
                  placeholder="ابحث عن السورة..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 rounded-xl py-3 pr-10 pl-4 text-xs font-bold text-white placeholder:text-white/20 focus:outline-none focus:border-amber-500/30 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                {filteredSurahs.map((s) => (
                  <button 
                    key={s.number}
                    onClick={() => {
                      setActiveSurahNumber(s.number);
                      setShowSurahList(false);
                      setSearchQuery('');
                    }}
                    className={cn(
                      "p-3 rounded-xl text-right text-xs font-bold transition-all border",
                      s.number === activeSurahNumber 
                        ? "bg-amber-500/10 border-amber-500/30 text-amber-400" 
                        : "bg-white/[0.01] border-transparent text-white/60 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <span className="text-white/25 ml-2 text-[10px]">{s.number}.</span>
                    {s.name}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reciter List Modal/Dropdown */}
        <AnimatePresence>
          {showReciterList && reciters.length > 0 && onSelectReciter && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: 15 }}
              className="absolute top-16 left-0 right-0 bg-[#0c0c0c] border border-white/10 rounded-[2rem] p-6 shadow-3xl z-50"
            >
              <h3 className="text-xs font-black text-white/40 mb-4 text-right">اختر القارئ</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {reciters.map((r: any) => (
                  <button 
                    key={r.id}
                    onClick={() => {
                      onSelectReciter(r);
                      setShowReciterList(false);
                    }}
                    className={cn(
                      "p-4 rounded-xl text-right text-xs font-bold transition-all border flex items-center justify-between",
                      r.id === selectedReciter?.id 
                        ? "bg-amber-500/10 border-amber-500/30 text-amber-400" 
                        : "bg-white/[0.01] border-transparent text-white/60 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <span>{r.name}</span>
                    <span className="text-base">{r.icon}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 w-full max-w-4xl flex-1 flex flex-col justify-center items-center my-6">
        {isLoading ? (
          <div className="flex flex-col items-center gap-4 py-20">
            <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
            <p className="text-xs font-black text-white/20 uppercase tracking-widest">جاري تحميل السورة الكريمة...</p>
          </div>
        ) : (
          <div className="w-full text-center space-y-12">
            {/* Ambient Top Border Icon */}
            <div className="flex justify-center mb-2">
              <div className="p-4 rounded-full bg-amber-500/5 border border-amber-500/20 shadow-glow-amber">
                <BookOpen className="w-6 h-6 text-amber-500/80" />
              </div>
            </div>

            {/* Cinematic Large Verse View */}
            <div className="min-h-[220px] flex flex-col justify-center items-center px-4">
              <AnimatePresence mode="wait">
                {activeVerse && (
                  <motion.div
                    key={`${activeSurahNumber}-${activeVerseIndex}`}
                    initial={{ opacity: 0, y: 15, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -15, scale: 0.98 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-8 cursor-pointer"
                    onClick={() => handleVerseClick(activeVerseIndex)}
                  >
                    <p 
                      dir="rtl"
                      className="text-4xl md:text-6xl font-quran leading-loose md:leading-[2.2] text-amber-100 font-bold transition-all duration-500 select-text"
                      style={{ 
                        textShadow: '0 0 30px rgba(245,158,11,0.25), 0 0 10px rgba(245,158,11,0.5)' 
                      }}
                    >
                      {activeVerse.arabic}
                      <span className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-amber-500/40 text-xs font-sans mx-4 text-amber-500 bg-amber-500/5 drop-shadow-glow-amber align-middle">
                        {activeVerse.ayahNumber}
                      </span>
                    </p>

                    {/* Tafseer translation block */}
                    {activeVerse.tafseer && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.7 }}
                        transition={{ delay: 0.2 }}
                        className="max-w-2xl mx-auto p-6 rounded-3xl bg-white/[0.02] border border-white/5 shadow-inner"
                      >
                        <p className="text-xs md:text-sm text-amber-200/90 leading-relaxed font-tajawal">
                          {activeVerse.tafseer}
                        </p>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Quick Play Trigger */}
            <div className="flex justify-center mt-4">
              <button 
                onClick={() => activeVerse && onPlay(activeVerse)}
                className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-glow-white"
              >
                {isPlaying && currentAudio?.id === activeVerse?.id ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6 fill-current" />
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Horizontal Timeline Navigation */}
      <div className="relative z-20 w-full max-w-4xl border-t border-white/5 pt-8 mt-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <button 
            onClick={prevVerse} 
            disabled={activeVerseIndex === 0 || isLoading}
            className="px-4 py-2 flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-20 transition-all font-bold"
          >
            <ChevronRight className="w-4 h-4" />
            <span>الآية السابقة</span>
          </button>

          <button 
            onClick={nextVerse}
            disabled={activeVerseIndex === verses.length - 1 || isLoading}
            className="px-4 py-2 flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-20 transition-all font-bold"
          >
            <span>الآية التالية</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Horizontal scrollbar of verses */}
        <div className="flex items-center gap-2 overflow-x-auto py-3 px-2 custom-scrollbar mask-gradient-horizontal select-none">
          {verses.map((v, idx) => {
            const isActive = idx === activeVerseIndex;
            return (
              <button
                key={v.id}
                onClick={() => handleVerseClick(idx)}
                className={cn(
                  "px-4 py-2.5 rounded-full text-[10px] font-black tracking-wider transition-all whitespace-nowrap shrink-0 border",
                  isActive 
                    ? "bg-amber-500 text-black border-amber-400 shadow-glow-amber font-extrabold" 
                    : "bg-white/5 border-transparent text-white/40 hover:text-white hover:bg-white/10"
                )}
              >
                آية {v.ayahNumber}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
