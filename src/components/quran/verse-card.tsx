'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Star, EyeOff, Music, Pause, Play, Info, Languages, Sparkles,
  Eye, ImageIcon, BookmarkCheck, Check, Copy
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function VerseCard({
  verse,
  accentColor,
  border,
  index,
  isReadingMode,
  fontSize,
  onPlay,
  onShare,
  onBookmark,
  onWordClick,
  isPlaying,
  isBookmarked,
  reciterName,
  id,
  fontClass,
  searchQuery,
  isHideRevealMode,
  quranHideMode = 'hideAll',
  selectedTranslation,
  onChatClick,
  isComparisonMode,
  selectedSecondaryTafseerName,
  selectedSecondaryTranslation,
}: any) {
  const [copied, setCopied] = useState(false);
  const verseRef = useRef<HTMLDivElement>(null);
  const [revealedWords, setRevealedWords] = useState<Set<number>>(new Set());
  const [isCinematicFocus, setIsCinematicFocus] = useState(false);
  const [isLocalHideActive, setIsLocalHideActive] = useState<boolean>(false);
  const [isLocalRevealedOverride, setIsLocalRevealedOverride] = useState<boolean>(false);

  // Reset local overrides when global hide reveal mode changes
  useEffect(() => {
    setIsLocalHideActive(false);
    setIsLocalRevealedOverride(false);
  }, [isHideRevealMode]);

  const isVerseCurrentlyHidden = isHideRevealMode ? !isLocalRevealedOverride : isLocalHideActive;

  // Reset revealed words when hide/reveal mode changes, quranHideMode changes or verse changes
  useEffect(() => {
    setRevealedWords(new Set());
  }, [isHideRevealMode, quranHideMode, verse?.id]);

  const normalizeArabic = (text: string) => {
    if (!text) return '';
    return text
      .replace(/[ًٌٍَُِّْ]/g, "")
      .replace(/[أإآ]/g, "ا")
      .replace(/ة/g, "ه")
      .replace(/ى/g, "ي")
      .trim();
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query || query.length < 2) return text;
    const normalizedText = normalizeArabic(text);
    const normalizedQuery = normalizeArabic(query);

    if (normalizedText.includes(normalizedQuery)) {
      return <span className="text-primary drop-shadow-glow-primary font-black">{text}</span>;
    }
    return text;
  };

  // Auto-scroll effect
  useEffect(() => {
    if (isPlaying && verseRef.current) {
      verseRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isPlaying]);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${verse.arabic}\n— ${verse.surah}: ${verse.ayahNumber}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleRevealWord = (wordIndex: number) => {
    setRevealedWords(prev => {
      const next = new Set(prev);
      if (next.has(wordIndex)) next.delete(wordIndex);
      else next.add(wordIndex);
      return next;
    });
  };

  return (
    <motion.div
      ref={verseRef}
      id={`verse-${id}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "group relative border overflow-hidden p-6 md:p-10 transition-all duration-500",
        isCinematicFocus ? "fixed inset-0 z-[500] rounded-none bg-black/95 backdrop-blur-3xl flex flex-col justify-center overflow-y-auto m-0 shadow-2xl" : "rounded-[2.5rem]",
        !isCinematicFocus && isPlaying ? "bg-primary/20 border-primary/60 shadow-[0_0_50px_-10px_rgba(var(--primary),0.4)] scale-[1.02]" : "",
        !isCinematicFocus && !isPlaying ? "bg-white/[0.03] border-white/5 hover:border-white/20 hover:bg-white/[0.05]" : "",
        !isCinematicFocus && border
      )}
    >
      {verse.sajdah && (
        <div className="absolute top-0 left-0 bg-primary px-4 py-1 rounded-br-2xl text-[8px] font-black uppercase tracking-widest text-primary-foreground flex items-center gap-1.5 z-20 shadow-lg">
          <Star className="w-3 h-3 fill-current" /> سجدة تلاوة
        </div>
      )}
      {isVerseCurrentlyHidden && (
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/15 border border-violet-500/20">
          <EyeOff className="w-3 h-3 text-violet-400" />
          <span className="text-[9px] font-black text-violet-300 uppercase tracking-widest">
            {isHideRevealMode ? "وضع الاختبار" : "إخفاء الآية"}
          </span>
        </div>
      )}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <span className={cn("px-4 py-1.5 rounded-full text-[10px] font-black border bg-black/20", border, accentColor)}>{verse.surah}</span>
          <span className="px-4 py-1.5 rounded-full text-[10px] font-black border border-white/5 bg-black/20 text-white/40">{verse.ayahNumber}</span>
        </div>
        <div className="flex items-center gap-2">
          {isPlaying && (
            <span className="text-[10px] font-bold text-primary animate-pulse ml-2 flex items-center gap-1">
              <Music className="w-3 h-3" /> جاري التلاوة...
            </span>
          )}
          <button
            onClick={() => onPlay?.(verse)}
            className={cn(
              "w-12 h-12 rounded-2xl transition-all duration-300 flex items-center justify-center",
              isPlaying ? "bg-primary text-primary-foreground shadow-glow-primary" : "bg-white/5 text-white/40 hover:bg-primary/20 hover:text-primary"
            )}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
          </button>
        </div>
      </div>
      <p
        dir="rtl"
        className={cn("text-white/95 text-right transition-all duration-500 select-none", isReadingMode ? "text-4xl md:text-6xl" : "text-2xl md:text-3xl", fontClass)}
        style={{
          fontWeight: 'var(--quran-weight, 400)',
          wordSpacing: 'var(--quran-word-spacing, 0px)',
          letterSpacing: 'var(--quran-kashida, 0em)',
          fontSize: isReadingMode && fontSize ? `${fontSize + 10}px` : 'var(--quran-font-size, 2rem)',
          lineHeight: 'var(--quran-line-height, 2.3)',
          paddingTop: '0.25rem',
          paddingBottom: '0.25rem'
        }}
      >
        {verse.arabic.split(' ').map((word: string, i: number) => {
          const isRevealed = revealedWords.has(i);
          const totalWords = verse.arabic.split(' ').length;
          const halfCount = Math.ceil(totalWords / 2);
          const isHiddenByDefault = quranHideMode === 'hideAll' || (quranHideMode === 'hideFirst' && i < halfCount) || (quranHideMode === 'hideSecond' && i >= halfCount);
          const isHidden = isVerseCurrentlyHidden && isHiddenByDefault && !isRevealed;
          return (
            <motion.span
              key={i}
              whileHover={{ scale: 1.15, textShadow: "0px 0px 20px rgba(var(--primary-rgb), 0.6)", y: -3, transition: { type: "spring", stiffness: 300, damping: 15 } }}
              onClick={() => {
                if (isVerseCurrentlyHidden) {
                  toggleRevealWord(i);
                } else {
                  onWordClick?.(verse, i);
                }
              }}
              onMouseEnter={(e: any) => {
                if (isVerseCurrentlyHidden && !isRevealed) {
                  e.currentTarget.style.filter = 'blur(0px)';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.95)';
                }
              }}
              onMouseLeave={(e: any) => {
                if (isVerseCurrentlyHidden && !isRevealed) {
                  e.currentTarget.style.filter = 'blur(6px)';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.15)';
                }
              }}
              className={cn(
                "rounded-lg px-1.5 py-0.5 cursor-pointer transition-colors duration-300 inline-block",
                isHidden
                  ? "text-white/15 bg-white/5 hover:bg-violet-500/10"
                  : "hover:text-primary hover:bg-primary/10"
              )}
              style={isHidden ? { filter: 'blur(6px)' } : {}}
              title={isVerseCurrentlyHidden ? "اضغط لكشف الكلمة" : "انقر لمعرفة التحليل اللغوي"}
            >
              {searchQuery ? highlightMatch(word, searchQuery) : word}{' '}
            </motion.span>
          );
        })}
      </p>
      <div className="mt-8 pt-8 border-t border-white/5 flex flex-col gap-6">
        {!isComparisonMode ? (
          <div className="flex flex-col gap-3 max-w-2xl text-right">
            <div className="flex items-start gap-4">
              <Info className="w-4 h-4 text-white/20 mt-1 shrink-0" />
              <p className={cn("text-white/50 text-sm leading-relaxed", isVerseCurrentlyHidden && "blur-sm hover:blur-none transition-all duration-300")}>{verse.tafseer}</p>
            </div>
            {verse.translation && (
              <div className="flex items-start gap-4 border-t border-white/5 pt-2" dir={selectedTranslation?.lang === 'ur' ? 'rtl' : 'ltr'}>
                <Languages className="w-4 h-4 text-emerald-400/40 mt-1 shrink-0" />
                <p className="text-white/40 text-xs font-semibold leading-relaxed">{verse.translation}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-right w-full">
            {/* Column 1: Primary Interpretation */}
            <div className="flex flex-col gap-4 p-5 rounded-3xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                <span className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">التفسير والترجمة الأساسية</span>
              </div>

              <div className="flex items-start gap-3">
                <Info className="w-4 h-4 text-white/30 mt-1 shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-white/30 mb-1">تفسير الآية</p>
                  <p className={cn("text-white/70 text-xs leading-relaxed font-tajawal", isVerseCurrentlyHidden && "blur-sm hover:blur-none transition-all duration-300")}>{verse.tafseer}</p>
                </div>
              </div>

              {verse.translation && (
                <div className="flex items-start gap-3 border-t border-white/5 pt-3" dir={selectedTranslation?.lang === 'ur' ? 'rtl' : 'ltr'}>
                  <Languages className="w-4 h-4 text-emerald-400/30 mt-1 shrink-0" />
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-white/30 mb-1">الترجمة ({selectedTranslation?.name})</p>
                    <p className="text-white/60 text-xs font-semibold leading-relaxed">{verse.translation}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Column 2: Secondary Interpretation (Comparison) */}
            <div className="flex flex-col gap-4 p-5 rounded-3xl bg-amber-500/[0.02] border border-amber-500/10">
              <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-[10px] font-black text-amber-400/50 uppercase tracking-widest">المقارنة الجانبية</span>
              </div>

              <div className="flex items-start gap-3">
                <Info className="w-4 h-4 text-amber-400/30 mt-1 shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-amber-400/30 mb-1">التفسير المقارن ({selectedSecondaryTafseerName})</p>
                  <p className={cn("text-white/70 text-xs leading-relaxed font-tajawal", isVerseCurrentlyHidden && "blur-sm hover:blur-none transition-all duration-300")}>{verse.secondaryTafseer || "لا يوجد تفسير مقارن متوفر"}</p>
                </div>
              </div>

              {verse.secondaryTranslation && (
                <div className="flex items-start gap-3 border-t border-white/5 pt-3" dir={selectedSecondaryTranslation?.lang === 'ur' ? 'rtl' : 'ltr'}>
                  <Languages className="w-4 h-4 text-emerald-400/30 mt-1 shrink-0" />
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-white/30 mb-1">الترجمة المقارنة ({selectedSecondaryTranslation?.name})</p>
                    <p className="text-white/60 text-xs font-semibold leading-relaxed">{verse.secondaryTranslation}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 mt-2 pt-4 border-t border-white/5 w-full">
          {/* Smart AI Tafseer Companion Trigger Button */}
          <button
            onClick={(e: any) => { e.stopPropagation(); onChatClick?.(verse); }}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-violet-600/30 to-indigo-600/30 text-violet-300 border border-violet-500/20 hover:from-violet-600/40 hover:to-indigo-600/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2.5 text-xs font-black"
          >
            <Sparkles className="w-4 h-4 text-violet-400 animate-pulse" />
            <span>🤖 رفيق التدبر والتفسير الذكي</span>
          </button>

          {/* Cinematic Focus Mode Button */}
          <button
            onClick={(e: any) => { e.stopPropagation(); setIsCinematicFocus(!isCinematicFocus); }}
            className={cn(
              "px-5 py-3 rounded-2xl transition-all flex items-center gap-2.5 text-xs font-black border",
              isCinematicFocus
                ? "bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.3)]"
                : "bg-white/5 text-white/40 border-transparent hover:bg-white/10 hover:text-white"
            )}
          >
            <Eye className={cn("w-4 h-4", isCinematicFocus && "animate-pulse")} />
            <span>{isCinematicFocus ? 'إغلاق وضع التركيز' : 'التركيز السينمائي'}</span>
          </button>

          {/* Local Hide/Reveal Mode Toggle Button */}
          <button
            onClick={(e: any) => {
              e.stopPropagation();
              if (isHideRevealMode) {
                setIsLocalRevealedOverride(!isLocalRevealedOverride);
              } else {
                setIsLocalHideActive(!isLocalHideActive);
              }
            }}
            className={cn(
              "px-5 py-3 rounded-2xl transition-all flex items-center gap-2.5 text-xs font-black border",
              isVerseCurrentlyHidden
                ? "bg-violet-500/20 text-violet-400 border-violet-500/40 shadow-[0_0_20px_rgba(139,92,246,0.3)]"
                : "bg-white/5 text-white/40 border-transparent hover:bg-violet-500/10 hover:text-violet-300"
            )}
            title={isHideRevealMode ? "كشف الآية كاملة للمطابقة" : "إخفاء هذه الآية لاختبار الحفظ"}
          >
            {isVerseCurrentlyHidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            <span>{isVerseCurrentlyHidden ? "كشف الآية" : "إخفاء الآية"}</span>
          </button>

          <div className="flex items-center gap-2 shrink-0">
            <button onClick={(e: any) => { e.stopPropagation(); onShare?.(verse); }} className="p-3 rounded-xl bg-white/5 text-white/40 hover:text-primary hover:bg-primary/10 transition-all flex items-center gap-2 text-xs font-bold"><ImageIcon className="w-4 h-4" /> مشاركة</button>
            <button onClick={(e: any) => { e.stopPropagation(); onBookmark?.(verse); }} className={cn("p-3 rounded-xl transition-all", isBookmarked ? "bg-primary/20 text-primary" : "bg-white/5 text-white/40 hover:text-white")}><BookmarkCheck className={cn("w-4 h-4", isBookmarked && "fill-current")} /></button>
            <button onClick={handleCopy} className="p-3 rounded-xl bg-white/5 text-white/40 hover:text-white transition-colors">{copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}</button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
